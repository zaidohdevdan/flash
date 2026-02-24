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
                <h1 className="text-2xl font-black text-[var(--text-primary)] uppercase tracking-tight mb-1">
                    Visão Geral do Sistema
                </h1>
                <p className="text-xs text-[var(--text-secondary)] font-medium">Métricas e acompanhamento global do Flash OS</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card variant="white" className="p-6 border-[var(--border-subtle)] hover:border-blue-500/30 transition-colors">
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-2.5 bg-blue-500/10 rounded-xl text-blue-500">
                            <Users className="w-5 h-5" />
                        </div>
                        <Badge status="RESOLVED" label={`+${stats.monthlyGrowth.users} este mês`} className="opacity-80 scale-90 origin-right" />
                    </div>
                    <p className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wide">Total de Contas</p>
                    <div className="flex items-baseline gap-2 mt-2">
                        <h2 className="text-3xl font-black text-[var(--text-primary)]">{stats.totalUsers}</h2>
                    </div>
                </Card>

                <Card variant="white" className="p-6 border-[var(--border-subtle)] hover:border-emerald-500/30 transition-colors">
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-2.5 bg-emerald-500/10 rounded-xl text-emerald-500">
                            <Activity className="w-5 h-5" />
                        </div>
                        <Badge status="IN_REVIEW" label={`+${stats.monthlyGrowth.reports} relatórios`} className="opacity-80 scale-90 origin-right" />
                    </div>
                    <p className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wide">Processos Gerados</p>
                    <div className="flex items-baseline gap-2 mt-2">
                        <h2 className="text-3xl font-black text-[var(--text-primary)]">{stats.totalReports}</h2>
                    </div>
                </Card>

                <Card variant="white" className="p-6 border-[var(--border-subtle)] hover:border-purple-500/30 transition-colors">
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-2.5 bg-purple-500/10 rounded-xl text-purple-500">
                            <Filter className="w-5 h-5" />
                        </div>
                    </div>
                    <p className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wide">Setores Operacionais</p>
                    <div className="flex items-baseline gap-2 mt-2">
                        <h2 className="text-3xl font-black text-[var(--text-primary)]">{stats.totalDepartments}</h2>
                    </div>
                </Card>

                <Card variant="white" className="p-6 border-[var(--border-subtle)] hover:border-rose-500/30 transition-colors">
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-2.5 bg-rose-500/10 rounded-xl text-rose-500">
                            <TicketIcon className="w-5 h-5" />
                        </div>
                        <span className="text-xs font-bold text-rose-500 bg-rose-50 px-2 py-0.5 rounded-full">{stats.totalTickets - stats.resolvedTickets} pendentes</span>
                    </div>
                    <p className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wide">Chamados de Suporte</p>
                    <div className="flex items-baseline gap-2 mt-2">
                        <h2 className="text-3xl font-black text-[var(--text-primary)]">{stats.totalTickets}</h2>
                    </div>
                </Card>
            </div>

            <div className="bg-emerald-500/5 p-4 rounded-xl border border-emerald-500/10 flex items-start gap-4 mt-8">
                <CheckCircle className="w-6 h-6 text-emerald-500 shrink-0 mt-0.5" />
                <div>
                    <h4 className="text-emerald-500 font-bold text-sm tracking-wide uppercase mb-1">Status Operacional: Normal</h4>
                    <p className="text-emerald-500/80 text-xs">Todos os subsistemas do Flash OS estão online e respondendo adequadamente. Backups em dia.</p>
                </div>
            </div>
        </div>
    );
}
