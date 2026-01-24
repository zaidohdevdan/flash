import type { Request, Response } from "express";
import { ReportService } from "../services/ReportService";

const reportService = new ReportService();

export const ReportController = {
    // Create a new report
    async create(req: Request, res: Response) {
        const { comment } = req.body;
        const userId = req.userId!;
        const imageUrl = req.file?.filename

        try {
            const report = await reportService.create({
                comment,
                userId,
                imageUrl
            });

            if (report.user.supervisorId) {
                req.io.to(report.user.supervisorId.toString()).emit('new_report_to_review', {
                    message: `New report submitted by ${report.user.name}`,
                    data: report
                });
            }

            return res.status(201).json(report);
        } catch (error) {
            return res.status(500).json({ error: "Erro ao criar relatório" });
        }
    },

    // update status of a report
    async updateStatus(req: Request, res: Response) {
        const { id } = req.params;
        const { status } = req.body;

        if (!id) {
            return res.status(400).json({ error: "ID do relatório inválido" });
        }

        try {
            const updatedReport = await reportService.updateStatus(id as string, status);

            // notify user about status change
            req.io.to(updatedReport.userId).emit('report_status_updated', {
                reportId: id,
                newStatus: status,
                message: `Your report status has been updated to ${status}`,
            });
            return res.status(200).json(updatedReport);
        } catch (error) {
            return res.status(500).json({ error: "Erro ao atualizar status" });
        }
    }
}