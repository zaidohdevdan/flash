import { Server as SocketIOServer } from 'socket.io';
import type { INotificationRepository } from '../repositories/interfaces/INotificationRepository';
import { PrismaNotificationRepository } from '../repositories/implementations/PrismaNotificationRepository';

export interface NotifyDTO {
    userId: string;
    fromId?: string;
    type: string;
    title: string;
    message: string;
    link?: string;
    scheduledFor?: Date;
}

export class NotificationService {
    private notificationRepository: INotificationRepository;

    constructor(notificationRepository: INotificationRepository = new PrismaNotificationRepository()) {
        this.notificationRepository = notificationRepository;
    }

    async createNotification(data: NotifyDTO, io?: SocketIOServer) {
        // Persistir no banco
        const notification = await this.notificationRepository.create(data);

        // Se for para envio imediato (não agendada para o futuro) e o socket estiver disponível
        if (!data.scheduledFor || data.scheduledFor <= new Date()) {
            if (io) {
                io.to(data.userId).emit('new_notification', {
                    id: notification.id,
                    type: notification.type,
                    title: notification.title,
                    message: notification.message,
                    link: notification.link,
                    createdAt: notification.createdAt
                });
            }
        }

        return notification;
    }

    async listUserNotifications(userId: string) {
        return this.notificationRepository.findByUserId(userId);
    }

    async markAsRead(id: string) {
        return this.notificationRepository.markAsRead(id);
    }

    async markAllAsRead(userId: string) {
        return this.notificationRepository.markAllAsRead(userId);
    }

    async processScheduledNotifications(io: SocketIOServer) {
        const now = new Date();
        const pending = await this.notificationRepository.findPending(now);

        for (const notification of pending) {
            // Emitir via socket
            io.to(notification.userId).emit('new_notification', {
                id: notification.id,
                type: notification.type,
                title: notification.title,
                message: notification.message,
                link: notification.link,
                createdAt: notification.createdAt
            });

            // Marcar como enviada para evitar re-processamento
            await this.notificationRepository.markAsSent(notification.id);
        }
    }
    async deleteOld(days: number) {
        return this.notificationRepository.deleteOld(days);
    }
}
