import { cloudinary } from '../config/cloudinary';
import type { IChatRepository } from '../repositories/interfaces/IChatRepository';
import { PrismaChatRepository } from '../repositories/implementations/PrismaChatRepository';

export class ChatService {
    private chatRepository: IChatRepository;

    static getRoomName(id1: string, id2: string) {
        return `private-${[String(id1), String(id2)].map(id => id.trim().toLowerCase()).sort().join('-')}`;
    }

    constructor(chatRepository: IChatRepository = new PrismaChatRepository()) {
        this.chatRepository = chatRepository;
    }

    async saveMessage(data: { fromId: string, toId: string, text?: string, audioUrl?: string, audioPublicId?: string, room: string, createdAt?: Date }) {
        let expiresAt: Date | undefined;
        if (data.audioUrl) {
            expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutos
        }
        return this.chatRepository.save({ ...data, expiresAt });
    }

    async getHistory(room: string, userId: string) {
        const messages = await this.chatRepository.findByRoom(room);

        // Filtrar mensagens
        return messages.filter(msg => {
            if (msg.deletedForEveryone) return false;
            if (msg.fromId === userId && msg.deletedForSender) return false;
            if (msg.toId === userId && msg.deletedForReceiver) return false;
            return true;
        });
    }

    async deleteHistory(room: string, userId: string) {
        return this.chatRepository.softDeleteByRoom(room, userId);
    }

    async updateMessage(id: string, text: string) {
        return this.chatRepository.update(id, text);
    }

    async deleteMessage(id: string, userId: string, type: 'me' | 'everyone' = 'everyone') {
        const message = await this.chatRepository.findById(id);
        if (!message) throw new Error('Mensagem não encontrada.');

        // Se for "para todos":
        if (type === 'everyone') {
            // Se tiver áudio/mídia, remover do Cloudinary
            if (message.audioPublicId) {
                try {
                    await cloudinary.uploader.destroy(message.audioPublicId, { resource_type: 'video' });
                } catch (e) {
                    console.error('[ChatService] Error deleting from Cloudinary:', e);
                }
            }
            // Chama o softDelete com tag 'everyone'
            return this.chatRepository.softDelete(id, 'everyone');
        }

        // Se for "para mim":
        // Apenas marca flag deletedForSender
        if (type === 'me') {
            return this.chatRepository.softDelete(id, 'me');
        }
    }

    async markAsRead(room: string, userId: string) {
        return this.chatRepository.markAsRead(room, userId);
    }

    async getUnreadCount(userId: string) {
        return this.chatRepository.countUnread(userId);
    }

    async getUnreadSenders(userId: string) {
        return this.chatRepository.getUnreadSenders(userId);
    }

    async getMessageById(id: string) {
        return this.chatRepository.findById(id);
    }

    async cleanupExpiredMessages() {
        const expired = await this.chatRepository.findExpired();
        for (const msg of expired) {
            if (msg.audioPublicId) {
                try {
                    await cloudinary.uploader.destroy(msg.audioPublicId, { resource_type: 'video' });
                } catch (e) {
                    console.error('[ChatService] Error deleting from Cloudinary:', e);
                }
            }
            await this.chatRepository.deleteById(msg.id);
            console.log(`[ChatService] Mensagem expirada removida: ${msg.id}`);
        }
    }
}
