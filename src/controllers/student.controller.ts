import httpStatus from 'http-status';
import catchAsync from '../utils/catchAsync';
import studentService from '../services/student.service';
import ApiError from '../utils/ApiError';

const createStudent = catchAsync(async (req, res) => {
  const { firstname, lastname, email } = req.body;
  const student = await studentService.createStudent(email, firstname, lastname);
  res.status(httpStatus.CREATED).send(student);
});

const getStudents = catchAsync(async (req, res) => {
  const students = await studentService.getStudents();
  res.status(httpStatus.OK).send(students);
});

const getStudent = catchAsync(async (req, res) => {
  const student = await studentService.getOneStudent(req.params.studentId);
  if (!student) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Student not found');
  }
  res.status(httpStatus.OK).send(student);
});

const updateStudent = catchAsync(async (req, res) => {
  const student = await studentService.updateStudent(req.params.studentId, req.body);
  res.send(student);
});

const deleteStudent = catchAsync(async (req, res) => {
  const student = await studentService.deleteStudent(req.params.studentId);
  res.status(httpStatus.NO_CONTENT).send(student);
});

const createManyStudents = catchAsync(async (req, res) => {
  // console.log(req.body);
  res.send('ok');
});

export default {
  createStudent,
  getStudents,
  getStudent,
  updateStudent,
  deleteStudent,
  createManyStudents
};
