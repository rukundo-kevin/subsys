import httpStatus from 'http-status';
import fs from 'fs-extra';

import { Prisma, User } from '@prisma/client';
import { snapshotService, submissionService } from '../services';
import catchAsync from '../utils/catchAsync';
import ApiError from '../utils/ApiError';
import {
  createZippedFile,
  extractFileContents,
  extractFolderContents
} from '../utils/submission.helper';

const getSnapshots = catchAsync(async (req, res) => {
  const { submissionCode } = req.params;
  const filter: Prisma.SnapshotWhereInput = {
    submission: {
      submissionCode
    }
  };
  const snapshots = await snapshotService.getSnapshots(filter);

  return res.status(httpStatus.OK).send({
    message: 'Snapshots fetched successfully',
    snapshots
  });
});

const getSingleSnapshot = catchAsync(async (req, res) => {
  const snapshot = await snapshotService.getSnapshots({ id: req.params.snapshotId });
  if (!snapshot || snapshot.length == 0)
    throw new ApiError(httpStatus.NOT_FOUND, 'Snapshot not found');

  const snapshotContents = await extractFolderContents(snapshot[0].snapshotPath);
  return res.status(httpStatus.OK).send({
    message: 'Snapshot fetched successfully',
    snapshot: { ...snapshot[0], snapshotContents: snapshotContents }
  });
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
    await fs.move(file.path, newPath, { overwrite: true });
    await snapshotService.createSnapshot(submissionCode, newPath, file.originalname.split('.')[0]);
  }

  res.status(httpStatus.CREATED).send({ message: 'Snapshot created successfully' });
});

const getSnapshotFile = catchAsync(async (req, res) => {
  const { snapshotId, filepath } = req.params;
  const snapshot = await snapshotService.getSnapshots({ id: snapshotId });
  if (!snapshot || snapshot.length == 0)
    throw new ApiError(httpStatus.NOT_FOUND, 'Snapshot not found');

  const filecontents = await extractFileContents(
    snapshot[0].snapshotPath,
    snapshot[0].snapshotName,
    filepath
  );

  return res
    .status(httpStatus.OK)
    .send({ message: 'snapshot file contents fetched successfully', filecontents });
});

const downloadSnapshot = catchAsync(async (req, res) => {
  const { snapshotId, submissionCode } = req.params;
  if (snapshotId) {
    const snapshot = await snapshotService.getSnapshots({ id: snapshotId });
    if (!snapshot || snapshot.length == 0)
      throw new ApiError(httpStatus.NOT_FOUND, 'Snapshot not found');
    const snapshotPath = snapshot[0].snapshotPath;

    return res.download(snapshotPath, snapshot[0].snapshotName);
  }
  const submission = await submissionService.getSubmissions({ submissionCode }, {});
  const snapshotPaths = submission[0].snapshots.map((snapshot) => snapshot.snapshotPath);
  if (snapshotPaths.length == 0) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Snapshot not found');
  }

  const downloadPath = await createZippedFile(snapshotPaths, `submissions/test.tar`);
  const downloadName = `Student ${submission[0].student.studentId} - Submission ${submission[0].submissionCode}`;
  return res.download(downloadPath, downloadName);
});

export default {
  getSingleSnapshot,
  getSnapshots,
  getSnapshotFile,
  createSnapshot,
  downloadSnapshot
};
