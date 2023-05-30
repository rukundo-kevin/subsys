import Joi from 'joi';
const createDraft = {
  body: Joi.object().keys({
    title: Joi.string().required(),
    description: Joi.string().required(),
    deadline: Joi.date().required()
  })
};

const publish={
  body:Joi.object().keys({
    deadline: Joi.date().required()
  })
}

export default {
  createDraft,
  publish
};
