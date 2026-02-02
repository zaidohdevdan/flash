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
    const baseStyles = 'inline-flex items-center justify-center font-bold uppercase tracking-widest transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100';

    const variants = {
        primary: 'bg-blue-600 text-white shadow-lg shadow-blue-500/20 hover:bg-blue-700',
        secondary: 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 shadow-sm',
        glass: 'bg-white/10 backdrop-blur-xl border border-white/20 text-white hover:bg-white/20',
        ghost: 'text-gray-500 hover:bg-gray-100',
        danger: 'bg-red-500 text-white shadow-lg shadow-red-500/20 hover:bg-red-600',
        success: 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20 hover:bg-emerald-600'
    };

    const sizes = {
        sm: 'px-3 py-1.5 text-[9px] rounded-lg',
        md: 'px-4 py-2.5 text-[10px] rounded-xl',
        lg: 'px-6 py-4 text-xs rounded-2xl md:rounded-[1.5rem]'
    };

    return (
        <button
            className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${fullWidth ? 'w-full' : ''} ${className}`}
            disabled={disabled || isLoading}
            {...props}
        >
            {isLoading ? (
                <span className="flex items-center gap-2">
                    <svg className="animate-spin h-3 w-3 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    CARREGANDO...
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
