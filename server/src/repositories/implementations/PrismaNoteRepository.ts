import { prisma } from '../../lib/prisma';
import type { Note } from '../../generated/prisma';
import type { INoteRepository } from '../interfaces/INoteRepository';

export class PrismaNoteRepository implements INoteRepository {
    async upsert(userId: string, content: string): Promise<Note> {
        const existing = await prisma.note.findFirst({ where: { userId } });

        if (existing) {
            return prisma.note.update({
                where: { id: existing.id },
                data: { content }
            });
        }

        return prisma.note.create({
            data: { userId, content }
        });
    }

    async findByUserId(userId: string): Promise<Note | null> {
        return prisma.note.findFirst({
            where: { userId }
        });
    }
}
