import httpStatus from 'http-status';
import catchAsync from '../utils/catchAsync';
import assignmentService from '../services/assignment.service';
import { User } from '@prisma/client';
import { generateAssignmentCode } from '../utils/assignmentHelper';
import { studentService } from '../services';
import { sendAssignmentInvitation } from '../utils/assignmentInvitation';
import pick from '../utils/pick';

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
  const filter = pick(req.query, ['isDraft']);
  const options = pick(req.query, ['sortBy', 'sortOrder']);
  const assignments = await assignmentService.getAssignments(userId, role, filter, options);
  res.status(httpStatus.OK).send(assignments);
});

const getAssignmentById = catchAsync(async (req, res) => {
  const { assignmentId } = req.params;
  const assignment = await assignmentService.getAssignmentById(assignmentId);
  res.send(assignment);
});

const inviteToAssignment = catchAsync(async (req, res) => {
  let assignedAssignemnt;
  const studentIds: number[] = req.body.studentIds;
  const students = await studentService.getManyStudents(studentIds);
  const assignment = await assignmentService.getOneAssignment(req.params.id);
  if (assignment !== null) {
    const studentIDs = students.map((student) => student.id);
    assignedAssignemnt = await assignmentService.assignStudentToAssignment(
      assignment.id,
      studentIDs
    );
  }
  await sendAssignmentInvitation(students, assignment);
  res.status(httpStatus.OK).send(assignedAssignemnt);
});
const editAssignment = catchAsync(async (req, res) => {
  const user = req.user as User;
  const { title, description, deadline } = req.body;
  const updatedAssignment = assignmentService.updateAssignment(
    req.params.assignmentId,
    {
      title,
      description,
      deadline
    },
    user
  );
  res.status(httpStatus.OK).send(updatedAssignment);
});
export default {
  createAssignmentDraft,
  getAssignments,
  publishAssignment,
  getAssignmentById,
  inviteToAssignment,
  editAssignment
};
