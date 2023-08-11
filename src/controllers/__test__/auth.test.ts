import { NextFunction, Request, Response } from 'express';

import { describe, jest, expect, it } from '@jest/globals';
import { authService, tokenService } from '../../services';
import authController from '../auth.controller';
import { getRole } from '../../utils/userHelper';

const { login } = authController;
const { loginUserWithEmailAndPassword } = authService;

jest.mock('../../services/auth.service');

jest.mock('../../services/token.service');

jest.mock('../../utils/userHelper');

describe('Auth Controler', () => {
  it('should return 200 if login is successful', async () => {
    const req = {
      body: {
        username: 'john@gmail.com',
        password: 'Passowrd'
      }
    } as Request;

    const res = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn()
    } as unknown as Response<any, Record<string, any>>;

    const next = jest.fn() as NextFunction;

    (getRole as jest.Mock).mockReturnValue('USER');
    (loginUserWithEmailAndPassword as jest.Mock).mockResolvedValue({
      firstname: 'John',
      lastname: 'Doe'
    } as never);

    (tokenService.generateAuthTokens as jest.Mock).mockResolvedValue('accesstoken' as never);
    await login(req, res, next);
    expect(next).not.toHaveBeenCalled();
  });
  it('should return 200 if logout is successful', async () => {
    const req = {
      body: {
        refreshToken: 'refreshToken'
      }
    } as Request;
    const res = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn()
    } as unknown as Response<any, Record<string, any>>;

    (authService.logout as jest.Mock).mockResolvedValue('' as never);
    await authController.logout(req, {} as Response, jest.fn() as NextFunction);
    expect(authService.logout).toHaveBeenCalled();
  });
});
