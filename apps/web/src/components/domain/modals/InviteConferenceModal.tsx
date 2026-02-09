import { useState } from 'react';
import { X, Users, Shield, User, Check, Video } from 'lucide-react';
import { Button } from '../../ui/Button';

interface Participant {
    id: string;
    name: string;
    role: string;
    avatarUrl?: string | null;
    isOnline?: boolean;
}

interface InviteConferenceModalProps {
    isOpen: boolean;
    onClose: () => void;
    participants: Participant[];
    onConfirm: (selectedIds: string[]) => void;
    isAdding?: boolean;
}

export function InviteConferenceModal({ isOpen, onClose, participants, onConfirm, isAdding }: InviteConferenceModalProps) {
    const [selectedIds, setSelectedIds] = useState<string[]>([]);

    if (!isOpen) return null;

    const toggleParticipant = (id: string) => {
        setSelectedIds(prev =>
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    };

    const handleSelectAll = () => {
        if (selectedIds.length === participants.length) {
            setSelectedIds([]);
        } else {
            setSelectedIds(participants.map(p => p.id));
        }
    };

    const isSelected = (id: string) => selectedIds.includes(id);

    return (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="w-full max-w-md bg-[var(--bg-primary)] rounded-[2.5rem] border border-[var(--border-subtle)] shadow-2xl overflow-hidden flex flex-col">
                {/* Header */}
                <div className="p-8 pb-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-red-500/10 rounded-2xl flex items-center justify-center text-red-500">
                            <Video className="w-6 h-6" />
                        </div>
                        <div>
                            <h3 className="text-xl font-black text-[var(--text-primary)] uppercase tracking-tighter">
                                {isAdding ? 'Convidar Membros' : 'Iniciar War Room'}
                            </h3>
                            <p className="text-[10px] font-bold text-[var(--text-tertiary)] uppercase tracking-widest">
                                Selecione os participantes
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        title="Fechar"
                        className="p-2 hover:bg-[var(--bg-secondary)] rounded-xl transition-colors text-[var(--text-tertiary)]"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="px-8 pb-4">
                    <button
                        onClick={handleSelectAll}
                        className="text-[10px] font-black text-[var(--accent-primary)] uppercase tracking-widest hover:underline"
                    >
                        {selectedIds.length === participants.length ? 'Desmarcar Todos' : 'Selecionar Todos'}
                    </button>
                </div>

                {/* List */}
                <div className="flex-1 overflow-y-auto px-4 max-h-[400px] space-y-2 pb-8">
                    {participants.length === 0 ? (
                        <div className="p-8 text-center">
                            <Users className="w-8 h-8 mx-auto text-[var(--text-tertiary)] opacity-20 mb-4" />
                            <p className="text-xs font-bold text-[var(--text-tertiary)] uppercase tracking-widest">
                                Nenhum membro online disponível
                            </p>
                        </div>
                    ) : (
                        participants.map(participant => (
                            <button
                                key={participant.id}
                                onClick={() => toggleParticipant(participant.id)}
                                className={`
                                    w-full flex items-center gap-4 p-4 rounded-3xl border transition-all duration-300
                                    ${isSelected(participant.id)
                                        ? 'bg-[var(--accent-primary)]/5 border-[var(--accent-primary)] shadow-sm'
                                        : 'bg-[var(--bg-secondary)] border-transparent hover:border-[var(--border-subtle)]'}
                                `}
                            >
                                <div className="relative">
                                    <div className={`
                                        w-12 h-12 rounded-2xl flex items-center justify-center overflow-hidden border border-[var(--border-subtle)]
                                        ${participant.avatarUrl ? '' : 'bg-[var(--bg-tertiary)]'}
                                    `}>
                                        {participant.avatarUrl ? (
                                            <img src={participant.avatarUrl} alt={participant.name} className="w-full h-full object-cover" />
                                        ) : (
                                            participant.role === 'SUPERVISOR' || participant.role === 'ADMIN'
                                                ? <Shield className="w-5 h-5 text-[var(--text-tertiary)]" />
                                                : <User className="w-5 h-5 text-[var(--text-tertiary)]" />
                                        )}
                                    </div>
                                    <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-[var(--bg-primary)] shadow-sm" />
                                </div>

                                <div className="flex-1 text-left min-w-0">
                                    <p className="text-sm font-black text-[var(--text-primary)] truncate uppercase tracking-tighter">
                                        {participant.name}
                                    </p>
                                    <p className="text-[10px] font-bold text-[var(--text-tertiary)] uppercase tracking-widest truncate">
                                        {participant.role}
                                    </p>
                                </div>

                                <div className={`
                                    w-6 h-6 rounded-lg flex items-center justify-center transition-all
                                    ${isSelected(participant.id)
                                        ? 'bg-[var(--accent-primary)] text-white scale-110'
                                        : 'bg-[var(--bg-tertiary)] text-transparent'}
                                `}>
                                    <Check className="w-3.5 h-3.5" />
                                </div>
                            </button>
                        ))
                    )}
                </div>

                {/* Footer */}
                <div className="p-8 pt-4 bg-[var(--bg-secondary)]/50 border-t border-[var(--border-subtle)]">
                    <Button
                        variant="primary"
                        fullWidth
                        size="lg"
                        disabled={selectedIds.length === 0}
                        onClick={() => onConfirm(selectedIds)}
                        className="group"
                    >
                        <Video className="w-4 h-4 mr-2" />
                        {isAdding ? 'Convidar' : 'Iniciar'} com {selectedIds.length} {selectedIds.length === 1 ? 'membro' : 'membros'}
                    </Button>
                </div>
            </div>
        </div>
    );
}
