import catchAsync from '../utils/catchAsync';
import { lecturerService, userService } from '../services';
import httpStatus from 'http-status';
import ApiError from '../utils/ApiError';

const createLecturer = catchAsync(async (req, res) => {
  const { firstname, lastname, email } = req.body;
  const createdLecturer = await lecturerService.createLecturer(email, firstname, lastname);
  res.status(httpStatus.CREATED).send(createdLecturer);
});

const getLecturers = catchAsync(async (req, res) => {
  const lecturers = await lecturerService.getLecturers();
  res.status(httpStatus.OK).send(lecturers);
});

const getLecturer = catchAsync(async (req, res) => {
  const lecturer = await lecturerService.getOneLecturer(req.params.lecturerId);
  if (!lecturer) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Lecturer not found');
  }
  res.status(httpStatus.OK).send(lecturer);
});

const deleteLecturer = catchAsync(async (req, res) => {
  const lecturer = await userService.deleteUser(req.params.userId);
  res.status(httpStatus.NO_CONTENT).send(lecturer);
});

const updateLecturer = catchAsync(async (req, res) => {
  const lecturer = await lecturerService.updateLecturer(req.params.lecturerId, req.body);
  res.status(httpStatus.OK).send(lecturer);
});

const createManyLecturers = catchAsync(async (req, res) => {
  const { lecturers } = req.body;

  for (let i = 0; i < lecturers.length; i++) {
    const { firstname, lastname, email } = lecturers[i];
    await lecturerService.createLecturer(email, firstname, lastname);
  }
  res.status(httpStatus.CREATED).send({ message: 'Lecturers created' });
});

export default {
  createLecturer,
  getLecturers,
  getLecturer,
  deleteLecturer,
  updateLecturer,
  createManyLecturers
};
