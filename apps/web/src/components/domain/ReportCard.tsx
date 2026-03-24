import React from 'react';
import { Calendar, MessageSquare, Hash, ExternalLink, Download, History as HistoryIcon, CheckCircle2, Clock, ArrowRight, Folder as FolderIcon } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { Card, Avatar, Badge } from '../ui';
import { FileIcon } from '../ui/FileIcon';
import { formatDownloadUrl, formatUrl } from '../../services/api';
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
    /** Se deve destacar o card visualmente. */
    isHighlighted?: boolean;
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
    variant = 'list',
    isHighlighted = false
}) => {
    const [isZoomModalOpen, setIsZoomModalOpen] = React.useState(false);
    const [showHistory, setShowHistory] = React.useState(false);

    // Identificar tipo do anexo principal
    const firstMedia = report.media && report.media.length > 0 ? report.media[0] : null;
    const isImage = (() => {
        const url = firstMedia?.secureUrl || report.imageUrl;
        if (!url) return false;

        // Se o formato original do Media for pdf ou a URL terminar com .pdf
        if (firstMedia?.format === 'pdf' || url.toLowerCase().endsWith('.pdf')) return false;

        if (firstMedia) {
            return firstMedia.resourceType === 'image' || /\.(jpg|jpeg|png|gif|webp)$/i.test(url);
        }
        return /\.(jpg|jpeg|png|gif|webp)$/i.test(url);
    })();

    const handleDownload = (e: React.MouseEvent) => {
        e.stopPropagation();
        const rawUrl = firstMedia?.secureUrl || report.imageUrl;
        const downloadUrl = firstMedia?.downloadUrl || formatDownloadUrl(rawUrl);

        if (!rawUrl) {
            toast.error('Nenhum anexo disponível para download');
            return;
        }

        const isPdf = firstMedia?.format === 'pdf' || rawUrl.toLowerCase().endsWith('.pdf');

        // Se for PDF, o mais seguro é abrir em nova aba para visualização e download manual via navegador
        if (isPdf) {
            window.open(rawUrl, '_blank');
            toast.success('Abrindo PDF...');
            return;
        }

        if (!downloadUrl) return;

        const link = document.createElement('a');
        link.href = downloadUrl;
        link.download = `flash-report-${report.id.substring(report.id.length - 6)}`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        toast.success('Iniciando download...');
    };

    if (variant === 'minimal') {
        const protocol = report.id.slice(-6).toUpperCase();
        return (
            <>
                <Card
                    variant="glass"
                    onClick={onClick}
                    className={`group p-5 flex flex-col justify-between border-white/10 dark:border-white/5 hover:border-indigo-500/40 transition-all duration-500 min-h-[160px] relative overflow-hidden ${isHighlighted ? 'ring-2 ring-rose-500 shadow-[0_0_15px_rgba(244,63,94,0.4)] z-20 bg-rose-500/5' : ''}`}
                >
                    {isHighlighted && (
                        <div className="absolute top-0 left-0 bg-rose-500 text-white text-[8px] font-black px-2 py-1 rounded-br-lg z-30 uppercase tracking-widest shadow-lg animate-pulse">
                            Foco Tático
                        </div>
                    )}
                    {/* Modern Decorative Background */}
                    <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 blur-[60px] -mr-16 -mt-16 group-hover:bg-indigo-500/10 transition-colors" />

                    <div className="relative z-10 w-full">
                        <div className="flex flex-wrap justify-between items-start mb-4 gap-2 w-full">
                            <div
                                className="flex items-center gap-2 px-3 py-1.5 bg-white/5 dark:bg-black/20 rounded-xl border border-white/10 dark:border-white/5 group-hover:border-indigo-500/30 transition-all cursor-copy shrink-0"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    navigator.clipboard.writeText(protocol);
                                    toast.success(`Protocolo ${protocol} copiado!`);
                                }}
                            >
                                <Hash className="w-3.5 h-3.5 text-indigo-400 opacity-60" />
                                <span className="text-[12px] font-black text-slate-800 dark:text-white uppercase tracking-[0.2em]">{protocol}</span>
                            </div>
                            <div className="scale-90 origin-top-right shrink-0">
                                <Badge status={report.status} className="shadow-lg shadow-black/20" />
                            </div>
                        </div>

                        <div className="flex flex-col gap-2">
                            <div className="flex items-center justify-between">
                                <p className="text-[11px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Relato / Data</p>
                                <button
                                    onClick={handleDownload}
                                    className="p-1.5 text-indigo-500 hover:bg-indigo-500/10 rounded-lg transition-colors border border-transparent hover:border-indigo-500/20"
                                    title="Baixar Anexo"
                                >
                                    <Download className="w-3.5 h-3.5" />
                                </button>
                            </div>
                            <div className="flex flex-col gap-2">
                                <p className="text-[11px] font-bold text-slate-700 dark:text-slate-200 line-clamp-2 italic leading-relaxed">
                                    "{report.comment}"
                                </p>
                                <div className="flex items-center gap-2 text-[12px] font-bold text-slate-500 dark:text-slate-400">
                                    <Calendar className="w-3.5 h-3.5 text-indigo-500/70" />
                                    {new Date(report.createdAt).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: '2-digit', hour: '2-digit', minute: '2-digit' })}
                                </div>
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
                    className={`group p-6 flex flex-col items-center bg-white dark:bg-black/40 border border-slate-200 dark:border-white/5 rounded-3xl shadow-xl backdrop-blur-md hover:border-indigo-500/30 dark:hover:border-indigo-500/30 transition-all cursor-pointer relative overflow-hidden h-full ${isHighlighted ? 'ring-4 ring-rose-500 shadow-[0_0_25px_rgba(244,63,94,0.5)] z-20 scale-[1.02] bg-rose-500/5' : ''}`}
                >
                    {isHighlighted && (
                        <div className="absolute top-0 left-0 bg-rose-500 text-white text-[10px] font-black px-3 py-1.5 rounded-br-2xl z-30 uppercase tracking-[0.2em] shadow-xl animate-pulse">
                            Foco Tático
                        </div>
                    )}
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
                        <div className="text-center space-y-1 mb-6 relative w-full px-4">
                            <span className="block text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em]">OPERADOR</span>
                            <h4 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight truncate w-full">
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
                                <button
                                    onClick={handleDownload}
                                    className="p-1.5 text-slate-400 hover:text-indigo-500 hover:bg-indigo-500/10 rounded-lg transition-colors border border-transparent hover:border-indigo-500/20"
                                    title="Baixar Anexo"
                                >
                                    <Download className="w-3.5 h-3.5" />
                                </button>
                            </div>
                        </div>

                        {/* DATE & TIME */}
                        <div className="flex items-center gap-2 text-[9px] text-slate-500 dark:text-slate-600 font-bold uppercase tracking-widest mb-4">
                            <Calendar className="w-3 h-3" />
                            {new Date(report.createdAt).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                        </div>

                        {/* COMMENT BUBBLE */}
                        <div className="w-full mb-6 relative group/msg">
                            <div className="absolute -left-2 top-0 bottom-0 w-1 bg-indigo-500/20 rounded-full group-hover/msg:bg-indigo-500/40 transition-colors" />
                            <p className="text-[11px] font-medium text-slate-700 dark:text-slate-300 leading-relaxed italic pl-3 line-clamp-3">
                                "{report.comment}"
                            </p>
                        </div>

                        {/* EVIDENCE THUMBNAIL (Fixed size for stability) */}
                        <button
                            type="button"
                            onClick={(e) => {
                                e.stopPropagation();
                                setIsZoomModalOpen(true);
                            }}
                            className="w-full h-24 rounded-2xl overflow-hidden border border-slate-100 dark:border-white/5 shadow-inner relative group/img mb-6 bg-slate-50 dark:bg-black/20 flex items-center justify-center"
                        >
                            {isImage ? (
                                <img
                                    src={formatUrl(report.imageUrl)}
                                    className="w-full h-full object-cover opacity-60 group-hover/img:opacity-100 transition-opacity"
                                    alt="Evidência"
                                />
                            ) : (
                                <div className="flex flex-col items-center gap-1 opacity-60 group-hover/img:opacity-100 transition-opacity">
                                    <FileIcon filename={report.imageUrl} format={firstMedia?.format} size={32} />
                                    <span className="text-[8px] font-black uppercase tracking-tighter text-slate-500 dark:text-slate-400">
                                        {firstMedia?.format || 'DOC'}
                                    </span>
                                </div>
                            )}
                            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover/img:opacity-100 transition-opacity bg-black/40 backdrop-blur-sm">
                                <span className="text-[8px] font-black text-white uppercase tracking-widest">
                                    {isImage ? 'Ver Evidência' : 'Abrir Arquivo'}
                                </span>
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
                className={`group p-5 flex flex-col sm:flex-row gap-6 bg-white dark:bg-black/40 border border-slate-200 dark:border-white/5 rounded-2xl shadow-xl backdrop-blur-md hover:border-indigo-500/30 dark:hover:border-indigo-500/30 transition-all cursor-pointer relative overflow-hidden ${isHighlighted ? 'ring-4 ring-rose-500 shadow-[0_0_25px_rgba(244,63,94,0.5)] z-20 scale-[1.01] bg-rose-500/5' : ''}`}
            >
                {isHighlighted && (
                    <div className="absolute top-0 left-0 bg-rose-500 text-white text-[10px] font-black px-4 py-2 rounded-br-2xl z-30 uppercase tracking-[0.2em] shadow-xl animate-pulse">
                        Foco Tático Selecionado
                    </div>
                )}
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
                        className="w-full sm:w-32 h-48 sm:h-32 rounded-xl overflow-hidden shadow-2xl group-hover:scale-105 transition-transform duration-500 cursor-zoom-in focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-[#020617] relative border border-slate-200 dark:border-white/5 flex items-center justify-center bg-slate-50 dark:bg-slate-900"
                        aria-label="Ver anexo"
                    >
                        {isImage ? (
                            <img
                                src={formatUrl(report.imageUrl)}
                                alt=""
                                className="w-full h-full object-cover transition-opacity duration-300"
                                onError={(e) => {
                                    (e.target as HTMLImageElement).src = 'https://placehold.co/300x200?text=Sem+Imagem&bg=0f172a&color=475569';
                                }}
                            />
                        ) : (
                            <div className="flex flex-col items-center gap-2">
                                <FileIcon filename={report.imageUrl} format={firstMedia?.format} size={48} />
                                <span className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">
                                    {firstMedia?.format || 'DOC'}
                                </span>
                            </div>
                        )}

                        {!isImage && (
                            <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[2px]">
                                <ExternalLink className="w-6 h-6 text-white" />
                            </div>
                        )}

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
                            <div className="flex items-center gap-3">
                                <button
                                    onClick={handleDownload}
                                    className="p-2 text-slate-400 hover:text-indigo-500 hover:bg-white dark:hover:bg-white/5 rounded-xl border border-transparent hover:border-slate-200 dark:hover:border-white/10 transition-all shadow-sm group/dl"
                                    title="Baixar Anexo"
                                >
                                    <Download className="w-4 h-4 group-hover/dl:scale-110" />
                                </button>
                                <div className="w-px h-6 bg-slate-100 dark:bg-white/10" />
                                {showUser && report.user && (
                                    <div className="flex items-center gap-3 bg-slate-50 dark:bg-white/5 pl-3 pr-1 py-1 rounded-full border border-slate-200 dark:border-white/5 shadow-sm">
                                        <span className="text-[10px] font-black text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                                            {report.user.name.split(' ')[0]}
                                        </span>
                                        <Avatar src={report.user.avatarUrl} size="sm" className="ring-2 ring-indigo-500/10 dark:ring-indigo-500/20 shadow-lg" />
                                    </div>
                                )}
                            </div>
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

                    {/* History Toggle Button */}
                    {report.history && report.history.length > 0 && (
                        <div className="mt-3">
                            <button
                                type="button"
                                onClick={(e) => { e.stopPropagation(); setShowHistory(h => !h); }}
                                className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 hover:text-indigo-500 dark:hover:text-indigo-400 transition-colors w-full pt-2 border-t border-slate-100 dark:border-white/5"
                            >
                                <HistoryIcon className="w-3.5 h-3.5" />
                                {showHistory ? 'Ocultar Histórico' : `Histórico (${report.history.length} etapas)`}
                                <ArrowRight className={`w-3 h-3 ml-auto transition-transform duration-300 ${showHistory ? 'rotate-90' : ''}`} />
                            </button>

                            {showHistory && (
                                <div className="mt-3 flex flex-col gap-0 relative pl-4">
                                    {/* Vertical line */}
                                    <div className="absolute left-[7px] top-2 bottom-2 w-px bg-slate-200 dark:bg-white/10" />
                                    {[...report.history].reverse().map((step, idx) => {
                                        const isFirst = idx === 0;
                                        const statusColor = step.status === 'RESOLVED'
                                            ? 'text-emerald-500 bg-emerald-500'
                                            : step.status === 'FORWARDED'
                                            ? 'text-amber-500 bg-amber-500'
                                            : step.status === 'IN_REVIEW'
                                            ? 'text-indigo-500 bg-indigo-500'
                                            : 'text-rose-500 bg-rose-500';
                                        const StatusIcon = step.status === 'RESOLVED' ? CheckCircle2
                                            : step.status === 'FORWARDED' ? FolderIcon
                                            : step.status === 'IN_REVIEW' ? Clock
                                            : ArrowRight;
                                        const statusLabel = step.status === 'RESOLVED' ? 'Baixado'
                                            : step.status === 'FORWARDED' ? 'Encaminhado'
                                            : step.status === 'IN_REVIEW' ? 'Em Análise'
                                            : 'Alerta Enviado';
                                        return (
                                            <div key={step.id} className={`relative flex gap-3 pb-4 ${isFirst ? '' : 'opacity-70'}`}>
                                                <div className={`absolute -left-4 top-0.5 w-3.5 h-3.5 rounded-full border-2 border-white dark:border-slate-900 flex items-center justify-center ${statusColor.split(' ')[1]} z-10`}>
                                                    <StatusIcon className="w-2 h-2 text-white" />
                                                </div>
                                                <div className="flex flex-col gap-0.5 min-w-0">
                                                    <div className="flex items-center gap-2 flex-wrap">
                                                        <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md bg-opacity-10 ${statusColor.split(' ')[0]} bg-current`}>
                                                            {statusLabel}
                                                        </span>
                                                        {step.departmentName && (
                                                            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{step.departmentName}</span>
                                                        )}
                                                    </div>
                                                    <span className="text-[10px] font-bold text-slate-700 dark:text-slate-200 mt-0.5">{step.userName}</span>
                                                    {step.comment && (
                                                        <p className="text-[10px] text-slate-500 dark:text-slate-400 italic leading-relaxed mt-0.5 line-clamp-2">"{step.comment}"</p>
                                                    )}
                                                    <span className="text-[9px] text-slate-400 dark:text-slate-500 uppercase tracking-widest mt-0.5">
                                                        {new Date(step.createdAt).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: '2-digit', hour: '2-digit', minute: '2-digit' })}
                                                    </span>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
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
                    downloadUrls={report.media && report.media.length > 0
                        ? report.media.map(m => m.downloadUrl || formatDownloadUrl(m.secureUrl) || '')
                        : []}
                    formats={report.media && report.media.length > 0
                        ? report.media.map(m => m.format || '')
                        : []}
                    initialIndex={0}
                />
            )}
        </>
    );
});

