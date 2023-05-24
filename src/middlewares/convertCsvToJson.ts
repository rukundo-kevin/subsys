import { NextFunction, Request, Response } from 'express';
import csv from 'csvtojson';

import httpStatus from 'http-status';
import ApiError from '../utils/ApiError';
import studentValidation from '../validations/student.validation';
import validate from './validate';
import lecturerValidation from '../validations/lecturer.validation';

export const convertCsvToJson =
  (type: string) => async (req: Request, res: Response, next: NextFunction) => {
    //eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const file = req.file!;
    try {
      const data = await csv().fromString(file.buffer.toString());
      req.body[type] = data;
      const validation =
        type === 'lecturers' ? lecturerValidation.lecturerCsv : studentValidation.studentCsv;
      return validate(validation)(req, res, next);
    } catch {
      return next(new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Error converting csv to json'));
    }
  };
