import httpStatus from 'http-status';
import catchAsync from '../utils/catchAsync';
import studentService from '../services/student.service';

const createStudent = catchAsync(async (req, res) => {
  const { firstname, lastname, email } = req.body;
  const student = await studentService.createStudent(email, firstname, lastname);
  res.status(httpStatus.CREATED).send(student);
});

const getStudents = catchAsync(async (req, res) => {
  const students = await studentService.getStudents();
  res.status(httpStatus.OK).send(students);
});

export default {
  createStudent,
  getStudents
};
