import { User } from '@prisma/client';
import { submissionService } from '../services';
import catchAsync from '../utils/catchAsync';
import httpStatus from 'http-status';

const makeSubmission = catchAsync(async (req, res) => {
  const { id: userId } = req.user as User;
  const { assignmentCode } = req.body;
  const submission = await submissionService.makeSubmission(userId, assignmentCode);

  res.send(httpStatus.CREATED).send(submission);
});

const getSubmissions = catchAsync(async (req, res) => {
  const { assignmentCode } = req.params;
  const { id: userId, role } = req.user as User;
  const submission = await submissionService.getSubmissions(userId, role, assignmentCode);
  res.send(httpStatus.OK).send(submission);
});

const createSnapshot = catchAsync(async (req, res) => {
  const { snapshotName, snapshotFiles } = req.body;
  const { assignmentCode, submissionCode } = req.query as {
    assignmentCode: string;
    submissionCode: string;
  };

  const snapshot = await submissionService.createSnapshot(
    assignmentCode,
    submissionCode,
    snapshotName,
    snapshotFiles
  );

  res.send(httpStatus.CREATED);
});

export default {
  makeSubmission,
  getSubmissions,
  createSnapshot
};
