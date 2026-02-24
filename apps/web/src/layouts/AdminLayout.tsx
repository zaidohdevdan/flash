import { Outlet } from 'react-router-dom';
import { DashboardLayout } from './DashboardLayout';
import { useAuth } from '../contexts/AuthContext';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../services/db';
import { api } from '../services/api';

export function AdminLayout() {
    const { user, signOut } = useAuth();

    const notifications = useLiveQuery(() => db.notifications.orderBy('createdAt').reverse().toArray()) || [];

    const handleMarkAsRead = async (id: string) => {
        try {
            await Promise.all([
                api.patch(`/notifications/${id}/read`),
                db.notifications.update(id, { read: true })
            ]);
        } catch (error) {
            console.error('Erro ao marcar como lida:', error);
        }
    };

    const handleMarkAllAsRead = async () => {
        try {
            await api.post('/notifications/mark-all-read');
            const allLocal = await db.notifications.toArray();
            await db.transaction('rw', db.notifications, async () => {
                for (const n of allLocal) {
                    await db.notifications.update(n.id, { read: true });
                }
            });
        } catch (error) {
            console.error('Erro ao marcar todas como lidas:', error);
        }
    };

    const handleDeleteNotification = async (id: string) => {
        try {
            await Promise.all([
                api.delete(`/notifications/${id}`),
                db.notifications.delete(id)
            ]);
        } catch (error) {
            console.error('Erro ao excluir notificação:', error);
        }
    };

    return (
        <DashboardLayout
            user={user || undefined}
            onLogout={signOut}
            notifications={notifications}
            onMarkAsRead={handleMarkAsRead}
            onMarkAllAsRead={handleMarkAllAsRead}
            onDelete={handleDeleteNotification}
        >
            <Outlet />
        </DashboardLayout>
    );
}
