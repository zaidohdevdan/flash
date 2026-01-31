import { useState, useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { Send, Mic, X, MessageSquare, Square } from 'lucide-react';
import { api } from '../services/api';

const SOCKET_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

interface Message {
    from: string;
    text?: string;
    audioUrl?: string;
    createdAt: string;
}

interface ChatWidgetProps {
    currentUser: { id: string; role: string; name: string };
    targetUser: { id: string; name: string; role?: string }; // Who we are talking to
    onClose: () => void;
}

export function ChatWidget({ currentUser, targetUser, onClose }: ChatWidgetProps) {
    const [messages, setMessages] = useState<Message[]>([]);
    const [inputText, setInputText] = useState('');
    const [isRecording, setIsRecording] = useState(false);
    const [socket, setSocket] = useState<Socket | null>(null);
    const [recordingTime, setRecordingTime] = useState(0);

    const messagesEndRef = useRef<HTMLDivElement>(null);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const chunksRef = useRef<Blob[]>([]);
    const timerRef = useRef<number | null>(null);

    // Determines the "room owner" (the professional)
    // If I am Supervisor talking to Pro X, target is X. Room is chat:X
    // If I am Pro Y talking to Supervisor, target is Supervisor. Room is chat:Y (myself)
    const professionalId = currentUser.role === 'SUPERVISOR' || currentUser.role === 'ADMIN' ? targetUser.id : currentUser.id;

    useEffect(() => {
        const newSocket = io(SOCKET_URL, {
            query: { userId: currentUser.id, role: currentUser.role }
        });

        newSocket.on('connect', () => {
            // Join the specific chat room
            // We pass 'targetUserId' as the PROFESSIONAL's ID we want to join
            // If I am Pro, I join my own room (professionalId = my id)
            // If I am Supervisor, I join targetUser.id (professionalId)
            newSocket.emit('join_private_chat', { targetUserId: professionalId });
        });

        newSocket.on('private_message', (msg: Message) => {
            setMessages(prev => [...prev, msg]);
        });

        setSocket(newSocket);

        return () => {
            newSocket.disconnect();
        };
    }, [currentUser, professionalId]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    const handleSendMessage = () => {
        if (!inputText.trim() || !socket) return;

        socket.emit('private_message', {
            targetUserId: professionalId,
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

            if (socket) {
                socket.emit('private_message', {
                    targetUserId: professionalId,
                    audioUrl
                });
            }
        } catch (error) {
            console.error('Error uploading audio:', error);
            alert('Falha ao enviar áudio.');
        }
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
    };

    return (
        <div className="fixed bottom-4 right-4 w-96 h-[500px] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-gray-100 z-50 animate-in slide-in-from-bottom-10 fade-in duration-300">
            {/* Header */}
            <div className="p-4 bg-blue-600 text-white flex justify-between items-center">
                <div className="flex items-center gap-3">
                    <div className="bg-white/20 p-2 rounded-full">
                        <MessageSquare className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <h3 className="font-bold text-sm">{targetUser.name}</h3>
                        <p className="text-[10px] opacity-80 uppercase tracking-wider">{currentUser.role === 'SUPERVISOR' ? 'Subordinado' : 'Supervisor'}</p>
                    </div>
                </div>
                <button onClick={onClose} className="p-1 hover:bg-white/20 rounded-full transition">
                    <X className="w-5 h-5" />
                </button>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 bg-gray-50/50 space-y-4">
                {messages.length === 0 && (
                    <div className="flex flex-col items-center justify-center h-full text-gray-400 opacity-50">
                        <MessageSquare className="w-12 h-12 mb-2" />
                        <p className="text-xs">Inicie a conversa...</p>
                    </div>
                )}

                {messages.map((msg, idx) => {
                    const isMe = msg.from === currentUser.id;
                    return (
                        <div key={idx} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[80%] p-3 rounded-2xl shadow-sm text-sm ${isMe
                                ? 'bg-blue-600 text-white rounded-tr-none'
                                : 'bg-white border text-gray-800 rounded-tl-none'
                                }`}>
                                {msg.text && <p>{msg.text}</p>}
                                {msg.audioUrl && (
                                    <audio controls src={msg.audioUrl} className="h-8 max-w-[200px]" />
                                )}
                                <span className={`text-[9px] block mt-1 text-right font-medium opacity-70 ${isMe ? 'text-blue-100' : 'text-gray-400'}`}>
                                    {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
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
