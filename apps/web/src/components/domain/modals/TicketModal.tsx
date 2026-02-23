import React, { useState } from 'react';
import { X, Send, AlertTriangle } from 'lucide-react';
import { Button, Input, Card } from '../../ui';
import { api } from '../../../services/api';
import { toast } from 'react-hot-toast';

interface TicketModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const TicketModal: React.FC<TicketModalProps> = ({ isOpen, onClose }) => {
    const [protocol, setProtocol] = useState('');
    const [subject, setSubject] = useState('');
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!subject) {
            toast.error('O assunto é obrigatório.');
            return;
        }

        setLoading(true);
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
            onClose();
        } catch (err: unknown) {
            const error = err as { response?: { data?: { error?: string } } };
            toast.error(error.response?.data?.error || 'Erro ao abrir chamado.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
            <Card variant="white" className="w-full max-w-lg overflow-hidden shadow-2xl border-[var(--border-subtle)]">
                <div className="flex justify-between items-center p-6 border-b border-[var(--border-subtle)] bg-[var(--bg-secondary)]">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-500/10 rounded-lg">
                            <AlertTriangle className="w-5 h-5 text-blue-500" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-[var(--text-primary)] tracking-tight">Suporte ao ADM</h2>
                            <p className="text-xs text-[var(--text-secondary)] font-medium">Abra um chamado técnico ou operacional</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        title="Fechar"
                        className="p-2 hover:bg-[var(--bg-tertiary)] rounded-full transition-colors text-[var(--text-tertiary)]"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-5">
                    <div className="space-y-4">
                        <Input
                            label="Protocolo do Caso (Opcional)"
                            placeholder="EX: A1B2C3"
                            value={protocol}
                            onChange={(e) => setProtocol(e.target.value.toUpperCase())}
                        />

                        <div className="space-y-2">
                            <label className="text-xs font-bold text-[var(--text-secondary)] ml-1 uppercase tracking-wider">
                                Motivação / Assunto
                            </label>
                            <select
                                id="ticket-subject"
                                title="Assunto do chamado"
                                value={subject}
                                onChange={(e) => setSubject(e.target.value)}
                                className="w-full px-4 py-3 bg-[var(--bg-primary)] border border-[var(--border-medium)] rounded-xl outline-none focus:ring-2 focus:ring-[var(--border-subtle)] focus:border-[var(--text-primary)] transition-all font-medium text-[var(--text-primary)] text-sm appearance-none"
                                required
                            >
                                <option value="">Selecione o motivo</option>
                                <option value="ERRO_NO_SISTEMA">Erro / Bug no Sistema</option>
                                <option value="SOLICITACAO_DADOS">Solicitação de Dados Extras</option>
                                <option value="DUVIDA_PROCEDIMENTO">Dúvida sobre Procedimento</option>
                                <option value="REVISAO_PROTOCOLO">Revisão de Protocolo</option>
                                <option value="OUTRO">Outro Motivo</option>
                            </select>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-bold text-[var(--text-secondary)] ml-1 uppercase tracking-wider">
                                Mensagem Detalhada (Opcional)
                            </label>
                            <textarea
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                placeholder="Descreva o que aconteceu ou o que você precisa..."
                                className="w-full h-32 px-4 py-3 bg-[var(--bg-primary)] border border-[var(--border-medium)] rounded-xl outline-none focus:ring-2 focus:ring-[var(--border-subtle)] focus:border-[var(--text-primary)] transition-all font-medium text-[var(--text-primary)] text-sm resize-none"
                            />
                        </div>
                    </div>

                    <div className="flex gap-3 pt-2">
                        <Button variant="secondary" fullWidth onClick={onClose} type="button">
                            Cancelar
                        </Button>
                        <Button
                            variant="primary"
                            fullWidth
                            type="submit"
                            isLoading={loading}
                            leftIcon={<Send className="w-4 h-4" />}
                        >
                            Enviar Chamado
                        </Button>
                    </div>
                </form>
            </Card>
        </div>
    );
};
