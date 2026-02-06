import React from 'react';
import { Calendar, MessageSquare, Hash } from 'lucide-react';
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
}

/**
 * Card unificado para exibição de reportes.
 * Suporta estados para Supervisor e para o Histórico do Profissional.
 */
export const ReportCard: React.FC<ReportCardProps> = React.memo(({
    report,
    showUser = false,
    onClick,
    actions
}) => {
    const [isZoomModalOpen, setIsZoomModalOpen] = React.useState(false);

    return (
        <Card
            onClick={onClick}
            variant="dark"
            className="group p-5 flex flex-col sm:flex-row gap-6 hover:border-blue-500/30 !rounded-[2.5rem] border-white/5 bg-slate-950/40"
        >
            {/* Visual / Image */}
            <div className="relative shrink-0 sm:self-start">
                <img
                    src={formatUrl(report.imageUrl)}
                    alt="Reporte"
                    onClick={(e) => {
                        e.stopPropagation();
                        setIsZoomModalOpen(true);
                    }}
                    className="w-full sm:w-32 h-48 sm:h-32 rounded-[1.5rem] object-cover bg-slate-900 shadow-inner group-hover:scale-105 transition-transform duration-500 cursor-zoom-in"
                    onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://placehold.co/300x200?text=Imagem+Unavailable&bg=0f172a&color=ffffff';
                    }}
                />
                <div className="absolute top-2 right-2">
                    <Badge status={report.status} className="shadow-lg border-2 border-white/50" />
                </div>
            </div>

            <ImageZoomModal
                isOpen={isZoomModalOpen}
                onClose={() => setIsZoomModalOpen(false)}
                imageUrl={formatUrl(report.imageUrl) || ''}
            />

            {/* Content */}
            <div className="flex-1 flex flex-col justify-between min-w-0">
                <div>
                    <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center gap-3">
                            <div className="flex items-center gap-1 text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                                <Calendar className="w-3 h-3" />
                                {new Date(report.createdAt).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}
                            </div>
                            <div className="flex items-center gap-1 px-2 py-0.5 bg-slate-900 rounded-md text-[9px] font-black text-slate-300 uppercase tracking-tighter shadow-sm border border-white/10">
                                <Hash className="w-2.5 h-2.5 opacity-60" />
                                PROTOCOLO: {report.id.slice(-6).toUpperCase()}
                            </div>
                        </div>
                        {showUser && report.user && (
                            <div className="flex items-center gap-2">
                                <span className="text-[10px] font-black text-slate-200 uppercase tracking-tighter">
                                    {report.user.name.split(' ')[0]}
                                </span>
                                <Avatar src={report.user.avatarUrl} size="sm" />
                            </div>
                        )}
                    </div>

                    <h4 className="text-sm font-bold text-white leading-snug line-clamp-2 md:line-clamp-3 mb-2">
                        {report.comment}
                    </h4>

                    {report.status === 'FORWARDED' && report.department?.name && (
                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-purple-500/10 rounded-full border border-purple-500/20 mb-3 animate-pulse">
                            <div className="w-1.5 h-1.5 bg-purple-400 rounded-full" />
                            <span className="text-[9px] font-black text-purple-300 uppercase tracking-widest">
                                EM SETOR: {report.department.name}
                            </span>
                        </div>
                    )}

                    {report.feedback && (
                        <div className="bg-blue-500/10 rounded-xl p-3 border-l-4 border-blue-500 mb-2">
                            <div className="flex items-center gap-1.5 mb-0.5">
                                <MessageSquare className="w-3 h-3 text-blue-400" />
                                <span className="text-[9px] font-black text-blue-300 uppercase italic">Supervisor:</span>
                            </div>
                            <p className="text-[10px] text-blue-200 font-medium italic leading-tight line-clamp-2">
                                {report.feedback}
                            </p>
                        </div>
                    )}
                </div>

                {/* Footer Actions */}
                {actions && (
                    <div className="flex justify-end gap-2 mt-2 pt-2 border-t border-white/5">
                        {actions}
                    </div>
                )}
            </div>
        </Card >
    );
});
