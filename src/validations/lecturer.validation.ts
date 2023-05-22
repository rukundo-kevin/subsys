import Joi from 'joi';

const createLecturer = {
  body: Joi.object().keys({
    firstname: Joi.string().required(),
    lastname: Joi.string().required(),
    email: Joi.string().required()
  })
};

export default {
  createLecturer
};
