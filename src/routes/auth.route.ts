import express from 'express';
import validate from '../middlewares/validate';
import authValidation from '../validations/auth.validation';
import { authController } from '../controllers';
import auth from '../middlewares/auth';

const router = express.Router();

router.post('/login', validate(authValidation.login), authController.login);
router.post('/logout', auth(), validate(authValidation.logout), authController.logout);
router.post('/activate/:activationToken',authController.activateAccount);
router.post(
  '/refresh-tokens',
  validate(authValidation.refreshTokens),
  authController.refreshTokens
);

router.patch(
  '/reset-password',
  auth(),
  validate(authValidation.resetPassword),
  authController.resetPassword
);

export default router;
