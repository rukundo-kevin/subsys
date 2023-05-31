import { PrismaClient } from '@prisma/client';
import logger from '../src/config/logger';
import { encryptPassword } from '../src/utils/encryption';

const prisma = new PrismaClient();

async function main() {
  logger.info('Seeding database...');
  const userExists = await prisma.user.findFirst({
    where: {
      email: 'admin@amalitech.com'
    }
  });
  if (!userExists) {
    await prisma.user.create({
      data: {
        email: 'admin@amalitech.com',
        firstname: 'Admin',
        lastname: 'User',
        role: 'ADMIN',
        isInviteAccepted: true,
        password: await encryptPassword('Admin123')
      }
    });
  }
  logger.info('Seeding completed!');
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
