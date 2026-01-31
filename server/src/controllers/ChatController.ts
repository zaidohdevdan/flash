import type { Request, Response } from 'express';
import { ChatService } from '../services/ChatService';

const chatService = new ChatService();

export const ChatController = {
    async listHistory(req: Request, res: Response) {
        try {
            const { room } = req.params;
            const history = await chatService.getHistory(room as string);
            return res.json(history);
        } catch (error) {
            console.error('Erro ao listar histórico do chat:', error);
            return res.status(500).json({ error: 'Erro ao listar histórico.' });
        }
    },

    async clearHistory(req: Request, res: Response) {
        try {
            const { room } = req.params;
            await chatService.deleteHistory(room as string);
            return res.status(204).send();
        } catch (error) {
            console.error('Erro ao excluir histórico do chat:', error);
            return res.status(500).json({ error: 'Erro ao excluir histórico.' });
        }
    }
}
