import cron from 'node-cron';
import { Server as SocketIOServer } from 'socket.io';
import { NotificationService } from '../services/NotificationService';
import { ChatService } from '../services/ChatService';

const notificationService = new NotificationService();
const chatService = new ChatService();

export function startScheduler(io: SocketIOServer) {
    console.log('[Scheduler] Job system initialized.');

    // 1. Verificar notificações agendadas a cada minuto
    cron.schedule('* * * * *', async () => {
        try {
            await notificationService.processScheduledNotifications(io);
        } catch (error) {
            console.error('[Scheduler] Error processing notifications:', error);
        }
    });

    // 2. Limpeza de mensagens expiradas a cada 30 segundos
    cron.schedule('*/30 * * * * *', async () => {
        try {
            await chatService.cleanupExpiredMessages();
        } catch (error) {
            console.error('[Scheduler] Error cleaning up messages:', error);
        }
    });

    // 3. Limpeza de notificações antigas/lidas (uma vez por dia)
    cron.schedule('0 0 * * *', async () => {
        try {
            // Deleta notificações lidas com mais de 7 dias
            await notificationService.deleteOld(7);
        } catch (error) {
            console.error('[Scheduler] Error cleaning up notifications:', error);
        }
    });
}
