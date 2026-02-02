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
    ...props
}) => {
    return (
        <div className="space-y-1 w-full">
            {label && (
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">
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
            bg-gray-50/50 
            border border-gray-100 
            rounded-2xl 
            outline-none 
            focus:bg-white 
            focus:border-blue-500/50 
            focus:ring-4 
            focus:ring-blue-500/5 
            transition-all 
            font-medium 
            text-sm 
            placeholder:text-gray-300
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
