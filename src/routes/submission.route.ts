import { Router } from 'express';
import auth from '../middlewares/auth';
import validate from '../middlewares/validate';
import submissionValidation from '../validations/submission.validation';
import { submissionController } from '../controllers';
import handleFileUpload from '../middlewares/uploadFile';

const router = Router();

router.post(
  '/',
  auth('createSubmission'),
  handleFileUpload('head', false),
  validate(submissionValidation.submit),
  submissionController.makeSubmission
);
router.get('/', auth(), submissionController.getSubmissions);
router.get(
  '/:submissionCode',
  auth(),
  validate(submissionValidation.updateSubmission),
  submissionController.getSingleSubmission
);
router.patch(
  '/:submissionCode',
  auth('createSubmission'),
  handleFileUpload('head', false),
  validate(submissionValidation.updateSubmission),
  submissionController.updateSubmission
);

router.post(
  '/snapshot',
  auth('createSubmission'),
  validate(submissionValidation.uploadSnapshot),
  handleFileUpload('snapshots', true),
  submissionController.createSnapshot
);
router.get(
  '/:submissionCode/snapshots',
  auth(),
  validate(submissionValidation.updateSubmission),
  submissionController.getSnapshots
);

router.get(
  '/snapshot/:snapshotId',
  auth(),
  validate(submissionValidation.snapshot),
  submissionController.getSingleSnapshot
);

router.get(
  '/snapshot/:snapshotId/:filepath',
  auth(),
  validate(submissionValidation.getSnapshotFile),
  submissionController.getSnapshotFile
);
export default router;
