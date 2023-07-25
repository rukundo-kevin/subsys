import { Router } from 'express';
import auth from '../middlewares/auth';
import validate from '../middlewares/validate';
import submissionValidation from '../validations/submission.validation';
import { submissionController } from '../controllers';
import handleFileUpload from '../middlewares/uploadFile';
import snapshotController from '../controllers/snapshot.controller';

const router = Router();
router.post(
  '/snapshot',
  auth('createSubmission'),
  validate(submissionValidation.uploadSnapshot),
  handleFileUpload('snapshots', true),
  snapshotController.createSnapshot
);
router.post(
  '/:assignmentCode',
  auth('createSubmission'),
  validate(submissionValidation.getSubmission),
  handleFileUpload('head', false),
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
  validate(submissionValidation.updateSubmission),
  handleFileUpload('head', false),
  submissionController.updateSubmission
);

router.get(
  '/:submissionCode/snapshots',
  auth(),
  validate(submissionValidation.updateSubmission),
  snapshotController.getSnapshots
);

router.get(
  '/:submissionCode/snapshots/download',
  auth(),
  validate(submissionValidation.updateSubmission),
  snapshotController.downloadSnapshot
);

router.get(
  '/snapshot/:snapshotId',
  auth(),
  validate(submissionValidation.snapshot),
  snapshotController.getSingleSnapshot
);

router.get(
  '/snapshot/:snapshotId/download',
  auth(),
  validate(submissionValidation.snapshot),
  snapshotController.downloadSnapshot
);

router.get(
  '/snapshot/:snapshotId/:filepath',
  auth(),
  validate(submissionValidation.getSnapshotFile),
  snapshotController.getSnapshotFile
);

export default router;
