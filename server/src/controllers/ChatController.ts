import type { Request, Response } from 'express';
import { ChatService } from '../services/ChatService';

const chatService = new ChatService();

export const ChatController = {
    async listHistory(req: Request, res: Response) {
        try {
            const { room } = req.params;
            const userId = req.userId!;
            const history = await chatService.getHistory(room as string, userId);
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
    },

    async updateMessage(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const { text } = req.body;
            const userId = req.userId!;

            const message = await chatService.getMessageById(id as string);
            if (!message) return res.status(404).json({ error: 'Mensagem não encontrada.' });
            if (message.fromId !== userId) return res.status(403).json({ error: 'Não autorizado.' });

            const updated = await chatService.updateMessage(id as string, text);
            return res.json(updated);
        } catch (error) {
            console.error('Erro ao editar mensagem:', error);
            return res.status(500).json({ error: 'Erro ao editar mensagem.' });
        }
    },

    async deleteMessage(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const userId = req.userId!;

            const message = await chatService.getMessageById(id as string);
            if (!message) return res.status(404).json({ error: 'Mensagem não encontrada.' });
            if (message.fromId !== userId) return res.status(403).json({ error: 'Não autorizado.' });

            const { type } = req.query; // 'me' | 'everyone'
            const deleteType = (type === 'me' || type === 'everyone') ? type : 'everyone';

            await chatService.deleteMessage(id as string, userId, deleteType);
            return res.status(204).send();
        } catch (error) {
            console.error('Erro ao deletar mensagem:', error);
            return res.status(500).json({ error: 'Erro ao deletar mensagem.' });
        }
    }
}
