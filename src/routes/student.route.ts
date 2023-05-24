import express from 'express';
import multer from 'multer';

import validate, { validateFiletype } from '../middlewares/validate';
import studentValidation from '../validations/student.validation';
import { studentController } from '../controllers';
import auth from '../middlewares/auth';
import { convertCsvToJson } from '../middlewares';

const router = express.Router();
const upload = multer();

router.get('/', auth('getStudents'), studentController.getStudents);

router.get(
  '/:studentId',
  auth('getStudents'),
  validate(studentValidation.getStudents),
  studentController.getStudent
);

router.post(
  '/',
  auth('createStudents'),
  validate(studentValidation.createStudent),
  studentController.createStudent
);

router.put(
  '/:studentId',
  auth('updateStudents'),
  validate(studentValidation.updateStudent),
  studentController.updateStudent
);

router.delete(
  '/:studentId',
  auth('deleteStudents'),
  validate(studentValidation.getStudents),
  studentController.deleteStudent
);

router.post(
  '/csv',
  auth('createStudents'),
  upload.single('students'),
  validateFiletype('text/csv'),
  convertCsvToJson('students'),
  studentController.createManyStudents
);

export default router;
