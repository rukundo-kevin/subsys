import prisma from '../client';
import { Strategy as JwtStrategy, ExtractJwt, VerifyCallback } from 'passport-jwt';
import config from './config';
import { TokenType } from '@prisma/client';

const jwtOptions = {
  secretOrKey: config.jwt.secret,
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken()
};

const jwtVerify: VerifyCallback = async (payload, done) => {
  try {
    if (payload.type !== TokenType.ACCESS) {
      throw new Error('Invalid token type');
    }
    const user = await prisma.user.findUnique({
      select: {
        id: true,
        email: true,
        firstname: true,
        lastname: true,
        role: true
      },
      where: { id: payload.sub }
    });
    if (!user) {
      return done(null, false);
    }
    if (user.role === 'STUDENT') {
      const student = await prisma.student.findUnique({
        where: {
          userId: user.id
        }
      });
      const studentUser = {
        ...user,
        studentId: student?.studentId
      };

      return done(null, studentUser);
    }
    if (user.role === 'LECTURER') {
      const lecturer = await prisma.lecturer.findUnique({
        where: {
          userId: user.id
        }
      });

      const lecturerUser = {
        ...user,
        staffId: lecturer?.staffId
      };
      done(null, lecturerUser);
    }
    done(null, user);
  } catch (error) {
    done(error, false);
  }
};

export const jwtStrategy = new JwtStrategy(jwtOptions, jwtVerify);
