import express from 'express';
import validate from '../middlewares/validate';
import authValidation from '../validations/auth.validation';
import { authController } from '../controllers';
import auth from '../middlewares/auth';

const router = express.Router();

router.post('/login', validate(authValidation.login), authController.login);
router.get('/logout', auth(), authController.logout);
export default router;
