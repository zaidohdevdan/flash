import { Outlet, useNavigate } from 'react-router-dom';
import { DashboardLayout } from './DashboardLayout';
import { useAuth } from '../contexts/AuthContext';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../services/db';
import { api } from '../services/api';
import { toast } from 'react-hot-toast';

export function SupervisorLayout() {
    const { user, signOut } = useAuth();
    const navigate = useNavigate();
    const notifications = useLiveQuery(() => db.notifications.orderBy('createdAt').reverse().toArray()) || [];

    const handleMarkAsRead = async (id: string) => {
        try {
            await Promise.all([
                api.patch(`/notifications/${id}/read`),
                db.notifications.update(id, { read: true })
            ]);
        } catch (error) {
            console.error('Erro ao marcar como lida:', error);
            await db.notifications.update(id, { read: true });
        }
    };

    const handleMarkAllAsRead = async () => {
        try {
            await api.post('/notifications/read-all');
            const allLocal = await db.notifications.toArray();
            await db.transaction('rw', db.notifications, async () => {
                for (const n of allLocal) {
                    await db.notifications.update(n.id, { read: true });
                }
            });
            toast.success('Todas marcadas como lidas');
        } catch (error) {
            console.error('Erro ao marcar todas:', error);
        }
    };

    const handleDeleteNotification = async (id: string) => {
        try {
            await Promise.all([
                api.delete(`/notifications/${id}`),
                db.notifications.delete(id)
            ]);
        } catch (error) {
            console.error('Erro:', error);
            await db.notifications.delete(id);
        }
    };

    return (
        <DashboardLayout
            user={user || undefined}
            onLogout={signOut}
            onProfileClick={() => navigate('/profile')}
            notifications={notifications}
            onMarkAsRead={handleMarkAsRead}
            onMarkAllAsRead={handleMarkAllAsRead}
            onDelete={handleDeleteNotification}
        >
            <Outlet />
        </DashboardLayout>
    );
}
