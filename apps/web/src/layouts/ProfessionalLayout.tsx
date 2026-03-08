import { useState, useCallback, useEffect, useMemo, useRef } from 'react';
import { Outlet, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../services/api';
import { toast } from 'react-hot-toast';
import { DashboardLayout } from './DashboardLayout';
import { useDashboardSocket } from '../hooks/useDashboardSocket';
import { db } from '../services/db';
import { syncAll } from '../services/offlineSync';
import { useLiveQuery } from 'dexie-react-hooks';
import { ConferenceModal } from '../components/domain/modals/ConferenceModal';
import { ConferenceInviteNotification } from '../components/ui/ConferenceInviteNotification';
import { CloudOff, RefreshCw } from 'lucide-react';
import { Card, Button } from '../components/ui';

export function ProfessionalLayout() {
    const navigate = useNavigate();
    const { user, signOut, notificationsEnabled } = useAuth();
    const [searchParams, setSearchParams] = useSearchParams();
    const [searchTerm, setSearchTerm] = useState('');
    const hasShownSummaryRef = useRef(false);

    // Dexie Notifications & Offline Support
    const notifications = useLiveQuery(() => db.notifications.orderBy('createdAt').reverse().toArray()) || [];
    const pendingReports = useLiveQuery(() => db.pendingReports.toArray());

    const activeRoom = searchParams.get('conference');
    const setActiveRoom = (roomId: string | null) => {
        const newParams = new URLSearchParams(searchParams);
        if (roomId) {
            newParams.set('conference', roomId);
        } else {
            newParams.delete('conference');
        }
        setSearchParams(newParams, { replace: true });
    };
    const [pendingInvite, setPendingInvite] = useState<{ roomId: string; hostId: string; hostName: string } | null>(null);

    const socketUser = useMemo(() => user ? {
        id: user.id || '',
        name: user.name || '',
        role: user.role || ''
    } : null, [user]);

    const { socket, onlineUserIds, unreadMessages, markAsRead, playNotificationSound } = useDashboardSocket({
        user: socketUser,
        notificationsEnabled,
        onConferenceInvite: (data) => {
            if (activeRoom) return;
            setPendingInvite({
                roomId: data.roomId,
                hostId: data.hostId,
                hostName: data.hostRole === 'SUPERVISOR' ? 'Supervisor' : 'Gerente'
            });
            playNotificationSound();
        },
    });

    const fetchNotifications = useCallback(async () => {
        if (hasShownSummaryRef.current) return;
        hasShownSummaryRef.current = true;

        try {
            const res = await api.get('/notifications');
            const remoteNotifications = res.data;
            let unreadCount = 0;

            await db.transaction('rw', db.notifications, async () => {
                for (const notif of remoteNotifications) {
                    if (!notif.read) unreadCount++;
                    await db.notifications.put({
                        id: String(notif.id),
                        title: notif.title,
                        message: notif.message,
                        type: notif.type || 'system',
                        read: !!notif.read,
                        createdAt: notif.createdAt,
                        link: notif.link || undefined
                    });
                }
            });

            if (unreadCount > 0) {
                toast(`Você tem ${unreadCount} ${unreadCount === 1 ? 'notificação não lida' : 'notificações não lidas'} `, {
                    icon: '🔔',
                    duration: 4000
                });
            }

            const chatRes = await api.get('/chat/unread-count');
            const unreadChatCount = chatRes.data.count;

            if (unreadChatCount > 0) {
                toast(`Você tem ${unreadChatCount} ${unreadChatCount === 1 ? 'mensagem não lida' : 'mensagens não lidas'} no chat`, {
                    icon: '💬',
                    duration: 5000,
                    style: {
                        borderRadius: '1.5rem',
                        background: '#333',
                        color: '#fff',
                        fontSize: '12px',
                        fontWeight: 'bold'
                    }
                });
            }
        } catch {
            console.error('Erro ao buscar notificações');
        }
    }, []);

    useEffect(() => {
        if (user?.id) {
            fetchNotifications();
        }
    }, [user?.id, fetchNotifications]);

    useEffect(() => {
        if (navigator.onLine) {
            syncAll();
        }
        const handleOnline = () => {
            toast.success('Conexão restabelecida! Sincronizando dados...', { icon: '🌐' });
            syncAll();
        };
        const handleOffline = () => {
            toast.error('Você está offline. O sistema salvará as fotos localmente.', { icon: '📡' });
        };
        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);
        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);


    const handleMarkAsRead = async (id: string) => {
        try {
            await api.patch(`/notifications/${id}/read`);
            await db.notifications.update(id, { read: true });
        } catch {
            await db.notifications.update(id, { read: true });
            toast.error('Erro ao sincronizar leitura com servidor');
        }
    };

    const handleDeleteNotification = async (id: string) => {
        try {
            await api.delete(`/notifications/${id}`);
            await db.notifications.delete(id);
            toast.success("Notificação removida");
        } catch (error) {
            console.error('Erro ao deletar notificação:', error);
            await db.notifications.delete(id);
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
            toast.success('Todas as notificações marcadas como lidas');
        } catch {
            toast.error('Erro ao marcar todas como lidas');
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
            activeRoom={activeRoom}
            onRejoinRoom={setActiveRoom}
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
        >
            <div className="relative h-full flex flex-col">
                {/* Offline Mode Alert */}
                <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 z-20 relative">
                    {pendingReports && pendingReports.length > 0 && (
                        <Card className="mt-4 p-3 sm:p-4 border-amber-500/30 bg-amber-500/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0 animate-in slide-in-from-top-4 duration-500 backdrop-blur-md rounded-2xl">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-amber-500/20 text-amber-500 rounded-xl">
                                    <CloudOff className="w-5 h-5" />
                                </div>
                                <div>
                                    <h4 className="text-[10px] font-black text-amber-500 uppercase tracking-widest">Relatórios Offline</h4>
                                    <p className="text-[9px] font-bold text-amber-500/80 uppercase tracking-tighter">{pendingReports.length} pendentes</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => syncAll()}
                                    className="!text-amber-500 hover:bg-amber-500/10 !px-4 text-[10px] font-black uppercase tracking-widest"
                                >
                                    <RefreshCw className="w-3 h-3 mr-2" />
                                    Sincronizar
                                </Button>
                            </div>
                        </Card>
                    )}
                </div>

                <div className="flex-1 overflow-y-auto w-full">
                    <Outlet context={{ socket, onlineUserIds, unreadMessages, markAsRead, searchTerm, setSearchTerm }} />
                </div>
            </div>

            <ConferenceModal
                isOpen={!!activeRoom}
                onClose={() => setActiveRoom(null)}
                roomName={activeRoom || ''}
                userName={user?.name}
            />

            <ConferenceInviteNotification
                isOpen={!!pendingInvite}
                hostName={pendingInvite?.hostName || ''}
                onAccept={() => {
                    setActiveRoom(pendingInvite?.roomId || null);
                    setPendingInvite(null);
                }}
                onDecline={() => setPendingInvite(null)}
            />
        </DashboardLayout>
    );
}
