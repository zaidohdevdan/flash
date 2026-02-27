import { useNavigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, LogOut, Settings as SettingsIcon, PieChart, Users, Building2, LifeBuoy, FolderArchive, Mail, Activity } from 'lucide-react';

interface SidebarNavProps {
    user?: {
        name?: string;
        avatarUrl?: string | null;
        role?: string;
    };
    onProfileClick?: () => void;
    onLogout?: () => void;
}

export function SidebarNav({ user, onProfileClick, onLogout }: SidebarNavProps) {
    const navigate = useNavigate();
    const location = useLocation();

    const menuItems = [
        { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard', roles: ['SUPERVISOR'] },
        { icon: LayoutDashboard, label: 'Painel Gestor', path: '/manager-dashboard', roles: ['MANAGER'] },
    ];

    const adminItems = [
        { icon: PieChart, label: 'Visão Geral', path: '/admin/overview' },
        { icon: Users, label: 'Usuários & Acessos', path: '/admin/users' },
        { icon: Building2, label: 'Setores Operacionais', path: '/admin/departments' },
        { icon: LifeBuoy, label: 'Chamados', path: '/admin/tickets' },
        { icon: FolderArchive, label: 'Auditoria & Arquivo', path: '/admin/audit' },
        { icon: Mail, label: 'Caixa de Entrada', path: '/admin/inbox' },
        { icon: Activity, label: 'Logs do Sistema', path: '/admin/logs' },
    ];

    const commonItems = [
        { icon: SettingsIcon, label: 'Configurações', path: '/settings' },
    ];

    const getFilteredMenuItems = () => {
        if (!user) return [];
        if (user.role === 'ADMIN') return [...adminItems, ...commonItems];

        const roleSpecific = menuItems.filter(item => item.roles.includes(user?.role || ''));
        return [...roleSpecific, ...commonItems];
    };

    const filteredMenuItems = getFilteredMenuItems();
    const isActive = (path: string) => location.pathname === path || (path !== '/' && location.pathname.startsWith(path + '/'));

    return (
        <div className="h-full flex flex-col w-full bg-[#0a0f1c] bg-opacity-95 dark:bg-[#282a36] backdrop-blur-md border-r border-white/5 dark:border-[#44475a] shadow-2xl relative overflow-hidden">
            {/* Dark mode subtle top glow */}
            <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-blue-500/10 dark:from-[#bd93f9]/10 to-transparent pointer-events-none" />

            {/* Logo Area */}
            <div className="h-20 flex-shrink-0 flex items-center px-8 border-b border-white/5 dark:border-[#44475a] relative z-10">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 dark:from-[#bd93f9] dark:to-[#ff79c6] flex items-center justify-center shadow-lg shadow-blue-500/20 dark:shadow-[#bd93f9]/20">
                        <span className="text-xl font-black text-white dark:text-[#f8f8f2]">F</span>
                    </div>
                    <span className="text-2xl font-black tracking-tight text-white dark:text-[#f8f8f2] drop-shadow-sm">
                        Flash<span className="text-blue-500 dark:text-[#ff79c6]">.</span>
                    </span>
                </div>
            </div>

            {/* User Profile Summary */}
            <div
                onClick={onProfileClick}
                className="p-5 flex-shrink-0 border-b border-white/5 dark:border-[#44475a] cursor-pointer relative z-10 group mt-2 mx-3 rounded-2xl hover:bg-white/5 dark:hover:bg-[#44475a]/30 transition-all duration-300"
            >
                <div className="flex items-center gap-4">
                    <div className="relative">
                        <div className="w-12 h-12 rounded-full bg-slate-800 dark:bg-[#44475a] flex items-center justify-center overflow-hidden border-2 border-slate-700/50 dark:border-[#6272a4] group-hover:border-blue-500/50 dark:group-hover:border-[#ff79c6] transition-colors shadow-inner">
                            {user?.avatarUrl ? (
                                <img src={user.avatarUrl} alt={user.name} className="w-full h-full object-cover" />
                            ) : (
                                <span className="text-lg font-bold text-slate-300 dark:text-[#f8f8f2]">
                                    {user?.name?.charAt(0) || 'U'}
                                </span>
                            )}
                        </div>
                        <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-emerald-500 dark:bg-[#50fa7b] border-2 border-[#0a0f1c] dark:border-[#282a36] rounded-full shadow-sm" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-[15px] font-bold text-slate-100 dark:text-[#f8f8f2] truncate group-hover:text-white dark:group-hover:text-[#8be9fd] transition-colors">
                            {user?.name || 'Usuário'}
                        </p>
                        <p className="text-[11px] font-semibold tracking-wider text-slate-400 dark:text-[#6272a4] truncate uppercase mt-0.5 group-hover:text-blue-400 dark:group-hover:text-[#ff79c6] transition-colors">
                            {user?.role === 'ADMIN' ? 'Administrador' : user?.role || 'Membro'}
                        </p>
                    </div>
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto no-scrollbar relative z-10 mt-2">
                <div className="px-3 mb-3">
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 dark:text-[#6272a4]">Menu Principal</span>
                </div>
                {filteredMenuItems.map((item) => {
                    const active = isActive(item.path);
                    return (
                        <button
                            title={item.label}
                            type='button'
                            key={item.path}
                            onClick={() => navigate(item.path)}
                            className={`
                                w-full flex items-center gap-4 px-4 py-3.5 rounded-xl text-[14px] font-bold transition-all duration-300 group relative overflow-hidden
                                ${active
                                    ? 'text-white dark:text-[#f8f8f2] bg-blue-500/10 dark:bg-[#bd93f9]/20 shadow-sm'
                                    : 'text-slate-400 dark:text-[#6272a4] hover:text-slate-100 dark:hover:text-[#f8f8f2] hover:bg-white/5 dark:hover:bg-[#44475a]/50'}
                            `}
                        >
                            {/* Active Route Highlight / Glow */}
                            {active && (
                                <>
                                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-blue-500 dark:bg-[#ff79c6] rounded-r-full shadow-[0_0_10px_rgba(59,130,246,0.8)] dark:shadow-[0_0_10px_rgba(255,121,198,0.8)]" />
                                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 dark:from-[#bd93f9]/10 to-transparent opacity-50 pointer-events-none" />
                                </>
                            )}

                            <item.icon className={`w-5 h-5 transition-transform duration-300 ${active ? 'text-blue-500 dark:text-[#bd93f9] scale-110' : 'group-hover:scale-110 group-hover:text-slate-300 dark:group-hover:text-[#f8f8f2]'}`} />
                            <span className="relative z-10 tracking-wide">{item.label}</span>
                        </button>
                    )
                })}
            </nav>

            {/* Bottom Actions */}
            <div className="p-5 flex-shrink-0 relative z-10">
                <button
                    title='Sair do Sistema'
                    type='button'
                    onClick={onLogout}
                    className="w-full flex items-center justify-between group px-5 py-4 rounded-2xl bg-white/5 dark:bg-[#44475a]/30 hover:bg-red-500/10 dark:hover:bg-[#ff5555]/10 text-slate-400 dark:text-[#6272a4] hover:text-red-400 dark:hover:text-[#ff5555] transition-all duration-300 border border-white/5 dark:border-[#44475a] hover:border-red-500/20 dark:hover:border-[#ff5555]/30 shadow-sm"
                >
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-black/20 dark:bg-[#282a36] rounded-xl group-hover:bg-red-500/20 dark:group-hover:bg-[#ff5555]/20 group-hover:scale-110 transition-all">
                            <LogOut className="w-4 h-4" />
                        </div>
                        <span className="text-[11px] font-bold uppercase tracking-widest group-hover:text-red-400 dark:group-hover:text-[#ff5555] transition-colors">Encerrar Sessão</span>
                    </div>
                </button>
            </div>
        </div>
    );
}
