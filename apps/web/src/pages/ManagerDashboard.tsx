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
    const { user, signOut, updateUser } = useAuth();
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

    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [profilePhrase, setProfilePhrase] = useState(user?.statusPhrase || '');
    const [profileAvatar, setProfileAvatar] = useState<File | null>(null);
    const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);

    useEffect(() => {
        if (user?.statusPhrase) {
            setProfilePhrase(user.statusPhrase);
        }
    }, [user?.statusPhrase]);

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
        onNewNotification: (payload) => {
            const notif: Notification = {
                id: (payload.id as string) || Date.now().toString(),
                title: payload.title,
                message: payload.message,
                type: (payload.type as string) || 'system',
                read: false,
                createdAt: (payload.createdAt as string) || new Date().toISOString(),
                link: payload.link as string | undefined
            };
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

    return (
        <DashboardLayout
            user={{ name: user?.name, avatarUrl: user?.avatarUrl, role: user?.role }}
            onLogout={signOut}
            notifications={notifications}
            onMarkAsRead={handleMarkAsRead}
            onMarkAllAsRead={handleMarkAllAsRead}
            onProfileClick={() => setIsProfileOpen(true)}
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
        </DashboardLayout>
    );
}
