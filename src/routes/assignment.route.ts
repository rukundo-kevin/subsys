import { Router } from 'express';
import assignmentValidation from '../validations/assignment.validation';
import validate, { validateMarkdown } from '../middlewares/validate';
import { assignmentController } from '../controllers';
import sanitizeMarkdown from '../middlewares/sanitize';

const router = Router();

router.post(
  '/draft',
  validate(assignmentValidation.createDraft),
  validateMarkdown,
  sanitizeMarkdown,
  assignmentController.createAssignmentDraft
);
