import { useEffect, useState, useMemo, useCallback, useRef } from 'react';
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
    Button
} from '../components/ui';
import { DashboardLayout } from '../layouts/DashboardLayout';
import { TeamSidebar, DashboardHero, ReportFeed } from '../components/domain';
import { MapView } from '../components/domain/MapView';
import { AnalysisModal } from '../components/domain/modals/AnalysisModal';
import { ProfileSettingsModal } from '../components/domain/modals/ProfileSettingsModal';
import { ExportReportsModal } from '../components/domain/modals/ExportReportsModal';
import { ConferenceModal } from '../components/domain/modals/ConferenceModal';
import { AgendaModal } from '../components/domain/modals/AgendaModal';
import { ConferenceInviteNotification } from '../components/ui/ConferenceInviteNotification';
import { db } from '../services/db';
import { useLiveQuery } from 'dexie-react-hooks';
import type { Report, Stats, Department, UserContact } from '../types';

interface Subordinate {
    id: string;
    name: string;
    role: string;
    avatarUrl?: string | null;
    statusPhrase?: string;
    hasUnread?: boolean;
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
    { id: 'RESOLVED', label: 'Feitos' }
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
    const LIMIT = 4;

    // Modals & UI State
    // const [selectedReport, setSelectedReport] = useState<Report | null>(null);
    const [analyzingReport, setAnalyzingReport] = useState<Report | null>(null);
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [isExportModalOpen, setIsExportModalOpen] = useState(false);
    const [targetStatus, setTargetStatus] = useState<'IN_REVIEW' | 'FORWARDED' | 'RESOLVED'>('IN_REVIEW');
    const [formFeedback, setFormFeedback] = useState('');
    const [selectedDeptId, setSelectedDeptId] = useState('');
    const [viewMode, setViewMode] = useState<'list' | 'map'>('list');
    const [isAgendaOpen, setIsAgendaOpen] = useState(false);
    const hasShownSummaryRef = useRef(false);

    // Dexie Notifications
    const notifications = useLiveQuery(() => db.notifications.orderBy('createdAt').reverse().toArray()) || [];

