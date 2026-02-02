import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../services/api';
import { io } from 'socket.io-client';
import { toast } from 'react-hot-toast';
import {
    Clock,
    CheckCircle,
    History,
    Folder,
    MessageSquare,
} from 'lucide-react';
import { ChatWidget } from '../components/ChatWidget';
import {
    Badge,
    Button,
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

interface UserContact {
    id: string;
    name: string;
    role: string;
    avatarUrl?: string | null;
    statusPhrase?: string;
    isOnline?: boolean;
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

export function ManagerDashboard() {
    const { user, signOut } = useAuth();
    const [reports, setReports] = useState<Report[]>([]);
    const [stats, setStats] = useState<Stats[]>([]);
    const [contacts, setContacts] = useState<UserContact[]>([]);
    const [departments, setDepartments] = useState<Department[]>([]);

    // Modals
    const [selectedReport, setSelectedReport] = useState<Report | null>(null);
    const [analyzingReport, setAnalyzingReport] = useState<Report | null>(null);
    const [targetStatus, setTargetStatus] = useState<'IN_REVIEW' | 'FORWARDED' | 'RESOLVED'>('RESOLVED');

    // Chat
    const [chatTarget, setChatTarget] = useState<UserContact | null>(null);
    const [socket, setSocket] = useState<any>(null);
    const [unreadMessages, setUnreadMessages] = useState<Record<string, boolean>>({});

    const playNotificationSound = () => {
        const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
        audio.play().catch(e => console.error('Erro ao tocar som:', e));
    };

    // Form for Forwarding/Review
    const [formFeedback, setFormFeedback] = useState('');
    const [selectedDeptId, setSelectedDeptId] = useState('');

    const [page, setPage] = useState(1);
    const [statusFilter, setStatusFilter] = useState<string>('FORWARDED');
    const [hasMore, setHasMore] = useState(true);
    const LIMIT = 6;

    const loadReports = async (pageNum: number, reset: boolean = false, status?: string) => {
        try {
            let url = `/reports/department?page=${pageNum}&limit=${LIMIT}`;
            if (status) url += `&status=${status}`;

            const response = await api.get(url);
            setHasMore(response.data.length === LIMIT);
            setReports(prev => reset ? response.data : [...prev, ...response.data]);
        } catch (error) {
            console.error('Erro ao buscar relatórios do departamento:', error);
        }
    };

    const loadStats = async () => {
        try {
            const response = await api.get('/reports/department/stats');
            setStats(response.data);
        } catch (error) {
            console.error('Erro ao buscar estatísticas do departamento:', error);
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
            setDepartments(response.data.filter((d: Department) => d.id !== user?.departmentId));
        } catch (error) {
            console.error('Erro ao buscar departamentos:', error);
        }
    };

    useEffect(() => {
        loadReports(1, true, statusFilter);
        loadStats();
    }, [statusFilter, selectedDeptId]);

    useEffect(() => {
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

        newSocket.on('report_status_updated_for_supervisor', (data: Report) => {
            setReports(prev => {
                const exists = prev.find(r => r.id === data.id);
                if (String((data as any).departmentId) !== String(user?.departmentId)) {
                    return prev.filter(r => r.id !== data.id);
                }
                if (exists) return prev.map(r => r.id === data.id ? data : r);
                if (statusFilter === data.status || !statusFilter) return [data, ...prev];
                return prev;
            });
            loadStats();
        });

        newSocket.on('report_forwarded_to_department', (data: Report) => {
            setReports(prev => {
                const exists = prev.find(r => r.id === data.id);
                if (exists) return prev;
                return [data, ...prev];
            });
            loadStats();
            toast.success(`Novo reporte encaminhado para seu departamento!`);
        });

        newSocket.on('initial_presence_list', (ids: string[]) => {
            setContacts(prev => prev.map(s => ({ ...s, isOnline: ids.includes(s.id) })));
        });

        newSocket.on('user_online', ({ userId }: { userId: string }) => {
            setContacts(prev => prev.map(s => s.id === userId ? { ...s, isOnline: true } : s));
        });

        newSocket.on('user_offline', ({ userId }: { userId: string }) => {
            setContacts(prev => prev.map(s => s.id === userId ? { ...s, isOnline: false } : s));
        });

        return () => {
            newSocket.disconnect();
            setSocket(null);
        };
    }, [user?.id, user?.name, user?.role, user?.departmentId]);

    // Chat Notifications Listener
    useEffect(() => {
        if (!socket) return;

        const chatTargetId = chatTarget?.id;

        const handleNotification = (data: { from: string, fromName?: string, text: string }) => {
            if (chatTargetId !== data.from) {
                setUnreadMessages(prev => ({ ...prev, [data.from]: true }));
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

            setReports(prev => {
                // Se o novo status não bate com o filtro atual, remove da lista
                if (statusFilter && statusFilter !== targetStatus) {
                    return prev.filter(r => r.id !== analyzingReport.id);
                }
                // Caso contrário, atualiza o item na lista
                return prev.map(r => r.id === analyzingReport.id ? response.data : r);
            });

            setAnalyzingReport(null);
            resetAnalysisForm();
            loadStats();
        } catch (error: any) {
            const apiError = error as { response?: { data?: { error?: string } } };
            toast.error(apiError.response?.data?.error || 'Erro ao processar análise.');
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
        setTargetStatus('RESOLVED');
    }

    return (
        <div className="min-h-screen bg-slate-50/50 flex flex-col font-sans mb-10">
            <Header
                user={{
                    name: user?.name,
                    avatarUrl: user?.avatarUrl
                }}
                onLogout={signOut}
            />

            {/* Hero / Filter Section */}
            <div className="bg-[#0f172a] relative overflow-hidden pb-24 pt-12">
                <div className="max-w-7xl mx-auto px-6 relative z-10">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-10">
                        <div>
                            <h2 className="text-3xl font-black text-white tracking-tight uppercase">Dashboard Gerencial</h2>
                            <p className="text-white/60 text-sm font-medium mt-1 uppercase tracking-widest">Resolução de Demandas por Departamento</p>
                        </div>

                        <div className="flex flex-col gap-4">
                            <GlassCard blur="lg" className="p-1 px-1.5 flex items-center gap-1 border-white/10 !rounded-2xl">
                                {[
                                    { id: 'FORWARDED', label: 'Pendentes' },
                                    { id: 'IN_REVIEW', label: 'Em Análise' },
                                    { id: 'RESOLVED', label: 'Finalizados' },
                                ].map(filter => (
                                    <button
                                        key={filter.id}
                                        onClick={() => { setStatusFilter(filter.id); setPage(1); }}
                                        className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${statusFilter === filter.id
                                            ? filter.id === 'FORWARDED' ? 'bg-purple-600 text-white shadow-lg'
                                                : filter.id === 'IN_REVIEW' ? 'bg-blue-600 text-white shadow-lg'
                                                    : 'bg-emerald-600 text-white shadow-lg'
                                            : 'text-white/60 hover:text-white hover:bg-white/10'
                                            }`}
                                    >
                                        {filter.label}
                                    </button>
                                ))}
                            </GlassCard>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {[
                            { label: 'Demandas do Setor', status: 'FORWARDED', icon: Folder, color: 'purple' as const },
                            { label: 'Em Análise', status: 'IN_REVIEW', icon: Clock, color: 'blue' as const },
                            { label: 'Resolvidos', status: 'RESOLVED', icon: CheckCircle, color: 'emerald' as const },
                        ].map(kpi => (
                            <KpiCard
                                key={kpi.status}
                                label={kpi.label}
                                value={stats.find(s => s.status === kpi.status)?._count || 0}
                                icon={kpi.icon}
                                variant={kpi.color}
                            />
                        ))}
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-6 w-full -mt-16 mb-20 relative z-20 flex flex-col lg:flex-row gap-12">
                {/* Reports Feed */}
                <div className="flex-1 space-y-6">
                    {reports.length === 0 ? (
                        <Card variant="glass" className="p-20 flex flex-col items-center justify-center text-gray-400">
                            <MessageSquare className="w-12 h-12 mb-4 opacity-20" />
                            <p className="font-bold uppercase tracking-widest text-[10px]">Tudo em ordem no momento</p>
                        </Card>
                    ) : (
                        <div className="grid gap-6">
                            {reports.map(report => (
                                <ReportCard
                                    key={report.id}
                                    report={report}
                                    showUser
                                    actions={
                                        <div className="flex gap-2 w-full">
                                            {report.status !== 'RESOLVED' && report.status !== 'ARCHIVED' && (
                                                <Button variant="primary" size="sm" fullWidth onClick={() => { setAnalyzingReport(report); setTargetStatus(report.status as any); }}>Análise</Button>
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

                {/* Sidebar com contatos hierárquicos */}
                <aside className="w-80 shrink-0">
                    <TeamSidebar
                        title="REDE DE APOIO"
                        members={contacts.map(c => ({
                            id: c.id,
                            name: c.name,
                            role: c.role === 'SUPERVISOR' ? 'Supervisor Operacional' : 'Gerente de Setor',
                            departmentName: (c as any).departmentName,
                            avatarUrl: c.avatarUrl,
                            isOnline: !!c.isOnline,
                            statusPhrase: c.statusPhrase,
                            hasUnread: !!unreadMessages[c.id]
                        }))}
                        onMemberClick={(member) => {
                            setChatTarget(member as any);
                            setUnreadMessages(prev => ({ ...prev, [member.id]: false }));
                        }}
                    />
                </aside>
            </main>

            {/* Analysis Modal para o Gerente */}
            <Modal
                isOpen={!!analyzingReport}
                onClose={() => { setAnalyzingReport(null); resetAnalysisForm(); }}
                title="Resolução Departamental"
                subtitle="Triagem e Encerramento de Demanda"
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
                            {targetStatus === 'RESOLVED' ? 'Confirmar Resolução' :
                                targetStatus === 'FORWARDED' ? 'Redirecionar Setor' :
                                    'Confirmar Análise'}
                        </Button>
                    </>
                }
            >
                <div className="space-y-6 py-2">
                    <TextArea
                        label="Nota de Resolução / Feedback"
                        value={formFeedback}
                        onChange={e => setFormFeedback(e.target.value)}
                        placeholder="Informe as medidas tomadas pelo departamento..."
                        rows={5}
                    />

                    <div className="space-y-4">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Ação Final</label>
                        <div className="flex items-center justify-between p-1 bg-gray-100 rounded-2xl border border-gray-100">
                            {[
                                { id: 'RESOLVED', label: 'RESOLVER AGORA', color: 'text-emerald-600' },
                                { id: 'FORWARDED', label: 'REENCAMINHAR SETOR', color: 'text-purple-600' },
                                { id: 'IN_REVIEW', label: 'MANTER EM ANÁLISE', color: 'text-blue-600' }
                            ].map(opt => (
                                <button
                                    key={opt.id}
                                    onClick={() => setTargetStatus(opt.id as any)}
                                    className={`flex-1 py-3 text-[9px] font-black tracking-widest rounded-xl transition-all ${targetStatus === opt.id ? 'bg-white shadow-xl ' + opt.color : 'text-gray-400 hover:text-gray-600'}`}
                                >
                                    {opt.label}
                                </button>
                            ))}
                        </div>

                        {targetStatus === 'FORWARDED' && (
                            <div className="space-y-2 animate-in slide-in-from-top-4 duration-500">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Mover para:</label>
                                <select
                                    value={selectedDeptId}
                                    onChange={e => setSelectedDeptId(e.target.value)}
                                    className="w-full px-5 py-3.5 bg-gray-50/50 border border-gray-100 rounded-2xl outline-none focus:bg-white focus:border-purple-500/50 transition-all font-bold text-gray-700 appearance-none text-xs"
                                >
                                    <option value="">-- Escolha outro departamento --</option>
                                    {departments.map(d => (
                                        <option key={d.id} value={d.id}>{d.name}</option>
                                    ))}
                                </select>
                            </div>
                        )}
                    </div>
                </div>
            </Modal>

            {/* History Modal idêntico ao do Supervisor para auditoria */}
            <Modal
                isOpen={!!selectedReport}
                onClose={() => setSelectedReport(null)}
                title="Trilha Operacional"
                subtitle="Histórico de Movimentações"
                maxWidth="lg"
            >
                <div className="space-y-8 py-4 px-2 relative before:absolute before:left-[19px] before:top-4 before:bottom-4 before:w-[2px] before:bg-gray-100">
                    {selectedReport?.history?.map((step, idx) => (
                        <div key={idx} className="relative pl-12 group">
                            <div className={`absolute left-0 top-1 w-10 h-10 rounded-2xl border-4 border-white shadow-md flex items-center justify-center z-10 ${step.status === 'SENT' ? 'bg-yellow-400' :
                                step.status === 'IN_REVIEW' ? 'bg-blue-500' :
                                    step.status === 'FORWARDED' ? 'bg-purple-500' :
                                        step.status === 'RESOLVED' ? 'bg-emerald-500' : 'bg-gray-400'
                                }`} />
                            <div className="bg-white p-5 rounded-[1.5rem] border border-gray-50">
                                <div className="flex justify-between items-start mb-3">
                                    <span className="text-[9px] font-black text-gray-400 uppercase tracking-tight">{new Date(step.createdAt).toLocaleString('pt-BR')}</span>
                                    <Badge status={step.status as any} />
                                </div>
                                <p className="text-sm font-medium text-gray-600 leading-relaxed mb-4">{step.comment || 'Nenhuma observação.'}</p>
                                <div className="flex justify-between items-center pt-3 border-t border-gray-50">
                                    <p className="text-[9px] text-gray-400 font-black uppercase">Por: <span className="text-gray-900">{step.userName}</span></p>
                                    {step.departmentName && <Badge status="FORWARDED" label={step.departmentName.toUpperCase()} />}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </Modal>

            {chatTarget && user && (
                <ChatWidget
                    currentUser={{ id: user.id || '', name: user.name || '', role: user.role || '' }}
                    targetUser={chatTarget}
                    onClose={() => setChatTarget(null)}
                    socket={socket}
                />
            )}
        </div>
    );
}
