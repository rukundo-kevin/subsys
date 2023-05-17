import { PrismaClient } from '@prisma/client';
import logger from '../src/config/logger';
import { encryptPassword } from '../src/utils/encryption';

const prisma = new PrismaClient();

async function main() {
  await prisma.user.create({
    data: {
      email: 'admin@amalitech.com',
      name: 'Admin',
      role: 'ADMIN',
      isEmailVerified: true,
      password: await encryptPassword('admin123')
    }
  });
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
