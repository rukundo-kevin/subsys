import { Role, Submission } from '@prisma/client';
import prisma from '../client';
import { generateId } from '../utils/userHelper';

/**
 *
 * @param {number} userId
 * @param {string} assignmentCode
 * @returns {Promise<Submission>}
 */
const makeSubmission = async (userId: number, assignmentCode: string): Promise<Submission> => {
  const student = await prisma.student.findUnique({ where: { userId } });
  if (!student) {
    throw new Error('Student does not exist');
  }
  const assignment = await prisma.assignment.findUnique({ where: { assignmentCode } });
  if (!assignment) {
    throw new Error('Assignment does not exist');
  }
  const submissionCode = generateId('SUB');
  const submission = await prisma.submission.create({
    data: {
      assignmentId: assignment.id,
      studentId: student.id,
      submissionCode
    }
  });
  return submission;
};

/**
 *
 * @param userId The id of the user
 * @param role Role of the user
 * @param assignmentCode Code of the assignment to get submissions for
 */

const getSubmissions = async (
  userId: number,
  role: Role,
  assignmentCode: string
): Promise<void | Submission[]> => {
  if (role === Role.STUDENT) {
    const student = await prisma.student.findUnique({ where: { userId } });
    if (!student) {
      throw new Error('Student does not exist');
    }
    const assignment = await prisma.assignment.findUnique({ where: { assignmentCode } });
    if (!assignment) {
      throw new Error('Assignment does not exist');
    }

    const submission = await prisma.submission.findMany({
      where: {
        studentId: student.id,
        assignmentId: assignment.id
      }
    });
    return submission;
  }
};

const createSnapshot = async (
  assignmentCode: string,
  submissionCode: string,
  snapshotName: string,
  snapshotFiles: string
) => {};
export default { makeSubmission, getSubmissions, createSnapshot };
