import { Router } from 'express';

import assignmentValidation from '../validations/assignment.validation';
import validate, { validateMarkdown } from '../middlewares/validate';
import { assignmentController } from '../controllers';
import sanitizeMarkdown from '../middlewares/sanitize';
import auth from '../middlewares/auth';

const router = Router();

router.get(
  '/',
  auth(),
  validate(assignmentValidation.getAssignments),
  assignmentController.getAssignments
);
router.get('/:assignmentId', auth(), assignmentController.getAssignmentById);
router.patch(
  '/:assignmentId',
  auth('manageAssignments'),
  validate(assignmentValidation.editAssignment),
  assignmentController.editAssignment
);
router.post(
  '/draft',
  auth('manageAssignments'),
  validate(assignmentValidation.createDraft),
  validateMarkdown,
  sanitizeMarkdown,
  assignmentController.createAssignmentDraft
);

router.patch(
  '/publish/:id',
  auth('manageAssignments'),
  validate(assignmentValidation.createDraft),
  assignmentController.publishAssignment
);
router.patch(
  '/publish/:id',
  auth('manageAssignments'),
  validate(assignmentValidation.createDraft),
  assignmentController.publishAssignment
);
router.post('/invite/:id', auth('manageAssignments'), assignmentController.inviteToAssignment);
router.delete(
  '/:assignmentId',
  auth('manageAssignments'),
  validate(assignmentValidation.deleteAssignment),
  assignmentController.deleteAssignment
);
export default router;
