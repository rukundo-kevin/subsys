import httpStatus from 'http-status';
import catchAsync from '../utils/catchAsync';
import assignmentService from '../services/assignment.service';
import { User } from '@prisma/client';
import { generateAssignmentCode } from '../utils/assignmentHelper';

const createAssignmentDraft = catchAsync(async (req, res) => {
  const { title, description, deadline } = req.body;
  const { id: userId } = req.user as User;
  const assignmentDraft = await assignmentService.createAssignmentDraft(
    title,
    description,
    deadline,
    userId
  );
  res.status(httpStatus.CREATED).send(assignmentDraft);
});

const publishAssignment = catchAsync(async (req, res) => {
  const { id } = req.params;
  const { deadline, title, description } = req.body;
  const assignmentCode = generateAssignmentCode();
  const assignmentBody = {
    deadline,
    title,
    description,
    isDraft: false,
    assignmentCode
  };
  const assignment = await assignmentService.updateAssignment(id, assignmentBody);
  res.status(httpStatus.OK).send(assignment);
});

const getAssignments = catchAsync(async (req, res) => {
  const { id: userId, role } = req.user as User;
  const assignments = await assignmentService.getAssignments(userId, role);
  res.status(httpStatus.OK).send(assignments);
});

const getAssignmentById = catchAsync(async (req, res) => {
  const { assignmentId } = req.params;
  const assignment = await assignmentService.getAssignmentById(assignmentId);
  res.send(assignment);
});

export default {
  createAssignmentDraft,
  getAssignments,
  publishAssignment,
  getAssignmentById
};
