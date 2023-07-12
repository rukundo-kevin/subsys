import { Request, Response, NextFunction } from 'express';
import ApiError from '../utils/ApiError';
import httpStatus from 'http-status';
import { upload as customUpload } from '../config/multer';

const handleFileUpload =
  (fieldname: string, isMultiple: boolean) => (req: Request, res: Response, next: NextFunction) => {
    const upload = isMultiple ? customUpload.array(fieldname) : customUpload.single(fieldname);
    upload(req, res, function (err: any) {
      if (err) {
        return next(new ApiError(httpStatus.BAD_REQUEST, err.message));
      }
      return next();
    });
  };

export default handleFileUpload;
