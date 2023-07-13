import { Prisma, Role, Submission } from '@prisma/client';
import prisma from '../client';
import ApiError from '../utils/ApiError';
import httpStatus from 'http-status';

/**
 *
 * @param {number} userId
 * @param {string} assignmentCode
 * @returns {Promise<Submission>}
 */
const makeSubmission = async (
  userId: number,
  assignmentCode: string,
  head: string,
  submissionCode: string
): Promise<Submission> => {
  const student = await prisma.student.findUnique({
    where: { userId },
    include: {
      assignment: {
        select: {
          id: true,
          assignmentCode: true
        },
        where: {
          assignmentCode
        }
      }
    }
  });

  if (!student) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Assignment does not exist ');
  }

  const submission = await prisma.submission.create({
    data: {
      assignmentId: student.assignment[0].id,
      studentId: student.id,
      submissionCode,
      head
    },
    include: {
      assignment: {
        select: {
          id: true,
          assignmentCode: true
        }
      },
      student: {
        select: {
          id: true,
          studentId: true
        }
      }
    }
  });
  return submission;
};

/**
 *
 * @param role - Role of the user
 * @param  {SubmissionWhereInput} filter - for the submission
 */

const getSubmissions = async (
  role: Role,
  filter: Prisma.SubmissionWhereInput
): Promise<void | Submission[]> => {
  if (role === Role.STUDENT) {
    const submission = await prisma.submission.findMany({
      where: {
        ...filter
      },
      include: {
        assignment: {
          select: {
            id: true,
            assignmentCode: true
          }
        },
        student: {
          select: {
            id: true,
            studentId: true
          }
        },
        snapshots: true
      }
    });
    return submission;
  }
};

/**
 *
 * @param userId The user Id
 * @param submissionCode The code for submission
 * @param head The head for the submission
 * @returns {Promise<Submission>}
 */
const updateSubmission = async (
  userId: number,
  submissionCode: string,
  head: string
): Promise<Submission> => {
  const student = await prisma.student.findUnique({ where: { userId } });
  if (!student) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Student does not exist');
  }

  const submission = await prisma.submission.update({
    where: {
      submissionCode
    },
    data: {
      head
    }
  });

  return submission;
};

/**
 *
 * @param submissionCode The code for submission
 * @param snapshotName The name for the snapshot
 * @param snapshotFiles The files for the snapshot
 */
const createSnapshot = async (submissionCode: string, snapshotName: string) => {
  try {
    const submission = await prisma.submission.findFirst({
      where: {
        submissionCode
      }
    });
    if (!submission) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Submission not found');
    }
    const snapshot = await prisma.snapshot.create({
      data: {
        submissionId: submission.id,
        snapshotName
      }
    });

    return snapshot;
  } catch (error) {
    if ((error as Prisma.PrismaClientKnownRequestError).code === 'P2002') {
      throw new ApiError(httpStatus.BAD_REQUEST, `Snapshot already exists`);
    }
  }
};

export default { makeSubmission, getSubmissions, updateSubmission, createSnapshot };
