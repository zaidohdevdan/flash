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
    /** Conteúdo personalizado. */
    children?: React.ReactNode;
}

/**
 * Badge de status para visualização rápida no dashboard.
 * Utiliza cores suaves e tipografia técnica.
 */
export const Badge: React.FC<BadgeProps> = ({ status, label, className = '', children }) => {
    const styles = {
        SENT: 'bg-yellow-50 text-yellow-700 border-yellow-200',
        IN_REVIEW: 'bg-blue-50 text-blue-700 border-blue-200',
        FORWARDED: 'bg-purple-50 text-purple-700 border-purple-200',
        RESOLVED: 'bg-[var(--accent-primary)] text-[var(--accent-text)] border-transparent font-bold',
        ARCHIVED: 'bg-gray-100 text-gray-600 border-gray-200',
        default: 'bg-gray-50 text-gray-600 border-gray-200'
    };

    const labels = {
        SENT: 'Recebido',
        IN_REVIEW: 'Em Análise',
        FORWARDED: 'Encaminhado',
        RESOLVED: 'Resolvido',
        ARCHIVED: 'Arquivado',
        default: status
    };

    return (
        <span className={`
      badge-base
      border
      ${styles[status] || styles.default} 
      ${className}
    `}>
            {children || label || labels[status] || status}
        </span>
    );
};
