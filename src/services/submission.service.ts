import { Prisma, Snapshot, Submission } from '@prisma/client';
import prisma from '../client';
import ApiError from '../utils/ApiError';
import httpStatus from 'http-status';

type GetSubmission = Prisma.SubmissionGetPayload<{
  include: {
    assignment: {
      select: {
        id: true;
        assignmentCode: true;
        lecturer: {
          select: {
            id: true;
            staffId: true;
            user: {
              select: {
                id: true;
                email: true;
              };
            };
          };
        };
      };
    };
    student: {
      include: {
        user: {
          select: {
            id: true;
            email: true;
          };
        };
      };
    };
    snapshots: {
      select: {
        id: true;
        snapshotName: true;
        snapshotPath: true;
        createdAt: true;
      };
    };
  };
}>;

/**
 * Create a submission for an assignment
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
    throw new ApiError(httpStatus.NOT_FOUND, 'Assignment does not exist ');
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
  filter: Prisma.SubmissionWhereInput,
  options: {
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }
): Promise<GetSubmission[]> => {
  const sortBy = options.sortBy;
  const sortOrder = options.sortOrder ?? 'desc';
  const submission = await prisma.submission.findMany({
    where: {
      ...filter
    },
    orderBy: sortBy ? { [sortBy]: sortOrder } : undefined,
    include: {
      assignment: {
        select: {
          id: true,
          assignmentCode: true,
          lecturer: {
            select: {
              id: true,
              staffId: true,
              user: {
                select: {
                  id: true,
                  email: true,
                  firstname: true,
                  lastname: true
                }
              }
            }
          }
        }
      },
      student: {
        include: {
          user: {
            select: {
              id: true,
              email: true,
              firstname: true,
              lastname: true
            }
          }
        }
      },
      snapshots: {
        orderBy: {
          createdAt: 'desc'
        }
      }
    }
  });
  return submission;
};
/**
 * Get Submission for the student
 * @param studentId - Student Id
 * @param options - Sorting options
 * @param assignmentCode -Submission for assignment with assignmentCode
 * @returns
 */
const getStudentSubmission = async (
  studentId: string,
  options: {
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  },
  assignmentCode?: string
): Promise<GetSubmission[]> => {
  const filter = {
    assignment: {
      assignmentCode
    },
    student: {
      studentId
    }
  };
  const submissions = await getSubmissions(filter, options);
  return submissions;
};

/**
 * Get Submission for lecturer assignments
 * @param staffId - Stadd Id of the lecturer
 * @param options - Sorting options
 * @param assignmentCode -Submission for assignment with assignmentCode
 * @returns
 */
const getSubmissionLecturer = async (
  staffId: string,
  options: {
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  },
  assignmentCode?: string
): Promise<GetSubmission[]> => {
  const filter: Prisma.SubmissionWhereInput = {
    assignment: {
      assignmentCode,
      lecturer: {
        staffId
      }
    }
  };
  const submissions = await getSubmissions(filter, options);
  return submissions;
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
): Promise<Prisma.SubmissionUpdateInput> => {
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

export default {
  makeSubmission,
  getSubmissions,
  getStudentSubmission,
  getSubmissionLecturer,
  updateSubmission
};
