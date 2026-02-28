import { Shield, Image as ImageIcon } from 'lucide-react';
import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import { Modal, Badge } from '../../ui';
import { ImageZoomModal } from '../ImageZoomModal';
import { formatUrl } from '../../../services/api';

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
    imageUrl?: string;
    media?: Array<{ secureUrl: string }>;
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
    const [isZoomModalOpen, setIsZoomModalOpen] = useState(false);

    if (!report) return null;

    return (
        <>
            <Modal
                isOpen={isOpen}
                onClose={onClose}
                title="Linha do Tempo"
                subtitle={
                    <div className="flex flex-col sm:flex-row sm:items-center gap-1.5 mt-2">
                        <span
                            className="font-mono bg-slate-100 dark:bg-black/40 px-2 py-0.5 rounded border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-white/10 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer text-[12px] font-black"
                            title="Copiar Protocolo"
                            onClick={(e) => {
                                e.stopPropagation();
                                const protocol = report.id.slice(-6).toUpperCase();
                                navigator.clipboard.writeText(protocol);
                                toast.success(`Protocolo ${protocol} copiado!`);
                            }}
                        >
                            #{report.id.slice(-6).toUpperCase()}
                        </span>
                        {report.department?.name && <span className="text-[11px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest sm:ml-2">Setor: {report.department.name}</span>}
                    </div>
                }
                maxWidth="lg"
            >
                <div className="space-y-8 py-4 px-2 relative before:absolute before:left-[19px] before:top-4 before:bottom-4 before:w-[2px] before:bg-slate-200 dark:before:bg-white/10">
                    {/* ACTION BUTTONS FOR REPORT (e.g. Evidence) */}
                    <div className="flex gap-3 mb-10 pl-12">
                        <button
                            type="button"
                            onClick={() => setIsZoomModalOpen(true)}
                            className="flex items-center justify-center w-12 h-12 bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-200/50 dark:border-indigo-500/20 text-indigo-600 dark:text-indigo-400 rounded-2xl hover:bg-indigo-600 dark:hover:bg-indigo-500 hover:text-white transition-all shadow-lg shadow-indigo-500/10 group"
                            title="Ver Evidência"
                        >
                            <ImageIcon className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                        </button>
                    </div>

                    {report.history?.map((step, idx) => (
                        <div key={idx} className="relative pl-12 group">
                            <div className={`absolute left-0 top-1 w-10 h-10 rounded-2xl border-4 border-white dark:border-[#020617] shadow-md flex items-center justify-center z-10 transition-transform group-hover:scale-110 ${step.status === 'SENT' ? 'bg-amber-400' :
                                step.status === 'IN_REVIEW' ? 'bg-indigo-500' :
                                    step.status === 'FORWARDED' ? 'bg-purple-500' :
                                        step.status === 'RESOLVED' ? 'bg-emerald-500' : 'bg-slate-400'
                                }`} />
                            <div className="bg-slate-50 dark:bg-black/40 p-5 rounded-[1.5rem] shadow-sm border border-slate-200 dark:border-white/5 group-hover:shadow-md group-hover:border-slate-300 dark:group-hover:border-white/10 transition-all backdrop-blur-sm">
                                <div className="flex justify-between items-start mb-3">
                                    <span className="text-[11px] font-black text-slate-400 dark:text-slate-600 uppercase tracking-widest">
                                        {new Date(step.createdAt).toLocaleString('pt-BR')}
                                    </span>
                                    <Badge status={step.status as import('../../../types').ReportStatus} />
                                </div>
                                <p className="text-sm font-medium text-slate-700 dark:text-slate-300 leading-relaxed mb-4">
                                    {step.comment || "Em tramitação"}
                                </p>
                                <div className="flex justify-between items-center pt-3 border-t border-slate-200 dark:border-white/5">
                                    <div className="flex items-center gap-2">
                                        <p className="text-[11px] text-slate-500 dark:text-slate-400 font-black uppercase tracking-widest">
                                            Por <span className="text-slate-900 dark:text-white">{step.userName}</span>
                                        </p>
                                        {/* Visual cue for internal comments */}
                                        {step.userRole && ['MANAGER', 'ADMIN', 'SUPERVISOR'].includes(step.userRole) && (
                                            <div className="flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-slate-200 dark:bg-white/5 border border-slate-300 dark:border-white/10" title="Comentário Interno / Corporativo">
                                                <Shield className="w-3 h-3 text-slate-500 dark:text-slate-400" />
                                                <span className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">Interno</span>
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

            {isZoomModalOpen && (
                <ImageZoomModal
                    isOpen={isZoomModalOpen}
                    onClose={() => setIsZoomModalOpen(false)}
                    images={report.media && report.media.length > 0
                        ? report.media.map(m => formatUrl(m.secureUrl) || '')
                        : [formatUrl(report.imageUrl) || '']}
                />
            )}
        </>
    );
};
