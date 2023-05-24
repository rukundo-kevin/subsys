import express from 'express';
import multer from 'multer';

import { lecturerController } from '../controllers';
import auth from '../middlewares/auth';
import validate, { validateFiletype } from '../middlewares/validate';
import lecturerValidaton from '../validations/lecturer.validation';
import { convertCsvToJson } from '../middlewares';

const router = express.Router();
const upload = multer();
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

router.post(
  '/csv',
  auth('manageLecturers'),
  upload.single('lecturers'),
  validateFiletype('text/csv'),
  convertCsvToJson('lecturers'),
  lecturerController.createManyLecturers
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
