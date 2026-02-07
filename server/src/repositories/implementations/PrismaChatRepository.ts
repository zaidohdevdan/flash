import { prisma } from '../../lib/prisma'
import type { ChatMessage } from '../../generated/prisma';
import type { IChatRepository } from '../interfaces/IChatRepository';

export class PrismaChatRepository implements IChatRepository {
    async findById(id: string): Promise<ChatMessage | null> {
        return prisma.chatMessage.findUnique({
            where: { id }
        });
    }

    async save(data: { fromId: string, toId: string, text?: string, audioUrl?: string, audioPublicId?: string, room: string, expiresAt?: Date }): Promise<ChatMessage> {
        return prisma.chatMessage.create({
            data
        });
    }

    async findByRoom(room: string): Promise<ChatMessage[]> {
        return prisma.chatMessage.findMany({
            where: { room },
            orderBy: { createdAt: 'asc' }
        });
    }

    async deleteByRoom(room: string): Promise<void> {
        await prisma.chatMessage.deleteMany({
            where: { room }
        });
    }

    async findExpired(): Promise<ChatMessage[]> {
        return prisma.chatMessage.findMany({
            where: {
                expiresAt: {
                    lte: new Date()
                }
            }
        });
    }

    async deleteById(id: string): Promise<void> {
        await prisma.chatMessage.delete({
            where: { id }
        });
    }

    async update(id: string, text: string): Promise<ChatMessage> {
        return prisma.chatMessage.update({
            where: { id },
            data: { text }
        });
    }

    async softDelete(id: string, type: 'me' | 'everyone'): Promise<ChatMessage> {
        return prisma.chatMessage.update({
            where: { id },
            data: {
                deletedForSender: type === 'me' ? true : undefined,
                deletedForEveryone: type === 'everyone' ? true : undefined
            }
        });
    }

    async markAsRead(room: string, userId: string): Promise<void> {
        await prisma.chatMessage.updateMany({
            where: {
                room,
                toId: userId,
                read: false
            },
            data: {
                read: true
            }
        });
    }

    async countUnread(userId: string): Promise<number> {
        return prisma.chatMessage.count({
            where: {
                toId: userId,
                read: false,
                deletedForEveryone: false
            }
        });
    }

    async getUnreadSenders(userId: string): Promise<string[]> {
        const unread = await prisma.chatMessage.findMany({
            where: {
                toId: userId,
                read: false,
                deletedForEveryone: false
            },
            select: {
                fromId: true
            },
            distinct: ['fromId']
        });

        return unread.map(m => m.fromId);
    }
}
