import httpStatus from 'http-status';
import catchAsync from '../utils/catchAsync';
import studentService from '../services/student.service';
import ApiError from '../utils/ApiError';
import { userService } from '../services';

const createStudent = catchAsync(async (req, res) => {
  const { firstname, lastname, email } = req.body;
  const student = await studentService.createStudent(email, firstname, lastname);
  res.status(httpStatus.CREATED).send(student);
});

const getStudents = catchAsync(async (req, res) => {
  let students;
  if (Object.keys(req.query).length !== 0) {
    students = await studentService.searchStudents(req.query);
  } else {
    students = await studentService.getStudents();
  }
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
  res.status(httpStatus.OK).send(student);
});

const deleteStudent = catchAsync(async (req, res) => {
  const student = await userService.deleteUser(req.params.userId);
  res.status(httpStatus.NO_CONTENT).send(student);
});

const createManyStudents = catchAsync(async (req, res) => {
  const { students } = req.body;

  for (let i = 0; i < students.length; i++) {
    const { firstname, lastname, email } = students[i];
    await studentService.createStudent(email, firstname, lastname);
  }
  res.status(httpStatus.CREATED).send({ message: 'Students created' });
});

export default {
  createStudent,
  getStudents,
  getStudent,
  updateStudent,
  deleteStudent,
  createManyStudents
};
