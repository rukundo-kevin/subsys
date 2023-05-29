import httpStatus from 'http-status';
import { TokenType, User } from '@prisma/client';

import prisma from '../client';
import userService from './user.service';
import ApiError from '../utils/ApiError';
import exclude from '../utils/exclude';
import { encryptPassword, isPasswordMatch } from '../utils/encryption';
import tokenService from './token.service';
import { AuthTokensResponse } from '../types/response';

/**
 * Login with username and password
 * @param {string} email
 * @param {string} password
 * @returns {Promise<Omit<User, 'password'>>}
 */

const loginUserWithEmailAndPassword = async (
  email: string,
  password: string
): Promise<Omit<User, 'password'>> => {
  const user = await userService.getUserByEmail(email, [
    'id',
    'email',
    'firstname',
    'lastname',
    'password',
    'role',
    'isInviteAccepted',
    'createdAt',
    'updatedAt'
  ]);

  if (!user || !(await isPasswordMatch(password, user.password))) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Incorrect email or password');
  }
  return exclude(user, ['password']);
};

/**
 * Refresh auth tokens
 * @param {string} refreshToken
 * @returns {Promise<AuthTokensResponse>}
 */
const refreshAuth = async (refreshToken: string): Promise<AuthTokensResponse> => {
  try {
    const refreshTokenData = await tokenService.verifyToken(refreshToken, TokenType.REFRESH);
    const { userId } = refreshTokenData;
    await prisma.token.delete({ where: { id: refreshTokenData.id } });
    return tokenService.generateAuthTokens({ id: userId });
  } catch (error) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Invalid refresh token please authenticate');
  }
};

/**
 *
 * @param refreshToken
 */
const logout = async (refreshToken: string): Promise<void> => {
  const refreshTokenData = await prisma.token.findFirst({
    where: {
      token: refreshToken,
      type: 'REFRESH',
      blacklisted: false
    }
  });
  if (!refreshTokenData) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User Not found');
  }
  await prisma.token.delete({ where: { id: refreshTokenData.id } });
};

/**
 *
 * @param userId
 * @param newPassword
 */
const resetPassword = async (userId: number, newPassword: string): Promise<void> => {
  const user = await prisma.user.findFirst({ where: { id: userId } });
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }
  await userService.updateUserById(userId, { password: await encryptPassword(newPassword) });
};

export default {
  loginUserWithEmailAndPassword,
  refreshAuth,
  logout,
  resetPassword
};
