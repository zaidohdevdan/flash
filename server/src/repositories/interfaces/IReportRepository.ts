import type { Report, ReportStatus, User, ReportHistory, Department, Media } from '../../generated/prisma';

export interface CreateReportDTO {
    comment: string;
    userId: string;
    imageUrl?: string;
    mediaItems?: any[];
    latitude?: number;
    longitude?: number;
    createdAt?: string;
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
    media?: Media[];
};

export interface IReportRepository {
    create(data: CreateReportDTO): Promise<ReportWithUser>;
    findById(id: string): Promise<ReportWithUser | null>;
    updateStatus(id: string, status: ReportStatus, feedback?: string, userName?: string, departmentId?: string, userRole?: string): Promise<Report>;
    findAll(supervisorId: string, page?: number, limit?: number, status?: ReportStatus, startDate?: Date, endDate?: Date): Promise<ReportWithUser[]>;
    findByUserId(userId: string, page?: number, limit?: number, status?: ReportStatus, startDate?: Date, endDate?: Date): Promise<ReportWithUser[]>;
    findByDepartment(departmentId: string, page?: number, limit?: number, status?: ReportStatus, startDate?: Date, endDate?: Date): Promise<ReportWithUser[]>;
    findStatsBySupervisor(supervisorId: string, startDate?: Date, endDate?: Date): Promise<{ status: string, _count: number }[]>;
    findStatsByDepartment(departmentId: string, startDate?: Date, endDate?: Date): Promise<{ status: string, _count: number }[]>;
    getAdvancedStats(userId: string, role: string, status?: ReportStatus, startDate?: Date, endDate?: Date): Promise<any>;
    findByProtocol(protocol: string): Promise<ReportWithUser | null>;
    archiveByProtocol(protocol: string): Promise<void>;
    restoreByProtocol(protocol: string): Promise<void>;
    listArchivedReports(page?: number, limit?: number): Promise<ReportWithUser[]>;
    importReport(data: any): Promise<void>;
    deleteByProtocol(protocol: string): Promise<void>;
}
