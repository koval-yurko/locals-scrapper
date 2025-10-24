import { withAccelerate } from '@prisma/extension-accelerate';
import { PrismaClient } from './generated';

let prisma: PrismaClient;

export const createPrismaClient = () => {
    if (!prisma) {
        prisma = new PrismaClient();
        prisma.$extends(withAccelerate());
    }
    return prisma;
}
