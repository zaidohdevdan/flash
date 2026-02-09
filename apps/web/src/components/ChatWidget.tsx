import { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { Socket } from 'socket.io-client';
import { Send, Mic, X, MessageSquare, Square, Trash2, Hourglass, Pencil, Check, CheckCheck, Trash, User, RefreshCw } from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../services/db';
import { useLiveQuery } from 'dexie-react-hooks';
import { toast } from 'react-hot-toast';

const getRoomName = (id1: string, id2: string) => {
    return `private-${[id1, id2].map(id => id.trim().toLowerCase()).sort().join('-')}`;
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
    targetUser: { id: string; name: string; role?: string }; // Who we are talking to
    onClose: () => void;
    socket: Socket | null;
    onRead?: (userId: string) => void;
}

export function ChatWidget({ currentUser, targetUser, onClose, socket, onRead }: ChatWidgetProps) {
    const { notificationsEnabled } = useAuth();
    const [inputText, setInputText] = useState('');
    const [isRecording, setIsRecording] = useState(false);
    const [recordingTime, setRecordingTime] = useState(0);
    const [now, setNow] = useState(() => Date.now());
    const [selectedMessageId, setSelectedMessageId] = useState<string | null>(null);
    const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
    const [editText, setEditText] = useState('');
    const [showDeleteMenuFor, setShowDeleteMenuFor] = useState<string | null>(null);

    const messagesEndRef = useRef<HTMLDivElement>(null);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const chunksRef = useRef<Blob[]>([]);
    const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
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

    const allMessages = useMemo(() => {
        const combined = [...dexieMessages];
        return combined.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    }, [dexieMessages]);

    useEffect(() => {
        if (!chatRoom || !socket) return;
        let isMounted = true;

        async function fetchHistory() {
            try {
                const response = await api.get(`/chat/history/${encodeURIComponent(chatRoom)}`);
                // Import history into Dexie (upsert)
                for (const msg of response.data) {
                    await db.chatMessages.put({
                        id: msg.id,
                        fromId: msg.fromId || msg.from,
                        toId: (msg.fromId || msg.from) === currentUser.id ? targetUser.id : currentUser.id,
                        roomName: chatRoom,
                        text: msg.text,
                        audioUrl: msg.audioUrl,
                        createdAt: msg.createdAt,
                        read: !!msg.read
                    });
                }
            } catch (error) {
                console.error('Error fetching chat history:', error);
            }
        }

        fetchHistory();
        markRoomAsRead();

        const handlePrivateMessage = async (msg: Message) => {
            if (isMounted) {
                await db.chatMessages.put({
                    id: msg.id,
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
                    // Se estou com o chat aberto, marco como lida imediatamente no servidor
                    markRoomAsRead();
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
                // Se o destinatário leu as mensagens, atualizamos as nossas mensagens enviadas para 'read: true'
                await db.chatMessages
                    .where('roomName')
                    .equals(chatRoom)
                    .and(m => m.fromId === currentUser.id && !m.read)
                    .modify({ read: true });
            }
        };

        socket.emit('join_private_chat', { targetUserId: targetUser.id });
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
    }, [currentUser.id, targetUser.id, chatRoom, socket, markRoomAsRead, notificationsEnabled]);

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
            fromId: currentUser.id,
            toId: targetUser.id,
            roomName: chatRoom,
            text: inputText,
            createdAt: new Date().toISOString()
        };

        if (!navigator.onLine || !socket) {
            await db.chatMessages.add(messageData);
            await db.pendingMessages.add({
                toId: targetUser.id,
                text: inputText,
                createdAt: Date.now()
            });
            setInputText('');
            toast.success('Mensagem salva offline. Será enviada ao reconectar.', { icon: '💾' });
            return;
        }

        socket.emit('private_message', {
            targetUserId: targetUser.id,
            text: inputText
        });
        setInputText('');
    };

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const mediaRecorder = new MediaRecorder(stream);
            mediaRecorderRef.current = mediaRecorder;
            chunksRef.current = [];

            mediaRecorder.ondataavailable = (e) => {
                if (e.data.size > 0) chunksRef.current.push(e.data);
            };

            mediaRecorder.onstop = uploadAudio;

            mediaRecorder.start();
            setIsRecording(true);
            setRecordingTime(0);

            timerRef.current = setInterval(() => {
                setRecordingTime(prev => prev + 1);
            }, 1000);

        } catch (err) {
            console.error('Error accessing microphone:', err);
            alert('Erro ao acessar o microfone. Verifique as permissões.');
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
            if (timerRef.current) clearInterval(timerRef.current);
            mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
        }
    };

    const uploadAudio = async () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        const formData = new FormData();
        formData.append('file', blob, 'audio-message.webm');

        try {
            const response = await api.post('/chat/media', formData);
            const audioUrl = response.data.secureUrl;
            const audioPublicId = response.data.publicId;

            if (socket) {
                socket.emit('private_message', {
                    targetUserId: targetUser.id,
                    audioUrl,
                    audioPublicId
                });
            }
        } catch (error) {
            console.error('Error uploading audio:', error);
            alert('Erro ao enviar áudio.');
        }
    };

    const handleClearHistory = async () => {
        if (!window.confirm('Deseja limpar o histórico desta conversa?')) return;
        try {
            await api.delete(`/chat/history/${encodeURIComponent(chatRoom)}`);
            await db.chatMessages.where('roomName').equals(chatRoom).delete();
        } catch (error) {
            console.error('Error clearing chat history:', error);
            alert('Erro ao limpar histórico.');
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
            await api.delete(`/chat/messages/${messageId}?type=${type}`);
            if (type === 'everyone') {
                socket?.emit('delete_message', { messageId, roomName: chatRoom });
            }
            await db.chatMessages.delete(messageId);
            setSelectedMessageId(null);
            setShowDeleteMenuFor(null);
        } catch (error) {
            console.error('Error deleting message:', error);
            alert('Erro ao excluir mensagem.');
        }
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
    };

    return (
        <div className="fixed inset-0 sm:top-auto sm:left-auto sm:bottom-6 sm:right-6 w-full sm:w-[400px] md:w-[440px] h-[100dvh] sm:h-[650px] sm:max-h-[calc(100vh-4rem)] bg-[var(--bg-primary)]/90 backdrop-blur-[32px] sm:rounded-[2.5rem] shadow-2xl flex flex-col overflow-hidden sm:border border-[var(--border-subtle)] ring-1 ring-black/5 z-[60] animate-in slide-in-from-bottom-5 fade-in duration-500">
            {/* Header */}
            <div className="p-4 bg-[var(--bg-primary)]/80 backdrop-blur-xl text-[var(--text-primary)] flex justify-between items-center border-b border-[var(--border-subtle)]">
                <div className="flex items-center gap-3">
                    <div className="bg-[var(--accent-primary)]/10 p-2 rounded-full text-[var(--accent-primary)]">
                        <MessageSquare className="w-5 h-5" />
                    </div>
                    <div>
                        <h3 className="font-bold text-sm text-[var(--text-primary)]">{targetUser.name}</h3>
                        <p className="text-[10px] text-[var(--text-tertiary)] uppercase tracking-wider">
                            {targetUser.role === 'ADMIN' ? 'Administrador' :
                                targetUser.role === 'SUPERVISOR' ? 'Supervisor' :
                                    targetUser.role === 'PROFESSIONAL' ? 'Profissional' :
                                        targetUser.role === 'MANAGER' ? 'Gestor' : 'Contato'}
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-1 text-[var(--text-tertiary)]">
                    <button
                        type="button"
                        onClick={handleClearHistory}
                        className="p-1.5 hover:bg-[var(--bg-secondary)] rounded-lg transition hover:text-[var(--text-primary)]"
                        title="Limpar Histórico"
                    >
                        <Trash2 className="w-4 h-4" />
                    </button>
                    <button
                        type="button"
                        onClick={onClose}
                        className="p-1 hover:bg-[var(--bg-secondary)] rounded-full transition hover:text-[var(--text-primary)]"
                        title="Fechar Chat"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 overscroll-contain scrollbar-thin scrollbar-thumb-[var(--border-medium)] scrollbar-track-transparent">
                {allMessages.length === 0 && (
                    <div className="flex flex-col items-center justify-center h-full text-[var(--text-tertiary)] opacity-50">
                        <MessageSquare className="w-12 h-12 mb-2" />
                        <p className="text-xs font-medium">Inicie uma conversa segura</p>
                    </div>
                )}

                {allMessages.map((msg, idx) => {
                    const isMe = msg.fromId === currentUser.id;
                    const isSelected = selectedMessageId === msg.id;
                    const isEditing = editingMessageId === msg.id;
                    const isPending = !msg.id;

                    return (
                        <div key={idx} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                            <div
                                onClick={() => isMe && !isEditing && msg.id && setSelectedMessageId(isSelected ? null : msg.id)}
                                className={`group relative max-w-[85%] p-3.5 rounded-2xl shadow-sm text-sm transition-all cursor-pointer ${isMe
                                    ? 'bg-[var(--accent-primary)] text-[var(--accent-text)] rounded-tr-none'
                                    : 'bg-[var(--bg-secondary)] border border-[var(--border-subtle)] text-[var(--text-primary)] rounded-tl-none'
                                    } ${isSelected ? 'ring-2 ring-[var(--accent-primary)] ring-offset-2 ring-offset-[var(--bg-primary)]' : ''}`}
                            >
                                {isEditing ? (
                                    <div className="flex flex-col gap-2 min-w-[200px]">
                                        <textarea
                                            value={editText}
                                            onChange={e => setEditText(e.target.value)}
                                            className="w-full bg-[var(--bg-primary)] text-[var(--text-primary)] placeholder-[var(--text-tertiary)] border border-[var(--border-medium)] outline-none rounded-lg p-2 text-xs resize-none focus:border-[var(--accent-primary)] transition-colors"
                                            rows={2}
                                            autoFocus
                                            placeholder="Editar mensagem..."
                                        />
                                        <div className="flex justify-end gap-2">
                                            <button
                                                type="button"
                                                onClick={() => setEditingMessageId(null)}
                                                className="p-1 hover:bg-black/5 rounded text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                                                title="Cancelar"
                                            >
                                                <X className="w-3.5 h-3.5" />
                                            </button>
                                            <button
                                                type="button"
                                                onClick={handleUpdateMessage}
                                                className="p-1 bg-[var(--bg-primary)] text-[var(--accent-primary)] rounded hover:bg-[var(--bg-secondary)] border border-[var(--border-subtle)]"
                                                title="Salvar"
                                            >
                                                <Check className="w-3.5 h-3.5" />
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <>
                                        {msg.text && <p className="whitespace-pre-wrap leading-relaxed font-medium">{msg.text}</p>}
                                        {msg.audioUrl && (
                                            <div className="space-y-1.5">
                                                <audio controls src={msg.audioUrl} className="h-8 max-w-[200px] opacity-80 hover:opacity-100 transition-opacity" />
                                                {msg.expiresAt && (
                                                    <div className="flex items-center justify-end gap-1 text-[9px] font-bold text-red-500 bg-red-50 px-2 py-0.5 rounded-full border border-red-200 animate-pulse">
                                                        <Hourglass className="w-2.5 h-2.5" />
                                                        <span>
                                                            {(() => {
                                                                const diff = new Date(msg.expiresAt).getTime() - now;
                                                                if (diff <= 0) return 'Expirando...';
                                                                const mins = Math.floor(diff / 60000);
                                                                const secs = Math.floor((diff % 60000) / 1000);
                                                                return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
                                                            })()}
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                        <div className="flex items-center justify-end gap-1.5 mt-1.5">
                                            <span className={`text-[9px] font-bold opacity-60 ${isMe ? 'text-[var(--accent-text)]' : 'text-[var(--text-tertiary)]'}`}>
                                                {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                            {isPending ? (
                                                <RefreshCw className="w-3 h-3 text-[var(--accent-text)] opacity-40 animate-spin" />
                                            ) : isMe ? (
                                                msg.read ? (
                                                    <CheckCheck className="w-3.5 h-3.5 text-white fill-white" />
                                                ) : (
                                                    <Check className="w-3.5 h-3.5 text-white opacity-60" />
                                                )
                                            ) : null}
                                        </div>
                                    </>
                                )}

                                {isSelected && isMe && !isEditing && (
                                    <div className="absolute -left-12 top-0 flex flex-col gap-1 animate-in slide-in-from-right-2 fade-in z-20">
                                        <button
                                            type="button"
                                            onClick={(e) => { e.stopPropagation(); handleStartEdit(msg); }}
                                            className="p-2 bg-[var(--bg-primary)] shadow-md border border-[var(--border-subtle)] rounded-full text-[var(--text-tertiary)] hover:text-[var(--accent-primary)] hover:bg-[var(--bg-secondary)] transition"
                                            title="Editar"
                                        >
                                            <Pencil className="w-3.5 h-3.5" />
                                        </button>
                                        <div className="relative">
                                            <button
                                                type="button"
                                                onClick={(e) => { e.stopPropagation(); if (showDeleteMenuFor === msg.id) setShowDeleteMenuFor(null); else setShowDeleteMenuFor(msg.id!); }}
                                                className="p-2 bg-[var(--bg-primary)] shadow-md border border-[var(--border-subtle)] rounded-full text-[var(--text-tertiary)] hover:text-red-500 hover:bg-[var(--bg-secondary)] transition"
                                                title="Excluir"
                                            >
                                                <Trash className="w-3.5 h-3.5" />
                                            </button>

                                            {showDeleteMenuFor === msg.id && (
                                                <div className="absolute right-full mr-2 top-0 bg-[var(--bg-primary)] shadow-xl rounded-xl border border-[var(--border-subtle)] p-1 min-w-[140px] flex flex-col z-50 animate-in zoom-in-95 duration-200">
                                                    <button
                                                        type="button"
                                                        onClick={(e) => { e.stopPropagation(); confirmDelete(msg.id!, 'me'); }}
                                                        className="px-3 py-2 text-left text-xs font-bold text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)] rounded-lg flex items-center gap-2 transition-colors"
                                                    >
                                                        <User className="w-3 h-3" /> Apagar para mim
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={(e) => { e.stopPropagation(); confirmDelete(msg.id!, 'everyone'); }}
                                                        className="px-3 py-2 text-left text-xs font-bold text-red-500 hover:bg-red-50 rounded-lg flex items-center gap-2 transition-colors"
                                                    >
                                                        <Trash2 className="w-3 h-3" /> Apagar para todos
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-3 bg-[var(--bg-primary)]/80 border-t border-[var(--border-subtle)] backdrop-blur-md">
                {isRecording ? (
                    <div className="flex items-center justify-between bg-red-50 p-3 rounded-xl border border-red-200 animate-pulse">
                        <div className="flex items-center gap-3 text-red-500">
                            <div className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping" />
                            <span className="text-xs font-bold font-mono tracking-wider">{formatTime(recordingTime)}</span>
                        </div>
                        <span className="text-xs text-red-500 font-medium">Gravando Áudio...</span>
                        <button
                            type="button"
                            title="Parar Gravação"
                            onClick={stopRecording}
                            className="p-2 bg-red-100/50 text-red-600 rounded-full hover:bg-red-100 transition border border-red-200"
                        >
                            <Square className="w-4 h-4 fill-current" />
                        </button>
                    </div>
                ) : (
                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            onClick={startRecording}
                            className="p-3 bg-[var(--bg-secondary)] text-[var(--text-secondary)] rounded-xl hover:bg-red-50 hover:text-red-500 hover:border-red-200 transition-all active:scale-95 border border-[var(--border-subtle)]"
                            title="Gravar Áudio"
                        >
                            <Mic className="w-5 h-5" />
                        </button>
                        <input
                            type="text"
                            value={inputText}
                            onChange={e => setInputText(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && handleSendMessage()}
                            placeholder="Digite sua mensagem..."
                            className="flex-1 bg-[var(--bg-secondary)] border border-[var(--border-subtle)] outline-none text-sm text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] px-4 py-3 rounded-xl focus:ring-2 focus:ring-[var(--accent-primary)]/40 focus:bg-[var(--bg-primary)] transition-all font-medium"
                        />
                        <button
                            type="button"
                            onClick={handleSendMessage}
                            disabled={!inputText.trim()}
                            className="p-3 bg-[var(--accent-primary)] text-[var(--accent-text)] rounded-xl shadow-lg shadow-[var(--accent-primary)]/20 hover:bg-[var(--accent-primary)]/90 disabled:opacity-50 disabled:shadow-none transition active:scale-95"
                            title="Enviar"
                        >
                            <Send className="w-4 h-4" />
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
