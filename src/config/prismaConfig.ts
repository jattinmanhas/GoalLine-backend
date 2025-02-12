import { PrismaClient } from '@prisma/client';

// Instantiate Prisma Client
const prisma = new PrismaClient();

// Export Prisma Client
export default prisma;

// Optionally, handle graceful shutdown
if (process.env.NODE_ENV === 'development') {
  prisma.$connect(); // Connect explicitly in development
}

// Handle cleanup on exit
process.on('SIGINT', async () => {
  await prisma.$disconnect();
  process.exit(0);
});