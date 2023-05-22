import httpStatus from 'http-status';
import { Role, Student } from '@prisma/client';

import ApiError from '../utils/ApiError';
import prisma from '../client';
import userService from './user.service';
import { generateId, generateRandomPassword } from '../utils/userHelper';

/**
 * Create a student
 * @param { Object } studentBody
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
    studentId = generateId('student');
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

  if (!student) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Student could not be created');
  }

  return student;
};

/**
 * Get students
 * @description Fetch all students
 * @returns {Promise<Student[]>}
 */
const getStudents = async (): Promise<Student[]> => {
  const students = prisma.student.findMany({
    include: {
      user: {
        select: {
          firstname: true,
          lastname: true,
          email: true
        }
      }
    }
  });
  return students;
};

const getOneStudent = async (studentId: string): Promise<Student | null> => {
  const student = prisma.student.findUnique({
    where: {
      studentId
    },
    include: {
      user: {
        select: {
          firstname: true,
          lastname: true,
          email: true
        }
      }
    }
  });
  return student;
};

const updateStudent = async (studentId: string, studentBody: any): Promise<Student | null> => {
  const updatedStented = prisma.student.update({
    where: {
      studentId
    },
    data: {
      user: {
        update: {
          ...studentBody
        }
      }
    },
    include: {
      user: {
        select: {
          firstname: true,
          lastname: true,
          email: true
        }
      }
    }
  });

  return updatedStented;
};

const deleteStudent = async (studentId: string): Promise<Student | null> => {
  const deletedStudent = prisma.student.delete({
    where: {
      studentId
    }
  });
  return deletedStudent;
};

export default {
  createStudent,
  getStudents,
  getOneStudent,
  updateStudent,
  deleteStudent
};
