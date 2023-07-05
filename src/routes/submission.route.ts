import { Router } from 'express';
import auth from '../middlewares/auth';
import validate from '../middlewares/validate';
import submissionValidation from '../validations/submission.validation';
import { submissionController } from '../controllers';

const router = Router();

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
  submissionController.createSnapshot
);
router.get(
  '/:assignmentCode',
  auth(),
  validate(submissionValidation.getSubmission),
  submissionController.getSubmissions
);
export default router;
