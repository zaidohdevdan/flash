import { useEffect, useState, useCallback, useMemo } from 'react';
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
    TrendingUp,
    Map,
    Zap,
    History as HistoryIcon,
    Target
} from 'lucide-react';
import {
    XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
    AreaChart, Area, BarChart, Bar, Legend, Cell, PieChart, Pie,
    RadialBarChart, RadialBar
} from 'recharts';
import { motion, AnimatePresence, type Variants } from 'framer-motion';
import { Card, Button } from '../../components/ui';
import { InsightsModal } from '../../components/domain/modals/InsightsModal';
import { Loader2 } from 'lucide-react';

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
    const [isChartsReady, setIsChartsReady] = useState(false);
    const [isInsightsOpen, setIsInsightsOpen] = useState(false);
    const [isMapVisible, setIsMapVisible] = useState(false);
    const [mapAnimationKey, setMapAnimationKey] = useState(0);

    const loadAnalytics = useCallback(async () => {
        try {
            const params = new URLSearchParams();
            if (statusFilter) params.append('status', statusFilter);
            if (startDate) params.append('startDate', startDate);
            if (endDate) params.append('endDate', endDate);

            setIsAnalyticsReady(false);
            setIsChartsReady(false);
            const response = await api.get(`/reports/analytics?${params.toString()}`);
            setAnalyticsData(response.data);
            setTimeout(() => {
                setIsAnalyticsReady(true);
                setTimeout(() => setIsChartsReady(true), 150);
            }, 300);
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
        loadStats();

        loadDepartments();

        loadAnalytics();
    }, [loadStats, loadDepartments, loadAnalytics]);

    useEffect(() => {
        loadReportsForMap();
    }, [loadReportsForMap]);

    const timelineData = useMemo(() => {
        const hourMap: Record<number, { total: number; sent: number; resolved: number }> = {};
        for (let h = 0; h < 24; h++) hourMap[h] = { total: 0, sent: 0, resolved: 0 };
        
        let validReports = 0;
        reports.forEach(r => {
            if (!r.createdAt) return;
            const h = new Date(r.createdAt).getHours();
            hourMap[h].total += 1;
            if (r.status === 'SENT') hourMap[h].sent += 1;
            if (r.status === 'RESOLVED') hourMap[h].resolved += 1;
            validReports++;
        });

        const maxVal = Math.max(...Object.values(hourMap).map(v => v.total), 1);
        const hours = Object.entries(hourMap).map(([h, v]) => ({ hour: Number(h), ...v }));
        const workHours = hours.filter(h => h.hour >= 6 && h.hour <= 22);
        const peakHour = workHours.reduce((a, b) => a.total >= b.total ? a : b, workHours[0] || { hour: 0, total: 0, sent: 0, resolved: 0 });

        // Optimize recent events sort
        const recentEvents = [...reports]
            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
            .slice(0, 8);

        return { hourMap, maxVal, hours, workHours, peakHour, recentEvents, hasData: validReports > 0 };
    }, [reports]);

    const healthScoreData = useMemo(() => {
        if (!analyticsData) return null;
        const total = (analyticsData.efficiency?.resolvedCount || 0) + (analyticsData.bottlenecks?.impactedCount || 0);
        const resolutionRate = total > 0 ? (analyticsData.efficiency?.resolvedCount || 0) / total : 0;
        const slaScore = Math.max(0, 1 - Math.min(1, parseFloat(analyticsData.efficiency?.avgResolutionTime || '0') / 48));
        const trendBonus = analyticsData.predictions?.trend === 'DOWN' ? 0.1 : 0;
        const healthScore = Math.min(100, Math.round((resolutionRate * 0.6 + slaScore * 0.3 + trendBonus) * 100));

        const scoreColor = healthScore >= 75 ? '#10b981' : healthScore >= 50 ? '#f59e0b' : '#f43f5e';
        const scoreLabel = healthScore >= 75 ? 'Operação Saudável' : healthScore >= 50 ? 'Atenção Necessária' : 'Estado Crítico';

        const gaugeData = [
            { name: 'Score', value: healthScore, fill: scoreColor },
            { name: 'Resolução', value: Math.round(resolutionRate * 100), fill: '#6366f1' },
            { name: 'SLA', value: Math.round(slaScore * 100), fill: '#8b5cf6' },
        ];

        return { healthScore, resolutionRate, slaScore, scoreColor, scoreLabel, gaugeData, trendBonus };
    }, [analyticsData]);

    const containerVariants: Variants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1,
                delayChildren: 0.2
            }
        }
    } as const;

    const itemVariants: Variants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                type: 'spring',
                stiffness: 100,
                damping: 15
            }
        }
    } as const;

    return (
        <motion.div
            className="flex flex-col gap-6"
            initial="hidden"
            animate="visible"
            variants={containerVariants}
        >
            <motion.div variants={itemVariants}>
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
            </motion.div>

            {/* ANALYTICS SECTION */}
            <motion.div variants={itemVariants} className="space-y-8 mt-2">
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                    <div>
                        <h2 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight flex items-center gap-3">
                            <Sparkles className="w-6 h-6 text-indigo-500 animate-[pulse_3s_infinite]" />
                            Inteligência Preditiva
                        </h2>
                        <p className="text-[12px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mt-1">Análise de Tendências e Desempenho Setorial</p>
                    </div>
                    <div className="flex items-center gap-3 w-full md:w-auto">
                        <Button
                            variant="secondary"
                            onClick={() => setIsMapVisible(!isMapVisible)}
                            className={`h-11 px-5 text-[11px] font-black uppercase tracking-widest transition-all rounded-xl border-2 ${isMapVisible ? 'bg-indigo-50 text-indigo-600 border-indigo-200 dark:bg-indigo-500/20 dark:text-indigo-400 dark:border-indigo-500/30' : 'hover:scale-105 active:scale-95 shadow-lg shadow-black/5'}`}
                        >
                            <Map className="w-4 h-4 mr-2" />
                            {isMapVisible ? 'Ocultar Mapa' : 'Ver Mapa Tático'}
                        </Button>
                        <Button
                            variant="primary"
                            onClick={() => setIsInsightsOpen(true)}
                            className="h-11 px-5 text-[11px] font-black uppercase tracking-[0.2em] shadow-xl shadow-indigo-500/20 rounded-xl hover:scale-105 active:scale-95 transition-all"
                        >
                            <Sparkles className="w-4 h-4 mr-2" />
                            AI Insights
                        </Button>
                    </div>
                </div>

                <AnimatePresence>
                    {isMapVisible && (
                        <motion.div
                            initial={{ opacity: 0, height: 0, y: -20 }}
                            animate={{ opacity: 1, height: 500, y: 0 }}
                            exit={{ opacity: 0, height: 0, y: -20 }}
                            transition={{ type: 'spring', stiffness: 200, damping: 25 }}
                            onAnimationComplete={(definition) => {
                                if (definition === 'animate' || (typeof definition === 'object' && 'opacity' in definition && (definition as Record<string, unknown>).opacity === 1)) {
                                    setMapAnimationKey(k => k + 1);
                                }
                            }}
                            className="w-full rounded-[2.5rem] overflow-hidden border border-slate-200 dark:border-white/10 shadow-2xl relative shadow-indigo-500/5"
                        >
                            <MapView key={mapAnimationKey} reports={reports} />
                        </motion.div>
                    )}
                </AnimatePresence>

                {analyticsData ? (
                    <>
                        {/* KPI PREDICTIONS */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            {/* SLA Resolution */}
                            <Card variant="white" className="relative p-6 bg-white dark:bg-black/40 backdrop-blur-xl border border-indigo-500/20 hover:border-indigo-500/40 rounded-[2rem] transition-all duration-500 shadow-[0_0_30px_-10px_rgba(99,102,241,0.2)] group overflow-hidden flex flex-col justify-between min-h-[160px]">
                                <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-indigo-500/10 to-transparent opacity-50 pointer-events-none transition-opacity duration-500 group-hover:opacity-100" />
                                <div className="flex items-center justify-between mb-4 relative z-10">
                                    <div className="p-3 bg-indigo-500/10 backdrop-blur-md border border-white/10 rounded-2xl text-indigo-600 dark:text-indigo-400 transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3">
                                        <Clock className="w-6 h-6" />
                                    </div>
                                    <Activity className="w-4 h-4 text-slate-400" />
                                </div>
                                <div className="relative z-10">
                                    <p className="text-[11px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-[0.2em] group-hover:text-slate-700 dark:group-hover:text-slate-300 transition-colors duration-500">SLA Resolução</p>
                                    <div className="mt-1 flex items-baseline gap-2">
                                        <h2 className="text-4xl font-black tracking-tighter text-slate-900 dark:text-white group-hover:scale-[1.02] origin-left transition-transform duration-500">{analyticsData.efficiency?.avgResolutionTime || '0.0'}h</h2>
                                    </div>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase mt-2 tracking-widest">Média de {analyticsData.efficiency?.resolvedCount || 0} casos</p>
                                </div>
                            </Card>

                            {/* Previsão Demanda */}
                            <Card variant="white" className="relative p-6 bg-white dark:bg-black/40 backdrop-blur-xl border border-violet-500/20 hover:border-violet-500/40 rounded-[2rem] transition-all duration-500 shadow-[0_0_30px_-10px_rgba(139,92,246,0.2)] group overflow-hidden flex flex-col justify-between min-h-[160px]">
                                <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-violet-500/10 to-transparent opacity-50 pointer-events-none transition-opacity duration-500 group-hover:opacity-100" />
                                <div className="flex items-center justify-between mb-4 relative z-10">
                                    <div className="p-3 bg-violet-500/10 backdrop-blur-md border border-white/10 rounded-2xl text-violet-600 dark:text-violet-400 transition-transform duration-500 group-hover:scale-110 group-hover:-rotate-3">
                                        <Target className="w-6 h-6" />
                                    </div>
                                    <Activity className="w-4 h-4 text-slate-400" />
                                </div>
                                <div className="relative z-10">
                                    <p className="text-[11px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-[0.2em] group-hover:text-slate-700 dark:group-hover:text-slate-300 transition-colors duration-500">Previsão Demanda</p>
                                    <div className="flex items-center gap-3 mt-1">
                                        <h2 className="text-4xl font-black tracking-tighter text-slate-900 dark:text-white group-hover:scale-[1.02] origin-left transition-transform duration-500">+{analyticsData.predictions?.nextDayVolume || 0}</h2>
                                        <div className={`p-1.5 rounded-xl border ${analyticsData.predictions?.trend === 'UP' ? 'bg-rose-500/10 border-rose-500/20 text-rose-500' : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500'}`}>
                                            {analyticsData.predictions?.trend === 'UP' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                                        </div>
                                    </div>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase mt-2 tracking-widest">Estimativa D+1</p>
                                </div>
                            </Card>

                            {/* Gargalo Setorial */}
                            <Card variant="white" className="relative p-6 bg-white dark:bg-black/40 backdrop-blur-xl border border-rose-500/40 hover:border-rose-500/60 rounded-[2rem] transition-all duration-500 shadow-[0_0_40px_-10px_rgba(244,63,94,0.4)] group overflow-hidden flex flex-col justify-between min-h-[160px]">
                                <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-rose-500/15 to-transparent opacity-50 pointer-events-none transition-opacity duration-500 group-hover:opacity-100" />
                                {analyticsData.bottlenecks?.criticalSector && (
                                    <>
                                        <div className="absolute inset-0 rounded-[2rem] border-[3px] border-rose-500/30 animate-[pulse_2s_infinite] pointer-events-none" />
                                        <div className="absolute top-0 right-0 w-24 h-24 bg-rose-500/10 dark:bg-rose-500/20 rounded-bl-[100px] flex items-start justify-end p-4 pointer-events-none">
                                            <div className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
                                        </div>
                                    </>
                                )}
                                <div className="flex items-center justify-between mb-4 relative z-10">
                                    <div className="p-3 bg-rose-500/20 backdrop-blur-md border border-white/10 rounded-2xl text-rose-600 dark:text-rose-400 transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3">
                                        <AlertCircle className="w-6 h-6" />
                                    </div>
                                </div>
                                <div className="relative z-10">
                                    <div className="flex items-center gap-2">
                                        <div className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
                                        <p className="text-[11px] font-black text-rose-500 uppercase tracking-[0.2em]">Gargalo Setorial</p>
                                    </div>
                                    <h2 className="text-2xl font-black tracking-tight text-rose-600 dark:text-rose-400 mt-1 truncate group-hover:scale-[1.02] origin-left transition-transform duration-500">
                                        {analyticsData.bottlenecks?.criticalSector?.name || 'Operacional'}
                                    </h2>
                                    <p className="text-[10px] font-bold text-rose-500/80 uppercase mt-2 tracking-widest">
                                        Lentidão: {analyticsData.bottlenecks?.criticalSector?.avgHours || 0}h média
                                    </p>
                                </div>
                            </Card>

                            {/* Health Score */}
                            <Card variant="white" className="relative p-6 bg-white dark:bg-black/40 backdrop-blur-xl border border-emerald-500/20 hover:border-emerald-500/40 rounded-[2rem] transition-all duration-500 shadow-[0_0_30px_-10px_rgba(16,185,129,0.2)] group overflow-hidden flex flex-col justify-between min-h-[160px]">
                                <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-emerald-500/10 to-transparent opacity-50 pointer-events-none transition-opacity duration-500 group-hover:opacity-100" />
                                <div className="flex items-center justify-between mb-4 relative z-10">
                                    <div className="p-3 bg-emerald-500/10 backdrop-blur-md border border-white/10 rounded-2xl text-emerald-600 dark:text-emerald-400 transition-transform duration-500 group-hover:scale-110 group-hover:-rotate-3">
                                        <TrendingUp className="w-6 h-6" />
                                    </div>
                                </div>
                                <div className="relative z-10">
                                    <p className="text-[11px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-[0.2em] group-hover:text-slate-700 dark:group-hover:text-slate-300 transition-colors duration-500">Health Score</p>
                                    <div className="mt-1">
                                        <h2 className="text-4xl font-black tracking-tighter text-slate-900 dark:text-white group-hover:scale-[1.02] origin-left transition-transform duration-500">
                                            {healthScoreData ? Math.round(healthScoreData.resolutionRate * 100) : 0}%
                                        </h2>
                                    </div>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase mt-2 tracking-widest">Taxa de resolução</p>
                                </div>
                            </Card>

                            {/* RECENT REPORTS CARD */}
                            <Card variant="white" className="relative p-7 bg-white dark:bg-black/40 backdrop-blur-xl border border-blue-500/20 hover:border-blue-500/40 rounded-[2rem] transition-all duration-500 shadow-[0_0_30px_-10px_rgba(59,130,246,0.15)] col-span-1 md:col-span-2 lg:col-span-4 overflow-hidden group">
                                <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-blue-500/5 to-transparent opacity-50 pointer-events-none transition-opacity duration-500 group-hover:opacity-100" />
                                <div className="relative z-10">
                                    <div className="flex items-center justify-between mb-8">
                                        <h3 className="text-[11px] font-black text-slate-900 dark:text-white uppercase tracking-[0.25em] flex items-center gap-3">
                                            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-500">
                                                <Activity className="w-4 h-4" />
                                            </div>
                                            Últimos Recebimentos
                                        </h3>
                                        <div className="h-px flex-1 bg-gradient-to-r from-transparent via-slate-200 dark:via-white/10 to-transparent mx-6" />
                                    </div>
                                    <div className="flex flex-wrap items-center gap-8">
                                        {timelineData.recentEvents.slice(0, 5).map((report: Report, idx: number) => (
                                            <div key={report.id} className="flex items-center gap-4 group/item cursor-pointer" style={{ animationDelay: `${idx * 100}ms` }}>
                                                <div className="relative">
                                                    <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-white/5 p-0.5 border border-slate-200 dark:border-white/10 overflow-hidden shadow-lg group-hover/item:shadow-blue-500/20 group-hover/item:border-blue-500/50 group-hover/item:scale-110 transition-all duration-500">
                                                        <img
                                                            src={report.user?.avatarUrl || `https://ui-avatars.com/api/?name=${report.user?.name}&background=3b82f6&color=fff`}
                                                            alt={report.user?.name}
                                                            className="w-full h-full object-cover rounded-[14px]"
                                                        />
                                                    </div>
                                                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 border-2 border-white dark:border-[#0f172a] rounded-full shadow-sm" />
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-[13px] font-black text-slate-900 dark:text-white uppercase tracking-tight group-hover/item:text-blue-500 transition-colors">
                                                        #{report.id.slice(-6).toUpperCase()}
                                                    </span>
                                                    <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-[0.2em] mt-0.5">
                                                        {report.createdAt ? new Date(report.createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) : '--:--'}
                                                    </span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </Card>
                        </div>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                        {/* Area Chart */}
                        <Card variant="white" className="lg:col-span-8 relative p-8 bg-white dark:bg-black/40 backdrop-blur-xl border border-indigo-500/20 hover:border-indigo-500/40 rounded-[2.5rem] transition-all duration-500 shadow-[0_0_40px_-10px_rgba(99,102,241,0.15)] min-h-[420px] overflow-hidden group">
                            <div className="absolute top-0 left-0 right-0 h-48 bg-gradient-to-b from-indigo-500/10 to-transparent opacity-50 pointer-events-none transition-opacity duration-500 group-hover:opacity-100" />
                            <div className="absolute top-0 right-0 p-8 scale-150 rotate-12 opacity-[0.03] dark:opacity-[0.07] pointer-events-none transition-transform duration-700 group-hover:scale-[1.7] group-hover:rotate-[15deg]">
                                <Activity className="w-48 h-48 text-indigo-600" />
                            </div>

                            <div className="mb-10 flex justify-between items-start relative z-10">
                                <div>
                                    <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight flex items-center gap-3">
                                        <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
                                        Volume & Tendência
                                    </h3>
                                    <p className="text-slate-500 dark:text-slate-400 text-[11px] font-black uppercase tracking-[0.2em] mt-2">Fluxo Operacional de Protocolos no Tempo</p>
                                </div>
                                <div className="flex gap-1.5">
                                    <div className="w-1.5 h-1.5 rounded-full bg-indigo-500/40" />
                                    <div className="w-1.5 h-1.5 rounded-full bg-indigo-500/20" />
                                    <div className="w-1.5 h-1.5 rounded-full bg-indigo-500/10" />
                                </div>
                            </div>

                            <div className="h-[280px] w-full relative z-10" style={{ minHeight: 280 }}>
                                {isAnalyticsReady && analyticsData.volume && (
                                    <ResponsiveContainer width="100%" height={280}>
                                        <AreaChart data={analyticsData.volume}>
                                            <defs>
                                                <linearGradient id="colorAreaIntra" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
                                                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                                                </linearGradient>
                                                <filter id="glow">
                                                    <feGaussianBlur stdDeviation="3" result="coloredBlur" />
                                                    <feMerge>
                                                        <feMergeNode in="coloredBlur" />
                                                        <feMergeNode in="SourceGraphic" />
                                                    </feMerge>
                                                </filter>
                                            </defs>
                                            <CartesianGrid strokeDasharray="6 6" stroke="#64748b" opacity={0.1} vertical={false} />
                                            <XAxis
                                                dataKey="date"
                                                stroke="#94a3b8"
                                                fontSize={10}
                                                fontWeight="900"
                                                tickFormatter={(date) => date ? new Date(date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }) : ''}
                                                axisLine={false}
                                                tickLine={false}
                                                dy={15}
                                            />
                                            <YAxis
                                                stroke="#94a3b8"
                                                fontSize={10}
                                                fontWeight="900"
                                                axisLine={false}
                                                tickLine={false}
                                                dx={-10}
                                            />
                                            <RechartsTooltip
                                                cursor={{ stroke: '#6366f1', strokeWidth: 2, strokeDasharray: '4 4' }}
                                                content={({ active, payload, label }) => {
                                                    if (active && payload && payload.length) {
                                                        return (
                                                            <div className="bg-slate-900/95 backdrop-blur-xl border border-white/10 p-4 rounded-2xl shadow-2xl animate-in zoom-in-95 duration-200">
                                                                <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-1.5">
                                                                    {label ? new Date(label).toLocaleDateString('pt-BR', { day: 'numeric', month: 'long' }) : ''}
                                                                </p>
                                                                <div className="flex items-center gap-3">
                                                                    <div className="text-2xl font-black text-white italic tracking-tighter">
                                                                        {payload[0].value}
                                                                    </div>
                                                                    <div className="text-[9px] font-black text-slate-500 uppercase tracking-widest leading-none">
                                                                        Protocolos<br />Recebidos
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        );
                                                    }
                                                    return null;
                                                }}
                                            />
                                            <Area
                                                type="monotone"
                                                dataKey="count"
                                                stroke="#6366f1"
                                                strokeWidth={4}
                                                fillOpacity={1}
                                                fill="url(#colorAreaIntra)"
                                                filter="url(#glow)"
                                                animationDuration={2000}
                                            />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                )}
                            </div>
                        </Card>

                        {/* Sector Performance */}
                        <Card variant="white" className="lg:col-span-4 relative p-8 bg-white dark:bg-black/40 backdrop-blur-xl border border-violet-500/20 hover:border-violet-500/40 rounded-[2.5rem] transition-all duration-500 shadow-[0_0_40px_-10px_rgba(139,92,246,0.15)] overflow-hidden group flex flex-col">
                            <div className="absolute top-0 left-0 right-0 h-48 bg-gradient-to-b from-violet-500/10 to-transparent opacity-50 pointer-events-none transition-opacity duration-500 group-hover:opacity-100" />
                            <div className="mb-8 relative z-10">
                                <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight flex items-center gap-3">
                                    <div className="p-2.5 bg-violet-500/10 backdrop-blur-md border border-white/10 rounded-xl text-violet-600 dark:text-violet-400 transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3">
                                        <PieIcon className="w-5 h-5" />
                                    </div>
                                    Eficiência por Setor
                                </h3>
                            </div>

                            <div className="space-y-6 overflow-y-auto max-h-[300px] pr-2 custom-scrollbar relative z-10">
                                {analyticsData.sectorPerformance?.map((sector) => (
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

                    {/* SECOND ROW: BarChart + SLA Diagnostics */}
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                        {/* Bar Chart - Resolved vs Forwarded per Sector */}
                        <Card variant="white" className="lg:col-span-7 relative p-8 bg-white dark:bg-black/40 backdrop-blur-xl border border-blue-500/20 hover:border-blue-500/40 rounded-[2.5rem] transition-all duration-500 shadow-[0_0_40px_-10px_rgba(59,130,246,0.15)] min-h-[360px] overflow-hidden group">
                            <div className="absolute top-0 left-0 right-0 h-48 bg-gradient-to-b from-blue-500/10 to-transparent opacity-50 pointer-events-none transition-opacity duration-500 group-hover:opacity-100" />
                            <div className="absolute top-0 right-0 p-8 scale-150 rotate-12 opacity-[0.03] dark:opacity-[0.07] pointer-events-none transition-transform duration-700 group-hover:scale-[1.7] group-hover:rotate-[15deg]">
                                <TrendingUp className="w-48 h-48 text-blue-600" />
                            </div>
                            <div className="mb-8 relative z-10">
                                <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight flex items-center gap-3">
                                    <div className="p-2.5 bg-blue-500/10 backdrop-blur-md border border-white/10 rounded-xl text-blue-600 dark:text-blue-400 transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3">
                                        <TrendingUp className="w-5 h-5" />
                                    </div>
                                    Resolução por Setor
                                </h3>
                                <p className="text-slate-500 dark:text-slate-400 text-[11px] font-black uppercase tracking-[0.2em] mt-2">Resolvidos vs Encaminhados por Unidade</p>
                            </div>
                            <div style={{ minHeight: 280 }} className="relative z-10">
                                {isChartsReady && analyticsData.sectorPerformance && analyticsData.sectorPerformance.length > 0 && (
                                    <ResponsiveContainer width="100%" height={280}>
                                        <BarChart data={analyticsData.sectorPerformance.slice(0, 6)} barCategoryGap="30%" barGap={4}>
                                            <defs>
                                                <linearGradient id="resolvedGrad" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.9} />
                                                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0.4} />
                                                </linearGradient>
                                                <linearGradient id="forwardedGrad" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.9} />
                                                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.4} />
                                                </linearGradient>
                                            </defs>
                                            <CartesianGrid strokeDasharray="6 6" stroke="#64748b" opacity={0.08} vertical={false} />
                                            <XAxis
                                                dataKey="name"
                                                stroke="#94a3b8"
                                                fontSize={9}
                                                fontWeight="900"
                                                axisLine={false}
                                                tickLine={false}
                                                dy={10}
                                                tickFormatter={(v: string) => v.length > 8 ? v.slice(0, 8) + '…' : v}
                                            />
                                            <YAxis stroke="#94a3b8" fontSize={10} fontWeight="900" axisLine={false} tickLine={false} dx={-8} />
                                            <RechartsTooltip
                                                cursor={{ fill: 'rgba(99,102,241,0.05)' }}
                                                content={({ active, payload, label }) => {
                                                    if (active && payload && payload.length) {
                                                        return (
                                                            <div className="bg-slate-900/95 backdrop-blur-xl border border-white/10 p-4 rounded-2xl shadow-2xl">
                                                                <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-2">{label}</p>
                                                                {payload.map((p) => (
                                                                    <div key={String(p.dataKey)} className="flex items-center gap-2 text-[11px] font-bold">
                                                                        <div className="w-2 h-2 rounded-full" style={{ background: p.color }} />
                                                                        <span className="text-slate-400 uppercase">{p.dataKey === 'resolved' ? 'Resolvidos' : 'Encaminhados'}</span>
                                                                        <span className="text-white font-black ml-auto pl-4">{p.value}</span>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        );
                                                    }
                                                    return null;
                                                }}
                                            />
                                            <Legend
                                                iconType="circle"
                                                iconSize={8}
                                                formatter={(value: string) => (
                                                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">
                                                        {value === 'resolved' ? 'Resolvidos' : 'Encaminhados'}
                                                    </span>
                                                )}
                                            />
                                            <Bar dataKey="resolved" fill="url(#resolvedGrad)" radius={[6, 6, 0, 0]} animationDuration={1500} />
                                            <Bar dataKey="forwarded" fill="url(#forwardedGrad)" radius={[6, 6, 0, 0]} animationDuration={1800} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                )}
                            </div>
                        </Card>

                        {/* SLA & Bottleneck Panel */}
                        <Card variant="white" className="lg:col-span-5 relative p-8 bg-white dark:bg-black/40 backdrop-blur-xl border border-rose-500/20 hover:border-rose-500/40 rounded-[2.5rem] transition-all duration-500 shadow-[0_0_40px_-10px_rgba(244,63,94,0.15)] overflow-hidden group flex flex-col gap-6">
                            <div className="absolute top-0 left-0 right-0 h-48 bg-gradient-to-b from-rose-500/10 to-transparent opacity-50 pointer-events-none transition-opacity duration-500 group-hover:opacity-100" />
                            <div className="relative z-10">
                                <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight flex items-center gap-3">
                                    <div className="p-2.5 bg-rose-500/10 backdrop-blur-md border border-white/10 rounded-xl text-rose-600 dark:text-rose-400 transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3">
                                        <AlertCircle className="w-5 h-5" />
                                    </div>
                                    Diagnóstico de SLA
                                </h3>
                                <p className="text-slate-500 dark:text-slate-400 text-[11px] font-black uppercase tracking-[0.2em] mt-2">Gargalos e Tempos Médios por Status</p>
                            </div>
                            <div className="space-y-5 flex-1 relative z-10">
                                {[{
                                    label: 'SLA Médio de Resolução',
                                    value: `${analyticsData.efficiency?.avgResolutionTime || '0.0'}h`,
                                    sub: `${analyticsData.efficiency?.resolvedCount || 0} casos resolvidos`,
                                    color: 'bg-indigo-500',
                                    pct: Math.min(100, ((analyticsData.efficiency?.resolvedCount || 0) / Math.max((analyticsData.efficiency?.resolvedCount || 0) + (analyticsData.bottlenecks?.impactedCount || 1), 1)) * 100)
                                }, {
                                    label: 'Tempo Médio Encaminhamento',
                                    value: `${analyticsData.bottlenecks?.avgForwardedTime || '0.0'}h`,
                                    sub: `${analyticsData.bottlenecks?.impactedCount || 0} casos impactados`,
                                    color: 'bg-amber-500',
                                    pct: Math.min(100, ((analyticsData.bottlenecks?.impactedCount || 0) / Math.max((analyticsData.efficiency?.resolvedCount || 0) + (analyticsData.bottlenecks?.impactedCount || 1), 1)) * 100)
                                }, {
                                    label: 'Setor Crítico — Lentidão',
                                    value: `${analyticsData.bottlenecks?.criticalSector?.avgHours || 0}h`,
                                    sub: analyticsData.bottlenecks?.criticalSector?.name || 'Nenhum identificado',
                                    color: 'bg-rose-500',
                                    pct: Math.min(100, (analyticsData.bottlenecks?.criticalSector?.avgHours || 0) / 48 * 100)
                                }].map((item) => (
                                    <div key={item.label} className="group">
                                        <div className="flex justify-between items-end mb-2">
                                            <div>
                                                <p className="text-[11px] font-black text-slate-600 dark:text-slate-300 uppercase tracking-widest">{item.label}</p>
                                                <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 mt-0.5">{item.sub}</p>
                                            </div>
                                            <span className="text-2xl font-black text-slate-900 dark:text-white tracking-tighter">{item.value}</span>
                                        </div>
                                        <div className="h-2 w-full bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden">
                                            <div className={`h-full ${item.color} rounded-full transition-all duration-1000 group-hover:brightness-110`} style={{ width: `${item.pct}%` }} />
                                        </div>
                                    </div>
                                ))}

                                {isChartsReady && analyticsData.sectorPerformance && analyticsData.sectorPerformance.length > 0 && (
                                    <div className="mt-4 pt-4 border-t border-slate-100 dark:border-white/5">
                                        <p className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-3">Distribuição Setorial</p>
                                        <div style={{ minHeight: 120 }}>
                                            <ResponsiveContainer width="100%" height={120}>
                                                <PieChart>
                                                    <Pie
                                                        data={analyticsData.sectorPerformance.slice(0, 5).map(s => ({ name: s.name, value: s.resolved + s.forwarded }))}
                                                        cx="50%"
                                                        cy="50%"
                                                        innerRadius={30}
                                                        outerRadius={50}
                                                        paddingAngle={3}
                                                        dataKey="value"
                                                        animationDuration={1500}
                                                    >
                                                        {analyticsData.sectorPerformance.slice(0, 5).map((_, index) => {
                                                            const COLORS = ['#6366f1', '#f59e0b', '#10b981', '#f43f5e', '#8b5cf6'];
                                                            return <Cell key={index} fill={COLORS[index % COLORS.length]} />;
                                                        })}
                                                    </Pie>
                                                    <RechartsTooltip
                                                        content={({ active, payload }) => {
                                                            if (active && payload && payload.length) {
                                                                return (
                                                                    <div className="bg-slate-900/95 border border-white/10 p-3 rounded-xl text-[10px] font-black text-white">
                                                                        <p className="text-indigo-400">{payload[0].name}</p>
                                                                        <p>{payload[0].value} protocolos</p>
                                                                    </div>
                                                                );
                                                            }
                                                            return null;
                                                        }}
                                                    />
                                                </PieChart>
                                            </ResponsiveContainer>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </Card>
                    </div>

                    {/* THIRD ROW: Health Score Gauge + Operational Timeline */}
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

                        {/* Health Score Gauge */}
                        <Card variant="white" className="lg:col-span-5 relative p-8 bg-white dark:bg-black/40 backdrop-blur-xl border border-emerald-500/20 hover:border-emerald-500/40 rounded-[2.5rem] transition-all duration-500 shadow-[0_0_40px_-10px_rgba(16,185,129,0.15)] min-h-[360px] overflow-hidden flex flex-col group">
                            <div className="absolute top-0 left-0 right-0 h-48 bg-gradient-to-b from-emerald-500/10 to-transparent opacity-50 pointer-events-none transition-opacity duration-500 group-hover:opacity-100" />
                            <div className="absolute -top-10 -right-10 w-40 h-40 bg-emerald-500/5 dark:bg-emerald-500/10 rounded-full blur-2xl pointer-events-none transition-transform duration-700 group-hover:scale-150" />
                            
                            <div className="mb-6 relative z-10">
                                <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight flex items-center gap-3">
                                    <div className="p-2.5 bg-emerald-500/10 backdrop-blur-md border border-white/10 rounded-xl text-emerald-600 dark:text-emerald-400 transition-transform duration-500 group-hover:scale-110 group-hover:-rotate-3">
                                        <TrendingUp className="w-5 h-5" />
                                    </div>
                                    Score de Saúde
                                </h3>
                                <p className="text-slate-500 dark:text-slate-400 text-[11px] font-black uppercase tracking-[0.2em] mt-2">Índice Operacional Composto</p>
                            </div>

                            {isAnalyticsReady && healthScoreData && (() => {
                                const { healthScore, resolutionRate, slaScore, scoreColor, scoreLabel, gaugeData } = healthScoreData;

                                return (
                                    <div className="flex-1 flex flex-col items-center justify-center gap-6">
                                        <div className="relative" style={{ minHeight: 200, minWidth: 220 }}>
                                            {isChartsReady && (
                                                <ResponsiveContainer width={220} height={200}>
                                                    <RadialBarChart
                                                        cx="50%"
                                                        cy="50%"
                                                        innerRadius={35}
                                                        outerRadius={90}
                                                        data={gaugeData}
                                                        startAngle={90}
                                                        endAngle={-270}
                                                    >
                                                        <RadialBar
                                                            dataKey="value"
                                                            cornerRadius={8}
                                                            background={{ fill: 'rgba(100,116,139,0.08)' }}
                                                            animationDuration={1800}
                                                        />
                                                        <RechartsTooltip
                                                            content={({ active, payload }) => {
                                                                if (active && payload?.length) {
                                                                    return (
                                                                        <div className="bg-slate-900/95 border border-white/10 p-3 rounded-xl text-[10px] font-black">
                                                                            <p className="text-indigo-400 uppercase tracking-widest">{payload[0].payload.name}</p>
                                                                            <p className="text-white text-lg">{payload[0].value}%</p>
                                                                        </div>
                                                                    );
                                                                }
                                                                return null;
                                                            }}
                                                        />
                                                    </RadialBarChart>
                                                </ResponsiveContainer>
                                            )}
                                            {/* Center Score Number */}
                                            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                                <div className="text-center">
                                                    <p className="text-4xl font-black tracking-tighter" style={{ color: scoreColor }}>{healthScore}</p>
                                                    <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">pontos</p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="text-center">
                                            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border" style={{ borderColor: scoreColor + '40', background: scoreColor + '15' }}>
                                                <div className="w-2 h-2 rounded-full animate-pulse" style={{ background: scoreColor }} />
                                                <span className="text-[11px] font-black uppercase tracking-widest" style={{ color: scoreColor }}>{scoreLabel}</span>
                                            </div>
                                        </div>

                                        <div className="w-full grid grid-cols-3 gap-3">
                                            {[{ label: 'Resolução', value: `${Math.round(resolutionRate * 100)}%`, color: '#6366f1' },
                                              { label: 'SLA', value: `${Math.round(slaScore * 100)}%`, color: '#8b5cf6' },
                                              { label: 'Tendência', value: analyticsData.predictions?.trend === 'DOWN' ? '📉 Queda' : '📈 Alta', color: analyticsData.predictions?.trend === 'DOWN' ? '#10b981' : '#f59e0b' }
                                            ].map(m => (
                                                <div key={m.label} className="text-center p-3 rounded-2xl bg-slate-50 dark:bg-white/5">
                                                    <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">{m.label}</p>
                                                    <p className="text-sm font-black mt-1" style={{ color: m.color }}>{m.value}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                );
                            })()}
                        </Card>

                        {/* Operational Timeline */}
                        <Card variant="white" className="lg:col-span-7 relative p-8 bg-white dark:bg-black/40 backdrop-blur-xl border border-amber-500/20 hover:border-amber-500/40 rounded-[2.5rem] transition-all duration-500 shadow-[0_0_40px_-10px_rgba(245,158,11,0.15)] min-h-[360px] overflow-hidden flex flex-col group">
                            <div className="absolute top-0 left-0 right-0 h-48 bg-gradient-to-b from-amber-500/10 to-transparent opacity-50 pointer-events-none transition-opacity duration-500 group-hover:opacity-100" />
                            <div className="absolute top-0 right-0 p-8 scale-150 rotate-12 opacity-[0.03] dark:opacity-[0.07] pointer-events-none transition-transform duration-700 group-hover:scale-[1.7] group-hover:rotate-[15deg]">
                                <Clock className="w-48 h-48 text-amber-600" />
                            </div>

                            <div className="mb-6 relative z-10">
                                <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight flex items-center gap-3">
                                    <div className="p-2.5 bg-amber-500/10 backdrop-blur-md border border-white/10 rounded-xl text-amber-600 dark:text-amber-400 transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3">
                                        <HistoryIcon className="w-5 h-5" />
                                    </div>
                                    Linha do Tempo Operacional
                                </h3>
                                <p className="text-slate-500 dark:text-slate-400 text-[11px] font-black uppercase tracking-[0.2em] mt-2">Atividade por Hora do Dia</p>
                            </div>

                            {timelineData.hasData && (() => {
                                const { maxVal, workHours, peakHour } = timelineData;

                                return (
                                    <div className="flex-1 flex flex-col gap-6">
                                        {/* Peak Banner */}
                                        {peakHour.total > 0 && (
                                            <div className="flex items-center gap-3 p-4 rounded-2xl bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20">
                                                <Zap className="w-5 h-5 text-amber-500 flex-shrink-0" />
                                                <div>
                                                    <p className="text-[11px] font-black text-amber-700 dark:text-amber-400 uppercase tracking-widest">Horário de Pico</p>
                                                    <p className="text-[10px] font-bold text-amber-600 dark:text-amber-500">{String(peakHour.hour).padStart(2, '0')}:00h — {peakHour.total} protocolos registrados</p>
                                                </div>
                                            </div>
                                        )}

                                        {/* Hourly Heatmap Bar Grid */}
                                        <div className="space-y-2">
                                            <div className="flex items-end gap-1 h-[120px]">
                                                {workHours.map(h => {
                                                    const pct = h.total / maxVal;
                                                    const isPeak = h.hour === peakHour.hour;
                                                    return (
                                                        <div key={h.hour} className="flex-1 flex flex-col items-center gap-1 group cursor-pointer" title={`${String(h.hour).padStart(2, '0')}h: ${h.total} protocolos`}>
                                                            <div className="w-full relative flex flex-col justify-end" style={{ height: '100px' }}>
                                                                {h.sent > 0 && (
                                                                    <div
                                                                        className="w-full rounded-t-sm transition-all duration-700 group-hover:brightness-125"
                                                                        style={{ height: `${(h.sent / maxVal) * 100}%`, background: '#f43f5e88' }}
                                                                    />
                                                                )}
                                                                <div
                                                                    className="w-full rounded-t-sm transition-all duration-700 group-hover:brightness-125"
                                                                    style={{
                                                                        height: `${(h.resolved / maxVal) * 100}%`,
                                                                        background: isPeak ? '#f59e0b' : pct > 0.6 ? '#6366f1' : pct > 0.3 ? '#8b5cf6aa' : '#6366f122'
                                                                    }}
                                                                />
                                                            </div>
                                                            <span className="text-[7px] font-black text-slate-400 dark:text-slate-500 uppercase">{String(h.hour).padStart(2,'0')}</span>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>

                                        {/* Recent Events Feed */}
                                        <div className="flex-1">
                                            <p className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-3">Eventos Recentes</p>
                                            <div className="space-y-2 overflow-y-auto max-h-[120px] custom-scrollbar pr-1">
                                                {[...reports]
                                                    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                                                    .slice(0, 8)
                                                    .map(r => {
                                                        const statusColor = r.status === 'RESOLVED' ? 'bg-emerald-500' : r.status === 'SENT' ? 'bg-rose-500' : r.status === 'FORWARDED' ? 'bg-amber-500' : 'bg-indigo-500';
                                                        const statusLabel = r.status === 'RESOLVED' ? 'Baixado' : r.status === 'SENT' ? 'Alerta' : r.status === 'FORWARDED' ? 'Encaminhado' : 'Em Análise';
                                                        const time = new Date(r.createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
                                                        return (
                                                            <div key={r.id} className="flex items-center gap-3 py-2 border-b border-slate-100 dark:border-white/5 last:border-0 group">
                                                                <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${statusColor}`} />
                                                                <p className="text-[11px] font-bold text-slate-700 dark:text-slate-300 truncate flex-1">
                                                                    {r.comment?.slice(0, 50) || 'Protocolo registrado'}{(r.comment?.length || 0) > 50 ? '…' : ''}
                                                                </p>
                                                                <span className={`text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full text-white flex-shrink-0 ${statusColor}`}>{statusLabel}</span>
                                                                <span className="text-[9px] font-bold text-slate-400 flex-shrink-0 tabular-nums">{time}</span>
                                                            </div>
                                                        );
                                                    })}
                                                {reports.length === 0 && (
                                                    <p className="text-[11px] font-bold text-slate-400 dark:text-slate-500 text-center py-4">Nenhum evento no período.</p>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })()}
                        </Card>
                    </div>
                    </>
                ) : (
                    <div className="flex items-center justify-center p-12 bg-white/5 rounded-[2.5rem] border border-dashed border-white/10">
                        <Loader2 className="w-6 h-6 text-indigo-500 animate-spin mr-3" />
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Sincronizando Inteligência...</span>
                    </div>
                )}
            </motion.div>

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
        </motion.div>
    );
}
