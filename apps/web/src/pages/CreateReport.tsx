import React, { useState, useRef, useEffect, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../services/api';
import { toast } from 'react-hot-toast';
import {
    Plus,
    History,
    Search
} from 'lucide-react';
import { useDashboardSocket } from '../hooks/useDashboardSocket';
import {
    ProfessionalHeader,
    SupervisorHighlight,
    NewReportForm,
    SuccessView
} from '../components/domain/professional';
import { ChatWidget } from '../components/ChatWidget';
import {
    Button,
    Header,
    Card,
    ReportShimmer
} from '../components/ui';
import { ReportCard } from '../components/domain';
import { ReportHistoryModal } from '../components/domain/modals/ReportHistoryModal';

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
    const [searchParams, setSearchParams] = useSearchParams();
    const activeChatId = searchParams.get('chat');
    const isChatOpen = !!activeChatId;
    const [comment, setComment] = useState('');
    const [image, setImage] = useState<File | null>(null);
    const [preview, setPreview] = useState<string | null>(null);
    const [sending, setSending] = useState(false);
    const [success, setSuccess] = useState(false);
    const [history, setHistory] = useState<Report[]>([]);
    const [page, setPage] = useState(1);
    const [statusFilter, setStatusFilter] = useState<string>('');
    const [hasMore, setHasMore] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [loadingHistory, setLoadingHistory] = useState(false);
    const [selectedReport, setSelectedReport] = useState<Report | null>(null);
    const isChatOpenRef = useRef(false);
    const LIMIT = 10;

    const socketUser = useMemo(() => user ? {
        id: user.id || '',
        name: user.name || '',
        role: user.role || ''
    } : null, [user?.id, user?.name, user?.role]);

    const {
        socket,
        onlineUserIds,
        unreadMessages,
        isConnected,
        markAsRead
    } = useDashboardSocket({
        user: socketUser
    });

    const hasUnreadMessages = useMemo(() =>
        Object.values(unreadMessages).some(v => v === true),
        [unreadMessages]);

    useEffect(() => {
        isChatOpenRef.current = isChatOpen;
    }, [isChatOpen]);

    useEffect(() => {
        if (!socket) return;
        socket.on('report_status_updated', (data: { reportId: string, newStatus: any, feedback?: string, feedbackAt?: string }) => {
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
            socket.off('report_status_updated');
        };
    }, [socket, statusFilter]);

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
        setSearchParams({ chat: user.supervisorId }, { replace: true });
        markAsRead(user.supervisorId);
    };

    const handleCloseChat = () => {
        setSearchParams({}, { replace: true });
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

        try {
            const cloudinaryData = new FormData();
            cloudinaryData.append('file', image);
            cloudinaryData.append('upload_preset', 'flash_preset');

            const cloudinaryRes = await fetch('https://api.cloudinary.com/v1_1/dfr8mjlnb/image/upload', {
                method: 'POST',
                body: cloudinaryData
            });

            if (!cloudinaryRes.ok) throw new Error('Falha no upload da imagem');

            const cloudinaryJson = await cloudinaryRes.json();
            const imageUrl = cloudinaryJson.secure_url;

            const reportData = {
                comment,
                imageUrl,
                latitude: undefined as string | undefined,
                longitude: undefined as string | undefined
            };

            // Captura de Geolocalização (Otimizada)
            try {
                const position = await new Promise<GeolocationPosition>((resolve, reject) => {
                    navigator.geolocation.getCurrentPosition(resolve, reject, {
                        enableHighAccuracy: true,
                        timeout: 20000,
                        maximumAge: Infinity
                    });
                });
                reportData.latitude = position.coords.latitude.toString();
                reportData.longitude = position.coords.longitude.toString();
            } catch (error) {
                console.warn('GPS unavailable:', error);
            }

            await api.post('/reports', reportData);

            setSuccess(true);
            setComment('');
            setImage(null);
            setPreview(null);
            setView('history');
            loadHistory(1, true);
        } catch (error) {
            console.error(error);
            toast.error('Erro ao enviar relatório. Verifique sua conexão.');
        } finally {
            setSending(false);
        }
    }

    if (success) {
        return <SuccessView onBack={() => setSuccess(false)} />;
    }

    return (
        <div className="min-h-screen bg-slate-50/50 flex flex-col font-sans selection:bg-blue-100 selection:text-blue-900 transition-colors duration-700 overflow-x-hidden">
            <Header
                user={{
                    name: user?.name,
                    avatarUrl: user?.avatarUrl
                }}
                onLogout={signOut}
            />

            <main className="flex-1 relative overflow-hidden">
                {/* Background Decorations */}
                <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-600/10 rounded-full blur-[120px] animate-pulse pointer-events-none" />
                <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-indigo-600/10 rounded-full blur-[140px] animate-pulse pointer-events-none" style={{ animationDelay: '2s' }} />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[radial-gradient(circle_at_50%_50%,rgba(59,130,246,0.03),transparent_70%)] pointer-events-none" />

                <div className="relative z-10 w-full h-full">
                    {view === 'history' ? (
                        <div className="p-6 max-w-2xl mx-auto space-y-8">
                            <ProfessionalHeader
                                userName={user?.name || 'Profissional'}
                                isConnected={isConnected}
                            />

                            {user?.supervisorId && (
                                <SupervisorHighlight
                                    supervisorName={user.supervisorName || 'Responsável Técnico'}
                                    isOnline={onlineUserIds.includes(user.supervisorId)}
                                    hasUnread={hasUnreadMessages || !!unreadMessages[user.supervisorId]}
                                    onChatOpen={handleOpenChat}
                                />
                            )}

                            <div className="flex flex-col gap-4">
                                <Card variant="glass" className="p-4 border-gray-100 shadow-sm !rounded-[1.5rem] bg-white">
                                    <div className="relative group">
                                        <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-500 opacity-60 group-focus-within:opacity-100 transition-opacity" />
                                        <input
                                            type="text"
                                            placeholder="Buscar por protocolo ou descrição..."
                                            value={searchTerm}
                                            onChange={e => setSearchTerm(e.target.value)}
                                            className="w-full pl-14 pr-8 py-3 bg-gray-50 border border-transparent rounded-2xl outline-none focus:bg-white focus:border-blue-500/30 transition-all text-xs font-bold text-gray-800 placeholder:text-gray-500 placeholder:font-bold placeholder:uppercase"
                                        />
                                    </div>
                                </Card>

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
                                            className={`px-6 py-2.5 rounded-2xl text-[10px] font-black tracking-widest uppercase transition-all border shrink-0 ${statusFilter === filter.id
                                                ? 'bg-[#0f172a] text-white border-[#0f172a] shadow-lg shadow-gray-900/10'
                                                : 'bg-white text-gray-600 border-gray-100 hover:border-gray-200'
                                                }`}
                                        >
                                            {filter.label}
                                        </button>
                                    ))}
                                </div>
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
                                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-700 underline decoration-2 decoration-blue-500/30">Nenhum evento registrado</p>
                                </Card>
                            ) : (
                                <div className="grid gap-6">
                                    {history.filter(r =>
                                        r.comment.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                        r.id.toLowerCase().includes(searchTerm.toLowerCase())
                                    ).map(item => (
                                        <ReportCard
                                            key={item.id}
                                            report={item}
                                            actions={
                                                <Button variant="ghost" size="sm" onClick={() => setSelectedReport(item)}>
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
                        <div className="p-6 max-w-xl mx-auto space-y-12 animate-in slide-in-from-bottom-5 duration-500">
                            <ProfessionalHeader
                                userName={user?.name || 'Profissional'}
                                isConnected={isConnected}
                            />

                            <NewReportForm
                                comment={comment}
                                onCommentChange={setComment}
                                preview={preview}
                                onImageChange={handleImageChange}
                                onClearImage={() => { setImage(null); setPreview(null); }}
                                onSubmit={handleSubmit}
                                isSending={sending}
                            />
                        </div>
                    )}
                </div>
            </main>

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
                    onClose={handleCloseChat}
                    socket={socket}
                />
            )}

            <ReportHistoryModal
                isOpen={!!selectedReport}
                onClose={() => setSelectedReport(null)}
                report={selectedReport as any}
            />
        </div>
    );
}
