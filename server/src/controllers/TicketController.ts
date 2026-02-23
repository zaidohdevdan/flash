import type { Request, Response } from 'express';
import { TicketService } from '../services/TicketService';

const ticketService = new TicketService();

export const TicketController = {
    async create(req: Request, res: Response) {
        try {
            const { protocol, subject, message } = req.body;
            const supervisorId = req.userId!;

            const ticket = await ticketService.createTicket({
                protocol,
                subject,
                message,
                supervisorId
            });

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
            const { status } = req.body;

            const ticket = await ticketService.updateTicketStatus(id, status);
            return res.json(ticket);
        } catch (error: any) {
            if (error.message === 'TICKET_NOT_FOUND') {
                return res.status(404).json({ error: 'Chamado não encontrado.' });
            }
            console.error('Erro ao atualizar status do chamado:', error);
            return res.status(500).json({ error: 'Erro ao atualizar chamado.' });
        }
    }
};
