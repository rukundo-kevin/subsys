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
  params: Joi.object().keys({
    assignmentCode: assignmentCodeSchema
  })
};

const uploadSnapshot = {
  query: Joi.object().keys({
    submissionCode: submissionCodeSchema
  }),

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

const snapshot = {
  params: Joi.object().keys({
    snapshotId: Joi.string().required()
  })
};

const getSnapshotFile = {
  params: Joi.object().keys({
    snapshotId: Joi.string().required(),
    filepath: Joi.string().required()
  })
};

const headSchema = Joi.object().keys({
  snapshot_key: Joi.string().required(),
  snapshot_name: Joi.string().required()
});

export default {
  submit,
  getSubmission,
  uploadSnapshot,
  updateSubmission,
  snapshot,
  getSnapshotFile,
  headSchema
};
