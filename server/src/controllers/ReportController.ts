// controllers/ReportController.ts
import type { Request, Response } from 'express';
import { ReportStatus } from '../generated/prisma'
import { prisma } from '../lib/prisma';
import { ReportService } from '../services/ReportService';
import { MediaService } from '../services/MediaService';
import { AuditService } from '../services/AuditService';
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

    // Advanced Stats for Analytics Page
    advancedStats: async (req: Request, res: Response) => {
        const userId = req.userId!;
        const role = req.userRole!;
        try {
            const stats = await reportService.getAdvancedStats(userId, role);
            return res.json(stats);
        } catch (error) {
            return res.status(500).json({ error: 'Erro ao buscar analytics' });
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
                // Refinando a lógica conforme solicitação:
                // "A timeline pode ser vista por todos... os comentários serão ocultos ao profissional."
                // "O único comentário que o profissional pode ver... é quando o supervisor comenta após receber."

                userId,
                page ? Number(page) : undefined,
                limit ? Number(limit) : undefined,
                (status && status !== '') ? (status as ReportStatus) : undefined,
                startDate ? new Date(startDate as string) : undefined,
                endDate ? new Date(endDate as string) : undefined,
            );

            // Verifica se o usuário é Profissional. Se não for (Supervisor/Manager/Admin), vê tudo.
            // req.userRole vem do middleware de autenticação.
            const userRole = req.userRole;
            const isProfessional = !userRole || userRole === 'PROFESSIONAL';

            if (!isProfessional) {
                return res.json(reports);
            }

            // Filter history for professionals
            const safeReports = reports.map(r => {
                const history = r.history ? (r.history as any[]).map(h => {
                    // Regra 1: Comentários de Gerentes/Admins são sempre ocultos (Internos)
                    const isManagerial = ['MANAGER', 'ADMIN'].includes(h.userRole);

                    // Regra 2: Encaminhamentos (FORWARDED) são trâmites internos (Sup -> Gerente ou Gerente -> Gerente)
                    // O profissional vê que foi encaminhado, mas não o texto.
                    const isForwarding = h.status === 'FORWARDED';

                    // Se for interno, removemos o texto do comentário, mantendo o registro da ação na timeline.
                    if (isManagerial || isForwarding) {
                        return { ...h, comment: null };
                    }

                    // Caso contrário (SENT pelo profissional, IN_REVIEW do Supervisor, RESOLVED do Supervisor), mantém.
                    return h;
                }) : [];

                // Agora aplicamos a mesma regra ao "feedback" (último comentário visível)
                // Se o status atual é FORWARDED, o feedback deve ser oculto.
                // Se o histórico mais recente foi ocultado (comment === null), o feedback também deve ser.
                let feedback = r.feedback;

                // Regra explícita: "nunca quando encaminhar"
                if (r.status === 'FORWARDED') {
                    feedback = null;
                } else if (history.length > 0) {
                    // Assumindo que o histórico vem ordenado do mais recente para o mais antigo (padrão)
                    const latest = history[0];
                    if (latest.comment === null) {
                        feedback = null;
                    }
                }

                return {
                    ...r,
                    feedback,
                    history
                };
            });

            return res.json(safeReports);
        } catch (error) {
            return res.status(500).json({ error: 'Erro ao listar histórico' });
        }
    },

    // Create a new report (imagem obrigatória + Cloudinary)
    create: async (req: Request, res: Response) => {
        const { comment, imageUrl, latitude, longitude, createdAt } = req.body;
        const userId = req.userId!;

        console.log(`[Report] Criando reporte para usuário: ${userId}`);

        if (!imageUrl) {
            console.error("[Report] Erro: Imagem não fornecida (URL)");
            return res.status(400).json({ error: "Imagem é obrigatória" });
        }

        try {
            // 1. Cria o report com a URL já hospedada
            console.log("[Report] Salvando no banco com URL:", imageUrl);

            const report = await reportService.create({
                comment,
                userId,
                imageUrl,
                latitude: latitude ? parseFloat(latitude) : undefined,
                longitude: longitude ? parseFloat(longitude) : undefined,
                createdAt
            });
            console.log("[Report] Relatório salvo com ID:", report.id);

            // Auditoria
            await AuditService.log({
                userId,
                action: 'CREATE_REPORT',
                target: `Report:${report.id}`,
                ip: req.ip,
                userAgent: req.get('user-agent')
            });

            // 3) notifica supervisor (igual já está)
            if (report.user.supervisorId) {
                try {
                    const supervisorRoom = report.user.supervisorId.toString();
                    console.log(`[Socket] Notificando supervisor na sala: ${supervisorRoom}`);
                    req.io
                        .to(supervisorRoom)
                        .emit("new_report_to_review", {
                            message: `New report submitted by ${report.user.name}`,
                            data: report,
                        });
                } catch (socketErr) {
                    console.error("[Socket] Erro ao emitir evento socket:", socketErr);
                }
            } else {
                console.warn("[Report] Usuário não possui supervisor vinculado para notificação real-time.");
            }

            return res.status(201).json(report);
        } catch (error) {
            console.error("[Report] ERRO CRÍTICO na criação do relatório:", error);
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
            const userId = req.userId!;
            const userRole = req.userRole;
            const userDeptId = req.userDepartmentId;
            const operatorName = req.userName;

            // 1. Busca o reporte para validar posse
            const report = await reportService.getById(String(id));
            if (!report) {
                return res.status(404).json({ error: 'Relatório não encontrado.' });
            }

            // 2. Valida Permissões por Role
            if (userRole === 'SUPERVISOR') {
                // Supervisor só edita se for dele AND não tiver no setor
                if (report.user.supervisorId !== userId) {
                    return res.status(403).json({ error: 'Você não tem permissão para editar este relatório (não é seu subordinado).' });
                }
                if (report.departmentId) {
                    return res.status(403).json({ error: 'Este relatório já foi encaminhado para um setor e não pode mais ser editado por você.' });
                }
            } else if (userRole === 'MANAGER') {
                // Gerente só edita se estiver no setor dele
                if (report.departmentId !== userDeptId) {
                    return res.status(403).json({ error: 'Este relatório pertence a outro departamento.' });
                }
            } else if (userRole !== 'ADMIN') {
                // Outras roles (como PROFISSIONAL) nunca editam status
                return res.status(403).json({ error: 'Apenas Supervisores e Gerentes podem atualizar o status.' });
            }

            const updatedReport = await reportService.updateStatus(
                id as string,
                status,
                feedback,
                operatorName,
                departmentId,
                userRole // Passando a role para o histórico
            );

            // Auditoria
            await AuditService.log({
                userId: req.userId,
                action: 'UPDATE_REPORT_STATUS',
                target: `Report:${id}`,
                details: { status, feedback, departmentId },
                ip: req.ip,
                userAgent: req.get('user-agent')
            });

            const targetRoom = updatedReport.userId.toString();

            // Notify professional (Sanitized)
            // Only send feedback if Resolved
            const isResolved = status === 'RESOLVED';

            req.io.to(targetRoom).emit('report_status_updated', {
                reportId: id,
                newStatus: status,
                feedback: updatedReport.feedback, // Enviar sempre o feedback mais recente
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
