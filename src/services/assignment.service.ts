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
    throw new ApiError(httpStatus.NOT_FOUND, 'Lecturer does not exist');
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
type AssignmentBody = Partial<Assignment>;
const updateAssignment = async (
  id: number,
  assignmentBody: AssignmentBody,
  user: User
): Promise<Assignment | null> => {
  try {
    const lecturerAssignement = await prisma.lecturer.findFirst({
      where: {
        userId: Number(user.id)
      },
      select: {
        assignments: {
          where: {
            id: Number(id)
          }
        }
      }
    });

    if (!lecturerAssignement) {
      throw new ApiError(
        httpStatus.BAD_REQUEST,
        "Assignment does not exist or you't have enough permission to edit assignement"
      );
    }
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
        throw new ApiError(httpStatus.NOT_FOUND, 'Assignment does not exist');
      }
    }
    throw new ApiError(
      httpStatus.INTERNAL_SERVER_ERROR,
      `Error while updating assignment ${(e as Error).message}`
    );
  }
};

/**
 *
 * @param userId - Id of the user
 * @param role - Role of the user
 * @param {AssignmentWhereInput} filter - filter
 * @param {Object} options - Query options
 * @param {string} [options.sortBy] - Sort option
 * @param {string} [options.sortOrder] - Sort order
 * @returns {Promise<Assignment[] | void>} List of Assignments or single Assignment
 */
const getAssignments = async (
  userId: number,
  role: Role,
  filter: Prisma.AssignmentWhereInput,
  options: {
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }
) => {
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
    const assignments = await prisma.assignment.findMany({
      where: {
        lecturer: {
          user: {
            id: userId
          }
        },
        ...filter
      },
      include: {
        lecturer: true,
        students: {
          select: {
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
    const student = await prisma.student.findMany({
      where: {
        user: {
          id: userId
        }
      },
      include: {
        assignment: {
          where: {
            ...filter,
            isDraft: false
          },
          orderBy: {
            deadline: sortOrder
          }
        }
      }
    });

    if (!student) {
      throw new ApiError(httpStatus.NOT_FOUND, 'Assignment not found');
    }

    return student[0].assignment;
  }
};

/**
 *
 * @param id: Id of the assignment
 * @returns {Promise<Assignment | null>}
 */
const getSingleAssignment = async (user: User, id: number) => {
  if (user.role === Role.LECTURER) {
    const assignment = await prisma.assignment.findUnique({
      where: {
        id: Number(id)
      },
      include: {
        submissions: true,
        students: {
          include: {
            user: {
              select: {
                id: true,
                email: true
              }
            }
          }
        }
      }
    });
    if (!assignment) {
      throw new ApiError(httpStatus.NOT_FOUND, 'Assignment not found');
    }
    return assignment;
  }
  if (user.role === Role.STUDENT) {
    const student = await prisma.student.findFirst({
      where: {
        user: {
          id: user.id
        }
      },
      include: {
        assignment: {
          where: {
            id: Number(id)
          },
          include: {
            submissions: {
              where: {
                student: {
                  user: {
                    id: user.id
                  }
                }
              }
            }
          }
        }
      }
    });

    if (!student || !student.assignment || student.assignment.length === 0) {
      throw new ApiError(httpStatus.NOT_FOUND, 'Assignment not found');
    }
    const submission = student.assignment[0].submissions;
    return { ...student.assignment[0], submitted: submission.length > 0 };
  }

  return null;
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
        throw new ApiError(httpStatus.NOT_FOUND, 'Assignment does not exist');
      }
    }
    throw new ApiError(
      httpStatus.INTERNAL_SERVER_ERROR,
      `Error while assigning students ${(e as Error).message}`
    );
  }
};

/**
 *  Delete assignment
 * @param id
 * @param user
 * @returns count of deleted assignments
 */
const deleteAssignment = async (id: number, user: User) => {
  const { count } = await prisma.assignment.deleteMany({
    where: {
      id: Number(id),
      isDraft: true,
      lecturer: {
        user: { id: user.id }
      }
    }
  });
  return count;
};

export default {
  createAssignmentDraft,
  getAssignments,
  updateAssignment,
  getSingleAssignment,
  assignStudentToAssignment,
  deleteAssignment
};
