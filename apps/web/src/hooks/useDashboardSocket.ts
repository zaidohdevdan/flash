import { useEffect, useState, useRef, useCallback } from 'react';
import { io } from 'socket.io-client';
import { toast } from 'react-hot-toast';
import { db } from '../services/db';
import { api } from '../services/api';
import type { Socket } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:3000';

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
    notificationsEnabled?: boolean;
}

export const useDashboardSocket = ({
    user,
    onNotification,
    onConferenceInvite,
    onNewNotification,
    onNewReport,
    onReportStatusUpdate,
    notificationsEnabled = true,
}: UseDashboardSocketOptions) => {
    // Internal ref for the socket — event handlers always access the live instance.
    const socketRef = useRef<Socket | null>(null);

    // State-driven values for UI reactivity
    const [onlineUserIds, setOnlineUserIds] = useState<string[]>([]);
    const [unreadMessages, setUnreadMessages] = useState<Record<string, boolean>>({});
    const [isConnected, setIsConnected] = useState(false);

    // socket state: updated inside event callbacks (safe per React rules — not in effect body)
    const [socket, setSocket] = useState<Socket | null>(null);

    // Version counter: triggers re-render so consumers see the updated socket state.
    const [, setSocketVersion] = useState(0);

    // Ref mirror of unreadMessages to avoid stale closures in async handlers
    const unreadMessagesRef = useRef<Record<string, boolean>>({});

    // Audio
    const notificationAudioRef = useRef<HTMLAudioElement | null>(null);
    const playNotificationSound = useCallback(() => {
        if (!notificationsEnabled) return;
        if (!notificationAudioRef.current) {
            // Tiny base64 WAV beep — no external CDN dependency, works in all browsers
            notificationAudioRef.current = new Audio(
                'data:audio/wav;base64,UklGRl9vT19XQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YU' +
                'lvT18AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=='
            );
        }
        notificationAudioRef.current.play().catch(e => console.error('Erro ao tocar som:', e));
    }, [notificationsEnabled]);

    // Stable refs for callbacks — avoids re-creating the socket when callbacks change
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

    // Main connection effect
    useEffect(() => {
        if (!user?.id) return;

        const userId = user.id;
        const userRole = user.role;
        const userName = user.name;

        const newSocket = io(SOCKET_URL, {
            query: { userId, role: userRole, userName },
        });

        socketRef.current = newSocket;

        newSocket.on('connect', () => {
            setSocket(newSocket);  // safe: called inside an event callback, not effect body
            setIsConnected(true);
            setSocketVersion(v => v + 1);
        });

        newSocket.on('disconnect', () => {
            setSocket(null);
            setIsConnected(false);
            setSocketVersion(v => v + 1);
        });

        newSocket.on('connect_error', (err) => {
            console.error('[Socket] Connection Error:', err.message);
            setSocket(null);
            setIsConnected(false);
        });

        newSocket.on('initial_presence_list', (ids: string[]) => {
            setOnlineUserIds(ids);
        });

        newSocket.on('user_online', ({ userId: uid }: { userId: string }) => {
            setOnlineUserIds(prev => prev.includes(uid) ? prev : [...prev, uid]);
        });

        newSocket.on('user_offline', ({ userId: uid }: { userId: string }) => {
            setOnlineUserIds(prev => prev.filter(id => id !== uid));
        });

        const handleChatNotification = async (data: {
            id?: string;
            from: string;
            fromName?: string;
            text: string;
            roomName?: string;
        }) => {
            if (data.roomName) {
                await db.chatMessages.put({
                    id: data.id,
                    fromId: data.from,
                    toId: userId,
                    roomName: data.roomName,
                    text: data.text,
                    createdAt: new Date().toISOString(),
                    read: false,
                }).catch(e => console.error('Error persisting chat notification:', e));
            }

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
                        fontWeight: 'bold',
                    },
                });
            }
        };

        newSocket.on('new_chat_notification', handleChatNotification);

        newSocket.on('conference_invite', (data: { roomId: string; hostId: string; hostRole: string }) => {
            onConferenceInviteRef.current?.(data);
        });

        newSocket.on('new_notification', async (data: NotificationPayload) => {
            const notifId = (data.id as string) || `local-${Date.now()}`;
            await db.notifications.put({
                id: notifId,
                title: data.title,
                message: data.message,
                type: (data.type as string) || 'system',
                read: false,
                createdAt: (data.createdAt as string) || new Date().toISOString(),
                link: data.link as string | undefined,
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
                        fontWeight: 'bold',
                    },
                });
            }
        });

        newSocket.on('new_report_to_review', () => {
            onNewReportRef.current?.();
        });

        newSocket.on('report_status_updated_for_supervisor', () => {
            onReportStatusUpdateRef.current?.();
        });

        return () => {
            newSocket.disconnect();
            socketRef.current = null;
            setSocket(null);
            setIsConnected(false);
            setSocketVersion(v => v + 1);
        };
    }, [user?.id, user?.name, user?.role, playNotificationSound]);

    // Fetch initial unread chat status when connected
    useEffect(() => {
        if (!user?.id || !isConnected) return;

        const fetchUnread = async () => {
            try {
                const res = await api.get('/chat/unread-senders');
                const senderIds: string[] = res.data;
                const unreadMap: Record<string, boolean> = {};
                senderIds.forEach(id => { unreadMap[id] = true; });
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
        markAsRead,
    };
};
