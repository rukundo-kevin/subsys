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

/**
 * Get user by id
 * @param {ObjectId} id
 * @param {Array<Key>} keys
 * @returns {Promise<Pick<User, Key> | null>}
 */
const getUserById = async <Key extends keyof User>(
  id: number,
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
    where: { id },
    select: keys.reduce((obj, k) => ({ ...obj, [k]: true }), {})
  }) as Promise<Pick<User, Key> | null>;
};

/**
 * Update user by id
 * @param {ObjectId} userId
 * @param {Object} updateBody
 * @returns {Promise<User>}
 */
const updateUserById = async <Key extends keyof User>(
  userId: number,
  updateBody: Prisma.UserUpdateInput,
  keys: Key[] = ['id', 'email', 'firstname', 'lastname', 'role'] as Key[]
): Promise<Pick<User, Key> | null> => {
  const user = await getUserById(userId, ['id', 'email', 'firstname', 'lastname', 'role']);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }

  const updatedUser = await prisma.user.update({
    where: { id: user.id },
    data: updateBody,
    select: keys.reduce((obj, k) => ({ ...obj, [k]: true }), {})
  });
  return updatedUser as Pick<User, Key> | null;
};
/**
 *
 * @param userId
 */
const deleteUser = async (userId: number): Promise<void> => {
  const user = await prisma.user.findFirst({ where: { id: userId } });
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }
  await prisma.user.delete({ where: { id: userId } });
};

export default {
  getUserByEmail,
  createUser,
  getUserById,
  updateUserById,
  deleteUser
};
