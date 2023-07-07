import Joi from 'joi';
import httpStatus from 'http-status';
import { NextFunction, Request, Response } from 'express';
import markdownlint, { LintResults, LintError } from 'markdownlint';

import ApiError from '../utils/ApiError';
import pick from '../utils/pick';

const validate = (schema: object) => (req: Request, res: Response, next: NextFunction) => {
  console.log(req.query);
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

export const validateMarkdown = (req: Request, res: Response, next: NextFunction) => {
  const markdown = req.body.description;
  if (!markdown) {
    return res.status(400).json({ error: 'Markdown content is required' });
  }

  const options = {
    strings: {
      content: markdown
    },
    config: {
      default: false,
      MD028: true
    }
  };

  markdownlint(options, (err: Error | null, result: LintResults | undefined) => {
    const lintErrors: LintError[][] = [];

    if (result) {
      lintErrors.push(...Object.values(result));
    }

    if (lintErrors.length > 0) {
      const errorMessages = lintErrors
        .flat()
        .map((error: LintError) => `${error.ruleNames}: ${error.ruleDescription}`);
      throw new ApiError(
        httpStatus.BAD_REQUEST,
        `Markdown validation failed - ${errorMessages.join(', ')}`
      );
    } else {
      next();
    }
  });
};

export default validate;
