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
    PieChart as PieIcon,
    ChevronUp,
    ChevronDown,
    Sparkles,
    Target,
    TrendingUp,
    Map
} from 'lucide-react';
import {
    XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
    AreaChart, Area
} from 'recharts';
import { Card, Button } from '../../components/ui';
import { InsightsModal } from '../../components/domain/modals/InsightsModal';

interface AnalyticsData {
    efficiency: { avgResolutionTime: string; resolvedCount: number; };
    bottlenecks: { avgForwardedTime: string; impactedCount: number; criticalSector: { name: string; avgHours: number; forwarded: number; } | null; };
    predictions: { nextDayVolume: number; trend: 'UP' | 'DOWN'; };
    volume: { date: string; count: number }[];
    sectorPerformance: { name: string; resolved: number; forwarded: number; avgHours: number }[];
}

const KPI_CONFIGS = [
    { label: 'Alerta', status: 'SENT', icon: AlertCircle, color: 'blue' as const },
    { label: 'Ativos', status: 'IN_REVIEW', icon: Clock, color: 'purple' as const },
    { label: 'Em Trânsito', status: 'FORWARDED', icon: Folder, color: 'orange' as const },
    { label: 'Baixados', status: 'RESOLVED', icon: CheckCircle, color: 'emerald' as const },
];

const FILTER_OPTIONS = [
    { id: '', label: 'Cenário Geral' },
    { id: 'SENT', label: 'Alerta' },
    { id: 'IN_REVIEW', label: 'Ativos' },
    { id: 'FORWARDED', label: 'Em Trânsito' },
    { id: 'RESOLVED', label: 'Baixados' }
];

