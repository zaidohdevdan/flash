import { cloudinary } from '../config/cloudinary';
import type { IChatRepository } from '../repositories/interfaces/IChatRepository';
import { PrismaChatRepository } from '../repositories/implementations/PrismaChatRepository';

export class ChatService {
    private chatRepository: IChatRepository;

    constructor(chatRepository: IChatRepository = new PrismaChatRepository()) {
        this.chatRepository = chatRepository;
    }

    async saveMessage(data: { fromId: string, toId: string, text?: string, audioUrl?: string, audioPublicId?: string, room: string }) {
        let expiresAt: Date | undefined;
        if (data.audioUrl) {
            expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutos
        }
        return this.chatRepository.save({ ...data, expiresAt });
    }

    async getHistory(room: string) {
        return this.chatRepository.findByRoom(room);
    }

    async deleteHistory(room: string) {
        return this.chatRepository.deleteByRoom(room);
    }

    async updateMessage(id: string, text: string) {
        return this.chatRepository.update(id, text);
    }

    async deleteMessage(id: string) {
        return this.chatRepository.deleteById(id);
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
