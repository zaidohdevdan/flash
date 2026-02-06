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
                <label className="text-[10px] font-black text-slate-300 uppercase tracking-widest ml-1">
                    {label}
                </label>
            )}
            <textarea
                className={`
          w-full 
          px-5 py-4 
          bg-slate-900/50 
          border border-white/5 
          rounded-[1.5rem] 
          outline-none 
          focus:bg-slate-900 
          focus:border-blue-500/50 
          focus:ring-4 
          focus:ring-blue-500/10 
          transition-all 
          font-medium 
          text-sm 
          text-white
          leading-relaxed
          placeholder:text-slate-400
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
