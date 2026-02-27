import { useState, useEffect } from 'react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';

import { TicketResponseModal } from '../../components/domain/modals/TicketResponseModal';
import { api } from '../../services/api';
import toast from 'react-hot-toast';
import { LifeBuoy, Search, Filter as FilterIcon, Clock, CheckCircle, RefreshCw } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface Ticket {
    id: string;
    protocol: string;
    subject: string;
    message?: string;
    status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
    priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
    createdAt: string;
    supervisor: {
        id: string;
        name: string;
        avatarUrl?: string;
    };
    category?: string;
    metadata?: Record<string, unknown>;
    resolvedAt?: string | null;
    resolvedBy?: {
        id: string;
        name: string;
    } | null;
}

export function AdminTickets() {
    const [tickets, setTickets] = useState<Ticket[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);
    const [selectedActionType, setSelectedActionType] = useState<'IN_PROGRESS' | 'RESOLVED' | null>(null);
    const [isResponseModalOpen, setIsResponseModalOpen] = useState(false);

    const [filters, setFilters] = useState({
        status: '',
        protocol: ''
    });

    const [page, setPage] = useState(1);
    const ITEMS_PER_PAGE = 7;

    useEffect(() => {
        fetchTickets();
    }, []);

    const fetchTickets = async () => {
        setLoading(true);
        try {
            const res = await api.get('/tickets');
            setTickets(res.data);
        } catch {
            toast.error('Erro ao carregar chamados');
        } finally {
            setLoading(false);
        }
    };

    const handleOpenTicketResponse = (ticketId: string, actionType: 'IN_PROGRESS' | 'RESOLVED') => {
        setSelectedTicketId(ticketId);
        setSelectedActionType(actionType);
        setIsResponseModalOpen(true);
    };

    const handleTicketResponseComplete = () => {
        setIsResponseModalOpen(false);
        setSelectedTicketId(null);
        setSelectedActionType(null);
        fetchTickets();
    };

    const handleTicketResponseSubmit = async (response: string) => {
        if (!selectedTicketId || !selectedActionType) return;
        try {
            await api.patch(`/tickets/${selectedTicketId}/status`, {
                status: selectedActionType,
                response
            });
            toast.success('Chamado atualizado com sucesso');
            handleTicketResponseComplete();
        } catch {
            toast.error('Erro ao atualizar chamado');
            throw new Error('Erro ao atualizar chamado');
        }
    };

    const getStatusStyle = (status: string) => {
        switch (status) {
            case 'OPEN': return 'bg-amber-500/10 text-amber-500 border-amber-500/20';
            case 'IN_PROGRESS': return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
            case 'RESOLVED':
            case 'CLOSED': return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
            default: return 'bg-gray-500/10 text-gray-400 border-gray-500/20';
        }
    };

    const getStatusLabel = (status: string) => {
        switch (status) {
            case 'OPEN': return 'Aberto';
            case 'IN_PROGRESS': return 'Em Andamento';
            case 'RESOLVED': return 'Resolvido';
            case 'CLOSED': return 'Fechado';
            default: return status;
        }
    };

    const getPriorityStyle = (priority: string) => {
        switch (priority) {
            case 'URGENT': return 'text-red-500';
            case 'HIGH': return 'text-orange-500';
            case 'MEDIUM': return 'text-amber-500';
            case 'LOW': return 'text-emerald-500';
            default: return 'text-gray-400';
        }
    };

    const filteredTickets = tickets.filter(t => {
        const matchesStatus = filters.status ? t.status === filters.status : true;
        const matchesProtocol = t.protocol.toLowerCase().includes(filters.protocol.toLowerCase());
        return matchesStatus && matchesProtocol;
    });

    const totalPages = Math.ceil(filteredTickets.length / ITEMS_PER_PAGE);
    const displayedTickets = filteredTickets.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

    if (loading) {
        return (
            <div className="flex justify-center flex-col gap-4 items-center py-20">
                <div className="w-8 h-8 rounded-full border-4 border-blue-500 border-t-transparent animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-black text-[var(--text-primary)] uppercase tracking-tight mb-1 flex items-center gap-3">
                        <LifeBuoy className="w-8 h-8 text-blue-500" /> Chamados de Suporte
                    </h1>
                    <p className="text-xs text-[var(--text-secondary)] font-medium">Gestão de tickets e suporte técnico ao usuário</p>
                </div>
                <button
                    type="button"
                    onClick={fetchTickets}
                    title="Atualizar Fila"
                    className="w-10 h-10 p-0 flex items-center justify-center text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)] bg-[var(--bg-primary)] border border-[var(--border-subtle)] rounded-xl transition-all"
                >
                    <RefreshCw className="w-4 h-4" />
                </button>
            </div>

            <Card variant="white" className="p-4 grid grid-cols-1 md:grid-cols-4 gap-4 border-[var(--border-subtle)]">
                <div className="relative col-span-1 md:col-span-3">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-tertiary)]" />
                    <input
                        type="text"
                        placeholder="Buscar por Protocolo..."
                        value={filters.protocol}
                        onChange={e => setFilters(prev => ({ ...prev, protocol: e.target.value }))}
                        className="w-full pl-10 pr-4 py-3 bg-[var(--bg-tertiary)] border-transparent border rounded-xl focus:bg-[var(--bg-primary)] focus:border-[var(--accent-primary)] outline-none transition-all text-sm font-medium text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)]"
                    />
                </div>
                <div className="relative">
                    <FilterIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-tertiary)]" />
                    <select
                        title="Filtrar por Status"
                        value={filters.status}
                        onChange={e => setFilters(prev => ({ ...prev, status: e.target.value }))}
                        className="w-full pl-10 pr-4 py-3 bg-[var(--bg-tertiary)] border-transparent border rounded-xl outline-none focus:ring-2 focus:ring-[var(--border-subtle)] appearance-none text-sm font-medium text-[var(--text-secondary)]"
                    >
                        <option value="">Status (Todos)</option>
                        <option value="OPEN">Em Aberto</option>
                        <option value="IN_PROGRESS">Em Andamento</option>
                        <option value="RESOLVED">Resolvidos</option>
                    </select>
                </div>
            </Card>

            <Card variant="white" className="overflow-hidden border-[var(--border-subtle)]">
                <div className="overflow-x-auto w-full">
                    <table className="w-full min-w-max text-left border-collapse">
                        <thead>
                            <tr className="bg-[var(--bg-tertiary)] text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-widest border-b border-[var(--border-subtle)]">
                                <th className="px-6 py-4">Data / Protocolo</th>
                                <th className="px-6 py-4">Usuário / Prioridade</th>
                                <th className="px-6 py-4">Problema Relatado</th>
                                <th className="px-6 py-4">Status / Técnico</th>
                                <th className="px-6 py-4 text-right">Ação</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[var(--border-subtle)]">
                            {filteredTickets.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-24 text-center text-[var(--text-tertiary)]">
                                        <LifeBuoy className="w-12 h-12 mx-auto mb-4 opacity-20" />
                                        <p className="text-xs font-bold uppercase tracking-widest text-[var(--text-secondary)]">Sem chamados no momento</p>
                                    </td>
                                </tr>
                            ) : (
                                displayedTickets.map(ticket => (
                                    <tr key={ticket.id} className="table-row-hover group">
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col gap-1">
                                                <div className="flex items-center gap-1.5 text-[10px] font-bold text-[var(--text-tertiary)] uppercase tracking-wider">
                                                    <Clock className="w-3 h-3" />
                                                    {format(new Date(ticket.createdAt), "dd/MM/yy 'às' HH:mm", { locale: ptBR })}
                                                </div>
                                                <span className="font-mono text-sm font-black text-[var(--text-primary)]">
                                                    #{ticket.protocol}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col gap-1">
                                                <span className="font-bold text-sm text-[var(--text-primary)] flex items-center gap-2">
                                                    {ticket.supervisor.name}
                                                    {ticket.supervisor.id === 'CURRENT_USER_ID' && (
                                                        <span className="text-[10px] bg-[var(--accent-primary)]/10 text-[var(--accent-primary)] px-2 py-0.5 rounded-full uppercase tracking-wider">Você</span>
                                                    )}
                                                </span>
                                                <span className={`text-[10px] font-black uppercase tracking-widest flex items-center gap-1 ${getPriorityStyle(ticket.priority)}`}>
                                                    <div className={`w-1.5 h-1.5 rounded-full bg-current`} />
                                                    {ticket.priority} PRIORITY
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="max-w-xs xl:max-w-sm">
                                                <p className="text-sm font-bold text-[var(--text-primary)] mb-1">
                                                    {ticket.subject.replace(/_/g, ' ')}
                                                </p>
                                                <p className="text-sm text-[var(--text-secondary)] font-medium leading-relaxed line-clamp-2">
                                                    {ticket.message || 'Sem descrição adicional'}
                                                </p>
                                                {ticket.category && (
                                                    <span className="inline-block mt-2 px-2.5 py-1 bg-[var(--bg-tertiary)] text-[var(--text-tertiary)] text-[10px] font-bold rounded-lg uppercase tracking-wider border border-[var(--border-subtle)]">
                                                        {ticket.category}
                                                    </span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col items-start gap-2">
                                                <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-lg border flex items-center gap-1.5 ${getStatusStyle(ticket.status)}`}>
                                                    {ticket.status === 'RESOLVED' || ticket.status === 'CLOSED' ? <CheckCircle className="w-3.5 h-3.5" /> : <div className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />}
                                                    {getStatusLabel(ticket.status)}
                                                </span>
                                                {ticket.resolvedBy && (
                                                    <div className="flex items-center gap-1.5 text-[10px] text-[var(--text-tertiary)] font-semibold mt-1">
                                                        <span>por</span>
                                                        <span className="text-[var(--text-secondary)]">{ticket.resolvedBy.name}</span>
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            {ticket.status !== 'RESOLVED' && ticket.status !== 'CLOSED' ? (
                                                <Button
                                                    size="sm"
                                                    variant="primary"
                                                    className="w-full justify-center shadow-md bg-[var(--accent-primary)] hover:bg-[var(--accent-hover)] text-[var(--bg-primary)] border-none"
                                                    onClick={() => handleOpenTicketResponse(ticket.id, ticket.status === 'OPEN' ? 'IN_PROGRESS' : 'RESOLVED')}
                                                >
                                                    {ticket.status === 'OPEN' ? 'Assumir' : 'Finalizar'}
                                                </Button>
                                            ) : (
                                                <Button
                                                    size="sm"
                                                    variant="secondary"
                                                    className="w-full justify-center bg-[var(--bg-tertiary)] text-[var(--text-tertiary)] hover:bg-[var(--bg-secondary)] border-transparent"
                                                    onClick={() => handleOpenTicketResponse(ticket.id, 'RESOLVED')}
                                                >
                                                    Ver Resumo
                                                </Button>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination Controls */}
                {totalPages > 1 && (
                    <div className="flex items-center justify-between p-4 border-t border-[var(--border-subtle)]">
                        <p className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider">
                            Mostrando {displayedTickets.length} de {filteredTickets.length} chamados
                        </p>
                        <div className="flex items-center gap-2">
                            <Button
                                variant="secondary"
                                onClick={() => setPage(p => Math.max(1, p - 1))}
                                disabled={page === 1}
                            >
                                Anterior
                            </Button>
                            <span className="text-sm font-bold text-[var(--text-primary)] px-4">
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
            </Card>

            {selectedTicketId && (
                <TicketResponseModal
                    isOpen={isResponseModalOpen}
                    onClose={() => setIsResponseModalOpen(false)}
                    ticketId={selectedTicketId}
                    actionType={selectedActionType}
                    onSubmit={handleTicketResponseSubmit}
                />
            )}
        </div>
    );
}
