/*eslint-disable*/

import { PrismaClient } from '@prisma/client';
import logger from '../src/config/logger';
import config from '../src/config/config';
import { encryptPassword } from '../src/utils/encryption';
import { seedDown } from './seedDown';
import { generateAssignmentCode } from '../src/utils/assignmentHelper';

const prisma = new PrismaClient();

async function main() {
  logger.info('Seeding database...');
  await seedDown();
  await prisma.user.createMany({
    data: [
      {
        email: 'admin@amalitech.com',
        firstname: 'Admin',
        lastname: 'User',
        role: 'ADMIN',
        isInviteAccepted: true,
<<<<<<< HEAD
        password: await encryptPassword(config.seedPassword)
=======
        password: await encryptPassword('Password@123')
>>>>>>> a6daaaf (feat(submission-notification): create task scheduler)
      },
      {
        email: 'admintest@amalitech.org',
        firstname: 'Admin',
        lastname: 'Test',
        role: 'ADMIN',
        isInviteAccepted: true,
        password: await encryptPassword('Admin@123')
      },
      {
        email: 'lecturer@amalitech.org',
        firstname: 'Lecturer',
        lastname: 'User',
        role: 'LECTURER',
        isInviteAccepted: true,
<<<<<<< HEAD
        password: await encryptPassword(config.seedPassword)
=======
        password: await encryptPassword('Password')
>>>>>>> a6daaaf (feat(submission-notification): create task scheduler)
      },
      {
        email: 'student@amalitech.org',
        firstname: 'Student',
        lastname: 'User',
        role: 'STUDENT',
        isInviteAccepted: true,
<<<<<<< HEAD
        password: await encryptPassword(config.seedPassword)
=======
        password: await encryptPassword('Password')
>>>>>>> a6daaaf (feat(submission-notification): create task scheduler)
      }
    ],
    skipDuplicates: true
  });

  const lecturer = await prisma.lecturer.create({
    data: {
      staffId: 'LC000112',
      user: {
        connect: {
          email: 'lecturer@amalitech.org'
        }
      }
    }
  });

  const student = await prisma.student.create({
    data: {
      studentId: 'ST000112',
      user: {
        connect: {
          email: 'student@amalitech.org'
        }
      }
    }
  });

  const currentDate = new Date();
  const newDate = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth() + 1,
    currentDate.getDate()
  );
  const assignmentCode = generateAssignmentCode();
  await prisma.assignment.createMany({
    data: [
      {
        title: 'Test Assignment 1',
        description: 'Test Assignment 1 description',
        deadline: newDate,
        isDraft: false,
        assignmentCode: assignmentCode,
        lecturerId: lecturer!.id
      },
      {
        title: 'Test Assignment 2',
        description: 'Test Assignment 2 description',
        deadline: newDate,
        isDraft: false,
        assignmentCode: generateAssignmentCode(),
        lecturerId: lecturer!.id
      }
    ]
  });

  const singleAssignment = await prisma.assignment.findUnique({
    where: {
      assignmentCode: assignmentCode
    }
  });

  await prisma.assignment.update({
    where: {
      id: singleAssignment!.id
    },
    data: {
      students: {
        connect: {
          id: student!.id
        }
      }
    }
  });

  logger.info('Seeding Up completed!');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    logger.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
