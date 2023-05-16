import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';
import httpStatus from 'http-status';
import { describe, jest, beforeEach, afterEach, it, expect } from '@jest/globals';
import validate from '../validate';
import ApiError from '../../utils/ApiError';

describe('Middlewares', () => {
  describe('validate', () => {
    let req: Request;
    let res: Response;
    let next: NextFunction;

    beforeEach(() => {
      req = {} as Request;
      res = {} as Response;
      next = jest.fn();
    });

    afterEach(() => {
      jest.clearAllMocks();
    });

    it('should call next if the request data is valid', () => {
      const schema = {
        body: Joi.object({
          name: Joi.string().required(),
          age: Joi.number().required()
        })
      };

      req.body = {
        name: 'John Doe',
        age: 25
      };

      validate(schema)(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(req.body).toEqual(req.body);
    });

    it('should return a 400 Bad Request error if the request data is invalid', () => {
      const schema = {
        body: Joi.object({
          name: Joi.string().required(),
          age: Joi.number().required()
        })
      };

      req.body = {
        name: 'John Doe'
        // Missing the required 'age' field
      };

      validate(schema)(req, res, next);

      expect(next).toHaveBeenCalledWith(new ApiError(httpStatus.BAD_REQUEST, '"age" is required'));
    });
  });
});
