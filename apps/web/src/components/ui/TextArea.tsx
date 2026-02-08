import React from 'react';

/**
 * Propriedades para o componente TextArea.
 */
export interface TextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
    /** Rótulo exibido acima do campo. */
    label?: string;
    /** Mensagem de erro (opcional). */
    error?: string;
    /** Define se o redimensionamento deve ser desabilitado. */
    noResize?: boolean;
}

/**
 * Componente de TextArea estilizado para feedbacks e comentários longos.
 */
export const TextArea: React.FC<TextAreaProps> = ({
    label,
    error,
    noResize = false,
    className = '',
    ...props
}) => {
    return (
        <div className="space-y-1 w-full">
            {label && (
                <label className="text-[10px] font-black text-[var(--text-tertiary)] uppercase tracking-widest ml-1">
                    {label}
                </label>
            )}
            <textarea
                className={`
          w-full 
          px-5 py-4 
          bg-[var(--bg-primary)]
          border border-[var(--border-medium)]
          rounded-[1.5rem] 
          outline-none 
          focus:bg-[var(--bg-primary)]
          focus:border-[var(--accent-primary)]
          focus:ring-2
          focus:ring-[var(--accent-primary)]/10
          transition-all 
          font-medium 
          text-sm 
          text-[var(--text-primary)]
          leading-relaxed
          placeholder:text-[var(--text-tertiary)]
          ${noResize ? 'resize-none' : ''}
          ${error ? 'border-red-300 bg-red-50/50' : ''}
          ${className}
        `}
                {...props}
            />
            {error && (
                <p className="text-[10px] font-bold text-red-400 ml-1">{error}</p>
            )}
        </div>
    );
};
