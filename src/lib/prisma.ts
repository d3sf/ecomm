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

// Single cleanup function
const cleanup = async () => {
  await prisma.$disconnect();
};

// Add event listeners only if they haven't been added before
if (!process.listeners('beforeExit').includes(cleanup)) {
  process.on('beforeExit', cleanup);
}

if (!process.listeners('uncaughtException').includes(cleanup)) {
  process.on('uncaughtException', async () => {
    await cleanup();
    process.exit(1);
  });
}

if (!process.listeners('unhandledRejection').includes(cleanup)) {
  process.on('unhandledRejection', async () => {
    await cleanup();
    process.exit(1);
  });
}

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