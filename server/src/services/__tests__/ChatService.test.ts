import { describe, it, expect, vi, beforeEach } from 'bun:test';
import { ChatService } from '../ChatService';

describe('ChatService', () => {
    let chatService: ChatService;
    let mockRepo: any;

    beforeEach(() => {
        mockRepo = {
            save: vi.fn(),
            findByRoom: vi.fn(),
            deleteByRoom: vi.fn(),
            update: vi.fn(),
            findById: vi.fn(),
            softDelete: vi.fn(),
            markAsRead: vi.fn(),
            countUnread: vi.fn(),
            getUnreadSenders: vi.fn(),
            findExpired: vi.fn(),
            deleteById: vi.fn()
        };
        chatService = new ChatService(mockRepo);
    });

    it('should save a regular message without expiry', async () => {
        const data = { fromId: '1', toId: '2', text: 'Hello', room: '1-2' };
        await chatService.saveMessage(data);

        expect(mockRepo.save).toHaveBeenCalledWith({
            ...data,
            expiresAt: undefined
        });
    });

    it('should save an audio message with 5-minute expiry', async () => {
        const data = { fromId: '1', toId: '2', audioUrl: 'http://audio.mp3', room: '1-2' };
        await chatService.saveMessage(data);

        const callArgs = mockRepo.save.mock.calls[0][0];
        expect(callArgs.audioUrl).toBe('http://audio.mp3');
        expect(callArgs.expiresAt).toBeInstanceOf(Date);

        // Assert expiry is roughly 5 mins from now
        const diff = callArgs.expiresAt.getTime() - Date.now();
        expect(diff).toBeGreaterThan(4 * 60 * 1000);
        expect(diff).toBeLessThan(6 * 60 * 1000);
    });

    it('should filter deleted messages in history', async () => {
        const userId = 'user-1';
        const messages = [
            { id: '1', fromId: 'user-1', text: 'Hi', deletedForSender: false, deletedForEveryone: false },
            { id: '2', fromId: 'user-1', text: 'Deleted me', deletedForSender: true, deletedForEveryone: false },
            { id: '3', fromId: 'user-2', text: 'Deleted all', deletedForSender: false, deletedForEveryone: true }
        ];

        mockRepo.findByRoom.mockResolvedValue(messages);

        const history = await chatService.getHistory('room-1', userId);
        expect(history).toHaveLength(1);
        expect(history[0].id).toBe('1');
    });
});
