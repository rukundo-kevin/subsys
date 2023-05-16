import jwt from 'jsonwebtoken';
import moment from 'moment';
import { jest, describe, it, expect, afterEach } from '@jest/globals';

import tokenService from '../../services/token.service';
import { TokenType } from '@prisma/client';

jest.mock('jsonwebtoken');
jest.mock('../../client');

describe('Token Service', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('generateToken', () => {
    it('should generate a token', () => {
      const mockUserId = 1;
      const mockExpires = moment().add(1, 'hour');
      const mockType: TokenType = 'ACCESS';
      const mockSecret = 'mockSecret';

      const expectedToken = 'mockToken';
      (jwt.sign as jest.Mock).mockReturnValue(expectedToken);

      const token = tokenService.generateToken(mockUserId, mockExpires, mockType, mockSecret);

      expect(token).toEqual(expectedToken);
      expect(jwt.sign).toHaveBeenCalledTimes(1);
      expect(jwt.sign).toHaveBeenCalledWith(
        {
          sub: mockUserId,
          iat: expect.any(Number),
          exp: mockExpires.unix(),
          type: mockType
        },
        mockSecret
      );
    });
  });
});
