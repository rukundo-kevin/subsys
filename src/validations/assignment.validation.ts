import Joi from 'joi';
export const createDraft = {
  body: Joi.object().keys({
    title: Joi.string().required(),
    description: Joi.string().required(),
    deadline: Joi.date().required()
  })
};
const editAssignment = {
  body: Joi.object().keys({
    title: Joi.string().optional(),
    description: Joi.string().optional(),
    deadline: Joi.date().optional()
  }),
  params: Joi.object().keys({
    assignmentId: Joi.string().required()
  })
};

const getAssignments = {
  query: Joi.object({
    sortBy: Joi.string().valid('deadline', 'title', 'createdAt').optional(),
    sortOrder: Joi.string().valid('asc', 'desc').optional(),
    isDraft: Joi.boolean().optional()
  })
};

const deleteAssignment = {
  params: Joi.object().keys({
    assignmentId: Joi.string().required()
  })
};
export default {
  createDraft,
  getAssignments,
  editAssignment,
  deleteAssignment
};
