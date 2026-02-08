import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { AxiosError } from 'axios';
import {
    User,
    Bell,
    ChevronRight,
    Lock,
    Sun,
    Moon,
    Monitor,
    Database,
    Users,
    Volume2,
    Shield,
    KeyRound,
    Loader2,
    Trash2,
    Save
} from 'lucide-react';
import { DashboardLayout } from '../layouts/DashboardLayout';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../services/api';
import { db } from '../services/db';
import toast from 'react-hot-toast';

type Theme = 'light' | 'dark' | 'system';
type Density = 'comfortable' | 'compact';

interface AdminUser {
    id: string;
    name: string;
    email: string;
    role: string;
    avatarUrl?: string;
}

// --- Sub-components ---

const GeneralSettings = () => {
    const { user, updateUser } = useAuth();
    const { t, i18n } = useTranslation();
    const [displayName, setDisplayName] = useState(user?.name || '');
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (user?.name) setDisplayName(user.name);
    }, [user?.name]);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            await api.patch('/profile', { name: displayName });

            if (user) {
                updateUser({ ...user, name: displayName });
            }

            toast.success(t('settings.general.success'));
        } catch (error) {
            console.error(error);
            toast.error(t('settings.general.error'));
        } finally {
            setIsSaving(false);
        }
    };

    const handleLanguageChange = (lang: string) => {
        i18n.changeLanguage(lang);
        // Only update user specific setting
        if (user?.id) {
            localStorage.setItem(`settings_${user.id}_language`, lang);
        }
    };

    return (
        <div className="space-y-6 animate-in">
            <div>
                <h3 className="text-lg font-bold text-[var(--text-primary)]">{t('settings.general.title')}</h3>
                <p className="text-sm text-[var(--text-tertiary)]">{t('settings.general.description')}</p>
            </div>
            <form onSubmit={handleSave} className="bg-[var(--bg-primary)] border border-[var(--border-subtle)] rounded-2xl p-6 space-y-6">
                <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-[var(--text-tertiary)] uppercase tracking-wider">{t('settings.general.displayName')}</label>
                    <input
                        type="text"
                        value={displayName}
                        onChange={e => setDisplayName(e.target.value)}
                        className="p-3 bg-[var(--bg-secondary)] rounded-xl border border-[var(--border-subtle)] text-[var(--text-primary)] outline-none focus:ring-1 focus:ring-[var(--accent-primary)]"
                        placeholder="Seu nome"
                        required
                    />
                </div>
                <div className="flex flex-col gap-1.5">
                    <label htmlFor="language-select" className="text-xs font-bold text-[var(--text-tertiary)] uppercase tracking-wider">{t('settings.general.language')}</label>
                    <select
                        id="language-select"
                        value={i18n.language}
                        onChange={e => handleLanguageChange(e.target.value)}
                        className="p-3 bg-[var(--bg-secondary)] rounded-xl border border-[var(--border-subtle)] text-[var(--text-primary)] focus:ring-1 focus:ring-[var(--accent-primary)] outline-none"
                    >
                        <option value="pt">Português (Brasil)</option>
                        <option value="en">English (US)</option>
                    </select>
                </div>

                <div className="pt-6 border-t border-[var(--border-subtle)] flex justify-end">
                    <button
                        type="submit"
                        disabled={isSaving}
                        className="flex items-center gap-2 px-6 py-2.5 bg-[var(--accent-primary)] text-[var(--accent-text)] rounded-xl font-bold text-sm hover:brightness-110 active:scale-95 transition-all disabled:opacity-50"
                    >
                        {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                        {isSaving ? t('settings.general.saving') : t('settings.general.save')}
                    </button>
                </div>
            </form>
        </div>
    );
};

