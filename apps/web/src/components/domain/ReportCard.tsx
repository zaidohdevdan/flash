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
            variant="white"
            className="group p-5 flex flex-col sm:flex-row gap-6 hover:shadow-md transition-shadow cursor-pointer"
        >
            {/* Visual / Image */}
            <div className="relative shrink-0 sm:self-start">
                <button
                    type="button"
                    onClick={(e) => {
                        e.stopPropagation();
                        setIsZoomModalOpen(true);
                    }}
                    className="w-full sm:w-32 h-48 sm:h-32 rounded-xl overflow-hidden shadow-sm group-hover:scale-105 transition-transform duration-300 cursor-zoom-in focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)] focus:ring-offset-2"
                    aria-label="Ampliar imagem do reporte"
                >
                    <img
                        src={formatUrl(report.imageUrl)}
                        alt=""
                        className="w-full h-full object-cover bg-[var(--bg-tertiary)]"
                        onError={(e) => {
                            (e.target as HTMLImageElement).src = 'https://placehold.co/300x200?text=Sem+Imagem&bg=f1f5f9&color=64748b';
                        }}
                    />
                </button>
                <div className="absolute top-2 right-2 pointer-events-none">
                    <Badge status={report.status} className="shadow-sm bg-[var(--bg-primary)]/90 backdrop-blur-sm" />
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
                            <div className="flex items-center gap-1.5 text-xs text-[var(--text-tertiary)] font-medium">
                                <Calendar className="w-3.5 h-3.5" />
                                {new Date(report.createdAt).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                            </div>
                            <div className="flex items-center gap-1 px-2 py-0.5 bg-[var(--bg-tertiary)] rounded text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-wide">
                                <Hash className="w-2.5 h-2.5 opacity-60" />
                                {report.id.slice(-6).toUpperCase()}
                            </div>
                        </div>
                        {showUser && report.user && (
                            <div className="flex items-center gap-2">
                                <span className="text-xs font-semibold text-[var(--text-secondary)]">
                                    {report.user.name.split(' ')[0]}
                                </span>
                                <Avatar src={report.user.avatarUrl} size="sm" />
                            </div>
                        )}
                    </div>

                    <h4 className="text-base font-semibold text-[var(--text-primary)] leading-snug line-clamp-2 md:line-clamp-3 mb-3">
                        {report.comment}
                    </h4>

                    {report.status === 'FORWARDED' && report.department?.name && (
                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-purple-500/10 rounded-full border border-purple-500/20 mb-3">
                            <div className="w-1.5 h-1.5 bg-purple-500 rounded-full" />
                            <span className="text-xs font-bold text-purple-500 uppercase tracking-tight">
                                No Setor: {report.department.name}
                            </span>
                        </div>
                    )}

                    {report.feedback && (
                        <div className="bg-[var(--bg-tertiary)] rounded-lg p-3 border-l-4 border-[var(--accent-primary)] mb-2">
                            <div className="flex items-center gap-1.5 mb-1">
                                <MessageSquare className="w-3.5 h-3.5 text-[var(--text-secondary)]" />
                                <span className="text-xs font-bold text-[var(--text-secondary)] uppercase">Supervisor</span>
                            </div>
                            <p className="text-sm text-[var(--text-primary)] leading-normal line-clamp-2">
                                {report.feedback}
                            </p>
                        </div>
                    )}
                </div>

                {/* Footer Actions */}
                {actions && (
                    <div className="flex justify-end gap-2 mt-4 pt-3 border-t border-[var(--border-subtle)]">
                        {actions}
                    </div>
                )}
            </div>
        </Card >
    );
});
