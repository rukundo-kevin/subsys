import { Assignment, Role, Prisma, User } from '@prisma/client';
import prisma from '../client';
import ApiError from '../utils/ApiError';
import httpStatus from 'http-status';

/**
 * @description Create an assignment draft
 * @param {string} title - Title of the assignment
 * @param {string} description - Description of the assignment
 * @param {Date} deadline - Deadline of the assignment
 * @returns {Promise<Assignment>} - Assignment draft created
 */
const createAssignmentDraft = async (
  title: string,
  description: string,
  deadline: Date,
  userId: number
): Promise<Assignment> => {
  const lecturer = await prisma.lecturer.findUnique({
    where: {
      userId
    }
  });

  if (!lecturer) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Lecturer does not exist');
  }
  const assignmentDraft = await prisma.assignment.create({
    data: {
      title,
      description,
      deadline,
      lecturer: {
        connect: {
          staffId: lecturer.staffId
        }
      }
    },
    include: {
      lecturer: {
        select: {
          staffId: true,
          user: {
            select: {
              firstname: true,
              lastname: true
            }
          }
        }
      }
    }
  });

  return assignmentDraft;
};
/**
 *
 * @param id
 * @param assignmentBody
 * @returns
 * @throws Error if assignment is not found
 */
interface AssignmentBody extends Partial<Assignment> {}
const updateAssignment = async (
  id: number,
  assignmentBody: AssignmentBody,
  user: User
): Promise<Assignment | null> => {
  try {
    const lecturerAssignement = await prisma.assignment.findFirst({
      where: {
        lecturerId: Number(user.id),
        id: Number(id)
      }
    });
    if (!lecturerAssignement)
      throw new ApiError(
        httpStatus.BAD_REQUEST,
        "Assignment does not exist or you't have enough permission to edit assignement"
      );

    const updatedAssignment = await prisma.assignment.update({
      where: {
        id: Number(id)
      },
      data: assignmentBody
    });
    return updatedAssignment;
  } catch (e: any) {
    if (e instanceof Prisma.PrismaClientKnownRequestError) {
      if (e.code === 'P2025') {
        throw new ApiError(httpStatus.BAD_REQUEST, 'Assignment does not exist');
      }
    }
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      `Error while updating assignment ${(e as Error).message}`
    );
  }
};

/**
 *
 * @param userId - Id of the user
 * @param role - Role of the user
 * @param {Object} filter - Mongo filter
 * @param {Object} options - Query options
 * @param {string} [options.sortBy] - Sort option
 * @param {string} [options.sortOrder] - Sort order
 * @returns {Promise<Assignment[] | void>} List of Assignments
 */
const getAssignments = async (
  userId: number,
  role: Role,
  filter: object,
  options: {
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }
): Promise<Assignment[] | void> => {
  const sortBy = options.sortBy;
  const sortOrder = options.sortOrder ?? 'desc';
  if (role === 'ADMIN') {
    const assignments = await prisma.assignment.findMany({
      where: filter,
      include: {
        lecturer: {
          select: {
            id: true,
            staffId: true,
            user: {
              select: {
                firstname: true,
                lastname: true
              }
            }
          }
        }
      },
      orderBy: sortBy ? { [sortBy]: sortOrder } : undefined
    });
    return assignments;
  }
  if (role === 'LECTURER') {
    const lecturer = await prisma.lecturer.findUnique({
      where: {
        userId
      }
    });

    if (!lecturer) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Lecturer does not exist');
    }

    const assignments = await prisma.assignment.findMany({
      where: {
        lecturerId: lecturer.id,
        ...filter
      },
      include: {
        lecturer: {
          select: {
            id: true,
            staffId: true
          }
        },
        students: {
          select: {
            id: true,
            studentId: true,
            user: {
              select: {
                id: true,
                firstname: true,
                lastname: true,
                isInviteAccepted: true
              }
            }
          }
        }
      },
      orderBy: sortBy ? { [sortBy]: sortOrder } : undefined
    });

    return assignments;
  }
  if (role === 'STUDENT') {
    const student = await prisma.student.findUnique({
      where: {
        userId
      },
      include: {
        assignment: {
          orderBy: {
            deadline: sortOrder
          }
        }
      }
    });

    if (!student) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Student does not exist');
    }
    return student.assignment;
  }
};

const getAssignmentById = async (assignmentId: number): Promise<Assignment | null> => {
  const assignment = await prisma.assignment.findUnique({
    where: {
      id: parseInt(assignmentId.toString())
    },
    include: {
      lecturer: {
        select: {
          id: true,
          staffId: true,
          user: {
            select: {
              firstname: true,
              lastname: true
            }
          }
        }
      }
    }
  });
  if (!assignment) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Assignment does not exist');
  }

  return assignment;
};

const getOneAssignment = async (id: number): Promise<Assignment | null> => {
  const assignment = await prisma.assignment.findUnique({
    where: {
      id: Number(id)
    }
  });
  if (!assignment) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Assignment does not exist');
  }
  return assignment;
};

const assignStudentToAssignment = async (
  assignmetId: number,
  studentIds: number[]
): Promise<Assignment | null> => {
  try {
    const assigned = await prisma.assignment.update({
      where: {
        id: assignmetId
      },
      data: {
        students: {
          connect: studentIds.map((id) => ({ id }))
        }
      },
      include: {
        students: true
      }
    });
    return assigned;
  } catch (e: any) {
    if (e instanceof Prisma.PrismaClientKnownRequestError) {
      if (e.code === 'P2025') {
        throw new ApiError(httpStatus.BAD_REQUEST, 'Assignment does not exist');
      }
    }
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      `Error while assigning students ${(e as Error).message}`
    );
  }
};

export default {
  createAssignmentDraft,
  getAssignments,
  updateAssignment,
  getAssignmentById,
  getOneAssignment,
  assignStudentToAssignment
};
