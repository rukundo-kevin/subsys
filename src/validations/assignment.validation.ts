import Joi from 'joi';

const createDraft = {
  body: Joi.object().keys({
    title: Joi.string().required(),
    description: Joi.string().required(),
    deadline: Joi.date().required()
  })
};

const getAssignments = {
  query: Joi.object({
    sortBy: Joi.string().valid('deadline', 'title', 'createdAt').optional(),
    sortOrder: Joi.string().valid('asc', 'desc').optional(),
    isDraft: Joi.boolean().optional()
  })
};

export default {
  createDraft,
  getAssignments
};
