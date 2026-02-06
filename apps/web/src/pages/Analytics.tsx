
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import {
    XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
    PieChart, Pie, Cell, AreaChart, Area
} from 'recharts';
import {
    ArrowLeft, TrendingUp, AlertTriangle, Clock,
    Download, Zap, Target, PieChart as PieIcon,
    ChevronUp, ChevronDown, Activity, Sparkles
} from 'lucide-react';
import { GlassCard, Button, Badge } from '../components/ui';
import { InsightsModal } from '../components/domain/modals/InsightsModal';

interface AnalyticsData {
    efficiency: {
        avgResolutionTime: string;
        resolvedCount: number;
    };
    bottlenecks: {
        avgForwardedTime: string;
        impactedCount: number;
        criticalSector: {
            name: string;
            avgHours: number;
            forwarded: number;
        } | null;
    };
    predictions: {
        nextDayVolume: number;
        trend: 'UP' | 'DOWN';
    };
    volume: { date: string; count: number }[];
    sectorPerformance: { name: string; resolved: number; forwarded: number; avgHours: number }[];
}

export function Analytics() {
    const navigate = useNavigate();
    const [data, setData] = useState<AnalyticsData | null>(null);
    const [loading, setLoading] = useState(true);
    const [isReady, setIsReady] = useState(false);
    const [isInsightsOpen, setIsInsightsOpen] = useState(false);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const response = await api.get('/reports/analytics');
            setData(response.data);
            setTimeout(() => setIsReady(true), 300);
        } catch (error) {
            console.error('Erro ao carregar analytics:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#020617] flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-blue-600/20 border-t-blue-600 rounded-full animate-spin" />
                    <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest animate-pulse">Processando Big Data...</p>
                </div>
            </div>
        );
    }

    if (!data) return null;

    const statusParams = data.sectorPerformance.reduce((acc, curr) => {
        acc[0].value += curr.resolved;
        acc[1].value += curr.forwarded;
        return acc;
    }, [
        { name: 'Resolvidos', value: 0, color: '#10b981' },
        { name: 'Em Setor', value: 0, color: '#8b5cf6' }
    ]);

    return (
        <div className="min-h-screen bg-[#020617] text-slate-200 p-6 md:p-8 font-sans selection:bg-blue-500/30">
            {/* Background Decorations */}
            <div className="fixed top-0 right-0 w-[800px] h-[800px] bg-blue-600/10 rounded-full blur-[160px] -mr-96 -mt-96 pointer-events-none" />
            <div className="fixed bottom-0 left-0 w-[600px] h-[600px] bg-indigo-600/10 rounded-full blur-[140px] -ml-40 -mb-40 pointer-events-none" />

            <div className="max-w-7xl mx-auto mb-12 relative z-10">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div className="flex items-center gap-5">
                        <button
                            onClick={() => navigate(-1)}
                            className="p-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl transition-all active:scale-95 group print:hidden"
                            aria-label="Voltar"
                            title="Voltar para página anterior"
                        >
                            <ArrowLeft className="w-5 h-5 text-blue-400 group-hover:-translate-x-1 transition-transform" />
                        </button>
                        <div>
                            <div className="flex items-center gap-3">
                                <h1 className="text-3xl font-black text-slate-100 uppercase tracking-tight">Intelligence Hub</h1>
                                <Badge status="IN_REVIEW" label="Live AI Data" className="!bg-blue-500/10 !text-blue-300 !border-blue-500/20" />
                            </div>
                            <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1">Deep Analytics & Predictive Modeling</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 w-full md:w-auto">
                        <Button
                            variant="primary"
                            className="flex-1 md:flex-none !rounded-2xl !py-3 print:hidden shadow-lg shadow-blue-500/20"
                            onClick={() => setIsInsightsOpen(true)}
                        >
                            <Sparkles className="w-4 h-4 mr-2" />
                            AI Insights
                        </Button>
                        <Button
                            variant="glass"
                            className="flex-1 md:flex-none !bg-white/5 hover:!bg-white/10 !border-white/10 !rounded-2xl !py-3 print:hidden"
                            onClick={() => window.print()}
                        >
                            <Download className="w-4 h-4 mr-2" />
                            PDF
                        </Button>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto space-y-8 relative z-10">

                {/* KPI & Predictions Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <GlassCard variant="dark" className="p-6 border-white/5 !rounded-[2rem] bg-slate-950/40 backdrop-blur-3xl group hover:border-blue-500/30 transition-colors">
                        <div className="flex items-center justify-between mb-4">
                            <div className="p-3 bg-blue-500/10 rounded-2xl border border-blue-500/20">
                                <Clock className="w-5 h-5 text-blue-400" />
                            </div>
                            <Activity className="w-4 h-4 text-slate-400 group-hover:text-blue-400 transition-colors" />
                        </div>
                        <p className="text-slate-300 text-[10px] font-black uppercase tracking-widest">SLA de Resolução</p>
                        <div className="flex items-baseline gap-2 mt-1">
                            <h2 className="text-4xl font-black text-white">{data.efficiency.avgResolutionTime}h</h2>
                        </div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase mt-2">Média de {data.efficiency.resolvedCount} casos</p>
                    </GlassCard>

                    <GlassCard variant="dark" className="p-6 border-white/5 !rounded-[2rem] bg-slate-950/40 backdrop-blur-3xl group hover:border-purple-500/30 transition-colors">
                        <div className="flex items-center justify-between mb-4">
                            <div className="p-3 bg-purple-500/10 rounded-2xl border border-purple-500/20">
                                <Zap className="w-5 h-5 text-purple-400" />
                            </div>
                            <Target className="w-4 h-4 text-slate-400 group-hover:text-purple-400 transition-colors" />
                        </div>
                        <p className="text-slate-300 text-[10px] font-black uppercase tracking-widest">Previsão Demanda</p>
                        <div className="flex items-center gap-3 mt-1">
                            <h2 className="text-4xl font-black text-white">+{data.predictions.nextDayVolume}</h2>
                            <div className={`p-1 rounded-lg ${data.predictions.trend === 'UP' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
                                {data.predictions.trend === 'UP' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                            </div>
                        </div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase mt-2">Estimativa para amanhã</p>
                    </GlassCard>

                    <GlassCard variant="dark" className="p-6 border-white/5 !rounded-[2rem] bg-slate-950/40 backdrop-blur-3xl group hover:border-rose-500/30 transition-colors">
                        <div className="flex items-center justify-between mb-4">
                            <div className="p-3 bg-rose-500/10 rounded-2xl border border-rose-500/20">
                                <AlertTriangle className="w-5 h-5 text-rose-400" />
                            </div>
                            <div className="flex -space-x-2">
                                <div className="w-6 h-6 rounded-full border-2 border-slate-900 bg-rose-500/40 flex items-center justify-center">
                                    <span className="text-[8px] font-black text-white">!</span>
                                </div>
                            </div>
                        </div>
                        <p className="text-slate-300 text-[10px] font-black uppercase tracking-widest">Setor Crítico</p>
                        <h2 className="text-xl font-black text-white mt-1 truncate">
                            {data.bottlenecks.criticalSector?.name || '---'}
                        </h2>
                        <p className="text-[10px] font-bold text-rose-400 uppercase mt-2">
                            Lentidão: {data.bottlenecks.criticalSector?.avgHours || 0}h média
                        </p>
                    </GlassCard>

                    <GlassCard variant="dark" className="p-6 border-white/5 !rounded-[2rem] bg-slate-950/40 backdrop-blur-3xl group hover:border-emerald-500/30 transition-colors">
                        <div className="flex items-center justify-between mb-4">
                            <div className="p-3 bg-emerald-500/10 rounded-2xl border border-emerald-500/20">
                                <TrendingUp className="w-5 h-5 text-emerald-400" />
                            </div>
                        </div>
                        <p className="text-slate-300 text-[10px] font-black uppercase tracking-widest">Health Score</p>
                        <div className="flex items-baseline gap-2 mt-1">
                            <h2 className="text-4xl font-black text-white">
                                {data.efficiency.resolvedCount > 0
                                    ? Math.round((data.efficiency.resolvedCount / (data.efficiency.resolvedCount + data.bottlenecks.impactedCount)) * 100)
                                    : 0}%
                            </h2>
                        </div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase mt-2">Taxa de resolução global</p>
                    </GlassCard>
                </div>

                {/* Main Charts */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

                    {/* Trend Chart - Large */}
                    <GlassCard variant="dark" className="lg:col-span-8 p-8 border-white/5 !rounded-[2.5rem] bg-slate-950/40 backdrop-blur-3xl min-h-[450px]">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-10">
                            <div>
                                <h3 className="text-xl font-black text-white uppercase tracking-tight flex items-center gap-3">
                                    <Activity className="w-5 h-5 text-blue-400" />
                                    Volume & Tendência
                                </h3>
                                <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mt-1">Fluxo de reportes dos últimos 30 dias</p>
                            </div>
                            <div className="flex bg-white/5 p-1 rounded-xl border border-white/10">
                                <button className="px-4 py-1.5 rounded-lg bg-blue-600 text-[10px] font-black uppercase tracking-widest text-white shadow-lg shadow-blue-500/20">30D</button>
                                <button className="px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-white transition-colors">90D</button>
                            </div>
                        </div>

                        <div className="h-[300px] w-full">
                            {isReady && (
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={data.volume}>
                                        <defs>
                                            <linearGradient id="colorArea" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4} />
                                                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                                        <XAxis
                                            dataKey="date"
                                            stroke="#94a3b8"
                                            fontSize={10}
                                            fontWeight="900"
                                            tickFormatter={(date) => new Date(date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}
                                            axisLine={false}
                                            tickLine={false}
                                            dy={10}
                                        />
                                        <YAxis stroke="#94a3b8" fontSize={10} fontWeight="900" axisLine={false} tickLine={false} />
                                        <RechartsTooltip
                                            contentStyle={{
                                                backgroundColor: '#0f172a',
                                                border: '1px solid #ffffff10',
                                                borderRadius: '16px',
                                                padding: '12px',
                                                boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)'
                                            }}
                                            itemStyle={{ color: '#e2e8f0', fontSize: '12px', fontWeight: 'bold', textTransform: 'uppercase' }}
                                            labelStyle={{ color: '#94a3b8', fontSize: '10px', marginBottom: '4px', fontWeight: 'bold' }}
                                        />
                                        <Area
                                            type="monotone"
                                            dataKey="count"
                                            name="Reportes"
                                            stroke="#3b82f6"
                                            strokeWidth={4}
                                            fillOpacity={1}
                                            fill="url(#colorArea)"
                                            isAnimationActive={true}
                                            animationDuration={1500}
                                        />
                                    </AreaChart>
                                </ResponsiveContainer>
                            )}
                        </div>
                    </GlassCard>

                    {/* Sector Performance - Vertical Bar */}
                    <GlassCard variant="dark" className="lg:col-span-4 p-8 border-white/5 !rounded-[2.5rem] bg-slate-950/40 backdrop-blur-3xl">
                        <div className="mb-10">
                            <h3 className="text-xl font-black text-white uppercase tracking-tight flex items-center gap-3">
                                <PieIcon className="w-5 h-5 text-purple-400" />
                                Por Setor
                            </h3>
                            <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mt-1">Eficiência departamental</p>
                        </div>

                        <div className="space-y-6 overflow-y-auto max-h-[350px] pr-2 custom-scrollbar">
                            {data.sectorPerformance.map((sector) => (
                                <div key={sector.name} className="group">
                                    <div className="flex justify-between items-end mb-2">
                                        <div>
                                            <p className="text-[10px] font-black text-slate-200 uppercase tracking-widest">{sector.name}</p>
                                            <p className="text-[9px] font-bold text-slate-400 uppercase mt-0.5">{sector.avgHours}h avg response</p>
                                        </div>
                                        <div className="text-right">
                                            <span className="text-xs font-black text-white">{sector.resolved}</span>
                                            <span className="text-[10px] font-bold text-slate-400 ml-1">/{sector.resolved + sector.forwarded}</span>
                                        </div>
                                    </div>
                                    <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden flex">
                                        <div
                                            className="h-full bg-emerald-500 rounded-full transition-all duration-1000 group-hover:bg-emerald-400"
                                            style={{ width: `${(sector.resolved / (sector.resolved + sector.forwarded || 1)) * 100}%` }}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </GlassCard>

                    {/* Global Analysis - Status Distribution */}
                    <GlassCard variant="dark" className="lg:col-span-12 p-8 border-white/5 !rounded-[2.5rem] bg-slate-900/40 backdrop-blur-3xl">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                            <div>
                                <h3 className="text-2xl font-black text-white uppercase tracking-tight mb-4 flex items-center gap-4">
                                    <PieIcon className="w-6 h-6 text-emerald-400" />
                                    Arquitetura de Status
                                </h3>
                                <p className="text-slate-300 text-sm leading-relaxed mb-8 font-medium">
                                    Análise estrutural da distribuição de demandas. O gráfico indica a relação entre resoluções e pendências atuais em todos os setores integrados.
                                </p>
                                <div className="grid grid-cols-2 gap-4">
                                    {statusParams.map(p => (
                                        <div key={p.name} className="p-4 bg-white/5 border border-white/10 rounded-2xl">
                                            <div className="flex items-center gap-2 mb-1">
                                                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: p.color }} />
                                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{p.name}</span>
                                            </div>
                                            <p className="text-2xl font-black text-white">{p.value}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="h-[300px] w-full flex items-center justify-center relative">
                                <div className="absolute inset-0 bg-blue-500/5 rounded-full blur-3xl" />
                                {isReady && (
                                    <ResponsiveContainer width="100%" height={300}>
                                        <PieChart>
                                            <Pie
                                                data={statusParams}
                                                cx="50%"
                                                cy="50%"
                                                innerRadius={80}
                                                outerRadius={120}
                                                paddingAngle={8}
                                                dataKey="value"
                                                stroke="none"
                                            >
                                                {statusParams.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={entry.color} style={{ filter: 'drop-shadow(0px 0px 8px rgba(0,0,0,0.3))' }} />
                                                ))}
                                            </Pie>
                                            <RechartsTooltip
                                                contentStyle={{
                                                    backgroundColor: '#0f172a',
                                                    border: '1px solid #ffffff10',
                                                    borderRadius: '16px',
                                                    color: '#e2e8f0'
                                                }}
                                            />
                                        </PieChart>
                                    </ResponsiveContainer>
                                )}
                                <div className="absolute flex flex-col items-center justify-center">
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Total</span>
                                    <span className="text-4xl font-black text-white">{statusParams.reduce((a, b) => a + b.value, 0)}</span>
                                </div>
                            </div>
                        </div>
                    </GlassCard>
                </div>
            </div>

            <InsightsModal
                isOpen={isInsightsOpen}
                onClose={() => setIsInsightsOpen(false)}
                data={data}
            />


        </div>
    );
}
