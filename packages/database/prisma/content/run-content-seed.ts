/** Production-safe entry point: seeds only the immersion learning content (no demo users). */
import { PrismaClient } from '@prisma/client';
import { seedContent } from './seed-content';

const prisma = new PrismaClient();

seedContent(prisma)
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
