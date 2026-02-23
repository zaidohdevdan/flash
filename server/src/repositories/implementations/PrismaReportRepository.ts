import { prisma } from '../../lib/prisma'
import { type Report, type ReportStatus, type User } from '../../generated/prisma';
import type { CreateReportDTO, IReportRepository, ReportWithUser } from '../interfaces/IReportRepository';

export class PrismaReportRepository implements IReportRepository {
    async create({ comment, userId, imageUrl, mediaItems, latitude, longitude, createdAt }: CreateReportDTO): Promise<ReportWithUser> {
        const user = await prisma.user.findUnique({ where: { id: userId }, select: { name: true, role: true } });
        const userName = user?.name || 'Operador';
        const userRole = user?.role || 'PROFESSIONAL';

        const mediaCreateData = mediaItems?.map((item) => ({
            publicId: item.publicId,
            url: item.url,
            secureUrl: item.secureUrl,
            format: item.format,
            width: item.width,
            height: item.height,
            bytes: item.bytes,
            resourceType: item.resourceType,
            folder: 'flash', // Default folder from schema, or passed from frontend
            userId: userId // Vincula também ao usuário
        })) || [];

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
                },
                media: {
                    create: mediaCreateData
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
                history: true,
                media: true // Inclui media no retorno
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
                department: true,
                media: true
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
            include: { user: true, history: true, department: true, media: true },
        });
    }

    async findStatsBySupervisor(supervisorId: string): Promise<{ status: string, _count: number }[]> {
        const stats = await prisma.report.groupBy({
            by: ['status'],
            where: {
                isArchived: { not: true },
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
            isArchived: { not: true },
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
                department: true,
                media: true
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
            isArchived: { not: true },
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
                department: true,
                media: true
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
            isArchived: { not: true },
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
                department: true,
                media: true
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
                isArchived: { not: true },
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
        let where: any = { isArchived: { not: true } };
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

    async findByProtocol(protocol: string): Promise<ReportWithUser | null> {
        protocol = protocol.toLowerCase();

        // Find the report ID based on the last 6 characters of the ObjectId
        const rawResult: any = await prisma.report.findRaw({
            filter: {
                $expr: {
                    $eq: [
                        { $substrCP: [{ $toString: "$_id" }, 18, 6] },
                        protocol
                    ]
                }
            }
        });

        if (!rawResult || rawResult.length === 0) {
            return null;
        }

        const reportId = rawResult[0]._id.$oid;
        return this.findById(reportId);
    }

    async listArchivedReports(page: number = 1, limit: number = 10): Promise<ReportWithUser[]> {
        const skip = (page - 1) * limit;

        return prisma.report.findMany({
            where: { isArchived: true },
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
                department: true,
                media: true
            },
            orderBy: {
                archivedAt: 'desc'
            },
            skip,
            take: limit
        });
    }

    async archiveByProtocol(protocol: string): Promise<void> {
        const report = await this.findByProtocol(protocol);
        if (!report) throw new Error('REPORT_NOT_FOUND');

        await prisma.report.update({
            where: { id: report.id },
            data: {
                isArchived: true,
                archivedAt: new Date(),
                history: {
                    create: {
                        status: report.status,
                        comment: 'Processo arquivado para auditoria.',
                        userName: 'Sistema (Admin)'
                    }
                }
            }
        });
    }

    async restoreByProtocol(protocol: string): Promise<void> {
        const report = await this.findByProtocol(protocol);
        if (!report) throw new Error('REPORT_NOT_FOUND');

        await prisma.report.update({
            where: { id: report.id },
            data: {
                isArchived: false,
                archivedAt: null,
                history: {
                    create: {
                        status: report.status,
                        comment: 'Processo restaurado do arquivo de auditoria.',
                        userName: 'Sistema (Admin)'
                    }
                }
            }
        });
    }

    async deleteByProtocol(protocol: string): Promise<void> {
        protocol = protocol.toLowerCase();

        // Find the report ID based on the last 6 characters of the ObjectId
        const rawResult: any = await prisma.report.findRaw({
            filter: {
                $expr: {
                    $eq: [
                        { $substrCP: [{ $toString: "$_id" }, 18, 6] },
                        protocol
                    ]
                }
            }
        });

        if (!rawResult || rawResult.length === 0) {
            throw new Error('REPORT_NOT_FOUND');
        }

        const reportId = rawResult[0]._id.$oid;

        // Execute cascaded deletion
        await prisma.$transaction(async (tx) => {
            // 1. Delete associated media (Cloudinary cleanups should be handled elsewhere if needed, but DB records deleted here)
            await tx.media.deleteMany({ where: { reportId } });

            // 2. Delete report history
            await tx.reportHistory.deleteMany({ where: { reportId } });

            // 3. Unlink from AgendaEvents (or delete if it's strictly a report event)
            await tx.agendaEvent.updateMany({
                where: { reportId },
                data: { reportId: null }
            });

            // 4. Finally delete the report
            await tx.report.delete({ where: { id: reportId } });
        });
    }
    async importReport(data: any): Promise<void> {
        // Here we recreate the report and its relations.
        // Prisma on MongoDB expects `id` to be a valid 24-character hex string if provided,
        // or we can let it generate a new one, but to keep the same Protocol (last 6 chars), 
        // we MUST preserve the original `id` if possible.

        await prisma.$transaction(async (tx) => {
            // Upsert Report (so if it already exists it just updates or ignores)
            const createdReport = await tx.report.upsert({
                where: { id: data.id },
                create: {
                    id: data.id,
                    status: data.status,
                    comment: data.comment,
                    imageUrl: data.imageUrl,
                    latitude: data.latitude,
                    longitude: data.longitude,
                    userId: data.userId,
                    departmentId: data.departmentId,
                    isArchived: data.isArchived ?? false,
                    archivedAt: data.archivedAt ? new Date(data.archivedAt) : null,
                    createdAt: data.createdAt ? new Date(data.createdAt) : undefined,
                    updatedAt: data.updatedAt ? new Date(data.updatedAt) : undefined,
                },
                update: {
                    status: data.status,
                    comment: data.comment,
                    imageUrl: data.imageUrl,
                    latitude: data.latitude,
                    longitude: data.longitude,
                    userId: data.userId,
                    departmentId: data.departmentId,
                    isArchived: data.isArchived ?? false,
                    archivedAt: data.archivedAt ? new Date(data.archivedAt) : null,
                    updatedAt: new Date()
                }
            });

            // Re-create history if it exists
            if (data.history && Array.isArray(data.history)) {
                for (const h of data.history) {
                    await tx.reportHistory.upsert({
                        where: { id: h.id },
                        create: {
                            id: h.id,
                            reportId: createdReport.id,
                            status: h.status,
                            comment: h.comment,
                            userName: h.userName,
                            userRole: h.userRole,
                            departmentName: h.departmentName,
                            createdAt: h.createdAt ? new Date(h.createdAt) : undefined
                        },
                        update: {
                            status: h.status,
                            comment: h.comment,
                            userName: h.userName,
                            userRole: h.userRole,
                            departmentName: h.departmentName,
                        }
                    });
                }
            }

            // Re-create media if it exists
            if (data.media && Array.isArray(data.media)) {
                for (const m of data.media) {
                    await tx.media.upsert({
                        where: { id: m.id }, // Make sure id exists or publicId
                        create: {
                            id: m.id,
                            publicId: m.publicId,
                            url: m.url,
                            secureUrl: m.secureUrl,
                            format: m.format,
                            width: m.width,
                            height: m.height,
                            bytes: m.bytes,
                            resourceType: m.resourceType,
                            folder: m.folder,
                            userId: m.userId,
                            reportId: createdReport.id,
                            uploadedAt: m.uploadedAt ? new Date(m.uploadedAt) : undefined
                        },
                        update: {
                            // usually media doesn't change, just update the relationship
                            reportId: createdReport.id
                        }
                    });
                }
            }
        });
    }
}
