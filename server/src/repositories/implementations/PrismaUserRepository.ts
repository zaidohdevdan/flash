import { prisma } from '../../lib/prisma'
import { PrismaClient, type User, type Role } from '../../generated/prisma';
import type { CreateUserDTO, IUserRepository } from '../interfaces/IUserRepository';

export class PrismaUserRepository implements IUserRepository {
    async findByEmail(email: string): Promise<User | null> {
        return prisma.user.findUnique({
            where: { email },
            include: {
                supervisor: {
                    select: {
                        name: true
                    }
                }
            }
        });
    }

    async findById(id: string): Promise<User | null> {
        return prisma.user.findUnique({
            where: { id }
        });
    }

    async findAll(filters?: { search?: string, role?: Role }): Promise<User[]> {
        const where: any = {};

        if (filters?.role) {
            where.role = filters.role;
        }

        if (filters?.search) {
            where.OR = [
                { name: { contains: filters.search, mode: 'insensitive' } },
                { email: { contains: filters.search, mode: 'insensitive' } },
            ];
        }

        return prisma.user.findMany({
            where,
            include: {
                supervisor: {
                    select: {
                        name: true
                    }
                }
            },
            orderBy: {
                name: 'asc'
            }
        });
    }

    async findAllByRole(role: Role): Promise<User[]> {
        return prisma.user.findMany({
            where: { role }
        });
    }

    async findBySupervisor(supervisorId: string): Promise<User[]> {
        return prisma.user.findMany({
            where: { supervisorId }
        });
    }

    async create(data: CreateUserDTO): Promise<User> {
        return prisma.user.create({
            data
        });
    }

    async update(id: string, data: Partial<CreateUserDTO>): Promise<User> {
        return prisma.user.update({
            where: { id },
            data
        });
    }

    async updateProfile(userId: string, data: { avatarUrl?: string, statusPhrase?: string }): Promise<User> {
        return prisma.user.update({
            where: { id: userId },
            data
        });
    }
}
