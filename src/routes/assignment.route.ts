import { Router } from 'express';

import assignmentValidation from '../validations/assignment.validation';
import validate, { validateMarkdown } from '../middlewares/validate';
import { assignmentController } from '../controllers';
import sanitizeMarkdown from '../middlewares/sanitize';
import auth from '../middlewares/auth';

const router = Router();

router.get('/', auth(), assignmentController.getAssignments);
router.get('/:assignmentId', auth(), assignmentController.getAssignmentById);
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

export default router;
