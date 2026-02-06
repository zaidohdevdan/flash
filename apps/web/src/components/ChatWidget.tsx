import { useState, useRef, useEffect } from 'react';
import { Socket } from 'socket.io-client';
import { Send, Mic, X, MessageSquare, Square, Trash2, Hourglass, Pencil, Check, Trash, User } from 'lucide-react';
import { api } from '../services/api';

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
}

interface ChatWidgetProps {
    currentUser: { id: string; role: string; name: string };
    targetUser: { id: string; name: string; role?: string }; // Who we are talking to
    onClose: () => void;
    socket: Socket | null;
}

export function ChatWidget({ currentUser, targetUser, onClose, socket }: ChatWidgetProps) {
    const [messages, setMessages] = useState<Message[]>([]);
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

    // Identificador único da sala baseado em IDs ordenados
    const chatRoom = currentUser?.id && targetUser?.id ? getRoomName(currentUser.id, targetUser.id) : '';

    useEffect(() => {
        if (!chatRoom || !socket) return;
        let isMounted = true;

        async function fetchHistory() {
            try {
                const response = await api.get(`/chat/history/${encodeURIComponent(chatRoom)}`);
                if (isMounted) {
                    setMessages(response.data);
                }
            } catch (error) {
                console.error('Error fetching chat history:', error);
            }
        }

        // Initial fetch
        fetchHistory();

        const handlePrivateMessage = (msg: Message) => {
            if (isMounted) {
                const senderId = msg.from || msg.fromId;

                setMessages(prev => {
                    // Evita duplicatas
                    const exists = prev.some(m => m.createdAt === msg.createdAt && (m.from === msg.from || m.fromId === msg.fromId) && m.text === msg.text);
                    if (exists) return prev;
                    return [...prev, msg];
                });

                if (senderId !== currentUser.id) {
                    const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
                    // Silenciamos o erro se o usuário ainda não interagiu com a página
                    audio.play().catch(() => { });
                }
            }
        };

        const handleMessageEdited = (data: { messageId: string, newText: string }) => {
            if (isMounted) {
                setMessages(prev => prev.map(m => m.id === data.messageId ? { ...m, text: data.newText } : m));
            }
        };

        const handleMessageDeleted = (data: { messageId: string }) => {
            if (isMounted) {
                setMessages(prev => prev.filter(m => m.id !== data.messageId));
            }
        };

        socket.emit('join_private_chat', { targetUserId: targetUser.id });
        socket.on('private_message', handlePrivateMessage);
        socket.on('message_edited', handleMessageEdited);
        socket.on('message_deleted', handleMessageDeleted);

        return () => {
            isMounted = false;
            socket.off('private_message', handlePrivateMessage);
            socket.off('message_edited', handleMessageEdited);
            socket.off('message_deleted', handleMessageDeleted);
        };
    }, [currentUser.id, targetUser.id, chatRoom, socket]);

    useEffect(() => {
        const interval = setInterval(() => setNow(Date.now()), 1000);
        return () => clearInterval(interval);
    }, []);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSendMessage = () => {
        if (!inputText.trim() || !socket) return;

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
            alert('Erro ao acessar microfone. Verifique as permissões.');
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
            if (timerRef.current) clearInterval(timerRef.current);

            // Stop all tracks
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
            alert('Falha ao enviar áudio.');
        }
    };

    const handleClearHistory = async () => {
        if (!window.confirm('Você tem certeza que deseja excluir todo o histórico desta conversa?')) return;

        try {
            await api.delete(`/chat/history/${encodeURIComponent(chatRoom)}`);
            setMessages([]);
        } catch (error) {
            console.error('Error clearing chat history:', error);
            alert('Erro ao excluir histórico.');
        }
    };

    const handleStartEdit = (msg: Message) => {
        setEditingMessageId(msg.id!);
        setEditText(msg.text || '');
        setSelectedMessageId(null);
    };

    const handleUpdateMessage = async () => {
        if (!editText.trim() || !editingMessageId) return;

        try {
            await api.patch(`/chat/messages/${editingMessageId}`, { text: editText });
            socket?.emit('edit_message', { messageId: editingMessageId, newText: editText, roomName: chatRoom });
            setMessages(prev => prev.map(m => m.id === editingMessageId ? { ...m, text: editText } : m));
            setEditingMessageId(null);
        } catch (error) {
            console.error('Error updating message:', error);
            alert('Falha ao editar mensagem.');
        }
    };

    const handleDeleteClick = (msgId: string) => {
        // Toggle menu
        if (showDeleteMenuFor === msgId) setShowDeleteMenuFor(null);
        else setShowDeleteMenuFor(msgId);
    };

    const confirmDelete = async (messageId: string, type: 'me' | 'everyone') => {
        try {
            await api.delete(`/chat/messages/${messageId}?type=${type}`);

            if (type === 'everyone') {
                socket?.emit('delete_message', { messageId, roomName: chatRoom });
            }

            // Sempre removemos visualmente para quem deletou
            setMessages(prev => prev.filter(m => m.id !== messageId));
            setSelectedMessageId(null);
            setShowDeleteMenuFor(null);
        } catch (error) {
            console.error('Error deleting message:', error);
            alert('Falha ao excluir mensagem.');
        }
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
    };

    return (
        <div className="fixed inset-0 sm:top-auto sm:left-auto sm:bottom-6 sm:right-6 w-full sm:w-[400px] md:w-[440px] h-[100dvh] sm:h-[650px] sm:max-h-[calc(100vh-4rem)] bg-slate-950/90 backdrop-blur-[32px] sm:rounded-[2.5rem] shadow-2xl flex flex-col overflow-hidden sm:border border-white/10 ring-1 ring-white/5 z-[60] animate-in slide-in-from-bottom-5 fade-in duration-500">
            {/* Header */}
            <div className="p-4 bg-slate-900/80 backdrop-blur-xl text-white flex justify-between items-center border-b border-white/5">
                <div className="flex items-center gap-3">
                    <div className="bg-blue-500/20 p-2 rounded-full text-blue-400">
                        <MessageSquare className="w-5 h-5" />
                    </div>
                    <div>
                        <h3 className="font-bold text-sm text-white">{targetUser.name}</h3>
                        <p className="text-[10px] text-slate-400 uppercase tracking-wider">
                            {targetUser.role === 'MANAGER' ? 'Gerente / Setor' :
                                targetUser.role === 'SUPERVISOR' ? 'Supervisor' :
                                    targetUser.role === 'PROFESSIONAL' ? 'Operacional' :
                                        'Contato'}
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-1 text-slate-400">
                    <button
                        type="button"
                        onClick={handleClearHistory}
                        className="p-1.5 hover:bg-white/10 rounded-lg transition hover:text-white"
                        title="Excluir Histórico"
                        aria-label="Excluir Histórico"
                    >
                        <Trash2 className="w-4 h-4" />
                    </button>
                    <button
                        type="button"
                        onClick={onClose}
                        className="p-1 hover:bg-white/10 rounded-full transition hover:text-white"
                        title="Fechar"
                        aria-label="Fechar"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 overscroll-contain scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
                {messages.length === 0 && (
                    <div className="flex flex-col items-center justify-center h-full text-slate-600 opacity-50">
                        <MessageSquare className="w-12 h-12 mb-2" />
                        <p className="text-xs font-medium">Inicie a conversa...</p>
                    </div>
                )}

                {messages.map((msg, idx) => {
                    const senderId = msg.from || msg.fromId;
                    const isMe = senderId === currentUser.id;
                    const isSelected = selectedMessageId === msg.id;
                    const isEditing = editingMessageId === msg.id;

                    return (
                        <div key={idx} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                            <div
                                onClick={() => isMe && !isEditing && msg.id && setSelectedMessageId(isSelected ? null : msg.id)}
                                className={`group relative max-w-[85%] p-3.5 rounded-2xl shadow-sm text-sm transition-all cursor-pointer ${isMe
                                    ? 'bg-blue-600 text-white rounded-tr-none'
                                    : 'bg-slate-800 border border-white/5 text-slate-200 rounded-tl-none'
                                    } ${isSelected ? 'ring-2 ring-blue-500 ring-offset-2 ring-offset-slate-900' : ''}`}
                            >
                                {isEditing ? (
                                    <div className="flex flex-col gap-2 min-w-[200px]">
                                        <textarea
                                            value={editText}
                                            onChange={e => setEditText(e.target.value)}
                                            className="w-full bg-slate-900/50 text-white placeholder-slate-500 border border-white/10 outline-none rounded-lg p-2 text-xs resize-none focus:border-blue-500/50 transition-colors"
                                            rows={2}
                                            autoFocus
                                            aria-label="Editar mensagem"
                                        />
                                        <div className="flex justify-end gap-2">
                                            <button
                                                type="button"
                                                onClick={() => setEditingMessageId(null)}
                                                className="p-1 hover:bg-white/10 rounded text-white/70 hover:text-white"
                                                title="Cancelar Edição"
                                            >
                                                <X className="w-3.5 h-3.5" />
                                            </button>
                                            <button
                                                type="button"
                                                onClick={handleUpdateMessage}
                                                className="p-1 bg-blue-500 text-white rounded hover:bg-blue-400"
                                                title="Confirmar Edição"
                                            >
                                                <Check className="w-3.5 h-3.5" />
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <>
                                        {msg.text && <p className="whitespace-pre-wrap leading-relaxed">{msg.text}</p>}
                                        {msg.audioUrl && (
                                            <div className="space-y-1.5">
                                                <audio controls src={msg.audioUrl} className="h-8 max-w-[200px] opacity-80 hover:opacity-100 transition-opacity" />
                                                {msg.expiresAt && (
                                                    <div className="flex items-center justify-end gap-1 text-[9px] font-bold text-red-400 bg-red-950/30 px-2 py-0.5 rounded-full border border-red-500/20 animate-pulse">
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
                                        <span className={`text-[9px] block mt-1.5 text-right font-medium opacity-60 ${isMe ? 'text-blue-100' : 'text-slate-400'}`}>
                                            {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                    </>
                                )}

                                {/* Action Buttons Overlay */}
                                {isSelected && isMe && !isEditing && (
                                    <div className="absolute -left-12 top-0 flex flex-col gap-1 animate-in slide-in-from-right-2 fade-in z-20">
                                        <button
                                            type="button"
                                            onClick={(e) => { e.stopPropagation(); handleStartEdit(msg); }}
                                            className="p-2 bg-slate-800 shadow-xl border border-white/10 rounded-full text-slate-400 hover:text-blue-400 hover:bg-slate-700 transition"
                                            title="Editar"
                                            aria-label="Editar"
                                        >
                                            <Pencil className="w-3.5 h-3.5" />
                                        </button>
                                        <div className="relative">
                                            <button
                                                type="button"
                                                onClick={(e) => { e.stopPropagation(); handleDeleteClick(msg.id!); }}
                                                className="p-2 bg-slate-800 shadow-xl border border-white/10 rounded-full text-slate-400 hover:text-red-400 hover:bg-slate-700 transition"
                                                title="Excluir"
                                                aria-label="Excluir"
                                            >
                                                <Trash className="w-3.5 h-3.5" />
                                            </button>

                                            {/* Delete Menu */}
                                            {showDeleteMenuFor === msg.id && (
                                                <div className="absolute right-full mr-2 top-0 bg-slate-800 shadow-xl rounded-xl border border-white/10 p-1 min-w-[140px] flex flex-col z-50 animate-in zoom-in-95 duration-200">
                                                    <button
                                                        type="button"
                                                        onClick={(e) => { e.stopPropagation(); confirmDelete(msg.id!, 'me'); }}
                                                        className="px-3 py-2 text-left text-xs font-bold text-slate-300 hover:bg-slate-700 rounded-lg flex items-center gap-2 transition-colors"
                                                    >
                                                        <User className="w-3 h-3" /> Para mim
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={(e) => { e.stopPropagation(); confirmDelete(msg.id!, 'everyone'); }}
                                                        className="px-3 py-2 text-left text-xs font-bold text-red-400 hover:bg-red-950/30 rounded-lg flex items-center gap-2 transition-colors"
                                                    >
                                                        <Trash2 className="w-3 h-3" /> Para todos
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
            <div className="p-3 bg-slate-900/80 border-t border-white/5 backdrop-blur-md">
                {isRecording ? (
                    <div className="flex items-center justify-between bg-red-950/20 p-3 rounded-xl border border-red-500/20 animate-pulse">
                        <div className="flex items-center gap-3 text-red-500">
                            <div className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping" />
                            <span className="text-xs font-bold font-mono tracking-wider">{formatTime(recordingTime)}</span>
                        </div>
                        <span className="text-xs text-red-400 font-medium">Gravando áudio...</span>
                        <button
                            type="button"
                            onClick={stopRecording}
                            className="p-2 bg-red-500/10 text-red-500 rounded-full hover:bg-red-500/20 transition border border-red-500/20"
                            title="Parar Gravação"
                            aria-label="Parar Gravação"
                        >
                            <Square className="w-4 h-4 fill-current" />
                        </button>
                    </div>
                ) : (
                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            onClick={startRecording}
                            className="p-3 bg-slate-800 text-slate-400 rounded-xl hover:bg-red-500/10 hover:text-red-500 hover:border-red-500/20 transition-all active:scale-95 border border-white/5"
                            title="Gravar áudio"
                            aria-label="Gravar áudio"
                        >
                            <Mic className="w-5 h-5" />
                        </button>
                        <input
                            type="text"
                            value={inputText}
                            onChange={e => setInputText(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && handleSendMessage()}
                            placeholder="Digite sua mensagem..."
                            className="flex-1 bg-slate-800 border border-white/10 outline-none text-sm text-slate-100 placeholder:text-slate-400 px-4 py-3 rounded-xl focus:ring-2 focus:ring-blue-500/40 focus:bg-slate-800/80 transition-all font-medium"
                        />
                        <button
                            type="button"
                            onClick={handleSendMessage}
                            disabled={!inputText.trim()}
                            className="p-3 bg-blue-600 text-white rounded-xl shadow-lg shadow-blue-900/20 hover:bg-blue-500 disabled:opacity-50 disabled:shadow-none transition active:scale-95"
                            title="Enviar"
                            aria-label="Enviar"
                        >
                            <Send className="w-4 h-4" />
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
