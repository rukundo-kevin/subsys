import httpStatus from 'http-status';
import { User } from '@prisma/client';
import userService from '../user.service';
import ApiError from '../../utils/ApiError';
import { isPasswordMatch } from '../../utils/encryption';
import { jest, describe, it, expect } from '@jest/globals';
import authService from '../auth.service';

jest.mock('../../utils/encryption', () => ({
  isPasswordMatch: jest.fn()
}));

jest.mock('../user.service', () => ({
  getUserByEmail: jest.fn()
}));

describe('loginUserWithEmailAndPassword', () => {
  it('should return the user if the email and password are correct', async () => {
    // Mock the dependencies
    const mockUser: User = {
      id: 1,
      email: 'test@example.com',
      name: 'Test User',
      password: 'hashedpassword',
      role: 'ADMIN',
      isEmailVerified: true,
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
      'name',
      'password',
      'role',
      'isEmailVerified',
      'createdAt',
      'updatedAt'
    ]);
    expect(result).toEqual({
      id: mockUser.id,
      email: mockUser.email,
      name: mockUser.name,
      role: mockUser.role,
      isEmailVerified: mockUser.isEmailVerified,
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
});
