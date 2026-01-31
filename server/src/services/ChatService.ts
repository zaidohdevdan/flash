import type { IChatRepository } from '../repositories/interfaces/IChatRepository';
import { PrismaChatRepository } from '../repositories/implementations/PrismaChatRepository';

export class ChatService {
    private chatRepository: IChatRepository;

    constructor(chatRepository: IChatRepository = new PrismaChatRepository()) {
        this.chatRepository = chatRepository;
    }

    async saveMessage(data: { fromId: string, toId: string, text?: string, audioUrl?: string, room: string }) {
        return this.chatRepository.save(data);
    }

    async getHistory(room: string) {
        return this.chatRepository.findByRoom(room);
    }

    async deleteHistory(room: string) {
        return this.chatRepository.deleteByRoom(room);
    }
}
