import type { Note } from '../../generated/prisma';

export interface INoteRepository {
    upsert(userId: string, content: string): Promise<Note>;
    findByUserId(userId: string): Promise<Note | null>;
}
