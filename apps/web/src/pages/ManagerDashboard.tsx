import { useEffect, useState, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../services/api';
import { toast } from 'react-hot-toast';
import { useDashboardSocket } from '../hooks/useDashboardSocket';
import {
    Clock,
    CheckCircle,
    Folder,
    History,
    Shield
} from 'lucide-react';
import { ChatWidget } from '../components/ChatWidget';
import {
    Button,
    Header,
} from '../components/ui';
import { TeamSidebar, DashboardHero, ReportFeed } from '../components/domain';
import { ReportHistoryModal } from '../components/domain/modals/ReportHistoryModal';
import { AnalysisModal } from '../components/domain/modals/AnalysisModal';



import { ExportReportsModal } from '../components/domain/modals/ExportReportsModal';
import type { Report, Stats, Department, UserContact } from '../types';



export function ManagerDashboard() {
    const navigate = useNavigate();
    const { user, signOut } = useAuth();
    const [reports, setReports] = useState<Report[]>([]);
    const [stats, setStats] = useState<Stats[]>([]);
    const [contacts, setContacts] = useState<UserContact[]>([]);
    const [departments, setDepartments] = useState<Department[]>([]);

    // Modals
    const [selectedReport, setSelectedReport] = useState<Report | null>(null);
    const [analyzingReport, setAnalyzingReport] = useState<Report | null>(null);
    const [targetStatus, setTargetStatus] = useState<'IN_REVIEW' | 'FORWARDED' | 'RESOLVED'>('RESOLVED');
    const [isExportModalOpen, setIsExportModalOpen] = useState(false);

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

    const [searchParams, setSearchParams] = useSearchParams();
    const activeChatId = searchParams.get('chat');

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
        }
    });

    useEffect(() => {
        if (activeChatId) {
            markAsRead(activeChatId);
        }
    }, [activeChatId, markAsRead]);



    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        if (!socket) return;

        socket.on('report_status_updated_for_supervisor', (data: Report) => {
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

        socket.on('report_forwarded_to_department', (data: Report) => {
            setReports(prev => {
                const exists = prev.find(r => r.id === data.id);
                if (exists) return prev;
                return [data, ...prev];
            });
            loadStats();
            toast.success(`Novo reporte encaminhado para seu departamento!`);
        });

        return () => {
            socket.off('report_status_updated_for_supervisor');
            socket.off('report_forwarded_to_department');
        };
    }, [socket, statusFilter, user?.departmentId]);

    async function handleUpdateStatus(reportId: string, status: string, feedback?: string) {
        try {
            const response = await api.patch(`/reports/${reportId}/status`, {
                status,
                feedback
            });

            toast.success(`Status atualizado para ${status === 'IN_REVIEW' ? 'Análise' : 'concluído'}!`);

            setReports(prev => {
                if (statusFilter && statusFilter !== status) {
                    return prev.filter(r => r.id !== reportId);
                }
                return prev.map(r => r.id === reportId ? response.data : r);
            });

            loadStats();
        } catch (error: any) {
            toast.error('Erro ao atualizar status.');
        }
    }

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
                if (statusFilter && statusFilter !== targetStatus) {
                    return prev.filter(r => r.id !== analyzingReport.id);
                }
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
                title="Dashboard Gerencial"
                subtitle="Resolução de Demandas por Departamento"
                stats={stats}
                statusFilter={statusFilter}
                onStatusFilterChange={(s) => { setStatusFilter(s); setPage(1); }}
                filters={[
                    { id: '', label: 'Todos' },
                    { id: 'FORWARDED', label: 'Setor' },
                    { id: 'IN_REVIEW', label: 'Análise' },
                    { id: 'RESOLVED', label: 'Feitos' },
                ]}
                kpiConfigs={[
                    { label: 'Pendentes no Setor', status: 'FORWARDED', icon: Folder, color: 'blue' },
                    { label: 'Em Análise', status: 'IN_REVIEW', icon: Clock, color: 'purple' },
                    { label: 'Resolvidos', status: 'RESOLVED', icon: CheckCircle, color: 'emerald' },
                ]}
                onAnalyticsClick={() => navigate('/analytics')}
                onExportClick={() => setIsExportModalOpen(true)}
            >
                {/* Background Decorations */}
                <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-blue-600/25 rounded-full blur-[160px] -mr-96 -mt-96 animate-pulse duration-[10s] pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-indigo-600/20 rounded-full blur-[140px] -ml-40 -mb-40 pointer-events-none" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[radial-gradient(circle_at_50%_50%,rgba(59,130,246,0.08),transparent_80%)] pointer-events-none" />
            </DashboardHero>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-6 w-full -mt-20 mb-20 relative flex flex-col lg:flex-row gap-12">
                {/* Visual Blobs behind the glass content */}
                <div className="absolute -z-10 top-0 left-1/4 w-[500px] h-[500px] bg-blue-400/10 rounded-full blur-[120px] pointer-events-none" />
                <div className="absolute -z-10 bottom-0 right-1/4 w-[400px] h-[400px] bg-purple-400/10 rounded-full blur-[100px] pointer-events-none" />
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
                            {report.status === 'FORWARDED' && (
                                <Button
                                    variant="primary"
                                    size="sm"
                                    fullWidth
                                    onClick={() => handleUpdateStatus(report.id, 'IN_REVIEW')}
                                >
                                    Iniciar Análise
                                </Button>
                            )}
                            {report.status === 'IN_REVIEW' && (
                                <Button
                                    variant="success"
                                    size="sm"
                                    fullWidth
                                    onClick={() => { setAnalyzingReport(report as any); setTargetStatus('RESOLVED'); }}
                                >
                                    Resolver
                                </Button>
                            )}
                            <Button variant="ghost" size="sm" onClick={() => setSelectedReport(report as any)}>
                                <History className="w-4 h-4" />
                            </Button>
                        </div>
                    )}
                />

                {/* Sidebar com contatos hierárquicos */}
                <aside className="w-full lg:w-80 shrink-0">
                    <TeamSidebar
                        title="Rede de Apoio"
                        icon={<Shield className="w-5 h-5 text-white" />}
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
        </div>
    );
}
