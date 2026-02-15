import React, { useState, useEffect } from 'react';
import {
    LayoutDashboard,
    LogOut,
    Bell,
    Menu,
    Search,
    ArrowRight,
    Wifi,
    WifiOff,
    Settings as SettingsIcon,
    Activity
} from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { NotificationDrawer } from '../components/ui/NotificationDrawer';
import { ActiveConferenceBanner } from '../components/ui/ActiveConferenceBanner';
import { syncAll } from '../services/offlineSync';
import type { Notification } from '../types';

interface DashboardLayoutProps {
    children: React.ReactNode;
    user?: {
        name?: string;
        avatarUrl?: string | null;
        role?: string;
    };
    onDelete?: (id: string) => void;
    onLogout?: () => void;
    notifications?: Notification[];
    onMarkAsRead?: (id: string) => void;
    onMarkAllAsRead?: () => void;
    onProfileClick?: () => void;
    searchTerm?: string;
    onSearchChange?: (value: string) => void;
    activeRoom?: string | null;
    onRejoinRoom?: (roomId: string) => void;
}

export function DashboardLayout({
    children,
    user,
    onLogout,
    notifications = [],
    onMarkAsRead = () => { },
    onMarkAllAsRead = () => { },
    onProfileClick,
    searchTerm,
    onSearchChange,
    activeRoom,
    onRejoinRoom,
    onDelete = () => { }
}: DashboardLayoutProps) {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
    const [isOnline, setIsOnline] = useState(navigator.onLine);
    const [persistentRoom, setPersistentRoom] = useState<string | null>(() => localStorage.getItem('flash_active_room'));

    if (activeRoom && activeRoom !== persistentRoom) {
        setPersistentRoom(activeRoom);
    }

    useEffect(() => {
        if (activeRoom) {
            localStorage.setItem('flash_active_room', activeRoom);
        }
    }, [activeRoom]);

    const handleDismissBanner = () => {
        localStorage.removeItem('flash_active_room');
        setPersistentRoom(null);
    };

    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        const handleOnline = () => {
            setIsOnline(true);
            syncAll();
        };
        const handleOffline = () => setIsOnline(false);

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        // Initial sync check
        if (navigator.onLine) {
            syncAll();
        }

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);

    const menuItems = [
        { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
        { icon: Activity, label: 'Logs do Sistema', path: '/logs' },
        { icon: SettingsIcon, label: 'Configurações', path: '/settings' },
    ];

    // Filter menu items for non-admins
    const filteredMenuItems = user?.role === 'ADMIN'
        ? menuItems
        : menuItems.filter(item => item.path !== '/logs');

    const isActive = (path: string) => location.pathname === path;
    const unreadCount = notifications.filter(n => !n.read).length;



    return (
        <div className="h-screen bg-[var(--bg-secondary)] flex overflow-hidden">
            {persistentRoom && !activeRoom && (
                <ActiveConferenceBanner
                    roomName={persistentRoom}
                    onRejoin={() => onRejoinRoom?.(persistentRoom)}
                    onDismiss={handleDismissBanner}
                />
            )}
            {/* Mobile Sidebar Overlay */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/20 z-40 lg:hidden backdrop-blur-sm"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-[var(--bg-primary)] border-r border-[var(--border-subtle)]
        transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:block
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        print:hidden
      `}>
                <div className="h-full flex flex-col">
                    {/* Logo Area */}
                    <div className="h-16 flex-shrink-0 flex items-center px-6 border-b border-[var(--border-subtle)]">
                        <span className="text-xl font-bold tracking-tight text-[var(--text-primary)]">
                            Flash<span className="text-[var(--accent-primary)]">.</span>
                        </span>
                    </div>

                    {/* User Profile Summary */}
                    <div
                        onClick={onProfileClick}
                        className="p-4 flex-shrink-0 border-b border-[var(--border-subtle)] bg-[var(--bg-secondary)]/50 cursor-pointer hover:bg-[var(--bg-secondary)] transition-colors"
                    >
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-[var(--bg-tertiary)] flex items-center justify-center overflow-hidden border border-[var(--border-subtle)]">
                                {user?.avatarUrl ? (
                                    <img src={user.avatarUrl} alt={user.name} className="w-full h-full object-cover" />
                                ) : (
                                    <span className="text-sm font-medium text-[var(--text-secondary)]">
                                        {user?.name?.charAt(0) || 'U'}
                                    </span>
                                )}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-[var(--text-primary)] truncate">
                                    {user?.name || 'Usuário'}
                                </p>
                                <p className="text-xs text-[var(--text-tertiary)] truncate capitalize">
                                    {user?.role?.toLowerCase() || 'Membro'}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
                        {filteredMenuItems.map((item) => (
                            <button
                                title={item.label}
                                type='button'
                                key={item.path}
                                onClick={() => navigate(item.path)}
                                className={`
                  w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors
                  ${isActive(item.path)
                                        ? 'bg-[var(--bg-tertiary)] text-[var(--text-primary)]'
                                        : 'text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)] hover:text-[var(--text-primary)]'}
                `}
                            >
                                <item.icon className="w-4 h-4" />
                                {item.label}
                            </button>
                        ))}
                    </nav>

                    {/* Bottom Actions */}
                    <div className="p-4 flex-shrink-0 border-t border-[var(--border-subtle)] space-y-2 bg-[var(--bg-primary)]">
                        <button
                            title='Sair'
                            type='button'
                            onClick={onLogout}
                            className="w-full flex items-center justify-between group px-4 py-3 rounded-2xl bg-[var(--bg-secondary)] hover:bg-red-50 text-[var(--text-secondary)] hover:text-red-600 transition-all duration-300 border border-[var(--border-subtle)] hover:border-red-100 shadow-sm"
                        >
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-[var(--bg-primary)] rounded-lg shadow-inner group-hover:scale-110 transition-transform">
                                    <LogOut className="w-4 h-4" />
                                </div>
                                <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-secondary)] group-hover:text-red-600">Sair do Sistema</span>
                            </div>
                            <div className="opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all">
                                <ArrowRight className="w-3 h-3" />
                            </div>
                        </button>
                    </div>
                </div>
            </aside>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden print:overflow-visible">
                {/* Top Header */}
                <header className="h-16 flex-shrink-0 bg-[var(--bg-primary)] border-b border-[var(--border-subtle)] flex items-center justify-between px-4 lg:px-8 print:hidden">
                    <div className="flex items-center gap-4">
                        <button
                            title='Abrir Menu'
                            type='button'
                            onClick={() => setIsSidebarOpen(true)}
                            className="lg:hidden p-2 -ml-2 text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)] rounded-lg"
                            aria-label="Toggle Sidebar"
                        >
                            <Menu className="w-5 h-5" />
                        </button>

                        <div className="hidden md:flex items-center max-w-md w-full">
                            {onSearchChange && (
                                <div className="relative w-full max-w-xs">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-tertiary)]" />
                                    <input
                                        type="text"
                                        placeholder="Pesquisar..."
                                        value={searchTerm || ''}
                                        onChange={(e) => onSearchChange(e.target.value)}
                                        className="w-full pl-9 pr-4 py-1.5 bg-[var(--bg-secondary)] border-none rounded-lg text-sm focus:ring-1 focus:ring-[var(--border-medium)] placeholder:text-[var(--text-tertiary)] text-[var(--text-primary)]"
                                    />
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all duration-500 shadow-sm border ${isOnline
                            ? 'bg-emerald-50 text-emerald-600 border-emerald-100'
                            : 'bg-red-50 text-red-600 border-red-100 animate-pulse'
                            }`}>
                            {isOnline ? (
                                <><Wifi className="w-3 h-3" /> Online</>
                            ) : (
                                <><WifiOff className="w-3 h-3" /> Offline</>
                            )}
                        </div>

                        <Button
                            variant="ghost"
                            size="sm"
                            className="relative text-[var(--text-secondary)]"
                            onClick={() => setIsNotificationsOpen(true)}
                        >
                            <Bell className="w-4 h-4" />
                            {unreadCount > 0 && (
                                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-[var(--bg-primary)]"></span>
                            )}
                        </Button>
                    </div>
                </header>

                {/* Page Content */}
                <main className="flex-1 overflow-y-auto bg-[var(--bg-secondary)] p-4 lg:p-8 print:p-0 print:bg-white print:overflow-visible">
                    <div className="max-w-7xl mx-auto print:max-w-none print:w-full">
                        {children}
                    </div>
                </main>
            </div>

            <NotificationDrawer
                isOpen={isNotificationsOpen}
                onClose={() => setIsNotificationsOpen(false)}
                notifications={notifications}
                onMarkAsRead={onMarkAsRead}
                onMarkAllAsRead={onMarkAllAsRead}
                onDelete={onDelete}
            />
        </div>
    );
}
