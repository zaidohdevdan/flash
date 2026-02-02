import React from 'react';
import { User as UserIcon } from 'lucide-react';
import { formatUrl } from '../../services/api';

/**
 * Propriedades para o componente Avatar.
 */
export interface AvatarProps {
    /** URL da imagem do avatar. Suporta Cloudinary e URLs absolutas. */
    src?: string | null;
    /** Texto alternativo para a imagem. */
    alt?: string;
    /** Tamanho do avatar: 'sm', 'md', 'lg', 'xl'. */
    size?: 'sm' | 'md' | 'lg' | 'xl';
    /** Exibe o indicador de status online (verde/cinza). */
    isOnline?: boolean;
    /** Classes CSS adicionais para o container. */
    className?: string;
}

/**
 * Componente de Avatar padronizado com efeito Glassmorphism suave.
 * Gerencia falhas de carregamento de imagem com fallback para ícone de usuário.
 */
export const Avatar: React.FC<AvatarProps> = ({
    src,
    alt = 'Usuário',
    size = 'md',
    isOnline,
    className = ''
}) => {
    const sizeClasses = {
        sm: 'w-7 h-7 md:w-8 md:h-8',
        md: 'w-9 h-9 md:w-10 md:h-10',
        lg: 'w-10 h-10 md:w-12 md:h-12',
        xl: 'w-14 h-14 md:w-20 md:h-20'
    };

    const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
        const target = e.target as HTMLImageElement;
        target.style.display = 'none';
        target.nextElementSibling?.classList.remove('hidden');
    };

    return (
        <div className={`relative shrink-0 ${className}`}>
            <div className={`
        ${sizeClasses[size]} 
        rounded-xl md:rounded-2xl 
        overflow-hidden 
        bg-gray-100 
        flex items-center justify-center 
        border-2 border-white 
        shadow-sm 
        group-hover:scale-105 
        transition-transform 
        duration-300
      `}>
                {src ? (
                    <img
                        src={formatUrl(src)}
                        alt={alt}
                        className="w-full h-full object-cover"
                        onError={handleImageError}
                    />
                ) : null}
                <div className={`${src ? 'hidden' : ''} w-full h-full flex items-center justify-center bg-blue-50`}>
                    <UserIcon className="w-1/2 h-1/2 text-blue-400" />
                </div>
            </div>

            {isOnline !== undefined && (
                <div className={`
          absolute -bottom-0.5 -right-0.5 
          ${size === 'sm' ? 'w-2.5 h-2.5' : 'w-3.5 h-3.5'} 
          border-2 border-white 
          rounded-full 
          ${isOnline ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.4)]' : 'bg-gray-300'}
        `} />
            )}
        </div>
    );
};
