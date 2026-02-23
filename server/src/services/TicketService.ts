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

    async updateTicketStatus(id: string, status: TicketStatus) {
        const ticket = await this.ticketRepository.findById(id);
        if (!ticket) {
            throw new Error('TICKET_NOT_FOUND');
        }

        return this.ticketRepository.updateStatus(id, status);
    }
}
