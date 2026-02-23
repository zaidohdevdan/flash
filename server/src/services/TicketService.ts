import type { ITicketRepository } from "../repositories/interfaces/ITicketRepository";
import { PrismaTicketRepository } from "../repositories/implementations/PrismaTicketRepository";
import type { TicketStatus } from "../generated/prisma";

export class TicketService {
    private ticketRepository: ITicketRepository;

    constructor() {
        this.ticketRepository = new PrismaTicketRepository();
    }

    async createTicket(data: {
        protocol?: string;
        subject: string;
        message?: string;
        supervisorId: string;
    }) {
        if (!data.subject || !data.supervisorId) {
            throw new Error('MISSING_FIELDS');
        }

        return this.ticketRepository.create(data);
    }

    async listTickets(userRole: string, userId: string) {
        if (userRole === 'ADMIN') {
            return this.ticketRepository.listAll();
        }
        return this.ticketRepository.listBySupervisor(userId);
    }

    async updateTicketStatus(id: string, status: TicketStatus, adminResponse?: string, io?: any) {
        const ticket = await this.ticketRepository.findById(id);
        if (!ticket) {
            throw new Error('TICKET_NOT_FOUND');
        }

        const updatedTicket = await this.ticketRepository.updateStatus(id, status, adminResponse);

        // Se o admin respondeu, envia notificação para o supervisor (exceto se for só mudando status pra "assumido")
        if (adminResponse && io && ticket.supervisorId) {
            const { NotificationService } = require('./NotificationService');
            const notificationService = new NotificationService();

            await notificationService.createNotification({
                userId: ticket.supervisorId,
                type: 'TICKET_RESPONSE',
                title: 'Chamado Respondido',
                message: `O chamado #${ticket.protocol || 'S/P'} foi respondido pelo Administrador.`,
                link: '/?view=tickets'
            }, io);
        }

        return updatedTicket;
    }

    async deleteTicket(id: string, userId: string, userRole: string) {
        const ticket = await this.ticketRepository.findById(id);
        if (!ticket) {
            throw new Error('TICKET_NOT_FOUND');
        }

        // Apenas o supervisor dono ou um ADMIN pode deletar
        if (userRole !== 'ADMIN' && ticket.supervisorId !== userId) {
            throw new Error('UNAUTHORIZED');
        }

        if (userRole === 'ADMIN') {
            return this.ticketRepository.delete(id);
        } else {
            return this.ticketRepository.softDeleteBySupervisor(id);
        }
    }
}
