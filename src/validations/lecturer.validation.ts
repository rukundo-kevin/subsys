import Joi from 'joi';

const createLecturer = {
  body: Joi.object().keys({
    firstname: Joi.string().required(),
    lastname: Joi.string().required(),
    email: Joi.string().required()
  })
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
    lecturers: Joi.array().items(createLecturer)
  })
};

export default {
  createLecturer,
  getLecturer,
  updateLecturer,
  lecturerCsv
};
