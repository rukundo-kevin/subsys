import httpStatus from 'http-status';
import catchAsync from '../utils/catchAsync';
import { authService, tokenService, userService } from '../services';
import { User } from '@prisma/client';
import { getRole } from '../utils/userHelper';

const login = catchAsync(async (req, res) => {
  const { username, password } = req.body;
  const role = getRole(username);

  const user =
    role == 'USER'
      ? await authService.loginUserWithEmailAndPassword(username, password)
      : await authService.loginWithStaffId(username, password, role);

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
});

const activateAccount = catchAsync(async (req, res) => {
  const { activationToken } = req.params;
  const userId = await tokenService.verifyActivationLink(activationToken);
  await userService.updateUserById(userId, { isInviteAccepted: true });
  res.status(httpStatus.OK).send({ message: 'Account activated successfully' });
});

export default {
  login,
  refreshTokens,
  logout,
  resetPassword,
  activateAccount
};
