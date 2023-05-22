import { Lecturer, Role } from '@prisma/client';
import prisma from '../client';
import userService from './user.service';
import { generateId, generateRandomPassword } from '../utils/userHelper';
import ApiError from '../utils/ApiError';
import httpStatus from 'http-status';

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

export default {
  createLecturer,
  getLecturers
};
