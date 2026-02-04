import React from 'react';
import { LogOut, Bell, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Avatar } from './Avatar';

/**
 * Propriedades para o componente Header.
 */
export interface HeaderProps {
    /** Nome do sistema ou logo. */
    logo?: React.ReactNode;
    /** Usuário logado. */
    user?: {
        name?: string;
        avatarUrl?: string | null;
    };
    /** Função de logout. */
    onLogout?: () => void;
    /** Se o header deve ser fixo no topo. */
    sticky?: boolean;
    /** Qtd de notificações não lidas. */
    unreadCount?: number;
    /** Clique no sino. */
    onNotificationsClick?: () => void;
}

/**
 * Cabeçalho unificado com estética Glassmorphism.
 * Inclui identidade do sistema, perfil do usuário e ações globais.
 */
export const Header: React.FC<HeaderProps> = ({
    logo,
    user,
    onLogout,
    sticky = true,
    unreadCount = 0,
    onNotificationsClick
}) => {
    const [isAnimated, setIsAnimated] = React.useState(true);

    return (
        <header className={`
      ${sticky ? 'sticky top-0 z-40' : ''} 
      px-6 py-4 
      bg-white/70 backdrop-blur-xl 
      border-b border-white/20 
      shadow-sm shadow-blue-900/5 
      flex justify-between items-center
    `}>
            {/* Logo / Brand */}
            <div className="flex items-center gap-3">
                {logo || (
                    <div className="flex items-center gap-2 cursor-pointer select-none" onClick={() => setIsAnimated(!isAnimated)}>
                        <div className="relative w-8 h-8 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/30 overflow-hidden transition-transform active:scale-95">
                            <div className={`absolute inset-0 bg-white/20 rounded-xl pointer-events-none ${isAnimated ? 'animate-shiny-pulse' : ''}`}></div>
                            <Zap className={`w-5 h-5 text-yellow-300 fill-current filter drop-shadow-[0_0_3px_rgba(253,224,71,0.8)] ${isAnimated ? 'animate-vibrate-fast' : ''}`} />
                        </div>
                        <span className="font-black text-gray-900 tracking-tighter text-lg uppercase hidden sm:block">
                            Flash
                        </span>
                    </div>
                )}
            </div>

            {/* User Actions */}
            <div className="flex items-center gap-3 sm:gap-6">
                <button
                    onClick={onNotificationsClick}
                    className="relative p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-all rounded-full group"
                >
                    <Bell className="w-5 h-5" />
                    {unreadCount && unreadCount > 0 ? (
                        <span className="absolute top-2 right-2.5 w-2 h-2 bg-red-500 border-2 border-white rounded-full animate-pulse" />
                    ) : null}
                </button>

                <div className="flex items-center gap-3 pl-4 border-l border-gray-100">
                    <div className="text-right hidden sm:block">
                        <p className="text-xs font-black text-gray-900 uppercase tracking-tight">
                            {user?.name || 'Usuário'}
                        </p>
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                            Painel Web
                        </p>
                    </div>

                    <Link to="/profile">
                        <Avatar
                            src={user?.avatarUrl}
                            size="md"
                            className="cursor-pointer hover:ring-4 hover:ring-blue-500/10 transition-all"
                        />
                    </Link>

                    {onLogout && (
                        <button
                            onClick={onLogout}
                            className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 transition-all rounded-full ml-1"
                            title="Sair"
                        >
                            <LogOut className="w-5 h-5" />
                        </button>
                    )}
                </div>
            </div>
        </header>
    );
};
