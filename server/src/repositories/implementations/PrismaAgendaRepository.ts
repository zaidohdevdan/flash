import { prisma } from '../../lib/prisma';
import type { AgendaEvent } from '../../generated/prisma';
import type { CreateAgendaEventDTO, IAgendaRepository } from '../interfaces/IAgendaRepository';

export class PrismaAgendaRepository implements IAgendaRepository {
    async create(data: CreateAgendaEventDTO): Promise<AgendaEvent> {
        return prisma.agendaEvent.create({
            data: {
                title: data.title,
                description: data.description,
                type: data.type,
                startTime: data.startTime,
                endTime: data.endTime,
                createdById: data.createdById,
                participantIds: data.participantIds,
                reportId: data.reportId
            },
            include: {
                createdBy: {
                    select: { id: true, name: true, avatarUrl: true }
                },
                participants: {
                    select: { id: true, name: true, avatarUrl: true }
                }
            }
        }) as any;
    }

    async findById(id: string): Promise<AgendaEvent | null> {
        return prisma.agendaEvent.findUnique({
            where: { id },
            include: {
                createdBy: { select: { id: true, name: true, avatarUrl: true } },
                participants: { select: { id: true, name: true, avatarUrl: true } },
                report: true
            }
        }) as any;
    }

    async update(id: string, data: Partial<CreateAgendaEventDTO>): Promise<AgendaEvent> {
        return prisma.agendaEvent.update({
            where: { id },
            data: {
                title: data.title,
                description: data.description,
                type: data.type,
                startTime: data.startTime,
                endTime: data.endTime,
                participantIds: data.participantIds ? { set: data.participantIds } : undefined,
                reportId: data.reportId
            },
            include: {
                createdBy: { select: { id: true, name: true, avatarUrl: true } },
                participants: { select: { id: true, name: true, avatarUrl: true } }
            }
        }) as any;
    }

    async delete(id: string): Promise<void> {
        await prisma.agendaEvent.delete({ where: { id } });
    }

    async findByUserId(userId: string, startDate?: Date, endDate?: Date): Promise<AgendaEvent[]> {
        const where: any = {
            OR: [
                { createdById: userId },
                { participantIds: { has: userId } }
            ]
        };

        if (startDate || endDate) {
            where.startTime = {};
            if (startDate) where.startTime.gte = startDate;
            if (endDate) where.startTime.lte = endDate;
        }

        return prisma.agendaEvent.findMany({
            where,
            include: {
                createdBy: { select: { id: true, name: true, avatarUrl: true } },
                participants: { select: { id: true, name: true, avatarUrl: true } },
                report: {
                    select: { id: true, comment: true, status: true }
                }
            },
            orderBy: { startTime: 'asc' }
        }) as any;
    }

    async findUpcoming(startTimeLimit: Date): Promise<AgendaEvent[]> {
        return prisma.agendaEvent.findMany({
            where: {
                startTime: {
                    gt: new Date(),
                    lte: startTimeLimit
                }
            },
            include: {
                participants: { select: { id: true } }
            }
        }) as any;
    }
}