    // Restoration of missing states
    const [pendingInvite, setPendingInvite] = useState<{ roomId: string; hostId: string; hostName: string } | null>(null);
    const [profilePhrase, setProfilePhrase] = useState(user?.statusPhrase || '');
    const [profileAvatar, setProfileAvatar] = useState<File | null>(null);
    const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);

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
                toast(`Mensagem de ${data.fromName || 'Subordinado'}: ${data.text} `, {
                    icon: '💬',
                    duration: 5000,
                    style: {
                        borderRadius: '0.5rem',
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
    const loadStats = useCallback(async () => {
        try {
            const response = await api.get('/reports/stats');
            setStats(response.data);
        } catch {
            console.error('Erro ao buscar estatísticas');
        }
    }, []);

    const loadSubordinates = useCallback(async () => {
        try {
            const response = await api.get('/subordinates');
            setSubordinates(response.data.filter((s: Subordinate) => s.id !== user?.id));
        } catch {
            console.error('Erro ao buscar subordinados');
        }
    }, [user?.id]);

    const loadContacts = useCallback(async () => {
        try {
            const response = await api.get('/support-network');
            setContacts(response.data.filter((c: UserContact) => c.id !== user?.id));
        } catch {
            console.error('Erro ao buscar contatos');
        }
    }, [user?.id]);

    const loadDepartments = useCallback(async () => {
        try {
            const response = await api.get('/departments');
            setDepartments(response.data);
        } catch {
            console.error('Erro ao buscar departamentos');
        }
    }, []);

    const fetchNotifications = useCallback(async () => {
        if (hasShownSummaryRef.current) return;
        hasShownSummaryRef.current = true;

        try {
            const res = await api.get('/notifications');
            const remoteNotifications = res.data;
            let unreadCount = 0;

            // Upsert remote notifications into Dexie
            await db.transaction('rw', db.notifications, async () => {
                for (const notif of remoteNotifications) {
                    if (!notif.read) unreadCount++;
                    await db.notifications.put({
                        id: String(notif.id),
                        title: notif.title,
                        message: notif.message,
                        type: notif.type || 'system',
                        read: !!notif.read,
                        createdAt: notif.createdAt,
                        link: notif.link || undefined
                    });
                }
            });

            if (unreadCount > 0) {
                toast(`Você tem ${unreadCount} ${unreadCount === 1 ? 'notificação não lida' : 'notificações não lidas'} `, {
                    icon: '🔔',
                    duration: 4000
                });
            }

            // Also check for unread chat messages
            const chatRes = await api.get('/chat/unread-count');
            const unreadChatCount = chatRes.data.count;

            if (unreadChatCount > 0) {
                toast(`Você tem ${unreadChatCount} ${unreadChatCount === 1 ? 'mensagem não lida' : 'mensagens não lidas'} no chat`, {
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
        } catch {
            console.error('Erro ao buscar notificações');
        }
    }, []);

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
    }, [statusFilter, startDate, endDate, loadStats]);

    useEffect(() => {
        loadSubordinates();
        loadContacts();
        loadDepartments();
        fetchNotifications();
    }, [loadSubordinates, loadContacts, loadDepartments, fetchNotifications]);

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



    const handleMarkAsRead = async (id: string) => {
        try {
            await api.patch(`/notifications/${id}/read`);
            await db.notifications.update(id, { read: true });
        } catch {
            // Se falhar o servidor, ainda marcamos localmente para imediatez (ou deixamos sync depois?)
            // Por enquanto, só marcamos se o servidor confirmar ou se quisermos local-first total:
            await db.notifications.update(id, { read: true });
            toast.error('Erro ao sincronizar leitura com servidor');
        }
    };

    const handleMarkAllAsRead = async () => {
        try {
            await api.post('/notifications/read-all');
            const allLocal = await db.notifications.toArray();
            await db.transaction('rw', db.notifications, async () => {
                for (const n of allLocal) {
                    await db.notifications.update(n.id, { read: true });
                }
            });
            toast.success('Todas as notificações marcadas como lidas');
        } catch {
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

            const response = await api.patch('/profile', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            updateUser(response.data);
            toast.success('Perfil atualizado!');
            setIsProfileOpen(false);
            setProfileAvatar(null);
        } catch {
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
        } catch {
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
        } catch {
            toast.error('Erro ao iniciar War Room.');
        }
    };

    const teamGroups = useMemo(() => [
        {
            id: 'operacional',
            title: 'Operacional',
            icon: <Users className="w-4 h-4" />,
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
            icon: <Shield className="w-4 h-4" />,
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
        <DashboardLayout
            user={{ name: user?.name, avatarUrl: user?.avatarUrl, role: user?.role }}
            onLogout={signOut}
            notifications={notifications}
            onMarkAsRead={handleMarkAsRead}
            onMarkAllAsRead={handleMarkAllAsRead}
            onProfileClick={() => setIsProfileOpen(true)}
        >
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
                <div className="flex bg-[var(--bg-tertiary)] p-1 rounded-lg border border-[var(--border-subtle)]">
                    <button
                        onClick={() => setViewMode('list')}
                        className={`px-3 py-1.5 rounded-md text-xs font-bold uppercase tracking-wider transition-all ${viewMode === 'list' ? 'bg-white text-[var(--text-primary)] shadow-sm' : 'text-[var(--text-tertiary)] hover:bg-[var(--bg-primary)]'}`}
                    >
                        Lista
                    </button>
                    <button
                        onClick={() => setViewMode('map')}
                        className={`px-3 py-1.5 rounded-md text-xs font-bold uppercase tracking-wider transition-all ${viewMode === 'map' ? 'bg-white text-[var(--text-primary)] shadow-sm' : 'text-[var(--text-tertiary)] hover:bg-[var(--bg-primary)]'}`}
                    >
                        Mapa
                    </button>
                </div>
            </DashboardHero>

            <div className="flex flex-col lg:flex-row gap-8">
                <main className="flex-1 space-y-6">
                    <div className="relative group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-tertiary)] group-focus-within:text-[var(--text-primary)] transition-colors" />
                        <input
                            type="text"
                            placeholder="Filtrar por protocolo ou descrição..."
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 bg-[var(--bg-primary)] border border-[var(--border-medium)] rounded-xl outline-none focus:ring-2 focus:ring-[var(--border-subtle)] transition-all text-sm font-medium text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] shadow-sm"
                        />
                    </div>

                    {viewMode === 'list' ? (
                        <ReportFeed
                            reports={reports.filter(r =>
                                r.comment.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                r.id.toLowerCase().includes(searchTerm.toLowerCase())
                            )}
                            searchTerm={searchTerm}
                            onSearchChange={setSearchTerm}
                            hasMore={hasMore}
                            onLoadMore={handleLoadMore}
                            isLoading={isReportsLoading}
                            renderReportActions={(report) => (
                                <div className="flex gap-2 w-full">
                                    {report.status !== 'RESOLVED' && !report.department && (
                                        <Button
                                            variant="secondary"
                                            size="sm"
                                            fullWidth
                                            className="bg-[var(--bg-tertiary)] hover:bg-[var(--bg-primary)] border border-[var(--border-medium)]"
                                            onClick={() => { setAnalyzingReport(report); setTargetStatus('FORWARDED'); }}
                                        >
                                            Trâmite
                                        </Button>
                                    )}
                                    <Button variant="ghost" size="sm" onClick={() => { /* setSelectedReport(report) */ }}>
                                        <History className="w-4 h-4" />
                                    </Button>
                                </div>
                            )}
                        />
                    ) : (
                        <div className="w-full h-[600px] rounded-2xl overflow-hidden border border-[var(--border-subtle)] shadow-sm">
                            <MapView reports={reports} />
                        </div>
                    )}
                </main>

                <aside className="w-full lg:w-80 shrink-0">
                    <TeamSidebar
                        onMemberClick={(member) => {
                            setSearchParams({ chat: member.id }, { replace: true });
                            markAsRead(member.id);
                        }}
                        groups={teamGroups}
                    />
                </aside>
            </div>

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

            {/* <ReportHistoryModal
                isOpen={!!selectedReport}
                onClose={() => setSelectedReport(null)}
                report={selectedReport}
            /> */}

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

            <AgendaModal
                isOpen={isAgendaOpen}
                onClose={() => setIsAgendaOpen(false)}
            />
        </DashboardLayout>
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
