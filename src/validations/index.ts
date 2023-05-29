import Joi from 'joi';

const userSchema = Joi.object({
  firstname: Joi.string().required(),
  lastname: Joi.string().required(),
  email: Joi.string().required()
});

export const deleteUser = {
  params: Joi.object().keys({
    userId: Joi.number().required()
  })
};

export default userSchema;
