import { PrismaClient } from '@prisma/client';
import logger from '../src/config/logger';

import { encryptPassword } from '../src/utils/encryption';
import { seedDown } from './seedDown';

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
        password: await encryptPassword('Admin123')
      },
      {
        email: 'lecturer@amalitech.org',
        firstname: 'Lecturer',
        lastname: 'User',
        role: 'LECTURER',
        isInviteAccepted: true,
        password: await encryptPassword('Lecturer123')
      },
      {
        email: 'student@amalitech.org',
        firstname: 'Student',
        lastname: 'User',
        role: 'STUDENT',
        isInviteAccepted: true,
        password: await encryptPassword('Student123')
      }
    ],
    skipDuplicates: true
  });

  await prisma.lecturer.create({
    data: {
      staffId: 'LC000112',
      user: {
        connect: {
          email: 'lecturer@amalitech.org'
        }
      }
    }
  });

  await prisma.student.create({
    data: {
      studentId: 'ST000112',
      user: {
        connect: {
          email: 'student@amalitech.org'
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
