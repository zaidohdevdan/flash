import React, { useState, useEffect } from 'react';
import { Menu, Bell, Search, Wifi, WifiOff, TerminalSquare } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { NotificationDrawer } from '../components/ui/NotificationDrawer';
import { AdminTerminal } from '../components/admin/AdminTerminal';
import { ActiveConferenceBanner } from '../components/ui/ActiveConferenceBanner';
import { SidebarNav } from '../components/ui/SidebarNav';
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
    const [isTerminalOpen, setIsTerminalOpen] = useState(false);
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

    return (
        <div className="h-screen bg-[#0a0f1c] dark:bg-[#020617] flex overflow-hidden print:h-auto print:block print:overflow-visible relative">
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
                    className="fixed inset-0 bg-black/60 z-40 lg:hidden backdrop-blur-sm"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside className={`
                fixed inset-y-0 left-0 z-50 w-72 
                transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:block
                ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
                print:hidden
            `}>
                <SidebarNav
                    user={user}
                    onProfileClick={onProfileClick}
                    onLogout={onLogout}
                />
            </aside>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden print:overflow-visible print:block print:h-auto">
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

                        {user?.role === 'ADMIN' && (
                            <Button
                                variant="ghost"
                                size="sm"
                                className="relative text-[var(--text-secondary)] hover:text-indigo-400 hover:bg-indigo-500/10"
                                onClick={() => setIsTerminalOpen(true)}
                                title="Admin Console"
                            >
                                <TerminalSquare className="w-4 h-4" />
                            </Button>
                        )}

                        <Button
                            variant="ghost"
                            size="sm"
                            className="relative text-[var(--text-secondary)]"
                            onClick={() => setIsNotificationsOpen(true)}
                        >
                            <Bell className="w-4 h-4" />
                            {notifications.filter(n => !n.read).length > 0 && (
                                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-[var(--bg-primary)]"></span>
                            )}
                        </Button>
                    </div>
                </header>

                {/* Page Content */}
                <main className="flex-1 overflow-y-auto overflow-x-hidden bg-[var(--bg-secondary)] p-4 lg:px-6 lg:py-8 print:p-0 print:bg-white print:overflow-visible print:h-auto print:block">
                    <div className="max-w-[1600px] mx-auto w-full xl:px-4 print:max-w-none print:w-full">
                        {children}
                    </div>
                </main>
            </div>

            <AdminTerminal
                isOpen={isTerminalOpen}
                onClose={() => setIsTerminalOpen(false)}
            />

            <NotificationDrawer
                isOpen={isNotificationsOpen}
                onClose={() => setIsNotificationsOpen(false)}
                notifications={notifications}
                onMarkAsRead={onMarkAsRead}
                onMarkAllAsRead={onMarkAllAsRead}
                onDelete={onDelete}
            />
        </div >
    );
}
