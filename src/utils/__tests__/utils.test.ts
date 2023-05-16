import bcrypt from 'bcryptjs';
import { jest, describe, it, expect } from '@jest/globals';
import { encryptPassword, isPasswordMatch } from '../encryption';
import ApiError from '../ApiError';
import exclude from '../exclude';

jest.mock('bcryptjs');
describe('Utils', () => {
  describe('passwordUtils', () => {
    describe('encryptPassword', () => {
      it('should encrypt the password using bcrypt', async () => {
        const password = 'password123';
        const encryptedPassword = 'encryptedPassword';

        // Mock the bcrypt.hash function
        (bcrypt.hash as jest.Mock).mockResolvedValue(encryptedPassword as never);

        const result = await encryptPassword(password);

        expect(result).toBe(encryptedPassword);
        expect(bcrypt.hash).toHaveBeenCalledWith(password, 8);
      });
    });

    describe('isPasswordMatch', () => {
      it('should compare the password with userPassword using bcrypt', async () => {
        const password = 'password123';
        const userPassword = 'encryptedPassword';
        const isMatch = true;

        // Mock the bcrypt.compare function
        (bcrypt.compare as jest.Mock).mockResolvedValue(isMatch as never);

        const result = await isPasswordMatch(password, userPassword);

        expect(result).toBe(isMatch);
        expect(bcrypt.compare).toHaveBeenCalledWith(password, userPassword);
      });
    });
  });

  describe('ApiError', () => {
    it('should create an instance of ApiError with the correct properties', () => {
      const statusCode = 400;
      const message = 'Bad Request';
      const isOperational = true;
      const stack = 'stack trace';

      const apiError = new ApiError(statusCode, message, isOperational, stack);

      expect(apiError.statusCode).toBe(statusCode);
      expect(apiError.message).toBe(message);
      expect(apiError.isOperational).toBe(isOperational);
      expect(apiError.stack).toBe(stack);
    });
  });

  describe('exclude', () => {
    it('should exclude the specified keys from the object', () => {
      const obj = {
        id: '123',
        name: 'John Doe',
        age: 25
      };

      const result = exclude(obj, ['id', 'age']);

      expect(result).toEqual({ name: 'John Doe' });
    });

    it('should handle empty keys array', () => {
      const obj = {
        id: '123',
        name: 'John Doe',
        age: 25
      };

      const result = exclude(obj, []);

      expect(result).toEqual({
        id: '123',
        name: 'John Doe',
        age: 25
      });
    });

    it('should handle keys that do not exist in the object', () => {
      const obj = {
        id: '123',
        name: 'John Doe',
        age: 25
      };

      const result = exclude(obj, ['name']);

      expect(result).toEqual({
        id: '123',
        age: 25
      });
    });
  });
});
