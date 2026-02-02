import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../services/api';
import { io } from 'socket.io-client';
import { toast } from 'react-hot-toast';
import {
    Camera,
    Send,
    ArrowLeft,
    Plus,
    History,
    MessageSquare
} from 'lucide-react';
import { ChatWidget } from '../components/ChatWidget';
import {
    Button,
    TextArea,
    Header,
    Card,
    ReportShimmer
} from '../components/ui';
import { ReportCard } from '../components/domain';

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
        avatarUrl?: string | null;
    };
    createdAt: string;
}

export function CreateReport() {
    const { user, signOut, updateUser } = useAuth();
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
    const [socket, setSocket] = useState<any>(null);
    const [loadingHistory, setLoadingHistory] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const isChatOpenRef = useRef(isChatOpen);

    useEffect(() => {
        isChatOpenRef.current = isChatOpen;
    }, [isChatOpen]);

    const playNotificationSound = () => {
        const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
        audio.play().catch(e => console.error('Erro ao tocar som:', e));
    };

    useEffect(() => {
        api.get('/profile/me').then(res => {
            if (res.data) updateUser(res.data);
        }).catch(() => { });
    }, []);

    useEffect(() => {
        loadHistory(1, true, statusFilter);
    }, [statusFilter]);

    useEffect(() => {
        const handleVisibilityChange = () => {
            if (document.visibilityState === 'visible') {
                loadHistory(1, true, statusFilter);
                setPage(1);
            }
        };
        document.addEventListener('visibilitychange', handleVisibilityChange);
        return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
    }, [statusFilter]);

    // Socket Connection Lifecycle
    useEffect(() => {
        if (!user?.id) return;

        const newSocket = io(SOCKET_URL, {
            query: { userId: user.id, role: user.role, userName: user.name },
            transports: ['websocket', 'polling']
        });
        setSocket(newSocket);

        newSocket.on('connect', () => setIsConnected(true));
        newSocket.on('disconnect', () => setIsConnected(false));

        newSocket.on('report_status_updated', (data: { reportId: string, newStatus: any, feedback?: string, feedbackAt?: string }) => {
            setHistory(prev => {
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

        return () => {
            newSocket.disconnect();
            setSocket(null);
        };
    }, [user?.id, user?.name, user?.role]);

    // Chat Notifications Listener
    useEffect(() => {
        if (!socket) return;

        const handleNotification = (data: { from: string, fromName?: string, text: string }) => {
            if (!isChatOpenRef.current) {
                setHasUnread(true);
                playNotificationSound();
                toast(`Mensagem do Supervisor: ${data.text}`, {
                    icon: '💬',
                    duration: 4000
                });
            }
        };

        socket.on('new_chat_notification', handleNotification);

        return () => {
            socket.off('new_chat_notification', handleNotification);
        };
    }, [socket]);

    async function loadHistory(pageNum: number = 1, reset: boolean = false, status?: string) {
        setLoadingHistory(pageNum === 1);
        try {
            const url = `/reports/me?page=${pageNum}&limit=${LIMIT}${status ? `&status=${status}` : ''}`;
            const response = await api.get(url);
            const newHistory = response.data;

            setHasMore(newHistory.length === LIMIT);
            setHistory(prev => reset ? newHistory : [...prev, ...newHistory]);
        } catch (error) {
            console.error('Erro ao carregar histórico');
        } finally {
            setLoadingHistory(false);
        }
    }

    const handleOpenChat = () => {
        if (!user?.supervisorId) {
            toast.error('Você ainda não possui um supervisor atribuído.', { icon: '⚠️' });
            return;
        }
        setIsChatOpen(true);
        setHasUnread(false);
    };

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
        if (!image) return toast.error('Por favor, tire uma foto para o relatório.');

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
            toast.error('Erro ao enviar relatório.');
        } finally {
            setSending(false);
        }
    }

    if (success) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-[#0f172a] p-6 text-center">
                <div className="bg-emerald-500/10 p-8 rounded-[3rem] border border-emerald-500/20 mb-8 animate-in zoom-in-50 duration-500">
                    <Send className="w-20 h-20 text-emerald-500" />
                </div>
                <h2 className="text-3xl font-black text-white mb-2 tracking-tight uppercase">Relatório Enviado!</h2>
                <p className="text-gray-400 mb-10 font-medium uppercase tracking-widest text-[10px]">O seu supervisor foi notificado em tempo real.</p>
                <Button variant="success" size="lg" className="px-12" onClick={() => setSuccess(false)}>
                    VOLTAR AO INÍCIO
                </Button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white flex flex-col font-sans">
            <Header
                user={{
                    name: user?.name,
                    avatarUrl: user?.avatarUrl
                }}
                onLogout={signOut}
            />

            <main className="flex-1 bg-gray-50/50">
                {view === 'history' ? (
                    <div className="p-6 max-w-2xl mx-auto space-y-8">
                        <header className="flex justify-between items-center">
                            <div>
                                <h1 className="text-3xl font-black text-gray-900 tracking-tight uppercase">Olá, {user?.name.split(' ')[0]}!</h1>
                                <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mt-1">Seu histórico operacional</p>
                            </div>

                            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-100 rounded-full shadow-sm">
                                <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`} />
                                <span className="text-[9px] font-black uppercase text-gray-400">{isConnected ? 'Online' : 'Offline'}</span>
                            </div>
                        </header>

                        {/* Supervisor Info */}
                        {user?.supervisorId && (
                            <Card variant="blue" className="!bg-blue-600 p-6 shadow-xl shadow-blue-900/10 flex flex-col sm:flex-row items-center justify-between gap-6">
                                <div className="flex items-center gap-4 text-white">
                                    <div className="bg-white/20 p-3 rounded-2xl backdrop-blur-md">
                                        <MessageSquare className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <p className="text-[9px] font-black text-white/60 uppercase tracking-widest">Supervisor Direto</p>
                                        <h3 className="text-lg font-bold">{user.supervisorName || 'Responsável Técnico'}</h3>
                                    </div>
                                </div>
                                <Button
                                    variant="glass"
                                    className="!bg-white/10 !text-white !border-white/20 hover:!bg-white/20"
                                    onClick={handleOpenChat}
                                >
                                    {hasUnread && <span className="w-2 h-2 bg-red-500 rounded-full mr-2" />}
                                    ABRIR CANAL DE CHAT
                                </Button>
                            </Card>
                        )}

                        {/* Filters */}
                        <div className="flex gap-2 overflow-x-auto pb-4 no-scrollbar">
                            {[
                                { id: '', label: 'Tudo' },
                                { id: 'SENT', label: 'Enviados' },
                                { id: 'IN_REVIEW', label: 'Análise' },
                                { id: 'FORWARDED', label: 'Depto' },
                                { id: 'RESOLVED', label: 'Finalizado' },
                            ].map(filter => (
                                <button
                                    key={filter.id}
                                    onClick={() => { setStatusFilter(filter.id); setPage(1); }}
                                    className={`px-6 py-2.5 rounded-2xl text-[10px] font-black tracking-widest uppercase transition-all border ${statusFilter === filter.id
                                        ? 'bg-[#0f172a] text-white border-[#0f172a] shadow-lg shadow-gray-900/10'
                                        : 'bg-white text-gray-400 border-gray-100 hover:border-gray-200'
                                        }`}
                                >
                                    {filter.label}
                                </button>
                            ))}
                        </div>

                        {loadingHistory ? (
                            <div className="space-y-6">
                                <ReportShimmer />
                                <ReportShimmer />
                                <ReportShimmer />
                            </div>
                        ) : history.length === 0 ? (
                            <Card variant="glass" className="py-20 flex flex-col items-center justify-center text-gray-300">
                                <History className="w-12 h-12 mb-4 opacity-20" />
                                <p className="text-[10px] font-black uppercase tracking-widest underline decoration-2 decoration-blue-500/30">Nenhum evento registrado</p>
                            </Card>
                        ) : (
                            <div className="grid gap-6">
                                {history.map(item => (
                                    <ReportCard
                                        key={item.id}
                                        report={item}
                                        actions={
                                            <Button variant="ghost" size="sm" onClick={() => toast('Histórico detalhado em breve!')}>
                                                Detalhes
                                            </Button>
                                        }
                                    />
                                ))}

                                {hasMore && (
                                    <Button variant="secondary" size="lg" fullWidth onClick={handleLoadMore} className="bg-white mt-4">
                                        Carregar Mais Atividades
                                    </Button>
                                )}
                            </div>
                        )}
                        <div className="h-24"></div>
                    </div>
                ) : (
                    <div className="p-6 max-w-xl mx-auto space-y-8 animate-in slide-in-from-bottom-5 duration-500">
                        <header className="flex items-center gap-4">
                            <button onClick={() => setView('history')} className="p-2 hover:bg-white rounded-2xl border border-transparent hover:border-gray-100 transition-all">
                                <ArrowLeft className="w-6 h-6 text-gray-400" />
                            </button>
                            <div>
                                <h1 className="text-3xl font-black text-gray-900 tracking-tight uppercase">Novo Reporte</h1>
                                <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mt-1">Sinalização de conformidade ou ocorrência</p>
                            </div>
                        </header>

                        <form onSubmit={handleSubmit} className="space-y-8">
                            <div
                                onClick={() => fileInputRef.current?.click()}
                                className="aspect-video bg-white border-2 border-dashed border-gray-200 rounded-[2.5rem] flex flex-col items-center justify-center cursor-pointer overflow-hidden relative shadow-sm hover:border-blue-400 transition-all group"
                            >
                                {preview ? (
                                    <img src={preview} alt="Preview" className="w-full h-full object-cover" />
                                ) : (
                                    <>
                                        <div className="bg-[#0f172a] p-6 rounded-full mb-4 shadow-xl shadow-gray-900/10 group-hover:scale-110 transition-transform">
                                            <Camera className="w-8 h-8 text-white" />
                                        </div>
                                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Capturar Evidência Visual</span>
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

                            <TextArea
                                label="Relatório de Atividade / Observação"
                                value={comment}
                                onChange={e => setComment(e.target.value)}
                                placeholder="Descreva os detalhes da ocorrência ou atividade realizada..."
                                rows={6}
                                required
                            />

                            <Button
                                type="submit"
                                variant="primary"
                                size="lg"
                                fullWidth
                                isLoading={sending}
                                className="!py-6 text-sm"
                            >
                                ENVIAR AGORA
                            </Button>
                        </form>
                    </div>
                )}
            </main>

            {/* Float Action Button */}
            {view === 'history' && (
                <button
                    onClick={() => setView('form')}
                    className="fixed bottom-8 right-6 w-18 h-18 bg-[#0f172a] rounded-[2rem] flex items-center justify-center text-white shadow-2xl shadow-gray-900/20 active:scale-90 transition-all hover:-translate-y-1 z-30 p-5 group"
                >
                    <Plus className="w-10 h-10 group-hover:rotate-90 transition-transform" />
                </button>
            )}

            {isChatOpen && user && (
                <ChatWidget
                    currentUser={{ id: user.id, name: user.name, role: user.role }}
                    targetUser={{
                        id: user.supervisorId || 'supervisor',
                        name: user.supervisorName || 'Supervisor',
                        role: 'SUPERVISOR'
                    }}
                    onClose={() => setIsChatOpen(false)}
                    socket={socket}
                />
            )}
        </div>
    );
}
