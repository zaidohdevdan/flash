import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useDashboardSocket } from '../../hooks/useDashboardSocket';
import { api } from '../../services/api';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
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
    const { user, notificationsEnabled } = useAuth();
    const [logs, setLogs] = useState<AuditLog[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filter, setFilter] = useState('all');

    const [page, setPage] = useState(1);
    const LOGS_PER_PAGE = 7;

    const { socket, isConnected } = useDashboardSocket({
        user: user ? { id: user.id, name: user.name, role: user.role } : null,
        notificationsEnabled
    });

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

    const totalPages = Math.ceil(filteredLogs.length / LOGS_PER_PAGE);
    const displayedLogs = filteredLogs.slice((page - 1) * LOGS_PER_PAGE, page * LOGS_PER_PAGE);

    const locale = ptBR;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight flex items-center gap-2">
                        <Terminal className="w-6 h-6 text-indigo-500" />
                        Logs do Sistema
                    </h1>
                    <p className="text-[11px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest mt-1">Monitoramento em tempo real de todas as ações administrativas e operacionais.</p>
                </div>

                <div className="flex items-center gap-2">
                    <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border transition-all duration-500 ${isConnected
                        ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-100 dark:border-emerald-500/20 shadow-sm shadow-emerald-500/20'
                        : 'bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-100 dark:border-rose-500/20 shadow-sm shadow-rose-500/20'
                        }`}>
                        <div className={`w-1.5 h-1.5 rounded-full ${isConnected ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`} />
                        {isConnected ? 'Sistema Online' : 'Sistema Offline'}
                    </div>
                    <button
                        type='button'
                        title="Atualizar Logs"
                        onClick={fetchLogs}
                        className="p-2 hover:bg-slate-100 dark:hover:bg-white/5 bg-white dark:bg-black/20 border border-slate-200 dark:border-white/5 rounded-lg transition-colors text-slate-500 dark:text-slate-400"
                    >
                        <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                    </button>
                </div>
            </div>

            {/* Filters */}
            <Card variant="white" className="p-3 grid grid-cols-1 md:grid-cols-3 gap-4 bg-white/70 dark:bg-black/60 border border-slate-200 dark:border-white/5 shadow-xl backdrop-blur-md">
                <div className="relative col-span-1 md:col-span-2 w-full">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-slate-500" />
                    <input
                        type="text"
                        placeholder="Buscar logs por ação, usuário ou destino..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-black/40 border-slate-200 dark:border-white/5 border rounded-xl focus:bg-white dark:focus:bg-black/60 focus:border-indigo-500 outline-none transition-all text-sm font-bold text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-600 uppercase tracking-tight"
                    />
                </div>
                <div className="flex items-center gap-2 bg-slate-50 dark:bg-black/40 p-1.5 rounded-xl w-full md:w-auto border border-slate-200 dark:border-white/5 shadow-inner relative">
                    <select
                        title="Filtrar por Ação"
                        value={filter}
                        onChange={(e) => setFilter(e.target.value)}
                        className="bg-transparent border-none outline-none text-xs font-bold text-slate-600 dark:text-slate-400 py-2 px-4 cursor-pointer uppercase tracking-wide w-full md:w-auto appearance-none"
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
            </Card>

            {/* Logs Table */}
            <Card variant="white" className="overflow-hidden bg-white/70 dark:bg-black/60 border border-slate-200 dark:border-white/5 shadow-2xl backdrop-blur-md rounded-2xl">
                <div className="overflow-x-auto w-full">
                    <table className="w-full min-w-max text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50 dark:bg-black/40 text-[11px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest border-b border-slate-200 dark:border-white/5">
                                <th className="px-6 py-4">Horário / Data</th>
                                <th className="px-6 py-4">Usuário Operacional</th>
                                <th className="px-6 py-4">Ação Executada</th>
                                <th className="px-6 py-4">Alvo / Destino</th>
                                <th className="px-6 py-4 whitespace-nowrap">Endereço IP</th>
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
                                displayedLogs.map((log) => (
                                    <tr key={log.id} className="table-row-hover group">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center gap-2 text-[11px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-tight">
                                                <Clock className="w-3.5 h-3.5 opacity-50" />
                                                {format(new Date(log.createdAt), 'HH:mm:ss', { locale })}
                                                <span className="opacity-30">|</span>
                                                <span className="opacity-50">{format(new Date(log.createdAt), 'dd/MM', { locale })}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center gap-3">
                                                <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center overflow-hidden border border-indigo-100 dark:border-indigo-500/20 shadow-inner group-hover:scale-110 transition-transform">
                                                    {log.user?.avatarUrl ? (
                                                        <img src={log.user.avatarUrl} alt="" className="w-full h-full object-cover" />
                                                    ) : (
                                                        <UserIcon className="w-4 h-4 text-indigo-500 dark:text-indigo-400" />
                                                    )}
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight leading-tight">{log.user?.name || 'Sistema'}</span>
                                                    <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 truncate max-w-[120px]">{log.user?.email || '-'}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2 py-1 rounded-md text-[10px] font-black tracking-wider ${getActionColor(log.action)}`}>
                                                {formatAction(log.action)}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2 text-[11px] font-black text-slate-600 dark:text-slate-300 uppercase tracking-tight">
                                                <Target className="w-3.5 h-3.5 text-indigo-500" />
                                                <span className="truncate max-w-[150px]">{formatTarget(log.target)}</span>
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
            </Card>

            {/* Pagination Controls */}
            {totalPages > 1 && (
                <div className="flex items-center justify-between pt-4 pb-12">
                    <p className="text-[11px] font-black text-slate-500 dark:text-slate-500 uppercase tracking-widest">
                        Mostrando {displayedLogs.length} de {filteredLogs.length} logs
                    </p>
                    <div className="flex items-center gap-2">
                        <Button
                            variant="secondary"
                            onClick={() => setPage(p => Math.max(1, p - 1))}
                            disabled={page === 1}
                        >
                            Anterior
                        </Button>
                        <span className="text-sm font-black text-slate-900 dark:text-white px-4">
                            Página {page} de {totalPages}
                        </span>
                        <Button
                            variant="secondary"
                            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                            disabled={page === totalPages}
                        >
                            Próxima
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
}
