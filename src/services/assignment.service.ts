import { Assignment, Role, Prisma } from '@prisma/client';
import prisma from '../client';
import ApiError from '../utils/ApiError';
import httpStatus from 'http-status';
import { number } from 'joi';

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
      assignmentCode: '',
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

const updateAssignment = async (id: number, assignmentBody: any): Promise<Assignment | null> => {
  try {
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
 * @param userId
 * @param role
 * @returns {Promise<Assignment[] | void>} List of Assignments
 */
const getAssignments = async (userId: number, role: Role): Promise<Assignment[] | void> => {
  if (role === 'ADMIN') {
    const assignments = await prisma.assignment.findMany({
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
        lecturerId: lecturer.id
      },
      include: {
        lecturer: {
          select: {
            id: true,
            staffId: true
          }
        }
      }
    });

    return assignments;
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

const getOneAssignment=async(id:number):Promise<Assignment | null>=>{
  const assignment=await prisma.assignment.findUnique({
    where:{
      id:Number(id)
    }
  });
  if(!assignment){
    throw new ApiError(httpStatus.BAD_REQUEST, 'Assignment does not exist');
  }
  return assignment;
}

const assignStudentToAssignment=async(assignmetId:number,studentIds:number[]): Promise<Assignment | null>=>{
  try{
    const assigned=await prisma.assignment.update({
      where:{
        id:assignmetId
      },
      data:{
        students:{
          connect:studentIds.map((id) => ({ id }))
        }
      },
      include: {
        students: true,
      },
    })
    return assigned
  }catch(e:any){
    if (e instanceof Prisma.PrismaClientKnownRequestError) {
      if (e.code === 'P2025') {
        throw new ApiError(httpStatus.BAD_REQUEST, 'Assignment does not exist');
      }
    }
    throw new ApiError(httpStatus.BAD_REQUEST,`Error while assigning students ${(e as Error).message}`)
  }
}

export default {
  createAssignmentDraft,
  getAssignments,
  updateAssignment,
  getAssignmentById,
  getOneAssignment,
  assignStudentToAssignment
};
