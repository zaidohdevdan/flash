import React from 'react';

/** Tipos de status suportados pelo Badge. */
export type BadgeStatus = 'SENT' | 'IN_REVIEW' | 'FORWARDED' | 'RESOLVED' | 'ARCHIVED' | 'default';

/**
 * Propriedades para o componente Badge.
 */
export interface BadgeProps {
    /** Status que define a cor e o rótulo padrão. */
    status: BadgeStatus;
    /** Rótulo personalizado (opcional). */
    label?: string;
    /** Classes CSS adicionais. */
    className?: string;
}

/**
 * Badge de status para visualização rápida no dashboard.
 * Utiliza cores suaves e tipografia técnica.
 */
export const Badge: React.FC<BadgeProps> = ({ status, label, className = '' }) => {
    const styles = {
        SENT: 'bg-yellow-400 text-yellow-950 border-yellow-300 shadow-sm shadow-yellow-500/20',
        IN_REVIEW: 'bg-blue-600 text-white border-blue-500 shadow-sm shadow-blue-500/20',
        FORWARDED: 'bg-purple-600 text-white border-purple-500 shadow-sm shadow-purple-500/20',
        RESOLVED: 'bg-emerald-600 text-white border-emerald-500 shadow-sm shadow-emerald-500/20',
        ARCHIVED: 'bg-gray-500 text-white border-gray-400 shadow-sm',
        default: 'bg-gray-100 text-gray-700 border-gray-200'
    };

    const labels = {
        SENT: 'Recebido',
        IN_REVIEW: 'Análise',
        FORWARDED: 'Depto.',
        RESOLVED: 'Resolvido',
        ARCHIVED: 'Arquivado',
        default: status
    };

    return (
        <span className={`
      px-2.5 py-1 
      rounded-lg border 
      text-[9px] font-black uppercase tracking-widest 
      ${styles[status] || styles.default} 
      ${className}
    `}>
            {label || labels[status] || status}
        </span>
    );
};
