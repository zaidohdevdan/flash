import { prisma } from '../../lib/prisma'
import { type Report, type ReportStatus, type User } from '../../generated/prisma';
import type { CreateReportDTO, IReportRepository, ReportWithUser } from '../interfaces/IReportRepository';

export class PrismaReportRepository implements IReportRepository {
    async create({ comment, userId, imageUrl, latitude, longitude }: CreateReportDTO): Promise<ReportWithUser> {
        const user = await prisma.user.findUnique({ where: { id: userId }, select: { name: true } });
        const userName = user?.name || 'Operador';

        return prisma.report.create({
            data: {
                comment,
                imageUrl: imageUrl || '',
                userId,
                latitude,
                longitude,
                status: 'SENT',
                history: {
                    create: {
                        status: 'SENT',
                        comment: 'Relatório enviado pelo profissional.',
                        userName: userName
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

    async findById(id: string): Promise<ReportWithUser | null> {
        return prisma.report.findUnique({
            where: { id },
            include: {
                user: {
                    select: {
                        name: true,
                        supervisorId: true,
                        avatarUrl: true,
                        statusPhrase: true,
                    },
                },
                history: {
                    orderBy: { createdAt: 'desc' },
                },
                department: true
            },
        }) as Promise<ReportWithUser | null>;
    }

    async updateStatus(id: string, status: ReportStatus, feedback?: string, userName?: string, departmentId?: string): Promise<Report> {
        let departmentName: string | null = null;
        if (departmentId) {
            const dept = await prisma.department.findUnique({ where: { id: departmentId } });
            departmentName = dept?.name || null;
        }

        const updateData: any = {
            status,
            feedback,
            feedbackAt: feedback ? new Date() : undefined,
            history: {
                create: {
                    status,
                    comment: feedback,
                    userName: userName || 'Sistema',
                    departmentName
                }
            }
        };

        // Só altera o departamento se for explicitamente passado (inclusive se for "" -> null)
        if (departmentId !== undefined) {
            updateData.departmentId = departmentId || null;
        }

        return prisma.report.update({
            where: { id },
            data: updateData,
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

        const where: any = {
            user: {
                supervisorId: supervisorId
            }
        };

        // Se um status específico for passado, filtra por ele.
        // Se NÃO for passado (filtro "Todos"), não aplica restrição de status.
        if (status) {
            where.status = status;
        }

        if (startDate || endDate) {
            where.createdAt = {};
            if (startDate) where.createdAt.gte = startDate;
            if (endDate) {
                const end = new Date(endDate);
                end.setUTCHours(23, 59, 59, 999);
                where.createdAt.lte = end;
            }
        }

        return prisma.report.findMany({
            where,
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

        const where: any = {
            userId,
            status: status,
        };

        if (startDate || endDate) {
            where.createdAt = {};
            if (startDate) where.createdAt.gte = startDate;
            if (endDate) {
                const end = new Date(endDate);
                end.setUTCHours(23, 59, 59, 999);
                where.createdAt.lte = end;
            }
        }

        return prisma.report.findMany({
            where,
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

    async findByDepartment(departmentId: string, page: number = 1, limit: number = 10, status?: ReportStatus, startDate?: Date, endDate?: Date): Promise<ReportWithUser[]> {
        const skip = (page - 1) * limit;

        const where: any = {
            departmentId,
            status: status,
        };

        if (startDate || endDate) {
            where.createdAt = {};
            if (startDate) where.createdAt.gte = startDate;
            if (endDate) {
                const end = new Date(endDate);
                end.setUTCHours(23, 59, 59, 999);
                where.createdAt.lte = end;
            }
        }

        return prisma.report.findMany({
            where,
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

    async findStatsByDepartment(departmentId: string): Promise<{ status: string, _count: number }[]> {
        const stats = await prisma.report.groupBy({
            by: ['status'],
            where: {
                departmentId
            },
            _count: true
        });

        return stats.map(item => ({
            status: item.status,
            _count: item._count
        }));
    }

    async getAdvancedStats(userId: string, role: string): Promise<any> {
        // 1. Define o escopo da busca baseado na role
        let where: any = {};
        if (role === 'SUPERVISOR') {
            where.user = { supervisorId: userId };
        } else if (role === 'MANAGER') {
            const user = await prisma.user.findUnique({ where: { id: userId } });
            if (user?.departmentId) where.departmentId = user.departmentId;
        }

        // Busca reports e histórico para cálculos
        const reports = await prisma.report.findMany({
            where,
            include: {
                history: { orderBy: { createdAt: 'asc' } },
                department: true
            }
        });

        // 2. Cálculos
        let totalResolutionTime = 0;
        let resolvedCount = 0;
        let bottleneckSum = 0;
        let bottleneckCount = 0;
        const volumeByDate: Record<string, number> = {};
        const sectorPerf: Record<string, { resolved: number, forwarded: number }> = {};

        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        reports.forEach(report => {
            // Volume Trend (Last 30 days)
            if (report.createdAt >= thirtyDaysAgo) {
                const dateKey = report.createdAt.toISOString().split('T')[0] ?? '';
                if (dateKey) {
                    volumeByDate[dateKey] = (volumeByDate[dateKey] || 0) + 1;
                }
            }

            // Sector Performance
            if (report.department && report.department.name) {
                const deptName = report.department.name;
                if (!sectorPerf[deptName]) sectorPerf[deptName] = { resolved: 0, forwarded: 0 };
                if (report.status === 'RESOLVED') sectorPerf[deptName].resolved++;
                if (report.status === 'FORWARDED') sectorPerf[deptName].forwarded++;
            }

            // Efficiency (Resolved Time)
            if (report.status === 'RESOLVED') {
                const resolvedHistory = report.history.find(h => h.status === 'RESOLVED');
                if (resolvedHistory) {
                    const diff = resolvedHistory.createdAt.getTime() - report.createdAt.getTime(); // ms
                    totalResolutionTime += diff;
                    resolvedCount++;
                }
            }

            // Bottlenecks (Time in FORWARDED)
            const forwardedHistory = report.history.find(h => h.status === 'FORWARDED');
            if (forwardedHistory) {
                // If resolved, time until resolution. If still forwarded, time until now.
                const nextStatus = report.history.find(h => h.createdAt > forwardedHistory.createdAt && h.status !== 'FORWARDED');
                const endTime = nextStatus ? nextStatus.createdAt.getTime() : new Date().getTime();
                const diff = endTime - forwardedHistory.createdAt.getTime();
                bottleneckSum += diff;
                bottleneckCount++;
            }
        });

        // Médias em Horas
        const avgResolutionHours = resolvedCount > 0 ? (totalResolutionTime / resolvedCount) / (1000 * 60 * 60) : 0;
        const avgBottleneckHours = bottleneckCount > 0 ? (bottleneckSum / bottleneckCount) / (1000 * 60 * 60) : 0;

        return {
            efficiency: {
                avgResolutionTime: avgResolutionHours.toFixed(1),
                resolvedCount
            },
            bottlenecks: {
                avgForwardedTime: avgBottleneckHours.toFixed(1),
                impactedCount: bottleneckCount
            },
            volume: Object.entries(volumeByDate).map(([date, count]) => ({ date, count })).sort((a, b) => a.date.localeCompare(b.date)),
            sectorPerformance: Object.entries(sectorPerf).map(([name, stats]) => ({ name, ...stats }))
        };
    }
}
