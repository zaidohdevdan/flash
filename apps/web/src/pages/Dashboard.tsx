import { useEffect, useState, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../services/api';
import { toast } from 'react-hot-toast';
import { useDashboardSocket } from '../hooks/useDashboardSocket';
import {
    Clock,
    CheckCircle,
    AlertCircle,
    History,
    Folder,
    Users,
    Shield
} from 'lucide-react';
import { ChatWidget } from '../components/ChatWidget';
import {
    Button,
    Header,
} from '../components/ui';
import { TeamSidebar, DashboardHero, ReportFeed } from '../components/domain';
import { MapView } from '../components/domain/MapView';
import { ReportHistoryModal } from '../components/domain/modals/ReportHistoryModal';
import { AnalysisModal } from '../components/domain/modals/AnalysisModal';
import { ProfileSettingsModal } from '../components/domain/modals/ProfileSettingsModal';
import { ExportReportsModal } from '../components/domain/modals/ExportReportsModal';



import type { Report, Stats, Department, UserContact } from '../types';

interface Subordinate {
    id: string;
    name: string;
    role: string;
    avatarUrl?: string | null;
    statusPhrase?: string;
    isOnline?: boolean;
}

export function Dashboard() {
    const navigate = useNavigate();
    const { user, signOut, updateUser } = useAuth();

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

    // Profile State
    const [profilePhrase, setProfilePhrase] = useState(user?.statusPhrase || '');
    const [profileAvatar, setProfileAvatar] = useState<File | null>(null);
    const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);

    // Chat Hooks & Derivations
    const [searchParams, setSearchParams] = useSearchParams();
    const activeChatId = searchParams.get('chat');

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
                playNotificationSound();
            } else {
                markAsRead(data.from);
            }
        }
    });

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
        ...(contacts.length > 0 ? [{
            id: 'apoio',
            title: 'Apoio',
            icon: <Shield className="w-3 h-3" />,
            members: contacts.map(c => ({
                id: c.id,
                name: c.name,
                role: c.role,
                departmentName: c.departmentName,
                avatarUrl: c.avatarUrl,
                isOnline: onlineUserIds.includes(c.id),
                statusPhrase: c.statusPhrase,
                hasUnread: !!unreadMessages[c.id]
            }))
        }] : [])
    ], [subordinates, contacts, onlineUserIds, unreadMessages]);

    const chatTarget = useMemo(() => {
        if (!activeChatId) return null;
        return teamGroups.flatMap(g => g.members).find(m => m.id === activeChatId) || null;
    }, [activeChatId, teamGroups]);

    useEffect(() => {
        if (activeChatId) {
            markAsRead(activeChatId);
            if (window.innerWidth < 1024) {
                document.body.style.overflow = 'hidden';
            }
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => { document.body.style.overflow = 'unset'; };
    }, [activeChatId, markAsRead]);

    const handleCloseChat = () => {
        setSearchParams({}, { replace: true });
    };

    // Data Fetching
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

    // Socket Events Specific to Dashboard
    useEffect(() => {
        if (!socket) return;

        socket.on('new_report_to_review', (data: { data: Report }) => {
            if (!statusFilter || statusFilter === 'SENT') {
                setReports(prev => [data.data, ...prev]);
            }
            loadStats();
        });

        socket.on('report_status_updated_for_supervisor', (data: Report) => {
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
            socket.off('new_report_to_review');
            socket.off('report_status_updated_for_supervisor');
        };
    }, [socket, statusFilter]);

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
        <div className="min-h-screen bg-slate-50/50 flex flex-col font-sans selection:bg-blue-100 selection:text-blue-900 transition-colors duration-700 overflow-x-hidden">
            <Header
                user={{
                    name: user?.name,
                    avatarUrl: user?.avatarUrl
                }}
                onLogout={signOut}
            />

            {/* Hero / Filter Section */}
            <DashboardHero
                title="Painel de Controle"
                subtitle="Controle operacional em tempo real"
                stats={stats}
                statusFilter={statusFilter}
                onStatusFilterChange={(s) => { setStatusFilter(s); setPage(1); }}
                filters={[
                    { id: '', label: 'Todos' },
                    { id: 'SENT', label: 'Recebidos' },
                    { id: 'IN_REVIEW', label: 'Análise' },
                    { id: 'FORWARDED', label: 'Tramite' },
                    { id: 'RESOLVED', label: 'Feitos' },
                    { id: 'ARCHIVED', label: 'Arquivados' }
                ]}
                kpiConfigs={[
                    { label: 'Recebidos', status: 'SENT', icon: AlertCircle, color: 'blue' },
                    { label: 'Em Análise', status: 'IN_REVIEW', icon: Clock, color: 'purple' },
                    { label: 'Encaminhados', status: 'FORWARDED', icon: Folder, color: 'orange' },
                    { label: 'Finalizados', status: 'RESOLVED', icon: CheckCircle, color: 'emerald' },
                ]}
                showDateFilters
                startDate={startDate}
                endDate={endDate}
                onStartDateChange={setStartDate}
                onEndDateChange={setEndDate}
                onClearDates={() => { setStartDate(''); setEndDate(''); }}
                onAnalyticsClick={() => navigate('/analytics')}
                onExportClick={() => setIsExportModalOpen(true)}
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

                {/* Background Decorations for Supervisor */}
                <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-blue-600/25 rounded-full blur-[160px] -mr-96 -mt-96 animate-pulse duration-[10s] pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-indigo-600/20 rounded-full blur-[140px] -ml-40 -mb-40 pointer-events-none" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[radial-gradient(circle_at_50%_50%,rgba(59,130,246,0.08),transparent_80%)] pointer-events-none" />
            </DashboardHero>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-6 w-full -mt-20 mb-20 relative flex flex-col lg:flex-row gap-12">
                {/* Visual Blobs behind the glass content */}
                <div className="absolute -z-10 top-0 left-1/4 w-[500px] h-[500px] bg-blue-400/10 rounded-full blur-[120px] pointer-events-none" />
                <div className="absolute -z-10 bottom-0 right-1/4 w-[400px] h-[400px] bg-purple-400/10 rounded-full blur-[100px] pointer-events-none" />

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
                        renderReportActions={(report) => (
                            <div className="flex gap-2 w-full">
                                {report.status !== 'RESOLVED' && report.status !== 'ARCHIVED' && (
                                    <Button
                                        variant="primary"
                                        size="sm"
                                        fullWidth
                                        onClick={() => { setAnalyzingReport(report as any); setTargetStatus('FORWARDED'); }}
                                        disabled={!!(report as any).departmentId}
                                    >
                                        {(report as any).departmentId ? 'Em Setor' : 'Trâmite'}
                                    </Button>
                                )}
                                {report.status === 'RESOLVED' && (
                                    <Button variant="secondary" size="sm" fullWidth onClick={() => handleUpdateStatus(report.id, 'ARCHIVED')}>Arquivar</Button>
                                )}
                                <Button variant="ghost" size="sm" onClick={() => setSelectedReport(report as any)}>
                                    <History className="w-4 h-4" />
                                </Button>
                            </div>
                        )}
                    />
                ) : (
                    <div className="w-full h-[600px]">
                        <MapView reports={reports} onMarkerClick={(report) => {
                            setSelectedReport(report);
                            // Opcional: abrir modal de detalhes ou chat
                        }} />
                    </div>
                )}

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
                title={analyzingReport?.status === 'FORWARDED' ? `Resposta: ${analyzingReport?.department?.name}` : 'Análise de Fluxo'}
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
                    targetUser={{ id: chatTarget.id || '', name: chatTarget.name || '', role: chatTarget.role || 'PROFESSIONAL' }}
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
        </div >
    );
}
