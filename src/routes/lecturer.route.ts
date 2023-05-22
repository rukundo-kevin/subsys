import express from 'express';
import { lecturerController } from '../controllers';
import auth from '../middlewares/auth';
import validate from '../middlewares/validate';
import lecturerValidaton from '../validations/lecturer.validation';

const router = express.Router();

router.get('/', auth('getLecturers'), lecturerController.getLecturers);
router.post(
  '/',
  auth('createLecturer'),
  validate(lecturerValidaton.createLecturer),
  lecturerController.createLecturer
);

export default router;
