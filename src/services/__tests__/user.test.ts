import { User } from '@prisma/client';
import prisma from '../../client';
import { jest, describe, it, expect } from '@jest/globals';
import userService from '../user.service';

jest.mock('../../client', () => ({
  user: {
    findUnique: jest.fn()
  }
}));

describe('userService', () => {
  describe('getUserByEmail', () => {
    it('should return user if found', async () => {
      const mockUser: User | null = {
        id: 1,
        email: 'test@example.com',
        firstname: 'John ',
        lastname: 'Doe',
        password: 'hashed_password',
        role: 'ADMIN',
        isInviteAccepted: true,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser as never);

      const email = 'test@example.com';
      const keys: (keyof User)[] = ['id', 'email', 'firstname', 'lastname'];

      const result = await userService.getUserByEmail(email, keys);

      expect(result).toHaveProperty('id', mockUser.id);
      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { email },
        select: {
          id: true,
          email: true,
          firstname: true,
          lastname: true
        }
      });
    });

    it('should return null if user is not found', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null as never);

      const email = 'test@example.com';

      const result = await userService.getUserByEmail(email);

      expect(result).toBeNull();
      expect(result).toEqual(null);
    });
  });
});
