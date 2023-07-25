import multer from 'multer';
import fs from 'fs-extra';
import { validateZipfile } from '../utils/assignmentHelper';

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
    if (fieldname == 'snapshots') {
      if (validateZipfile(originalname)) {
        cb(null, true);
      } else {
        cb(new Error('Only compressed files are allowed'));
      }
    } else if (fieldname == 'head') {
      if (originalname.endsWith('.json') || originalname.split('.').length == 1) {
        cb(null, true)
      } else {
        cb(new Error('Only json files are allowed'));
      }
    } else {
      cb(null, true);
    }
  }
});
