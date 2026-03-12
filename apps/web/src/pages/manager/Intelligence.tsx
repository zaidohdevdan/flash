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
    Activity,
    ChevronUp,
    ChevronDown,
    Sparkles,
    Target,
    TrendingUp,
    Map,
    Folder,
    Loader2
} from 'lucide-react';
import {
    XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
    AreaChart, Area
} from 'recharts';
import { motion, AnimatePresence, type Variants } from 'framer-motion';
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
    { label: 'Novo', status: 'SENT', icon: AlertCircle, color: 'blue' as const },
    { label: 'Análise', status: 'IN_REVIEW', icon: Clock, color: 'purple' as const },
    { label: 'Trâmite', status: 'FORWARDED', icon: Folder, color: 'orange' as const },
    { label: 'Baixado', status: 'RESOLVED', icon: CheckCircle, color: 'emerald' as const },
];

const FILTER_OPTIONS = [
    { id: '', label: 'Cenário Geral' },
    { id: 'SENT', label: 'Novo' },
    { id: 'IN_REVIEW', label: 'Análise' },
    { id: 'FORWARDED', label: 'Trâmite' },
    { id: 'RESOLVED', label: 'Baixado' }
];

export function Intelligence() {
    const [stats, setStats] = useState<Stats[]>([]);
    const [reports, setReports] = useState<Report[]>([]);
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
            if (response.data) {
                setAnalyticsData(response.data);
                setTimeout(() => setIsAnalyticsReady(true), 400);
            }
        } catch (error) {
            console.error('Erro ao carregar analytics:', error);
        }
    }, [statusFilter, startDate, endDate]);

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

    const loadReportsForMap = useCallback(async () => {
        try {
            const params = new URLSearchParams({ limit: '100' });
            if (statusFilter) params.append('status', statusFilter);
            if (startDate) params.append('startDate', startDate);
            if (endDate) params.append('endDate', endDate);

            const response = await api.get(`/reports/department?${params.toString()}`);
            const data = response.data.reports || response.data;
            if (Array.isArray(data)) {
                setReports(data);
            }
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
                    title="Inteligência Gestora"
                    subtitle="Monitoramento Departamental e Performance do Setor."
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
                            Gestão Preditiva
                        </h2>
                        <p className="text-[12px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mt-1">Status de Entrega e Saúde do Departamento</p>
                    </div>
                    <div className="flex items-center gap-3 w-full md:w-auto">
                        <Button
                            variant="secondary"
                            onClick={() => setIsMapVisible(!isMapVisible)}
                            className={`h-11 px-5 text-[11px] font-black uppercase tracking-widest transition-all rounded-xl border-2 ${isMapVisible ? 'bg-indigo-50 text-indigo-600 border-indigo-200 dark:bg-indigo-500/20 dark:text-indigo-400 dark:border-indigo-500/30' : 'hover:scale-105 active:scale-95 shadow-lg shadow-black/5'}`}
                        >
                            <Map className="w-4 h-4 mr-2" />
                            {isMapVisible ? 'Ocultar Mapa' : 'Mapa do Setor'}
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
                            className="w-full rounded-[2.5rem] overflow-hidden border border-slate-200 dark:border-white/10 shadow-2xl relative shadow-indigo-500/5"
                        >
                            <MapView reports={reports} />
                        </motion.div>
                    )}
                </AnimatePresence>

                {analyticsData ? (
                    <>
                        {/* KPI PREDICTIONS */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            <Card variant="white" className="p-6 bg-white dark:bg-black/20 border-slate-200 dark:border-white/5 shadow-xl backdrop-blur-xl hover:border-indigo-500/30 transition-all">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="p-2.5 bg-indigo-50 dark:bg-indigo-500/10 rounded-xl text-indigo-600 dark:text-indigo-400">
                                        <Clock className="w-5 h-5" />
                                    </div>
                                    <Activity className="w-4 h-4 text-slate-400" />
                                </div>
                                <p className="text-[12px] font-black text-slate-500 dark:text-slate-500 uppercase tracking-widest">SLA Departamento</p>
                                <div className="mt-2">
                                    <h2 className="text-3xl font-black text-slate-900 dark:text-white">{analyticsData.efficiency?.avgResolutionTime || '0.0'}h</h2>
                                </div>
                                <p className="text-[11px] font-bold text-slate-400 uppercase mt-1">Média de {analyticsData.efficiency?.resolvedCount || 0} baixas</p>
                            </Card>

                            <Card variant="white" className="p-6 bg-white dark:bg-black/20 border-slate-200 dark:border-white/5 shadow-xl backdrop-blur-xl hover:border-purple-500/30 transition-all">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="p-2.5 bg-purple-50 dark:bg-purple-500/10 rounded-xl text-purple-600 dark:text-purple-400">
                                        <Target className="w-5 h-5" />
                                    </div>
                                    <Activity className="w-4 h-4 text-slate-400" />
                                </div>
                                <p className="text-[12px] font-black text-slate-500 dark:text-slate-500 uppercase tracking-widest">Tendência de Carga</p>
                                <div className="flex items-center gap-3 mt-2">
                                    <h2 className="text-3xl font-black text-slate-900 dark:text-white">+{analyticsData.predictions?.nextDayVolume || 0}</h2>
                                    <div className={`p-1 rounded-md ${analyticsData.predictions?.trend === 'UP' ? 'bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400' : 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'}`}>
                                        {analyticsData.predictions?.trend === 'UP' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                                    </div>
                                </div>
                                <p className="text-[11px] font-bold text-slate-400 uppercase mt-1">Projeção D+1</p>
                            </Card>

                            <Card variant="white" className="p-6 bg-white dark:bg-black/20 border-slate-200 dark:border-white/5 shadow-xl backdrop-blur-xl hover:border-rose-500/50 transition-all relative overflow-hidden group">
                                <div className="flex items-center justify-between mb-4 relative z-10">
                                    <div className="p-2.5 bg-rose-50 dark:bg-rose-500/10 rounded-xl text-rose-600 dark:text-rose-400 group-hover:scale-110 transition-transform">
                                        <AlertCircle className="w-5 h-5" />
                                    </div>
                                </div>
                                <p className="text-[12px] font-black text-slate-500 dark:text-slate-500 uppercase tracking-widest relative z-10">Gargalo Interno</p>
                                <h2 className="text-xl font-black text-rose-600 dark:text-rose-400 mt-2 truncate relative z-10">
                                    {analyticsData.bottlenecks?.avgForwardedTime || '0.0'}h
                                </h2>
                                <p className="text-[11px] font-bold text-rose-500 dark:text-rose-500 uppercase mt-1 relative z-10">
                                    Tempo em Trâmite
                                </p>
                                <div className="absolute inset-0 border-2 border-rose-500/20 dark:border-rose-500/30 rounded-3xl animate-pulse pointer-events-none" />
                            </Card>

                            <Card variant="white" className="p-6 bg-white dark:bg-black/20 border-slate-200 dark:border-white/5 shadow-xl backdrop-blur-xl hover:border-indigo-500/30 transition-all">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="p-2.5 bg-indigo-50 dark:bg-indigo-500/10 rounded-xl text-indigo-600 dark:text-indigo-400">
                                        <TrendingUp className="w-5 h-5" />
                                    </div>
                                </div>
                                <p className="text-[12px] font-black text-slate-500 dark:text-slate-500 uppercase tracking-widest">Efficiency Rate</p>
                                <div className="mt-2 text-3xl font-black text-slate-900 dark:text-white">
                                    {analyticsData.efficiency?.resolvedCount
                                        ? Math.round((analyticsData.efficiency.resolvedCount / (analyticsData.efficiency.resolvedCount + (analyticsData.bottlenecks?.impactedCount || 0))) * 100)
                                        : 0}%
                                </div>
                                <p className="text-[11px] font-bold text-slate-400 uppercase mt-1">Conversão de Protocolos</p>
                            </Card>

                            {/* RECENT REPORTS CARD */}
                            <Card variant="white" className="p-6 bg-white dark:bg-black/20 border-slate-200 dark:border-white/5 shadow-xl backdrop-blur-xl hover:border-indigo-500/30 transition-all col-span-1 md:col-span-2 lg:col-span-4">
                                <div className="flex items-center justify-between mb-6">
                                    <h3 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-[0.2em] flex items-center gap-2">
                                        <Activity className="w-4 h-4 text-indigo-500" />
                                        Últimos Recebimentos do Setor
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
                                                    {report.createdAt ? new Date(report.createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) : '--:--'}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </Card>
                        </div>

                        {/* Area Chart */}
                        <Card variant="white" className="p-8 bg-white dark:bg-black/20 border-slate-200 dark:border-white/10 shadow-2xl backdrop-blur-2xl min-h-[420px] relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-8 scale-150 rotate-12 opacity-[0.03] dark:opacity-[0.07] pointer-events-none">
                                <Activity className="w-32 h-32 text-indigo-600" />
                            </div>

                            <div className="mb-10 flex justify-between items-start relative z-10">
                                <div>
                                    <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight flex items-center gap-3">
                                        <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
                                        Volume Operacional
                                    </h3>
                                    <p className="text-slate-500 dark:text-slate-400 text-[11px] font-black uppercase tracking-[0.2em] mt-2">Fluxo de Protocolos no Tempo</p>
                                </div>
                            </div>

                            <div className="h-[280px] w-full relative z-10" style={{ minHeight: 280 }}>
                                {isAnalyticsReady && analyticsData.volume && (
                                    <ResponsiveContainer width="100%" height={280}>
                                        <AreaChart data={analyticsData.volume}>
                                            <defs>
                                                <linearGradient id="colorAreaManager" x1="0" y1="0" x2="0" y2="1">
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
                                                                        Ações<br />Registradas
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
                                                fill="url(#colorAreaManager)"
                                                filter="url(#glow)"
                                                animationDuration={2000}
                                            />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                )}
                            </div>
                        </Card>
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

