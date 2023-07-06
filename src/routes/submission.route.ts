import { Router } from 'express';
import auth from '../middlewares/auth';
import validate from '../middlewares/validate';
import submissionValidation from '../validations/submission.validation';
import { submissionController } from '../controllers';
import multer from 'multer';

const router = Router();

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

router.post(
  '/',
  auth('createSubmission'),
  validate(submissionValidation.submit),
  submissionController.makeSubmission
);
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
