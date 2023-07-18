import httpStatus from 'http-status';
import fs from 'fs-extra';

import { Assignment, Prisma, Role, User } from '@prisma/client';
import { submissionService } from '../services';
import catchAsync from '../utils/catchAsync';
import ApiError from '../utils/ApiError';
import assignmentService from '../services/assignment.service';
import { generateId } from '../utils/userHelper';
import pick from '../utils/pick';
import { extractFileContents, extractFolderContents } from '../utils/submission.helper';

const makeSubmission = catchAsync(async (req, res) => {
  const { id: userId } = req.user as User;
  const assignmentCode = req.query!.assignmentCode as string;
  if (!req.file) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'The head file was not uploaded');
  }

  const assignment = (await assignmentService.getAssignments(
    userId,
    Role.STUDENT,
    { assignmentCode },
    {}
  )) as Assignment[];

  if (!assignment || assignment.length === 0) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Assignment does not exist');
  }
  if (assignment[0]?.deadline < new Date())
    throw new ApiError(httpStatus.BAD_REQUEST, 'Can no longer submit after deadline');

  const submissionExist = await submissionService.getSubmissions(
    {
      assignmentId: assignment[0].id
    },
    {}
  );

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

  const submission = await submissionService.getSubmissions(
    {
      submissionCode
    },
    {}
  );

  if (!submission || submission.length === 0) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Submission does not exist');
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
  const user = req.user as User;
  let submissions;
  const options = pick(req.query, ['sortBy', 'sortOrder']);

  if (user.role == Role.STUDENT) {
    const { studentId } = req.user as User & { studentId: string };
    submissions = assignmentCode
      ? await submissionService.getStudentSubmission(studentId, options, assignmentCode)
      : await submissionService.getStudentSubmission(studentId, options);
  } else if (user.role == Role.LECTURER) {
    const { staffId } = req.user as User & { staffId: string };
    submissions = assignmentCode
      ? await submissionService.getSubmissionLecturer(staffId, options, assignmentCode)
      : await submissionService.getSubmissionLecturer(staffId, options);
  } else {
    submissions = await submissionService.getSubmissions({}, options);
  }

  return res
    .status(httpStatus.OK)
    .send({ message: 'submissions fetched successfully', submissions });
});

const getSingleSubmission = catchAsync(async (req, res) => {
  const filter = {
    submissionCode: req.params.submissionCode
  };

  const submission = await submissionService.getSubmissions(filter, {});
  if (submission.length == 0) throw new ApiError(httpStatus.NOT_FOUND, 'Submission does not exist');
  const latestSnapshotContents = await extractFolderContents(
    submission[0].snapshots[0].snapshotPath
  );

  return res.status(httpStatus.OK).send({
    message: 'Submission fetched successfully',
    submission: { ...submission, currentSnapshot: latestSnapshotContents }
  });
});

const getSnapshots = catchAsync(async (req, res) => {
  const { submissionCode } = req.params;
  const filter: Prisma.SnapshotWhereInput = {
    submission: {
      submissionCode
    }
  };
  const snapshots = await submissionService.getSnapshots(filter);

  return res.status(httpStatus.OK).send({
    message: 'Snapshots fetched successfully',
    snapshots
  });
});

const getSingleSnapshot = catchAsync(async (req, res) => {
  const snapshot = await submissionService.getSnapshots({ id: req.params.snapshotId });
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
    await submissionService.createSnapshot(submissionCode, newPath, file.originalname);
  }

  res.status(httpStatus.CREATED).send({ message: 'Snapshot created successfully' });
});

const getSnapshotFile = catchAsync(async (req, res) => {
  const { snapshotId, filepath } = req.params;
  const snapshot = await submissionService.getSnapshots({ id: snapshotId });
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

export default {
  makeSubmission,
  getSubmissions,
  getSingleSubmission,
  createSnapshot,
  updateSubmission,
  getSingleSnapshot,
  getSnapshots,
  getSnapshotFile
};
