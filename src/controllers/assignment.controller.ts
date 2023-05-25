import httpStatus from 'http-status';
import catchAsync from '../utils/catchAsync';
import assignmentService from '../services/assignment.service';

const createAssignmentDraft = catchAsync(async (req, res) => {
  const { title, description, deadline } = req.body;
  const assignmentDraft = await assignmentService.createAssignmentDraft(
    title,
    description,
    deadline
  );
  res.status(httpStatus.CREATED).send(assignmentDraft);
});

export default {
  createAssignmentDraft
};
