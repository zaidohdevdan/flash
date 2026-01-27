import {prisma} from '../../lib/prisma'
import { type Report, type ReportStatus, type User } from '../../generated/prisma';
import type { CreateReportDTO, IReportRepository, ReportWithUser } from '../interfaces/IReportRepository';

export class PrismaReportRepository implements IReportRepository {
    async create({ comment, userId, imageUrl }: CreateReportDTO): Promise<ReportWithUser> {
        return prisma.report.create({
            data: {
                comment,
                imageUrl: imageUrl || '',
                userId,
                status: 'SENT',
                history: {
                    create: {
                        status: 'SENT',
                        comment: 'Relatório enviado pelo profissional.',
                        userName: 'Operador'
                    }
                }
            },
            include: {
                user: {
                    select: {
                        name: true,
                        supervisorId: true,
                        avatarUrl: true,
                        statusPhrase: true,
                    },
                },
                history: true
            },
        });
    }

    async findById(id: string): Promise<Report | null> {
        return prisma.report.findUnique({
            where: { id },
            include: {
                history: {
                    orderBy: { createdAt: 'desc' }
                }
            }
        });
    }

    async updateStatus(id: string, status: ReportStatus, feedback?: string, userName?: string, departmentId?: string): Promise<Report> {
        return prisma.report.update({
            where: { id },
            data: {
                status,
                feedback,
                feedbackAt: feedback ? new Date() : undefined,
                departmentId,
                history: {
                    create: {
                        status,
                        comment: feedback,
                        userName: userName || 'Sistema'
                    }
                }
            },
            include: { user: true, history: true, department: true },
        });
    }

    async findStatsBySupervisor(supervisorId: string): Promise<{ status: string, _count: number }[]> {
        const stats = await prisma.report.groupBy({
            by: ['status'],
            where: {
                user: {
                    supervisorId: supervisorId
                }
            },
            _count: true
        });

        return stats.map(item => ({
            status: item.status,
            _count: item._count
        }));
    }

    async findAll(supervisorId: string, page: number = 1, limit: number = 10, status?: ReportStatus, startDate?: Date, endDate?: Date): Promise<ReportWithUser[]> {
        const skip = (page - 1) * limit;

        return prisma.report.findMany({
            where: {
                user: {
                    supervisorId: supervisorId
                },
                status: status,
                createdAt: {
                    gte: startDate,
                    lte: endDate
                }
            },
            include: {
                user: {
                    select: {
                        name: true,
                        supervisorId: true,
                        avatarUrl: true,
                        statusPhrase: true,
                    }
                },
                history: {
                    orderBy: { createdAt: 'desc' }
                },
                department: true
            },
            orderBy: {
                createdAt: 'desc'
            },
            skip,
            take: limit
        });
    }

    async findByUserId(userId: string, page: number = 1, limit: number = 10, status?: ReportStatus, startDate?: Date, endDate?: Date): Promise<ReportWithUser[]> {
        const skip = (page - 1) * limit;

        return prisma.report.findMany({
            where: {
                userId,
                status: status,
                createdAt: {
                    gte: startDate,
                    lte: endDate
                }
            },
            include: {
                user: {
                    select: {
                        name: true,
                        supervisorId: true,
                        avatarUrl: true,
                        statusPhrase: true,
                    }
                },
                history: {
                    orderBy: { createdAt: 'desc' }
                },
                department: true
            },
            orderBy: {
                createdAt: 'desc'
            },
            skip,
            take: limit
        });
    }
}
