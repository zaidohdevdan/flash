import { PrismaClient } from "../../generated/prisma";
import type { Ticket, TicketStatus } from "../../generated/prisma";
import type { ITicketRepository } from "../interfaces/ITicketRepository";

const prisma = new PrismaClient();

export class PrismaTicketRepository implements ITicketRepository {
    async create(data: {
        protocol?: string;
        subject: string;
        message?: string;
        supervisorId: string;
    }): Promise<Ticket> {
        return prisma.ticket.create({
            data: {
                protocol: data.protocol,
                subject: data.subject,
                message: data.message,
                supervisorId: data.supervisorId
            }
        });
    }

    async listAll(): Promise<Ticket[]> {
        return prisma.ticket.findMany({
            include: {
                supervisor: {
                    select: {
                        id: true,
                        name: true,
                        avatarUrl: true
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        });
    }

    async listBySupervisor(supervisorId: string): Promise<Ticket[]> {
        return prisma.ticket.findMany({
            where: {
                supervisorId
            },
            orderBy: {
                createdAt: 'desc'
            }
        });
    }

    async updateStatus(id: string, status: TicketStatus): Promise<Ticket> {
        return prisma.ticket.update({
            where: { id },
            data: { status }
        });
    }

    async findById(id: string): Promise<Ticket | null> {
        return prisma.ticket.findUnique({
            where: { id },
            include: {
                supervisor: {
                    select: {
                        id: true,
                        name: true,
                        avatarUrl: true
                    }
                }
            }
        });
    }
}
