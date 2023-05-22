import express from 'express';
import validate from '../middlewares/validate';
import studentValidation from '../validations/student.validation';
import { studentController } from '../controllers';
import auth from '../middlewares/auth';

const router = express.Router();

router.get('/', auth('getStudents'), studentController.getStudents);
router.post(
  '/',
  auth('createStudents'),
  validate(studentValidation.createStudent),
  studentController.createStudent
);

export default router;
