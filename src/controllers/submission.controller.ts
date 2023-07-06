import httpStatus from 'http-status';
import { v2 as cloudinaryV2 } from 'cloudinary';

import { User } from '@prisma/client';
import { submissionService } from '../services';
import catchAsync from '../utils/catchAsync';
import ApiError from '../utils/ApiError';

cloudinaryV2.config({
  cloud_name: 'dpymyyo7h',
  api_key: '973141747481133',
  api_secret: 'jV-WPakByB3P_ztMyLQ8Ga8LshM'
});

const makeSubmission = catchAsync(async (req, res) => {
  const { id: userId } = req.user as User;
  const { assignmentCode } = req.body;
  const submission = await submissionService.makeSubmission(userId, assignmentCode);

  res.status(httpStatus.CREATED).send(submission);
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

  const uploadfilePromise = (req.files as unknown as File[]).map((file: any) => {
    return new Promise((resolve, reject) => {
      cloudinaryV2.uploader
        .upload_stream(
          { resource_type: 'auto', folder: 'submissions', public_id: file.originalname },
          (error, result) => {
            if (error) {
              reject(error);
            } else {
              resolve(result);
            }
          }
        )
        .end(file.buffer);
    });
  });

  const uploadedFiles = await Promise.all(uploadfilePromise);

  for (let i = 0; i < uploadedFiles.length; i++) {
    await submissionService.createSnapshot(
      submissionCode,
      (uploadedFiles[0] as any).public_id.split('/')[1],
      (uploadedFiles[i] as any).secure_url
    );
  }

  res.status(httpStatus.CREATED).send({ message: 'Snapshot created successfully' });
});

export default {
  makeSubmission,
  getSubmissions,
  createSnapshot
};
