import React from 'react';

/**
 * Propriedades para o componente Card.
 */
export interface CardProps {
    children: React.ReactNode;
    /** Variante de estilo do card. */
    variant?: 'white' | 'glass' | 'blue' | 'dark' | 'outline';
    /** Classes CSS adicionais. */
    className?: string;
    /** Função de clique (torna o card interativo). */
    onClick?: () => void;
}

/**
 * Componente base de Card com cantos arredondados generosos e sombras premium.
 */
export const Card: React.FC<CardProps> = ({
    children,
    variant = 'white',
    className = '',
    onClick
}) => {
    const variants = {
        white: 'bg-white shadow-sm border border-white/60',
        glass: 'bg-white/60 backdrop-blur-[32px] border border-white/50 ring-1 ring-white/20 shadow-xl shadow-blue-500/10',
        blue: 'bg-blue-600 text-white shadow-xl shadow-blue-500/20',
        dark: 'bg-[#0f172a] text-white border border-white/10',
        outline: 'bg-transparent border-2 border-dashed border-gray-200'
    };

    return (
        <div
            onClick={onClick}
            className={`
        rounded-[2rem] md:rounded-[2.5rem] 
        overflow-hidden 
        transition-all duration-300 
        ${variants[variant]} 
        ${onClick ? 'cursor-pointer active:scale-[0.98] hover:shadow-lg' : ''} 
        ${className}
      `}
        >
            {children}
        </div>
    );
};
