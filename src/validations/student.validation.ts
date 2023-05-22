import Joi from 'joi';

const createStudent = {
  body: Joi.object().keys({
    firstname: Joi.string().required(),
    lastname: Joi.string().required(),
    email: Joi.string().required()
  })
};

const getStudents = {
  params: Joi.object().keys({
    studentId: Joi.string().required()
  })
};

const updateStudent = {
  params: Joi.object().keys({
    studentId: Joi.required()
  }),
  body: Joi.object()
    .keys({
      firstname: Joi.string(),
      lastname: Joi.string(),
      email: Joi.string()
    })
    .min(1)
};

export default {
  createStudent,
  getStudents,
  updateStudent
};
