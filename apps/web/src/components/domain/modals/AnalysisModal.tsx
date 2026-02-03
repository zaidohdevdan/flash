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
    title = "Análise de Fluxo"
}) => {
    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={title}
            subtitle="Gestão de Operações e Feedback"
            maxWidth="lg"
            footer={
                <>
                    <Button variant="secondary" onClick={onClose}>
                        Cancelar
                    </Button>
                    <Button
                        variant={targetStatus === 'RESOLVED' ? 'success' : 'primary'}
                        onClick={onConfirm}
                    >
                        {targetStatus === 'RESOLVED' ? 'Finalizar e Resolver' : targetStatus === 'FORWARDED' ? 'Encaminhar Agora' : 'Atualizar Status'}
                    </Button>
                </>
            }
        >
            <div className="space-y-6 py-2">
                <TextArea
                    label="Parecer Técnico / Resumo da Ação"
                    value={feedback}
                    onChange={e => setFeedback(e.target.value)}
                    placeholder="Descreva as providências ou análise técnica..."
                    rows={5}
                />

                <div className="space-y-4">
                    <label className="text-[10px] font-black text-gray-700 uppercase tracking-widest ml-1">Próxima Etapa</label>
                    <div className="flex items-center justify-between p-1 bg-blue-50/40 rounded-2xl border border-blue-50/60">
                        {[
                            { id: 'IN_REVIEW', label: 'ANÁLISE', color: 'text-blue-600' },
                            { id: 'FORWARDED', label: 'DEPARTAMENTO', color: 'text-purple-600' },
                            { id: 'RESOLVED', label: 'RESOLVIDO', color: 'text-emerald-600' }
                        ].map(opt => (
                            <button
                                key={opt.id}
                                onClick={() => setTargetStatus(opt.id as any)}
                                className={`flex-1 py-3 text-[9px] font-black tracking-widest rounded-xl transition-all ${targetStatus === opt.id ? 'bg-white shadow-xl ' + opt.color : 'text-gray-400 hover:text-gray-600'}`}
                            >
                                {opt.label}
                            </button>
                        ))}
                    </div>

                    {targetStatus === 'FORWARDED' && (
                        <div className="space-y-4 animate-in slide-in-from-top-4 duration-500">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-700 uppercase tracking-widest ml-1">Destinar para:</label>
                                <select
                                    value={selectedDeptId}
                                    onChange={e => setSelectedDeptId(e.target.value)}
                                    className="w-full px-5 py-3.5 bg-gray-50/50 border border-gray-100 rounded-2xl outline-none focus:bg-white focus:border-purple-500/50 transition-all font-bold text-gray-700 appearance-none text-xs"
                                >
                                    <option value="">-- Escolha um destino --</option>
                                    {departments.map(d => (
                                        <option key={d.id} value={d.id}>{d.name}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </Modal>
    );
};
