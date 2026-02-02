import { ReportStatus } from '../generated/prisma';
import type { CreateReportDTO, IReportRepository } from '../repositories/interfaces/IReportRepository';
import { PrismaReportRepository } from '../repositories/implementations/PrismaReportRepository';

export class ReportService {
    private reportRepository: IReportRepository;

    constructor(reportRepository: IReportRepository = new PrismaReportRepository()) {
        this.reportRepository = reportRepository;
    }

    async create(data: CreateReportDTO) {
        return this.reportRepository.create(data);
    }

    async getById(id: string) {
        return this.reportRepository.findById(id);
    }

    async updateStatus(id: string, status: ReportStatus, feedback?: string, operatorName?: string, departmentId?: string) {
        return this.reportRepository.updateStatus(id, status, feedback, operatorName, departmentId);
    }

    async getDashboardStats(supervisorId: string) {
        return this.reportRepository.findStatsBySupervisor(supervisorId);
    }

    async listReports(supervisorId: string, page?: number, limit?: number, status?: ReportStatus, startDate?: Date, endDate?: Date) {
        return this.reportRepository.findAll(supervisorId, page, limit, status, startDate, endDate);
    }

    async listUserReports(userId: string, page?: number, limit?: number, status?: ReportStatus, startDate?: Date, endDate?: Date) {
        return this.reportRepository.findByUserId(userId, page, limit, status, startDate, endDate);
    }

    async listDepartmentReports(departmentId: string, page?: number, limit?: number, status?: ReportStatus, startDate?: Date, endDate?: Date) {
        return this.reportRepository.findByDepartment(departmentId, page, limit, status, startDate, endDate);
    }

    async getDepartmentStats(departmentId: string) {
        return this.reportRepository.findStatsByDepartment(departmentId);
    }
}
