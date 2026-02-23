import React, { useState, useEffect } from 'react';
import { api } from '../../../services/api';
import { toast } from 'react-hot-toast';
import {
    Modal,
    Card,
    Badge,
    Button
} from '../../ui';
import { RefreshCw, Ticket as TicketIcon, Search, Trash2 } from 'lucide-react';
import type { Ticket, TicketStatus } from '../../../types';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface TicketHistoryModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const TicketHistoryModal: React.FC<TicketHistoryModalProps> = ({ isOpen, onClose }) => {
    const [tickets, setTickets] = useState<Ticket[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [isDeleting, setIsDeleting] = useState<string | null>(null);

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

    useEffect(() => {
        if (isOpen) {
            fetchTickets();
        }
    }, [isOpen]);

    const getStatusBadge = (status: TicketStatus) => {
        switch (status) {
            case 'OPEN':
                return <Badge status="SENT" label="Aberto" className="bg-yellow-50 text-yellow-700 border-yellow-200" />;
            case 'IN_PROGRESS':
                return <Badge status="IN_REVIEW" label="Em Andamento" className="bg-blue-50 text-blue-700 border-blue-200" />;
            case 'RESOLVED':
                return <Badge status="RESOLVED" />;
            case 'CLOSED':
                return <Badge status="ARCHIVED" />;
            default:
                return <Badge status="default">{status}</Badge>;
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Meus Chamados de Suporte" maxWidth="xl">
            <div className="p-6">
                <div className="mb-6 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input
                        type="text"
                        placeholder="Buscar por protocolo, assunto ou mensagem..."
                        className="w-full pl-10 pr-4 py-2 bg-slate-900/50 border border-slate-700 rounded-xl text-sm text-slate-200 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                {isLoading && tickets.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-slate-400">
                        <RefreshCw className="w-8 h-8 animate-spin mb-4" />
                        <p>Carregando seu histórico...</p>
                    </div>
                ) : tickets.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-slate-500 bg-slate-900/50 rounded-xl border border-dashed border-slate-700">
                        <TicketIcon className="w-12 h-12 mb-4 opacity-20" />
                        <p>Você ainda não abriu nenhum chamado de suporte.</p>
                    </div>
                ) : (
                    <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
                        {filteredTickets.length === 0 ? (
                            <div className="text-center py-8 text-slate-500 italic text-sm">
                                Nenhum chamado corresponde à sua busca.
                            </div>
                        ) : (
                            filteredTickets.map((ticket) => (
                                <Card key={ticket.id} className="p-4 border-slate-800 bg-slate-900/40 hover:bg-slate-900/60 transition-colors">
                                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                        <div className="space-y-1 flex-1">
                                            <div className="flex items-center gap-2">
                                                <span className="text-xs font-mono text-slate-500">#{ticket.protocol || 'S/P'}</span>
                                                <h4 className="font-semibold text-slate-200">
                                                    {ticket.subject.replace(/_/g, ' ')}
                                                </h4>
                                            </div>
                                            <p className="text-sm text-slate-400 line-clamp-1">
                                                {ticket.message || 'Sem mensagem adicional'}
                                            </p>
                                            <span className="text-[10px] text-slate-500 block">
                                                Criado em {format(new Date(ticket.createdAt), "dd 'de' MMMM 'às' HH:mm", { locale: ptBR })}
                                            </span>
                                            {ticket.adminResponse && (
                                                <div className="mt-3 bg-slate-800/50 p-3 rounded-lg border border-slate-700/50">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <span className="text-xs font-bold text-blue-400">Resposta do Suporte</span>
                                                        {ticket.respondedAt && (
                                                            <span className="text-[10px] text-slate-500">
                                                                • {format(new Date(ticket.respondedAt), "dd/MM 'às' HH:mm", { locale: ptBR })}
                                                            </span>
                                                        )}
                                                    </div>
                                                    <p className="text-xs text-slate-300 whitespace-pre-wrap">
                                                        {ticket.adminResponse}
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-3">
                                            {ticket.status === 'CLOSED' && (
                                                <button
                                                    onClick={() => handleDelete(ticket.id)}
                                                    disabled={isDeleting === ticket.id}
                                                    className="p-2 text-slate-500 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all"
                                                    title="Excluir Chamado Arquivado"
                                                >
                                                    {isDeleting === ticket.id ? (
                                                        <RefreshCw className="w-4 h-4 animate-spin" />
                                                    ) : (
                                                        <Trash2 className="w-4 h-4" />
                                                    )}
                                                </button>
                                            )}
                                            {getStatusBadge(ticket.status)}
                                        </div>
                                    </div>
                                </Card>
                            ))
                        )}
                    </div>
                )}

                <div className="mt-8 flex justify-end">
                    <Button variant="secondary" onClick={onClose}>
                        Fechar
                    </Button>
                </div>
            </div>
        </Modal>
    );
};
