import { NextFunction, Request, Response } from 'express';
import csv from 'csvtojson';

import httpStatus from 'http-status';
import ApiError from '../utils/ApiError';

export const convertCsvToJson = async (req: Request, res: Response, next: NextFunction) => {
  //eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const file = req.file!;
  try {
    const data = await csv().fromString(file.buffer.toString());
    req.body = data;
    return next();
  } catch {
    return next(new ApiError(httpStatus.BAD_REQUEST, 'Error converting csv to json'));
  }
};
