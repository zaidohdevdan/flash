import React from 'react';

/**
 * Propriedades para o componente GlassCard.
 */
export interface GlassCardProps {
    children: React.ReactNode;
    /** Classes CSS adicionais. */
    className?: string;
    /** Variante de transparência. 'light' é mais transparente, 'deep' é mais sólido. */
    variant?: 'light' | 'deep' | 'gradient';
    /** Nível de desfoque (blur). */
    blur?: 'sm' | 'md' | 'lg';
    /** Se deve aplicar borda semi-transparente. */
    withBorder?: boolean;
    /** Estilos inline adicionais. */
    style?: React.CSSProperties;
}

/**
 * Cartão especializado em Glassmorphism.
 * Utilizado para elementos flutuantes e seções que precisam de destaque visual suave.
 */
export const GlassCard: React.FC<GlassCardProps> = ({
    children,
    className = '',
    variant = 'light',
    blur = 'md',
    withBorder = true,
    style
}) => {
    const blurClasses = {
        sm: 'backdrop-blur-md',
        md: 'backdrop-blur-xl',
        lg: 'backdrop-blur-[32px]'
    };

    const variants = {
        light: 'bg-white/95 shadow-xl shadow-blue-500/5',
        deep: 'bg-white shadow-2xl',
        gradient: 'bg-gradient-to-br from-white to-blue-50/80 shadow-xl'
    };

    return (
        <div className={`
      ${variants[variant]} 
      ${blurClasses[blur]} 
      ${withBorder ? 'border border-white/50 ring-1 ring-white/30' : ''} 
      rounded-[2rem] 
      overflow-hidden 
      ${className}
    `}
            style={style}
        >
            {children}
        </div>
    );
};
