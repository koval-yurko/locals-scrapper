import { PrismaClient } from './prisma/generated';

export type CreateUserInput = {
  localsId: string;
  firstName: string;
  lastName: string;
  username: string;
  age: number;
  gender: string;
  description: string;
  occupation: string;
  country: string;
  city: string;
  height?: number;
  shareLink?: string;
  instagramUsername?: string;
  linkedinLink?: string;
  avatarPicture: string;
  photos?: { id: number; src: string }[];
};

export type GetUserInput = {
  id: number;
};

export type GetUsersInput = {
  skip: number;
  take: number;
  orderBy?: any;
  where?: any;
};

export type VoteUserInput = {
  id: number;
  vote: number;
};

export class UserRepository {
  private prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  async createUser(userInput: CreateUserInput) {
    const res = await this.prisma.user.create({
      data: userInput,
    });
    return res;
  }

  async getUser(usersInput: GetUserInput) {
    const res = await this.prisma.user.findUnique({
      where: {
        id: usersInput.id,
      },
    });
    return res;
  }

  async getUsers(usersInput: GetUsersInput) {
    const res = await this.prisma.user.findMany({
      skip: usersInput.skip,
      take: usersInput.take,
      orderBy: usersInput.orderBy,
      where: usersInput.where,
    });
    return res;
  }

  async getUsersCount(usersInput: GetUsersInput) {
    const res = await this.prisma.user.count({
      where: usersInput.where,
    });
    return res;
  }

  async voteUser(usersInput: VoteUserInput) {
    const res = await this.prisma.user.update({
      where: {
        id: usersInput.id,
      },
      data: {
        votes: usersInput.vote,
      },
    });
    return res;
  }
}
