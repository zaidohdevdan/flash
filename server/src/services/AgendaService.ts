import { Server as SocketIOServer } from 'socket.io';
import type { IAgendaRepository, CreateAgendaEventDTO } from '../repositories/interfaces/IAgendaRepository';
import { PrismaAgendaRepository } from '../repositories/implementations/PrismaAgendaRepository';
import { NotificationService } from './NotificationService';

export class AgendaService {
    private agendaRepository: IAgendaRepository;
    private notificationService: NotificationService;

    constructor(
        agendaRepository: IAgendaRepository = new PrismaAgendaRepository(),
        notificationService: NotificationService = new NotificationService()
    ) {
        this.agendaRepository = agendaRepository;
        this.notificationService = notificationService;
    }

    async createEvent(data: CreateAgendaEventDTO, io?: SocketIOServer) {
        if (new Date(data.startTime) < new Date()) {
            throw new Error('PAST_DATE');
        }
        const event = await this.agendaRepository.create(data);

        // Agendar notificações para os participantes
        await this.scheduleEventNotifications(event, io);

        return event;
    }

    async getById(id: string) {
        return this.agendaRepository.findById(id);
    }

    async updateEvent(id: string, data: Partial<CreateAgendaEventDTO>, io?: SocketIOServer) {
        const event = await this.agendaRepository.update(id, data);

        // Em um sistema real, aqui você cancelaria os agendamentos antigos e criaria novos.
        // Para o MVP, vamos apenas criar novas notificações de "Evento Atualizado" se for relevante.

        return event;
    }

    async deleteEvent(id: string) {
        return this.agendaRepository.delete(id);
    }

    async listUserEvents(userId: string, startDate?: Date, endDate?: Date) {
        return this.agendaRepository.findByUserId(userId, startDate, endDate);
    }

    private async scheduleEventNotifications(event: any, io?: SocketIOServer) {
        const { id, title, startTime, participantIds, type } = event;

        for (const userId of participantIds) {
            // 1. Notificação de "Você foi convidado" (Imediata)
            await this.notificationService.createNotification({
                userId,
                type: 'AGENDA_INVITE',
                title: 'Novo Compromisso',
                message: `Você foi marcado no evento: ${title}`,
                link: `/agenda?event=${id}`
            }, io);

            // 2. Notificação 1 dia antes
            const oneDayBefore = new Date(startTime.getTime() - 24 * 60 * 60 * 1000);
            if (oneDayBefore > new Date()) {
                await this.notificationService.createNotification({
                    userId,
                    type: 'AGENDA_REMINDER',
                    title: 'Lembrete: Evento amanhã',
                    message: `O evento "${title}" começa em 24h.`,
                    scheduledFor: oneDayBefore,
                    link: `/agenda?event=${id}`
                });
            }

            // 3. Notificação 1 hora antes
            const oneHourBefore = new Date(startTime.getTime() - 1 * 60 * 60 * 1000);
            if (oneHourBefore > new Date()) {
                await this.notificationService.createNotification({
                    userId,
                    type: 'AGENDA_REMINDER',
                    title: 'Lembrete: Evento em 1h',
                    message: `O evento "${title}" começa em 1 hora. Prepare-se!`,
                    scheduledFor: oneHourBefore,
                    link: `/agenda?event=${id}`
                });
            }

            // 4. Notificação 5 minutos antes
            const fiveMinutesBefore = new Date(startTime.getTime() - 5 * 60 * 1000);
            if (fiveMinutesBefore > new Date()) {
                await this.notificationService.createNotification({
                    userId,
                    type: 'AGENDA_REMINDER',
                    title: 'Lembrete: Em 5 minutos!',
                    message: `O evento "${title}" começa em apenas 5 minutos.`,
                    scheduledFor: fiveMinutesBefore,
                    link: `/agenda?event=${id}`
                });
            }
        }
    }
}