const AppearanceSettings = () => {
    const { user } = useAuth();
    const { t } = useTranslation();
    const [theme, setTheme] = useState<Theme>(() => {
        if (user?.id) {
            return (localStorage.getItem(`settings_${user.id}_theme`) as Theme) || 'system';
        }
        return (localStorage.getItem('theme') as Theme) || 'system';
    });
    const [density, setDensity] = useState<Density>(() => {
        if (user?.id) {
            return (localStorage.getItem(`settings_${user.id}_density`) as Density) || 'comfortable';
        }
        return (localStorage.getItem('density') as Density) || 'comfortable';
    });

    const applyTheme = (newTheme: Theme) => {
        setTheme(newTheme);
        localStorage.setItem('theme', newTheme);
        if (user?.id) {
            localStorage.setItem(`settings_${user.id}_theme`, newTheme);
        }

        if (newTheme === 'dark') {
            document.documentElement.classList.add('dark');
        } else if (newTheme === 'light') {
            document.documentElement.classList.remove('dark');
        } else {
            if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
                document.documentElement.classList.add('dark');
            } else {
                document.documentElement.classList.remove('dark');
            }
        }
    };

    const applyDensity = (newDensity: Density) => {
        setDensity(newDensity);
        localStorage.setItem('density', newDensity);
        if (user?.id) {
            localStorage.setItem(`settings_${user.id}_density`, newDensity);
        }
        // Apply to document
        document.documentElement.setAttribute('data-density', newDensity);
    };

    return (
        <div className="space-y-6 animate-in">
            <div>
                <h3 className="text-lg font-bold text-[var(--text-primary)]">{t('settings.appearance.title')}</h3>
                <p className="text-sm text-[var(--text-tertiary)]">{t('settings.appearance.description')}</p>
            </div>

            <div className="bg-[var(--bg-primary)] border border-[var(--border-subtle)] rounded-2xl p-6 space-y-6">
                <div className="space-y-4">
                    <label className="text-xs font-bold text-[var(--text-tertiary)] uppercase tracking-wider">{t('settings.appearance.theme')}</label>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        {[
                            { id: 'light', label: t('settings.appearance.themes.light'), icon: Sun },
                            { id: 'dark', label: t('settings.appearance.themes.dark'), icon: Moon },
                            { id: 'system', label: t('settings.appearance.themes.system'), icon: Monitor },
                        ].map((tItem) => (
                            <button
                                key={tItem.id}
                                onClick={() => applyTheme(tItem.id as Theme)}
                                className={`
                                    flex flex-col items-center gap-3 p-4 rounded-xl border-2 transition-all
                                    ${theme === tItem.id
                                        ? 'border-[var(--accent-primary)] bg-[var(--bg-tertiary)]'
                                        : 'border-[var(--border-subtle)] hover:border-[var(--border-medium)]'}
                                `}
                            >
                                <tItem.icon className={`w-6 h-6 ${theme === tItem.id ? 'text-[var(--text-primary)]' : 'text-[var(--text-tertiary)]'}`} />
                                <span className={`text-sm font-bold ${theme === tItem.id ? 'text-[var(--text-primary)]' : 'text-[var(--text-tertiary)]'}`}>
                                    {tItem.label}
                                </span>
                            </button>
                        ))}
                    </div>
                </div>

                <div className="pt-6 border-t border-[var(--border-subtle)] space-y-4">
                    <label className="text-xs font-bold text-[var(--text-tertiary)] uppercase tracking-wider">{t('settings.appearance.density')}</label>
                    <div className="flex bg-[var(--bg-tertiary)] p-1 rounded-lg w-fit">
                        <button
                            onClick={() => applyDensity('comfortable')}
                            className={`px-4 py-2 rounded-md text-xs font-bold uppercase tracking-wider transition-all ${density === 'comfortable' ? 'bg-white shadow-sm text-[var(--text-primary)]' : 'text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]'}`}
                        >
                            {t('settings.appearance.densities.comfortable')}
                        </button>
                        <button
                            onClick={() => applyDensity('compact')}
                            className={`px-4 py-2 rounded-md text-xs font-bold uppercase tracking-wider transition-all ${density === 'compact' ? 'bg-white shadow-sm text-[var(--text-primary)]' : 'text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]'}`}
                        >
                            {t('settings.appearance.densities.compact')}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

const NotificationSettings = () => {
    const { t } = useTranslation();
    return (
        <div className="space-y-6 animate-in">
            <div>
                <h3 className="text-lg font-bold text-[var(--text-primary)]">{t('settings.notifications.title')}</h3>
                <p className="text-sm text-[var(--text-tertiary)]">{t('settings.notifications.description')}</p>
            </div>

            <div className="bg-[var(--bg-primary)] border border-[var(--border-subtle)] rounded-2xl p-6 space-y-6">
                <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-[var(--bg-secondary)] rounded-xl border border-[var(--border-subtle)]">
                        <div className="flex items-center gap-3">
                            <Volume2 className="w-5 h-5 text-[var(--text-tertiary)]" />
                            <div>
                                <p className="text-sm font-bold text-[var(--text-primary)]">{t('settings.notifications.sound')}</p>
                                <p className="text-[10px] text-[var(--text-tertiary)]">{t('settings.notifications.soundDesc')}</p>
                            </div>
                        </div>
                        <input type="checkbox" title="Ativar sons" className="w-5 h-5 accent-[var(--accent-primary)] cursor-pointer" defaultChecked />
                    </div>

                    <div className="flex items-center justify-between p-4 bg-[var(--bg-secondary)] rounded-xl border border-[var(--border-subtle)]">
                        <div className="flex items-center gap-3">
                            <Monitor className="w-5 h-5 text-[var(--text-tertiary)]" />
                            <div>
                                <p className="text-sm font-bold text-[var(--text-primary)]">{t('settings.notifications.desktop')}</p>
                                <p className="text-[10px] text-[var(--text-tertiary)]">{t('settings.notifications.desktopDesc')}</p>
                            </div>
                        </div>
                        <input type="checkbox" title="Ativar notificações de desktop" className="w-5 h-5 accent-[var(--accent-primary)] cursor-pointer" defaultChecked />
                    </div>
                </div>
            </div>
        </div>
    );
};

const SecuritySettings = () => {
    const { t } = useTranslation();
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handlePasswordChange = async (e: React.FormEvent) => {
        e.preventDefault();
        if (newPassword !== confirmPassword) {
            return toast.error(t('settings.security.mismatch'));
        }

        setIsLoading(true);
        try {
            await api.post('/profile/change-password', { currentPassword, newPassword });
            toast.success(t('settings.security.success'));
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
        } catch (error) {
            const err = error as AxiosError<{ error: string }>;
            const message = err.response?.data?.error || t('settings.security.error');
            toast.error(message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="space-y-6 animate-in">
            <div>
                <h3 className="text-lg font-bold text-[var(--text-primary)]">{t('settings.security.title')}</h3>
                <p className="text-sm text-[var(--text-tertiary)]">{t('settings.security.description')}</p>
            </div>

            <form onSubmit={handlePasswordChange} className="bg-[var(--bg-primary)] border border-[var(--border-subtle)] rounded-2xl p-6 space-y-6">
                <div className="space-y-4">
                    <label className="text-xs font-bold text-[var(--text-tertiary)] uppercase tracking-wider">{t('settings.security.changePassword')}</label>
                    <div className="space-y-4">
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-[var(--text-tertiary)] uppercase tracking-widest ml-1">{t('settings.security.currentPassword')}</label>
                            <input
                                type="password"
                                value={currentPassword}
                                onChange={e => setCurrentPassword(e.target.value)}
                                className="w-full p-3 bg-[var(--bg-secondary)] rounded-xl border border-[var(--border-subtle)] text-[var(--text-primary)] outline-none focus:ring-1 focus:ring-[var(--accent-primary)]"
                                placeholder="••••••••"
                                required
                            />
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-[var(--text-tertiary)] uppercase tracking-widest ml-1">{t('settings.security.newPassword')}</label>
                                <input
                                    type="password"
                                    value={newPassword}
                                    onChange={e => setNewPassword(e.target.value)}
                                    className="w-full p-3 bg-[var(--bg-secondary)] rounded-xl border border-[var(--border-subtle)] text-[var(--text-primary)] outline-none focus:ring-1 focus:ring-[var(--accent-primary)]"
                                    placeholder="••••••••"
                                    required
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-[var(--text-tertiary)] uppercase tracking-widest ml-1">{t('settings.security.confirmPassword')}</label>
                                <input
                                    type="password"
                                    value={confirmPassword}
                                    onChange={e => setConfirmPassword(e.target.value)}
                                    className="w-full p-3 bg-[var(--bg-secondary)] rounded-xl border border-[var(--border-subtle)] text-[var(--text-primary)] outline-none focus:ring-1 focus:ring-[var(--accent-primary)]"
                                    placeholder="••••••••"
                                    required
                                />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="pt-6 border-t border-[var(--border-subtle)] flex justify-end">
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="flex items-center gap-2 px-6 py-2.5 bg-[var(--accent-primary)] text-[var(--accent-text)] rounded-xl font-bold text-sm hover:brightness-110 active:scale-95 transition-all disabled:opacity-50"
                    >
                        {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <KeyRound className="w-4 h-4" />}
                        {t('settings.security.save')}
                    </button>
                </div>
            </form>
        </div>
    );
};

const OfflineSettings = () => {
    const { t } = useTranslation();
    const [stats, setStats] = useState({
        pendingReports: 0,
        chatMessages: 0,
        notifications: 0
    });
    const [isLoading, setIsLoading] = useState(false);

    const loadStats = async () => {
        const pendingReports = await db.pendingReports.count();
        const chatMessages = await db.chatMessages.count();
        const notifications = await db.notifications.count();
        setStats({ pendingReports, chatMessages, notifications });
    };

    useEffect(() => {
        loadStats();
    }, []);

    const handleClearCache = async () => {
        if (!window.confirm(t('settings.offline.confirmClear'))) return;

        setIsLoading(true);
        try {
            await db.chatMessages.clear();
            await db.notifications.clear();
            await db.pendingReports.where('status').equals('failed').delete();
            await db.pendingReports.clear();

            toast.success(t('settings.offline.success'));
            loadStats();
        } catch (error) {
            console.error(error);
            toast.error(t('settings.offline.error'));
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="space-y-6 animate-in">
            <div>
                <h3 className="text-lg font-bold text-[var(--text-primary)]">{t('settings.offline.title')}</h3>
                <p className="text-sm text-[var(--text-tertiary)]">{t('settings.offline.description')}</p>
            </div>

            <div className="bg-[var(--bg-primary)] border border-[var(--border-subtle)] rounded-2xl p-6 space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="p-4 bg-[var(--bg-secondary)] rounded-xl border border-[var(--border-subtle)] flex flex-col items-center gap-2">
                        <span className="text-3xl font-black text-[var(--text-primary)]">{stats.chatMessages}</span>
                        <span className="text-xs font-bold text-[var(--text-tertiary)] uppercase tracking-wider text-center">{t('settings.offline.messages')}</span>
                    </div>
                    <div className="p-4 bg-[var(--bg-secondary)] rounded-xl border border-[var(--border-subtle)] flex flex-col items-center gap-2">
                        <span className="text-3xl font-black text-[var(--text-primary)]">{stats.pendingReports}</span>
                        <span className="text-xs font-bold text-[var(--text-tertiary)] uppercase tracking-wider text-center">{t('settings.offline.reports')}</span>
                    </div>
                    <div className="p-4 bg-[var(--bg-secondary)] rounded-xl border border-[var(--border-subtle)] flex flex-col items-center gap-2">
                        <span className="text-3xl font-black text-[var(--text-primary)]">{stats.notifications}</span>
                        <span className="text-xs font-bold text-[var(--text-tertiary)] uppercase tracking-wider text-center">{t('settings.offline.notifications')}</span>
                    </div>
                </div>

                <div className="pt-6 border-t border-[var(--border-subtle)] space-y-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <h4 className="text-sm font-bold text-[var(--text-primary)]">{t('settings.offline.clearData')}</h4>
                            <p className="text-[10px] text-[var(--text-tertiary)]">{t('settings.offline.clearDataDesc')}</p>
                        </div>
                        <button
                            onClick={handleClearCache}
                            disabled={isLoading}
                            className="flex items-center gap-2 px-4 py-2 bg-red-500/10 text-red-500 hover:bg-red-500/20 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors disabled:opacity-50"
                        >
                            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                            {t('settings.offline.clearButton')}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

const AdminSettings = () => {
    const { t } = useTranslation();
    const [users, setUsers] = useState<AdminUser[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    const loadUsers = useCallback(async () => {
        setIsLoading(true);
        try {
            const response = await api.get<AdminUser[]>('/users', {
                params: { search: searchTerm }
            });
            setUsers(response.data);
        } catch (error) {
            console.error(error);
            toast.error('Erro ao carregar usuários.');
        } finally {
            setIsLoading(false);
        }
    }, [searchTerm]);

    useEffect(() => {
        loadUsers();
    }, [loadUsers]);

    const handleDeleteUser = async (userId: string) => {
        if (!window.confirm(t('settings.admin.confirmDelete'))) return;

        try {
            await api.delete(`/users/${userId}`);
            toast.success(t('settings.admin.deleteSuccess'));
            loadUsers();
        } catch (error) {
            const err = error as AxiosError<{ error: string }>;
            const message = err.response?.data?.error || t('settings.admin.deleteError');
            toast.error(message);
        }
    };

    return (
        <div className="space-y-6 animate-in">
            <div>
                <h3 className="text-lg font-bold text-[var(--text-primary)]">{t('settings.admin.title')}</h3>
                <p className="text-sm text-[var(--text-tertiary)]">{t('settings.admin.description')}</p>
            </div>

            <div className="bg-[var(--bg-primary)] border border-[var(--border-subtle)] rounded-2xl p-6 space-y-6">
                <div className="space-y-4">
                    <h4 className="text-sm font-bold text-[var(--text-primary)] mb-4">{t('settings.admin.systemCustomization')}</h4>
                    <div className="flex flex-col gap-1.5 max-w-xs">
                        <label className="text-xs font-bold text-[var(--text-tertiary)] uppercase tracking-wider">{t('settings.admin.systemLanguage')}</label>
                        <select
                            title={t('settings.admin.systemLanguage')}
                            value={localStorage.getItem('language') || 'pt'}
                            onChange={(e) => {
                                const lang = e.target.value;
                                localStorage.setItem('language', lang);
                                toast.success(t('settings.admin.systemLanguageSuccess'));
                            }}
                            className="p-3 bg-[var(--bg-secondary)] rounded-xl border border-[var(--border-subtle)] text-[var(--text-primary)] focus:ring-1 focus:ring-[var(--accent-primary)] outline-none"
                        >
                            <option value="pt">Português (Brasil)</option>
                            <option value="en">English (US)</option>
                        </select>
                        <p className="text-[10px] text-[var(--text-tertiary)]">{t('settings.admin.systemLanguageDesc')}</p>
                    </div>
                </div>

                <div className="pt-6 border-t border-[var(--border-subtle)] space-y-4">
                    <h4 className="text-sm font-bold text-[var(--text-primary)]">{t('settings.admin.users')}</h4>

                    <div className="flex gap-4">
                        <input
                            type="text"
                            placeholder={t('settings.admin.searchPlaceholder')}
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            className="flex-1 p-3 bg-[var(--bg-secondary)] rounded-xl border border-[var(--border-subtle)] text-[var(--text-primary)] outline-none focus:ring-1 focus:ring-[var(--accent-primary)] text-sm"
                        />
                    </div>

                    <div className="space-y-2">
                        {isLoading ? (
                            <div className="flex justify-center p-8"><Loader2 className="w-6 h-6 animate-spin text-[var(--accent-primary)]" /></div>
                        ) : (
                            users.map(u => (
                                <div key={u.id} className="flex items-center justify-between p-4 bg-[var(--bg-secondary)] rounded-xl border border-[var(--border-subtle)] group">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-full bg-[var(--bg-tertiary)] flex items-center justify-center overflow-hidden">
                                            {u.avatarUrl ? <img src={u.avatarUrl} alt={u.name} className="w-full h-full object-cover" /> : <User className="w-5 h-5 text-[var(--text-tertiary)]" />}
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-[var(--text-primary)]">{u.name}</p>
                                            <p className="text-xs text-[var(--text-tertiary)]">{u.email} • <span className="uppercase">{u.role}</span></p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => handleDeleteUser(u.id)}
                                        className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
                                        title="Remover Usuário"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            ))
                        )}
                        {!isLoading && users.length === 0 && (
                            <p className="text-center text-sm text-[var(--text-tertiary)] py-8">{t('settings.admin.noUsers')}</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

// --- Main Page ---

type TabType = 'general' | 'notifications' | 'appearance' | 'security' | 'offline' | 'admin';

export default function Settings() {
    const { user, signOut } = useAuth();
    const { t } = useTranslation();
    const [activeTab, setActiveTab] = useState<TabType>('general');

    const tabs = [
        { id: 'general', label: t('settings.tabs.general'), icon: User },
        { id: 'notifications', label: t('settings.tabs.notifications'), icon: Bell },
        { id: 'appearance', label: t('settings.tabs.appearance'), icon: Monitor },
        { id: 'security', label: t('settings.tabs.security'), icon: Lock },
        { id: 'offline', label: t('settings.tabs.offline'), icon: Database },
    ];

    if (user?.role === 'ADMIN') {
        tabs.push({ id: 'admin', label: t('settings.tabs.admin'), icon: Users });
    }

    const renderContent = () => {
        switch (activeTab) {
            case 'general': return <GeneralSettings />;
            case 'appearance': return <AppearanceSettings />;
            case 'notifications': return <NotificationSettings />;
            case 'security': return <SecuritySettings />;
            case 'offline': return <OfflineSettings />;
            case 'admin': return user?.role === 'ADMIN' ? <AdminSettings /> : null;
            default: return (
                <div className="py-20 text-center space-y-4">
                    <div className="w-16 h-16 bg-[var(--bg-tertiary)] rounded-full flex items-center justify-center mx-auto">
                        <Shield className="w-8 h-8 text-[var(--text-tertiary)]" />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-[var(--text-primary)]">Em Desenvolvimento</h3>
                        <p className="text-[var(--text-tertiary)] max-w-xs mx-auto">Esta seção de configurações será implementada em breve.</p>
                    </div>
                </div>
            );
        }
    };

    return (
        <DashboardLayout
            user={{ name: user?.name, avatarUrl: user?.avatarUrl, role: user?.role }}
            onLogout={signOut}
        >
            <div className="max-w-5xl mx-auto py-8 px-4">
                <div className="mb-10">
                    <h2 className="text-3xl font-black text-[var(--text-primary)] tracking-tighter">{t('settings.title')}</h2>
                    <p className="text-[var(--text-secondary)] font-medium">{t('settings.subtitle')}</p>
                </div>

                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Inner Sidebar */}
                    <aside className="w-full lg:w-64 space-y-1">
                        {tabs.map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id as TabType)}
                                className={`
                                    w-full flex items-center justify-between p-3.5 rounded-2xl transition-all group
                                    ${activeTab === tab.id
                                        ? 'bg-[var(--accent-primary)] text-[var(--accent-text)] shadow-lg shadow-lime-500/10'
                                        : 'hover:bg-[var(--bg-tertiary)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'}
                                `}
                            >
                                <div className="flex items-center gap-3">
                                    <tab.icon className={`w-4 h-4 ${activeTab === tab.id ? 'text-[var(--accent-text)]' : 'text-[var(--text-tertiary)] group-hover:text-[var(--text-primary)]'}`} />
                                    <span className="text-sm font-bold">{tab.label}</span>
                                </div>
                                <ChevronRight className={`w-3.5 h-3.5 opacity-0 group-hover:opacity-40 ${activeTab === tab.id ? 'hidden' : ''}`} />
                            </button>
                        ))}
                    </aside>

                    {/* Content Area */}
                    <main className="flex-1 min-w-0">
                        {renderContent()}
                    </main>
                </div>
            </div>
        </DashboardLayout>
    );
}
