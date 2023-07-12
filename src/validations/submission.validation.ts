import Joi from 'joi';

const assignmentCodeSchema = Joi.string()
  .regex(/^(ASS)\d{6}$/)
  .required()
  .messages({
    'string.pattern.base': 'Invalid assignment code'
  });

const submissionCodeSchema = Joi.string()
  .regex(/^(SUB)\d{6}$/)
  .required()
  .messages({
    'string.pattern.base': 'Invalid submission code'
  });

const submit = {
  query: Joi.object().keys({
    assignmentCode: assignmentCodeSchema
  })
};

const uploadSnapshot = {
  query: Joi.object().keys({
    submissionCode: submissionCodeSchema
  }),
  body: {
    snapshots: Joi.array().items(
      Joi.object().keys({
        snapshotFiles: Joi.string().required()
      })
    )
  }
};

const updateSubmission = {
  params: {
    submissionCode: submissionCodeSchema
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
  uploadSnapshot,
  updateSubmission
};