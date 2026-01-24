import { PrismaClient, type User } from '../../generated/prisma';
import type { IUserRepository } from '../interfaces/IUserRepository';

const prisma = new PrismaClient();

export class PrismaUserRepository implements IUserRepository {
    async findByEmail(email: string): Promise<User | null> {
        return prisma.user.findUnique({
            where: { email }
        });
    }

    async findById(id: string): Promise<User | null> {
        return prisma.user.findUnique({
            where: { id }
        });
    }
}
