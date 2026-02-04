import type { INoteRepository } from '../repositories/interfaces/INoteRepository';
import { PrismaNoteRepository } from '../repositories/implementations/PrismaNoteRepository';

export class NoteService {
    private noteRepository: INoteRepository;

    constructor(noteRepository: INoteRepository = new PrismaNoteRepository()) {
        this.noteRepository = noteRepository;
    }

    async saveNote(userId: string, content: string) {
        return this.noteRepository.upsert(userId, content);
    }

    async getNote(userId: string) {
        return this.noteRepository.findByUserId(userId);
    }
}
