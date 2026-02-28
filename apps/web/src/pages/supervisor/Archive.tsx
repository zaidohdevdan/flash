import { useState, useCallback, useEffect } from 'react';
import { api } from '../../services/api';
import { useReports } from '../../hooks/useReports';
import { ReportFeed } from '../../components/domain/ReportFeed';
import { ReportHistoryModal } from '../../components/domain/modals/ReportHistoryModal';
import { ExportReportsModal } from '../../components/domain/modals/ExportReportsModal';
import { Button } from '../../components/ui/Button';
import { History as HistoryIcon, Search, Calendar, Download } from 'lucide-react';
import type { Department, Report } from '../../types';

export function Archive() {
    const [page, setPage] = useState(1);
    const [searchTerm, setSearchTerm] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [hasMore, setHasMore] = useState(true);
    const [reportsList, setReportsList] = useState<Report[]>([]);

    // Modals
    const [selectedReport, setSelectedReport] = useState<Report | null>(null);
    const [isExportModalOpen, setIsExportModalOpen] = useState(false);
    const [departments, setDepartments] = useState<Department[]>([]);

    const LIMIT = 8;

    const {
        data: reportsData = [],
        isLoading: isReportsLoading,
        isPlaceholderData
    } = useReports({
        page,
        limit: LIMIT,
        status: 'RESOLVED',
        startDate,
        endDate
    });

    const updateReports = useCallback((data: Report[]) => {
        setReportsList(prev => page === 1 ? data : [...prev, ...data]);
        setHasMore(data.length === LIMIT);
    }, [LIMIT, page]);

    useEffect(() => {
        if (reportsData) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            updateReports(reportsData);
        }
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
        // eslint-disable-next-line react-hooks/set-state-in-effect
        loadDepartments();
    }, [loadDepartments]);

    const handleLoadMore = () => {
        if (!isPlaceholderData && hasMore) {
            setPage(prev => prev + 1);
        }
    };

    const displayReports = reportsList.filter(r =>
        r.comment.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.id.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="flex flex-col h-full animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter uppercase">Arquivo Geral</h1>
                    <p className="text-slate-500 dark:text-slate-400 font-bold mt-2 uppercase tracking-[0.2em] text-[12px]">Base Histórica e Relatórios</p>
                </div>

                <div className="flex flex-wrap items-center gap-4">
                    {/* Search Bar */}
                    <div className="relative group w-full md:w-[300px]">
                        <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                            <Search className="w-4 h-4 text-slate-500 group-focus-within:text-indigo-600 dark:group-focus-within:text-indigo-400 transition-colors" />
                        </div>
                        <input
                            type="text"
                            placeholder="Buscar no Histórico..."
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            className="w-full pl-12 pr-4 py-3 bg-white dark:bg-black/40 border border-slate-200 dark:border-white/5 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all text-[13px] font-black text-slate-800 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-600 uppercase tracking-widest shadow-sm backdrop-blur-md"
                        />
                    </div>

                    {/* Date Filters */}
                    <div className="flex items-center bg-white dark:bg-black/40 border border-slate-200 dark:border-white/5 p-1 rounded-2xl shadow-sm backdrop-blur-md">
                        <div className="flex items-center gap-3 px-4 py-2 border-r border-slate-200 dark:border-white/5">
                            <Calendar className="w-4 h-4 text-slate-500" />
                            <div className="flex flex-col">
                                <span className="text-[11px] font-black text-slate-400 uppercase leading-none mb-1">Início</span>
                                <input
                                    type="date"
                                    title="Data Início"
                                    value={startDate}
                                    onChange={e => { setStartDate(e.target.value); setPage(1); }}
                                    className="bg-transparent text-[13px] font-black outline-none text-slate-700 dark:text-slate-300 uppercase cursor-pointer p-0 m-0 w-[110px]"
                                />
                            </div>
                        </div>
                        <div className="flex items-center gap-3 px-4 py-2">
                            <div className="flex flex-col">
                                <span className="text-[11px] font-black text-slate-400 uppercase leading-none mb-1">Término</span>
                                <input
                                    type="date"
                                    title="Data Término"
                                    value={endDate}
                                    onChange={e => { setEndDate(e.target.value); setPage(1); }}
                                    className="bg-transparent text-[13px] font-black outline-none text-slate-700 dark:text-slate-300 uppercase cursor-pointer p-0 m-0 w-[110px]"
                                />
                            </div>
                        </div>
                    </div>

                    <Button
                        variant="primary"
                        onClick={() => setIsExportModalOpen(true)}
                        className="h-[52px] px-6 rounded-2xl font-black uppercase tracking-widest text-[12px] shadow-lg shadow-indigo-600/20"
                    >
                        <Download className="w-4 h-4 mr-2" />
                        Exportar Base
                    </Button>
                </div>
            </div>

            <div className="flex-1 bg-white dark:bg-black/20 rounded-[2.5rem] border border-slate-200 dark:border-white/5 shadow-xl p-6 lg:p-8 backdrop-blur-xl">
                <ReportFeed
                    reports={displayReports}
                    searchTerm={searchTerm}
                    onSearchChange={setSearchTerm}
                    hasMore={hasMore}
                    onLoadMore={handleLoadMore}
                    isLoading={isReportsLoading}
                    variant="minimal"
                    emptyMessage="Nenhum Registro Encontrado no Período."
                    renderReportActions={(report) => (
                        <div className="flex justify-center w-full">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setSelectedReport(report)}
                                className="w-full bg-indigo-50/50 dark:bg-indigo-500/10 border border-indigo-200/50 dark:border-indigo-500/20 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-600 dark:hover:bg-indigo-500 hover:text-white dark:hover:text-white font-black uppercase tracking-[0.2em] text-[11px] h-9 !rounded-xl transition-all shadow-sm flex items-center justify-center gap-2 group/btn"
                            >
                                <HistoryIcon className="w-3.5 h-3.5 group-hover/btn:rotate-12 transition-transform" />
                                Ver Protocolo
                            </Button>
                        </div>
                    )}
                />
            </div>

            <ReportHistoryModal
                isOpen={!!selectedReport}
                onClose={() => setSelectedReport(null)}
                report={selectedReport}
            />

            <ExportReportsModal
                isOpen={isExportModalOpen}
                onClose={() => setIsExportModalOpen(false)}
                reports={reportsList}
                departments={departments}
            />
        </div>
    );
}
