import bcrypt from 'bcryptjs';
import { jest, describe, it, expect } from '@jest/globals';
import { encryptPassword, isPasswordMatch } from '../encryption';
import ApiError from '../ApiError';
import exclude from '../exclude';
import { generateId, generateRandomPassword } from '../userHelper';
import { validateZipfile } from '../assignmentHelper';

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
        firstname: 'John ',
        lastname: 'Doe',
        age: 25
      };

      const result = exclude(obj, ['id']);

      expect(result).toMatchObject({ firstname: 'John ', lastname: 'Doe', age: 25 });
    });

    it('should handle empty keys array', () => {
      const obj = {
        id: '123',
        firstname: 'John ',
        lastname: 'Doe',
        age: 25
      };

      const result = exclude(obj, []);

      expect(result).toEqual({
        id: '123',
        firstname: 'John ',
        lastname: 'Doe',
        age: 25
      });
    });
  });

  describe('generatePassword', () => {
    it('should generate a random password', () => {
      const password = generateRandomPassword();
      const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()\-_=+[{\]};:<>|./?]).{8,}$/;

      expect(password).toHaveLength(8);
      expect(password).toMatch(regex);
    });
  });

  describe('generateStudentId', () => {
    it('should generate a random studentId', () => {
      const studentId = generateId('ST');

      expect(studentId).toHaveLength(8);
      expect(studentId).toContain('ST');
    });
  });
  describe('validateZipfile', () => {
    it('should return true for valid zip file extensions', () => {
      const validExtensions = ['zip', 'zipx', 'rar', '7z', 'gz', 'tar.gz', 'tar'];
      validExtensions.forEach((extension) => {
        const filename = `test.${extension}`;
        const result = validateZipfile(filename);
        expect(result).toBe(true);
      });
    });

    it('should return false for invalid file extensions', () => {
      const invalidExtensions = ['txt', 'pdf', 'docx', 'png', 'jpg'];
      invalidExtensions.forEach((extension) => {
        const filename = `test.${extension}`;
        const result = validateZipfile(filename);
        expect(result).toBe(false);
      });
    });
  });
});
