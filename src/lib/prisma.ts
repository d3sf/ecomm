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

// Single cleanup function that handles all cases
const cleanup = async () => {
  await prisma.$disconnect();
};

// Remove any existing listeners first
['beforeExit', 'SIGTERM', 'SIGINT', 'uncaughtException', 'unhandledRejection'].forEach(event => {
  process.removeAllListeners(event);
});

// Add single listener for each event
process.once('beforeExit', cleanup);
process.once('SIGTERM', cleanup);
process.once('SIGINT', cleanup);
process.once('uncaughtException', async (error) => {
  await cleanup();
  process.exit(1);
});
process.once('unhandledRejection', async (error) => {
  await cleanup();
  process.exit(1);
});

// Cleanup function for Next.js development mode
if (process.env.NODE_ENV === 'development') {
  const cleanupDev = async () => {
    await cleanup();
    process.removeListener('beforeExit', cleanup);
    process.removeListener('uncaughtException', cleanup);
    process.removeListener('unhandledRejection', cleanup);
  };

  process.on('SIGTERM', cleanupDev);
  process.on('SIGINT', cleanupDev);
}