import React, { useState, useEffect } from 'react';
import { AxiosError } from 'axios';
import {
    Sun,
    Moon,
    Monitor,
    Volume2,
    KeyRound,
    Loader2,
    Save,
    Trash2
} from 'lucide-react';
import { DashboardLayout } from '../layouts/DashboardLayout';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../services/api';
import { db } from '../services/db';
import toast from 'react-hot-toast';

type Theme = 'light' | 'dark' | 'system';
type Density = 'comfortable' | 'compact';

const GeneralSettings = () => {
    const { user, updateUser } = useAuth();
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

            toast.success('Perfil atualizado com sucesso!');
        } catch (error) {
            console.error(error);
            toast.error('Ocorreu um erro ao atualizar o perfil.');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="space-y-6 animate-in">
            <div>
                <h3 className="text-lg font-bold text-[var(--text-primary)]">Perfil Geral</h3>
                <p className="text-sm text-[var(--text-tertiary)]">Gerencie suas informações básicas de identificação na plataforma.</p>
            </div>
            <form onSubmit={handleSave} className="bg-[var(--bg-primary)] border border-[var(--border-subtle)] rounded-2xl p-6 space-y-6">
                <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-[var(--text-tertiary)] uppercase tracking-wider">Nome de Exibição</label>
                    <input
                        type="text"
                        value={displayName}
                        onChange={e => setDisplayName(e.target.value)}
                        className="p-3 bg-[var(--bg-secondary)] rounded-xl border border-[var(--border-subtle)] text-[var(--text-primary)] outline-none focus:ring-1 focus:ring-[var(--accent-primary)]"
                        placeholder="Seu nome"
                        required
                    />
                </div>

                <div className="pt-6 border-t border-[var(--border-subtle)] flex justify-end">
                    <button
                        type="submit"
                        disabled={isSaving}
                        className="flex items-center gap-2 px-6 py-2.5 bg-[var(--accent-primary)] text-[var(--accent-text)] rounded-xl font-bold text-sm hover:brightness-110 active:scale-95 transition-all disabled:opacity-50"
                    >
                        {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                        {isSaving ? 'Salvando...' : 'Salvar Alterações'}
                    </button>
                </div>
            </form>
        </div>
    );
};

