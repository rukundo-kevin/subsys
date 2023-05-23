import { NextFunction, Request, Response } from 'express';
import csv from 'csvtojson';

import httpStatus from 'http-status';
import ApiError from '../utils/ApiError';
import studentValidation from '../validations/student.validation';
import validate from './validate';

export const convertCsvToJson = async (req: Request, res: Response, next: NextFunction) => {
  //eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const file = req.file!;
  try {
    const data = await csv().fromString(file.buffer.toString());
    req.body.students = data;
    return validate(studentValidation.studentCsv)(req, res, next);
  } catch {
    return next(new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Error converting csv to json'));
  }
};
