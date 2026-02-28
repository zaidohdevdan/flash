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
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/40 dark:bg-black/60 backdrop-blur-xl animate-in fade-in duration-500">
            <div className="w-full max-w-md bg-white dark:bg-[#020617] rounded-[3rem] border border-slate-200 dark:border-white/10 shadow-2xl overflow-hidden flex flex-col backdrop-blur-3xl">
                {/* Header */}
                <div className="p-10 pb-6 flex items-center justify-between">
                    <div className="flex items-center gap-5">
                        <div className="w-14 h-14 bg-indigo-50 dark:bg-indigo-500/10 rounded-2xl flex items-center justify-center text-indigo-500 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-500/20 shadow-xl shadow-indigo-500/10">
                            <Video className="w-7 h-7" />
                        </div>
                        <div>
                            <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-[0.3em] leading-none">
                                {isAdding ? 'CONVOCAR MEMBROS' : 'INICIAR WAR ROOM'}
                            </h3>
                            <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mt-2 opacity-80">
                                Seleção de Operadores Disponíveis
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        title="Fechar"
                        className="p-3 bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 rounded-2xl transition-all text-slate-500 dark:text-slate-500 hover:text-slate-800 dark:hover:text-white border border-slate-200 dark:border-white/5 active:scale-90"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="px-10 pb-6">
                    <button
                        onClick={handleSelectAll}
                        className="text-[9px] font-black text-indigo-400 uppercase tracking-[0.2em] hover:text-indigo-300 transition-colors bg-indigo-500/5 px-4 py-2 rounded-full border border-indigo-500/10"
                    >
                        {selectedIds.length === participants.length ? 'DESMARCAR ESQUADRÃO' : 'SELECIONAR TODOS'}
                    </button>
                </div>

                {/* List */}
                <div className="flex-1 overflow-y-auto px-6 max-h-[400px] space-y-3 pb-8 scrollbar-hide">
                    {participants.length === 0 ? (
                        <div className="p-12 text-center bg-slate-50 dark:bg-black/20 rounded-[2rem] border border-dashed border-slate-200 dark:border-white/5">
                            <Users className="w-10 h-10 mx-auto text-slate-400 dark:text-slate-700 mb-4 opacity-40 dark:opacity-100" />
                            <p className="text-[10px] font-black text-slate-500 dark:text-slate-600 uppercase tracking-widest">
                                Nenhum operador online disponível para convocação
                            </p>
                        </div>
                    ) : (
                        participants.map(participant => (
                            <button
                                key={participant.id}
                                onClick={() => toggleParticipant(participant.id)}
                                className={`
                                    w-full flex items-center gap-4 p-5 rounded-[2rem] border transition-all duration-500 group
                                    ${isSelected(participant.id)
                                        ? 'bg-indigo-50 dark:bg-indigo-600/10 border-indigo-200 dark:border-indigo-500/50 shadow-2xl shadow-indigo-500/10'
                                        : 'bg-slate-100 dark:bg-black/30 border-slate-200 dark:border-white/5 hover:border-slate-300 dark:hover:border-white/10'}
                                `}
                            >
                                <div className="relative">
                                    <div className={`
                                        w-12 h-12 rounded-2xl flex items-center justify-center overflow-hidden border transition-all duration-500
                                        ${isSelected(participant.id) ? 'border-indigo-400 shadow-[0_0_15px_rgba(129,140,248,0.3)]' : 'border-slate-300 dark:border-white/10 bg-slate-200 dark:bg-slate-900'}
                                    `}>
                                        {participant.avatarUrl ? (
                                            <img src={participant.avatarUrl} alt={participant.name} className="w-full h-full object-cover" />
                                        ) : (
                                            participant.role === 'SUPERVISOR' || participant.role === 'ADMIN'
                                                ? <Shield className="w-5 h-5 text-indigo-500 dark:text-indigo-400/60" />
                                                : <User className="w-5 h-5 text-slate-500" />
                                        )}
                                    </div>
                                    <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 border-[3px] border-white dark:border-[#020617] shadow-lg animate-pulse" />
                                </div>

                                <div className="flex-1 text-left min-w-0">
                                    <p className={`text-[11px] font-black uppercase tracking-widest truncate transition-colors duration-500 ${isSelected(participant.id) ? 'text-slate-900 dark:text-white' : 'text-slate-600 dark:text-slate-300'}`}>
                                        {participant.name}
                                    </p>
                                    <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest truncate mt-1">
                                        {participant.role}
                                    </p>
                                </div>

                                <div className={`
                                    w-7 h-7 rounded-xl flex items-center justify-center transition-all duration-500 border
                                    ${isSelected(participant.id)
                                        ? 'bg-indigo-600 border-indigo-400 text-white scale-110 shadow-lg shadow-indigo-500/50'
                                        : 'bg-slate-200 dark:bg-black/40 border-slate-300 dark:border-white/5 text-transparent'}
                                `}>
                                    <Check className="w-4 h-4" />
                                </div>
                            </button>
                        ))
                    )}
                </div>

                {/* Footer */}
                <div className="p-10 pt-6 bg-slate-50 dark:bg-black/40 border-t border-slate-200 dark:border-white/5 backdrop-blur-md">
                    <Button
                        variant="primary"
                        fullWidth
                        size="lg"
                        disabled={selectedIds.length === 0}
                        onClick={() => onConfirm(selectedIds)}
                        className={`h-14 font-black uppercase tracking-[0.3em] text-[11px] !rounded-2xl transition-all shadow-2xl ${selectedIds.length > 0 ? 'bg-indigo-600 hover:bg-indigo-500 shadow-indigo-600/20' : 'opacity-40'}`}
                    >
                        <Video className="w-4 h-4 mr-3" />
                        {isAdding ? 'CONVOCAR' : 'ESTABELECER CANAL'} ({selectedIds.length})
                    </Button>
                </div>
            </div>
        </div>
    );
}
