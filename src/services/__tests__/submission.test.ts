import { describe, it, expect, jest } from '@jest/globals';
import prisma from '../../client';
import submissionService from '../submission.service';

jest.mock('@prisma/client', () => {
  const mockPrismaClient = {
    submission: {
      findMany: jest.fn(),
      create: jest.fn(),
      deleteMany: jest.fn(),
      update: jest.fn()
    },
    lecturer: {
      findUnique: jest.fn()
    },
    student: {
      findUnique: jest.fn()
    }
  };
  return {
    PrismaClient: jest.fn().mockImplementation(() => mockPrismaClient)
  };
});
describe('Submission Service', () => {
  it('should create a submission', async () => {
    const mockSubmission = {
      userId: 9,
      assignmentCode: 'string',
      head: 'string',
      submissionCode: 'string'
    };

    (prisma.student.findUnique as jest.Mock).mockResolvedValueOnce({
      id: 9,
      firstname: 'string',
      assignment: [
        {
          id: 3
        }
      ]
    } as never);

    (prisma.submission.create as jest.Mock).mockResolvedValueOnce(mockSubmission as never);

    const result = await submissionService.makeSubmission(
      mockSubmission.userId,
      mockSubmission.assignmentCode,
      mockSubmission.head,
      mockSubmission.submissionCode
    );

    expect(result).toEqual(mockSubmission);
  });

  it('should get all submissions', async () => {
    const mockSubmission = [
      {
        userId: 9,
        assignmentCode: 'string',
        head: 'string',
        submissionCode: 'string'
      }
    ];

    (prisma.submission.findMany as jest.Mock).mockResolvedValueOnce(mockSubmission as never);

    const result = await submissionService.getSubmissions({}, {});

    expect(result).toEqual(mockSubmission);
  });

  it('should get student submissions', async () => {
    const mockSubmission = [
      {
        userId: 9,
        assignmentCode: 'string',
        head: 'string',
        submissionCode: 'string'
      }
    ];

    (prisma.submission.findMany as jest.Mock).mockResolvedValueOnce(mockSubmission as never);

    const result = await submissionService.getStudentSubmission('st213', {}, 'sdf');

    expect(result).toEqual(mockSubmission);
  });

  it('should get lecturer submissions', async () => {
    const mockSubmission = [
      {
        userId: 9,
        assignmentCode: 'string',
        head: 'string',
        submissionCode: 'string'
      }
    ];

    (prisma.submission.findMany as jest.Mock).mockResolvedValueOnce(mockSubmission as never);

    const result = await submissionService.getSubmissionLecturer('st213', {}, 'sdf');

    expect(result).toEqual(mockSubmission);
  });

  it('should get submission group by lecturer', async () => {
    const mockSubmission = [
      {
        userId: 9,
        assignmentCode: 'string',
        head: 'string',
        submissionCode: 'string',
        assignment: {
          lecturer: {
            id: 9
          }
        }
      }
    ];

    (prisma.submission.findMany as jest.Mock).mockResolvedValueOnce(mockSubmission as never);
    (prisma.lecturer.findUnique as jest.Mock).mockResolvedValueOnce({
      id: 9,
      firstname: 'string'
    } as never);

    await submissionService.getSubmissionGroupedByLecturer();
    expect(prisma.submission.findMany).toHaveBeenCalled();
  });
});
