import React from 'react';

/**
 * Propriedades para o componente Button.
 */
export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    /** Estilo visual do botão. */
    variant?: 'primary' | 'secondary' | 'glass' | 'ghost' | 'danger' | 'success';
    /** Tamanho do botão. */
    size?: 'sm' | 'md' | 'lg';
    /** Ocupa toda a largura disponível. */
    fullWidth?: boolean;
    /** Exibe estado de carregamento e desabilita interações. */
    isLoading?: boolean;
    /** Ícone para exibir à esquerda do texto. */
    leftIcon?: React.ReactNode;
    /** Ícone para exibir à direita do texto. */
    rightIcon?: React.ReactNode;
}

/**
 * Componente de botão premium com efeitos dinâmicos e suporte a Glassmorphism.
 */
export const Button: React.FC<ButtonProps> = ({
    variant = 'primary',
    size = 'md',
    fullWidth = false,
    isLoading = false,
    leftIcon,
    rightIcon,
    children,
    className = '',
    disabled,
    ...props
}) => {
    const baseStyles = 'btn-base font-medium transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed';

    const variants = {
        primary: 'bg-[var(--accent-primary)] text-[var(--accent-text)] hover:bg-[var(--accent-secondary)] font-bold shadow-md shadow-[var(--accent-primary)]/10',
        secondary: 'bg-[var(--bg-primary)] border border-[var(--border-medium)] text-[var(--text-primary)] hover:bg-[var(--bg-secondary)] shadow-sm',
        glass: 'bg-[var(--bg-primary)]/80 backdrop-blur-sm border border-[var(--border-subtle)] text-[var(--text-secondary)] hover:bg-[var(--bg-primary)]',
        ghost: 'text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)] hover:text-[var(--text-primary)]',
        danger: 'bg-[var(--error)] text-white hover:bg-red-600 shadow-sm',
        success: 'bg-emerald-500 text-white hover:bg-emerald-600 font-semibold shadow-sm',
        dark: 'bg-[var(--text-primary)] text-white hover:bg-black/90 shadow-sm'
    };

    const sizes = {
        sm: 'px-3 py-1.5 text-xs',
        md: 'px-4 py-2 text-sm',
        lg: 'px-6 py-3 text-base'
    };

    return (
        <button
            className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${fullWidth ? 'w-full' : ''} ${className}`}
            disabled={disabled || isLoading}
            {...props}
        >
            {isLoading ? (
                <span className="flex items-center gap-2">
                    <svg className="animate-spin h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processando...
                </span>
            ) : (
                <>
                    {leftIcon && <span className="mr-2">{leftIcon}</span>}
                    {children}
                    {rightIcon && <span className="ml-2">{rightIcon}</span>}
                </>
            )}
        </button>
    );
};
