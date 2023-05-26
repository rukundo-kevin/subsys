import { Lecturer, Role, User } from '@prisma/client';
import prisma from '../client';
import userService from './user.service';
import { generateId, generateRandomPassword } from '../utils/userHelper';
import ApiError from '../utils/ApiError';
import httpStatus from 'http-status';
import tokenService from './token.service';
import { sendEmails } from '../utils/sendInvitation';

/**
 *
 * @param email
 * @param firstname
 * @param lastname
 * @param role
 * @returns {Promise<Lecturer>}
 */
const createLecturer = async (
  email: string,
  firstname: string,
  lastname: string,
  role: Role = Role.LECTURER
): Promise<Lecturer & any> => {
  const password = generateRandomPassword();
  const lecturerUser = await userService.createUser(email, password, firstname, lastname, role);
  let staffId;
  let lecturerIdExists;

  do {
    staffId = generateId('lecturer');
    lecturerIdExists = await prisma.lecturer.findUnique({
      where: {
        staffId
      }
    });
  } while (lecturerIdExists);
  const activationToken: any = await tokenService.generateAuthTokens(lecturerUser);
  sendEmails(email, staffId, 'Staff', password, activationToken);
  const lecturer = await prisma.lecturer.create({
    data: {
      staffId,
      user: {
        connect: {
          id: lecturerUser.id
        }
      }
    },
    include: {
      user: {
        select: {
          email: true,
          firstname: true,
          lastname: true,
          role: true,
          isInviteAccepted: true,
          createdAt: true,
          updatedAt: true
        }
      }
    }
  });

  if (!lecturer) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Lecturer could not be created');
  }
  return lecturer;
};

/**
 * @description Fetch all lecturers
 * @returns {Promise<Lecturer[]>}
 */
const getLecturers = async (): Promise<Lecturer[]> => {
  const lecturers = await prisma.lecturer.findMany({
    include: {
      user: {
        select: {
          email: true,
          firstname: true,
          lastname: true,
          role: true,
          isInviteAccepted: true,
          createdAt: true,
          updatedAt: true
        }
      }
    }
  });
  return lecturers;
};

/**
 * @description Fetch one lecturer
 * @param staffId
 * @returns {Promise<Lecturer | null>}
 */
const getOneLecturer = async (staffId: string): Promise<Lecturer | null> => {
  const lecturer = await prisma.lecturer.findUnique({
    where: {
      staffId
    },
    include: {
      user: {
        select: {
          email: true,
          firstname: true,
          lastname: true,
          role: true,
          isInviteAccepted: true,
          createdAt: true,
          updatedAt: true
        }
      }
    }
  });
  return lecturer;
};

/**
 * @description Delete a lecturer
 * @param {string} staffId
 * @returns {Promise<User | null>}
 *
 */
const deleteLecturer = async (staffId: string): Promise<User | null> => {
  const lecturer = await prisma.lecturer.findUnique({
    where: { staffId },
    include: { user: true }
  });

  if (!lecturer) {
    throw new Error(`Lecturer with staffId ${staffId} not found`);
  }

  const userId = lecturer.user.id;

  const deletedUser = await prisma.user.delete({ where: { id: userId } });
  return deletedUser;
};

/**
 * @description Update a lecturer
 * @param {string} staffId
 * @returns {Promise<Lecturer | null>}
 */

const updateLecturer = async (staffId: string, data: any): Promise<Lecturer | null> => {
  const updatedLecturer = await prisma.lecturer.update({
    where: {
      staffId
    },
    data: {
      user: {
        update: {
          ...data
        }
      }
    },
    include: {
      user: {
        select: {
          email: true,
          firstname: true,
          lastname: true,
          role: true,
          isInviteAccepted: true,
          createdAt: true,
          updatedAt: true
        }
      }
    }
  });

  return updatedLecturer;
};

export default {
  getOneLecturer,
  createLecturer,
  getLecturers,
  deleteLecturer,
  updateLecturer
};
