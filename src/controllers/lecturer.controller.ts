import catchAsync from '../utils/catchAsync';
import { lecturerService } from '../services';
import httpStatus from 'http-status';

const createLecturer = catchAsync(async (req, res) => {
  const { firstname, lastname, email } = req.body;
  const createdLecturer = await lecturerService.createLecturer(email, firstname, lastname);
  res.status(httpStatus.CREATED).send(createdLecturer);
});

const getLecturers = catchAsync(async (req, res) => {
  const lecturers = await lecturerService.getLecturers();
  res.status(httpStatus.OK).send(lecturers);
});

export default {
  createLecturer,
  getLecturers
};
