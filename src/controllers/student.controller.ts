import httpStatus from 'http-status';
import catchAsync from '../utils/catchAsync';
import studentService from '../services/student.service';

const createStudent = catchAsync(async (req, res) => {
  const { firstname, lastname, email } = req.body;
  const student = await studentService.createStudent(email, firstname, lastname);
  res.status(httpStatus.CREATED).send(student);
});

export default {
  createStudent
};
