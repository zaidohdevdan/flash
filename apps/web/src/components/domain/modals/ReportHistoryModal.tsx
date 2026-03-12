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
    const [isDark, setIsDark] = useState(document.documentElement.classList.contains('dark'));

    // Detect theme changes reactively
    React.useEffect(() => {
        const observer = new MutationObserver(() => {
            setIsDark(document.documentElement.classList.contains('dark'));
        });
        observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
        return () => observer.disconnect();
    }, []);

    if (!report) return null;

    return (
        <>
            <Modal
                isOpen={isOpen}
                onClose={onClose}
                title="Linha do Tempo"
                variant={isDark ? 'dark' : 'light'}
                subtitle={
                    <div className="flex flex-col sm:flex-row sm:items-center gap-1.5 mt-2">
                        <span
                            className={`font-mono px-2 py-0.5 rounded border transition-colors cursor-pointer text-[12px] font-black ${isDark
                                    ? 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10 hover:text-white'
                                    : 'bg-slate-100 border-slate-200 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
                                }`}
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
                        {report.department?.name && (
                            <span className={`text-[11px] font-black uppercase tracking-widest sm:ml-2 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                                Setor: {report.department.name}
                            </span>
                        )}
                    </div>
                }
                maxWidth="lg"
            >
                <div className={`space-y-8 py-4 px-2 relative before:absolute before:left-[19px] before:top-4 before:bottom-4 before:w-[2px] ${isDark ? 'before:bg-white/10' : 'before:bg-slate-200'}`}>
                    {/* ACTION BUTTONS FOR REPORT (e.g. Evidence) */}
                    <div className="flex gap-3 mb-10 pl-12">
                        <button
                            type="button"
                            onClick={() => setIsZoomModalOpen(true)}
                            className="flex items-center justify-center w-12 h-12 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 rounded-2xl hover:bg-indigo-500 hover:text-white transition-all shadow-lg shadow-indigo-500/10 group"
                            title="Ver Evidência"
                        >
                            <ImageIcon className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                        </button>
                    </div>

                    {report.history?.map((step, idx) => (
                        <div key={idx} className="relative pl-12 group">
                            <div className={`absolute left-0 top-1 w-10 h-10 rounded-2xl border-4 shadow-md flex items-center justify-center z-10 transition-transform group-hover:scale-110 ${isDark ? 'border-slate-900' : 'border-white'
                                } ${step.status === 'SENT' ? 'bg-rose-500' :
                                    step.status === 'IN_REVIEW' ? 'bg-indigo-500' :
                                        step.status === 'FORWARDED' ? 'bg-amber-500' :
                                            step.status === 'RESOLVED' ? 'bg-emerald-500' : 'bg-slate-400'
                                }`} />
                            <div className={`${isDark ? 'bg-white/5 border-white/5 group-hover:border-white/10' : 'bg-slate-50 border-slate-100 group-hover:border-slate-200'} p-5 rounded-[1.5rem] shadow-sm border transition-all backdrop-blur-sm`}>
                                <div className="flex justify-between items-start mb-3">
                                    <span className={`text-[11px] font-black uppercase tracking-widest ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                                        {new Date(step.createdAt).toLocaleString('pt-BR')}
                                    </span>
                                    <Badge status={step.status as import('../../../types').ReportStatus} />
                                </div>
                                <p className={`text-sm font-bold leading-relaxed mb-4 ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>
                                    {step.comment || "Em tramitação"}
                                </p>
                                <div className={`flex justify-between items-center pt-3 border-t ${isDark ? 'border-white/5' : 'border-slate-100'}`}>
                                    <div className="flex items-center gap-2">
                                        <p className={`text-[11px] font-black uppercase tracking-widest ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                                            Por <span className={isDark ? 'text-white' : 'text-slate-900'}>{step.userName}</span>
                                        </p>
                                        {/* Visual cue for internal comments */}
                                        {step.userRole && ['MANAGER', 'ADMIN', 'SUPERVISOR'].includes(step.userRole) && (
                                            <div className={`flex items-center gap-1 px-1.5 py-0.5 rounded-md border ${isDark ? 'bg-white/5 border-white/10' : 'bg-slate-100 border-slate-200'}`} title="Comentário Interno / Corporativo">
                                                <Shield className="w-3 h-3 text-slate-500" />
                                                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Interno</span>
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
