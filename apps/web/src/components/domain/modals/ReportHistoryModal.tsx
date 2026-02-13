import { Shield } from 'lucide-react';
import React from 'react';
import { Modal, Badge } from '../../ui';

interface HistoryStep {
    status: string;
    createdAt: string;
    comment: string;
    userName: string;
    departmentName?: string;
    userRole?: 'PROFESSIONAL' | 'SUPERVISOR' | 'MANAGER' | 'ADMIN';
}

interface Report {
    id: string;
    history: HistoryStep[];
    department?: {
        name: string;
    };
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
            title="Linha do Tempo"
            subtitle={`Reporte: #${report.id.slice(-6).toUpperCase()}${report.department?.name ? ` • Setor Atual: ${report.department.name}` : ''}`}
            maxWidth="lg"
        >
            <div className="space-y-8 py-4 px-2 relative before:absolute before:left-[19px] before:top-4 before:bottom-4 before:w-[2px] before:bg-[var(--border-subtle)]">
                {report.history?.map((step, idx) => (
                    <div key={idx} className="relative pl-12 group">
                        <div className={`absolute left-0 top-1 w-10 h-10 rounded-2xl border-4 border-[var(--bg-primary)] shadow-md flex items-center justify-center z-10 transition-transform group-hover:scale-110 ${step.status === 'SENT' ? 'bg-yellow-400' :
                            step.status === 'IN_REVIEW' ? 'bg-blue-500' :
                                step.status === 'FORWARDED' ? 'bg-purple-500' :
                                    step.status === 'RESOLVED' ? 'bg-emerald-500' : 'bg-gray-400'
                            }`} />
                        <div className="bg-[var(--bg-primary)] p-5 rounded-[1.5rem] shadow-sm border border-[var(--border-subtle)] group-hover:shadow-md transition-all">
                            <div className="flex justify-between items-start mb-3">
                                <span className="text-[9px] font-black text-[var(--text-tertiary)] uppercase tracking-tight">
                                    {new Date(step.createdAt).toLocaleString('pt-BR')}
                                </span>
                                <Badge status={step.status as import('../../../types').ReportStatus} />
                            </div>
                            <p className="text-sm font-medium text-[var(--text-secondary)] leading-relaxed mb-4">
                                {step.comment || "Em tramitação"}
                            </p>
                            <div className="flex justify-between items-center pt-3 border-t border-[var(--bg-secondary)]">
                                <div className="flex items-center gap-2">
                                    <p className="text-[9px] text-[var(--text-tertiary)] font-black uppercase">
                                        Por <span className="text-[var(--text-primary)]">{step.userName}</span>
                                    </p>
                                    {/* Visual cue for internal comments (Only visible to non-professionals as per backend filter, but good to show icon if data exists) */}
                                    {step.userRole && ['MANAGER', 'ADMIN', 'SUPERVISOR'].includes(step.userRole) && (
                                        <div className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-[var(--bg-secondary)] border border-[var(--border-subtle)]" title="Comentário Interno / Corporativo">
                                            <Shield className="w-3 h-3 text-[var(--text-tertiary)]" />
                                            <span className="text-[8px] font-bold text-[var(--text-tertiary)] uppercase">Interno</span>
                                        </div>
                                    )}
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
