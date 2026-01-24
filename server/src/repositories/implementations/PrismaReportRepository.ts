import { PrismaClient, type Report, type ReportStatus, type User } from '../../generated/prisma';
import type { CreateReportDTO, IReportRepository, ReportWithUser } from '../interfaces/IReportRepository';

const prisma = new PrismaClient();

export class PrismaReportRepository implements IReportRepository {
    async create({ comment, userId, imageUrl }: CreateReportDTO): Promise<ReportWithUser> {
        return prisma.report.create({
            data: {
                comment,
                imageUrl: imageUrl || '',
                userId
            },
            include: {
                user: {
                    select: {
                        name: true,
                        supervisorId: true,
                    },
                },
            },
        });
    }

    async updateStatus(id: string, status: ReportStatus): Promise<Report & { user: User }> {
        return prisma.report.update({
            where: { id },
            data: { status },
            include: { user: true },
        });
    }
}
