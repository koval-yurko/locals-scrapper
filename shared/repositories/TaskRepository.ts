import { PrismaClient } from './prisma/generated';

export class TaskRepository {
  private prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  async createTask(name: string) {
    return await this.prisma.task.create({
      data: {
        name,
      },
    });
  }

  async getTasks() {
    return await this.prisma.task.findMany();
  }
}
