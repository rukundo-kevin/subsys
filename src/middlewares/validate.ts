import httpStatus from 'http-status';
import ApiError from '../utils/ApiError';
import { NextFunction, Request, Response } from 'express';
import pick from '../utils/pick';
import Joi from 'joi';

const validate = (schema: object) => (req: Request, res: Response, next: NextFunction) => {
  const validSchema = pick(schema, ['params', 'query', 'body']);
  const obj = pick(req, Object.keys(validSchema));

  const { value, error } = Joi.compile(validSchema)
    .prefs({ errors: { label: 'key' }, abortEarly: false })
    .validate(obj);
  if (error) {
    const errorMessage = error.details.map((details) => details.message).join(', ');
    return next(new ApiError(httpStatus.BAD_REQUEST, errorMessage));
  }
  Object.assign(req, value);
  return next();
};

export const validateFiletype =
  (filetype: string) => (req: Request, res: Response, next: NextFunction) => {
    if (!req.file) {
      return next(new ApiError(httpStatus.BAD_REQUEST, 'No file uploaded'));
    }
    if (req.file.mimetype !== filetype) {
      return next(
        new ApiError(
          httpStatus.BAD_REQUEST,
          `Invalid file type. Only ${filetype.split('/')[1]} files are allowed`
        )
      );
    }
    next();
  };
export default validate;
