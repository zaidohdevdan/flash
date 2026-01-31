import { prisma } from '../../lib/prisma'
import type { ChatMessage } from '../../generated/prisma';
import type { IChatRepository } from '../interfaces/IChatRepository';

export class PrismaChatRepository implements IChatRepository {
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
}
