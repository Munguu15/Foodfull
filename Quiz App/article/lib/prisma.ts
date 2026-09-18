import { PrismaClient } from "@prisma/client";

const CLIENT_VERSION = "quiz-v2";

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
  prismaVersion?: string;
};

export const prisma =
  globalForPrisma.prismaVersion === CLIENT_VERSION && globalForPrisma.prisma
    ? globalForPrisma.prisma
    : new PrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
  globalForPrisma.prismaVersion = CLIENT_VERSION;
}
