import httpStatus from 'http-status';
import { Role, Student } from '@prisma/client';

import ApiError from '../utils/ApiError';
import prisma from '../client';
import userService from './user.service';
import { generateRandomPassword, generateStudentId } from '../utils/userHelper';

/**
 * Create a student
 * @param {Object} studentBody
 * @returns {Promise<Student>}
 */
const createStudent = async (
  email: string,
  firstname: string,
  lastname: string,
  role: Role = Role.STUDENT
): Promise<Student & any> => {
  const password = generateRandomPassword();
  const studentUser = await userService.createUser(email, password, firstname, lastname, role);

  let studentId;
  let studentIdExists;

  do {
    studentId = generateStudentId();
    studentIdExists = await prisma.student.findUnique({
      where: {
        studentId
      }
    });
  } while (studentIdExists);

  const student = await prisma.student.create({
    data: {
      studentId,
      user: {
        connect: {
          id: studentUser.id
        }
      }
    }
  });
  if (!student) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Student could not be created');
  }

  return prisma.student.findUnique({
    where: {
      id: student.id
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
};

export default {
  createStudent
};
