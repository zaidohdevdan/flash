import { useState, useCallback, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { api } from '../../services/api';
import { useReports } from '../../hooks/useReports';
import { ReportFeed } from '../../components/domain/ReportFeed';
import { AnalysisModal } from '../../components/domain/modals/AnalysisModal';
import { ReportHistoryModal } from '../../components/domain/modals/ReportHistoryModal';
import { Button } from '../../components/ui/Button';
import { History as HistoryIcon, Search, Filter } from 'lucide-react';
import { toast } from 'react-hot-toast';
import type { Report, Department } from '../../types';

export function Operations() {
    const [searchParams] = useSearchParams();
    const highlightId = searchParams.get('highlight');
    const [page, setPage] = useState(1);
    const [statusFilter, setStatusFilter] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [hasMore, setHasMore] = useState(true);
    const [reportsList, setReportsList] = useState<Report[]>([]);

    // Modals & Forms
    const [analyzingReport, setAnalyzingReport] = useState<Report | null>(null);
    const [selectedReport, setSelectedReport] = useState<Report | null>(null);
    const [targetStatus, setTargetStatus] = useState<'IN_REVIEW' | 'FORWARDED' | 'RESOLVED'>('RESOLVED');
    const [formFeedback, setFormFeedback] = useState('');
    const [selectedDeptId, setSelectedDeptId] = useState('');
    const [departments, setDepartments] = useState<Department[]>([]);

    const LIMIT = 6;

    const {
        data: reportsData = [],
        isLoading: isReportsLoading,
        isPlaceholderData,
        refetch: refetchReports
    } = useReports({
        page,
        limit: LIMIT,
        status: statusFilter,
        endpoint: '/reports/department'
    });

    const updateReports = useCallback((data: Report[]) => {
        setReportsList(prev => page === 1 ? data : [...prev, ...data]);
        setHasMore(data.length === LIMIT);
    }, [LIMIT, page]);

    useEffect(() => {
        /* eslint-disable react-hooks/set-state-in-effect */
        if (reportsData && Array.isArray(reportsData)) {
            updateReports(reportsData);
        } else if (reportsData && (reportsData as unknown as { reports: Report[] }).reports) {
            updateReports((reportsData as unknown as { reports: Report[] }).reports);
        }
        /* eslint-enable react-hooks/set-state-in-effect */
    }, [reportsData, updateReports]);

    const loadDepartments = useCallback(async () => {
        try {
            const response = await api.get('/departments');
            setDepartments(response.data);
        } catch {
            console.error('Erro ao buscar departamentos');
        }
    }, []);

    useEffect(() => {
        /* eslint-disable react-hooks/set-state-in-effect */
        loadDepartments();
        /* eslint-enable react-hooks/set-state-in-effect */
    }, [loadDepartments]);

    const handleLoadMore = () => {
        if (!isPlaceholderData && hasMore) {
            setPage(prev => prev + 1);
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
        } catch {
            toast.error('Erro ao processar relatório.');
        }
    };

    const resetAnalysisForm = () => {
        setFormFeedback('');
        setSelectedDeptId('');
        setTargetStatus('RESOLVED');
    };

    const displayReports = reportsList.filter(r =>
        r.comment.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.id.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="flex flex-col h-full animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter uppercase">Esteira Operacional</h1>
                    <p className="text-slate-500 dark:text-slate-400 font-bold mt-2 uppercase tracking-[0.2em] text-[10px]">Fluxo do Departamento</p>
                </div>

                <div className="flex flex-wrap items-center gap-4">
                    <div className="relative group w-full md:w-[300px]">
                        <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                            <Search className="w-4 h-4 text-slate-500 group-focus-within:text-indigo-600 dark:group-focus-within:text-indigo-400 transition-colors" />
                        </div>
                        <input
                            type="text"
                            placeholder="Buscar Protocolo ou Descrição..."
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            className="w-full pl-12 pr-4 py-3 bg-white dark:bg-black/40 border border-slate-200 dark:border-white/5 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all text-[11px] font-black text-slate-800 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-600 uppercase tracking-widest shadow-sm backdrop-blur-md"
                        />
                    </div>

                    <div className="bg-white dark:bg-black/40 border border-slate-200 dark:border-white/5 rounded-2xl p-1 shadow-sm flex items-center backdrop-blur-md">
                        <Filter className="w-4 h-4 text-slate-500 ml-3 mr-2 hidden sm:block" />
                        <select
                            title='Filtrar'
                            value={statusFilter}
                            onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
                            className="bg-transparent text-[11px] font-black text-slate-700 dark:text-slate-300 uppercase tracking-widest outline-none py-2 pr-4 cursor-pointer"
                        >
                            <option value="" className="bg-white dark:bg-slate-900">Todos</option>
                            <option value="SENT" className="bg-white dark:bg-slate-900">Recebidos</option>
                            <option value="IN_REVIEW" className="bg-white dark:bg-slate-900">Análise</option>
                            <option value="FORWARDED" className="bg-white dark:bg-slate-900">Tramitados</option>
                            <option value="RESOLVED" className="bg-white dark:bg-slate-900">Baixados</option>
                        </select>
                    </div>
                </div>
            </div>

            <div className="flex-1 bg-white dark:bg-black/20 rounded-[2.5rem] border border-slate-200 dark:border-white/5 shadow-xl p-6 lg:p-8 backdrop-blur-xl">
                <ReportFeed
                    reports={displayReports}
                    highlightedId={highlightId}
                    searchTerm={searchTerm}
                    onSearchChange={setSearchTerm}
                    hasMore={hasMore}
                    onLoadMore={handleLoadMore}
                    isLoading={isReportsLoading}
                    variant="grid"
                    renderReportActions={(report) => (
                        <div className="flex gap-3 w-full mt-4">
                            {report.status !== 'RESOLVED' && (
                                <Button
                                    variant="secondary"
                                    size="sm"
                                    fullWidth
                                    className="bg-indigo-50 dark:bg-indigo-600/20 border border-indigo-200 dark:border-indigo-500/30 text-indigo-600 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-indigo-600/40 hover:text-indigo-700 dark:hover:text-white font-black uppercase tracking-widest text-[9px] h-10 !rounded-xl transition-all shadow-sm"
                                    onClick={() => { setAnalyzingReport(report); setTargetStatus(report.status === 'SENT' ? 'IN_REVIEW' : 'RESOLVED'); }}
                                >
                                    Tratar Demanda
                                </Button>
                            )}
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setSelectedReport(report)}
                                className="bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/5 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-white/10 hover:text-slate-900 dark:hover:text-white !rounded-xl w-10 h-10 p-0 flex items-center justify-center transition-all shadow-sm shrink-0"
                            >
                                <HistoryIcon className="w-4 h-4" />
                            </Button>
                        </div>
                    )}
                />
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
                title="Parecer Gestão"
            />

            <ReportHistoryModal
                isOpen={!!selectedReport}
                onClose={() => setSelectedReport(null)}
                report={selectedReport}
            />
        </div>
    );
}
