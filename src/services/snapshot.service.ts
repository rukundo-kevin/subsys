import { Prisma, Snapshot } from '@prisma/client';
import prisma from '../client';
import ApiError from '../utils/ApiError';
import httpStatus from 'http-status';

/**
 * Create a snapshot for a submission
 * @param submissionCode The code for submission
 * @param snapshotName The name for the snapshot
 * @param snapshotFiles The files for the snapshot
 */
const createSnapshot = async (
  submissionCode: string,
  snapshotPath: string,
  snapshotName: string
): Promise<Prisma.SnapshotCreateWithoutSubmissionInput | void> => {
  try {
    const submission = await prisma.submission.findFirst({
      where: {
        submissionCode
      }
    });
    if (!submission) {
      throw new ApiError(httpStatus.NOT_FOUND, 'Submission not found');
    }
    const snapshot = await prisma.snapshot.create({
      data: {
        submissionId: submission.id,
        snapshotName,
        snapshotPath
      }
    });

    return snapshot;
  } catch (error) {
    if ((error as Prisma.PrismaClientKnownRequestError).code === 'P2002') {
      throw new ApiError(httpStatus.BAD_REQUEST, `Snapshot already exists`);
    }
  }
};

/**
 * Get all snapshots for a submission
 * @param submissionCode
 * @returns {Promise<Snapshot[]>}
 */
const getSnapshots = async (filter: Prisma.SnapshotWhereInput): Promise<Snapshot[]> => {
  const snapshots = await prisma.snapshot.findMany({
    where: {
      ...filter
    }
  });

  return snapshots;
};

export default {
  createSnapshot,
  getSnapshots
};