const AppearanceSettings = () => {
    const { user } = useAuth();
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
                <h3 className="text-lg font-bold text-[var(--text-primary)]">Aparência da Interface</h3>
                <p className="text-sm text-[var(--text-tertiary)]">Personalize como o FLASH aparece no seu dispositivo.</p>
            </div>

            <div className="bg-[var(--bg-primary)] border border-[var(--border-subtle)] rounded-2xl p-6 space-y-6">
                <div className="space-y-4">
                    <label className="text-xs font-bold text-[var(--text-tertiary)] uppercase tracking-wider">Tema do Sistema</label>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        {[
                            { id: 'light', label: "Claro", icon: Sun },
                            { id: 'dark', label: "Escuro", icon: Moon },
                            { id: 'system', label: "Sistema", icon: Monitor },
                        ].map((tItem) => (
                            <button
                                title={tItem.label}
                                type='button'
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
                    <label className="text-xs font-bold text-[var(--text-tertiary)] uppercase tracking-wider">Densidade da Interface</label>
                    <div className="flex bg-[var(--bg-tertiary)] p-1 rounded-lg w-fit">
                        <button
                            title='Confortável'
                            type='button'
                            onClick={() => applyDensity('comfortable')}
                            className={`px-4 py-2 rounded-md text-xs font-bold uppercase tracking-wider transition-all border ${density === 'comfortable' ? 'bg-[var(--bg-primary)] border-[var(--border-medium)] shadow-sm text-[var(--text-primary)]' : 'border-transparent text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]'}`}
                        >
                            Confortável
                        </button>
                        <button
                            title='Compacto'
                            type='button'
                            onClick={() => applyDensity('compact')}
                            className={`px-4 py-2 rounded-md text-xs font-bold uppercase tracking-wider transition-all border ${density === 'compact' ? 'bg-[var(--bg-primary)] border-[var(--border-medium)] shadow-sm text-[var(--text-primary)]' : 'border-transparent text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]'}`}
                        >
                            Compacto
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

const NotificationSettings = () => {
    const {
        notificationsEnabled,
        setNotificationsEnabled,
        desktopNotificationsEnabled,
        setDesktopNotificationsEnabled
    } = useAuth();

    return (
        <div className="space-y-6 animate-in">
            <div>
                <h3 className="text-lg font-bold text-[var(--text-primary)]">Notificações e Alertas</h3>
                <p className="text-sm text-[var(--text-tertiary)]">Gerencie como e quando você deseja receber alertas do sistema.</p>
            </div>

            <div className="bg-[var(--bg-primary)] border border-[var(--border-subtle)] rounded-2xl p-6 space-y-6">
                <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-[var(--bg-secondary)] rounded-xl border border-[var(--border-subtle)]">
                        <div className="flex items-center gap-3">
                            <Volume2 className="w-5 h-5 text-[var(--text-tertiary)]" />
                            <div>
                                <p className="text-sm font-bold text-[var(--text-primary)]">Efeitos Sonoros</p>
                                <p className="text-[10px] text-[var(--text-tertiary)]">Reproduzir sons ao receber novas mensagens ou atualizações.</p>
                            </div>
                        </div>
                        <input
                            type="checkbox"
                            title="Ativar sons"
                            className="w-5 h-5 accent-[var(--accent-primary)] cursor-pointer"
                            checked={notificationsEnabled}
                            onChange={(e) => setNotificationsEnabled(e.target.checked)}
                        />
                    </div>

                    <div className="flex items-center justify-between p-4 bg-[var(--bg-secondary)] rounded-xl border border-[var(--border-subtle)]">
                        <div className="flex items-center gap-3">
                            <Monitor className="w-5 h-5 text-[var(--text-tertiary)]" />
                            <div>
                                <p className="text-sm font-bold text-[var(--text-primary)]">Notificações de Desktop</p>
                                <p className="text-[10px] text-[var(--text-tertiary)]">Exibir avisos no navegador mesmo quando o FLASH está em segundo plano.</p>
                            </div>
                        </div>
                        <input
                            type="checkbox"
                            title="Ativar notificações de desktop"
                            className="w-5 h-5 accent-[var(--accent-primary)] cursor-pointer"
                            checked={desktopNotificationsEnabled}
                            onChange={(e) => setDesktopNotificationsEnabled(e.target.checked)}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

const SecuritySettings = () => {
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handlePasswordChange = async (e: React.FormEvent) => {
        e.preventDefault();
        if (newPassword !== confirmPassword) {
            return toast.error('As senhas não coincidem.');
        }

        setIsLoading(true);
        try {
            await api.post('/profile/change-password', { currentPassword, newPassword });
            toast.success('Senha alterada com sucesso!');
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
        } catch (error) {
            const err = error as AxiosError<{ error: string }>;
            const message = err.response?.data?.error || 'Ocorreu um erro ao alterar a senha.';
            toast.error(message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="space-y-6 animate-in">
            <div>
                <h3 className="text-lg font-bold text-[var(--text-primary)]">Segurança</h3>
                <p className="text-sm text-[var(--text-tertiary)]">Gerencie suas credenciais e mantenha sua conta protegida.</p>
            </div>

            <form onSubmit={handlePasswordChange} className="bg-[var(--bg-primary)] border border-[var(--border-subtle)] rounded-2xl p-6 space-y-6">
                <div className="space-y-4">
                    <label className="text-xs font-bold text-[var(--text-tertiary)] uppercase tracking-wider">Alterar Senha</label>
                    <div className="space-y-4">
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-[var(--text-tertiary)] uppercase tracking-widest ml-1">Senha Atual</label>
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
                                <label className="text-[10px] font-black text-[var(--text-tertiary)] uppercase tracking-widest ml-1">Nova Senha</label>
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
                                <label className="text-[10px] font-black text-[var(--text-tertiary)] uppercase tracking-widest ml-1">Confirmar Nova Senha</label>
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
                        Atualizar Senha
                    </button>
                </div>
            </form>
        </div>
    );
};

const OfflineSettings = () => {
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
        if (!window.confirm('Tem certeza que deseja limpar todos os dados locais? Esta ação não pode ser desfeita.')) return;

        setIsLoading(true);
        try {
            await db.chatMessages.clear();
            await db.notifications.clear();
            await db.pendingReports.where('status').equals('failed').delete();
            await db.pendingReports.clear();

            toast.success('Dados locais limpos com sucesso!');
            loadStats();
        } catch (error) {
            console.error(error);
            toast.error('Ocorreu um erro ao limpar os dados locais.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="space-y-6 animate-in">
            <div>
                <h3 className="text-lg font-bold text-[var(--text-primary)]">Sincronização e Offline</h3>
                <p className="text-sm text-[var(--text-tertiary)]">Gerencie o armazenamento local e a persistência de dados no dispositivo.</p>
            </div>

            <div className="bg-[var(--bg-primary)] border border-[var(--border-subtle)] rounded-2xl p-6 space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="p-4 bg-[var(--bg-secondary)] rounded-xl border border-[var(--border-subtle)] flex flex-col items-center gap-2">
                        <span className="text-3xl font-black text-[var(--text-primary)]">{stats.chatMessages}</span>
                        <span className="text-xs font-bold text-[var(--text-tertiary)] uppercase tracking-wider text-center">Mensagens</span>
                    </div>
                    <div className="p-4 bg-[var(--bg-secondary)] rounded-xl border border-[var(--border-subtle)] flex flex-col items-center gap-2">
                        <span className="text-3xl font-black text-[var(--text-primary)]">{stats.pendingReports}</span>
                        <span className="text-xs font-bold text-[var(--text-tertiary)] uppercase tracking-wider text-center">Relatórios</span>
                    </div>
                    <div className="p-4 bg-[var(--bg-secondary)] rounded-xl border border-[var(--border-subtle)] flex flex-col items-center gap-2">
                        <span className="text-3xl font-black text-[var(--text-primary)]">{stats.notifications}</span>
                        <span className="text-xs font-bold text-[var(--text-tertiary)] uppercase tracking-wider text-center">Alertas</span>
                    </div>
                </div>

                <div className="pt-6 border-t border-[var(--border-subtle)] space-y-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <h4 className="text-sm font-bold text-[var(--text-primary)]">Limpar Cache Local</h4>
                            <p className="text-[10px] text-[var(--text-tertiary)]">Remove todas as mensagens e relatórios armazenados neste dispositivo.</p>
                        </div>
                        <button
                            onClick={handleClearCache}
                            disabled={isLoading}
                            className="flex items-center gap-2 px-4 py-2 bg-red-500/10 text-red-500 hover:bg-red-500/20 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors disabled:opacity-50"
                        >
                            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                            Limpar Tudo
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};



// --- Main Page ---

export default function Settings() {
    const { user, signOut } = useAuth();

    return (
        <DashboardLayout
            user={{ name: user?.name, avatarUrl: user?.avatarUrl, role: user?.role }}
            onLogout={signOut}
        >
            <div className="w-full animate-in fade-in duration-500 pt-4">
                <div className="mb-8">
                    <h2 className="text-3xl font-black text-[var(--text-primary)] tracking-tighter">Configurações</h2>
                    <p className="text-[var(--text-secondary)] font-medium mt-1">Personalize sua experiência e gerencie sua conta localmente.</p>
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                    {/* Column 1 */}
                    <div className="space-y-8">
                        <section id="general">
                            <GeneralSettings />
                        </section>
                        <section id="appearance">
                            <AppearanceSettings />
                        </section>
                    </div>

                    {/* Column 2 */}
                    <div className="space-y-8">
                        <section id="notifications">
                            <NotificationSettings />
                        </section>
                        <section id="security">
                            <SecuritySettings />
                        </section>
                        <section id="offline">
                            <OfflineSettings />
                        </section>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
