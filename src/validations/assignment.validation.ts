import Joi from 'joi';
const createDraft = {
  body: Joi.object().keys({
    title: Joi.string().required(),
    description: Joi.string().required(),
    deadline: Joi.date().required()
  })
};

export default {
  createDraft
};
