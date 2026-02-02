import React from 'react';

/**
 * Propriedades para o componente Shimmer.
 */
interface ShimmerProps {
    /** Classes CSS para definir tamanho e forma. */
    className?: string;
}

/**
 * Componente base para estados de carregamento (Skeleton screen).
 * Utiliza uma animação de pulsação suave.
 */
export const Shimmer: React.FC<ShimmerProps> = ({ className = '' }) => (
    <div className={`animate-pulse bg-gray-100 rounded-xl ${className}`} />
);

/**
 * Esqueleto pré-configurado para um card de reporte.
 */
export const ReportShimmer = () => (
    <div className="bg-white p-4 rounded-[1.5rem] border border-gray-50 flex gap-4 animate-pulse">
        <div className="w-20 h-20 bg-gray-100 rounded-xl flex-shrink-0" />
        <div className="flex-1 space-y-3 py-1">
            <div className="h-2 bg-gray-100 rounded w-1/4" />
            <div className="h-4 bg-gray-100 rounded w-full" />
            <div className="h-4 bg-gray-100 rounded w-2/3" />
        </div>
    </div>
);
