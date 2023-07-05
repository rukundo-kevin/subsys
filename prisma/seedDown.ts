import { PrismaClient } from '@prisma/client';
import logger from '../src/config/logger';

const prisma = new PrismaClient();

export async function seedDown() {
  logger.info('Seeding Down database...');
  await prisma.user.deleteMany({
    where: {
      email: {
        in: ['admin@amalitech.com','admintest@amalitech.org', 'student@amalitech.org', 'lecturer@amalitech.org']
      }
    }
  });
  logger.info('Seeding Down completed!');
}
