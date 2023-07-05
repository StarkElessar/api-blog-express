import { PrismaClient, User, UserPayload } from '@prisma/client';

const prisma = new PrismaClient();

export { prisma, User, UserPayload };
