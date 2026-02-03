import { useEffect, useState, useRef, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { toast } from 'react-hot-toast';

const SOCKET_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

interface User {
    id: string;
    name: string;
    role: string;
}

interface UseDashboardSocketOptions {
    user: User | null;
    onNotification?: (data: { from: string; fromName?: string; text: string }) => void;
}

export const useDashboardSocket = ({ user, onNotification }: UseDashboardSocketOptions) => {
    const [socket, setSocket] = useState<Socket | null>(null);
    const [onlineUserIds, setOnlineUserIds] = useState<string[]>([]);
    const [unreadMessages, setUnreadMessages] = useState<Record<string, boolean>>({});
    const [isConnected, setIsConnected] = useState(false);

    // Using ref for unread state to access in handlers without re-firing effects
    const unreadMessagesRef = useRef<Record<string, boolean>>({});

    const playNotificationSound = useCallback(() => {
        const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
        audio.play().catch(e => console.error('Erro ao tocar som:', e));
    }, []);

    // Use a ref for the callback to avoid re-triggering the socket connection effect
    const onNotificationRef = useRef(onNotification);
    useEffect(() => {
        onNotificationRef.current = onNotification;
    }, [onNotification]);

    useEffect(() => {
        if (!user?.id) return;

        // Use stable primitives for the connection
        const userId = user.id;
        const userRole = user.role;
        const userName = user.name;

        const newSocket = io(SOCKET_URL, {
            query: { userId, role: userRole, userName }
        });

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

        const handleChatNotification = (data: { from: string; fromName?: string; text: string }) => {
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

        return () => {
            newSocket.disconnect();
            setSocket(null);
        };
    }, [user?.id, user?.name, user?.role, playNotificationSound]);

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
