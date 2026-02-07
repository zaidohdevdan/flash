import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../services/api';
import {
    XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
    PieChart, Pie, Cell, AreaChart, Area
} from 'recharts';
import {
    TrendingUp, AlertTriangle, Clock,
    Download, Zap, Target, PieChart as PieIcon,
    ChevronUp, ChevronDown, Activity, Sparkles
} from 'lucide-react';
import { Button, Badge, Card } from '../components/ui';
import { DashboardLayout } from '../layouts/DashboardLayout';
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

    const { user, signOut } = useAuth();
    // ... (keep state variables)

    // ... (keep useEffect and loading logic)

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[var(--bg-primary)]">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-[var(--accent-primary)]/20 border-t-[var(--accent-primary)] rounded-full animate-spin" />
                    <p className="text-xs font-bold text-[var(--accent-primary)] uppercase tracking-widest animate-pulse">Carregando Analytics...</p>
                </div>
            </div>
        );
    }

    if (!data) return null;

    const statusParams = data.sectorPerformance.reduce((acc: { name: string; value: number; color: string }[], curr) => {
        acc[0].value += curr.resolved;
        acc[1].value += curr.forwarded;
        return acc;
    }, [
        { name: 'Resolvidos', value: 0, color: '#10b981' },
        { name: 'Em Setor', value: 0, color: '#8b5cf6' }
    ]);

    return (
        <DashboardLayout
            user={{ name: user?.name, avatarUrl: user?.avatarUrl, role: user?.role }}
            onLogout={signOut}
        >
            <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div>
                        <div className="flex items-center gap-3">
                            <h1 className="text-2xl font-bold text-[var(--text-primary)] uppercase tracking-tight">Intelligence Hub</h1>
                            <Badge status="IN_REVIEW" label="AI Powered" className="bg-blue-50 text-blue-600 border-blue-100" />
                        </div>
                        <p className="text-xs text-[var(--text-tertiary)] font-bold uppercase tracking-widest mt-1">Análise de Dados e Predições</p>
                    </div>

                    <div className="flex items-center gap-3 w-full md:w-auto">
                        <Button
                            variant="primary"
                            className="flex-1 md:flex-none"
                            onClick={() => setIsInsightsOpen(true)}
                        >
                            <Sparkles className="w-4 h-4 mr-2" />
                            AI Insights
                        </Button>
                        <Button
                            variant="secondary"
                            className="flex-1 md:flex-none"
                            onClick={() => window.print()}
                        >
                            <Download className="w-4 h-4 mr-2" />
                            PDF
                        </Button>
                    </div>
                </div>

                {/* KPI & Predictions Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <Card variant="white" className="p-6 border-[var(--border-subtle)] hover:border-blue-200 transition-colors">
                        <div className="flex items-center justify-between mb-4">
                            <div className="p-2.5 bg-blue-50 rounded-xl text-blue-600">
                                <Clock className="w-5 h-5" />
                            </div>
                            <Activity className="w-4 h-4 text-[var(--text-tertiary)]" />
                        </div>
                        <p className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wide">SLA de Resolução</p>
                        <div className="flex items-baseline gap-2 mt-2">
                            <h2 className="text-3xl font-black text-[var(--text-primary)]">{data.efficiency.avgResolutionTime}h</h2>
                        </div>
                        <p className="text-[10px] font-bold text-[var(--text-tertiary)] uppercase mt-1">Média de {data.efficiency.resolvedCount} casos</p>
                    </Card>

                    <Card variant="white" className="p-6 border-[var(--border-subtle)] hover:border-purple-200 transition-colors">
                        <div className="flex items-center justify-between mb-4">
                            <div className="p-2.5 bg-purple-50 rounded-xl text-purple-600">
                                <Zap className="w-5 h-5" />
                            </div>
                            <Target className="w-4 h-4 text-[var(--text-tertiary)]" />
                        </div>
                        <p className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wide">Previsão Demanda</p>
                        <div className="flex items-center gap-3 mt-2">
                            <h2 className="text-3xl font-black text-[var(--text-primary)]">+{data.predictions.nextDayVolume}</h2>
                            <div className={`p-1 rounded-md ${data.predictions.trend === 'UP' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                                {data.predictions.trend === 'UP' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                            </div>
                        </div>
                        <p className="text-[10px] font-bold text-[var(--text-tertiary)] uppercase mt-1">Estimativa para amanhã</p>
                    </Card>

                    <Card variant="white" className="p-6 border-[var(--border-subtle)] hover:border-rose-200 transition-colors">
                        <div className="flex items-center justify-between mb-4">
                            <div className="p-2.5 bg-rose-50 rounded-xl text-rose-600">
                                <AlertTriangle className="w-5 h-5" />
                            </div>
                        </div>
                        <p className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wide">Setor Crítico</p>
                        <h2 className="text-xl font-black text-[var(--text-primary)] mt-2 truncate">
                            {data.bottlenecks.criticalSector?.name || '---'}
                        </h2>
                        <p className="text-[10px] font-bold text-rose-600 uppercase mt-1">
                            Lentidão: {data.bottlenecks.criticalSector?.avgHours || 0}h média
                        </p>
                    </Card>

                    <Card variant="white" className="p-6 border-[var(--border-subtle)] hover:border-emerald-200 transition-colors">
                        <div className="flex items-center justify-between mb-4">
                            <div className="p-2.5 bg-emerald-50 rounded-xl text-emerald-600">
                                <TrendingUp className="w-5 h-5" />
                            </div>
                        </div>
                        <p className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wide">Health Score</p>
                        <div className="flex items-baseline gap-2 mt-2">
                            <h2 className="text-3xl font-black text-[var(--text-primary)]">
                                {data.efficiency.resolvedCount > 0
                                    ? Math.round((data.efficiency.resolvedCount / (data.efficiency.resolvedCount + data.bottlenecks.impactedCount)) * 100)
                                    : 0}%
                            </h2>
                        </div>
                        <p className="text-[10px] font-bold text-[var(--text-tertiary)] uppercase mt-1">Taxa de resolução global</p>
                    </Card>
                </div>

                {/* Main Charts */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

                    {/* Trend Chart - Large */}
                    <Card variant="white" className="lg:col-span-8 p-6 border-[var(--border-subtle)] min-h-[450px]">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                            <div>
                                <h3 className="text-lg font-bold text-[var(--text-primary)] uppercase tracking-tight flex items-center gap-2">
                                    <Activity className="w-5 h-5 text-[var(--accent-primary)]" />
                                    Volume & Tendência
                                </h3>
                                <p className="text-[var(--text-tertiary)] text-[10px] font-bold uppercase tracking-widest mt-1">Fluxo de reportes dos últimos 30 dias</p>
                            </div>
                        </div>

                        <div className="h-[300px] w-full">
                            {isReady && (
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={data.volume}>
                                        <defs>
                                            <linearGradient id="colorArea" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2} />
                                                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                                        <XAxis
                                            dataKey="date"
                                            stroke="#64748b"
                                            fontSize={10}
                                            fontWeight="600"
                                            tickFormatter={(date) => new Date(date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}
                                            axisLine={false}
                                            tickLine={false}
                                            dy={10}
                                        />
                                        <YAxis stroke="#64748b" fontSize={10} fontWeight="600" axisLine={false} tickLine={false} />
                                        <RechartsTooltip
                                            contentStyle={{
                                                backgroundColor: '#fff',
                                                border: '1px solid #e2e8f0',
                                                borderRadius: '12px',
                                                padding: '12px',
                                                boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'
                                            }}
                                            itemStyle={{ color: '#0f172a', fontSize: '12px', fontWeight: 'bold' }}
                                            labelStyle={{ color: '#64748b', fontSize: '10px', marginBottom: '4px', fontWeight: 'bold' }}
                                        />
                                        <Area
                                            type="monotone"
                                            dataKey="count"
                                            name="Reportes"
                                            stroke="#3b82f6"
                                            strokeWidth={3}
                                            fillOpacity={1}
                                            fill="url(#colorArea)"
                                            isAnimationActive={true}
                                            animationDuration={1500}
                                        />
                                    </AreaChart>
                                </ResponsiveContainer>
                            )}
                        </div>
                    </Card>

                    {/* Sector Performance - Vertical Bar */}
                    <Card variant="white" className="lg:col-span-4 p-6 border-[var(--border-subtle)]">
                        <div className="mb-6">
                            <h3 className="text-lg font-bold text-[var(--text-primary)] uppercase tracking-tight flex items-center gap-2">
                                <PieIcon className="w-5 h-5 text-purple-500" />
                                Por Setor
                            </h3>
                            <p className="text-[var(--text-tertiary)] text-[10px] font-bold uppercase tracking-widest mt-1">Eficiência departamental</p>
                        </div>

                        <div className="space-y-6 overflow-y-auto max-h-[350px] pr-2 custom-scrollbar">
                            {data.sectorPerformance.map((sector) => (
                                <div key={sector.name} className="group">
                                    <div className="flex justify-between items-end mb-2">
                                        <div>
                                            <p className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wide">{sector.name}</p>
                                            <p className="text-[10px] font-medium text-[var(--text-tertiary)] mt-0.5">{sector.avgHours}h avg response</p>
                                        </div>
                                        <div className="text-right">
                                            <span className="text-xs font-black text-[var(--text-primary)]">{sector.resolved}</span>
                                            <span className="text-[10px] font-bold text-[var(--text-tertiary)] ml-1">/{sector.resolved + sector.forwarded}</span>
                                        </div>
                                    </div>
                                    <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden flex">
                                        <div
                                            className="h-full bg-emerald-500 rounded-full transition-all duration-1000 group-hover:bg-emerald-400"
                                            style={{ width: `${(sector.resolved / (sector.resolved + sector.forwarded || 1)) * 100}%` }}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </Card>

                    {/* Global Analysis - Status Distribution */}
                    <Card variant="white" className="lg:col-span-12 p-8 border-[var(--border-subtle)]">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                            <div>
                                <h3 className="text-xl font-bold text-[var(--text-primary)] uppercase tracking-tight mb-4 flex items-center gap-3">
                                    <PieIcon className="w-6 h-6 text-emerald-500" />
                                    Arquitetura de Status
                                </h3>
                                <p className="text-[var(--text-secondary)] text-sm leading-relaxed mb-8 font-medium">
                                    Análise estrutural da distribuição de demandas. O gráfico indica a relação entre resoluções e pendências atuais em todos os setores integrados.
                                </p>
                                <div className="grid grid-cols-2 gap-4">
                                    {statusParams.map(p => (
                                        <div key={p.name} className="p-4 bg-[var(--bg-tertiary)] border border-[var(--border-subtle)] rounded-xl">
                                            <div className="flex items-center gap-2 mb-1">
                                                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: p.color }} />
                                                <span className="text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-widest">{p.name}</span>
                                            </div>
                                            <p className="text-2xl font-black text-[var(--text-primary)]">{p.value}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="h-[300px] w-full flex items-center justify-center relative">
                                <div className="absolute inset-0 bg-blue-500/5 rounded-full blur-3xl opacity-50" />
                                {isReady && (
                                    <ResponsiveContainer width="100%" height={300}>
                                        <PieChart>
                                            <Pie
                                                data={statusParams}
                                                cx="50%"
                                                cy="50%"
                                                innerRadius={80}
                                                outerRadius={120}
                                                paddingAngle={4}
                                                dataKey="value"
                                                stroke="none"
                                            >
                                                {statusParams.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                                ))}
                                            </Pie>
                                            <RechartsTooltip
                                                contentStyle={{
                                                    backgroundColor: '#fff',
                                                    border: '1px solid #e2e8f0',
                                                    borderRadius: '12px',
                                                    color: '#0f172a',
                                                    boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'
                                                }}
                                                itemStyle={{ color: '#0f172a' }}
                                            />
                                        </PieChart>
                                    </ResponsiveContainer>
                                )}
                                <div className="absolute flex flex-col items-center justify-center pointer-events-none">
                                    <span className="text-[10px] font-black text-[var(--text-tertiary)] uppercase tracking-[0.3em]">Total</span>
                                    <span className="text-4xl font-black text-[var(--text-primary)]">{statusParams.reduce((a: number, b: { value: number }) => a + b.value, 0)}</span>
                                </div>
                            </div>
                        </div>
                    </Card>
                </div>
            </div>

            <InsightsModal
                isOpen={isInsightsOpen}
                onClose={() => setIsInsightsOpen(false)}
                data={data}
            />
        </DashboardLayout>
    );
}
