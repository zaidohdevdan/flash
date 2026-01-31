import type { ChatMessage } from '../../generated/prisma';

export interface IChatRepository {
    save(data: { fromId: string, toId: string, text?: string, audioUrl?: string, room: string }): Promise<ChatMessage>;
    findByRoom(room: string): Promise<ChatMessage[]>;
    deleteByRoom(room: string): Promise<void>;
}
