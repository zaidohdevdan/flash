import { useState, useEffect } from 'react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { api } from '../../services/api';
import toast from 'react-hot-toast';
import { Mail, MailOpen, Search, Eye, Trash2, Clock, AlertCircle, RefreshCw, AlertTriangle } from 'lucide-react';
import { format } from 'date-fns';
import { Modal } from '../../components/ui/Modal';
import { ptBR } from 'date-fns/locale';

interface ContactMessage {
    id: string;
    name: string;
    email: string;
    message: string;
    read: boolean;
    createdAt: string;
}

export function AdminInbox() {
    const [messages, setMessages] = useState<ContactMessage[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [page, setPage] = useState(1);
    const MESSAGES_PER_PAGE = 7;

    // Modals
    const [selectedContact, setSelectedContact] = useState<ContactMessage | null>(null);
    const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    useEffect(() => {
        fetchMessages();
    }, []);

    const fetchMessages = async () => {
        setLoading(true);
        try {
            const res = await api.get('/admin/contacts?limit=1000');
            setMessages(res.data.data || []);
        } catch {
            toast.error('Erro ao carregar mensagens');
        } finally {
            setLoading(false);
        }
    };

    const handleMarkAsRead = async (id: string, currentStatus: boolean) => {
        try {
            await api.patch(`/admin/contacts/${id}/read`, { read: !currentStatus });
            toast.success('Status da mensagem atualizado');
            setMessages(prev => prev.map(m => m.id === id ? { ...m, read: !currentStatus } : m));
            if (selectedContact?.id === id) {
                setSelectedContact(prev => prev ? { ...prev, read: !currentStatus } : prev);
            }
        } catch {
            toast.error('Erro ao atualizar mensagem');
        }
    };

    const handleDeleteContact = async () => {
        if (!selectedContact) return;
        setIsDeleting(true);
        try {
            await api.delete(`/admin/contacts/${selectedContact.id}`);
            toast.success('Mensagem excluída com sucesso');
            setMessages(prev => prev.filter(m => m.id !== selectedContact.id));
            setIsDeleteModalOpen(false);
            setSelectedContact(null);
        } catch {
            toast.error('Erro ao excluir mensagem');
        } finally {
            setIsDeleting(false);
        }
    };

    const openDetails = (contact: ContactMessage) => {
        setSelectedContact(contact);
        setIsDetailsModalOpen(true);
        if (!contact.read) {
            handleMarkAsRead(contact.id, contact.read);
        }
    };

    const confirmDelete = (contact: ContactMessage) => {
        setSelectedContact(contact);
        setIsDeleteModalOpen(true);
    };

    const filteredMessages = messages.filter(m =>
        m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.message.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const totalPages = Math.ceil(filteredMessages.length / MESSAGES_PER_PAGE);
    const displayedMessages = filteredMessages.slice(
        (page - 1) * MESSAGES_PER_PAGE,
        page * MESSAGES_PER_PAGE
    );

    if (loading) {
        return (
            <div className="flex justify-center flex-col gap-4 items-center py-20">
                <div className="w-8 h-8 rounded-full border-4 border-indigo-500 border-t-transparent animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-black text-[var(--text-primary)] uppercase tracking-tight mb-1 flex items-center gap-3">
                        <Mail className="w-8 h-8 text-indigo-500" /> Caixa de Entrada
                    </h1>
                    <p className="text-xs text-[var(--text-secondary)] font-medium">Contatos do landing page comercial</p>
                </div>
                <button
                    type="button"
                    onClick={fetchMessages}
                    title="Sincronizar Emails"
                    className="w-10 h-10 p-0 flex items-center justify-center text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)] bg-[var(--bg-primary)] border border-[var(--border-subtle)] rounded-xl transition-all"
                >
                    <RefreshCw className="w-4 h-4" />
                </button>
            </div>

            <Card variant="white" className="p-3 bg-white/70 dark:bg-black/60 border border-slate-200 dark:border-white/5 shadow-xl backdrop-blur-md">
                <div className="relative w-full">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-slate-500" />
                    <input
                        type="text"
                        placeholder="Buscar por Nome, Empresa, E-mail ou Assunto..."
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-black/40 border-slate-200 dark:border-white/5 border rounded-xl focus:bg-white dark:focus:bg-black/60 focus:border-indigo-500 outline-none transition-all text-sm font-bold text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-600 uppercase tracking-tight"
                    />
                </div>
            </Card>

            <Card variant="white" className="overflow-hidden bg-white/70 dark:bg-black/60 border border-slate-200 dark:border-white/5 shadow-2xl backdrop-blur-md rounded-2xl">
                <div className="overflow-x-auto w-full">
                    <table className="w-full min-w-max text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50 dark:bg-black/40 text-[11px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest border-b border-slate-200 dark:border-white/5">
                                <th className="px-6 py-4">Remetente / Empresa</th>
                                <th className="px-6 py-4">Mensagem de Contato</th>
                                <th className="px-6 py-4">Status / Tempo</th>
                                <th className="px-6 py-4 text-right">Ação</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[var(--border-subtle)]">
                            {displayedMessages.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="px-6 py-24 text-center text-[var(--text-tertiary)]">
                                        <MailOpen className="w-12 h-12 mx-auto mb-4 opacity-20" />
                                        <p className="text-xs font-bold uppercase tracking-widest text-[var(--text-secondary)]">Sua caixa de entrada está vazia</p>
                                    </td>
                                </tr>
                            ) : (
                                displayedMessages.map(contact => (
                                    <tr key={contact.id} className={`table-row-hover group transition-colors ${!contact.read ? 'bg-indigo-500/5 dark:bg-indigo-500/10' : ''}`}>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col gap-1 w-48 truncate">
                                                <span className={`text-sm ${!contact.read ? 'font-black text-indigo-600 dark:text-indigo-400' : 'font-black text-slate-900 dark:text-white uppercase tracking-tight'}`}>
                                                    {contact.name}
                                                </span>
                                                <span className={`text-[11px] font-bold ${!contact.read ? 'text-indigo-500/80' : 'text-slate-500 dark:text-slate-500'}`}>
                                                    {contact.email}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="max-w-md xl:max-w-xl">
                                                <p className={`text-sm leading-relaxed whitespace-pre-wrap ${!contact.read ? 'text-indigo-900 dark:text-indigo-100 font-bold' : 'text-slate-600 dark:text-slate-400 font-medium'}`}>
                                                    {contact.message}
                                                </p>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col items-start gap-2">
                                                {contact.read ? (
                                                    <Badge status="RESOLVED" label="LIDA" />
                                                ) : (
                                                    <span className="text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-lg border border-indigo-200 dark:border-indigo-500/30 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center gap-1.5 shadow-sm">
                                                        <AlertCircle className="w-3.5 h-3.5" /> NOVA
                                                    </span>
                                                )}
                                                <div className="flex items-center gap-1.5 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mt-1">
                                                    <Clock className="w-3 h-3" />
                                                    {format(new Date(contact.createdAt), "dd/MM/yy 'às' HH:mm", { locale: ptBR })}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2 outline-none">
                                                <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    className="text-blue-500 hover:bg-blue-50 hover:text-blue-600 px-3"
                                                    onClick={() => openDetails(contact)}
                                                >
                                                    <Eye className="w-4 h-4 mr-1.5" /> Detalhes
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    className="text-red-500 hover:bg-red-50 hover:text-red-600 px-3"
                                                    onClick={() => confirmDelete(contact)}
                                                >
                                                    <Trash2 className="w-4 h-4 mr-1.5" /> Excluir
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="secondary"
                                                    className={`w-36 justify-center border-transparent shadow-sm ${!contact.read ? 'bg-indigo-600 text-white hover:bg-indigo-700' : 'bg-[var(--bg-tertiary)] text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)]'}`}
                                                    onClick={() => handleMarkAsRead(contact.id, contact.read)}
                                                >
                                                    {contact.read ? 'Marcar Não Lida' : 'Marcar como Lida'}
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </Card>

            {totalPages > 1 && (
                <div className="flex items-center justify-between pt-4">
                    <p className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider">
                        Mostrando {displayedMessages.length} de {filteredMessages.length} mensagens
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

            {/* Modal de Detalhes da Mensagem */}
            <Modal
                isOpen={isDetailsModalOpen}
                onClose={() => setIsDetailsModalOpen(false)}
                title="Detalhes do Contato"
                maxWidth="lg"
            >
                {selectedContact && (
                    <div className="space-y-6 pt-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <p className="text-[10px] font-black uppercase text-[var(--text-tertiary)] tracking-widest mb-1">
                                    Remetente
                                </p>
                                <p className="text-sm font-bold text-[var(--text-primary)]">
                                    {selectedContact.name}
                                </p>
                            </div>
                            <div>
                                <p className="text-[10px] font-black uppercase text-[var(--text-tertiary)] tracking-widest mb-1">
                                    Email
                                </p>
                                <a href={`mailto:${selectedContact.email}`} className="text-sm font-bold text-indigo-600 hover:underline">
                                    {selectedContact.email}
                                </a>
                            </div>
                            <div>
                                <p className="text-[10px] font-black uppercase text-[var(--text-tertiary)] tracking-widest mb-1">
                                    Data de Envio
                                </p>
                                <p className="text-sm font-bold text-[var(--text-secondary)] flex items-center gap-1.5">
                                    <Clock className="w-4 h-4" />
                                    {format(new Date(selectedContact.createdAt), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                                </p>
                            </div>
                            <div>
                                <p className="text-[10px] font-black uppercase text-[var(--text-tertiary)] tracking-widest mb-1">
                                    Status
                                </p>
                                {selectedContact.read ? (
                                    <Badge status="RESOLVED" label="LIDA" />
                                ) : (
                                    <Badge status="SENT" label="NÃO LIDA" />
                                )}
                            </div>
                        </div>

                        <div className="pt-4 border-t border-[var(--border-subtle)]">
                            <p className="text-[10px] font-black uppercase text-[var(--text-tertiary)] tracking-widest mb-3 flex items-center gap-2">
                                <Mail className="w-4 h-4" /> Mensagem
                            </p>
                            <div className="bg-[var(--bg-tertiary)] p-4 rounded-2xl border border-[var(--border-subtle)]">
                                <p className="text-sm text-[var(--text-primary)] whitespace-pre-wrap leading-relaxed">
                                    {selectedContact.message}
                                </p>
                            </div>
                        </div>

                        <div className="flex justify-between items-center pt-6 border-t border-[var(--border-subtle)]">
                            <Button
                                variant="ghost"
                                className="text-red-500 hover:bg-red-50 hover:text-red-600"
                                onClick={() => {
                                    setIsDetailsModalOpen(false);
                                    confirmDelete(selectedContact);
                                }}
                            >
                                <Trash2 className="w-4 h-4 mr-2" /> Excluir
                            </Button>
                            <div className="flex gap-2 text-right">
                                <Button variant="secondary" onClick={() => setIsDetailsModalOpen(false)}>Fechar</Button>
                                <Button
                                    variant={selectedContact.read ? 'secondary' : 'primary'}
                                    className={!selectedContact.read ? 'bg-indigo-600 text-white border-0 hover:bg-indigo-700' : ''}
                                    onClick={() => handleMarkAsRead(selectedContact.id, selectedContact.read)}
                                >
                                    {selectedContact.read ? 'Marcar Não Lida' : 'Marcar Lida'}
                                </Button>
                            </div>
                        </div>
                    </div>
                )}
            </Modal>

            {/* Modal de Exclusão */}
            <Modal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                title="Atenção: Excluir Mensagem"
                maxWidth="md"
            >
                <div className="space-y-4 pt-4">
                    <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
                        <div className="flex items-center gap-3 mb-2">
                            <AlertTriangle className="w-5 h-5 text-red-600" />
                            <h3 className="font-bold text-red-600">Ação Irreversível</h3>
                        </div>
                        <p className="text-sm text-red-600/80">
                            Tem certeza que deseja excluir esta mensagem de <strong>{selectedContact?.name}</strong> permanentemente? Esta ação não pode ser desfeita.
                        </p>
                    </div>
                    <div className="flex justify-end gap-3 pt-4 border-t border-[var(--border-subtle)]">
                        <Button variant="secondary" onClick={() => setIsDeleteModalOpen(false)}>Cancelar</Button>
                        <Button variant="primary" className="bg-red-600 hover:bg-red-700 text-white border-0" isLoading={isDeleting} onClick={handleDeleteContact}>
                            Confirmar Exclusão
                        </Button>
                    </div>
                </div>
            </Modal>
        </div>
    );
}
