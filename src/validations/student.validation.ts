import Joi from 'joi';

const studentSchema = Joi.object({
  firstname: Joi.string().required(),
  lastname: Joi.string().required(),
  email: Joi.string().required()
});

const createStudent = {
  body: studentSchema
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
    students: Joi.array().items(studentSchema)
  })
};

export default {
  createStudent,
  getStudents,
  updateStudent,
  studentCsv
};
