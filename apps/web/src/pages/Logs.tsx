import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useDashboardSocket } from '../hooks/useDashboardSocket';
import { DashboardLayout } from '../layouts/DashboardLayout';
import { api } from '../services/api';
import {
    Search,
    Terminal,
    Clock,
    User as UserIcon,
    Target,
    Globe,
    RefreshCw,
    XCircle
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface AuditLog {
    id: string;
    userId: string;
    action: string;
    target: string;
    details: string | null;
    ip: string | null;
    userAgent: string | null;
    createdAt: string;
    user?: {
        name: string;
        email: string;
        avatarUrl: string | null;
    };
}

export function Logs() {
    const { user, signOut } = useAuth();
    const [logs, setLogs] = useState<AuditLog[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filter, setFilter] = useState('all');

    const { socket, isConnected } = useDashboardSocket({ user: user ? { id: user.id, name: user.name, role: user.role } : null });

    const fetchLogs = useCallback(async () => {
        try {
            setLoading(true);
            const res = await api.get('/admin/logs', {
                params: {
                    limit: 50,
                    action: filter !== 'all' ? filter : undefined
                }
            });
            setLogs(res.data.logs);
        } catch (error) {
            console.error('Error fetching logs:', error);
        } finally {
            setLoading(false);
        }
    }, [filter]);

    useEffect(() => {
        fetchLogs();
    }, [fetchLogs]);

    useEffect(() => {
        if (!socket) return;

        const handleNewLog = (newLog: AuditLog) => {
            setLogs(prev => [newLog, ...prev].slice(0, 100)); // Keep last 100 in live view
        };

        socket.on('new_audit_log', handleNewLog);
        return () => {
            socket.off('new_audit_log', handleNewLog);
        };
    }, [socket]);

    const getActionColor = (action: string) => {
        if (action.includes('CREATE')) return 'text-emerald-500 bg-emerald-500/10';
        if (action.includes('DELETE')) return 'text-rose-500 bg-rose-500/10';
        if (action.includes('UPDATE')) return 'text-amber-500 bg-amber-500/10';
        if (action.includes('LOGIN')) return 'text-blue-500 bg-blue-500/10';
        return 'text-slate-500 bg-slate-500/10';
    };

    const formatAction = (action: string) => {
        const maps: Record<string, string> = {
            'LOGIN': 'LOGIN',
            'CREATE_USER': 'Criação de Usuário',
            'UPDATE_USER': 'Edição de Usuário',
            'DELETE_USER': 'Exclusão de Usuário',
            'CREATE_REPORT': 'Novo Reporte Enviado',
            'UPDATE_REPORT_STATUS': 'Alteração de Status',
            'CREATE_AGENDA_EVENT': 'Evento Criado na Agenda',
            'DELETE_AGENDA_EVENT': 'Evento Removido da Agenda',
        };
        return maps[action] || action;
    };

    const formatTarget = (target: string | null) => {
        if (!target || target === '-' || target === '@') return 'Geral / Sistema';
        if (target.startsWith('User:')) return `Usuário: ${target.split(':')[1]}`;
        if (target.startsWith('Report:')) return `Reporte: ${target.split(':')[1]}`;
        if (target.startsWith('Event:')) return `Evento: ${target.split(':')[1]}`;
        return target;
    };

    const formatIP = (ip: string | null) => {
        if (!ip) return 'Desconhecido';
        if (ip === '::1' || ip === '127.0.0.1') return 'Interno (Sistema)';
        return ip;
    };

    const filteredLogs = logs.filter(log => {
        const search = searchTerm.toLowerCase();
        return (
            log.action.toLowerCase().includes(search) ||
            log.target?.toLowerCase().includes(search) ||
            log.user?.name?.toLowerCase().includes(search) ||
            log.user?.email?.toLowerCase().includes(search)
        );
    });

    const locale = ptBR;

    return (
        <DashboardLayout user={user || undefined} onLogout={signOut}>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-black text-[var(--text-primary)] uppercase tracking-tight flex items-center gap-2">
                            <Terminal className="w-6 h-6 text-[var(--accent-primary)]" />
                            Logs do Sistema
                        </h1>
                        <p className="text-[var(--text-tertiary)] text-sm">Monitoramento em tempo real de todas as ações administrativas e operacionais.</p>
                    </div>

                    <div className="flex items-center gap-2">
                        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border transition-all duration-500 ${isConnected ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-rose-50 text-rose-600 border-rose-100'
                            }`}>
                            <div className={`w-1.5 h-1.5 rounded-full ${isConnected ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`} />
                            {isConnected ? 'Ao Vivo' : 'Offline'}
                        </div>
                        <button
                            type='button'
                            title="Atualizar Logs"
                            onClick={fetchLogs}
                            className="p-2 hover:bg-[var(--bg-tertiary)] rounded-lg transition-colors text-[var(--text-secondary)]"
                        >
                            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                        </button>
                    </div>
                </div>

                {/* Filters */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="relative col-span-1 md:col-span-2">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-tertiary)]" />
                        <input
                            type="text"
                            placeholder="Buscar logs por ação, usuário ou destino..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 bg-[var(--bg-primary)] border border-[var(--border-subtle)] rounded-xl text-sm focus:ring-2 focus:ring-[var(--accent-primary)]/20 transition-all outline-none"
                        />
                    </div>
                    <select
                        title="Filtrar por Ação"
                        value={filter}
                        onChange={(e) => setFilter(e.target.value)}
                        className="px-4 py-2.5 bg-[var(--bg-primary)] border border-[var(--border-subtle)] rounded-xl text-sm focus:ring-2 focus:ring-[var(--accent-primary)]/20 transition-all outline-none appearance-none"
                    >
                        <option value="all">Todas as Ações</option>
                        <option value="LOGIN">LOGIN</option>
                        <option value="CREATE_USER">CREATE_USER</option>
                        <option value="UPDATE_USER">UPDATE_USER</option>
                        <option value="DELETE_USER">DELETE_USER</option>
                        <option value="CREATE_REPORT">CREATE_REPORT</option>
                        <option value="UPDATE_REPORT_STATUS">UPDATE_REPORT_STATUS</option>
                    </select>
                </div>

                {/* Logs Table */}
                <div className="bg-[var(--bg-primary)] border border-[var(--border-subtle)] rounded-2xl overflow-hidden shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-[var(--border-subtle)] bg-[var(--bg-secondary)]/30">
                                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-[var(--text-tertiary)]">Horário</th>
                                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-[var(--text-tertiary)]">Usuário</th>
                                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-[var(--text-tertiary)]">Ação</th>
                                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-[var(--text-tertiary)]">Alvo</th>
                                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-[var(--text-tertiary)]">Endereço IP</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[var(--border-subtle)]">
                                {loading && logs.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-20 text-center">
                                            <div className="flex flex-col items-center gap-3">
                                                <RefreshCw className="w-8 h-8 text-[var(--accent-primary)] animate-spin" />
                                                <p className="text-sm text-[var(--text-tertiary)]">Carregando logs...</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : filteredLogs.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-20 text-center">
                                            <div className="flex flex-col items-center gap-3">
                                                <XCircle className="w-8 h-8 text-[var(--text-tertiary)]" />
                                                <p className="text-sm text-[var(--text-tertiary)]">Nenhum log encontrado para os critérios selecionados.</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    filteredLogs.map((log) => (
                                        <tr key={log.id} className="hover:bg-[var(--bg-secondary)]/30 transition-colors group">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center gap-2 text-xs text-[var(--text-secondary)]">
                                                    <Clock className="w-3 h-3 opacity-50" />
                                                    {format(new Date(log.createdAt), 'HH:mm:ss', { locale })}
                                                    <span className="opacity-30">|</span>
                                                    <span className="opacity-50">{format(new Date(log.createdAt), 'dd/MM', { locale })}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-full bg-[var(--bg-tertiary)] flex items-center justify-center overflow-hidden border border-[var(--border-subtle)]">
                                                        {log.user?.avatarUrl ? (
                                                            <img src={log.user.avatarUrl} alt="" className="w-full h-full object-cover" />
                                                        ) : (
                                                            <UserIcon className="w-4 h-4 text-[var(--text-tertiary)]" />
                                                        )}
                                                    </div>
                                                    <div className="flex flex-col">
                                                        <span className="text-sm font-bold text-[var(--text-primary)]">{log.user?.name || 'System'}</span>
                                                        <span className="text-[10px] text-[var(--text-tertiary)] truncate max-w-[120px]">{log.user?.email || '-'}</span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`px-2 py-1 rounded-md text-[10px] font-black tracking-wider ${getActionColor(log.action)}`}>
                                                    {formatAction(log.action)}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2 text-xs text-[var(--text-secondary)]">
                                                    <Target className="w-3 h-3 text-[var(--accent-primary)]" />
                                                    <span className="truncate max-w-[150px] font-bold">{formatTarget(log.target)}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center gap-2 text-[10px] text-[var(--text-tertiary)] font-mono">
                                                    <Globe className="w-3 h-3 opacity-50" />
                                                    {formatIP(log.ip)}
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
