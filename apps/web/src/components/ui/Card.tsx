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
        white: 'card-base bg-[var(--bg-primary)]',
        glass: 'bg-white/80 backdrop-blur-md border border-[var(--border-subtle)] shadow-sm',
        blue: 'bg-[var(--info)] text-white shadow-xl shadow-blue-500/10',
        dark: 'bg-[var(--text-primary)] text-white border border-[var(--border-subtle)] shadow-xl',
        outline: 'bg-transparent border border-[var(--border-medium)] border-dashed'
    };

    return (
        <div
            onClick={onClick}
            className={`
        rounded-2xl
        overflow-hidden 
        transition-all duration-200 
        ${variants[variant]} 
        ${onClick ? 'cursor-pointer active:scale-[0.99] hover:shadow-md' : ''} 
        ${className}
      `}
        >
            {children}
        </div>
    );
};
