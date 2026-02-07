import React from 'react';

/**
 * Propriedades para o componente Input.
 */
export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    /** Rótulo exibido acima do campo. */
    label?: string;
    /** Mensagem de erro (opcional). */
    error?: string;
    /** Ícone para exibir à esquerda. */
    icon?: React.ReactNode;
}

/**
 * Componente de Input estilizado com foco em usabilidade e estética Glass.
 */
export const Input: React.FC<InputProps> = ({
    label,
    error,
    icon,
    className = '',
    id,
    ...props
}) => {
    const generatedId = React.useId();
    const inputId = id || generatedId;

    return (
        <div className="space-y-1.5 w-full">
            {label && (
                <label
                    htmlFor={inputId}
                    className="text-sm font-medium text-[var(--text-secondary)] ml-0.5"
                >
                    {label}
                </label>
            )}
            <div className="relative group">
                {icon && (
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)] group-focus-within:text-[var(--text-primary)] transition-colors">
                        {icon}
                    </div>
                )}
                <input
                    id={inputId}
                    className={`
            w-full 
            ${icon ? 'pl-10' : 'px-4'} 
            py-2.5 
            rounded-xl
            bg-[var(--bg-primary)]
            border border-[var(--border-medium)]
            text-[var(--text-primary)]
            placeholder:text-[var(--text-tertiary)]
            focus:outline-none 
            focus:ring-2 
            focus:ring-[var(--border-subtle)]
            focus:border-[var(--text-primary)]
            transition-all 
            text-sm 
            ${error ? 'border-red-300 focus:border-red-500 focus:ring-red-100' : ''}
            ${className}
          `}
                    {...props}
                />
            </div>
            {error && (
                <p className="text-xs text-red-500 ml-0.5">{error}</p>
            )}
        </div>
    );
};
