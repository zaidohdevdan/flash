import { useState, useCallback, useEffect } from 'react';
import type { Socket } from 'socket.io-client';
import { useOutletContext } from 'react-router-dom';
import { api } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { useDashboardSocket } from '../../hooks/useDashboardSocket';
import { ProfessionalHeader, SupervisorHighlight } from '../../components/domain/professional';
import { ReportCard } from '../../components/domain';
import { ReportHistoryModal } from '../../components/domain/modals/ReportHistoryModal';
import { Button, ReportShimmer } from '../../components/ui';
import type { Report } from '../../types';

export function Overview() {
    const { user } = useAuth();
    const { socket, searchTerm } = useOutletContext<{ socket: Socket | null; searchTerm: string }>();

    const [history, setHistory] = useState<Report[]>([]);
    const [page, setPage] = useState(1);
    const [statusFilter, setStatusFilter] = useState<string>('');
    const [hasMore, setHasMore] = useState(true);
    const [loadingHistory, setLoadingHistory] = useState(false);
    const [selectedReport, setSelectedReport] = useState<Report | null>(null);

    const LIMIT = 4;

    const { onlineUserIds, unreadMessages } = useDashboardSocket({
        user: user ? { id: user.id || '', name: user.name || '', role: user.role || '' } : null,
        notificationsEnabled: false // Handled in Layout
    });

    const hasUnreadMessages = Object.values(unreadMessages).some(v => v === true);

    const loadHistory = useCallback(async (pageNum: number = 1, reset: boolean = false, status?: string) => {
        if (!user?.id) return;
        setLoadingHistory(pageNum === 1);
        try {
            const statusParam = status ? `&status=${status}` : '';
            const url = `/reports/me?page=${pageNum}&limit=${LIMIT}${statusParam}`;
            const response = await api.get(url);
            const newHistory = response.data;

            setHasMore(newHistory.length === LIMIT);
            setHistory(prev => reset ? newHistory : [...prev, ...newHistory]);
        } catch {
            console.error('Erro ao carregar histórico');
        } finally {
            setLoadingHistory(false);
        }
    }, [user?.id]);

    useEffect(() => {
        loadHistory(1, true, statusFilter);
    }, [statusFilter, loadHistory]);

    useEffect(() => {
        if (!socket) return;
        socket.on('report_status_updated', (data: { reportId: string, newStatus: unknown, feedback?: string, feedbackAt?: string }) => {
            setHistory(prev => {
                if (statusFilter && statusFilter !== data.newStatus) {
                    return prev.filter(item => item.id !== data.reportId);
                }
                return prev.map(item =>
                    item.id === data.reportId
                        ? { ...item, status: data.newStatus as Report['status'], feedback: data.feedback, feedbackAt: data.feedbackAt }
                        : item
                );
            });
        });
        return () => {
            socket.off('report_status_updated');
        };
    }, [socket, statusFilter]);

    function handleLoadMore() {
        const nextPage = page + 1;
        setPage(nextPage);
        loadHistory(nextPage, false, statusFilter);
    }

    // Dummy navigation for modular highlight card, chat routing will be handled by App.tsx child routes later
    const handleOpenChat = () => {
        // We'll wire this to navigate to Chat later
    };

    return (
        <div className="max-w-2xl mx-auto space-y-8 pb-24 px-4 sm:px-6">
            <ProfessionalHeader
                userName={user?.name || 'Profissional'}
                isConnected={navigator.onLine}
            />

            {user?.supervisorId && (
                <SupervisorHighlight
                    supervisorName={user.supervisorName || 'Líder Técnico'}
                    isOnline={onlineUserIds.includes(user.supervisorId)}
                    hasUnread={hasUnreadMessages || !!unreadMessages[user.supervisorId]}
                    onChatOpen={handleOpenChat}
                />
            )}

            <div className="flex flex-col gap-4">
                <div className="-mx-4 px-4 sm:mx-0 sm:px-0 flex gap-2 overflow-x-auto pb-4 no-scrollbar">
                    {[
                        { id: '', label: 'Histórico Completo' },
                        { id: 'SENT', label: 'Enviados' },
                        { id: 'IN_REVIEW', label: 'Monitoramento' },
                        { id: 'FORWARDED', label: 'Em Auditoria' },
                        { id: 'RESOLVED', label: 'Finalizados' },
                    ].map(filter => (
                        <button
                            type="button"
                            key={filter.id}
                            onClick={() => { setStatusFilter(filter.id); setPage(1); }}
                            className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-[0.15em] transition-all border whitespace-nowrap shadow-lg ${statusFilter === filter.id
                                ? 'bg-indigo-600 text-white border-indigo-500 shadow-indigo-500/20'
                                : 'bg-slate-100 text-slate-500 border-slate-200 hover:bg-slate-200 hover:text-slate-700 dark:bg-black/20 dark:text-slate-400 dark:border-white/5 dark:hover:bg-white/5 dark:hover:text-slate-200'
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
                                    Ver Detalhes
                                </Button>
                            }
                        />
                    ))}

                    {hasMore && (
                        <Button variant="secondary" size="lg" fullWidth onClick={handleLoadMore} className="mt-8 bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-600 dark:bg-white/5 dark:hover:bg-white/10 dark:border-white/5 dark:text-slate-400 font-black uppercase tracking-[0.2em] h-14 !rounded-2xl transition-all">
                            Carregar Mais Registros
                        </Button>
                    )}
                </div>
            )}

            <ReportHistoryModal
                isOpen={!!selectedReport}
                onClose={() => setSelectedReport(null)}
                report={selectedReport}
            />
        </div>
    );
}
