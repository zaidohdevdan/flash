import React from 'react';
import { Modal, Badge } from '../../ui';

interface HistoryStep {
    status: string;
    createdAt: string;
    comment: string;
    userName: string;
    departmentName?: string;
}

interface Report {
    id: string;
    history: HistoryStep[];
}

interface ReportHistoryModalProps {
    report: Report | null;
    isOpen: boolean;
    onClose: () => void;
}

export const ReportHistoryModal: React.FC<ReportHistoryModalProps> = ({
    report,
    isOpen,
    onClose
}) => {
    if (!report) return null;

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Trilha Operacional"
            subtitle={`Protocolo: #${report.id.slice(-6).toUpperCase()} • Histórico Completo`}
            maxWidth="lg"
        >
            <div className="space-y-8 py-4 px-2 relative before:absolute before:left-[19px] before:top-4 before:bottom-4 before:w-[2px] before:bg-gray-100/50">
                {report.history?.map((step, idx) => (
                    <div key={idx} className="relative pl-12 group">
                        <div className={`absolute left-0 top-1 w-10 h-10 rounded-2xl border-4 border-white shadow-md flex items-center justify-center z-10 transition-transform group-hover:scale-110 ${step.status === 'SENT' ? 'bg-yellow-400' :
                            step.status === 'IN_REVIEW' ? 'bg-blue-500' :
                                step.status === 'FORWARDED' ? 'bg-purple-500' :
                                    step.status === 'RESOLVED' ? 'bg-emerald-500' : 'bg-gray-400'
                            }`} />

                        <div className="bg-white p-5 rounded-[1.5rem] shadow-sm border border-gray-100 group-hover:shadow-md transition-all">
                            <div className="flex justify-between items-start mb-3">
                                <span className="text-[9px] font-black text-gray-400 uppercase tracking-tight">
                                    {new Date(step.createdAt).toLocaleString('pt-BR')}
                                </span>
                                <Badge status={step.status as import('../../../types').ReportStatus} />
                            </div>
                            <p className="text-sm font-medium text-gray-600 leading-relaxed mb-4">
                                {step.comment || 'Nenhuma observação registrada.'}
                            </p>
                            <div className="flex justify-between items-center pt-3 border-t border-gray-50">
                                <div className="flex items-center gap-2">
                                    <p className="text-[9px] text-gray-400 font-black uppercase">
                                        Por: <span className="text-gray-900">{step.userName}</span>
                                    </p>
                                </div>
                                {step.departmentName && (
                                    <Badge status="FORWARDED" label={step.departmentName.toUpperCase()} />
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </Modal>
    );
};
