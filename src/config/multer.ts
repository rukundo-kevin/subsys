import multer from 'multer';
import fs from 'fs-extra';
import { validateZipfile } from '../utils/assignmentHelper';
import ApiError from '../utils/ApiError';
import httpStatus from 'http-status';

const destinationDirectory = './submissions';

fs.ensureDirSync(destinationDirectory);

const storage = multer.diskStorage({
  destination: './submissions',
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  }
});

export const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const { fieldname, originalname } = file;
    if (fieldname == 'head') {
      cb(null, true);
    } else if (fieldname == 'snapshots') {
      if (validateZipfile(originalname)) {
        cb(null, true);
      } else {
        cb(new ApiError(httpStatus.BAD_REQUEST, 'Only compressed files are  allowed'));
      }
    }
  }
});
