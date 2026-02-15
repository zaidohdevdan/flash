import type { Notification } from '../../generated/prisma';

export interface CreateNotificationDTO {
    userId: string;
    fromId?: string;
    type: string;
    title: string;
    message: string;
    link?: string;
    scheduledFor?: Date;
}

export interface INotificationRepository {
    create(data: CreateNotificationDTO): Promise<Notification>;
    findById(id: string): Promise<Notification | null>;
    findByUserId(userId: string, limit?: number): Promise<Notification[]>;
    markAsRead(id: string): Promise<Notification>;
    markAllAsRead(userId: string): Promise<void>;
    findPending(now: Date): Promise<Notification[]>;
    markAsSent(id: string): Promise<void>; // Clears scheduledFor
    deleteOld(days: number): Promise<void>;
    delete(id: string): Promise<void>;
}
