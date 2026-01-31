import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../services/api';
import { io } from 'socket.io-client';
import { toast } from 'react-hot-toast';
import { Camera, Send, LogOut, CheckCircle2, Clock, CheckCircle, AlertCircle, MessageSquare, Wifi, WifiOff, Plus, ArrowLeft, Archive, User } from 'lucide-react';

const SOCKET_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

interface Report {
    id: string;
    imageUrl: string;
    comment: string;
    feedback?: string;
    feedbackAt?: string;
    status: 'SENT' | 'IN_REVIEW' | 'FORWARDED' | 'RESOLVED' | 'ARCHIVED';
    user?: {
        name: string;
        avatarUrl?: string;
    };
    createdAt: string;
}

import { ChatWidget } from '../components/ChatWidget';

export function CreateReport() {
    const { user, signOut } = useAuth();
    const [view, setView] = useState<'history' | 'form'>('history');
    const [isChatOpen, setIsChatOpen] = useState(false);
    const [comment, setComment] = useState('');
    const [image, setImage] = useState<File | null>(null);
    const [preview, setPreview] = useState<string | null>(null);
    const [sending, setSending] = useState(false);
    const [success, setSuccess] = useState(false);
    const [history, setHistory] = useState<Report[]>([]);
    const [page, setPage] = useState(1);
    const [statusFilter, setStatusFilter] = useState<string>('');
    const [hasMore, setHasMore] = useState(true);
    const [isConnected, setIsConnected] = useState(false);
    const LIMIT = 10;

    const [hasUnread, setHasUnread] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const playNotificationSound = () => {
        const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
        audio.play().catch(e => console.error('Erro ao tocar som:', e));
    };

    useEffect(() => {
        loadHistory(1, true, statusFilter);

        const handleVisibilityChange = () => {
            if (document.visibilityState === 'visible') {
                loadHistory(1, true);
                setPage(1);
            }
        };
        document.addEventListener('visibilitychange', handleVisibilityChange);

        const socket = io(SOCKET_URL, {
            query: { userId: user?.id, role: user?.role, userName: user?.name },
            transports: ['websocket', 'polling']
        });

        socket.on('connect', () => setIsConnected(true));
        socket.on('disconnect', () => setIsConnected(false));

        socket.on('report_status_updated', (data: { reportId: string, newStatus: any, feedback?: string, feedbackAt?: string }) => {
            setHistory(prev => {
                // Se houver um filtro ativo e o novo status for diferente dele, removemos da lista
                if (statusFilter && statusFilter !== data.newStatus) {
                    return prev.filter(item => item.id !== data.reportId);
                }
                return prev.map(item =>
                    item.id === data.reportId
                        ? { ...item, status: data.newStatus, feedback: data.feedback, feedbackAt: data.feedbackAt }
                        : item
                );
            });
        });

        socket.on('new_chat_notification', (data: { from: string, fromName?: string, text: string }) => {
            if (!isChatOpen) {
                setHasUnread(true);
                playNotificationSound();
                toast(`Mensagem do Supervisor: ${data.text}`, {
                    icon: '💬',
                    duration: 4000
                });
            }
        });

        return () => {
            socket.disconnect();
            document.removeEventListener('visibilitychange', handleVisibilityChange);
        };
    }, [user, statusFilter]);

    async function loadHistory(pageNum: number = 1, reset: boolean = false, status?: string) {
        try {
            const url = `/reports/me?page=${pageNum}&limit=${LIMIT}${status ? `&status=${status}` : ''}`;
            const response = await api.get(url);
            const newHistory = response.data;

            setHasMore(newHistory.length === LIMIT);
            setHistory(prev => reset ? newHistory : [...prev, ...newHistory]);
        } catch (error) {
            console.error('Erro ao carregar histórico');
        }
    }

    function handleLoadMore() {
        const nextPage = page + 1;
        setPage(nextPage);
        loadHistory(nextPage, false, statusFilter);
    }

    function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        if (file) {
            setImage(file);
            setPreview(URL.createObjectURL(file));
        }
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (!image) return alert('Por favor, tire uma foto para o relatório.');

        setSending(true);
        const formData = new FormData();
        formData.append('image', image);
        formData.append('comment', comment);

        try {
            await api.post('/reports', formData);
            setSuccess(true);
            setComment('');
            setImage(null);
            setPreview(null);
            setView('history');
            loadHistory(1, true);
        } catch (error) {
            alert('Erro ao enviar relatório.');
        } finally {
            setSending(false);
        }
    }

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'RESOLVED': return <CheckCircle className="text-green-500 w-4 h-4" />;
            case 'IN_REVIEW': return <Clock className="text-blue-500 w-4 h-4" />;
            case 'FORWARDED': return <Send className="text-purple-500 w-4 h-4" />;
            case 'ARCHIVED': return <Archive className="text-gray-400 w-4 h-4" />;
            default: return <AlertCircle className="text-yellow-500 w-4 h-4" />;
        }
    };

    if (success) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-6 text-center">
                <CheckCircle2 className="w-20 h-20 text-green-500 mb-4" />
                <h2 className="text-2xl font-bold text-gray-800 mb-2">Relatório Enviado!</h2>
                <p className="text-gray-600 mb-8">O seu supervisor foi notificado em tempo real.</p>
                <button
                    onClick={() => setSuccess(false)}
                    className="bg-blue-600 text-white px-8 py-3 rounded-full font-bold shadow-lg"
                >
                    CONCLUIR
                </button>
            </div>
        );
    }

    const Spinner = () => (
        <div className="w-6 h-6 border-2 border-white/40 border-t-white rounded-full animate-spin" />
    );

    return (
        <div className="min-h-screen bg-white flex flex-col">
            {/* Header */}
            <header className="bg-white border-b px-6 py-4 flex justify-between items-center shadow-sm sticky top-0 z-20">
                <div className="flex items-center gap-3">
                    {view === 'form' && (
                        <button onClick={() => setView('history')} className="p-1 -ml-2 text-gray-400">
                            <ArrowLeft className="w-6 h-6" />
                        </button>
                    )}
                    <span className="font-black text-blue-600 tracking-tighter text-xl">FLASH</span>
                    <div className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold ${isConnected ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                        {isConnected ? <Wifi className="w-3 h-3" /> : <WifiOff className="w-3 h-3" />}
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => {
                            setIsChatOpen(true);
                            setHasUnread(false);
                        }}
                        className="relative p-2 text-blue-600 bg-blue-50 rounded-full hover:bg-blue-100 transition"
                    >
                        <MessageSquare className="w-5 h-5" />
                        {hasUnread && (
                            <span className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-red-500 border-2 border-white rounded-full animate-pulse" />
                        )}
                    </button>
                    <button onClick={signOut} className="text-gray-400 p-1">
                        <LogOut className="w-5 h-5" />
                    </button>
                </div>
            </header>

            <main className="flex-1 overflow-y-auto bg-gray-50">
                {view === 'history' ? (
                    <div className="p-6 max-w-md mx-auto space-y-6">
                        <div className="flex justify-between items-center mb-2">
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900">Olá, {user?.name.split(' ')[0]}!</h1>
                                <p className="text-sm text-gray-500">Seu histórico de atividades.</p>
                            </div>
                        </div>

                        {/* Supervisor Info Card - NEW */}
                        {user?.supervisorId && (
                            <div className="bg-white p-5 rounded-3xl shadow-sm border border-gray-100 flex items-center justify-between mb-2">
                                <div className="flex items-center gap-4">
                                    <div className="bg-blue-100 p-3 rounded-2xl">
                                        <User className="w-5 h-5 text-blue-600" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">Meu Supervisor</p>
                                        <h3 className="text-sm font-bold text-gray-800">{user.supervisorName || 'Supervisor Responsável'}</h3>
                                    </div>
                                </div>
                                <button
                                    onClick={() => {
                                        setIsChatOpen(true);
                                        setHasUnread(false);
                                    }}
                                    className="relative px-4 py-2 bg-blue-600 text-white text-[10px] font-black rounded-xl shadow-lg shadow-blue-100 hover:bg-blue-700 transition active:scale-95"
                                >
                                    ABRIR CHAT
                                    {hasUnread && (
                                        <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 border-2 border-white rounded-full animate-pulse" />
                                    )}
                                </button>
                            </div>
                        )}

                        {/* Filter Bar */}
                        <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
                            {[
                                { id: '', label: 'Tudo' },
                                { id: 'SENT', label: 'Enviados' },
                                { id: 'IN_REVIEW', label: 'Análise' },
                                { id: 'FORWARDED', label: 'Depto' },
                                { id: 'RESOLVED', label: 'Fim' },
                                { id: 'ARCHIVED', label: 'Arq' },
                            ].map(filter => (
                                <button
                                    key={filter.id}
                                    onClick={() => {
                                        setStatusFilter(filter.id);
                                        setPage(1);
                                    }}
                                    className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all border ${statusFilter === filter.id
                                        ? 'bg-blue-600 text-white border-blue-600 shadow-md'
                                        : 'bg-white text-gray-500 border-gray-100'
                                        }`}
                                >
                                    {filter.label}
                                </button>
                            ))}
                        </div>

                        {history.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-20 text-gray-400">
                                <MessageSquare className="w-12 h-12 mb-3 opacity-20" />
                                <p className="text-sm italic">Nenhum reporte encontrado.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 gap-4">
                                {history.map(item => (
                                    <div key={item.id} className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex gap-4 items-start active:scale-[0.98] transition">
                                        <div className="relative">
                                            <img
                                                src={item.imageUrl}
                                                className="w-20 h-20 rounded-xl object-cover bg-gray-100 shadow-inner"
                                            />
                                            <div className="absolute -top-2 -right-2 bg-white rounded-full p-1 shadow-sm border border-gray-50">
                                                {getStatusIcon(item.status)}
                                            </div>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <span className="text-[10px] text-gray-400 uppercase font-black tracking-widest">
                                                {new Date(item.createdAt).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}
                                            </span>
                                            <div className="flex items-center justify-between mt-1">
                                                <p className="text-sm text-gray-800 font-medium line-clamp-2 leading-tight">
                                                    {item.comment}
                                                </p>
                                                <div className="flex-shrink-0 ml-2">
                                                    {item.user?.avatarUrl ? (
                                                        <img src={item.user.avatarUrl} alt="" className="w-8 h-8 rounded-full object-cover border-2 border-white shadow-sm" />
                                                    ) : (
                                                        <div className="w-8 h-8 bg-gray-50 rounded-full flex items-center justify-center border-2 border-white shadow-sm">
                                                            <User className="w-4 h-4 text-gray-300" />
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                            {item.feedback && (
                                                <div className={`mt-2 p-2 rounded-lg border-l-2 ${item.status === 'RESOLVED'
                                                    ? 'bg-green-50 border-green-400'
                                                    : 'bg-yellow-50 border-yellow-400'
                                                    }`}>
                                                    <div className="flex justify-between items-center mb-1">
                                                        <p className={`text-[9px] font-bold uppercase italic ${item.status === 'RESOLVED' ? 'text-green-800' : 'text-yellow-800'
                                                            }`}>Supervisor:</p>
                                                        {item.feedbackAt && (
                                                            <span className={`${item.status === 'RESOLVED' ? 'text-green-400' : 'text-yellow-400'
                                                                } text-[8px] font-bold`}>
                                                                {new Date(item.feedbackAt).toLocaleString('pt-BR', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit' })}
                                                            </span>
                                                        )}
                                                    </div>
                                                    <p className={`text-[10px] italic leading-tight ${item.status === 'RESOLVED' ? 'text-green-700' : 'text-yellow-700'
                                                        }`}>{item.feedback}</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}

                                {hasMore && (
                                    <button
                                        onClick={handleLoadMore}
                                        className="w-full py-4 text-blue-600 text-xs font-bold uppercase tracking-widest hover:bg-white rounded-xl transition"
                                    >
                                        Carregar mais resultados
                                    </button>
                                )}
                            </div>
                        )}
                        <div className="h-24"></div> {/* Spacer for FAB */}
                    </div>
                ) : (
                    <div className="p-6 max-w-md mx-auto">
                        <h2 className="text-2xl font-bold text-gray-900 mb-1">Novo Relatório</h2>
                        <p className="text-sm text-gray-500 mb-8">Registre a ocorrência com detalhes.</p>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div
                                onClick={() => fileInputRef.current?.click()}
                                className="aspect-[4/3] bg-white border-2 border-dashed border-gray-200 rounded-3xl flex flex-col items-center justify-center cursor-pointer overflow-hidden relative shadow-sm active:bg-gray-100 transition"
                            >
                                {preview ? (
                                    <img src={preview} alt="Preview" className="w-full h-full object-cover" />
                                ) : (
                                    <>
                                        <div className="bg-blue-600 p-5 rounded-full mb-3 shadow-lg shadow-blue-200">
                                            <Camera className="w-8 h-8 text-white" />
                                        </div>
                                        <span className="text-sm font-bold text-gray-400 uppercase tracking-widest">Capturar Imagem</span>
                                    </>
                                )}
                                <input
                                    type="file"
                                    accept="image/*"
                                    capture="environment"
                                    className="hidden"
                                    ref={fileInputRef}
                                    onChange={handleImageChange}
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Observações de Campo</label>
                                <textarea
                                    value={comment}
                                    onChange={e => setComment(e.target.value)}
                                    placeholder="O que está acontecendo no local?"
                                    className="w-full h-40 p-4 border-gray-200 border rounded-3xl resize-none outline-none focus:ring-4 focus:ring-blue-50/50 focus:border-blue-500 transition shadow-sm"
                                    required
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={sending}
                                className={`w-full py-5 rounded-3xl font-black text-white flex items-center justify-center gap-3 shadow-xl shadow-blue-100 active:scale-95 transition-all ${sending ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700'}`}
                            >
                                {sending ? (
                                    <>
                                        <Spinner />
                                        <span className="text-sm tracking-widest">ENVIANDO</span>
                                    </>
                                ) : (
                                    <>
                                        ENVIAR AGORA <Send className="w-5 h-5" />
                                    </>
                                )}
                            </button>
                        </form>
                    </div>
                )}
            </main>

            {/* FAB Button */}
            {view === 'history' && (
                <button
                    onClick={() => setView('form')}
                    className="fixed bottom-8 right-6 w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center text-white shadow-2xl shadow-blue-400 active:scale-90 transition-transform z-30"
                >
                    <Plus className="w-8 h-8" />
                </button>
            )}

            {isChatOpen && user && (
                <ChatWidget
                    currentUser={user}
                    targetUser={{ id: user.supervisorId || 'supervisor', name: user.supervisorName || 'Supervisor', role: 'SUPERVISOR' }}
                    onClose={() => setIsChatOpen(false)}
                />
            )}
        </div>
    );
}
