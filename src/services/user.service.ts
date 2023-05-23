import { User, Role } from '@prisma/client';
import httpStatus from 'http-status';
import ApiError from '../utils/ApiError';
import prisma from '../client';
import { Prisma } from '@prisma/client';
import { encryptPassword } from '../utils/encryption';
/**
 * Get user by email
 * @param {string} email
 * @returns {Promise<User>}
 * @throws {ApiError}
 * @returns {Promise<User>}
 */
const getUserByEmail = async <Key extends keyof User>(
  email: string,
  keys: Key[] = [
    'id',
    'email',
    'firstname',
    'lastname',
    'password',
    'role',
    'isInviteAccepted',
    'createdAt',
    'updatedAt'
  ] as Key[]
): Promise<Pick<User, Key> | null> => {
  return prisma.user.findUnique({
    where: { email },
    select: keys.reduce((obj, k) => ({ ...obj, [k]: true }), {})
  }) as Promise<Pick<User, Key> | null>;
};

/**
 * Create a user
 * @param {Object} userBody
 * @returns {Promise<User>}
 */
const createUser = async (
  email: string,
  password: string,
  firstname?: string,
  lastname?: string,
  role?: Role
): Promise<User> => {
  try {
    const createdUser = await prisma.user.create({
      data: {
        email,
        firstname,
        lastname,
        password: await encryptPassword(password),
        role
      }
    });
    return createdUser;
  } catch (error) {
    if ((error as Prisma.PrismaClientKnownRequestError).code === 'P2002') {
      throw new ApiError(httpStatus.BAD_REQUEST, `Email "${email}" already exists`);
    }
    throw error;
  }
};

export default {
  getUserByEmail,
  createUser
};
