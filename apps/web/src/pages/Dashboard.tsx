import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../services/api';
import { io } from 'socket.io-client';
import { toast } from 'react-hot-toast';
import {
    Clock,
    CheckCircle,
    AlertCircle,
    History,
    Folder,
    MessageSquare,
    TrendingUp,
    Search
} from 'lucide-react';
import { ChatWidget } from '../components/ChatWidget';
import {
    Avatar,
    Badge,
    Button,
    Input,
    TextArea,
    GlassCard,
    Modal,
    Header,
    Card
} from '../components/ui';
import { KpiCard, ReportCard, TeamSidebar } from '../components/domain';

const SOCKET_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

interface ReportHistory {
    id: string;
    status: string;
    comment: string;
    userName: string;
    departmentName?: string;
    createdAt: string;
}

interface Subordinate {
    id: string;
    name: string;
    role: string;
    avatarUrl?: string | null;
    statusPhrase?: string;
    isOnline?: boolean;
}

interface UserContact {
    id: string;
    name: string;
    role: string;
    avatarUrl?: string | null;
    statusPhrase?: string;
    isOnline?: boolean;
    departmentName?: string;
}

interface Stats {
    status: string;
    _count: number;
}

interface Report {
    id: string;
    imageUrl: string;
    comment: string;
    feedback?: string;
    status: 'SENT' | 'IN_REVIEW' | 'FORWARDED' | 'RESOLVED' | 'ARCHIVED';
    history: ReportHistory[];
    departmentId?: string | null;
    department?: { name: string };
    createdAt: string;
    user: {
        name: string;
        avatarUrl?: string | null;
        statusPhrase?: string;
    };
}

interface Department {
    id: string;
    name: string;
}

