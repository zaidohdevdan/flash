import { useEffect, useState, useCallback } from 'react';
import { api } from '../../services/api';
import { DashboardHero } from '../../components/domain/DashboardHero';
import { MapView } from '../../components/domain/MapView';
import { ExportReportsModal } from '../../components/domain/modals/ExportReportsModal';
import type { Department, Report, Stats } from '../../types';
import {
    Clock,
    CheckCircle,
    AlertCircle,
    Folder,
    Activity,
    Map as MapIcon
} from 'lucide-react';
import { Card, Button } from '../../components/ui';

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

export function Intelligence() {
    const [stats, setStats] = useState<Stats[]>([]);
    const [reports, setReports] = useState<Report[]>([]); // For the map and recent list
    const [statusFilter, setStatusFilter] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    const [isExportModalOpen, setIsExportModalOpen] = useState(false);
    const [departments, setDepartments] = useState<Department[]>([]);

    const [isMapVisible, setIsMapVisible] = useState(false);

    const loadStats = useCallback(async () => {
        try {
            const params = new URLSearchParams();
            if (startDate) params.append('startDate', startDate);
            if (endDate) params.append('endDate', endDate);

            const response = await api.get(`/reports/department/stats?${params.toString()}`);
            setStats(response.data);
        } catch {
            console.error('Erro ao buscar estatísticas');
        }
    }, [startDate, endDate]);

    const loadReports = useCallback(async () => {
        try {
            const params = new URLSearchParams({ limit: '50' });
            if (statusFilter) params.append('status', statusFilter);
            if (startDate) params.append('startDate', startDate);
            if (endDate) params.append('endDate', endDate);

            const response = await api.get(`/reports/department?${params.toString()}`);
            setReports(response.data.reports || response.data);
        } catch {
            console.error('Erro ao listar relatórios');
        }
    }, [statusFilter, startDate, endDate]);

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
        loadStats();
        loadDepartments();
        loadReports();
        /* eslint-enable react-hooks/set-state-in-effect */
    }, [loadStats, loadDepartments, loadReports]);

    return (
        <div className="flex flex-col gap-6 animate-in fade-in duration-500">
            <DashboardHero
                title="Inteligência Gestora"
                subtitle="Visão Panorâmica e Indicadores do seu Departamento"
                stats={stats}
                kpiConfigs={KPI_CONFIGS}
                statusFilter={statusFilter}
                onStatusFilterChange={setStatusFilter}
                filters={FILTER_OPTIONS}
                showDateFilters={true}
                startDate={startDate}
                endDate={endDate}
                onStartDateChange={setStartDate}
                onEndDateChange={setEndDate}
                onClearDates={() => { setStartDate(''); setEndDate(''); }}
                onExportClick={() => setIsExportModalOpen(true)}
            />

            <div className="space-y-8 mt-2">
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                    <div>
                        <h2 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight flex items-center gap-3">
                            <Activity className="w-6 h-6 text-indigo-500" />
                            Painel Operacional
                        </h2>
                        <p className="text-[12px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mt-1">Visão de Ocorrências Recentes e Mapa Tático</p>
                    </div>
                    <div className="flex items-center gap-3 w-full md:w-auto">
                        <Button
                            variant="secondary"
                            onClick={() => setIsMapVisible(!isMapVisible)}
                            className={`h-10 px-4 text-[11px] font-black uppercase tracking-widest transition-all ${isMapVisible ? 'bg-indigo-50 text-indigo-600 border-indigo-200 dark:bg-indigo-500/20 dark:text-indigo-400 dark:border-indigo-500/30' : ''}`}
                        >
                            <MapIcon className="w-4 h-4 mr-2" />
                            {isMapVisible ? 'Ocultar Mapa' : 'Ver Mapa Tático'}
                        </Button>
                    </div>
                </div>

                {isMapVisible && (
                    <div className="w-full h-[500px] rounded-[2.5rem] overflow-hidden border border-slate-200 dark:border-white/5 shadow-2xl relative shadow-indigo-500/5 animate-in slide-in-from-top-4 fade-in duration-500">
                        <MapView reports={reports} />
                    </div>
                )}

                {/* RECENT REPORTS CARD */}
                <Card variant="white" className="p-6 bg-white dark:bg-black/20 border-slate-200 dark:border-white/5 shadow-xl backdrop-blur-xl hover:border-indigo-500/30 transition-all col-span-1 md:col-span-2 lg:col-span-4">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-[0.2em] flex items-center gap-2">
                            <Activity className="w-4 h-4 text-indigo-500" />
                            Últimos Registros do Setor
                        </h3>
                        <div className="h-px flex-1 bg-slate-100 dark:bg-white/5 mx-4" />
                    </div>
                    <div className="flex flex-wrap items-center gap-6">
                        {reports.slice(0, 5).map((report) => (
                            <div key={report.id} className="flex items-center gap-3 group">
                                <div className="relative">
                                    <img
                                        src={report.user?.avatarUrl || `https://ui-avatars.com/api/?name=${report.user?.name}&background=6366f1&color=fff`}
                                        alt={report.user?.name}
                                        className="w-10 h-10 rounded-full border-2 border-white dark:border-slate-800 shadow-lg group-hover:scale-110 transition-transform object-cover"
                                    />
                                    <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-emerald-500 border-2 border-white dark:border-slate-800 rounded-full" />
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-[12px] font-black text-slate-900 dark:text-white uppercase tracking-tight">
                                        #{report.id.slice(-6).toUpperCase()}
                                    </span>
                                    <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">
                                        {new Date(report.createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                </div>
                            </div>
                        ))}
                        {reports.length === 0 && (
                            <div className="text-[11px] font-black uppercase text-slate-400 tracking-widest">Sem registros recentes.</div>
                        )}
                    </div>
                </Card>
            </div>

            <ExportReportsModal
                isOpen={isExportModalOpen}
                onClose={() => setIsExportModalOpen(false)}
                reports={reports}
                departments={departments}
            />
        </div>
    );
}
