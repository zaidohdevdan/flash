import React from 'react';
import { Modal, Button, TextArea } from '../../ui';

interface Department {
    id: string;
    name: string;
}

interface AnalysisModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    targetStatus: 'IN_REVIEW' | 'FORWARDED' | 'RESOLVED';
    setTargetStatus: (status: 'IN_REVIEW' | 'FORWARDED' | 'RESOLVED') => void;
    feedback: string;
    setFeedback: (feedback: string) => void;
    selectedDeptId: string;
    setSelectedDeptId: (id: string) => void;
    departments: Department[];
    title?: string;
}

export const AnalysisModal: React.FC<AnalysisModalProps> = ({
    isOpen,
    onClose,
    onConfirm,
    targetStatus,
    setTargetStatus,
    feedback,
    setFeedback,
    selectedDeptId,
    setSelectedDeptId,
    departments,
    title
}) => {
    const modalTitle = title || "Análise de Relatório";

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={modalTitle}
            subtitle="DETERMINE O PRÓXIMO PROTOCOLO OPERACIONAL"
            maxWidth="lg"
            footer={
                <div className="flex gap-4 w-full">
                    <Button
                        variant="secondary"
                        onClick={onClose}
                        className="flex-1 bg-slate-100 dark:bg-white/5 border-slate-200 dark:border-white/5 text-slate-600 dark:text-slate-400 font-black uppercase tracking-widest text-[11px] h-12 !rounded-xl"
                    >
                        Abortar
                    </Button>
                    <Button
                        variant="primary"
                        onClick={onConfirm}
                        className={`flex-[2] font-black uppercase tracking-[0.2em] text-[11px] h-12 !rounded-xl transition-all shadow-2xl ${targetStatus === 'RESOLVED'
                            ? 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-500/20'
                            : 'bg-indigo-600 hover:bg-indigo-500 shadow-indigo-500/20'
                            }`}
                    >
                        {targetStatus === 'RESOLVED'
                            ? 'FINALIZAR PROTOCOLO'
                            : targetStatus === 'FORWARDED'
                                ? 'ENCAMINHAR TRAMITAÇÃO'
                                : 'ATUALIZAR STATUS'}
                    </Button>
                </div>
            }
        >
            <div className="space-y-8 py-4">
                <TextArea
                    label="PARECER TÁTICO"
                    value={feedback}
                    onChange={e => setFeedback(e.target.value)}
                    placeholder="DESCREVA A ANÁLISE OU INSTRUÇÕES PARA ESTE REGISTRO..."
                    rows={6}
                    className="bg-white dark:bg-black/40 border-slate-200 dark:border-white/10 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-700 font-bold text-xs !rounded-2xl backdrop-blur-md"
                />

                <div className="space-y-5">
                    <label className="text-[11px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-[0.3em] ml-1">ETAPA OPERACIONAL</label>
                    <div className="grid grid-cols-3 gap-2 p-1.5 bg-slate-50 dark:bg-black/40 rounded-2xl border border-slate-200 dark:border-white/5 backdrop-blur-md">
                        {[
                            { id: 'IN_REVIEW', label: 'ANÁLISE', activeColor: 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20' },
                            { id: 'FORWARDED', label: 'TRAMITAR', activeColor: 'bg-amber-600 text-white shadow-lg shadow-amber-500/20' },
                            { id: 'RESOLVED', label: 'RESOLVIDO', activeColor: 'bg-emerald-600 text-white shadow-lg shadow-emerald-500/20' }
                        ].map(opt => (
                            <button
                                type="button"
                                key={opt.id}
                                onClick={() => setTargetStatus(opt.id as AnalysisModalProps['targetStatus'])}
                                className={`py-3 text-[11px] font-black tracking-widest rounded-xl transition-all border ${targetStatus === opt.id ? opt.activeColor + ' border-transparent' : 'text-slate-500 border-transparent hover:text-slate-700 dark:hover:text-slate-300'}`}
                            >
                                {opt.label}
                            </button>
                        ))}
                    </div>

                    {targetStatus === 'FORWARDED' && (
                        <div className="space-y-5 animate-in slide-in-from-top-4 duration-500 pt-2">
                            <div className="space-y-3">
                                <label className="text-[11px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-[0.3em] ml-1">DESTINO DA TRAMITAÇÃO</label>
                                <div className="relative group/select">
                                    <select
                                        value={selectedDeptId}
                                        onChange={e => setSelectedDeptId(e.target.value)}
                                        className="w-full px-6 py-4 bg-white dark:bg-black/40 border border-slate-200 dark:border-white/5 rounded-2xl outline-none focus:border-indigo-500/50 transition-all font-black text-slate-800 dark:text-white appearance-none text-[11px] uppercase tracking-widest backdrop-blur-md shadow-inner"
                                        aria-label="Selecionar Destino"
                                        title="Selecionar Destino"
                                    >
                                        <option value="" className="bg-white dark:bg-[#020617]">SELECIONAR DESTINO</option>
                                        {departments.map(d => (
                                            <option key={d.id} value={d.id} className="bg-white dark:bg-[#020617]">{d.name.toUpperCase()}</option>
                                        ))}
                                    </select>
                                    <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500 group-focus-within/select:text-indigo-400 transition-colors">
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                        </svg>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </Modal>
    );
};
