import httpStatus from 'http-status';
import { Role, TokenType, User } from '@prisma/client';

import prisma from '../client';
import userService from './user.service';
import ApiError from '../utils/ApiError';
import exclude from '../utils/exclude';
import { encryptPassword, isPasswordMatch } from '../utils/encryption';
import tokenService from './token.service';
import { AuthTokensResponse } from '../types/response';
import studentService from './student.service';
import lecturerService from './lecturer.service';

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

  if (!user || !(await isPasswordMatch(password, user.password)) || !user.isInviteAccepted) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Incorrect email or password');
  }
  return exclude(user, ['password']);
};

const loginWithStaffId = async (
  staffId: string,
  password: string,
  role: Role
): Promise<Omit<User, 'password'>> => {
  let userId = null;

  if (role === Role.STUDENT) {
    const student = await studentService.getOneStudent(staffId);
    if (!student) {
      throw new ApiError(httpStatus.UNAUTHORIZED, 'Incorrect staffId or password');
    }
    userId = student.userId;
  } else if (role === Role.LECTURER) {
    const lecturer = await lecturerService.getOneLecturer(staffId);
    if (!lecturer) {
      throw new ApiError(httpStatus.UNAUTHORIZED, 'Incorrect staffId or password');
    }
    userId = lecturer.userId;
  }

  if (userId === null) throw new ApiError(httpStatus.UNAUTHORIZED, 'Incorrect staffId or password');

  const user = await userService.getUserById(userId, [
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

  if (!user || !(await isPasswordMatch(password, user.password)) || !user.isInviteAccepted) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Incorrect staffId or password');
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
  loginWithStaffId,
  refreshAuth,
  logout,
  resetPassword
};
