// lib/db.ts

import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  db: PrismaClient | undefined;
};

export const db =
  globalForPrisma.db ??
  new PrismaClient({
    log:
      process.env.NODE_ENV === 'development'
        ? ['query', 'error', 'warn']
        : ['error'],
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.db = db;
