// lib/db.ts
import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? [] : ['error'], // Supprime les logs en dev sauf erreur
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db;
