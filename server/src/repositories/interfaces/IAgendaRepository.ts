import type { AgendaEvent, AgendaEventType } from '../../generated/prisma';

export interface CreateAgendaEventDTO {
    title: string;
    description?: string;
    type: AgendaEventType;
    startTime: Date;
    endTime?: Date;
    createdById: string;
    participantIds: string[];
    reportId?: string;
}

export interface IAgendaRepository {
    create(data: CreateAgendaEventDTO): Promise<AgendaEvent>;
    findById(id: string): Promise<AgendaEvent | null>;
    update(id: string, data: Partial<CreateAgendaEventDTO>): Promise<AgendaEvent>;
    delete(id: string): Promise<void>;
    findByUserId(userId: string, startDate?: Date, endDate?: Date): Promise<AgendaEvent[]>;
    findUpcoming(startTimeLimit: Date): Promise<AgendaEvent[]>;
}
