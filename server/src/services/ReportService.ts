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

    async updateStatus(id: string, status: ReportStatus) {
        return this.reportRepository.updateStatus(id, status);
    }
}
