import httpStatus from 'http-status';
import { User } from '@prisma/client';
import userService from '../user.service';
import ApiError from '../../utils/ApiError';
import { isPasswordMatch } from '../../utils/encryption';
import { jest, describe, it, expect } from '@jest/globals';
import authService from '../auth.service';
import prisma from '../../client';

jest.mock('../../utils/encryption', () => ({
  isPasswordMatch: jest.fn()
}));

jest.mock('../user.service', () => ({
  getUserByEmail: jest.fn()
}));

jest.mock('@prisma/client', () => {
  const mockPrismaClient = {
    token: {
      findFirst: jest.fn(),
      delete: jest.fn()
    }
  };
  return {
    PrismaClient: jest.fn().mockImplementation(() => mockPrismaClient)
  };
});

describe('loginUserWithEmailAndPassword', () => {
  it('should return the user if the email and password are correct', async () => {
    const mockUser: User = {
      id: 1,
      email: 'test@example.com',
      firstname: 'Test ',
      lastname: 'User',
      password: 'hashedpassword',
      role: 'ADMIN',
      isInviteAccepted: true,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    (userService.getUserByEmail as jest.Mock).mockResolvedValue(mockUser as never);
    (isPasswordMatch as jest.Mock).mockResolvedValue(true as never);

    const email = 'test@example.com';
    const password = 'password123';
    const result = await authService.loginUserWithEmailAndPassword(email, password);

    expect(userService.getUserByEmail).toHaveBeenCalledWith(email, [
      'id',
      'email',
      'firstname',
      'lastname',
      'password',
      'role',
      'isInviteAccepted',
      'createdAt',
      'updatedAt'
    ]);
    expect(result).toEqual({
      id: mockUser.id,
      email: mockUser.email,
      firstname: mockUser.firstname,
      lastname: mockUser.lastname,
      role: mockUser.role,
      isInviteAccepted: mockUser.isInviteAccepted,
      createdAt: mockUser.createdAt,
      updatedAt: mockUser.updatedAt
    });
  });

  it('should throw an ApiError with UNAUTHORIZED status if the email or password is incorrect', async () => {
    (userService.getUserByEmail as jest.Mock).mockResolvedValue(null as never);
    (isPasswordMatch as jest.Mock).mockResolvedValue(false as never);

    const email = 'test@example.com';
    const password = 'incorrectpassword';

    await expect(authService.loginUserWithEmailAndPassword(email, password)).rejects.toThrow(
      new ApiError(httpStatus.UNAUTHORIZED, 'Incorrect email or password')
    );
  });
  it('should not logged out if the refreshToken found', () => {
    const refreshToken =
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjEsImlhdCI6MTY4NDMyNDU1OSwiZXhwIjoxNjg2OTE2NTU5LCJ0eXBlIjoiUkVGUkVTSCJ9.UeT7V935-5n8b2DCUnOdixYj6ZOiNxPTgvHl4LAff7Y';
    expect(authService.logout(refreshToken)).rejects.toThrow(
      new ApiError(httpStatus.NOT_FOUND, 'User Not found')
    );
  });

  it('should delete the token if found', async () => {
    const mockToken = {
      id: 1,
      token:
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjEsImlhdCI6MTY4NDM0NDkyNCwiZXhwIjoxNjg2OTM2OTI0LCJ0eXBlIjoiUkVGUkVTSCJ9.aFZfaYZt8YTkkTfC5kkJNX21juhjO_9tYCA_CZ982tY',
      type: 'REFRESH',
      blacklisted: false
    };
    ((await prisma.token.findFirst) as jest.Mock).mockResolvedValue(mockToken as never);
    ((await prisma.token.delete) as jest.Mock).mockResolvedValue(mockToken as never);

    await authService.logout(
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjEsImlhdCI6MTY4NDM0NDkyNCwiZXhwIjoxNjg2OTM2OTI0LCJ0eXBlIjoiUkVGUkVTSCJ9.aFZfaYZt8YTkkTfC5kkJNX21juhjO_9tYCA_CZ982tY'
    );

    expect(await prisma.token.delete).toHaveBeenCalledWith({ where: { id: mockToken.id } });
  });

  it('should throw an error if no token is found', async () => {
    (prisma.token.findFirst as jest.Mock).mockResolvedValue(null as never);

    await expect(authService.logout('invalidToken')).rejects.toThrow('User Not found');
  });
});
