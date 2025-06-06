import { PrismaClient } from "@prisma/client";

const globalForPrisma = global as unknown as { prisma?: PrismaClient };

export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  log: ['error', 'warn'],
  // log: ['query', 'error', 'warn'],
  datasources: {
    db: {
      url: process.env.DATABASE_URL
    }
  }
});

// Handle connection cleanup
if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

// Add connection cleanup on process termination
process.on('beforeExit', async () => {
  await prisma.$disconnect();
});

// Handle cleanup on uncaught exceptions
process.on('uncaughtException', async () => {
  await prisma.$disconnect();
  process.exit(1);
});

// Handle cleanup on unhandled rejections
process.on('unhandledRejection', async () => {
  await prisma.$disconnect();
  process.exit(1);
});