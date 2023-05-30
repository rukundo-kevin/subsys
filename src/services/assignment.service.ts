import { Assignment } from '@prisma/client';
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

export default {
  createAssignmentDraft
};
