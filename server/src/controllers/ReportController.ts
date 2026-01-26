// controllers/ReportController.ts
import type { Request, Response } from 'express';
import { ReportStatus, PrismaClient } from '../generated/prisma';
import { ReportService } from '../services/ReportService';
import { MediaService } from '../services/MediaService';
import { PrismaMediaRepository } from '../repositories/implementations/PrismaMediaRepository';

// Instâncias compartilhadas
const prisma = new PrismaClient();
const reportService = new ReportService();
const mediaRepository = new PrismaMediaRepository(prisma);
const mediaService = new MediaService(mediaRepository);

export const ReportController = {
    // Dashboard Stats for chart
    stats: async (req: Request, res: Response) => {
        const supervisorId = req.userId!;
        try {
            const stats = await reportService.getDashboardStats(supervisorId);
            return res.json(stats);
        } catch (error) {
            return res.status(500).json({ error: 'Erro ao buscar estatísticas' });
        }
    },

    // List reports for supervisor
    index: async (req: Request, res: Response) => {
        const supervisorId = req.userId!;
        const { page, limit, status, startDate, endDate } = req.query;

        try {
            const reports = await reportService.listReports(
                supervisorId,
                page ? Number(page) : undefined,
                limit ? Number(limit) : undefined,
                status as ReportStatus,
                startDate ? new Date(startDate as string) : undefined,
                endDate ? new Date(endDate as string) : undefined,
            );
            return res.json(reports);
        } catch (error) {
            return res.status(500).json({ error: 'Erro ao listar relatórios' });
        }
    },

    // List reports for a specific user (Professional)
    indexByUser: async (req: Request, res: Response) => {
        const userId = req.userId!;
        const { page, limit, status, startDate, endDate } = req.query;

        try {
            const reports = await reportService.listUserReports(
                userId,
                page ? Number(page) : undefined,
                limit ? Number(limit) : undefined,
                status as ReportStatus,
                startDate ? new Date(startDate as string) : undefined,
                endDate ? new Date(endDate as string) : undefined,
            );
            return res.json(reports);
        } catch (error) {
            return res.status(500).json({ error: 'Erro ao listar histórico' });
        }
    },

    // Create a new report (imagem obrigatória + Cloudinary)
    create: async (req: Request, res: Response) => {
        const { comment } = req.body;
        const userId = req.userId!;

        if (!req.file?.path) {
            return res.status(400).json({ error: 'Imagem é obrigatória' });
        }

        try {
            // 1) faz upload na Cloudinary primeiro
            const media = await mediaService.upload({
                filePath: req.file.path,
                userId,
                // sem reportId aqui; o vínculo principal é via imageUrl no report
            });

            // 2) cria o report já com a secureUrl
            const report = await reportService.create({
                comment,
                userId,
                imageUrl: media.secureUrl,
            });

            // 3) notifica supervisor
            if (report.user.supervisorId) {
                req.io
                    .to(report.user.supervisorId.toString())
                    .emit('new_report_to_review', {
                        message: `New report submitted by ${report.user.name}`,
                        data: report,
                    });
            }

            return res.status(201).json(report);
        } catch (error) {
            console.error(error);
            return res.status(500).json({ error: 'Erro ao criar relatório' });
        }
    },

    // update status of a report
    updateStatus: async (req: Request, res: Response) => {
        const { id } = req.params;
        const { status, feedback, departmentId } = req.body;

        if (!id) {
            return res.status(400).json({ error: 'ID do relatório inválido' });
        }

        try {
            const operatorName = req.userName;
            const updatedReport = await reportService.updateStatus(
                id as string,
                status,
                feedback,
                operatorName,
                departmentId,
            );

            const targetRoom = updatedReport.userId.toString();
            console.log(`[Socket] Emitting status update to room: ${targetRoom}`);

            req.io.to(targetRoom).emit('report_status_updated', {
                reportId: id,
                newStatus: status,
                feedback: updatedReport.feedback,
                feedbackAt: updatedReport.feedbackAt,
                message: `Your report status has been updated to ${status}`,
            });

            const supervisorRoom = (updatedReport as any).user.supervisorId?.toString();
            if (supervisorRoom) {
                req.io
                    .to(supervisorRoom)
                    .emit('report_status_updated_for_supervisor', updatedReport);
            }

            return res.status(200).json(updatedReport);
        } catch (error) {
            return res.status(500).json({ error: 'Erro ao atualizar status' });
        }
    },
};
