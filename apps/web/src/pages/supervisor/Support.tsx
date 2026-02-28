import { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { toast } from 'react-hot-toast';
import {
    Card,
    Badge,
    Button,
    Input
} from '../../components/ui';
import { RefreshCw, Ticket as TicketIcon, Search, Trash2, Send, AlertTriangle } from 'lucide-react';
import type { Ticket, TicketStatus } from '../../types';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export function Support() {
    // Ticket History State
    const [tickets, setTickets] = useState<Ticket[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [isDeleting, setIsDeleting] = useState<string | null>(null);

    // New Ticket Form State
    const [protocol, setProtocol] = useState('');
    const [subject, setSubject] = useState('');
    const [message, setMessage] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const fetchTickets = async () => {
        setIsLoading(true);
        try {
            const response = await api.get('/tickets');
            setTickets(response.data);
        } catch (error) {
            console.error('Erro ao buscar histórico de chamados:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchTickets();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!subject) {
            toast.error('O assunto é obrigatório.');
            return;
        }

        setIsSubmitting(true);
        try {
            await api.post('/tickets', {
                protocol,
                subject,
                message
            });
            toast.success('Chamado aberto com sucesso!');
            setProtocol('');
            setSubject('');
            setMessage('');
            fetchTickets();
        } catch (err: unknown) {
            const error = err as { response?: { data?: { error?: string } } };
            toast.error(error.response?.data?.error || 'Erro ao abrir chamado.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm('Tem certeza que deseja excluir permanentemente este chamado arquivado?')) return;

        setIsDeleting(id);
        try {
            await api.delete(`/tickets/${id}`);
            setTickets(prev => prev.filter(t => t.id !== id));
            toast.success('Chamado excluído com sucesso.');
        } catch (error) {
            console.error('Erro ao excluir chamado:', error);
            toast.error('Erro ao excluir chamado.');
        } finally {
            setIsDeleting(null);
        }
    };

    const filteredTickets = tickets.filter(ticket =>
        (ticket.protocol || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        ticket.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (ticket.message || '').toLowerCase().includes(searchTerm.toLowerCase())
    );

    const getStatusBadge = (status: TicketStatus) => {
        switch (status) {
            case 'OPEN':
                return <Badge status="SENT" label="Aberto" className="bg-yellow-50 dark:bg-yellow-500/10 text-yellow-700 dark:text-yellow-500 border-yellow-200 dark:border-yellow-500/20" />;
            case 'IN_PROGRESS':
                return <Badge status="IN_REVIEW" label="Em Andamento" className="bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-500/20" />;
            case 'RESOLVED':
                return <Badge status="RESOLVED" />;
            case 'CLOSED':
                return <Badge status="ARCHIVED" />;
            default:
                return <Badge status="default">{status}</Badge>;
        }
    };

    return (
        <div className="flex flex-col h-full animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter uppercase">Suporte Técnico</h1>
                    <p className="text-slate-500 dark:text-slate-400 font-bold mt-2 uppercase tracking-[0.2em] text-[10px]">Abertura de Chamados e Auxílio Operacional</p>
                </div>
            </div>

            <div className="flex-1 flex flex-col lg:flex-row gap-6 lg:gap-8 overflow-hidden min-h-[600px]">
                {/* Left Column: Create Ticket */}
                <div className="w-full lg:w-[400px] xl:w-[480px] flex-shrink-0 flex flex-col gap-6">
                    <Card className="flex-1 p-6 lg:p-8 bg-white dark:bg-black/20 border border-slate-200 dark:border-white/5 shadow-xl backdrop-blur-xl">
                        <div className="flex items-center gap-4 mb-8">
                            <div className="p-3 bg-indigo-50 dark:bg-indigo-500/10 rounded-2xl border border-indigo-100 dark:border-indigo-500/20">
                                <AlertTriangle className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                            </div>
                            <div>
                                <h2 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight">Novo Chamado</h2>
                                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">Acione o Suporte ADM</p>
                            </div>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <Input
                                label="Protocolo do Caso (Opcional)"
                                placeholder="EX: A1B2C3"
                                value={protocol}
                                onChange={(e) => setProtocol(e.target.value.toUpperCase())}
                                className="bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/5 text-slate-900 dark:text-white"
                            />

                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">
                                    Motivação / Assunto
                                </label>
                                <select
                                    id="ticket-subject"
                                    title="Assunto do chamado"
                                    value={subject}
                                    onChange={(e) => setSubject(e.target.value)}
                                    className="w-full px-4 py-3 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/5 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all font-bold text-slate-900 dark:text-white text-sm appearance-none cursor-pointer"
                                    required
                                >
                                    <option value="" className="dark:bg-slate-900">Selecione o motivo</option>
                                    <option value="ERRO_NO_SISTEMA" className="dark:bg-slate-900">Erro / Bug no Sistema</option>
                                    <option value="SOLICITACAO_DADOS" className="dark:bg-slate-900">Solicitação de Dados Extras</option>
                                    <option value="DUVIDA_PROCEDIMENTO" className="dark:bg-slate-900">Dúvida sobre Procedimento</option>
                                    <option value="REVISAO_PROTOCOLO" className="dark:bg-slate-900">Revisão de Protocolo</option>
                                    <option value="OUTRO" className="dark:bg-slate-900">Outro Motivo</option>
                                </select>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">
                                    Mensagem Detalhada (Opcional)
                                </label>
                                <textarea
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                    placeholder="Descreva o que aconteceu ou o que você precisa..."
                                    className="w-full h-32 px-4 py-3 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/5 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all font-medium text-slate-900 dark:text-white text-sm resize-none placeholder:text-slate-400"
                                />
                            </div>

                            <div className="pt-4">
                                <Button
                                    variant="primary"
                                    fullWidth
                                    type="submit"
                                    isLoading={isSubmitting}
                                    className="h-[52px] rounded-2xl font-black uppercase tracking-widest text-[11px] shadow-lg shadow-indigo-600/20"
                                >
                                    {!isSubmitting && <Send className="w-4 h-4 mr-2" />}
                                    Abrir Chamado
                                </Button>
                            </div>
                        </form>
                    </Card>
                </div>

                {/* Right Column: Ticket History */}
                <Card className="flex-1 flex flex-col bg-white dark:bg-black/20 border border-slate-200 dark:border-white/5 shadow-xl backdrop-blur-xl overflow-hidden p-6 lg:p-8">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-8">
                        <div>
                            <h2 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight">Meus Chamados</h2>
                            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">Acompanhamento e Histórico</p>
                        </div>

                        <div className="relative w-full sm:w-[300px]">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Buscar chamados..."
                                className="w-full pl-12 pr-4 py-3 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/5 rounded-xl text-[11px] font-black uppercase tracking-widest text-slate-900 dark:text-slate-200 focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all placeholder:text-slate-400"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
                        {isLoading && tickets.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-full text-slate-400">
                                <RefreshCw className="w-8 h-8 animate-spin mb-4 text-indigo-500" />
                                <p className="text-[10px] uppercase font-bold tracking-widest">Carregando histórico...</p>
                            </div>
                        ) : tickets.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-full py-12 text-slate-500 bg-slate-50 dark:bg-white/5 rounded-3xl border-2 border-dashed border-slate-200 dark:border-white/10">
                                <TicketIcon className="w-12 h-12 mb-4 opacity-50" />
                                <p className="text-[10px] uppercase font-bold tracking-widest">Nenhum chamado de suporte aberto.</p>
                            </div>
                        ) : filteredTickets.length === 0 ? (
                            <div className="text-center py-12 text-slate-500 text-[10px] font-bold uppercase tracking-widest">
                                Nenhum chamado correspondente encontrado.
                            </div>
                        ) : (
                            <div className="space-y-4 pb-4">
                                {filteredTickets.map((ticket) => (
                                    <Card key={ticket.id} className="p-5 border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-black/40 hover:border-slate-300 dark:hover:border-white/10 transition-colors shadow-sm">
                                        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                                            <div className="space-y-2 flex-1">
                                                <div className="flex items-center gap-3">
                                                    <span className="text-[10px] font-black px-2 py-1 bg-slate-200 dark:bg-white/10 text-slate-600 dark:text-slate-300 rounded-md">
                                                        #{ticket.protocol || 'S/P'}
                                                    </span>
                                                    <h4 className="font-black text-sm text-slate-900 dark:text-white uppercase tracking-tight">
                                                        {ticket.subject.replace(/_/g, ' ')}
                                                    </h4>
                                                </div>
                                                <p className="text-sm font-medium text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed">
                                                    {ticket.message || 'Sem mensagem adicional detalhada'}
                                                </p>
                                                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block pt-2">
                                                    ABERTO EM {format(new Date(ticket.createdAt), "dd 'de' MMMM 'às' HH:mm", { locale: ptBR })}
                                                </span>

                                                {ticket.adminResponse && (
                                                    <div className="mt-4 bg-indigo-50 dark:bg-indigo-500/10 p-4 rounded-xl border border-indigo-100 dark:border-indigo-500/20">
                                                        <div className="flex items-center gap-2 mb-2">
                                                            <span className="text-[10px] font-black uppercase tracking-widest text-indigo-600 dark:text-indigo-400">Resposta do Suporte</span>
                                                            {ticket.respondedAt && (
                                                                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                                                                    • {format(new Date(ticket.respondedAt), "dd/MM 'às' HH:mm", { locale: ptBR })}
                                                                </span>
                                                            )}
                                                        </div>
                                                        <p className="text-xs font-medium text-slate-700 dark:text-indigo-100/80 whitespace-pre-wrap leading-relaxed">
                                                            {ticket.adminResponse}
                                                        </p>
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex items-center gap-3 shrink-0">
                                                {getStatusBadge(ticket.status)}
                                                {ticket.status === 'CLOSED' && (
                                                    <button
                                                        onClick={() => handleDelete(ticket.id)}
                                                        disabled={isDeleting === ticket.id}
                                                        className="p-2 bg-slate-200 dark:bg-white/5 text-slate-500 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-xl transition-all shadow-sm"
                                                        title="Excluir Chamado Arquivado"
                                                    >
                                                        {isDeleting === ticket.id ? (
                                                            <RefreshCw className="w-4 h-4 animate-spin" />
                                                        ) : (
                                                            <Trash2 className="w-4 h-4" />
                                                        )}
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </Card>
                                ))}
                            </div>
                        )}
                    </div>
                </Card>
            </div>
        </div>
    );
}
