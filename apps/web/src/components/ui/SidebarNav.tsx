import { useNavigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, LogOut, Settings as SettingsIcon, PieChart, Users, Building2, LifeBuoy, FolderArchive, Mail, Activity, Target, Network, Calendar, HelpCircle, Archive, MessageSquare, Video } from 'lucide-react';

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
        { icon: Target, label: 'Novo Registro', path: '/dashboard/new', roles: ['PROFESSIONAL'] },
        { icon: LayoutDashboard, label: 'Visão Geral', path: '/dashboard/overview', roles: ['PROFESSIONAL'] },
        { icon: MessageSquare, label: 'Comunicação', path: '/dashboard/chat', roles: ['PROFESSIONAL'] },
    ];

    const managerItems = [
        { icon: Target, label: 'Inteligência Gestora', path: '/manager/intelligence' },
        { icon: Network, label: 'Esteira Operacional', path: '/manager/operations' },
        { icon: Users, label: 'Equipe & War Room', path: '/manager/team' },
        { icon: Archive, label: 'Arquivo Base', path: '/manager/archive' },
        { icon: MessageSquare, label: 'Comunicação', path: '/manager/chat' },
    ];

    const supervisorItems = [
        { icon: Target, label: 'Inteligência', path: '/supervisor/intelligence' },
        { icon: Network, label: 'Operações', path: '/supervisor/operations' },
        { icon: Video, label: 'Videoconferência', path: '/supervisor/conference' },
        { icon: Calendar, label: 'Agenda', path: '/supervisor/schedule' },
        { icon: HelpCircle, label: 'Suporte', path: '/supervisor/support' },
        { icon: Archive, label: 'Arquivo', path: '/supervisor/archive' },
        { icon: MessageSquare, label: 'Chat', path: '/supervisor/chat' },
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
        if (user.role === 'SUPERVISOR') return [...supervisorItems, ...commonItems];
        if (user.role === 'MANAGER') return [...managerItems, ...commonItems];

        const roleSpecific = menuItems.filter(item => item.roles.includes(user?.role || ''));
        return [...roleSpecific, ...commonItems];
    };

    const filteredMenuItems = getFilteredMenuItems();
    const isActive = (path: string) => location.pathname === path || (path !== '/' && location.pathname.startsWith(path + '/'));

    return (
        <div className="h-full flex flex-col w-full bg-white dark:bg-[#020617] border-r border-slate-200 dark:border-white/5 shadow-2xl relative overflow-hidden transition-all duration-500">
            {/* Dark mode subtle top glow */}
            <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-blue-500/10 dark:from-[#bd93f9]/10 to-transparent pointer-events-none" />

            {/* logo Area - Mission Control Branding */}
            <div className="h-20 flex-shrink-0 flex items-center px-8 border-b border-slate-200 dark:border-white/5 relative z-10">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 dark:from-[#bd93f9] dark:to-[#ff79c6] flex items-center justify-center shadow-lg shadow-blue-500/20 dark:shadow-[#bd93f9]/20">
                        <span className="text-xl font-black text-white dark:text-[#f8f8f2]">F</span>
                    </div>
                    <span className="text-2xl font-black tracking-tight text-slate-900 dark:text-white drop-shadow-sm">
                        Flash<span className="text-indigo-600 dark:text-indigo-400">.</span>
                    </span>
                </div>
            </div>

            {/* User Profile Summary */}
            <div
                onClick={onProfileClick}
                className="p-5 flex-shrink-0 border-b border-slate-200 dark:border-white/5 cursor-pointer relative z-10 group mt-2 mx-3 rounded-2xl hover:bg-slate-100 dark:hover:bg-white/5 transition-all duration-300"
            >
                <div className="flex items-center gap-4">
                    <div className="relative">
                        <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-black/40 flex items-center justify-center overflow-hidden border-2 border-slate-200 dark:border-white/10 group-hover:border-indigo-500/50 dark:group-hover:border-indigo-400/50 transition-colors shadow-inner">
                            {user?.avatarUrl ? (
                                <img src={user.avatarUrl} alt={user.name} className="w-full h-full object-cover" />
                            ) : (
                                <span className="text-lg font-bold text-slate-400 dark:text-slate-500">
                                    {user?.name?.charAt(0) || 'U'}
                                </span>
                            )}
                        </div>
                        <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-emerald-500 border-2 border-white dark:border-[#020617] rounded-full shadow-sm" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-[15px] font-bold text-slate-900 dark:text-white truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                            {user?.name || 'Usuário'}
                        </p>
                        <p className="text-[11px] font-semibold tracking-wider text-slate-500 dark:text-slate-500 truncate uppercase mt-0.5 group-hover:text-indigo-500 transition-colors">
                            {user?.role === 'ADMIN' ? 'Administrador' : user?.role || 'Membro'}
                        </p>
                    </div>
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto no-scrollbar relative z-10 mt-2">
                <div className="px-3 mb-3">
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-slate-600">Menu Principal</span>
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
                                    ? 'text-indigo-600 dark:text-white bg-indigo-50 dark:bg-indigo-500/10 shadow-sm'
                                    : 'text-slate-500 dark:text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5'}
                            `}
                        >
                            {/* Active Route Highlight / Glow */}
                            {active && (
                                <>
                                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-8 bg-indigo-600 dark:bg-indigo-400 rounded-r-full shadow-[0_0_15px_rgba(79,70,229,0.8)]" />
                                    <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 to-transparent opacity-50 pointer-events-none" />
                                </>
                            )}

                            <item.icon className={`w-5 h-5 transition-transform duration-300 ${active ? 'text-indigo-600 dark:text-white scale-110' : 'group-hover:scale-110 group-hover:text-slate-900 dark:group-hover:text-white'}`} />
                            <span className="relative z-10 tracking-wide uppercase text-[11px] font-black">{item.label}</span>
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
                    className="w-full flex items-center justify-between group px-5 py-4 rounded-2xl bg-slate-50 dark:bg-black/20 hover:bg-rose-50 dark:hover:bg-rose-500/10 text-slate-500 dark:text-slate-500 hover:text-rose-600 dark:hover:text-rose-400 transition-all duration-300 border border-slate-200 dark:border-white/5 hover:border-rose-200 dark:hover:border-rose-500/20 shadow-sm"
                >
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-white dark:bg-black/40 rounded-xl group-hover:bg-rose-500/20 group-hover:scale-110 transition-all shadow-inner">
                            <LogOut className="w-4 h-4" />
                        </div>
                        <span className="text-[11px] font-black uppercase tracking-widest group-hover:text-rose-600 dark:group-hover:text-rose-400 transition-colors">Encerrar Sessão</span>
                    </div>
                </button>
            </div>
        </div>
    );
}
