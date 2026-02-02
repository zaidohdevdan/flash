import { useState, useEffect, useRef } from 'react';
import { Socket } from 'socket.io-client';
import { Send, Mic, X, MessageSquare, Square, Trash2, Hourglass, Pencil, Check, Trash } from 'lucide-react';
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
    const [now, setNow] = useState(Date.now());
    const [selectedMessageId, setSelectedMessageId] = useState<string | null>(null);
    const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
    const [editText, setEditText] = useState('');

    const messagesEndRef = useRef<HTMLDivElement>(null);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const chunksRef = useRef<Blob[]>([]);
    const timerRef = useRef<number | null>(null);

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
                    audio.play().catch(e => console.error('Erro ao tocar som:', e));
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

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

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

    const handleDeleteMessage = async (messageId: string) => {
        if (!window.confirm('Excluir esta mensagem?')) return;

        try {
            await api.delete(`/chat/messages/${messageId}`);
            socket?.emit('delete_message', { messageId, roomName: chatRoom });
            setMessages(prev => prev.filter(m => m.id !== messageId));
            setSelectedMessageId(null);
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
        <div className="fixed bottom-0 right-0 sm:bottom-4 sm:right-4 w-full sm:w-96 h-[500px] max-h-[100vh] sm:max-h-[calc(100vh-2rem)] bg-white/60 backdrop-blur-[32px] rounded-t-2xl sm:rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-white/50 ring-1 ring-white/20 z-50 animate-in slide-in-from-bottom-10 fade-in duration-300">
            {/* Header */}
            <div className="p-4 bg-blue-600/80 backdrop-blur-xl text-white flex justify-between items-center border-b border-white/10">
                <div className="flex items-center gap-3">
                    <div className="bg-white/20 p-2 rounded-full">
                        <MessageSquare className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <h3 className="font-bold text-sm">{targetUser.name}</h3>
                        <p className="text-[10px] opacity-80 uppercase tracking-wider">
                            {targetUser.role === 'MANAGER' ? 'Gerente / Setor' :
                                targetUser.role === 'SUPERVISOR' ? 'Supervisor' :
                                    targetUser.role === 'PROFESSIONAL' ? 'Operacional' :
                                        'Contato'}
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-1">
                    <button
                        onClick={handleClearHistory}
                        className="p-1.5 hover:bg-white/20 rounded-lg transition text-white/70 hover:text-white"
                        title="Excluir Histórico"
                    >
                        <Trash2 className="w-4 h-4" />
                    </button>
                    <button onClick={onClose} className="p-1 hover:bg-white/20 rounded-full transition">
                        <X className="w-5 h-5" />
                    </button>
                </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 bg-gray-50/50 space-y-4 overscroll-contain">
                {messages.length === 0 && (
                    <div className="flex flex-col items-center justify-center h-full text-gray-400 opacity-50">
                        <MessageSquare className="w-12 h-12 mb-2" />
                        <p className="text-xs">Inicie a conversa...</p>
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
                                className={`group relative max-w-[80%] p-3 rounded-2xl shadow-sm text-sm transition-all cursor-pointer ${isMe
                                    ? 'bg-blue-600 text-white rounded-tr-none'
                                    : 'bg-white border text-gray-800 rounded-tl-none'
                                    } ${isSelected ? 'ring-2 ring-blue-300 ring-offset-2' : ''}`}
                            >
                                {isEditing ? (
                                    <div className="flex flex-col gap-2 min-w-[200px]">
                                        <textarea
                                            value={editText}
                                            onChange={e => setEditText(e.target.value)}
                                            className="w-full bg-white/20 text-white placeholder-white/50 border-none outline-none rounded-lg p-2 text-xs resize-none"
                                            rows={2}
                                            autoFocus
                                        />
                                        <div className="flex justify-end gap-2">
                                            <button onClick={() => setEditingMessageId(null)} className="p-1 hover:bg-white/10 rounded">
                                                <X className="w-3.5 h-3.5" />
                                            </button>
                                            <button onClick={handleUpdateMessage} className="p-1 bg-white text-blue-600 rounded">
                                                <Check className="w-3.5 h-3.5" />
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <>
                                        {msg.text && <p className="whitespace-pre-wrap">{msg.text}</p>}
                                        {msg.audioUrl && (
                                            <div className="space-y-1.5">
                                                <audio controls src={msg.audioUrl} className="h-8 max-w-[200px]" />
                                                {msg.expiresAt && (
                                                    <div className="flex items-center justify-end gap-1 text-[9px] font-bold text-red-500 bg-red-50/50 px-2 py-0.5 rounded-full border border-red-100/50 animate-pulse">
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
                                        <span className={`text-[9px] block mt-1 text-right font-medium opacity-70 ${isMe ? 'text-blue-100' : 'text-gray-400'}`}>
                                            {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                    </>
                                )}

                                {/* Action Buttons Overlay */}
                                {isSelected && isMe && !isEditing && (
                                    <div className="absolute -left-12 top-0 flex flex-col gap-1 animate-in slide-in-from-right-2 fade-in">
                                        <button
                                            onClick={(e) => { e.stopPropagation(); handleStartEdit(msg); }}
                                            className="p-2 bg-white shadow-lg border rounded-full text-gray-500 hover:text-blue-600 transition"
                                        >
                                            <Pencil className="w-3.5 h-3.5" />
                                        </button>
                                        <button
                                            onClick={(e) => { e.stopPropagation(); handleDeleteMessage(msg.id!); }}
                                            className="p-2 bg-white shadow-lg border rounded-full text-gray-500 hover:text-red-600 transition"
                                        >
                                            <Trash className="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-3 bg-white border-t">
                {isRecording ? (
                    <div className="flex items-center justify-between bg-red-50 p-2 rounded-xl border border-red-100 animate-pulse">
                        <div className="flex items-center gap-2 text-red-600">
                            <div className="w-2 h-2 rounded-full bg-red-600 animate-ping" />
                            <span className="text-xs font-bold font-mono">{formatTime(recordingTime)}</span>
                        </div>
                        <span className="text-xs text-red-400 font-medium">Gravando áudio...</span>
                        <button
                            onClick={stopRecording}
                            className="p-2 bg-red-100 text-red-600 rounded-full hover:bg-red-200 transition"
                        >
                            <Square className="w-4 h-4 fill-current" />
                        </button>
                    </div>
                ) : (
                    <div className="flex items-center gap-2">
                        <button
                            onClick={startRecording}
                            className="p-2.5 bg-gray-100 text-gray-500 rounded-xl hover:bg-red-50 hover:text-red-500 transition active:scale-95"
                            title="Gravar áudio"
                        >
                            <Mic className="w-5 h-5" />
                        </button>
                        <input
                            type="text"
                            value={inputText}
                            onChange={e => setInputText(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && handleSendMessage()}
                            placeholder="Digite sua mensagem..."
                            className="flex-1 bg-gray-100 border-none outline-none text-sm px-4 py-2.5 rounded-xl focus:ring-2 focus:ring-blue-100 transition"
                        />
                        <button
                            onClick={handleSendMessage}
                            disabled={!inputText.trim()}
                            className="p-2.5 bg-blue-600 text-white rounded-xl shadow-lg shadow-blue-200 hover:bg-blue-700 disabled:opacity-50 disabled:shadow-none transition active:scale-95"
                        >
                            <Send className="w-4 h-4" />
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
