import { Router } from 'express';
import auth from '../middlewares/auth';
import validate from '../middlewares/validate';
import submissionValidation from '../validations/submission.validation';
import { submissionController } from '../controllers';
import { upload } from '../config/multer';

const router = Router();

router.post(
  '/',
  auth('createSubmission'),
  upload.single('head'),
  validate(submissionValidation.submit),
  submissionController.makeSubmission
);

router.patch(
  '/:submissionCode',
  auth('createSubmission'),
  upload.single('head'),
  validate(submissionValidation.updateSubmission),
  submissionController.updateSubmission
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
