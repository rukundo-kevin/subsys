import httpStatus from 'http-status';
import catchAsync from '../utils/catchAsync';
import { authService, tokenService } from '../services';
import { User } from '@prisma/client';

const login = catchAsync(async (req, res) => {
  const { email, password } = req.body;
  const user = await authService.loginUserWithEmailAndPassword(email, password);
  const tokens = await tokenService.generateAuthTokens(user);
  res.status(httpStatus.OK).send({ user, tokens });
});

const refreshTokens = catchAsync(async (req, res) => {
  const tokens = await authService.refreshAuth(req.body.refreshToken);
  res.send({ ...tokens });
});

const logout = catchAsync(async (req, res) => {
  await authService.logout(req.body.refreshToken);
  res.status(httpStatus.OK).send({ message: 'Logged out successfully' });
});

const resetPassword = catchAsync(async (req, res) => {
  const { newPassword } = req.body;
  const { id: userId } = req.user as User;
  await authService.resetPassword(userId, newPassword);
  res.status(httpStatus.OK).send({ message: 'Password reset successfully' });
}

const activateAccount=catchAsync(async (req, res) => {
  const { activationToken } = req.params;
  const tokenData=await tokenService.verifyToken(activationToken,'ACTIVATION')
  await authService.activateAccount(activationToken)
  await userService.updateUser(tokenData.id,{isInviteAccepted:true})
  res.status(httpStatus.OK).send({ message: 'Account activated successfully' });
});

export default {
  login,
  refreshTokens,
  logout,
  resetPassword,
  activateAccount
};
