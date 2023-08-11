import { describe, it, expect, jest } from '@jest/globals';
import prisma from '../../client';
import assignmentService from '../assignment.service';
import { Role } from '@prisma/client';

jest.mock('@prisma/client', () => {
  const mockPrismaClient = {
    assignment: {
      findMany: jest.fn(),
      create: jest.fn(),
      deleteMany: jest.fn(),
      update: jest.fn()
    },
    lecturer: {
      findUnique: jest.fn()
    }
  };
  return {
    PrismaClient: jest.fn().mockImplementation(() => mockPrismaClient)
  };
});

describe('Assignment Service', () => {
  const user = {
    id: 1,
    email: 'string',
    firstname: 'string',
    lastname: 'string',
    password: 'string',
    isInviteAccepted: true,
    role: 'ADMIN' as Role,
    createdAt: new Date(),
    updatedAt: new Date()
  };
  it('should return a list of assignments', async () => {
    (prisma.assignment.findMany as jest.Mock).mockResolvedValueOnce([
      {
        id: 1,
        name: 'Assignment 1',
        description: 'Assignment 1 description',
        dueDate: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
        courseId: 1
      },
      {
        id: 2,
        name: 'Assignment 2',
        description: 'Assignment 2 description',
        dueDate: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
        courseId: 2
      }
    ] as never);
    await assignmentService.getAssignments(4, 'ADMIN', {}, {});
    expect(prisma.assignment.findMany).toHaveBeenCalled();
  });

  it('should create an assignment', async () => {
    const mockAssignment = {
      title: 'string',
      description: 'string',
      deadline: Date.now(),
      userId: 1
    };
    (prisma.assignment.create as jest.Mock).mockResolvedValueOnce(mockAssignment as never);
    (prisma.lecturer.findUnique as jest.Mock).mockResolvedValueOnce({
      id: 1,
      name: 'string'
    } as never);

    await assignmentService.createAssignmentDraft(
      mockAssignment.title,
      mockAssignment.description,
      new Date(),
      mockAssignment.userId
    );

    expect(prisma.assignment.create).toHaveBeenCalled();
  });

  it('should delete assignment', async () => {
    (prisma.assignment.deleteMany as jest.Mock).mockResolvedValueOnce({ count: 1 } as never);
    await assignmentService.deleteAssignment(1, user);

    expect(prisma.assignment.deleteMany).toHaveBeenCalled();
  });
});
