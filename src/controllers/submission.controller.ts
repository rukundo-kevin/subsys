import httpStatus from 'http-status';

import { User } from '@prisma/client';
import { submissionService } from '../services';
import catchAsync from '../utils/catchAsync';
import ApiError from '../utils/ApiError';

interface File {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  buffer: Buffer;
  size: number;
  destination?: string;
  filename?: string;
  path?: string;
  contentType?: string;
}

const makeSubmission = catchAsync(async (req, res) => {
  const { id: userId } = req.user as User;
  const { assignmentCode } = req.body;
  const submission = await submissionService.makeSubmission(userId, assignmentCode);

  res.status(httpStatus.CREATED).send({
    message: 'Submission created successfully',
    data: {
      submission
    }
  });
});

const getSubmissions = catchAsync(async (req, res) => {
  const { assignmentCode } = req.params;
  const { id: userId, role } = req.user as User;
  const submission = await submissionService.getSubmissions(userId, role, assignmentCode);

  return res.status(httpStatus.OK).send(submission);
});

const createSnapshot = catchAsync(async (req, res) => {
  const { submissionCode } = req.query as {
    submissionCode: string;
  };

  if (!req.files) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'No files were uploaded');
  }

  const files = req.files as unknown as File[];

  for (const file of files) {
    await submissionService.createSnapshot(submissionCode, file.originalname);
  }

  res.status(httpStatus.CREATED).send({ message: 'Snapshot created successfully' });
});

export default {
  makeSubmission,
  getSubmissions,
  createSnapshot
};
