// controllers/ReportController.ts
import type { Request, Response } from 'express';
import { ReportStatus } from '../generated/prisma'
import { prisma } from '../lib/prisma';
import { ReportService } from '../services/ReportService';
import { MediaService } from '../services/MediaService';
import { PrismaMediaRepository } from '../repositories/implementations/PrismaMediaRepository';

// Instâncias compartilhadas
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
                (status && status !== '') ? (status as ReportStatus) : undefined,
                startDate ? new Date(startDate as string) : undefined,
                endDate ? new Date(endDate as string) : undefined,
            );
            return res.json(reports);
        } catch (error) {
            return res.status(500).json({ error: 'Erro ao listar relatórios' });
        }
    },

    // List reports for department (Manager)
    indexByDepartment: async (req: Request, res: Response) => {
        const userId = req.userId!;
        const { page, limit, status, startDate, endDate } = req.query;

        try {
            // Buscamos o departamento do usuário manager
            const user = await prisma.user.findUnique({ where: { id: userId }, select: { departmentId: true } });
            if (!user?.departmentId) return res.status(403).json({ error: 'Usuário não vinculado a um departamento' });

            const reports = await reportService.listDepartmentReports(
                user.departmentId,
                page ? Number(page) : undefined,
                limit ? Number(limit) : undefined,
                (status && status !== '') ? (status as ReportStatus) : undefined,
                startDate ? new Date(startDate as string) : undefined,
                endDate ? new Date(endDate as string) : undefined,
            );
            return res.json(reports);
        } catch (error) {
            return res.status(500).json({ error: 'Erro ao listar relatórios do departamento' });
        }
    },

    // Stats for department manager
    departmentStats: async (req: Request, res: Response) => {
        const userId = req.userId!;
        try {
            const user = await prisma.user.findUnique({ where: { id: userId }, select: { departmentId: true } });
            if (!user?.departmentId) return res.status(403).json({ error: 'Usuário não vinculado a um departamento' });

            const stats = await reportService.getDepartmentStats(user.departmentId);
            return res.json(stats);
        } catch (error) {
            return res.status(500).json({ error: 'Erro ao buscar estatísticas do departamento' });
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
                (status && status !== '') ? (status as ReportStatus) : undefined,
                startDate ? new Date(startDate as string) : undefined,
                endDate ? new Date(endDate as string) : undefined,
            );

            // Filter out sensitive history for professionals, but KEEP feedback
            const safeReports = reports.map(r => {
                return {
                    ...r,
                    // Feedback is for the professional to see, so we don't hide it
                    feedback: r.feedback || undefined,
                    history: [] // Hide internal movements history
                };
            });

            return res.json(safeReports);
        } catch (error) {
            return res.status(500).json({ error: 'Erro ao listar histórico' });
        }
    },

    // Create a new report (imagem obrigatória + Cloudinary)
    // controllers/ReportController.ts
    create: async (req: Request, res: Response) => {
        const { comment } = req.body;
        const userId = req.userId!;

        if (!req.file?.buffer) {
            return res.status(400).json({ error: "Imagem é obrigatória" });
        }

        try {
            // 1) upload direto do buffer para Cloudinary
            const media = await mediaService.uploadFromBuffer({
                buffer: req.file.buffer,
                userId,
            });

            // 2) cria o report com a URL da Cloudinary
            const report = await reportService.create({
                comment,
                userId,
                imageUrl: media.secureUrl,
            });

            // 3) notifica supervisor (igual já está)
            if (report.user.supervisorId) {
                req.io
                    .to(report.user.supervisorId.toString())
                    .emit("new_report_to_review", {
                        message: `New report submitted by ${report.user.name}`,
                        data: report,
                    });
            }

            return res.status(201).json(report);
        } catch (error) {
            console.error(error);
            return res.status(500).json({ error: "Erro ao criar relatório" });
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

            // Notify professional (Sanitized)
            // Only send feedback if Resolved
            const isResolved = status === 'RESOLVED';

            req.io.to(targetRoom).emit('report_status_updated', {
                reportId: id,
                newStatus: status,
                feedback: isResolved ? updatedReport.feedback : undefined,
                feedbackAt: updatedReport.feedbackAt,
                message: `Status atualizado: ${status}`,
            });

            const supervisorRoom = (updatedReport as any).user.supervisorId?.toString();
            if (supervisorRoom) {
                req.io
                    .to(supervisorRoom)
                    .emit('report_status_updated_for_supervisor', updatedReport);
            }

            // Notifica o departamento se houver vínculo
            if (departmentId || (updatedReport as any).departmentId) {
                const finalDeptId = departmentId || (updatedReport as any).departmentId;
                const eventName = status === 'FORWARDED' ? 'report_forwarded_to_department' : 'report_status_updated_for_supervisor';
                req.io.to(`dept-${finalDeptId}`).emit(eventName, updatedReport);
                console.log(`[Socket] Evento ${eventName} emitido para sala dept-${finalDeptId}. ReportId: ${id}`);
            }

            return res.status(200).json(updatedReport);
        } catch (error) {
            return res.status(500).json({ error: 'Erro ao atualizar status' });
        }
    },
};
