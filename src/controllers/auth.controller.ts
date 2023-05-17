import httpStatus from 'http-status';
import catchAsync from '../utils/catchAsync';
import { authService, tokenService } from '../services';

const login = catchAsync(async (req, res) => {
  const { email, password } = req.body;
  const user = await authService.loginUserWithEmailAndPassword(email, password);
  const tokens = await tokenService.generateAuthTokens(user);
  res.status(httpStatus.OK).send({ user, tokens });
});

const logout = catchAsync(async (req, res) => {
  console.log('out');
  res.send('out');
});

export default {
  login,
  logout
};
