import { useEffect, useState, useMemo, useCallback, useRef } from 'react';
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
    Button
} from '../components/ui';
import { DashboardLayout } from '../layouts/DashboardLayout';
import { TeamSidebar, DashboardHero, ReportFeed } from '../components/domain';
import { ReportHistoryModal } from '../components/domain/modals/ReportHistoryModal';
import { AnalysisModal } from '../components/domain/modals/AnalysisModal';
import { ExportReportsModal } from '../components/domain/modals/ExportReportsModal';
import { ConferenceModal } from '../components/domain/modals/ConferenceModal';
import { ProfileSettingsModal } from '../components/domain/modals/ProfileSettingsModal';
import { ConferenceInviteNotification } from '../components/ui/ConferenceInviteNotification';
import { InviteConferenceModal } from '../components/domain/modals/InviteConferenceModal';
import { db } from '../services/db';
import { useLiveQuery } from 'dexie-react-hooks';
import type { Report, Stats, Department, UserContact } from '../types';

interface Subordinate {
    id: string;
    name: string;
    role: string;
    avatarUrl?: string | null;
    statusPhrase?: string;
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

export function ManagerDashboard() {
    const navigate = useNavigate();
    const {
        user,
        signOut,
        updateUser,
        notificationsEnabled,
        setNotificationsEnabled,
        desktopNotificationsEnabled,
        setDesktopNotificationsEnabled
    } = useAuth();
    const [searchParams, setSearchParams] = useSearchParams();
    const activeChatId = searchParams.get('chat');

    const [reports, setReports] = useState<Report[]>([]);
    const [stats, setStats] = useState<Stats[]>([]);
    const hasShownSummaryRef = useRef(false);
    const [contacts, setContacts] = useState<UserContact[]>([]);
    const [departments, setDepartments] = useState<Department[]>([]);

    // Modals
    const [selectedReport, setSelectedReport] = useState<Report | null>(null);
    const [analyzingReport, setAnalyzingReport] = useState<Report | null>(null);
    const [targetStatus, setTargetStatus] = useState<'IN_REVIEW' | 'FORWARDED' | 'RESOLVED'>('RESOLVED');
    const [isExportModalOpen, setIsExportModalOpen] = useState(false);
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
    const [profilePhrase, setProfilePhrase] = useState(user?.statusPhrase || '');
    const [profileAvatar, setProfileAvatar] = useState<File | null>(null);

    // War Room
    const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
    const [subordinates, setSubordinates] = useState<Subordinate[]>([]);
    const [roomParticipants, setRoomParticipants] = useState<string[]>([]);

    // Dexie Notifications
    const notifications = useLiveQuery(() => db.notifications.orderBy('createdAt').reverse().toArray()) || [];

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
    const LIMIT = 4;

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

    const loadSubordinates = useCallback(async () => {
        try {
            const response = await api.get('/subordinates');
            setSubordinates(response.data);
        } catch {
            console.error('Erro ao buscar subordinados');
        }
    }, []);

    const loadDepartments = useCallback(async () => {
        try {
            const response = await api.get('/departments');
            setDepartments(response.data.filter((d: Department) => d.id !== user?.departmentId));
        } catch {
            console.error('Erro ao buscar departamentos');
        }
    }, [user?.departmentId]);

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
                toast(`Você tem ${unreadCount} ${unreadCount === 1 ? 'notificação não lida' : 'notificações não lidas'}`, {
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
        notificationsEnabled,
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
    });

    useEffect(() => {
        if (user?.statusPhrase) {
            setProfilePhrase(user.statusPhrase);
        }
    }, [user?.statusPhrase]);

    useEffect(() => {
        loadReports(1, true, statusFilter);
        loadStats();
    }, [statusFilter, selectedDeptId, loadReports, loadStats]);

    useEffect(() => {
        loadContacts();
        loadSubordinates();
        loadDepartments();
        fetchNotifications();
    }, [loadContacts, loadSubordinates, loadDepartments, fetchNotifications]);

    useEffect(() => {
        if (activeChatId) {
            markAsRead(activeChatId);
        }
    }, [activeChatId, markAsRead]);

    const chatTarget = useMemo(() => {
        if (!activeChatId) return null;
        return contacts.find(c => c.id === activeChatId) || null;
    }, [activeChatId, contacts]);

    const handleCloseChat = () => {
        setSearchParams({}, { replace: true });
    };

    const handleMarkAsRead = async (id: string) => {
        try {
            await api.patch(`/notifications/${id}/read`);
            await db.notifications.update(id, { read: true });
        } catch {
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

    const resetAnalysisForm = () => {
        setFormFeedback('');
        setSelectedDeptId('');
        setTargetStatus('RESOLVED');
    };

    const handleConfirmInvite = async (participantIds: string[]) => {
        try {
            if (activeRoom) {
                await api.post('/conference/invite', {
                    roomId: activeRoom,
                    participants: participantIds
                });
                toast.success('Convites adicionais enviados!');
            } else {
                const response = await api.post('/conference/create', {
                    participants: participantIds
                });
                toast.success('War Room iniciada! Convites enviados.');
                setActiveRoom(response.data.roomId);
            }
            setIsInviteModalOpen(false);
        } catch {
            toast.error(activeRoom ? 'Erro ao enviar convites adicionais.' : 'Erro ao iniciar War Room.');
        }
    };

    return (
        <DashboardLayout
            user={{ name: user?.name, avatarUrl: user?.avatarUrl, role: user?.role }}
            onLogout={signOut}
            notifications={notifications}
            onMarkAsRead={handleMarkAsRead}
            onMarkAllAsRead={handleMarkAllAsRead}
            onProfileClick={() => setIsProfileOpen(true)}
            activeRoom={activeRoom}
            onRejoinRoom={setActiveRoom}
        >
            <div className="flex flex-col lg:flex-row gap-8 animate-in fade-in duration-500">
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
                        <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-tertiary)] opacity-60 group-focus-within:opacity-100 transition-opacity" />
                        <input
                            type="text"
                            placeholder="Filtrar por protocolo ou descrição..."
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            className="w-full pl-14 pr-8 py-4 bg-[var(--bg-primary)] border border-[var(--border-subtle)] rounded-3xl outline-none focus:ring-2 focus:ring-[var(--border-medium)] transition-all text-sm font-medium text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)]"
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
                userId={user?.id}
                onInviteClick={() => setIsInviteModalOpen(true)}
                onParticipantsUpdate={setRoomParticipants}
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

            <InviteConferenceModal
                isOpen={isInviteModalOpen}
                onClose={() => setIsInviteModalOpen(false)}
                participants={useMemo(() => {
                    const all = [...subordinates, ...contacts];
                    const unique = Array.from(new Map(all.map(m => [m.id, m])).values());
                    return unique
                        .filter(m => onlineUserIds.includes(m.id) && !roomParticipants.includes(m.id))
                        .map(m => ({
                            id: m.id,
                            name: m.name,
                            role: m.role,
                            avatarUrl: m.avatarUrl,
                            isOnline: true
                        }));
                }, [subordinates, contacts, onlineUserIds, roomParticipants])}
                onConfirm={handleConfirmInvite}
                isAdding={!!activeRoom}
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
                notificationsEnabled={notificationsEnabled}
                setNotificationsEnabled={setNotificationsEnabled}
                desktopNotificationsEnabled={desktopNotificationsEnabled}
                setDesktopNotificationsEnabled={setDesktopNotificationsEnabled}
            />
        </DashboardLayout>
    );
}
