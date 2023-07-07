import { Router } from 'express';
import auth from '../middlewares/auth';
import validate from '../middlewares/validate';
import submissionValidation from '../validations/submission.validation';
import { submissionController } from '../controllers';
import multer from 'multer';
import fs from 'fs';

const router = Router();

const destinationDirectory = './submissions';

if (!fs.existsSync(destinationDirectory)) {
  fs.mkdirSync(destinationDirectory, { recursive: true });
}

const storage = multer.diskStorage({
  destination: './submissions',
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  }
});

const upload = multer({ storage: storage });

router.post(
  '/',
  auth('createSubmission'),
  validate(submissionValidation.submit),
  submissionController.makeSubmission
);
router.patch('/:submissionCode', auth('createSubmission'), submissionController.createSnapshot);
router.post(
  '/snapshot',
  auth('createSubmission'),
  validate(submissionValidation.uploadSnapshot),
  upload.array('snapshots'),
  submissionController.createSnapshot
);
router.get(
  '/:assignmentCode',
  auth(),
  validate(submissionValidation.getSubmission),
  submissionController.getSubmissions
);
export default router;
