import { Assignment } from '@prisma/client';
import prisma from '../client';

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
  deadline: Date
): Promise<Assignment> => {
  const assignmentDraft = await prisma.assignment.create({
    data: {
      title,
      description,
      deadline
    }
  });
  return assignmentDraft;
};

export default {
  createAssignmentDraft
};
