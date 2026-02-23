import type { Request, Response } from 'express';
import { TicketService } from '../services/TicketService';
import { NotificationService } from '../services/NotificationService';
import { PrismaUserRepository } from '../repositories/implementations/PrismaUserRepository';

const ticketService = new TicketService();
const notificationService = new NotificationService();
const userRepository = new PrismaUserRepository();

export const TicketController = {
    async create(req: Request, res: Response) {
        try {
            const { protocol, subject, message } = req.body;
            const supervisorId = String(req.userId);

            const ticket = await ticketService.createTicket({
                protocol,
                subject,
                message,
                supervisorId
            });

            // Notificar administradores
            try {
                const admins = await userRepository.findAllByRole('ADMIN');
                const adminNotifications = admins.map(admin =>
                    notificationService.createNotification({
                        userId: admin.id,
                        type: 'SUPPORT_TICKET',
                        title: 'Novo Chamado de Suporte',
                        message: `Um novo chamado (${protocol || 'Sem Protocolo'}) foi aberto: ${subject.replace(/_/g, ' ')}`,
                        link: `/admin?view=tickets` // Link para o painel de tickets do admin
                    }, req.io)
                );
                await Promise.all(adminNotifications);
            } catch (notifyError) {
                console.error('Erro ao notificar admins sobre novo ticket:', notifyError);
                // Não falha a requisição se a notificação falhar
            }

            return res.status(201).json(ticket);
        } catch (error: any) {
            if (error.message === 'MISSING_FIELDS') {
                return res.status(400).json({ error: 'Protocolo e motivação são obrigatórios.' });
            }
            console.error('Erro ao criar chamado:', error);
            return res.status(500).json({ error: 'Erro interno ao criar chamado.' });
        }
    },

    async index(req: Request, res: Response) {
        try {
            const userId = String(req.userId);
            const userRole = (req.userRole as string) || 'UNKNOWN';

            const tickets = await ticketService.listTickets(userRole, userId);
            return res.json(tickets);
        } catch (error) {
            console.error('Erro ao listar chamados:', error);
            return res.status(500).json({ error: 'Erro ao listar chamados.' });
        }
    },

    async updateStatus(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const { status, adminResponse } = req.body;

            const ticket = await ticketService.updateTicketStatus(String(id), status as any, adminResponse, req.io);
            return res.json(ticket);
        } catch (error: any) {
            if (error.message === 'TICKET_NOT_FOUND') {
                return res.status(404).json({ error: 'Chamado não encontrado.' });
            }
            console.error('Erro ao atualizar status do chamado:', error);
            return res.status(500).json({ error: 'Erro ao atualizar chamado.' });
        }
    },
    async destroy(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const userId = String(req.userId);
            const userRole = (req.userRole as string) || 'UNKNOWN';

            await ticketService.deleteTicket(String(id), userId, userRole);
            return res.status(204).send();
        } catch (error: any) {
            if (error.message === 'TICKET_NOT_FOUND') {
                return res.status(404).json({ error: 'Chamado não encontrado.' });
            }
            if (error.message === 'UNAUTHORIZED') {
                return res.status(403).json({ error: 'Você não tem permissão para excluir este chamado.' });
            }
            console.error('Erro ao excluir chamado:', error);
            return res.status(500).json({ error: 'Erro ao excluir chamado.' });
        }
    }
};
