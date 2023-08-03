import httpStatus from 'http-status';
import fs from 'fs-extra';

import { Assignment, Role, User } from '@prisma/client';
import { submissionService } from '../services';
import catchAsync from '../utils/catchAsync';
import ApiError from '../utils/ApiError';
import assignmentService from '../services/assignment.service';
import { generateId } from '../utils/userHelper';
import pick from '../utils/pick';
import { extractFolderContents, validateHead } from '../utils/submission.helper';
import { sendSubmissionConfirmation } from '../utils/assignmentInvitation';

const makeSubmission = catchAsync(async (req, res) => {
  const {
    id: userId,
    studentId,
    firstname,
    lastname,
    email
  } = req.user as User & { studentId: string };

  const assignmentCode = req.params!.assignmentCode as string;
  if (!req.file) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'The head file was not uploaded');
  }
  // Validate head file format
  const { error } = await validateHead(JSON.parse(await fs.readFile(req.file.path, 'utf8')));
  if (error) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Invalid head file format');
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
    throw new ApiError(httpStatus.BAD_REQUEST, 'Can not submit after deadline');

  const submissionExist = await submissionService.getSubmissions(
    {
      assignmentId: assignment[0].id,
      student: {
        userId
      }
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
  const userFolder = `submissions/${studentId}/${submissionCode}`;
  await fs.ensureDir(userFolder); // Creates the folder if it doesn't exist
  const newPath = `${userFolder}/${req.file.originalname}`;

  await fs.move(req.file.path, newPath, { overwrite: true });

  const submission = await submissionService.makeSubmission(
    userId,
    assignmentCode as string,
    newPath,
    submissionCode
  );

  await sendSubmissionConfirmation(`${firstname} ${lastname}`, email, assignment[0].title);

  return res.status(httpStatus.CREATED).send({
    message: 'Submission made successfully',
    data: {
      submission
    }
  });
});

const updateSubmission = catchAsync(async (req, res) => {
  const { submissionCode } = req.params;
  const { id: userId, studentId } = req.user as User & { studentId: string };
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
  const newPath = `submissions/${studentId}/${submissionCode}/${head.originalname}`;

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
    if (submissions.length == 0) throw new ApiError(httpStatus.NOT_FOUND, 'No submissions found');
    if (assignmentCode) submissions = submissions[0];
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
  const head: { snapshot_name: string } = JSON.parse(await fs.readFile(submission[0].head, 'utf8'));

  const latestSnapshot = submission[0].snapshots.filter(
    (snapshot) => snapshot.snapshotName == head.snapshot_name
  );

  if (!latestSnapshot || latestSnapshot.length == 0)
    throw new ApiError(httpStatus.NOT_FOUND, 'Snapshot does not exist');

  const latestSnapshotContents = await extractFolderContents(latestSnapshot[0].snapshotPath);

  return res.status(httpStatus.OK).send({
    message: 'Submission fetched successfully',
    submission: { ...submission, currentSnapshot: latestSnapshotContents }
  });
});

export default {
  makeSubmission,
  getSubmissions,
  getSingleSubmission,
  updateSubmission
};
