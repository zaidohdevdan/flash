import { useState, useRef, useEffect, useMemo, useCallback, useSyncExternalStore } from 'react';
import { Socket } from 'socket.io-client';
import { Send, X, MessageSquare, Trash2, Hourglass, Pencil, Check, CheckCheck, Trash, User, RefreshCw, Video, Play, Pause } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../services/db';
import { useLiveQuery } from 'dexie-react-hooks';
import { toast } from 'react-hot-toast';
import { Avatar } from './ui';

const getRoomName = (id1: string, id2: string) => {
    return `private-${[id1, id2].map(id => id.trim().toLowerCase()).sort().join('-')}`;
};

// Helper para gerar IDs compatíveis com MongoDB (24 hex chars)
const generateMongoId = () => {
    const timestamp = Math.floor(Date.now() / 1000).toString(16).padStart(8, '0');
    const randomHex = Array.from({ length: 16 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
    return timestamp + randomHex;
};

interface Message {
    id?: string;
    from?: string;
    fromId?: string;
    text?: string;
    audioUrl?: string;
    createdAt: string;
    expiresAt?: string;
    read?: boolean;
}

interface ChatWidgetProps {
    currentUser: { id: string; role: string; name: string };
    targetUser: { id: string; name: string; role?: string; avatarUrl?: string | null; isOnline?: boolean }; // Who we are talking to
    onClose: () => void;
    socket: Socket | null;
    onRead?: (userId: string) => void;
    inline?: boolean;
    onVideoClick?: () => void;
}

const TacticalAudioPlayer = ({ src, isMe }: { src: string, isMe: boolean }) => {
    const [isPlaying, setIsPlaying] = useState(false);
    const [progress, setProgress] = useState(0);
    const audioRef = useRef<HTMLAudioElement | null>(null);

    const togglePlay = () => {
        if (!audioRef.current) return;
        if (isPlaying) {
            audioRef.current.pause();
        } else {
            audioRef.current.play();
        }
        setIsPlaying(!isPlaying);
    };

    const handleTimeUpdate = () => {
        if (audioRef.current) {
            const p = (audioRef.current.currentTime / audioRef.current.duration) * 100;
            setProgress(p);
        }
    };

    const handleEnded = () => {
        setIsPlaying(false);
        setProgress(0);
    };

    return (
        <div className={`p-2.5 sm:p-3 rounded-2xl flex items-center gap-3 ${isMe ? 'bg-black/20' : 'bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10'}`}>
            <audio
                ref={audioRef}
                src={src}
                onTimeUpdate={handleTimeUpdate}
                onEnded={handleEnded}
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
            />
            <button
                onClick={togglePlay}
                className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-all active:scale-90 ${isMe ? 'bg-indigo-500 shadow-lg shadow-indigo-500/20' : 'bg-indigo-500/20'}`}
            >
                {isPlaying ? (
                    <Pause className={`w-3 h-3 ${isMe ? 'text-white' : 'text-indigo-500'}`} fill="currentColor" />
                ) : (
                    <Play className={`w-3 h-3 ml-0.5 ${isMe ? 'text-white' : 'text-indigo-500'}`} fill="currentColor" />
                )}
            </button>
            <div className="flex flex-col gap-1 min-w-[120px] flex-1">
                <div className="h-1 w-full bg-indigo-500/10 dark:bg-white/5 rounded-full overflow-hidden relative">
                    <motion.div
                        className="absolute inset-y-0 left-0 bg-indigo-500"
                        animate={{ width: `${progress}%` }}
                        transition={{ type: 'spring', bounce: 0, duration: 0.1 }}
                    />
                    {isPlaying && (
                        <div className="absolute inset-0 bg-indigo-500/10 animate-pulse" />
                    )}
                </div>
                <div className="flex justify-between items-center">
                    <span className={`text-[8px] font-black uppercase tracking-[0.1em] ${isMe ? 'text-white/40' : 'text-slate-500 dark:text-slate-400'}`}>
                        {isPlaying ? 'Decoding Stream...' : 'Tatical Audio Log'}
                    </span>
                </div>
            </div>
        </div>
    );
};

export function ChatWidget({ currentUser, targetUser, onClose, socket, onRead, inline = false, onVideoClick }: ChatWidgetProps) {
    const { notificationsEnabled } = useAuth();
    const [inputText, setInputText] = useState('');
    const [now, setNow] = useState(() => Date.now());
    const [selectedMessageId, setSelectedMessageId] = useState<string | null>(null);
    const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
    const [editText, setEditText] = useState('');
    const [showDeleteMenuFor, setShowDeleteMenuFor] = useState<string | null>(null);

    const messagesEndRef = useRef<HTMLDivElement>(null);
    const notificationAudioRef = useRef<HTMLAudioElement | null>(null);

    // Identificador único da sala baseado em IDs ordenados
    const chatRoom = useMemo(() =>
        currentUser?.id && targetUser?.id ? getRoomName(currentUser.id, targetUser.id) : '',
        [currentUser.id, targetUser.id]);

    // Dexie: Fetch persistent messages
    const dexieMessagesQuery = useLiveQuery(
        () => db.chatMessages
            .where('roomName')
            .equals(chatRoom)
            .sortBy('createdAt'),
        [chatRoom]
    );

    const dexieMessages = useMemo(() => dexieMessagesQuery || [], [dexieMessagesQuery]);

    const markRoomAsRead = useCallback(async () => {
        if (!chatRoom) return;
        try {
            await api.patch(`/chat/history/${chatRoom}/read`);
            if (onRead) onRead(targetUser.id);
        } catch (error) {
            console.error('Erro ao marcar mensagens como lidas:', error);
        }
    }, [chatRoom, onRead, targetUser.id]);

    // Keep a stable ref so the socket effect doesn't re-fire when chatRoom/onRead change
    const markRoomAsReadRef = useRef(markRoomAsRead);
    useEffect(() => {
        markRoomAsReadRef.current = markRoomAsRead;
    }, [markRoomAsRead]);

    const allMessages = useMemo(() => {
        const combined = [...dexieMessages];
        return combined.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    }, [dexieMessages]);

    // Fetch history once per chatRoom (keep separate from the socket listener effect)
    const hasFetchedRef = useRef<string | null>(null);
    useEffect(() => {
        if (!chatRoom || hasFetchedRef.current === chatRoom) return;
        hasFetchedRef.current = chatRoom;

        const fetchHistory = async () => {
            try {
                const response = await api.get(`/chat/history/${encodeURIComponent(chatRoom)}`);
                const messagesToPut = response.data.map((msg: Message) => ({
                    id: msg.id || generateMongoId(),
                    fromId: msg.fromId || msg.from,
                    toId: (msg.fromId || msg.from) === currentUser.id ? targetUser.id : currentUser.id,
                    roomName: chatRoom,
                    text: msg.text,
                    audioUrl: msg.audioUrl,
                    createdAt: msg.createdAt,
                    read: !!msg.read
                }));

                if (messagesToPut.length > 0) {
                    await db.chatMessages.bulkPut(messagesToPut);
                }
            } catch (error) {
                console.error('Error fetching chat history:', error);
            }
        };

        fetchHistory();
        markRoomAsReadRef.current();
    }, [chatRoom, currentUser.id, targetUser.id]);

    // Track whether the socket is genuinely connected using useSyncExternalStore
    const isSocketConnected = useSyncExternalStore(
        useCallback((onStoreChange) => {
            if (!socket) return () => { };
            socket.on('connect', onStoreChange);
            socket.on('disconnect', onStoreChange);
            return () => {
                socket.off('connect', onStoreChange);
                socket.off('disconnect', onStoreChange);
            };
        }, [socket]),
        () => socket?.connected ?? false,
        () => false // Server snapshot
    );

    // Emit join_private_chat only when both room + connection are ready
    const hasJoinedRef = useRef<string | null>(null);
    useEffect(() => {
        if (!chatRoom || !socket || !isSocketConnected) return;
        const key = `${chatRoom}-${socket.id ?? ''}`;
        if (hasJoinedRef.current === key) return;
        hasJoinedRef.current = key;
        socket.emit('join_private_chat', { targetUserId: targetUser.id });
    }, [chatRoom, socket, isSocketConnected, targetUser.id]);

    useEffect(() => {
        if (!chatRoom || !socket) return;
        let isMounted = true;

        const handlePrivateMessage = async (msg: Message) => {
            if (isMounted) {
                await db.chatMessages.put({
                    id: msg.id || generateMongoId(),
                    fromId: msg.fromId || msg.from || '',
                    toId: (msg.fromId || msg.from) === currentUser.id ? targetUser.id : currentUser.id,
                    roomName: chatRoom,
                    text: msg.text,
                    audioUrl: msg.audioUrl,
                    createdAt: msg.createdAt,
                    read: !!msg.read
                });

                const senderId = msg.from || msg.fromId;
                if (senderId !== currentUser.id) {
                    if (notificationsEnabled) {
                        if (!notificationAudioRef.current) {
                            notificationAudioRef.current = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
                        }
                        notificationAudioRef.current.play().catch(() => { });
                    }
                    markRoomAsReadRef.current();
                }
            }
        };

        const handleMessageEdited = async (data: { messageId: string, newText: string }) => {
            if (isMounted) {
                await db.chatMessages.update(data.messageId, { text: data.newText });
            }
        };

        const handleMessageDeleted = async (data: { messageId: string }) => {
            if (isMounted) {
                await db.chatMessages.delete(data.messageId);
            }
        };

        const handleMessagesRead = async (data: { room: string, readBy: string }) => {
            if (isMounted && data.room === chatRoom && data.readBy === targetUser.id) {
                await db.chatMessages
                    .where('roomName')
                    .equals(chatRoom)
                    .and(m => m.fromId === currentUser.id && !m.read)
                    .modify({ read: true });
            }
        };

        socket.on('private_message', handlePrivateMessage);
        socket.on('message_edited', handleMessageEdited);
        socket.on('message_deleted', handleMessageDeleted);
        socket.on('messages_read', handleMessagesRead);

        return () => {
            isMounted = false;
            socket.off('private_message', handlePrivateMessage);
            socket.off('message_edited', handleMessageEdited);
            socket.off('message_deleted', handleMessageDeleted);
            socket.off('messages_read', handleMessagesRead);
        };
    }, [currentUser.id, targetUser.id, chatRoom, socket, notificationsEnabled]);

    useEffect(() => {
        const interval = setInterval(() => setNow(Date.now()), 1000);
        return () => clearInterval(interval);
    }, []);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [allMessages]);


    const handleSendMessage = async () => {
        if (!inputText.trim()) return;
        const messageData = {
            id: generateMongoId(),
            fromId: currentUser.id,
            toId: targetUser.id,
            roomName: chatRoom,
            text: inputText,
            createdAt: new Date().toISOString()
        };

        // Optimistic insert
        await db.chatMessages.add(messageData);
        setInputText('');

        if (!navigator.onLine || !socket) {
            await db.pendingMessages.add({
                toId: targetUser.id,
                text: inputText,
                createdAt: Date.now()
            });
            toast.success('Mensagem salva offline. Será enviada ao reconectar.', { icon: '💾' });
            return;
        }

        socket.emit('private_message', {
            id: messageData.id,
            targetUserId: targetUser.id,
            text: messageData.text
        });
    };


    const handleClearHistory = async () => {
        if (!window.confirm('Deseja limpar o histórico desta conversa?')) return;
        try {
            // Optimistic update: Clear local DB immediately
            await db.chatMessages.where('roomName').equals(chatRoom).delete();

            // Sync with backend in the background
            api.delete(`/chat/history/${encodeURIComponent(chatRoom)}`).catch(error => {
                console.error('Background error clearing chat history:', error);
                toast.error('Erro ao sincronizar limpeza de histórico.');
            });

        } catch (error) {
            console.error('Error in optimistic clear history:', error);
            toast.error('Erro ao limpar histórico localmente.');
        }
    };

    const handleStartEdit = (msg: { id?: string; text?: string }) => {
        if (!msg.id) return;
        setEditingMessageId(msg.id);
        setEditText(msg.text || '');
        setSelectedMessageId(null);
    };

    const handleUpdateMessage = async () => {
        if (!editText.trim() || !editingMessageId) return;
        try {
            await api.patch(`/chat/messages/${editingMessageId}`, { text: editText });
            socket?.emit('edit_message', { messageId: editingMessageId, newText: editText, roomName: chatRoom });
            await db.chatMessages.update(editingMessageId, { text: editText });
            setEditingMessageId(null);
        } catch (error) {
            console.error('Error updating message:', error);
            alert('Erro ao atualizar mensagem.');
        }
    };

    const confirmDelete = async (messageId: string, type: 'me' | 'everyone') => {
        try {
            // Optimistic update: Delete from local UI/DB first
            await db.chatMessages.delete(messageId);
            setSelectedMessageId(null);
            setShowDeleteMenuFor(null);

            // Notify others immediately via socket if it's for everyone
            if (type === 'everyone') {
                socket?.emit('delete_message', { messageId, roomName: chatRoom });
            }

            // Sync with backend in the background
            api.delete(`/chat/messages/${messageId}?type=${type}`).catch(error => {
                console.error('Background error deleting message:', error);
                toast.error('Erro ao sincronizar exclusão com o servidor.');
            });

        } catch (error) {
            console.error('Error in optimistic delete:', error);
            toast.error('Erro ao excluir mensagem localmente.');
        }
    };


    return (
        <motion.div
            initial={inline ? { opacity: 0 } : { opacity: 0, y: 20, scale: 0.95 }}
            animate={inline ? { opacity: 1 } : { opacity: 1, y: 0, scale: 1 }}
            exit={inline ? { opacity: 0 } : { opacity: 0, y: 20, scale: 0.95 }}
            className={
                inline
                    ? "w-full h-full flex flex-col bg-white/70 dark:bg-black/60 md:rounded-[2.5rem] border border-slate-200 dark:border-white/5 shadow-2xl backdrop-blur-xl overflow-hidden"
                    : "fixed inset-0 sm:top-auto sm:left-auto sm:bottom-6 sm:right-6 w-full sm:w-[400px] md:w-[440px] h-[100dvh] sm:h-[650px] sm:max-h-[calc(100vh-4rem)] bg-white/90 dark:bg-[#020617]/90 backdrop-blur-[32px] sm:rounded-[3rem] shadow-[0_32px_128px_-16px_rgba(0,0,0,0.5)] flex flex-col overflow-hidden sm:border border-slate-200 dark:border-white/10 z-[60]"
            }
        >
            {/* Header */}
            <div className="p-5 bg-white/10 dark:bg-white/5 backdrop-blur-2xl flex justify-between items-center border-b border-slate-200 dark:border-white/5 relative overflow-hidden">
                {/* Tactical Gradient Top */}
                <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-indigo-500/50 to-transparent" />

                <div className="flex items-center gap-3.5 relative z-10">
                    <div className="relative">
                        <Avatar
                            src={targetUser?.avatarUrl || null}
                            alt={targetUser?.name}
                            size="md"
                            isOnline={targetUser?.isOnline}
                            className="ring-2 ring-white/10 dark:ring-white/5"
                        />
                        {targetUser?.isOnline && (
                            <div className="absolute -top-1 -left-1 w-2 h-2 bg-emerald-500 rounded-full animate-ping opacity-40" />
                        )}
                    </div>
                    <div>
                        <h3 className="font-black text-xs text-slate-900 dark:text-white uppercase tracking-tight">{targetUser.name}</h3>
                        <div className="flex items-center gap-1.5 mt-0.5">
                            <div className={`w-1 h-1 rounded-full ${targetUser?.isOnline ? 'bg-emerald-500' : 'bg-slate-500'}`} />
                            <p className="text-[9px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-[0.2em]">
                                {targetUser?.isOnline ? 'Live Connection' : 'Offline Mode'}
                            </p>
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-2 relative z-10">
                    {onVideoClick && (
                        <button
                            type="button"
                            onClick={onVideoClick}
                            className="p-2.5 hover:bg-indigo-500/10 dark:hover:bg-white/5 rounded-xl transition-all hover:text-indigo-500 dark:text-slate-400"
                            title="Iniciar Videoconferência"
                        >
                            <Video className="w-4 h-4" />
                        </button>
                    )}
                    <button
                        type="button"
                        onClick={handleClearHistory}
                        className="p-2.5 hover:bg-white/10 rounded-xl transition-all text-slate-400 hover:text-slate-900 dark:hover:text-white"
                        title="Limpar Histórico"
                    >
                        <Trash2 className="w-4 h-4" />
                    </button>
                    <button
                        type="button"
                        onClick={onClose}
                        className="p-2 hover:bg-rose-500/10 rounded-xl transition-all text-slate-400 hover:text-rose-500"
                        title="Fechar Chat"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 min-h-0 overflow-y-auto p-5 space-y-6 overscroll-contain chat-scrollbar bg-[#f8fafc]/50 dark:bg-black/20">
                {allMessages.length === 0 && (
                    <div className="flex flex-col items-center justify-center h-full text-slate-400 dark:text-slate-500 animate-in fade-in duration-1000">
                        <div className="w-16 h-16 rounded-[2rem] bg-indigo-500/10 flex items-center justify-center mb-4 border border-indigo-500/20">
                            <MessageSquare className="w-8 h-8 text-indigo-500 animate-pulse" />
                        </div>
                        <p className="text-[10px] font-black uppercase tracking-[0.3em]">Criptografia Militar Ativa</p>
                        <p className="text-[9px] font-bold uppercase tracking-widest mt-2 opacity-50">Canal de Comunicação Ponto-a-Ponto</p>
                    </div>
                )}

                <AnimatePresence initial={false}>

                    {allMessages.map((msg, idx) => {
                        const isMe = msg.fromId === currentUser.id;
                        const isSelected = selectedMessageId === msg.id;
                        const isEditing = editingMessageId === msg.id;
                        const isPending = !msg.id;

                        return (
                            <motion.div
                                key={msg.id || idx}
                                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                            >
                                <div
                                    onClick={() => isMe && !isEditing && msg.id && setSelectedMessageId(isSelected ? null : msg.id)}
                                    className={`group relative max-w-[85%] p-4 rounded-3xl shadow-xl transition-all cursor-pointer ${isMe
                                        ? 'bg-gradient-to-br from-indigo-600 to-blue-700 text-white rounded-tr-none shadow-indigo-500/20'
                                        : 'bg-white dark:bg-black/60 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white rounded-tl-none'
                                        } ${isSelected ? 'ring-2 ring-indigo-500 ring-offset-4 dark:ring-offset-[#020617] scale-[1.02]' : ''}`}
                                >
                                    {/* Outgoing Glow */}
                                    {isMe && (
                                        <div className="absolute inset-0 bg-indigo-500/20 blur-xl -z-10 rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                                    )}
                                    {isEditing ? (
                                        <div className="flex flex-col gap-3 min-w-[240px]">
                                            <textarea
                                                value={editText}
                                                onChange={e => setEditText(e.target.value)}
                                                className="w-full bg-black/20 text-white placeholder-white/40 border border-white/20 outline-none rounded-xl p-3 text-xs resize-none focus:border-white/40 transition-all font-bold"
                                                rows={2}
                                                autoFocus
                                                placeholder="Editar mensagem..."
                                            />
                                            <div className="flex justify-end gap-2">
                                                <button
                                                    type="button"
                                                    onClick={() => setEditingMessageId(null)}
                                                    className="px-3 py-1.5 bg-white/10 hover:bg-white/20 rounded-lg text-white text-[10px] font-black uppercase tracking-widest transition-all"
                                                >
                                                    Cancelar
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={handleUpdateMessage}
                                                    className="px-3 py-1.5 bg-white text-indigo-600 hover:bg-indigo-50 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all shadow-lg"
                                                >
                                                    Salvar
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <>
                                            {msg.text && <p className={`whitespace-pre-wrap leading-relaxed font-bold text-[13px] tracking-tight ${isMe ? 'text-white' : 'text-slate-900 dark:text-slate-100'}`}>{msg.text}</p>}
                                            {msg.audioUrl && (
                                                <div className="space-y-2">
                                                    <TacticalAudioPlayer src={msg.audioUrl} isMe={isMe} />
                                                    {msg.expiresAt && (
                                                        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-rose-500/10 border border-rose-500/20 rounded-full animate-pulse">
                                                            <Hourglass className="w-2.5 h-2.5 text-rose-500" />
                                                            <span className="text-[9px] font-black text-rose-500 uppercase tracking-widest">
                                                                Expira em {(() => {
                                                                    const diff = new Date(msg.expiresAt).getTime() - now;
                                                                    if (diff <= 0) return 'NOW';
                                                                    const mins = Math.floor(diff / 60000);
                                                                    const secs = Math.floor((diff % 60000) / 1000);
                                                                    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
                                                                })()}
                                                            </span>
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                            <div className="flex items-center justify-end gap-1.5 mt-2">
                                                <span className={`text-[8px] font-black uppercase tracking-[0.15em] opacity-40 ${isMe ? 'text-white' : 'text-slate-500 dark:text-slate-400'}`}>
                                                    {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                                {isPending ? (
                                                    <RefreshCw className="w-3 h-3 text-white/40 animate-spin" />
                                                ) : isMe ? (
                                                    msg.read ? (
                                                        <CheckCheck className="w-3.5 h-3.5 text-emerald-400" />
                                                    ) : (
                                                        <Check className="w-3.5 h-3.5 text-white/30" />
                                                    )
                                                ) : null}
                                            </div>
                                        </>
                                    )}

                                    {isSelected && isMe && !isEditing && (
                                        <div className="absolute -left-14 top-0 flex flex-col gap-2 animate-in slide-in-from-right-2 fade-in z-20">
                                            <button
                                                type="button"
                                                onClick={(e) => { e.stopPropagation(); handleStartEdit(msg); }}
                                                className="p-3 bg-white/10 dark:bg-black/40 backdrop-blur-xl shadow-2xl border border-white/10 rounded-2xl text-slate-400 hover:text-indigo-500 hover:scale-110 transition-all"
                                                title="Editar"
                                            >
                                                <Pencil className="w-4 h-4" />
                                            </button>
                                            <div className="relative">
                                                <button
                                                    type="button"
                                                    onClick={(e) => { e.stopPropagation(); if (showDeleteMenuFor === msg.id) setShowDeleteMenuFor(null); else setShowDeleteMenuFor(msg.id!); }}
                                                    className="p-3 bg-white/10 dark:bg-black/40 backdrop-blur-xl shadow-2xl border border-white/10 rounded-2xl text-slate-400 hover:text-rose-500 hover:scale-110 transition-all"
                                                    title="Excluir"
                                                >
                                                    <Trash className="w-4 h-4" />
                                                </button>

                                                {showDeleteMenuFor === msg.id && (
                                                    <div className="absolute right-full mr-3 top-0 bg-white dark:bg-[#0f172a] shadow-[0_32px_128px_-16px_rgba(0,0,0,0.5)] rounded-2xl border border-slate-200 dark:border-white/10 p-1.5 min-w-[170px] flex flex-col z-50 animate-in zoom-in-95 duration-200">
                                                        <button
                                                            type="button"
                                                            onClick={(e) => { e.stopPropagation(); confirmDelete(msg.id!, 'me'); }}
                                                            className="px-4 py-2.5 text-left text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/5 rounded-xl flex items-center gap-3 transition-colors"
                                                        >
                                                            <User className="w-3.5 h-3.5" /> Apagar Local
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={(e) => { e.stopPropagation(); confirmDelete(msg.id!, 'everyone'); }}
                                                            className="px-4 py-2.5 text-left text-[10px] font-black uppercase tracking-widest text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-xl flex items-center gap-3 transition-colors"
                                                        >
                                                            <Trash2 className="w-3.5 h-3.5" /> Apagar Geral
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        );
                    })}
                </AnimatePresence>
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-5 bg-white/70 dark:bg-black/60 border-t border-slate-200 dark:border-white/5 backdrop-blur-2xl relative">
                {/* Visual indicator of recording/typing */}
                <div className="absolute -top-[1px] left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-indigo-500/30 to-transparent" />

                    <div className="flex items-center gap-3 relative">
                        <div className="flex-1 relative group">
                            <input
                                type="text"
                                value={inputText}
                                onChange={e => setInputText(e.target.value)}
                                onKeyDown={e => e.key === 'Enter' && handleSendMessage()}
                                placeholder="Transmitir mensagem..."
                                className="w-full bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 outline-none text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 px-5 py-4 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:bg-white dark:focus:bg-black/40 focus:border-indigo-500/40 transition-all font-bold tracking-tight"
                            />
                            {/* Visual caret focus decoration */}
                            <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-1.5 opacity-0 group-focus-within:opacity-100 transition-opacity pointer-events-none">
                                <span className="text-[9px] font-black text-indigo-500/50 uppercase tracking-widest">Secure Line</span>
                                <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
                            </div>
                        </div>

                        <button
                            type="button"
                            onClick={handleSendMessage}
                            disabled={!inputText.trim()}
                            className="p-4 bg-indigo-600 dark:bg-indigo-500 text-white rounded-2xl shadow-[0_8px_32px_-8px_rgba(99,102,241,0.5)] hover:bg-indigo-700 dark:hover:bg-indigo-400 disabled:opacity-50 disabled:shadow-none transition-all active:scale-90 flex items-center justify-center border border-indigo-400/20"
                            title="Enviar"
                        >
                            <Send className="w-5 h-5" />
                        </button>
                    </div>
            </div>
        </motion.div>
    );
}
