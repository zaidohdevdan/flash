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
    /** Variante de estilo. */
    variant?: 'light' | 'dark';
}

/**
 * Componente de Input estilizado com foco em usabilidade e estética Glass.
 */
export const Input: React.FC<InputProps> = ({
    label,
    error,
    icon,
    className = '',
    variant = 'light',
    ...props
}) => {

    const variants = {
        light: 'bg-gray-50/50 border-gray-100 text-gray-900 focus:bg-white focus:border-blue-500/50',
        dark: 'bg-slate-900/50 border-white/10 text-white focus:bg-slate-900/80 focus:border-blue-500/50 placeholder:text-slate-400'
    };

    return (
        <div className="space-y-1 w-full">
            {label && (
                <label className={`text-[10px] font-black uppercase tracking-widest ml-1 ${variant === 'dark' ? 'text-slate-300' : 'text-gray-700'}`}>
                    {label}
                </label>
            )}
            <div className="relative group">
                {icon && (
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors">
                        {icon}
                    </div>
                )}
                <input
                    className={`
            w-full 
            ${icon ? 'pl-11' : 'px-5'} 
            py-3.5 
            rounded-2xl 
            outline-none 
            focus:ring-4 
            focus:ring-blue-500/5 
            transition-all 
            font-medium 
            text-sm 
            ${variants[variant]}
            ${error ? 'border-red-300 bg-red-50/50' : ''}
            ${className}
          `}
                    {...props}
                />
            </div>
            {error && (
                <p className="text-[10px] font-bold text-red-500 ml-1">{error}</p>
            )}
        </div>
    );
};
