import { useEffect, useState, useRef, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { toast } from 'react-hot-toast';
import { db } from '../services/db';
import { api } from '../services/api';

const SOCKET_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

interface User {
    id: string;
    name: string;
    role: string;
}

interface NotificationPayload {
    title: string;
    message: string;
    [key: string]: unknown;
}

interface UseDashboardSocketOptions {
    user: User | null;
    onNotification?: (data: { from: string; fromName?: string; text: string }) => void;
    onConferenceInvite?: (data: { roomId: string; hostId: string; hostRole: string }) => void;
    onNewNotification?: (data: NotificationPayload) => void;
    onNewReport?: () => void;
    onReportStatusUpdate?: () => void;
}

export const useDashboardSocket = ({ user, onNotification, onConferenceInvite, onNewNotification, onNewReport, onReportStatusUpdate }: UseDashboardSocketOptions) => {
    const [socket, setSocket] = useState<Socket | null>(null);
    const [onlineUserIds, setOnlineUserIds] = useState<string[]>([]);
    const [unreadMessages, setUnreadMessages] = useState<Record<string, boolean>>({});
    const [isConnected, setIsConnected] = useState(false);

    // Using ref for unread state to access in handlers without re-firing effects
    const unreadMessagesRef = useRef<Record<string, boolean>>({});

    const notificationAudioRef = useRef<HTMLAudioElement | null>(null);
    const playNotificationSound = useCallback(() => {
        if (!notificationAudioRef.current) {
            notificationAudioRef.current = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
        }
        notificationAudioRef.current.play().catch(e => console.error('Erro ao tocar som:', e));
    }, []);

    // Use a ref for the callback to avoid re-triggering the socket connection effect
    const onNotificationRef = useRef(onNotification);
    const onConferenceInviteRef = useRef(onConferenceInvite);
    const onNewNotificationRef = useRef(onNewNotification);
    const onNewReportRef = useRef(onNewReport);
    const onReportStatusUpdateRef = useRef(onReportStatusUpdate);

    useEffect(() => {
        onNotificationRef.current = onNotification;
        onConferenceInviteRef.current = onConferenceInvite;
        onNewNotificationRef.current = onNewNotification;
        onNewReportRef.current = onNewReport;
        onReportStatusUpdateRef.current = onReportStatusUpdate;
    }, [onNotification, onConferenceInvite, onNewNotification, onNewReport, onReportStatusUpdate]);

    useEffect(() => {
        if (!user?.id) return;

        // Use stable primitives for the connection
        const userId = user.id;
        const userRole = user.role;
        const userName = user.name;

        const newSocket = io(SOCKET_URL, {
            query: { userId, role: userRole, userName }
        });

        // eslint-disable-next-line react-hooks/set-state-in-effect
        setSocket(newSocket);

        newSocket.on('connect', () => setIsConnected(true));
        newSocket.on('disconnect', () => setIsConnected(false));

        newSocket.on('initial_presence_list', (ids: string[]) => {
            setOnlineUserIds(ids);
        });

        newSocket.on('user_online', ({ userId }: { userId: string }) => {
            setOnlineUserIds(prev => prev.includes(userId) ? prev : [...prev, userId]);
        });

        newSocket.on('user_offline', ({ userId }: { userId: string }) => {
            setOnlineUserIds(prev => prev.filter(id => id !== userId));
        });

        const handleChatNotification = async (data: { from: string; fromName?: string; text: string; roomName?: string }) => {
            // Persist message metadata for offline visibility
            if (data.roomName) {
                await db.chatMessages.put({
                    fromId: data.from,
                    toId: user.id,
                    roomName: data.roomName,
                    text: data.text,
                    createdAt: new Date().toISOString(),
                    read: false
                }).catch(e => console.error('Error persisting chat notification:', e));
            }

            // Always update internal unread state
            setUnreadMessages(prev => {
                const next = { ...prev, [data.from]: true };
                unreadMessagesRef.current = next;
                return next;
            });

            if (onNotificationRef.current) {
                onNotificationRef.current(data);
            } else {
                playNotificationSound();
                toast(`Mensagem de ${data.fromName || 'Contato'}: ${data.text}`, {
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
        };

        newSocket.on('new_chat_notification', handleChatNotification);

        newSocket.on('conference_invite', (data: { roomId: string; hostId: string; hostRole: string }) => {
            if (onConferenceInviteRef.current) {
                onConferenceInviteRef.current(data);
            }
        });

        newSocket.on('new_notification', async (data: NotificationPayload) => {
            // Persist to Dexie for offline access
            const notifId = (data.id as string) || `local-${Date.now()}`;
            await db.notifications.put({
                id: notifId,
                title: data.title,
                message: data.message,
                type: (data.type as string) || 'system',
                read: false,
                createdAt: (data.createdAt as string) || new Date().toISOString(),
                link: data.link as string | undefined
            }).catch(e => console.error('Error persisting notification:', e));

            if (onNewNotificationRef.current) {
                onNewNotificationRef.current(data);
            } else {
                playNotificationSound();
                toast.success(`${data.title}: ${data.message}`, {
                    icon: '🔔',
                    duration: 5000,
                    style: {
                        borderRadius: '1.5rem',
                        background: '#3b82f6',
                        color: '#fff',
                        fontSize: '12px',
                        fontWeight: 'bold'
                    }
                });
            }
        });

        // Listen for new reports
        newSocket.on('new_report_to_review', () => {
            if (onNewReportRef.current) {
                onNewReportRef.current();
            }
        });

        // Listen for report status updates
        newSocket.on('report_status_updated_for_supervisor', () => {
            if (onReportStatusUpdateRef.current) {
                onReportStatusUpdateRef.current();
            }
        });

        return () => {
            newSocket.off('connect');
            newSocket.off('disconnect');
            newSocket.off('initial_presence_list');
            newSocket.off('user_online');
            newSocket.off('user_offline');
            newSocket.off('new_chat_notification');
            newSocket.off('conference_invite');
            newSocket.off('new_notification');
            newSocket.off('new_report_to_review');
            newSocket.off('report_status_updated_for_supervisor');
            newSocket.disconnect();
            setSocket(null);
        };
    }, [user?.id, user?.name, user?.role, playNotificationSound]);

    // Fetch initial unread status on mount/reconnect
    useEffect(() => {
        if (!user?.id || !isConnected) return;

        const fetchUnread = async () => {
            try {
                const res = await api.get('/chat/unread-senders');
                const senderIds = res.data; // Array of IDs
                const unreadMap: Record<string, boolean> = {};
                senderIds.forEach((id: string) => {
                    unreadMap[id] = true;
                });
                setUnreadMessages(unreadMap);
                unreadMessagesRef.current = unreadMap;
            } catch (error) {
                console.error('Erro ao buscar estados de não lidas:', error);
            }
        };

        fetchUnread();
    }, [user?.id, isConnected]);

    const markAsRead = useCallback((userId: string) => {
        setUnreadMessages(prev => {
            const next = { ...prev, [userId]: false };
            unreadMessagesRef.current = next;
            return next;
        });
    }, []);

    return {
        socket,
        onlineUserIds,
        unreadMessages,
        isConnected,
        playNotificationSound,
        markAsRead
    };
};
