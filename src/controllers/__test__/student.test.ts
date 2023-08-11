import httpStatus from 'http-status';
import { Request, Response, NextFunction } from 'express';
import supertest from 'supertest';
import { jest, describe, it, expect } from '@jest/globals';
import catchAsync from '../../utils/catchAsync';
import { studentService } from '../../services';
import studentController from '../student.controller';

const { createStudent } = studentController;
jest.mock('../../services/student.service');

describe('Student Controller', () => {
  describe('Create Student', () => {
    it('should create a student and send a response', async () => {
      const req = {
        body: {
          firstname: 'John',
          lastname: 'Doe',
          email: 'john.doe@example.com'
        }
      } as Request;
      const res = {
        status: jest.fn().mockReturnThis(),
        send: jest.fn()
      } as unknown as Response<any, Record<string, any>>;

      const next = jest.fn() as NextFunction;

      const mockCreatedStudent = {
        id: 1,
        firstname: 'John',
        lastname: 'Doe',
        email: 'john.doe@example.com'
      };
      (studentService.createStudent as jest.Mock).mockResolvedValue(mockCreatedStudent as never);

      await createStudent(req, res, next);

      expect(studentService.createStudent).toHaveBeenCalledWith(
        req.body.email,
        req.body.firstname,
        req.body.lastname
      );
      expect(res.status).toHaveBeenCalledWith(httpStatus.CREATED);
      expect(res.send).toHaveBeenCalledWith(mockCreatedStudent);
      expect(next).not.toHaveBeenCalled();
    });
  });
  describe('Get Student', () => {
    it('should return all students when no query parameters are provided', async () => {
      const req = { query: {} } as Request;
      const res = {
        status: jest.fn().mockReturnThis(),
        send: jest.fn()
      } as unknown as Response<any, Record<string, any>>;
      const next = jest.fn() as NextFunction;

      const mockStudents = [
        {
          id: 1,
          firstname: 'John',
          lastname: 'Doe',
          email: 'john@gmail.com',
          createdAt: '2021-08-01T00:00:00.000Z',
          updatedAt: '2021-08-01T00:00:00.000Z'
        },
        {
          id: 2,
          firstname: 'Jane',
          lastname: 'Doe',
          email: 'jane@gmail.com',
          createdAt: '2021-08-01T00:00:00.000Z',
          updatedAt: '2021-08-01T00:00:00.000Z'
        }
      ];

      (studentService.getStudents as jest.Mock).mockResolvedValue(mockStudents as never);

      await studentController.getStudents(req, res, next);

      expect(studentService.getStudents).toHaveBeenCalledWith();
      expect(res.status).toHaveBeenCalledWith(httpStatus.OK);
      expect(res.send).toHaveBeenCalledWith(mockStudents);
      expect(next).not.toHaveBeenCalled();
    });
  });
});
