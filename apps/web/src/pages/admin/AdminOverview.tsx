import { useState, useEffect } from 'react';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';

import { api } from '../../services/api';
import {
    Activity, Users, Ticket as TicketIcon, Filter, CheckCircle
} from 'lucide-react';

interface AdminStats {
    totalUsers: number;
    totalReports: number;
    totalTickets: number;
    resolvedTickets: number;
    totalDepartments: number;
    monthlyGrowth: {
        users: number;
        reports: number;
    };
    recentActivity: {
        id: string;
        type: 'USER' | 'REPORT' | 'TICKET';
        action: string;
        date: string;
        user: string;
    }[];
}

export function AdminOverview() {
    const [stats, setStats] = useState<AdminStats | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchOverview();
    }, []);

    const fetchOverview = async () => {
        setLoading(true);
        try {
            const response = await api.get('/admin/stats');
            setStats(response.data);
        } catch (error) {
            console.error('Failed to fetch admin stats:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading || !stats) {
        return (
            <div className="flex justify-center items-center py-20">
                <div className="w-8 h-8 rounded-full border-4 border-blue-500 border-t-transparent animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div>
                <h1 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight mb-1">
                    Visão Geral do Sistema
                </h1>
                <p className="text-[12px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-widest mt-1">Métricas e acompanhamento global do Flash OS</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card variant="white" className="p-6 bg-white/70 dark:bg-black/60 border border-slate-200 dark:border-white/5 shadow-xl backdrop-blur-md hover:border-blue-500/30 transition-all group">
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-2.5 bg-blue-500/10 rounded-xl text-blue-500 group-hover:scale-110 transition-transform">
                            <Users className="w-5 h-5" />
                        </div>
                        <Badge status="RESOLVED" label={`+${stats.monthlyGrowth.users} este mês`} className="opacity-80 scale-90 origin-right" />
                    </div>
                    <p className="text-[11px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">Total de Contas</p>
                    <div className="flex items-baseline gap-2 mt-2">
                        <h2 className="text-3xl font-black text-slate-900 dark:text-white">{stats.totalUsers}</h2>
                    </div>
                </Card>

                <Card variant="white" className="p-6 bg-white/70 dark:bg-black/60 border border-slate-200 dark:border-white/5 shadow-xl backdrop-blur-md hover:border-emerald-500/30 transition-all group">
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-2.5 bg-emerald-500/10 rounded-xl text-emerald-500 group-hover:scale-110 transition-transform">
                            <Activity className="w-5 h-5" />
                        </div>
                        <Badge status="IN_REVIEW" label={`+${stats.monthlyGrowth.reports} relatórios`} className="opacity-80 scale-90 origin-right" />
                    </div>
                    <p className="text-[11px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">Processos Gerados</p>
                    <div className="flex items-baseline gap-2 mt-2">
                        <h2 className="text-3xl font-black text-slate-900 dark:text-white">{stats.totalReports}</h2>
                    </div>
                </Card>

                <Card variant="white" className="p-6 bg-white/70 dark:bg-black/60 border border-slate-200 dark:border-white/5 shadow-xl backdrop-blur-md hover:border-purple-500/30 transition-all group">
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-2.5 bg-purple-500/10 rounded-xl text-purple-500 group-hover:scale-110 transition-transform">
                            <Filter className="w-5 h-5" />
                        </div>
                    </div>
                    <p className="text-[11px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">Setores Operacionais</p>
                    <div className="flex items-baseline gap-2 mt-2">
                        <h2 className="text-3xl font-black text-slate-900 dark:text-white">{stats.totalDepartments}</h2>
                    </div>
                </Card>

                <Card variant="white" className={`p-6 bg-white/70 dark:bg-black/60 border backdrop-blur-md transition-all relative group ${stats.totalTickets - stats.resolvedTickets > 0 ? 'border-rose-500/50 shadow-[0_0_20px_rgba(244,63,94,0.15)] ring-1 ring-rose-500/30 ring-offset-2 ring-offset-white dark:ring-offset-[#020617] animate-pulse' : 'border-slate-200 dark:border-white/5 hover:border-rose-500/30 shadow-xl'}`}>
                    {stats.totalTickets - stats.resolvedTickets > 0 && (
                        <div className="absolute -top-1 -right-1 w-3 h-3 bg-rose-500 rounded-full animate-ping" />
                    )}
                    <div className="flex items-center justify-between mb-4">
                        <div className={`p-2.5 rounded-xl group-hover:scale-110 transition-transform ${stats.totalTickets - stats.resolvedTickets > 0 ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/40' : 'bg-rose-500/10 text-rose-500'}`}>
                            <TicketIcon className="w-5 h-5" />
                        </div>
                        <span className={`text-[11px] font-black px-2 py-0.5 rounded-full uppercase tracking-tighter ${stats.totalTickets - stats.resolvedTickets > 0 ? 'text-rose-600 bg-rose-500/20' : 'text-rose-500 bg-rose-500/10'}`}>
                            {stats.totalTickets - stats.resolvedTickets} pendentes
                        </span>
                    </div>
                    <p className="text-[11px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">Chamados de Suporte</p>
                    <div className="flex items-baseline gap-2 mt-2">
                        <h2 className="text-3xl font-black text-slate-900 dark:text-white">{stats.totalTickets}</h2>
                    </div>
                </Card>
            </div>

            <div className="bg-emerald-500/5 p-4 rounded-xl border border-emerald-500/10 flex items-start gap-4 mt-8 animate-in slide-in-from-bottom-2 duration-500">
                <CheckCircle className="w-6 h-6 text-emerald-500 shrink-0 mt-0.5" />
                <div>
                    <h4 className="text-emerald-500 font-black text-[12px] tracking-widest uppercase mb-1">Status Operacional: Normal</h4>
                    <p className="text-emerald-600 dark:text-emerald-500/80 text-[11px] font-bold uppercase tracking-tight">Todos os subsistemas do Flash OS estão online e respondendo adequadamente. Backups em dia.</p>
                </div>
            </div>
        </div>
    );
}
