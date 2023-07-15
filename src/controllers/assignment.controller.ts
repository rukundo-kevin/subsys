import httpStatus from 'http-status';
import catchAsync from '../utils/catchAsync';
import assignmentService from '../services/assignment.service';
import { Assignment, Role, User } from '@prisma/client';
import { generateAssignmentCode } from '../utils/assignmentHelper';
import { studentService } from '../services';
import { sendAssignmentInvitation } from '../utils/assignmentInvitation';
import pick from '../utils/pick';
import ApiError from '../utils/ApiError';

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
  const user = req.user as User;
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
  const assignment = await assignmentService.updateAssignment(id, assignmentBody, user);
  res.status(httpStatus.CREATED).send(assignment);
});

const getAssignments = catchAsync(async (req, res) => {
  const { id: userId, role } = req.user as User;
  const filter = pick(req.query, ['isDraft', 'assignmentCode']);
  const options = pick(req.query, ['sortBy', 'sortOrder']);
  const assignments = await assignmentService.getAssignments(userId, role, filter, options);
  if (!assignments || (assignments.length == 0 && filter.assignmentCode)) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Assignment not found');
  }
  if (assignments && filter.assignmentCode) {
    return res.status(httpStatus.OK).send(assignments[0]);
  }
  res.status(httpStatus.OK).send(assignments);
});

const getAssignmentById = catchAsync(async (req, res) => {
  const { assignmentId } = req.params;
  const user = req.user as User;
  const assignment = await assignmentService.getSingleAssignment(user, assignmentId);
  if (!assignment) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Assignment not found');
  }
  res.status(httpStatus.OK).send({ assignment: { ...assignment } });
});

const inviteToAssignment = catchAsync(async (req, res) => {
  let assignedAssignemnt;
  const user = req.user as User;
  const studentIds: number[] = req.body.studentIds;
  const students = await studentService.getManyStudents(studentIds);
  const assignment = (await assignmentService.getSingleAssignment(
    user,
    req.params.id
  )) as Assignment | null;
  if (assignment == null || assignment.isDraft) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Assignment does not exist or is a draft');
  }
  const studentIDs = students.map((student) => student.id);
  assignedAssignemnt = await assignmentService.assignStudentToAssignment(assignment.id, studentIDs);
  await sendAssignmentInvitation(students, assignment);

  return res.status(httpStatus.OK).send(assignedAssignemnt);
});

const editAssignment = catchAsync(async (req, res) => {
  const user = req.user as User;
  const { title, description, deadline } = req.body;
  const updatedAssignment = await assignmentService.updateAssignment(
    req.params.assignmentId,
    {
      title,
      description,
      deadline
    },
    user
  );
  res.status(httpStatus.OK).send({ message: 'Assignment updated successfully', updatedAssignment });
});

const deleteAssignment = catchAsync(async (req, res) => {
  const user = req.user as User;
  const { assignmentId } = req.params;
  const deletedAssignment = await assignmentService.deleteAssignment(assignmentId, user);
  if (!deletedAssignment) {
    throw new ApiError(
      httpStatus.UNAUTHORIZED,
      'You are not authorized to delete this assignment or the assignment is not a draft'
    );
  }
  res.status(httpStatus.NO_CONTENT).send({ message: 'Assignment deleted successfully' });
});

export default {
  createAssignmentDraft,
  getAssignments,
  publishAssignment,
  getAssignmentById,
  inviteToAssignment,
  editAssignment,
  deleteAssignment
};
