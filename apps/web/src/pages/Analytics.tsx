
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import {
    XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
    BarChart, Bar, Legend, PieChart, Pie, Cell, AreaChart, Area
} from 'recharts';
import { ArrowLeft, TrendingUp, AlertTriangle, Clock, BarChart3, PieChart as PieIcon, Download } from 'lucide-react';
import { GlassCard } from '../components/ui/GlassCard';
import { Button } from '../components/ui/Button';

interface AnalyticsData {
    efficiency: {
        avgResolutionTime: string;
        resolvedCount: number;
    };
    bottlenecks: {
        avgForwardedTime: string;
        impactedCount: number;
    };
    volume: { date: string; count: number }[];
    sectorPerformance: { name: string; resolved: number; forwarded: number }[];
}

export function Analytics() {
    const navigate = useNavigate();
    const [data, setData] = useState<AnalyticsData | null>(null);
    const [loading, setLoading] = useState(true);
    const [isReady, setIsReady] = useState(false);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const response = await api.get('/reports/analytics');
            setData(response.data);
            // Pequeno delay para garantir que o DOM esteja pronto e com tamanhos calculados
            setTimeout(() => setIsReady(true), 300);
        } catch (error) {
            console.error('Erro ao carregar analytics:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
                <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    if (!data) return null;

    // Calcular distribuição de status para o PieChart
    const statusParams = data.sectorPerformance.reduce((acc, curr) => {
        acc[0].value += curr.resolved; // Resolvidos
        acc[1].value += curr.forwarded; // Em Setor
        return acc;
    }, [
        { name: 'Resolvidos', value: 0, color: '#10b981' }, // emerald-500
        { name: 'Em Setor', value: 0, color: '#8b5cf6' }   // violet-500
    ]);

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white p-6 md:p-8">
            {/* Header */}
            <div className="max-w-7xl mx-auto mb-8 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate(-1)}
                        className="p-2 hover:bg-white/10 rounded-xl transition-colors print:hidden"
                    >
                        <ArrowLeft className="w-6 h-6 text-gray-400" />
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">
                            Analytics & Relatórios
                        </h1>
                        <p className="text-gray-400 text-sm">Visão estratégica da operação</p>
                    </div>
                </div>
                <Button
                    variant="glass"
                    className="!bg-white/10 hover:!bg-white/20 print:hidden"
                    onClick={() => window.print()}
                >
                    <Download className="w-4 h-4 mr-2" />
                    Exportar PDF
                </Button>
            </div>

            <div className="max-w-7xl mx-auto space-y-6">

                {/* KPI Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 print:grid-cols-3">
                    <GlassCard variant="deep" className="p-6 relative overflow-hidden group print:break-inside-avoid" style={{ breakInside: 'avoid', pageBreakInside: 'avoid' }}>
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                            <Clock className="w-24 h-24 text-blue-500" />
                        </div>
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 bg-blue-500/20 rounded-lg">
                                <Clock className="w-5 h-5 text-blue-400" />
                            </div>
                            <span className="text-gray-400 font-medium">Tempo Médio de Resolução</span>
                        </div>
                        <div className="mt-2">
                            <span className="text-4xl font-bold text-white">{data.efficiency.avgResolutionTime}h</span>
                            <p className="text-sm text-gray-500 mt-1">
                                {data.efficiency.resolvedCount} reportes finalizados
                            </p>
                        </div>
                    </GlassCard>

                    <GlassCard variant="deep" className="p-6 relative overflow-hidden group print:break-inside-avoid" style={{ breakInside: 'avoid', pageBreakInside: 'avoid' }}>
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                            <AlertTriangle className="w-24 h-24 text-yellow-500" />
                        </div>
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 bg-yellow-500/20 rounded-lg">
                                <AlertTriangle className="w-5 h-5 text-yellow-500" />
                            </div>
                            <span className="text-gray-400 font-medium">Gargalo (Em Setor)</span>
                        </div>
                        <div className="mt-2">
                            <span className="text-4xl font-bold text-white">{data.bottlenecks.avgForwardedTime}h</span>
                            <p className="text-sm text-gray-500 mt-1">
                                Tempo médio parado em departamentos
                            </p>
                        </div>
                    </GlassCard>

                    <GlassCard variant="deep" className="p-6 relative overflow-hidden group print:break-inside-avoid" style={{ breakInside: 'avoid', pageBreakInside: 'avoid' }}>
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                            <TrendingUp className="w-24 h-24 text-emerald-500" />
                        </div>
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 bg-emerald-500/20 rounded-lg">
                                <TrendingUp className="w-5 h-5 text-emerald-500" />
                            </div>
                            <span className="text-gray-400 font-medium">Eficiência Global</span>
                        </div>
                        <div className="mt-2">
                            <span className="text-4xl font-bold text-white">
                                {data.efficiency.resolvedCount > 0
                                    ? Math.round((data.efficiency.resolvedCount / (data.efficiency.resolvedCount + data.bottlenecks.impactedCount)) * 100)
                                    : 0}%
                            </span>
                            <p className="text-sm text-gray-500 mt-1">
                                Taxa de resolução vs. pendências
                            </p>
                        </div>
                    </GlassCard>
                </div>

                {/* Charts Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 print:block print:space-y-6">

                    {/* Volume Trend */}
                    <GlassCard variant="deep" className="p-6 min-h-[400px] print:break-inside-avoid">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                                <BarChart3 className="w-5 h-5 text-blue-400" />
                                Volume de Reportes (30 dias)
                            </h3>
                        </div>
                        <div className="h-[300px] w-full relative">
                            {isReady && (
                                <ResponsiveContainer width="100%" height={300}>
                                    <AreaChart data={data.volume}>
                                        <defs>
                                            <linearGradient id="colorVolume" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                                                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
                                        <XAxis
                                            dataKey="date"
                                            stroke="#9ca3af"
                                            fontSize={12}
                                            tickFormatter={(date) => new Date(date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}
                                        />
                                        <YAxis stroke="#9ca3af" fontSize={12} />
                                        <RechartsTooltip
                                            contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151', color: '#fff' }}
                                            labelStyle={{ color: '#9ca3af' }}
                                        />
                                        <Area
                                            type="monotone"
                                            dataKey="count"
                                            stroke="#3b82f6"
                                            strokeWidth={3}
                                            fillOpacity={1}
                                            fill="url(#colorVolume)"
                                            isAnimationActive={false}
                                        />
                                    </AreaChart>
                                </ResponsiveContainer>
                            )}
                        </div>
                    </GlassCard>

                    {/* Sector Performance */}
                    <GlassCard variant="deep" className="p-6 min-h-[400px] print:break-inside-avoid">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                                <PieIcon className="w-5 h-5 text-purple-400" />
                                Performance por Setor
                            </h3>
                        </div>
                        <div className="h-[300px] w-full relative">
                            {isReady && (
                                <ResponsiveContainer width="100%" height={300}>
                                    <BarChart data={data.sectorPerformance} layout="vertical">
                                        <CartesianGrid strokeDasharray="3 3" stroke="#374151" horizontal={false} />
                                        <XAxis type="number" stroke="#9ca3af" fontSize={12} />
                                        <YAxis
                                            dataKey="name"
                                            type="category"
                                            stroke="#9ca3af"
                                            fontSize={12}
                                            width={100}
                                        />
                                        <RechartsTooltip
                                            cursor={{ fill: '#374151', opacity: 0.2 }}
                                            contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151', color: '#fff' }}
                                        />
                                        <Legend />
                                        <Bar dataKey="resolved" name="Resolvidos" fill="#10b981" radius={[0, 4, 4, 0]} barSize={20} isAnimationActive={false} />
                                        <Bar dataKey="forwarded" name="Em Andamento" fill="#8b5cf6" radius={[0, 4, 4, 0]} barSize={20} isAnimationActive={false} />
                                    </BarChart>
                                </ResponsiveContainer>
                            )}
                        </div>
                    </GlassCard>

                    {/* Status Distribution (Pie) */}
                    <GlassCard variant="deep" className="p-6 min-h-[400px] lg:col-span-2 print:break-inside-avoid">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                                <PieIcon className="w-5 h-5 text-emerald-400" />
                                Distribuição Global de Status
                            </h3>
                        </div>
                        <div className="h-[300px] w-full relative flex items-center justify-center">
                            {isReady && (
                                <ResponsiveContainer width="100%" height={300}>
                                    <PieChart>
                                        <Pie
                                            data={statusParams}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={60}
                                            outerRadius={100}
                                            paddingAngle={5}
                                            dataKey="value"
                                            isAnimationActive={false}
                                        >
                                            {statusParams.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.color} />
                                            ))}
                                        </Pie>
                                        <RechartsTooltip
                                            contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151', color: '#fff' }}
                                        />
                                        <Legend verticalAlign="bottom" height={36} />
                                    </PieChart>
                                </ResponsiveContainer>
                            )}
                        </div>
                    </GlassCard>
                </div>
            </div>
        </div>
    );
}
