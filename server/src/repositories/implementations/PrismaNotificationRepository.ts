import { prisma } from '../../lib/prisma';
import type { Notification } from '../../generated/prisma';
import type { CreateNotificationDTO, INotificationRepository } from '../interfaces/INotificationRepository';

export class PrismaNotificationRepository implements INotificationRepository {
    async create(data: CreateNotificationDTO): Promise<Notification> {
        return prisma.notification.create({
            data: {
                userId: data.userId,
                fromId: data.fromId,
                type: data.type,
                title: data.title,
                message: data.message,
                link: data.link,
                scheduledFor: data.scheduledFor
            }
        });
    }

    async findById(id: string): Promise<Notification | null> {
        return prisma.notification.findUnique({ where: { id } });
    }

    async findByUserId(userId: string, limit: number = 20): Promise<Notification[]> {
        return prisma.notification.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
            take: limit
        });
    }

    async markAsRead(id: string): Promise<Notification> {
        return prisma.notification.update({
            where: { id },
            data: { read: true }
        });
    }

    async markAllAsRead(userId: string): Promise<void> {
        await prisma.notification.updateMany({
            where: { userId, read: false },
            data: { read: true }
        });
    }

    async findPending(now: Date): Promise<Notification[]> {
        return prisma.notification.findMany({
            where: {
                scheduledFor: {
                    lte: now,
                    not: null
                }
            }
        });
    }

    async markAsSent(id: string): Promise<void> {
        await prisma.notification.update({
            where: { id },
            data: { scheduledFor: null }
        });
    }

    async deleteOld(days: number): Promise<void> {
        const date = new Date();
        date.setDate(date.getDate() - days);
        await prisma.notification.deleteMany({
            where: {
                createdAt: { lt: date },
                read: true
            }
        });
    }

    async delete(id: string): Promise<void> {
        await prisma.notification.delete({ where: { id } });
    }
}
