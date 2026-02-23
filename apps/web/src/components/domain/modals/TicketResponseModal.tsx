import { useState, useEffect } from 'react';
import { Modal } from '../../ui/Modal';
import { Button } from '../../ui/Button';

interface TicketResponseModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (response: string) => Promise<void>;
    ticketId: string | null;
    actionType: 'IN_PROGRESS' | 'RESOLVED' | null;
    currentResponse?: string;
}

export function TicketResponseModal({
    isOpen,
    onClose,
    onSubmit,
    ticketId,
    actionType,
    currentResponse = ''
}: TicketResponseModalProps) {
    const [response, setResponse] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setResponse(currentResponse);
        }
    }, [isOpen, currentResponse]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        setIsSubmitting(true);
        try {
            await onSubmit(response);
            onClose();
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isOpen || !ticketId || !actionType) return null;

    const title = actionType === 'IN_PROGRESS'
        ? 'Assumir Chamado e Enviar Mensagem'
        : 'Finalizar Chamado com Resposta';

    const description = actionType === 'IN_PROGRESS'
        ? 'Você pode enviar uma mensagem ao supervisor informando que está assumindo o caso.'
        : 'Descreva a solução ou feedback que será enviado ao supervisor.';

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={title}>
            <form onSubmit={handleSubmit} className="space-y-4">
                <p className="text-sm text-slate-400">
                    {description}
                </p>

                <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-300">Mensagem (Opcional)</label>
                    <textarea
                        value={response}
                        onChange={(e) => setResponse(e.target.value)}
                        placeholder="Digite sua resposta aqui..."
                        className="w-full h-32 px-3 py-2 bg-slate-900/50 border border-slate-700/50 rounded-lg text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 resize-none transition-all"
                    />
                </div>

                <div className="flex justify-end gap-2 pt-4 border-t border-slate-800">
                    <Button
                        type="button"
                        variant="secondary"
                        onClick={onClose}
                        disabled={isSubmitting}
                    >
                        Cancelar
                    </Button>
                    <Button
                        type="submit"
                        variant="primary"
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? 'Salvando...' : 'Confirmar e Enviar'}
                    </Button>
                </div>
            </form>
        </Modal>
    );
}
