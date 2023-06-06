import Joi from 'joi';

const usernameRegex = /^(LC|ST)\d{6}$/;

const login = {
  body: Joi.object().keys({
    username: Joi.alternatives()
      .try(Joi.string().email(), Joi.string().regex(usernameRegex))
      .required()
      .messages({
        'any.required': 'Email or Staff ID is required',
        'alternatives.match': 'Invalid email or staff id format'
      }),
    password: Joi.string().required()
  })
};

const refreshTokens = {
  body: Joi.object().keys({
    refreshToken: Joi.string().required()
  })
};

const logout = {
  body: Joi.object().keys({
    refreshToken: Joi.string().required()
  })
};

const PASSWORD_REGEX = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/;

const resetPassword = {
  body: Joi.object().keys({
    newPassword: Joi.string()
      .min(8)
      .regex(PASSWORD_REGEX)
      .required()
      .label('New password')
      .messages({
        'string.pattern.base':
          'Password must contain at least one letter, one number, and one special character',
        'string.min': 'Password must be at least 8 characters long'
      })
  })
};

export default {
  login,
  refreshTokens,
  logout,
  resetPassword
};
