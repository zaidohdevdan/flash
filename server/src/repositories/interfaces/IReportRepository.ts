import type { Report, ReportStatus, User } from '../../generated/prisma';

export interface CreateReportDTO {
    comment: string;
    userId: string;
    imageUrl?: string;
}

export type ReportWithUser = Report & { user: { name: string; supervisorId: string | null } };

export interface IReportRepository {
    create(data: CreateReportDTO): Promise<ReportWithUser>;
    updateStatus(id: string, status: ReportStatus): Promise<Report & { user: User }>;
}
