import type { Ticket, TicketStatus } from "../../generated/prisma";

export interface ITicketRepository {
    create(data: {
        protocol?: string;
        subject: string;
        message?: string;
        supervisorId: string;
    }): Promise<Ticket>;

    listAll(): Promise<Ticket[]>;

    listBySupervisor(supervisorId: string): Promise<Ticket[]>;

    updateStatus(id: string, status: TicketStatus, adminResponse?: string): Promise<Ticket>;

    findById(id: string): Promise<Ticket | null>;
    softDeleteBySupervisor(id: string): Promise<void>;
    delete(id: string): Promise<void>;
}
