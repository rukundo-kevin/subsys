import Joi from 'joi';

const userSchema = Joi.object({
  firstname: Joi.string().required(),
  lastname: Joi.string().required(),
  email: Joi.string().required()
});

export default userSchema;
