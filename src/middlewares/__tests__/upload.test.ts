import { Request, Response, NextFunction } from 'express';
import httpStatus from 'http-status';
import { describe, jest, beforeEach, afterEach, it, expect } from '@jest/globals';

import ApiError from '../../utils/ApiError';
import handleFileUpload from '../uploadFile';
import { upload as customUpload } from '../../config/multer';

jest.mock('../../config/multer');

describe('handleFileUpload middleware', () => {
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

  it('should handle single file upload and call next', () => {
    (customUpload.single as jest.Mock).mockImplementation(() => {
      return (req: Request, res: Response, callback: (error?: any) => void) => {
        callback();
      };
    });

    handleFileUpload('fileField', false)(req, res, next);

    expect(customUpload.single).toHaveBeenCalledWith('fileField');
    expect(next).toHaveBeenCalled();
  });

  it('should handle multiple file upload and call next', () => {
    (customUpload.array as jest.Mock).mockImplementation(() => {
      return (req: Request, res: Response, callback: (error?: any) => void) => {
        callback();
      };
    });

    handleFileUpload('fileField', true)(req, res, next);

    expect(customUpload.array).toHaveBeenCalledWith('fileField');
    expect(next).toHaveBeenCalled();
  });

  it('should handle file upload error and call next with ApiError', () => {
    const errorMessage = 'File upload failed';

    (customUpload.single as jest.Mock).mockImplementation(() => {
      return (req: Request, res: Response, callback: (error?: any) => void) => {
        callback(new Error(errorMessage));
      };
    });

    handleFileUpload('fileField', false)(req, res, next);

    expect(customUpload.single).toHaveBeenCalledWith('fileField');
    expect(next).toHaveBeenCalledWith(new ApiError(httpStatus.BAD_REQUEST, errorMessage));
  });
});
