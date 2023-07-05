import Joi from 'joi';
const assignmentCodeSchema = Joi.string()
  .regex(/^(ASS)\d{6}$/)
  .required()
  .messages({
    'string.pattern.base': 'Invalid assignment code'
  });

const submit = {
  body: Joi.object().keys({
    assignmentCode: assignmentCodeSchema
  })
};

const uploadSnapshot = {
  query: Joi.object().keys({
    assignmentCode: assignmentCodeSchema,
    submissionCode: Joi.string()
      .regex(/^(SUB)\d{6}$/)
      .required()
      .messages({
        'string.pattern.base': 'Invalid assignment code'
      })
  }),
  body: {
    snapshotName: Joi.string().required(),
    snapshotFile: Joi.binary().required()
  }
};

const getSubmission = {
  params: {
    assignmentCode: assignmentCodeSchema
  }
};
export default {
  submit,
  getSubmission,
  uploadSnapshot
};
