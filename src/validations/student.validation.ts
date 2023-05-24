import Joi from 'joi';
import userSchema from '.';

const createStudent = {
  body: userSchema
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

const studentCsv = {
  body: Joi.object().keys({
    students: Joi.array().items(userSchema)
  })
};

export default {
  createStudent,
  getStudents,
  updateStudent,
  studentCsv
};
