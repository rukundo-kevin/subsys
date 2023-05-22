import express from 'express';
import { lecturerController } from '../controllers';
import auth from '../middlewares/auth';
import validate from '../middlewares/validate';
import lecturerValidaton from '../validations/lecturer.validation';

const router = express.Router();

router.get('/', auth('manageLecturers'), lecturerController.getLecturers);
router.get(
  '/:lecturerId',
  auth('manageLecturers'),
  validate(lecturerValidaton.getLecturer),
  lecturerController.getLecturer
);
router.post(
  '/',
  auth('manageLecturers'),
  validate(lecturerValidaton.createLecturer),
  lecturerController.createLecturer
);

router.put(
  '/:lecturerId',
  auth('manageLecturers'),
  validate(lecturerValidaton.updateLecturer),
  lecturerController.updateLecturer
);

router.delete(
  '/:lecturerId',
  auth('manageLecturers'),
  validate(lecturerValidaton.getLecturer),
  lecturerController.deleteLecturer
);
export default router;