export function Dashboard() {
    const { user, signOut, updateUser } = useAuth();
    const [reports, setReports] = useState<Report[]>([]);
    const [stats, setStats] = useState<Stats[]>([]);
    const [subordinates, setSubordinates] = useState<Subordinate[]>([]);
    const [contacts, setContacts] = useState<UserContact[]>([]);
    const [departments, setDepartments] = useState<Department[]>([]);

    // Modals
    const [selectedReport, setSelectedReport] = useState<Report | null>(null);
    const [analyzingReport, setAnalyzingReport] = useState<Report | null>(null);
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [targetStatus, setTargetStatus] = useState<'IN_REVIEW' | 'FORWARDED' | 'RESOLVED'>('IN_REVIEW');

    // Profile Form
    const [profilePhrase, setProfilePhrase] = useState(user?.statusPhrase || '');
    const [profileAvatar, setProfileAvatar] = useState<File | null>(null);
    const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);

    // Chat
    const [chatTarget, setChatTarget] = useState<Subordinate | UserContact | null>(null);
    const [socket, setSocket] = useState<any>(null);
    const [onlineUserIds, setOnlineUserIds] = useState<string[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [unreadMessages, setUnreadMessages] = useState<Record<string, boolean>>({});

    const playNotificationSound = () => {
        const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
        audio.play().catch(e => console.error('Erro ao tocar som:', e));
    };

    // Form for Forwarding/Review
    const [formFeedback, setFormFeedback] = useState('');
    const [selectedDeptId, setSelectedDeptId] = useState('');

    const [page, setPage] = useState(1);
    const [statusFilter, setStatusFilter] = useState<string>('SENT');
    const [startDate, setStartDate] = useState<string>('');
    const [endDate, setEndDate] = useState<string>('');
    const [hasMore, setHasMore] = useState(true);
    const LIMIT = 6;

    const loadReports = async (pageNum: number, reset: boolean = false, status?: string) => {
        try {
            let url = `/reports?page=${pageNum}&limit=${LIMIT}`;
            if (status) url += `&status=${status}`;
            if (startDate) url += `&startDate=${new Date(startDate).toISOString()}`;
            if (endDate) url += `&endDate=${new Date(endDate).toISOString()}`;

            const response = await api.get(url);
            setHasMore(response.data.length === LIMIT);
            setReports(prev => reset ? response.data : [...prev, ...response.data]);
        } catch (error) {
            console.error('Erro ao buscar relatórios:', error);
        }
    };

    const loadStats = async () => {
        try {
            const response = await api.get('/reports/stats');
            setStats(response.data);
        } catch (error) {
            console.error('Erro ao buscar estatísticas:', error);
        }
    };

    const loadSubordinates = async () => {
        try {
            const response = await api.get('/subordinates');
            setSubordinates(response.data);
        } catch (error) {
            console.error('Erro ao buscar subordinados:', error);
        }
    };

    const loadContacts = async () => {
        try {
            const response = await api.get('/support-network');
            const allContacts = response.data
                .filter((c: UserContact) => c.id !== user?.id)
                .map((c: UserContact) => ({ ...c, isOnline: false }));
            setContacts(allContacts);
        } catch (error) {
            console.error('Erro ao buscar contatos:', error);
        }
    };

    const loadDepartments = async () => {
        try {
            const response = await api.get('/departments');
            setDepartments(response.data);
        } catch (error) {
            console.error('Erro ao buscar departamentos:', error);
        }
    };

    useEffect(() => {
        loadReports(1, true, statusFilter);
        loadStats();
    }, [statusFilter, startDate, endDate]);

    useEffect(() => {
        loadSubordinates();
        loadContacts();
        loadDepartments();
    }, []);

    // Socket Connection Lifecycle
    useEffect(() => {
        if (!user?.id) return;

        const newSocket = io(SOCKET_URL, {
            query: { userId: user.id, role: user.role, userName: user.name }
        });
        setSocket(newSocket);

        newSocket.on('new_report_to_review', (data: { data: Report }) => {
            if (!statusFilter || statusFilter === 'SENT') {
                setReports(prev => [data.data, ...prev]);
            }
            loadStats();
        });

        newSocket.on('initial_presence_list', (ids: string[]) => {
            setOnlineUserIds(ids);
        });

        newSocket.on('user_online', ({ userId }: { userId: string }) => {
            setOnlineUserIds(prev => prev.includes(userId) ? prev : [...prev, userId]);
        });

        newSocket.on('user_offline', ({ userId }: { userId: string }) => {
            setOnlineUserIds(prev => prev.filter(id => id !== userId));
        });

        newSocket.on('report_status_updated_for_supervisor', (data: Report) => {
            setReports(prev => {
                if (statusFilter && statusFilter !== data.status) return prev.filter(r => r.id !== data.id);
                const exists = prev.find(r => r.id === data.id);
                if (exists) return prev.map(r => r.id === data.id ? data : r);
                if (statusFilter === data.status || !statusFilter) return [data, ...prev];
                return prev;
            });
            setSelectedReport(current => current?.id === data.id ? data : current);
            loadStats();
        });

        return () => {
            newSocket.disconnect();
            setSocket(null);
        };
    }, [user?.id, user?.name, user?.role]);

    // Chat Notifications Listener
    useEffect(() => {
        if (!socket) return;

        const chatTargetId = chatTarget?.id;

        const handleNotification = (data: { from: string, fromName?: string, text: string }) => {
            if (chatTargetId !== data.from) {
                setUnreadMessages(prev => ({ ...prev, [data.from]: true }));
                playNotificationSound();
                toast(`Mensagem de ${data.fromName || 'Subordinado'}: ${data.text}`, {
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

        socket.on('new_chat_notification', handleNotification);

        return () => {
            socket.off('new_chat_notification', handleNotification);
        };
    }, [socket, chatTarget?.id]);

    async function handleProcessAnalysis() {
        if (!analyzingReport) return;

        try {

            const response = await api.patch(`/reports/${analyzingReport.id}/status`, {
                status: targetStatus,
                feedback: formFeedback,
                departmentId: targetStatus === 'FORWARDED' ? selectedDeptId : undefined
            });

            toast.success('Reporte atualizado com sucesso!');
            const updatedReport = response.data;
            setReports(prev => {
                if (statusFilter && statusFilter !== targetStatus) return prev.filter(r => r.id !== analyzingReport.id);
                return prev.map(r => r.id === analyzingReport.id ? updatedReport : r);
            });

            setAnalyzingReport(null);
        } catch (error: any) {
            const apiError = error as { response?: { data?: { error?: string } } };
            toast.error(apiError.response?.data?.error || 'Erro ao processar análise.');
        }
    }

    async function handleUpdateStatus(reportId: string, status: string) {
        try {
            await api.patch(`/reports/${reportId}/status`, { status });
            toast.success('Status atualizado!');
            loadReports(1, true, statusFilter);
            loadStats();
        } catch (error: any) {
            const apiError = error as { response?: { data?: { error?: string } } };
            console.error('Erro ao atualizar status:', apiError);
            toast.error(apiError.response?.data?.error || 'Erro ao atualizar status.');
        }
    }

    async function handleUpdateProfile(e: React.FormEvent) {
        e.preventDefault();
        setIsUpdatingProfile(true);
        const formData = new FormData();
        formData.append('statusPhrase', profilePhrase);
        if (profileAvatar) formData.append('avatar', profileAvatar);

        try {
            const response = await api.patch('/profile', formData);
            updateUser(response.data);
            toast.success('Perfil atualizado!');
            setIsProfileOpen(false);
        } catch (err) {
            console.error('Erro ao atualizar perfil:', err);
            toast.error('Erro ao atualizar perfil.');
        } finally {
            setIsUpdatingProfile(false);
        }
    }

    function handleLoadMore() {
        const nextPage = page + 1;
        setPage(nextPage);
        loadReports(nextPage, false, statusFilter);
    }

    function resetAnalysisForm() {
        setFormFeedback('');
        setSelectedDeptId('');
        setTargetStatus('IN_REVIEW');
    }

    return (
        <div className="min-h-screen bg-slate-50/50 flex flex-col font-sans selection:bg-blue-100 selection:text-blue-900 transition-colors duration-700">
            <Header
                user={{
                    name: user?.name,
                    avatarUrl: user?.avatarUrl
                }}
                onLogout={signOut}
            />

            {/* Hero / Filter Section */}
            <div className="bg-[#020617] relative overflow-hidden pb-24 pt-12">
                <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-blue-600/25 rounded-full blur-[160px] -mr-96 -mt-96 animate-pulse duration-[10s]" />
                <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-indigo-600/20 rounded-full blur-[140px] -ml-40 -mb-40" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[radial-gradient(circle_at_50%_50%,rgba(59,130,246,0.08),transparent_80%)]" />

                <div className="max-w-7xl mx-auto px-6 relative z-10">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-10">
                        <div>
                            <h2 className="text-3xl font-black text-white tracking-tight uppercase">Painel de Controle</h2>
                            <p className="text-white/90 text-sm font-medium mt-1 uppercase tracking-widest">Controle operacional em tempo real</p>
                        </div>

                        <div className="flex flex-col gap-4">
                            <GlassCard blur="lg" className="p-1 px-1.5 flex items-center gap-1 border-white/10 !rounded-2xl">
                                {[
                                    { id: 'SENT', label: 'Recebidos' },
                                    { id: 'IN_REVIEW', label: 'Análise' },
                                    { id: 'FORWARDED', label: 'Tramite' },
                                    { id: 'RESOLVED', label: 'Feitos' },
                                ].map(filter => (
                                    <button
                                        key={filter.id}
                                        onClick={() => { setStatusFilter(filter.id); setPage(1); }}
                                        className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${statusFilter === filter.id
                                            ? filter.id === 'SENT' ? 'bg-yellow-500 text-white shadow-lg shadow-yellow-500/30'
                                                : filter.id === 'IN_REVIEW' ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30'
                                                    : filter.id === 'FORWARDED' ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/30'
                                                        : filter.id === 'RESOLVED' ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-500/30'
                                                            : 'bg-blue-600 text-white shadow-lg'
                                            : 'text-gray-400 hover:text-white hover:bg-white/10'
                                            }`}
                                    >
                                        {filter.label}
                                    </button>
                                ))}
                            </GlassCard>

                            <GlassCard variant="light" blur="lg" className="flex items-center gap-2 bg-white/80 backdrop-blur-xl p-1.5 !rounded-2xl border border-white/20">
                                <div className="flex items-center gap-2 px-3 border-r border-gray-200">
                                    <Clock className="w-3.5 h-3.5 text-blue-600" />
                                    <input
                                        type="date"
                                        value={startDate}
                                        onChange={e => setStartDate(e.target.value)}
                                        className="bg-transparent text-[9px] font-bold outline-none text-gray-900 h-6 uppercase"
                                    />
                                </div>
                                <div className="flex items-center gap-2 px-3">
                                    <Clock className="w-3.5 h-3.5 text-blue-600" />
                                    <input
                                        type="date"
                                        value={endDate}
                                        onChange={e => setEndDate(e.target.value)}
                                        className="bg-transparent text-[9px] font-bold outline-none text-gray-900 h-6 uppercase"
                                    />
                                </div>
                                {(startDate || endDate) && (
                                    <button
                                        onClick={() => { setStartDate(''); setEndDate(''); }}
                                        className="p-1 hover:bg-red-50 rounded-lg transition text-gray-400 hover:text-red-500"
                                    >
                                        <AlertCircle className="w-3.5 h-3.5" />
                                    </button>
                                )}
                            </GlassCard>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {[
                            { label: 'Recebidos', status: 'SENT', icon: AlertCircle, color: 'blue' as const },
                            { label: 'Em Análise', status: 'IN_REVIEW', icon: Clock, color: 'purple' as const },
                            { label: 'Encaminhados', status: 'FORWARDED', icon: Folder, color: 'orange' as const },
                            { label: 'Finalizados', status: 'RESOLVED', icon: CheckCircle, color: 'emerald' as const },
                        ].map(kpi => (
                            <KpiCard
                                key={kpi.status}
                                label={kpi.label}
                                value={stats.find(s => s.status === kpi.status)?._count || 0}
                                icon={kpi.icon}
                                variant={kpi.color}
                                trend={kpi.status === 'SENT' ? 'Pendentes' : undefined}
                            />
                        ))}
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-6 w-full -mt-20 mb-20 relative flex flex-col lg:flex-row gap-12">
                {/* Visual Blobs behind the glass content */}
                <div className="absolute -z-10 top-0 left-1/4 w-[500px] h-[500px] bg-blue-400/10 rounded-full blur-[120px] pointer-events-none" />
                <div className="absolute -z-10 bottom-0 right-1/4 w-[400px] h-[400px] bg-purple-400/10 rounded-full blur-[100px] pointer-events-none" />

                {/* Reports Feed */}
                <div className="flex-1 space-y-6">
                    <Card variant="glass" className="p-4 border-white/10 !rounded-[2rem]">
                        <div className="relative group">
                            <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-400 opacity-60 group-focus-within:opacity-100 transition-opacity" />
                            <input
                                type="text"
                                placeholder="Buscar por protocolo (#000000) ou palavras-chave..."
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                                className="w-full pl-14 pr-8 py-4 bg-white/5 border border-white/5 rounded-3xl outline-none focus:bg-white/10 focus:border-blue-500/30 transition-all text-sm font-bold text-white placeholder:text-gray-500 placeholder:font-medium placeholder:uppercase placeholder:tracking-widest"
                            />
                        </div>
                    </Card>

                    {reports.length === 0 ? (
                        <Card variant="glass" className="p-20 flex flex-col items-center justify-center text-gray-400">
                            <MessageSquare className="w-12 h-12 mb-4 opacity-20" />
                            <p className="font-bold uppercase tracking-widest text-[10px] text-gray-600">Nenhum reporte encontrado</p>
                        </Card>
                    ) : (
                        <div className="grid gap-6">
                            {reports.filter(r =>
                                r.comment.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                r.id.toLowerCase().includes(searchTerm.toLowerCase())
                            ).map(report => (
                                <ReportCard
                                    key={report.id}
                                    report={report}
                                    showUser
                                    actions={
                                        <div className="flex gap-2 w-full">
                                            {report.status !== 'RESOLVED' && report.status !== 'ARCHIVED' && (
                                                <Button
                                                    variant="primary"
                                                    size="sm"
                                                    fullWidth
                                                    onClick={() => { setAnalyzingReport(report); setTargetStatus('FORWARDED'); }}
                                                    disabled={!!report.departmentId}
                                                >
                                                    {report.departmentId ? 'Em Setor' : 'Trâmite'}
                                                </Button>
                                            )}
                                            {report.status === 'RESOLVED' && (
                                                <Button variant="secondary" size="sm" fullWidth onClick={() => handleUpdateStatus(report.id, 'ARCHIVED')}>Arquivar</Button>
                                            )}
                                            <Button variant="ghost" size="sm" onClick={() => setSelectedReport(report)}>
                                                <History className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    }
                                />
                            ))}
                        </div>
                    )}

                    {hasMore && reports.length > 0 && (
                        <div className="flex justify-center pt-8">
                            <Button variant="secondary" size="lg" onClick={handleLoadMore} className="bg-white px-10">
                                Carregar Mais
                            </Button>
                        </div>
                    )}
                </div>

                <aside className="w-full lg:w-80 shrink-0 flex flex-col gap-6">
                    <TeamSidebar
                        title="Equipe Operacional"
                        members={subordinates.map(s => ({
                            id: s.id,
                            name: s.name,
                            role: s.role,
                            avatarUrl: s.avatarUrl,
                            isOnline: onlineUserIds.includes(s.id),
                            statusPhrase: s.statusPhrase,
                            hasUnread: !!unreadMessages[s.id]
                        }))}
                        onMemberClick={(member) => {
                            setChatTarget(member);
                            setUnreadMessages(prev => ({ ...prev, [member.id]: false }));
                        }}
                    />

                    {contacts.length > 0 && (
                        <TeamSidebar
                            title="Rede de Apoio"
                            members={contacts.map(c => ({
                                id: c.id,
                                name: c.name,
                                role: c.role,
                                departmentName: c.departmentName,
                                avatarUrl: c.avatarUrl,
                                isOnline: onlineUserIds.includes(c.id),
                                statusPhrase: c.statusPhrase,
                                hasUnread: !!unreadMessages[c.id]
                            }))}
                            onMemberClick={(member) => {
                                setChatTarget(member);
                                setUnreadMessages(prev => ({ ...prev, [member.id]: false }));
                            }}
                        />
                    )}
                </aside>
            </main>

            {/* Analysis Modal */}
            <Modal
                isOpen={!!analyzingReport}
                onClose={() => { setAnalyzingReport(null); resetAnalysisForm(); }}
                title={analyzingReport?.status === 'FORWARDED' ? `Resposta: ${analyzingReport?.department?.name}` : 'Análise de Fluxo'}
                subtitle="Gestão de Operações e Feedback"
                maxWidth="lg"
                footer={
                    <>
                        <Button variant="secondary" onClick={() => { setAnalyzingReport(null); resetAnalysisForm(); }}>
                            Cancelar
                        </Button>
                        <Button
                            variant={targetStatus === 'RESOLVED' ? 'success' : targetStatus === 'FORWARDED' ? 'primary' : 'primary'}
                            onClick={handleProcessAnalysis}
                        >
                            {targetStatus === 'RESOLVED' ? 'Finalizar e Resolver' : targetStatus === 'FORWARDED' ? 'Encaminhar Agora' : 'Atualizar Status'}
                        </Button>
                    </>
                }
            >
                <div className="space-y-6 py-2">
                    <TextArea
                        label="Parecer Técnico / Resumo da Ação"
                        value={formFeedback}
                        onChange={e => setFormFeedback(e.target.value)}
                        placeholder="Descreva as providências ou análise técnica..."
                        rows={5}
                    />

                    <div className="space-y-4">
                        <label className="text-[10px] font-black text-gray-700 uppercase tracking-widest ml-1">Próxima Etapa</label>
                        <div className="flex items-center justify-between p-1 bg-blue-50/40 rounded-2xl border border-blue-50/60">
                            {[
                                { id: 'IN_REVIEW', label: 'ANÁLISE', color: 'text-blue-600' },
                                { id: 'FORWARDED', label: 'DEPARTAMENTO', color: 'text-purple-600' },
                                { id: 'RESOLVED', label: 'RESOLVIDO', color: 'text-emerald-600' }
                            ].map(opt => (
                                <button
                                    key={opt.id}
                                    onClick={() => setTargetStatus(opt.id as 'IN_REVIEW' | 'FORWARDED' | 'RESOLVED')}
                                    className={`flex-1 py-3 text-[9px] font-black tracking-widest rounded-xl transition-all ${targetStatus === opt.id ? 'bg-white shadow-xl ' + opt.color : 'text-gray-400 hover:text-gray-600'}`}
                                >
                                    {opt.label}
                                </button>
                            ))}
                        </div>

                        {targetStatus === 'FORWARDED' && (
                            <div className="space-y-4 animate-in slide-in-from-top-4 duration-500">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-700 uppercase tracking-widest ml-1">Destinar para:</label>
                                    <select
                                        value={selectedDeptId}
                                        onChange={e => setSelectedDeptId(e.target.value)}
                                        className="w-full px-5 py-3.5 bg-gray-50/50 border border-gray-100 rounded-2xl outline-none focus:bg-white focus:border-purple-500/50 transition-all font-bold text-gray-700 appearance-none text-xs"
                                    >
                                        <option value="">-- Escolha um destino --</option>
                                        {departments.map(d => (
                                            <option key={d.id} value={d.id}>{d.name}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </Modal>

            {/* History Modal */}
            <Modal
                isOpen={!!selectedReport}
                onClose={() => setSelectedReport(null)}
                title="Fluxo de Resolução"
                subtitle={`Protocolo: #${selectedReport?.id.slice(-6).toUpperCase()} • Histórico Completo`}
                maxWidth="lg"
            >
                <div className="space-y-8 py-4 px-2 relative before:absolute before:left-[19px] before:top-4 before:bottom-4 before:w-[2px] before:bg-gray-100">
                    {selectedReport?.history?.map((step, idx) => (
                        <div key={idx} className="relative pl-12 group">
                            <div className={`absolute left-0 top-1 w-10 h-10 rounded-2xl border-4 border-white shadow-md flex items-center justify-center z-10 transition-transform group-hover:scale-110 ${step.status === 'SENT' ? 'bg-yellow-400' :
                                step.status === 'IN_REVIEW' ? 'bg-blue-500' :
                                    step.status === 'FORWARDED' ? 'bg-purple-500' :
                                        step.status === 'RESOLVED' ? 'bg-emerald-500' : 'bg-gray-400'
                                }`} />

                            <div className="bg-white p-5 rounded-[1.5rem] shadow-sm border border-gray-100 group-hover:shadow-md transition-all">
                                <div className="flex justify-between items-start mb-3">
                                    <span className="text-[9px] font-black text-gray-400 uppercase tracking-tight">{new Date(step.createdAt).toLocaleString('pt-BR')}</span>
                                    <Badge status={step.status as
                                        'SENT' | 'IN_REVIEW' | 'FORWARDED' | 'RESOLVED' | 'ARCHIVED'}
                                    />
                                </div>
                                <p className="text-sm font-medium text-gray-600 leading-relaxed mb-4">{step.comment || 'Nenhuma observação registrada.'}</p>
                                <div className="flex justify-between items-center pt-3 border-t border-gray-50">
                                    <div className="flex items-center gap-2">
                                        <p className="text-[9px] text-gray-400 font-black uppercase">Por: <span className="text-gray-900">{step.userName}</span></p>
                                    </div>
                                    {step.departmentName && (
                                        <Badge status="FORWARDED" label={step.departmentName.toUpperCase()} />
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </Modal>

            {/* Profile Modal */}
            <Modal
                isOpen={isProfileOpen}
                onClose={() => setIsProfileOpen(false)}
                title="Configurações de Perfil"
                subtitle="Atualize suas informações"
                footer={
                    <Button
                        variant="primary"
                        fullWidth
                        isLoading={isUpdatingProfile}
                        onClick={handleUpdateProfile}
                    >
                        Salvar Alterações
                    </Button>
                }
            >
                <form className="space-y-6 py-2" onSubmit={handleUpdateProfile}>
                    <div className="flex flex-col items-center gap-4 mb-6">
                        <div className="relative group cursor-pointer" onClick={() => document.getElementById('avatar-input')?.click()}>
                            <Avatar src={user?.avatarUrl} size="xl" className="ring-8 ring-blue-50" />
                            <div className="absolute inset-0 bg-black/40 rounded-2xl md:rounded-[1.5rem] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                <TrendingUp className="text-white w-6 h-6" />
                            </div>
                            <input
                                id="avatar-input"
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={e => setProfileAvatar(e.target.files?.[0] || null)}
                            />
                        </div>
                        <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest">Clique para alterar foto</p>
                    </div>

                    <Input
                        label="Frase de Status"
                        value={profilePhrase}
                        onChange={e => setProfilePhrase(e.target.value)}
                        placeholder="Ex: Em campo / Operacional hoje"
                    />
                </form>
            </Modal>

            {chatTarget && user && (
                <ChatWidget
                    currentUser={{ id: user.id || '', name: user.name || '', role: user.role || '' }}
                    targetUser={{ id: chatTarget.id || '', name: chatTarget.name || '', role: chatTarget.role || 'PROFESSIONAL' }}
                    onClose={() => setChatTarget(null)}
                    socket={socket}
                />
            )}
        </div >
    );
}
