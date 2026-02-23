import { prisma } from '../../lib/prisma'
import { PrismaClient, type User, type Role } from '../../generated/prisma';
import type { CreateUserDTO, IUserRepository } from '../interfaces/IUserRepository';

export class PrismaUserRepository implements IUserRepository {
    async findByEmail(email: string): Promise<User | null> {
        return prisma.user.findUnique({
            where: { email },
            include: {
                supervisor: { select: { name: true } },
                department: { select: { name: true } }
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
                supervisor: { select: { name: true } },
                department: { select: { name: true } }
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

    async findAllByRoles(roles: Role[]): Promise<User[]> {
        return prisma.user.findMany({
            where: {
                role: { in: roles }
            },
            include: {
                department: { select: { name: true } }
            },
            orderBy: {
                name: 'asc'
            }
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

    async delete(id: string): Promise<void> {
        await prisma.$transaction(async (tx) => {
            // 1. Audit Logs
            await tx.auditLog.deleteMany({ where: { userId: id } });

            // 2. Chat Messages
            await tx.chatMessage.deleteMany({ where: { OR: [{ fromId: id }, { toId: id }] } });

            // 3. Notes
            await tx.note.deleteMany({ where: { userId: id } });

            // 4. Notifications
            await tx.notification.deleteMany({ where: { userId: id } });

            // 5. Media (Directly tied to User)
            await tx.media.deleteMany({ where: { userId: id } });

            // 6. Reports (and their history/media)
            const userReports = await tx.report.findMany({ where: { userId: id }, select: { id: true } });
            const reportIds = userReports.map(r => r.id);

            if (reportIds.length > 0) {
                await tx.reportHistory.deleteMany({ where: { reportId: { in: reportIds } } });
                await tx.media.deleteMany({ where: { reportId: { in: reportIds } } });
                await tx.report.deleteMany({ where: { userId: id } });
            }

            // 7. Agenda Events created by the user
            await tx.agendaEvent.deleteMany({ where: { createdById: id } });

            // 8. Remove from participants in AgendaEvents
            // P2014 doesn't usually happen on arrays of IDs in MongoDB Prisma, 
            // but it's good practice to clean up if needed. We'll skip it unless strictly required.

            // 9. Unlink subordinates
            await tx.user.updateMany({
                where: { supervisorId: id },
                data: { supervisorId: null }
            });

            // 10. Finally, delete the user
            await tx.user.delete({
                where: { id }
            });
        });
    }
}
