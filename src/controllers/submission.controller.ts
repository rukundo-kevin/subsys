import httpStatus from 'http-status';
import fs from 'fs-extra';

import { Role, User } from '@prisma/client';
import { studentService, submissionService } from '../services';
import catchAsync from '../utils/catchAsync';
import ApiError from '../utils/ApiError';
import assignmentService from '../services/assignment.service';
import { generateId } from '../utils/userHelper';

const makeSubmission = catchAsync(async (req, res) => {
  const { id: userId } = req.user as User;
  const { assignmentCode } = req.query;
  if (!req.file) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'The head file was not uploaded');
  }

  console.log('assignment');
  const assignment = await assignmentService.getAssignments(
    userId,
    Role.STUDENT,
    { assignmentCode },
    {}
  );
  if (!assignment) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Assignment does not exist');
  }

  const submissionExist = await submissionService.getSubmissions(Role.STUDENT, {
    assignmentId: assignment[0].id
  });

  if (submissionExist && submissionExist.length > 0) {
    await fs.remove(req.file.path);
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      'You have already made a submission for this assignment'
    );
  }
  const submissionCode = generateId('SUB');
  const userFolder = `submissions/${userId}/${submissionCode}`;
  await fs.ensureDir(userFolder); // Creates the folder if it doesn't exist
  const newPath = `${userFolder}/${req.file.originalname}`;

  await fs.move(req.file.path, newPath, { overwrite: true });

  const submission = await submissionService.makeSubmission(
    userId,
    assignmentCode as string,
    newPath,
    submissionCode
  );

  res.status(httpStatus.CREATED).send({
    message: 'Submission created successfully',
    data: {
      submission
    }
  });
});

const updateSubmission = catchAsync(async (req, res) => {
  const { submissionCode } = req.params;
  const { id: userId } = req.user as User;
  if (!req.file) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'The head file was not uploaded');
  }

  const submission = await submissionService.getSubmissions(Role.STUDENT, {
    submissionCode
  });

  if (!submission || submission.length === 0) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Submission does not exist');
  }

  const head = req.file as Express.Multer.File;
  const newPath = `submissions/${userId}/${head.originalname}`;

  await fs.remove(submission[0].head);
  await fs.move(head.path, newPath, { overwrite: true });

  const updatedSubmission = await submissionService.updateSubmission(
    userId,
    submissionCode,
    newPath
  );

  res.status(httpStatus.CREATED).send({
    message: 'Submission updated successfully',
    data: {
      updatedSubmission
    }
  });
});

const getSubmissions = catchAsync(async (req, res) => {
  const { assignmentCode } = req.params;
  const { id: userId, role } = req.user as User;

  const assignment = await assignmentService.getAssignments(
    userId,
    Role.STUDENT,
    { assignmentCode },
    {}
  );

  if (!assignment) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Assignment does not exist');
  }

  const student = await studentService.searchStudents({ id: userId });
  if (!student || student.length === 0) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Student does not exist');
  }
  const filter = { assignmentId: assignment[0].id, studentId: student[0].id };

  const submissions = await submissionService.getSubmissions(role, filter);

  return res.status(httpStatus.OK).send({ submissions });
});

const createSnapshot = catchAsync(async (req, res) => {
  const { id: userId } = req.user as User;
  const { submissionCode } = req.query as { submissionCode: string };

  if (!req.files || !req.files.length) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'No files were uploaded');
  }

  const files = req.files as Express.Multer.File[];
  const destinationFolder = `submissions/${userId}/${submissionCode}`;
  fs.ensureDirSync(destinationFolder);

  for (const file of files) {
    const newPath = `${destinationFolder}/${file.originalname}`;
    // console.log(file);
    await fs.move(file.path, newPath, { overwrite: true });
    await submissionService.createSnapshot(submissionCode, newPath);
  }

  res.status(httpStatus.CREATED).send({ message: 'Snapshot created successfully' });
});

export default {
  makeSubmission,
  getSubmissions,
  createSnapshot,
  updateSubmission
};