import React from 'react';
import { Calendar, MessageSquare, Hash, Image } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { Card, Avatar, Badge } from '../ui';
import { formatUrl } from '../../services/api';
import { ImageZoomModal } from './ImageZoomModal';

/**
 * Estrutura de dados simplificada para o Report.
 */
import type { Report } from '../../types';

/**
 * Propriedades para o componente ReportCard.
 */
export interface ReportCardProps {
    report: Report;
    /** Se deve exibir o cabeçalho do autor (usado no Dashboard do Supervisor). */
    showUser?: boolean;
    /** Função de clique para abrir detalhes. */
    onClick?: () => void;
    /** Botões ou elementos extras para o rodapé do card. */
    actions?: React.ReactNode;
    /** Variante de exibição. */
    variant?: 'list' | 'grid' | 'minimal';
}

/**
 * Card unificado para exibição de reportes.
 * Suporta estados para Supervisor e para o Histórico do Profissional.
 */
export const ReportCard: React.FC<ReportCardProps> = React.memo(({
    report,
    showUser = false,
    onClick,
    actions,
    variant = 'list'
}) => {
    const [isZoomModalOpen, setIsZoomModalOpen] = React.useState(false);

    if (variant === 'minimal') {
        const protocol = report.id.slice(-6).toUpperCase();
        return (
            <>
                <Card
                    variant="glass"
                    onClick={onClick}
                    className="group p-5 flex flex-col justify-between border-white/10 dark:border-white/5 hover:border-indigo-500/40 transition-all duration-500 min-h-[160px] relative overflow-hidden"
                >
                    {/* Modern Decorative Background */}
                    <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 blur-[60px] -mr-16 -mt-16 group-hover:bg-indigo-500/10 transition-colors" />

                    <div className="relative z-10">
                        <div className="flex justify-between items-start mb-4">
                            <div
                                className="flex items-center gap-2 px-3 py-1.5 bg-white/5 dark:bg-black/20 rounded-xl border border-white/10 dark:border-white/5 group-hover:border-indigo-500/30 transition-all cursor-copy"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    navigator.clipboard.writeText(protocol);
                                    toast.success(`Protocolo ${protocol} copiado!`);
                                }}
                            >
                                <Hash className="w-3.5 h-3.5 text-indigo-400 opacity-60" />
                                <span className="text-[13px] font-black text-slate-800 dark:text-white uppercase tracking-[0.2em]">{protocol}</span>
                            </div>
                            <Badge status={report.status} className="origin-top-right shadow-lg shadow-black/20" />
                        </div>

                        <div className="space-y-1">
                            <p className="text-[11px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Data do Registro</p>
                            <div className="flex items-center justify-between gap-2">
                                <div className="flex items-center gap-2 text-[13px] font-bold text-slate-600 dark:text-slate-300">
                                    <Calendar className="w-4 h-4 text-indigo-500" />
                                    {new Date(report.createdAt).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: '2-digit', hour: '2-digit', minute: '2-digit' })}
                                </div>
                                <button
                                    type="button"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setIsZoomModalOpen(true);
                                    }}
                                    className="flex items-center justify-center w-8 h-8 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-xl border border-indigo-200/50 dark:border-indigo-500/20 hover:bg-indigo-600 dark:hover:bg-indigo-500 hover:text-white transition-all shadow-sm group/evid"
                                    title="Ver Evidência"
                                >
                                    <Image className="w-3.5 h-3.5 group-hover/evid:rotate-12 transition-transform" />
                                </button>
                            </div>
                        </div>
                    </div>

                    {actions && (
                        <div className="relative z-10 pt-4 mt-4 border-t border-white/10 dark:border-white/5">
                            {actions}
                        </div>
                    )}
                </Card>

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
    }

    if (variant === 'grid') {
        return (
            <>
                <Card
                    onClick={onClick}
                    className="group p-6 flex flex-col items-center bg-white dark:bg-black/40 border border-slate-200 dark:border-white/5 rounded-3xl shadow-xl backdrop-blur-md hover:border-indigo-500/30 dark:hover:border-indigo-500/30 transition-all cursor-pointer relative overflow-hidden h-full"
                >
                    {/* Background glow effect on group hover */}
                    <div className="absolute inset-0 bg-indigo-500/0 group-hover:bg-indigo-500/[0.02] transition-colors pointer-events-none" />

                    <div className="relative z-10 w-full flex flex-col items-center">
                        {/* AVATAR FOCUS */}
                        <div className="relative mb-6">
                            <div className="absolute inset-0 bg-indigo-500/20 blur-2xl rounded-full scale-150 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                            <Avatar
                                src={report.user?.avatarUrl}
                                size="xl"
                                className="relative z-10 ring-4 ring-white dark:ring-slate-900 shadow-2xl group-hover:scale-110 transition-transform duration-500"
                            />
                            <div className="absolute -top-2 -right-2 z-20">
                                <Badge status={report.status} className="shadow-xl border-white/20 dark:border-white/5 shadow-indigo-500/10" />
                            </div>
                        </div>

                        {/* IDENTITY & PROTOCOL */}
                        <div className="text-center space-y-1 mb-6">
                            <span className="block text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em]">OPERADOR</span>
                            <h4 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight truncate max-w-[150px]">
                                {report.user?.name || 'Anônimo'}
                            </h4>
                            <div className="flex items-center justify-center gap-2 mt-2">
                                <div
                                    className="flex items-center gap-1.5 px-3 py-1 bg-slate-100 dark:bg-white/5 rounded-lg text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest border border-slate-200 dark:border-white/5 group-hover:border-indigo-500/30 transition-colors"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        const protocol = report.id.slice(-6).toUpperCase();
                                        navigator.clipboard.writeText(protocol);
                                        toast.success(`Protocolo ${protocol} copiado!`);
                                    }}
                                >
                                    <Hash className="w-2.5 h-2.5 opacity-40" />
                                    {report.id.slice(-6).toUpperCase()}
                                </div>
                            </div>
                        </div>

                        {/* DATE & TIME */}
                        <div className="flex items-center gap-2 text-[9px] text-slate-500 dark:text-slate-600 font-bold uppercase tracking-widest mb-6">
                            <Calendar className="w-3 h-3" />
                            {new Date(report.createdAt).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                        </div>

                        {/* EVIDENCE THUMBNAIL (Fixed size for stability) */}
                        <button
                            type="button"
                            onClick={(e) => {
                                e.stopPropagation();
                                setIsZoomModalOpen(true);
                            }}
                            className="w-full h-24 rounded-2xl overflow-hidden border border-slate-100 dark:border-white/5 shadow-inner relative group/img mb-6 bg-slate-50 dark:bg-black/20"
                        >
                            <img
                                src={formatUrl(report.imageUrl)}
                                className="w-full h-full object-cover opacity-60 group-hover/img:opacity-100 transition-opacity"
                                alt="Evidência"
                            />
                            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover/img:opacity-100 transition-opacity bg-black/40 backdrop-blur-sm">
                                <span className="text-[8px] font-black text-white uppercase tracking-widest">Ver Evidência</span>
                            </div>
                        </button>

                        {/* ACTIONS */}
                        {actions && (
                            <div className="w-full pt-4 border-t border-slate-100 dark:border-white/5 mt-auto">
                                {actions}
                            </div>
                        )}
                    </div>
                </Card>

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
    }

    return (
        <>
            <Card
                onClick={onClick}
                className="group p-5 flex flex-col sm:flex-row gap-6 bg-white dark:bg-black/40 border border-slate-200 dark:border-white/5 rounded-2xl shadow-xl backdrop-blur-md hover:border-indigo-500/30 dark:hover:border-indigo-500/30 transition-all cursor-pointer relative overflow-hidden"
            >
                {/* Background glow effect on group hover */}
                <div className="absolute inset-0 bg-indigo-500/0 group-hover:bg-indigo-500/[0.02] transition-colors pointer-events-none" />

                {/* Visual / Image */}
                <div className="relative shrink-0 sm:self-start z-10">
                    <button
                        type="button"
                        onClick={(e) => {
                            e.stopPropagation();
                            setIsZoomModalOpen(true);
                        }}
                        className="w-full sm:w-32 h-48 sm:h-32 rounded-xl overflow-hidden shadow-2xl group-hover:scale-105 transition-transform duration-500 cursor-zoom-in focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-[#020617] relative border border-slate-200 dark:border-white/5"
                        aria-label="Ampliar evidência"
                    >
                        <img
                            src={formatUrl(report.imageUrl)}
                            alt=""
                            className="w-full h-full object-cover bg-slate-100 dark:bg-slate-900 transition-opacity duration-300"
                            onError={(e) => {
                                (e.target as HTMLImageElement).src = 'https://placehold.co/300x200?text=Sem+Imagem&bg=0f172a&color=475569';
                            }}
                        />
                        {report.media && report.media.length > 1 && (
                            <div className="absolute bottom-2 right-2 bg-slate-800/80 dark:bg-black/80 backdrop-blur-md text-white text-[10px] font-black px-2 py-0.5 rounded-lg border border-white/20 dark:border-white/10 shadow-lg">
                                +{report.media.length - 1} ARQUIVOS
                            </div>
                        )}
                    </button>
                    <div className="absolute top-2 right-2 pointer-events-none">
                        <Badge status={report.status} className="shadow-2xl border-white/20 dark:border-white/5 backdrop-blur-md scale-90 origin-top-right" />
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 flex flex-col justify-between min-w-0 z-10">
                    <div>
                        <div className="flex justify-between items-start mb-3">
                            <div className="flex items-center gap-4">
                                <div className="flex items-center gap-2 text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">
                                    <Calendar className="w-3.5 h-3.5 text-indigo-500 dark:text-indigo-400" />
                                    {new Date(report.createdAt).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                                </div>
                                <div
                                    className="flex items-center gap-1.5 px-2 py-0.5 bg-slate-100 dark:bg-white/5 rounded-lg text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest cursor-pointer hover:bg-indigo-50 hover:text-indigo-600 dark:hover:bg-indigo-500/20 dark:hover:text-indigo-300 transition-all group/protocol border border-slate-200 dark:border-white/5"
                                    title="Copiar Protocolo"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        const protocol = report.id.slice(-6).toUpperCase();
                                        navigator.clipboard.writeText(protocol);
                                        toast.success(`Protocolo ${protocol} copiado!`, {
                                            style: { background: '#1e1b4b', color: '#e0e7ff', fontSize: '12px' }
                                        });
                                    }}
                                >
                                    <Hash className="w-2.5 h-2.5 opacity-40 group-hover/protocol:opacity-100 transition-opacity" />
                                    {report.id.slice(-6).toUpperCase()}
                                </div>
                            </div>
                            {showUser && report.user && (
                                <div className="flex items-center gap-3 bg-slate-50 dark:bg-white/5 pl-3 pr-1 py-1 rounded-full border border-slate-200 dark:border-white/5 shadow-sm">
                                    <span className="text-[10px] font-black text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                                        {report.user.name.split(' ')[0]}
                                    </span>
                                    <Avatar src={report.user.avatarUrl} size="sm" className="ring-2 ring-indigo-500/10 dark:ring-indigo-500/20 shadow-lg" />
                                </div>
                            )}
                        </div>

                        <h4 className="text-base font-bold text-slate-900 dark:text-white leading-relaxed line-clamp-2 mb-4 tracking-tight">
                            {report.comment}
                        </h4>

                        {report.department?.name && (
                            <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-50 dark:bg-indigo-500/10 rounded-lg border border-indigo-200 dark:border-indigo-500/20 mb-4">
                                <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(99,102,241,0.6)]" />
                                <span className="text-[9px] font-black text-indigo-600 dark:text-indigo-300 uppercase tracking-[0.2em]">
                                    SETOR: {report.department.name}
                                </span>
                            </div>
                        )}

                        {report.feedback && (
                            <div className="bg-emerald-50 dark:bg-emerald-500/5 rounded-xl p-4 border-l-4 border-emerald-400 dark:border-emerald-500/50 mb-3 shadow-inner">
                                <div className="flex items-center gap-2 mb-2">
                                    <MessageSquare className="w-3.5 h-3.5 text-emerald-500 dark:text-emerald-400" />
                                    <span className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-[0.2em]">Parecer da Supervisão</span>
                                </div>
                                <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
                                    {report.feedback}
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Footer Actions */}
                    {actions && (
                        <div className="flex justify-end gap-3 mt-4 pt-4 border-t border-slate-200 dark:border-white/5">
                            {actions}
                        </div>
                    )}
                </div>
            </Card>

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
});

