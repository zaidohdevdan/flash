import { useEffect, useState, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../services/api';
import { toast } from 'react-hot-toast';
import { useDashboardSocket } from '../hooks/useDashboardSocket';
import { useReports } from '../hooks/useReports';
import {
    Clock,
    CheckCircle,
    AlertCircle,
    Folder,
    History,
    Users,
    Shield
} from 'lucide-react';
import { ChatWidget } from '../components/ChatWidget';
import {
    Button,
    Header
} from '../components/ui';
import { TeamSidebar, DashboardHero, ReportFeed } from '../components/domain';
import { MapView } from '../components/domain/MapView';
import { TacticalHud } from '../components/home/TacticalHud';
import { ReportHistoryModal } from '../components/domain/modals/ReportHistoryModal';
import { AnalysisModal } from '../components/domain/modals/AnalysisModal';
import { ProfileSettingsModal } from '../components/domain/modals/ProfileSettingsModal';
import { ExportReportsModal } from '../components/domain/modals/ExportReportsModal';
import { ConferenceModal } from '../components/domain/modals/ConferenceModal';
import { AgendaModal } from '../components/domain/modals/AgendaModal';
import { NotificationDrawer } from '../components/ui/NotificationDrawer';
import { ConferenceInviteNotification } from '../components/ui/ConferenceInviteNotification';

import type { Report, Stats, Department, UserContact, Notification } from '../types';

interface Subordinate {
    id: string;
    name: string;
    role: string;
    avatarUrl?: string | null;
    statusPhrase?: string;
    isOnline?: boolean;
}

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
    { id: 'RESOLVED', label: 'Feitos' },
    { id: 'ARCHIVED', label: 'Arquivados' }
];

