import Joi from 'joi';

const createStudent = {
  body: Joi.object().keys({
    firstname: Joi.string().required(),
    lastname: Joi.string().required(),
    email: Joi.string().required()
  })
};

export default {
  createStudent
};
