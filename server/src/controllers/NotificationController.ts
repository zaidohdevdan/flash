import type { Request, Response } from 'express';
import { NotificationService } from '../services/NotificationService';

const notificationService = new NotificationService();

export const NotificationController = {
    index: async (req: Request, res: Response) => {
        const userId = req.userId!;
        try {
            const notifications = await notificationService.listUserNotifications(userId);
            return res.json(notifications);
        } catch (error) {
            return res.status(500).json({ error: 'Erro ao listar notificações' });
        }
    },

    markRead: async (req: Request, res: Response) => {
        const { id } = req.params;
        try {
            const notification = await notificationService.markAsRead(String(id));
            return res.json(notification);
        } catch (error) {
            return res.status(500).json({ error: 'Erro ao marcar como lida' });
        }
    },

    markAllRead: async (req: Request, res: Response) => {
        const userId = req.userId!;
        try {
            await notificationService.markAllAsRead(userId);
            return res.status(204).send();
        } catch (error) {
            return res.status(500).json({ error: 'Erro ao marcar todas como lidas' });
        }
    }
};