export function Intelligence() {
    const [stats, setStats] = useState<Stats[]>([]);
    const [reports, setReports] = useState<Report[]>([]); // For the map
    const [statusFilter, setStatusFilter] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    const [isExportModalOpen, setIsExportModalOpen] = useState(false);
    const [departments, setDepartments] = useState<Department[]>([]);

    const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
    const [isAnalyticsReady, setIsAnalyticsReady] = useState(false);
    const [isInsightsOpen, setIsInsightsOpen] = useState(false);
    const [isMapVisible, setIsMapVisible] = useState(false);

    const loadAnalytics = useCallback(async () => {
        try {
            const params = new URLSearchParams();
            if (statusFilter) params.append('status', statusFilter);
            if (startDate) params.append('startDate', startDate);
            if (endDate) params.append('endDate', endDate);

            const response = await api.get(`/reports/analytics?${params.toString()}`);
            setAnalyticsData(response.data);
            setTimeout(() => setIsAnalyticsReady(true), 300);
        } catch (error) {
            console.error('Erro ao carregar analytics:', error);
        }
    }, [statusFilter, startDate, endDate]);

    const loadStats = useCallback(async () => {
        try {
            const params = new URLSearchParams();
            if (startDate) params.append('startDate', startDate);
            if (endDate) params.append('endDate', endDate);

            const response = await api.get(`/reports/stats?${params.toString()}`);
            setStats(response.data);
        } catch {
            console.error('Erro ao buscar estatísticas');
        }
    }, [startDate, endDate]);

    const loadReportsForMap = useCallback(async () => {
        try {
            // Load map reports - could be unpaginated or high limit to show map nodes
            const params = new URLSearchParams({ limit: '100' });
            if (statusFilter) params.append('status', statusFilter);
            if (startDate) params.append('startDate', startDate);
            if (endDate) params.append('endDate', endDate);

            const response = await api.get(`/reports?${params.toString()}`);
            setReports(response.data.reports || response.data);
        } catch {
            console.error('Erro ao listar relatórios para o mapa');
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
        // eslint-disable-next-line react-hooks/set-state-in-effect
        loadStats();

        loadDepartments();

        loadAnalytics();
    }, [loadStats, loadDepartments, loadAnalytics]);

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        loadReportsForMap();
    }, [loadReportsForMap]);

    return (
        <div className="flex flex-col gap-6 animate-in fade-in duration-500">
            <DashboardHero
                title="Centro de Inteligência"
                subtitle="Visão Panorâmica e Indicadores Essenciais da Operação."
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

            {/* ANALYTICS SECTION */}
            {analyticsData && (
                <div className="space-y-8 mt-2">
                    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                        <div>
                            <h2 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight flex items-center gap-3">
                                <Sparkles className="w-6 h-6 text-indigo-500" />
                                Inteligência Preditiva
                            </h2>
                            <p className="text-[12px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mt-1">Análise de Tendências e Desempenho Setorial</p>
                        </div>
                        <div className="flex items-center gap-3 w-full md:w-auto">
                            <Button
                                variant="secondary"
                                onClick={() => setIsMapVisible(!isMapVisible)}
                                className={`h-10 px-4 text-[11px] font-black uppercase tracking-widest transition-all ${isMapVisible ? 'bg-indigo-50 text-indigo-600 border-indigo-200 dark:bg-indigo-500/20 dark:text-indigo-400 dark:border-indigo-500/30' : ''}`}
                            >
                                <Map className="w-4 h-4 mr-2" />
                                {isMapVisible ? 'Ocultar Mapa' : 'Ver Mapa Tático'}
                            </Button>
                            <Button
                                variant="primary"
                                onClick={() => setIsInsightsOpen(true)}
                                className="h-10 px-4 text-[11px] font-black uppercase tracking-widest shadow-lg shadow-indigo-500/20"
                            >
                                <Sparkles className="w-4 h-4 mr-2" />
                                AI Insights
                            </Button>
                        </div>
                    </div>

                    {isMapVisible && (
                        <div className="w-full h-[500px] rounded-[2.5rem] overflow-hidden border border-slate-200 dark:border-white/5 shadow-2xl relative shadow-indigo-500/5 animate-in slide-in-from-top-4 fade-in duration-500">
                            <MapView reports={reports} />
                        </div>
                    )}

                    {/* KPI PREDICTIONS */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <Card variant="white" className="p-6 bg-white dark:bg-black/20 border-slate-200 dark:border-white/5 shadow-xl backdrop-blur-xl hover:border-indigo-500/30 transition-all">
                            <div className="flex items-center justify-between mb-4">
                                <div className="p-2.5 bg-indigo-50 dark:bg-indigo-500/10 rounded-xl text-indigo-600 dark:text-indigo-400">
                                    <Clock className="w-5 h-5" />
                                </div>
                                <Activity className="w-4 h-4 text-slate-400" />
                            </div>
                            <p className="text-[12px] font-black text-slate-500 dark:text-slate-500 uppercase tracking-widest">SLA Resolução</p>
                            <div className="mt-2">
                                <h2 className="text-3xl font-black text-slate-900 dark:text-white">{analyticsData.efficiency.avgResolutionTime}h</h2>
                            </div>
                            <p className="text-[11px] font-bold text-slate-400 uppercase mt-1">Média de {analyticsData.efficiency.resolvedCount} casos</p>
                        </Card>

                        <Card variant="white" className="p-6 bg-white dark:bg-black/20 border-slate-200 dark:border-white/5 shadow-xl backdrop-blur-xl hover:border-purple-500/30 transition-all">
                            <div className="flex items-center justify-between mb-4">
                                <div className="p-2.5 bg-purple-50 dark:bg-purple-500/10 rounded-xl text-purple-600 dark:text-purple-400">
                                    <Target className="w-5 h-5" />
                                </div>
                                <Activity className="w-4 h-4 text-slate-400" />
                            </div>
                            <p className="text-[12px] font-black text-slate-500 dark:text-slate-500 uppercase tracking-widest">Previsão Demanda</p>
                            <div className="flex items-center gap-3 mt-2">
                                <h2 className="text-3xl font-black text-slate-900 dark:text-white">+{analyticsData.predictions.nextDayVolume}</h2>
                                <div className={`p-1 rounded-md ${analyticsData.predictions.trend === 'UP' ? 'bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400' : 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'}`}>
                                    {analyticsData.predictions.trend === 'UP' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                                </div>
                            </div>
                            <p className="text-[11px] font-bold text-slate-400 uppercase mt-1">Estimativa D+1</p>
                        </Card>

                        <Card variant="white" className="p-6 bg-white dark:bg-black/20 border-slate-200 dark:border-white/5 shadow-xl backdrop-blur-xl hover:border-rose-500/50 transition-all relative overflow-hidden group">
                            {analyticsData.bottlenecks.criticalSector && (
                                <div className="absolute top-0 right-0 w-16 h-16 bg-rose-500/10 dark:bg-rose-500/20 rounded-bl-[100px] flex items-start justify-end p-3 animate-pulse">
                                    <div className="w-2 h-2 rounded-full bg-rose-500" />
                                </div>
                            )}
                            <div className="flex items-center justify-between mb-4 relative z-10">
                                <div className="p-2.5 bg-rose-50 dark:bg-rose-500/10 rounded-xl text-rose-600 dark:text-rose-400 group-hover:scale-110 transition-transform">
                                    <AlertCircle className="w-5 h-5" />
                                </div>
                            </div>
                            <p className="text-[12px] font-black text-slate-500 dark:text-slate-500 uppercase tracking-widest relative z-10">Gargalo Setorial</p>
                            <h2 className="text-xl font-black text-rose-600 dark:text-rose-400 mt-2 truncate relative z-10">
                                {analyticsData.bottlenecks.criticalSector?.name || 'Operacional'}
                            </h2>
                            <p className="text-[11px] font-bold text-rose-500 dark:text-rose-500 uppercase mt-1 relative z-10">
                                Lentidão: {analyticsData.bottlenecks.criticalSector?.avgHours || 0}h média
                            </p>
                            {analyticsData.bottlenecks.criticalSector && (
                                <div className="absolute inset-0 border-2 border-rose-500/20 dark:border-rose-500/30 rounded-3xl animate-pulse pointer-events-none" />
                            )}
                        </Card>

                        <Card variant="white" className="p-6 bg-white dark:bg-black/20 border-slate-200 dark:border-white/5 shadow-xl backdrop-blur-xl hover:border-indigo-500/30 transition-all">
                            <div className="flex items-center justify-between mb-4">
                                <div className="p-2.5 bg-indigo-50 dark:bg-indigo-500/10 rounded-xl text-indigo-600 dark:text-indigo-400">
                                    <TrendingUp className="w-5 h-5" />
                                </div>
                            </div>
                            <p className="text-[12px] font-black text-slate-500 dark:text-slate-500 uppercase tracking-widest">Health Score</p>
                            <div className="mt-2 text-3xl font-black text-slate-900 dark:text-white">
                                {analyticsData.efficiency.resolvedCount > 0
                                    ? Math.round((analyticsData.efficiency.resolvedCount / (analyticsData.efficiency.resolvedCount + analyticsData.bottlenecks.impactedCount)) * 100)
                                    : 0}%
                            </div>
                            <p className="text-[11px] font-bold text-slate-400 uppercase mt-1">Taxa de resolução</p>
                        </Card>

                        {/* RECENT REPORTS CARD */}
                        <Card variant="white" className="p-6 bg-white dark:bg-black/20 border-slate-200 dark:border-white/5 shadow-xl backdrop-blur-xl hover:border-indigo-500/30 transition-all col-span-1 md:col-span-2 lg:col-span-4">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-[0.2em] flex items-center gap-2">
                                    <Activity className="w-4 h-4 text-indigo-500" />
                                    Últimos Recebimentos
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
                            </div>
                        </Card>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                        {/* Area Chart */}
                        <Card variant="white" className="lg:col-span-8 p-6 bg-white dark:bg-black/20 border-slate-200 dark:border-white/5 shadow-xl backdrop-blur-xl min-h-[400px]">
                            <div className="mb-8">
                                <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight flex items-center gap-2">
                                    <Activity className="w-5 h-5 text-indigo-500" />
                                    Volume & Tendência
                                </h3>
                                <p className="text-slate-500 dark:text-slate-400 text-[12px] font-bold uppercase tracking-widest mt-1">Fluxo de reportes (30 dias)</p>
                            </div>

                            <div className="h-[280px] w-full">
                                {isAnalyticsReady && (
                                    <ResponsiveContainer width="100%" height="100%">
                                        <AreaChart data={analyticsData.volume}>
                                            <defs>
                                                <linearGradient id="colorAreaIntra" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                                                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                                                </linearGradient>
                                            </defs>
                                            <CartesianGrid strokeDasharray="3 3" stroke="#cbd5e1" opacity={0.2} vertical={false} />
                                            <XAxis
                                                dataKey="date"
                                                stroke="#64748b"
                                                fontSize={9}
                                                fontWeight="900"
                                                tickFormatter={(date) => new Date(date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}
                                                axisLine={false}
                                                tickLine={false}
                                                dy={10}
                                            />
                                            <YAxis stroke="#64748b" fontSize={9} fontWeight="900" axisLine={false} tickLine={false} />
                                            <RechartsTooltip
                                                contentStyle={{ backgroundColor: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', padding: '12px' }}
                                                itemStyle={{ color: '#fff', fontSize: '12px', fontWeight: 'bold' }}
                                                labelStyle={{ color: '#cbd5e1', fontSize: '10px', marginBottom: '4px', fontWeight: 'bold' }}
                                            />
                                            <Area type="monotone" dataKey="count" name="Reportes" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorAreaIntra)" />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                )}
                            </div>
                        </Card>

                        {/* Sector Performance */}
                        <Card variant="white" className="lg:col-span-4 p-6 bg-white dark:bg-black/20 border-slate-200 dark:border-white/5 shadow-xl backdrop-blur-xl">
                            <div className="mb-6">
                                <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight flex items-center gap-2">
                                    <PieIcon className="w-5 h-5 text-purple-500" />
                                    Eficiência por Setor
                                </h3>
                            </div>

                            <div className="space-y-6 overflow-y-auto max-h-[300px] pr-2 custom-scrollbar">
                                {analyticsData.sectorPerformance.map((sector) => (
                                    <div key={sector.name} className="group">
                                        <div className="flex justify-between items-end mb-2">
                                            <div>
                                                <p className="text-[12px] font-black text-slate-800 dark:text-slate-200 uppercase tracking-widest">{sector.name}</p>
                                                <p className="text-[11px] font-bold text-slate-500 dark:text-slate-500 mt-0.5">{sector.avgHours}h avg time</p>
                                            </div>
                                            <div className="text-right">
                                                <span className="text-[11px] font-black text-indigo-600 dark:text-indigo-400">{sector.resolved}</span>
                                                <span className="text-[10px] font-bold text-slate-400 ml-1">/{sector.resolved + sector.forwarded}</span>
                                            </div>
                                        </div>
                                        <div className="h-1.5 w-full bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden flex">
                                            <div
                                                className="h-full bg-indigo-500 rounded-full transition-all duration-1000"
                                                style={{ width: `${(sector.resolved / (sector.resolved + sector.forwarded || 1)) * 100}%` }}
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </Card>
                    </div>
                </div>
            )}

            <ExportReportsModal
                isOpen={isExportModalOpen}
                onClose={() => setIsExportModalOpen(false)}
                reports={reports}
                departments={departments}
            />
            <InsightsModal
                isOpen={isInsightsOpen}
                onClose={() => setIsInsightsOpen(false)}
                data={analyticsData}
            />
        </div>
    );
}
