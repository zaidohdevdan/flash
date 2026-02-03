import React, { useEffect } from 'react';
import { X } from 'lucide-react';

/**
 * Propriedades para o componente Modal.
 */
export interface ModalProps {
    /** Se o modal está aberto. */
    isOpen: boolean;
    /** Função chamada ao fechar o modal. */
    onClose: () => void;
    /** Título exibido no cabeçalho. */
    title?: string;
    /** Subtítulo descritivo (opcional). */
    subtitle?: string;
    /** Conteúdo do modal. */
    children: React.ReactNode;
    /** Rodapé personalizado (opcional). */
    footer?: React.ReactNode;
    /** Tamanho máximo do modal. */
    maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '4xl';
}

/**
 * Componente de Modal premium com backdrop desfocado e animação de entrada.
 * Gerencia o fechamento via Tecla ESC e clique no fundo.
 */
export const Modal: React.FC<ModalProps> = ({
    isOpen,
    onClose,
    title,
    subtitle,
    children,
    footer,
    maxWidth = 'md'
}) => {
    // Trata tecla ESC para fechar
    useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        if (isOpen) window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    const widthClasses = {
        sm: 'max-w-sm',
        md: 'max-w-md',
        lg: 'max-w-lg',
        xl: 'max-w-xl',
        '2xl': 'max-w-2xl',
        '4xl': 'max-w-4xl'
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-in fade-in duration-300">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-slate-900/40 backdrop-blur-md transition-opacity"
                onClick={onClose}
            />

            {/* Modal Content */}
            <div className={`
        relative w-full ${widthClasses[maxWidth]} 
        bg-white/60 backdrop-blur-[32px] rounded-[2.5rem] shadow-2xl 
        border border-white/50 ring-1 ring-white/20 overflow-hidden
        animate-in zoom-in-95 slide-in-from-bottom-4 duration-300
        flex flex-col max-h-[90vh]
      `}>
                {/* Header */}
                {(title || subtitle) && (
                    <div className="px-8 pt-8 pb-4 flex justify-between items-start">
                        <div>
                            {title && (
                                <h2 className="text-2xl font-black text-gray-900 tracking-tight leading-tight uppercase">
                                    {title}
                                </h2>
                            )}
                            {subtitle && (
                                <p className="text-sm text-gray-600 font-bold mt-1">
                                    {subtitle}
                                </p>
                            )}
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 -mr-2 text-gray-500 hover:text-gray-900 hover:bg-gray-100/50 rounded-2xl transition-all"
                        >
                            <X className="w-6 h-6" />
                        </button>
                    </div>
                )}

                {/* Body */}
                <div className="px-8 py-4 overflow-y-auto flex-1 custom-scrollbar">
                    {children}
                </div>

                {/* Footer */}
                {footer && (
                    <div className="px-8 py-6 bg-gray-50/50 border-t border-gray-50 mt-2 flex gap-3 justify-end">
                        {footer}
                    </div>
                )}
            </div>
        </div>
    );
};
