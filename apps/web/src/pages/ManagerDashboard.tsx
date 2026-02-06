import { useEffect, useState, useMemo, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../services/api';
import { toast } from 'react-hot-toast';
import { useDashboardSocket } from '../hooks/useDashboardSocket';
import {
    Clock,
    CheckCircle,
    AlertCircle,
    Folder,
    Search
} from 'lucide-react';
import { ChatWidget } from '../components/ChatWidget';
import {
    Button,
    Header,
} from '../components/ui';
import { TeamSidebar, DashboardHero, ReportFeed } from '../components/domain';
import { TacticalHud } from '../components/home/TacticalHud';
import { ReportHistoryModal } from '../components/domain/modals/ReportHistoryModal';
import { AnalysisModal } from '../components/domain/modals/AnalysisModal';
import { ExportReportsModal } from '../components/domain/modals/ExportReportsModal';
import { ConferenceModal } from '../components/domain/modals/ConferenceModal';
import { ConferenceInviteNotification } from '../components/ui/ConferenceInviteNotification';
import { NotificationDrawer } from '../components/ui/NotificationDrawer';
import type { Report, Stats, Department, UserContact, Notification } from '../types';

const KPI_CONFIGS = [
    { label: 'Recebidos', status: 'SENT', icon: AlertCircle, color: 'blue' as const },
    { label: 'Em Análise', status: 'IN_REVIEW', icon: Clock, color: 'purple' as const },
    { label: 'Encaminhados', status: 'FORWARDED', icon: Folder, color: 'orange' as const },
    { label: 'Finalizados', status: 'RESOLVED', icon: CheckCircle, color: 'emerald' as const },
];

const FILTER_OPTIONS = [
    { id: '', label: 'Todos' },
    { id: 'SENT', label: 'Recebidos' },
    { id: 'IN_REVIEW', label: 'Análise' },
    { id: 'FORWARDED', label: 'Tramite' },
    { id: 'RESOLVED', label: 'Feitos' }
];

export function ManagerDashboard() {
    const navigate = useNavigate();
    const { user, signOut } = useAuth();
    const [searchParams, setSearchParams] = useSearchParams();
    const activeChatId = searchParams.get('chat');

    const [reports, setReports] = useState<Report[]>([]);
    const [stats, setStats] = useState<Stats[]>([]);
    const [contacts, setContacts] = useState<UserContact[]>([]);
    const [departments, setDepartments] = useState<Department[]>([]);

    // Modals
    const [selectedReport, setSelectedReport] = useState<Report | null>(null);
    const [analyzingReport, setAnalyzingReport] = useState<Report | null>(null);
    const [targetStatus, setTargetStatus] = useState<'IN_REVIEW' | 'FORWARDED' | 'RESOLVED'>('RESOLVED');
    const [isExportModalOpen, setIsExportModalOpen] = useState(false);
    const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
    const [notifications, setNotifications] = useState<Notification[]>([]);

    // Conference State from URL
    const activeRoom = searchParams.get('conference');
    const setActiveRoom = (roomId: string | null) => {
        const newParams = new URLSearchParams(searchParams);
        if (roomId) {
            newParams.set('conference', roomId);
        } else {
            newParams.delete('conference');
        }
        setSearchParams(newParams, { replace: true });
    };
    const [pendingInvite, setPendingInvite] = useState<{ roomId: string; hostId: string; hostName: string } | null>(null);

    // Form for Forwarding/Review
    const [formFeedback, setFormFeedback] = useState('');
    const [selectedDeptId, setSelectedDeptId] = useState('');

    const [page, setPage] = useState(1);
    const [statusFilter, setStatusFilter] = useState<string>('FORWARDED');
    const [searchTerm, setSearchTerm] = useState('');
    const [hasMore, setHasMore] = useState(true);
    const LIMIT = 6;

    const loadReports = useCallback(async (pageNum: number, reset: boolean = false, status?: string) => {
        try {
            let url = `/reports/department?page=${pageNum}&limit=${LIMIT}`;
            if (status) url += `&status=${status}`;

            const response = await api.get(url);
            setHasMore(response.data.length === LIMIT);
            setReports(prev => reset ? response.data : [...prev, ...response.data]);
        } catch {
            console.error('Erro ao buscar relatórios do departamento');
        }
    }, [LIMIT]);

    const loadStats = useCallback(async () => {
        try {
            const response = await api.get('/reports/department/stats');
            setStats(response.data);
        } catch {
            console.error('Erro ao buscar estatísticas do departamento');
        }
    }, []);

    const loadContacts = useCallback(async () => {
        try {
            const response = await api.get('/support-network');
            const allContacts = response.data
                .filter((c: UserContact) => c.id !== user?.id)
                .map((c: UserContact) => ({ ...c, isOnline: false }));

            setContacts(allContacts);
        } catch {
            console.error('Erro ao buscar contatos');
        }
    }, [user?.id]);

    const loadDepartments = useCallback(async () => {
        try {
            const response = await api.get('/departments');
            setDepartments(response.data.filter((d: Department) => d.id !== user?.departmentId));
        } catch {
            console.error('Erro ao buscar departamentos');
        }
    }, [user?.departmentId]);

    const fetchNotifications = useCallback(async () => {
        try {
            const res = await api.get('/notifications');
            setNotifications(res.data);
        } catch {
            console.error('Erro ao buscar notificações');
        }
    }, []);

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        loadReports(1, true, statusFilter);
        loadStats();
    }, [statusFilter, selectedDeptId, loadReports, loadStats]);

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        loadContacts();
        loadDepartments();
        fetchNotifications();
    }, [loadContacts, loadDepartments, fetchNotifications]);

    const chatTarget = useMemo(() => {
        if (!activeChatId) return null;
        return contacts.find(c => c.id === activeChatId) || null;
    }, [activeChatId, contacts]);

    const handleCloseChat = () => {
        setSearchParams({}, { replace: true });
    };

    const socketUser = useMemo(() => user ? {
        id: user.id || '',
        name: user.name || '',
        role: user.role || ''
    } : null, [user]);

    const {
        socket,
        onlineUserIds,
        unreadMessages,
        markAsRead,
        playNotificationSound
    } = useDashboardSocket({
        user: socketUser,
        onNotification: (data) => {
            if (activeChatId !== data.from) {
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
                playNotificationSound();
            } else {
                markAsRead(data.from);
            }
        },
        onConferenceInvite: (data) => {
            if (activeRoom) return;
            const host = contacts.find(c => c.id === data.hostId);
            setPendingInvite({
                roomId: data.roomId,
                hostId: data.hostId,
                hostName: host?.name || (data.hostRole === 'SUPERVISOR' ? 'Supervisor' : 'Alguém')
            });
            playNotificationSound();
        },
        onNewNotification: (notif) => {
            setNotifications(prev => [notif, ...prev]);
        }
    });

    useEffect(() => {
        if (activeChatId) {
            markAsRead(activeChatId);
        }
    }, [activeChatId, markAsRead]);



    const handleMarkAsRead = async (id: string) => {
        try {
            await api.patch(`/notifications/${id}/read`);
            setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
        } catch {
            toast.error('Erro ao marcar como lida');
        }
    };

    const handleMarkAllAsRead = async () => {
        try {
            await api.post('/notifications/read-all');
            setNotifications(prev => prev.map(n => ({ ...n, read: true })));
            toast.success('Todas as notificações marcadas como lidas');
        } catch {
            toast.error('Erro ao marcar todas como lidas');
        }
    };

    const handleProcessAnalysis = async () => {
        if (!analyzingReport) return;
        try {
            await api.patch(`/reports/${analyzingReport.id}/status`, {
                status: targetStatus,
                feedback: formFeedback,
                departmentId: targetStatus === 'FORWARDED' ? selectedDeptId : undefined
            });

            toast.success('Relatório processado com sucesso!');
            setAnalyzingReport(null);
            resetAnalysisForm();
            loadReports(1, true, statusFilter);
            loadStats();
        } catch {
            toast.error('Erro ao processar relatório.');
        }
    };

    const resetAnalysisForm = () => {
        setFormFeedback('');
        setSelectedDeptId('');
        setTargetStatus('RESOLVED');
    };

    return (
        <div className="min-h-screen bg-[#020617] text-slate-200 font-sans selection:bg-blue-500/30 overflow-x-hidden relative">
            {/* Mission Control Elements */}
            <TacticalHud />

            {/* Background Effects */}
            <div className="fixed inset-0 pointer-events-none z-0">
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000,transparent)] opacity-[0.1]" />
            </div>

            <div className="relative z-10">
                <Header
                    user={{ name: user?.name, avatarUrl: user?.avatarUrl }}
                    onLogout={signOut}
                    unreadCount={notifications.filter(n => !n.read).length}
                    onNotificationsClick={() => setIsNotificationsOpen(true)}
                />
                <p className="text-[10px] text-slate-300 font-black uppercase tracking-widest">Controle de acesso à rede operacional</p>
                <main className="max-w-7xl mx-auto px-6 py-8 flex flex-col lg:flex-row gap-8">
                    <div className="flex-1 space-y-8">
                        <DashboardHero
                            title="Módulo Gerencial"
                            subtitle="Gestão de demandas e resoluções operacionais."
                            stats={stats}
                            kpiConfigs={KPI_CONFIGS}
                            statusFilter={statusFilter}
                            onStatusFilterChange={(s) => { setStatusFilter(s); setPage(1); }}
                            filters={FILTER_OPTIONS}
                            onAnalyticsClick={() => navigate('/analytics')}
                            onExportClick={() => setIsExportModalOpen(true)}
                        />

                        <div className="relative group">
                            <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-400 opacity-60 group-focus-within:opacity-100 transition-opacity" />
                            <input
                                type="text"
                                placeholder="Filtrar por protocolo ou descrição..."
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                                className="w-full pl-14 pr-8 py-4 bg-slate-900/50 border border-white/5 rounded-3xl outline-none focus:bg-slate-900/80 focus:border-blue-500/30 transition-all text-sm font-bold text-white placeholder:text-slate-400"
                            />
                        </div>

                        <ReportFeed
                            reports={reports.filter(r =>
                                r.comment.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                r.id.toLowerCase().includes(searchTerm.toLowerCase())
                            )}
                            searchTerm={searchTerm}
                            onSearchChange={setSearchTerm}
                            hasMore={hasMore}
                            onLoadMore={() => {
                                const next = page + 1;
                                setPage(next);
                                loadReports(next, false, statusFilter);
                            }}
                            renderReportActions={(report) => (
                                <Button
                                    variant="primary"
                                    size="sm"
                                    onClick={() => { setAnalyzingReport(report); }}
                                >
                                    Analisar
                                </Button>
                            )}
                        />
                    </div>

                    <aside className="w-full lg:w-80 shrink-0">
                        <TeamSidebar
                            title="Rede de Apoio"
                            groups={[
                                {
                                    id: 'contacts',
                                    title: 'Contatos Úteis',
                                    members: contacts.map(c => ({
                                        id: c.id,
                                        name: c.name,
                                        role: c.role,
                                        isOnline: onlineUserIds.includes(c.id),
                                        avatarUrl: c.avatarUrl,
                                        statusPhrase: c.statusPhrase,
                                        hasUnread: !!unreadMessages[c.id]
                                    }))
                                }
                            ]}
                            onMemberClick={(member) => {
                                setSearchParams({ chat: member.id }, { replace: true });
                                markAsRead(member.id);
                            }}
                        />
                    </aside>
                </main>

                <AnalysisModal
                    isOpen={!!analyzingReport}
                    onClose={() => { setAnalyzingReport(null); resetAnalysisForm(); }}
                    onConfirm={handleProcessAnalysis}
                    targetStatus={targetStatus}
                    setTargetStatus={setTargetStatus}
                    feedback={formFeedback}
                    setFeedback={setFormFeedback}
                    selectedDeptId={selectedDeptId}
                    setSelectedDeptId={setSelectedDeptId}
                    departments={departments}
                    title="Resolução Departamental"
                />

                <ReportHistoryModal
                    isOpen={!!selectedReport}
                    onClose={() => setSelectedReport(null)}
                    report={selectedReport}
                />

                {chatTarget && user && (
                    <ChatWidget
                        currentUser={{ id: user.id || '', name: user.name || '', role: user.role || '' }}
                        targetUser={chatTarget}
                        onClose={handleCloseChat}
                        socket={socket}
                    />
                )}

                <ExportReportsModal
                    isOpen={isExportModalOpen}
                    onClose={() => setIsExportModalOpen(false)}
                    reports={reports}
                    departments={departments}
                />

                <ConferenceModal
                    isOpen={!!activeRoom}
                    onClose={() => setActiveRoom(null)}
                    roomName={activeRoom || ''}
                    userName={user?.name}
                />

                <ConferenceInviteNotification
                    isOpen={!!pendingInvite}
                    hostName={pendingInvite?.hostName || ''}
                    onAccept={() => {
                        setActiveRoom(pendingInvite?.roomId || null);
                        setPendingInvite(null);
                    }}
                    onDecline={() => setPendingInvite(null)}
                />

                <NotificationDrawer
                    isOpen={isNotificationsOpen}
                    onClose={() => setIsNotificationsOpen(false)}
                    notifications={notifications}
                    onMarkAsRead={handleMarkAsRead}
                    onMarkAllAsRead={handleMarkAllAsRead}
                />
            </div>
        </div>
    );
}
