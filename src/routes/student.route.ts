import express from 'express';
import validate from '../middlewares/validate';
import studentValidation from '../validations/student.validation';
import { studentController } from '../controllers';
import auth from '../middlewares/auth';

const router = express.Router();

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

export default router;
