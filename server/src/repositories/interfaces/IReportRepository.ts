import type { Report, ReportStatus, User, ReportHistory, Department } from '../../generated/prisma';

export interface CreateReportDTO {
    comment: string;
    userId: string;
    imageUrl?: string;
    latitude?: number;
    longitude?: number;
}

export type ReportWithUser = Report & {
    user: {
        name: string;
        supervisorId: string | null;
        avatarUrl?: string | null;
        statusPhrase?: string | null;
    };
    history?: ReportHistory[];
    department?: Department | null;
};

export interface IReportRepository {
    create(data: CreateReportDTO): Promise<ReportWithUser>;
    findById(id: string): Promise<ReportWithUser | null>;
    updateStatus(id: string, status: ReportStatus, feedback?: string, userName?: string, departmentId?: string): Promise<Report>;
    findAll(supervisorId: string, page?: number, limit?: number, status?: ReportStatus, startDate?: Date, endDate?: Date): Promise<ReportWithUser[]>;
    findByUserId(userId: string, page?: number, limit?: number, status?: ReportStatus, startDate?: Date, endDate?: Date): Promise<ReportWithUser[]>;
    findByDepartment(departmentId: string, page?: number, limit?: number, status?: ReportStatus, startDate?: Date, endDate?: Date): Promise<ReportWithUser[]>;
    findStatsBySupervisor(supervisorId: string): Promise<{ status: string, _count: number }[]>;
    findStatsByDepartment(departmentId: string): Promise<{ status: string, _count: number }[]>;
    getAdvancedStats(userId: string, role: string): Promise<any>;
}
