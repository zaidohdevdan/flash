import type { ChatMessage } from '../../generated/prisma';

export interface IChatRepository {
    findById(id: string): Promise<ChatMessage | null>;
    save(data: { fromId: string, toId: string, text?: string, audioUrl?: string, audioPublicId?: string, room: string, expiresAt?: Date }): Promise<ChatMessage>;
    findByRoom(room: string): Promise<ChatMessage[]>;
    deleteByRoom(room: string): Promise<void>;
    findExpired(): Promise<ChatMessage[]>;
    deleteById(id: string): Promise<void>;
    update(id: string, text: string): Promise<ChatMessage>;
    softDelete(id: string, type: 'me' | 'everyone'): Promise<ChatMessage>;
}
