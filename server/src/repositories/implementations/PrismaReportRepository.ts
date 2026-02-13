import { prisma } from '../../lib/prisma'
import { type Report, type ReportStatus, type User } from '../../generated/prisma';
import type { CreateReportDTO, IReportRepository, ReportWithUser } from '../interfaces/IReportRepository';

export class PrismaReportRepository implements IReportRepository {
    async create({ comment, userId, imageUrl, latitude, longitude, createdAt }: CreateReportDTO): Promise<ReportWithUser> {
        const user = await prisma.user.findUnique({ where: { id: userId }, select: { name: true, role: true } });
        const userName = user?.name || 'Operador';
        const userRole = user?.role || 'PROFESSIONAL';

        return prisma.report.create({
            data: {
                comment,
                imageUrl: imageUrl || '',
                userId,
                latitude,
                longitude,
                createdAt: createdAt ? new Date(createdAt) : undefined,
                status: 'SENT',
                history: {
                    create: {
                        status: 'SENT',
                        comment: 'Relatório enviado pelo profissional.',
                        userName: userName,
                        userRole: userRole
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
                    select: {
                        id: true,
                        reportId: true,
                        status: true,
                        comment: true,
                        userName: true,
                        userRole: true, // NEW
                        departmentName: true,
                        createdAt: true
                    },
                    orderBy: { createdAt: 'desc' },
                },
                department: true
            },
        }) as any; // Cast for now due to strict type mismatch in intermediate steps
    }

    async updateStatus(id: string, status: ReportStatus, feedback?: string, userName?: string, departmentId?: string, userRole?: string): Promise<Report> {
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
                    userRole: userRole ? (userRole as any) : undefined,
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
        const sectorPerf: Record<string, { resolved: number, forwarded: number, avgTime: number, countForAvg: number }> = {};

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

            // Sector Performance & Speed
            if (report.department && report.department.name) {
                const deptName = report.department.name;
                if (!sectorPerf[deptName]) sectorPerf[deptName] = { resolved: 0, forwarded: 0, avgTime: 0, countForAvg: 0 };
                if (report.status === 'RESOLVED') sectorPerf[deptName].resolved++;
                if (report.status === 'FORWARDED') sectorPerf[deptName].forwarded++;

                // Track time in this specific department
                const deptForwarded = report.history.find(h => h.status === 'FORWARDED' && h.departmentName === deptName);
                if (deptForwarded) {
                    const nextStatus = report.history.find(h => h.createdAt > deptForwarded.createdAt && h.status !== 'FORWARDED');
                    const endTime = nextStatus ? nextStatus.createdAt.getTime() : new Date().getTime();
                    const diff = (endTime - deptForwarded.createdAt.getTime()) / (1000 * 60 * 60); // hours
                    sectorPerf[deptName].avgTime = (sectorPerf[deptName].avgTime * sectorPerf[deptName].countForAvg + diff) / (sectorPerf[deptName].countForAvg + 1);
                    sectorPerf[deptName].countForAvg++;
                }
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

            // Bottlenecks (Total Time in FORWARDED)
            const forwardedHistory = report.history.find(h => h.status === 'FORWARDED');
            if (forwardedHistory) {
                const nextStatus = report.history.find(h => h.createdAt > forwardedHistory.createdAt && h.status !== 'FORWARDED');
                const endTime = nextStatus ? nextStatus.createdAt.getTime() : new Date().getTime();
                const diff = endTime - forwardedHistory.createdAt.getTime();
                bottleneckSum += diff;
                bottleneckCount++;
            }
        });

        // 3. Predictions & Advanced Metrics
        const sortedVolume = Object.entries(volumeByDate).sort((a, b) => a[0].localeCompare(b[0]));
        const last3Days = sortedVolume.slice(-3);
        const predictedNextDay = last3Days.length > 0
            ? Math.round(last3Days.reduce((acc, curr) => acc + curr[1], 0) / last3Days.length)
            : 0;

        // Trend calculation
        let trend: 'UP' | 'DOWN' = 'DOWN';
        if (last3Days.length > 1) {
            const first = last3Days[0];
            const last = last3Days[last3Days.length - 1];
            if (first && last && last[1] > first[1]) trend = 'UP';
        }

        // Find the "Critical Sector" (Highest bottleneck time)
        const sectorList = Object.entries(sectorPerf).map(([name, stats]) => ({
            name,
            resolved: stats.resolved,
            forwarded: stats.forwarded,
            avgHours: parseFloat(stats.avgTime.toFixed(1))
        }));

        const criticalSector = sectorList.sort((a, b) => b.avgHours - a.avgHours)[0] || null;

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
                impactedCount: bottleneckCount,
                criticalSector
            },
            predictions: {
                nextDayVolume: predictedNextDay,
                trend
            },
            volume: sortedVolume.map(([date, count]) => ({ date, count })),
            sectorPerformance: sectorList
        };
    }
}