export function Dashboard() {
    const navigate = useNavigate();
    const { user, signOut, updateUser } = useAuth();
    const [searchParams, setSearchParams] = useSearchParams();
    const activeChatId = searchParams.get('chat');

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

    // Core Data State
    const [reports, setReports] = useState<Report[]>([]);
    const [stats, setStats] = useState<Stats[]>([]);
    const [subordinates, setSubordinates] = useState<Subordinate[]>([]);
    const [contacts, setContacts] = useState<UserContact[]>([]);
    const [departments, setDepartments] = useState<Department[]>([]);

    // Filter & Pagination State
    const [page, setPage] = useState(1);
    const [statusFilter, setStatusFilter] = useState<string>('SENT');
    const [startDate, setStartDate] = useState<string>('');
    const [endDate, setEndDate] = useState<string>('');
    const [hasMore, setHasMore] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const LIMIT = 6;

    // Modals & UI State
    const [selectedReport, setSelectedReport] = useState<Report | null>(null);
    const [analyzingReport, setAnalyzingReport] = useState<Report | null>(null);
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [isExportModalOpen, setIsExportModalOpen] = useState(false);
    const [targetStatus, setTargetStatus] = useState<'IN_REVIEW' | 'FORWARDED' | 'RESOLVED'>('IN_REVIEW');
    const [formFeedback, setFormFeedback] = useState('');
    const [selectedDeptId, setSelectedDeptId] = useState('');
    const [viewMode, setViewMode] = useState<'list' | 'map'>('list');
    const [isAgendaOpen, setIsAgendaOpen] = useState(false);
    const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
    const [notifications, setNotifications] = useState<Notification[]>([]);

    // Restoration of missing states
    const [pendingInvite, setPendingInvite] = useState<{ roomId: string; hostId: string; hostName: string } | null>(null);
    const [profilePhrase, setProfilePhrase] = useState(user?.statusPhrase || '');
    const [profileAvatar, setProfileAvatar] = useState<File | null>(null);
    const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);

    const socketUser = useMemo(() => user ? {
        id: user.id || '',
        name: user.name || '',
        role: user.role || ''
    } : null, [user?.id, user?.name, user?.role]);

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
                toast(`Mensagem de ${data.fromName || 'Subordinado'}: ${data.text} `, {
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
            if (activeRoom) return; // Se já estiver em uma sala, ignora
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
        },
        onNewReport: () => {
            // Novo report criado - atualizar lista
            refetchReports();
            loadStats();
        },
        onReportStatusUpdate: () => {
            // Status de report atualizado - atualizar lista
            refetchReports();
            loadStats();
        }
    });

    // Data Fetching with React Query
    const {
        data: reportsData = [],
        isLoading: isReportsLoading,
        isPlaceholderData,
        refetch: refetchReports
    } = useReports({
        page,
        limit: LIMIT,
        status: statusFilter,
        startDate,
        endDate
    });

    // Restore auxiliary data loaders
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
            setSubordinates(response.data.filter((s: Subordinate) => s.id !== user?.id));
        } catch (error) {
            console.error('Erro ao buscar subordinados:', error);
        }
    };

    const loadContacts = async () => {
        try {
            const response = await api.get('/support-network');
            setContacts(response.data.filter((c: UserContact) => c.id !== user?.id));
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

    // Update reports state
    useEffect(() => {
        if (reportsData) {
            setReports(reportsData);
            setHasMore(reportsData.length === LIMIT);
        }
    }, [reportsData]);

    // Side Effects for aux data
    useEffect(() => {
        loadStats();
    }, [statusFilter, startDate, endDate]);

    useEffect(() => {
        loadSubordinates();
        loadContacts();
        loadDepartments();
        fetchNotifications();
    }, []);

    useEffect(() => {
        if (activeChatId) {
            markAsRead(activeChatId);
        }
    }, [activeChatId, markAsRead]);

    const handleLoadMore = () => {
        if (!isPlaceholderData && hasMore) {
            setPage(prev => prev + 1);
        }
    };

    const fetchNotifications = async () => {
        try {
            const res = await api.get('/notifications');
            setNotifications(res.data);
        } catch (error) {
            console.error('Erro ao buscar notificações');
        }
    };

    const handleMarkAsRead = async (id: string) => {
        try {
            await api.patch(`/notifications/${id}/read`);
            setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
        } catch (error) {
            toast.error('Erro ao marcar como lida');
        }
    };

    const handleMarkAllAsRead = async () => {
        try {
            await api.post('/notifications/read-all');
            setNotifications(prev => prev.map(n => ({ ...n, read: true })));
            toast.success('Todas as notificações marcadas como lidas');
        } catch (error) {
            toast.error('Erro ao marcar todas como lidas');
        }
    };


    const handleUpdateProfile = async () => {
        if (!user) return;
        setIsUpdatingProfile(true);
        try {
            const formData = new FormData();
            formData.append('statusPhrase', profilePhrase);
            if (profileAvatar) {
                formData.append('avatar', profileAvatar);
            }

            const response = await api.put('/profile', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            updateUser(response.data);
            toast.success('Perfil atualizado!');
            setIsProfileOpen(false);
            setProfileAvatar(null);
        } catch (error) {
            toast.error('Erro ao atualizar perfil.');
        } finally {
            setIsUpdatingProfile(false);
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
            refetchReports();
            loadStats();
        } catch (error) {
            toast.error('Erro ao processar relatório.');
        }
    };

    const resetAnalysisForm = () => {
        setFormFeedback('');
        setSelectedDeptId('');
        setTargetStatus('IN_REVIEW');
    };

    const handleStartConference = async () => {
        try {
            const onlineParticipants = subordinates
                .filter(s => onlineUserIds.includes(s.id))
                .map(s => s.id);

            const onlineContacts = contacts
                .filter(c => onlineUserIds.includes(c.id))
                .map(c => c.id);

            const allParticipants = Array.from(new Set([...onlineParticipants, ...onlineContacts]));

            if (allParticipants.length === 0) {
                toast.error('Nenhum participante online para convidar.');
                return;
            }

            const response = await api.post('/conference/create', {
                participants: allParticipants
            });

            toast.success('War Room iniciada! Convites enviados.');
            setActiveRoom(response.data.roomId);
        } catch (error) {
            toast.error('Erro ao iniciar War Room.');
        }
    };

    const teamGroups = useMemo(() => [
        {
            id: 'operacional',
            title: 'Operacional',
            icon: <Users className="w-3 h-3" />,
            members: subordinates.map(s => ({
                id: s.id,
                name: s.name,
                role: s.role,
                avatarUrl: s.avatarUrl,
                isOnline: onlineUserIds.includes(s.id),
                statusPhrase: s.statusPhrase,
                hasUnread: !!unreadMessages[s.id]
            }))
        },
        {
            id: 'contacts',
            title: 'Rede de Apoio',
            icon: <Shield className="w-3 h-3" />,
            members: contacts.map(c => ({
                id: c.id,
                name: c.name,
                role: c.role,
                avatarUrl: c.avatarUrl,
                isOnline: onlineUserIds.includes(c.id),
                statusPhrase: c.statusPhrase,
                hasUnread: !!unreadMessages[c.id]
            }))
        }
    ], [subordinates, onlineUserIds, unreadMessages, contacts]);

    const chatTarget = useMemo(() => {
        if (!activeChatId) return null;
        const all = [...subordinates, ...contacts];
        return all.find(m => m.id === activeChatId) || null;
    }, [activeChatId, subordinates, contacts]);

    const handleCloseChat = () => {
        setSearchParams({}, { replace: true });
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

                <DashboardHero
                    title="Dashboard Operacional"
                    subtitle="Monitoramento em tempo real e resposta rápida."
                    stats={stats}
                    kpiConfigs={KPI_CONFIGS}
                    statusFilter={statusFilter}
                    onStatusFilterChange={(s) => { setStatusFilter(s); setPage(1); }}
                    filters={FILTER_OPTIONS}
                    showDateFilters={true}
                    startDate={startDate}
                    endDate={endDate}
                    onStartDateChange={setStartDate}
                    onEndDateChange={setEndDate}
                    onClearDates={() => { setStartDate(''); setEndDate(''); }}
                    onAnalyticsClick={() => navigate('/analytics')}
                    onExportClick={() => setIsExportModalOpen(true)}
                    onConferenceClick={user?.role === 'SUPERVISOR' ? handleStartConference : undefined}
                    onAgendaClick={() => setIsAgendaOpen(true)}
                >
                    <div className="flex bg-white/10 backdrop-blur-md p-1 rounded-xl border border-white/10">
                        <button
                            onClick={() => setViewMode('list')}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${viewMode === 'list' ? 'bg-blue-600 text-white shadow-lg' : 'text-blue-200 hover:bg-white/10'}`}
                        >
                            Lista
                        </button>
                        <button
                            onClick={() => setViewMode('map')}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${viewMode === 'map' ? 'bg-blue-600 text-white shadow-lg' : 'text-blue-200 hover:bg-white/10'}`}
                        >
                            Mapa
                        </button>
                    </div>

                    <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-blue-600/25 rounded-full blur-[160px] -mr-96 -mt-96 animate-pulse duration-[10s] pointer-events-none" />
                    <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-indigo-600/20 rounded-full blur-[140px] -ml-40 -mb-40 pointer-events-none" />
                </DashboardHero>

                <main className="max-w-7xl mx-auto px-6 w-full -mt-20 mb-20 relative flex flex-col lg:flex-row gap-12">
                    <div className="flex-1 space-y-12">
                        <div className="relative group">
                            <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-400 opacity-60 group-focus-within:opacity-100 transition-opacity" />
                            <input
                                type="text"
                                placeholder="Filtrar por protocolo ou descrição..."
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                                className="w-full pl-14 pr-8 py-4 bg-slate-900/50 border border-white/5 rounded-3xl outline-none focus:bg-slate-900/80 focus:border-blue-500/30 transition-all text-sm font-black text-white placeholder:text-slate-400"
                            />
                        </div>

                        {viewMode === 'list' ? (
                            <ReportFeed
                                reports={reports.filter(r =>
                                    r.comment.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                    r.id.toLowerCase().includes(searchTerm.toLowerCase())
                                ) as any}
                                searchTerm={searchTerm}
                                onSearchChange={setSearchTerm}
                                hasMore={hasMore}
                                onLoadMore={handleLoadMore}
                                isLoading={isReportsLoading}
                                renderReportActions={(report) => (
                                    <div className="flex gap-2 w-full">
                                        {report.status !== 'RESOLVED' && report.status !== 'ARCHIVED' && (
                                            <Button
                                                variant="primary"
                                                size="sm"
                                                fullWidth
                                                onClick={() => { setAnalyzingReport(report as any); setTargetStatus('FORWARDED'); }}
                                            >
                                                Trâmite
                                            </Button>
                                        )}
                                        <Button variant="ghost" size="sm" onClick={() => setSelectedReport(report as any)}>
                                            <History className="w-4 h-4" />
                                        </Button>
                                    </div>
                                )}
                            />
                        ) : (
                            <div className="w-full h-[600px]">
                                <MapView reports={reports} onMarkerClick={setSelectedReport} />
                            </div>
                        )}
                    </div>

                    <aside className="w-full lg:w-80 shrink-0">

                        <TeamSidebar
                            onMemberClick={(member) => {
                                setSearchParams({ chat: member.id }, { replace: true });
                                markAsRead(member.id);
                            }}
                            groups={teamGroups}
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
                    title="Análise de Fluxo"
                />

                <ReportHistoryModal
                    isOpen={!!selectedReport}
                    onClose={() => setSelectedReport(null)}
                    report={selectedReport}
                />

                <ProfileSettingsModal
                    isOpen={isProfileOpen}
                    onClose={() => setIsProfileOpen(false)}
                    onSave={handleUpdateProfile}
                    isLoading={isUpdatingProfile}
                    profilePhrase={profilePhrase}
                    setProfilePhrase={setProfilePhrase}
                    onAvatarChange={setProfileAvatar}
                    avatarUrl={user?.avatarUrl}
                />

                {chatTarget && user && (
                    <ChatWidget
                        currentUser={{ id: user.id || '', name: user.name || '', role: user.role || '' }}
                        targetUser={chatTarget as any}
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
                {/* New Modals */}
                <AgendaModal
                    isOpen={isAgendaOpen}
                    onClose={() => setIsAgendaOpen(false)}
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

// Helper icon
function Search({ className }: { className?: string }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
            <circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" />
        </svg>
    );
}
