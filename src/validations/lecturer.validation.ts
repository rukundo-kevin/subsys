import Joi from 'joi';
import userSchema from '.';

const createLecturer = {
  body: userSchema
};

const getLecturer = {
  params: Joi.object().keys({
    lecturerId: Joi.string().required()
  })
};

const updateLecturer = {
  params: Joi.object().keys({
    lecturerId: Joi.string().required()
  }),
  body: Joi.object()
    .keys({
      firstname: Joi.string(),
      lastname: Joi.string(),
      email: Joi.string()
    })
    .min(1)
};

const lecturerCsv = {
  body: Joi.object().keys({
    lecturers: Joi.array().items(userSchema)
  })
};

export default {
  createLecturer,
  getLecturer,
  updateLecturer,
  lecturerCsv
};
