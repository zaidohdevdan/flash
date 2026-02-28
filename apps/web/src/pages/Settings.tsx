import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AxiosError } from 'axios';
import {
    Sun,
    Moon,
    Monitor,
    Volume2,
    KeyRound,
    Loader2,
    Save,
    Trash2,
    CheckCircle2
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
            if (user) updateUser({ ...user, name: displayName });
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
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Perfil Geral</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">Gerencie suas informações básicas de identificação na plataforma.</p>
            </div>
            <form onSubmit={handleSave} className="bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-white/8 rounded-2xl p-6 space-y-6">
                <div className="flex flex-col gap-1.5">
                    <label htmlFor="display-name" className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Nome de Exibição</label>
                    <input
                        id="display-name"
                        type="text"
                        value={displayName}
                        onChange={e => setDisplayName(e.target.value)}
                        className="p-3 bg-slate-50 dark:bg-slate-950/50 rounded-xl border border-slate-200 dark:border-white/8 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-600 outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 dark:focus:border-indigo-400 transition-all"
                        placeholder="Seu nome"
                        required
                    />
                </div>
                <div className="pt-4 border-t border-slate-100 dark:border-white/5 flex justify-end">
                    <button
                        type="submit"
                        disabled={isSaving}
                        className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold text-sm transition-all active:scale-95 disabled:opacity-50 shadow-lg shadow-indigo-500/20"
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
        if (user?.id) return (localStorage.getItem(`settings_${user.id}_theme`) as Theme) || 'system';
        return (localStorage.getItem('theme') as Theme) || 'system';
    });
    const [density, setDensity] = useState<Density>(() => {
        if (user?.id) return (localStorage.getItem(`settings_${user.id}_density`) as Density) || 'comfortable';
        return (localStorage.getItem('density') as Density) || 'comfortable';
    });

    const applyTheme = (newTheme: Theme) => {
        setTheme(newTheme);
        localStorage.setItem('theme', newTheme);
        if (user?.id) localStorage.setItem(`settings_${user.id}_theme`, newTheme);
        if (newTheme === 'dark') document.documentElement.classList.add('dark');
        else if (newTheme === 'light') document.documentElement.classList.remove('dark');
        else if (window.matchMedia('(prefers-color-scheme: dark)').matches) document.documentElement.classList.add('dark');
        else document.documentElement.classList.remove('dark');
    };

    const applyDensity = (newDensity: Density) => {
        setDensity(newDensity);
        localStorage.setItem('density', newDensity);
        if (user?.id) localStorage.setItem(`settings_${user.id}_density`, newDensity);
        document.documentElement.setAttribute('data-density', newDensity);
    };

    const themes: { id: Theme; label: string; icon: typeof Sun; preview: React.ReactNode }[] = [
        {
            id: 'light', label: 'Claro', icon: Sun,
            preview: (
                <div className="w-full h-14 rounded-lg bg-slate-100 border border-slate-200 overflow-hidden flex flex-col pointer-events-none">
                    <div className="h-3 bg-white border-b border-slate-100 flex items-center px-2 gap-1">
                        <div className="w-3 h-1.5 rounded bg-indigo-400/80" />
                        <div className="w-5 h-1.5 rounded bg-slate-200" />
                        <div className="w-4 h-1.5 rounded bg-slate-200" />
                    </div>
                    <div className="flex flex-1 gap-1.5 p-1.5">
                        <div className="w-5 bg-white border border-slate-100 rounded" />
                        <div className="flex-1 flex flex-col gap-1">
                            <div className="h-2 bg-slate-200 rounded w-3/4" />
                            <div className="h-2 bg-slate-100 rounded w-1/2" />
                            <div className="h-2 bg-indigo-100 rounded w-2/3" />
                        </div>
                    </div>
                </div>
            ),
        },
        {
            id: 'dark', label: 'Escuro', icon: Moon,
            preview: (
                <div className="w-full h-14 rounded-lg bg-[#020617] border border-white/10 overflow-hidden flex flex-col pointer-events-none">
                    <div className="h-3 bg-[#0f172a] border-b border-white/5 flex items-center px-2 gap-1">
                        <div className="w-3 h-1.5 rounded bg-indigo-500/80" />
                        <div className="w-5 h-1.5 rounded bg-white/10" />
                        <div className="w-4 h-1.5 rounded bg-white/10" />
                    </div>
                    <div className="flex flex-1 gap-1.5 p-1.5">
                        <div className="w-5 bg-[#0f172a] border border-white/5 rounded" />
                        <div className="flex-1 flex flex-col gap-1">
                            <div className="h-2 bg-white/15 rounded w-3/4" />
                            <div className="h-2 bg-white/8 rounded w-1/2" />
                            <div className="h-2 bg-indigo-500/25 rounded w-2/3" />
                        </div>
                    </div>
                </div>
            ),
        },
        {
            id: 'system', label: 'Automático', icon: Monitor,
            preview: (
                <div className="w-full h-14 rounded-lg overflow-hidden flex border border-slate-200 pointer-events-none">
                    <div className="w-1/2 bg-slate-100 flex flex-col">
                        <div className="h-3 bg-white border-b border-slate-100 flex items-center px-1">
                            <div className="w-3 h-1.5 rounded bg-indigo-400/70" />
                        </div>
                        <div className="flex-1 p-1 flex flex-col gap-0.5">
                            <div className="h-1.5 bg-slate-200 rounded" />
                            <div className="h-1.5 bg-slate-100 rounded w-3/4" />
                        </div>
                    </div>
                    <div className="w-1/2 bg-[#020617] flex flex-col">
                        <div className="h-3 bg-[#0f172a] border-b border-white/5 flex items-center px-1">
                            <div className="w-3 h-1.5 rounded bg-indigo-500/80" />
                        </div>
                        <div className="flex-1 p-1 flex flex-col gap-0.5">
                            <div className="h-1.5 bg-white/15 rounded" />
                            <div className="h-1.5 bg-white/8 rounded w-3/4" />
                        </div>
                    </div>
                </div>
            ),
        },
    ];

    return (
        <div className="space-y-6 animate-in">
            <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Aparência da Interface</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">Personalize como o FLASH aparece no seu dispositivo.</p>
            </div>

            <div className="bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-white/8 rounded-2xl p-6 space-y-6">
                <div className="space-y-3">
                    <label className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Tema do Sistema</label>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        {themes.map(({ id, label, icon: Icon, preview }) => {
                            const isSelected = theme === id;
                            return (
                                <button
                                    key={id}
                                    type="button"
                                    title={label}
                                    onClick={() => applyTheme(id)}
                                    className={`relative flex flex-col gap-2.5 p-3 rounded-2xl border-2 transition-all text-left
                                        ${isSelected
                                            ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-500/10 shadow-md shadow-indigo-500/10'
                                            : 'border-slate-200 dark:border-white/8 hover:border-indigo-300 dark:hover:border-indigo-500/40 bg-slate-50 dark:bg-slate-800/50'}`}
                                >
                                    {preview}
                                    <div className="flex items-center gap-2">
                                        <Icon className={`w-3.5 h-3.5 flex-shrink-0 ${isSelected ? 'text-indigo-500' : 'text-slate-400 dark:text-slate-500'}`} />
                                        <span className={`text-xs font-bold ${isSelected ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-500 dark:text-slate-400'}`}>
                                            {label}
                                        </span>
                                    </div>
                                    {isSelected && (
                                        <div className="absolute top-2 right-2 w-4 h-4 bg-indigo-500 rounded-full flex items-center justify-center">
                                            <CheckCircle2 className="w-3 h-3 text-white" />
                                        </div>
                                    )}
                                </button>
                            );
                        })}
                    </div>
                </div>

                <div className="pt-4 border-t border-slate-100 dark:border-white/5 space-y-3">
                    <label className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Densidade da Interface</label>
                    <div className="inline-flex bg-slate-100 dark:bg-slate-950/30 p-1 rounded-xl gap-1">
                        {(['comfortable', 'compact'] as Density[]).map(d => (
                            <button
                                key={d}
                                type="button"
                                onClick={() => applyDensity(d)}
                                className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${density === d
                                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm ring-1 ring-slate-200 dark:ring-white/10'
                                    : 'text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
                            >
                                {d === 'comfortable' ? 'Confortável' : 'Compacto'}
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

const NotificationSettings = () => {
    const { notificationsEnabled, setNotificationsEnabled, desktopNotificationsEnabled, setDesktopNotificationsEnabled } = useAuth();

    return (
        <div className="space-y-6 animate-in">
            <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Notificações e Alertas</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">Gerencie como e quando você deseja receber alertas do sistema.</p>
            </div>

            <div className="bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-white/8 rounded-2xl p-6 space-y-4">
                {[
                    { icon: Volume2, label: 'Efeitos Sonoros', desc: 'Reproduzir sons ao receber novas mensagens ou atualizações.', checked: notificationsEnabled, onChange: setNotificationsEnabled },
                    { icon: Monitor, label: 'Notificações de Desktop', desc: 'Exibir avisos no navegador mesmo quando o FLASH está em segundo plano.', checked: desktopNotificationsEnabled, onChange: setDesktopNotificationsEnabled },
                ].map(({ icon: Icon, label, desc, checked, onChange }) => (
                    <div key={label} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-100 dark:border-white/5">
                        <div className="flex items-center gap-3">
                            <Icon className="w-5 h-5 text-slate-400 dark:text-slate-500" />
                            <div>
                                <p className="text-sm font-bold text-slate-800 dark:text-slate-200">{label}</p>
                                <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">{desc}</p>
                            </div>
                        </div>
                        {/* iOS-style toggle */}
                        <label className="relative flex-shrink-0 w-11 h-6 cursor-pointer group">
                            <span className="sr-only">{label}</span>
                            <input
                                type="checkbox"
                                className="sr-only"
                                checked={checked}
                                title={`${checked ? 'Desativar' : 'Ativar'} ${label}`}
                                onChange={() => onChange(!checked)}
                            />
                            <div
                                className={`w-11 h-6 rounded-full transition-colors duration-200 ${checked ? 'bg-indigo-500 shadow-lg shadow-indigo-500/20' : 'bg-slate-200 dark:bg-slate-700 shadow-inner'}`}
                            >
                                <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-md transition-transform duration-200 flex items-center justify-center ${checked ? 'translate-x-5' : 'translate-x-0'}`} />
                            </div>
                        </label>
                    </div>
                ))}
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
        if (newPassword !== confirmPassword) return void toast.error('As senhas não coincidem.');
        setIsLoading(true);
        try {
            await api.post('/profile/change-password', { currentPassword, newPassword });
            toast.success('Senha alterada com sucesso!');
            setCurrentPassword(''); setNewPassword(''); setConfirmPassword('');
        } catch (error) {
            const err = error as AxiosError<{ error: string }>;
            toast.error(err.response?.data?.error || 'Ocorreu um erro ao alterar a senha.');
        } finally { setIsLoading(false); }
    };

    const inputCls = "w-full p-3 bg-slate-50 dark:bg-slate-950/50 rounded-xl border border-slate-200 dark:border-white/8 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-600 outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 dark:focus:border-indigo-400 transition-all";
    const labelCls = "text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1";

    return (
        <div className="space-y-6 animate-in">
            <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Segurança</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">Gerencie suas credenciais e mantenha sua conta protegida.</p>
            </div>
            <form onSubmit={handlePasswordChange} className="bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-white/8 rounded-2xl p-6 space-y-6">
                <div className="space-y-4">
                    <label className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Alterar Senha</label>
                    <div className="space-y-4">
                        <div className="space-y-1.5">
                            <label htmlFor="current-password" className={labelCls}>Senha Atual</label>
                            <input id="current-password" type="password" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} className={inputCls} placeholder="••••••••" required />
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <label htmlFor="new-password" className={labelCls}>Nova Senha</label>
                                <input id="new-password" type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} className={inputCls} placeholder="••••••••" required />
                            </div>
                            <div className="space-y-1.5">
                                <label htmlFor="confirm-password" className={labelCls}>Confirmar Nova Senha</label>
                                <input id="confirm-password" type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} className={inputCls} placeholder="••••••••" required />
                            </div>
                        </div>
                    </div>
                </div>
                <div className="pt-4 border-t border-slate-100 dark:border-white/5 flex justify-end">
                    <button type="submit" disabled={isLoading}
                        className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold text-sm transition-all active:scale-95 disabled:opacity-50 shadow-lg shadow-indigo-500/20">
                        {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <KeyRound className="w-4 h-4" />}
                        Atualizar Senha
                    </button>
                </div>
            </form>
        </div>
    );
};

const OfflineSettings = () => {
    const [stats, setStats] = useState({ pendingReports: 0, chatMessages: 0, notifications: 0 });
    const [isLoading, setIsLoading] = useState(false);

    const loadStats = async () => {
        setStats({
            pendingReports: await db.pendingReports.count(),
            chatMessages: await db.chatMessages.count(),
            notifications: await db.notifications.count(),
        });
    };

    useEffect(() => { loadStats(); }, []);

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
        } finally { setIsLoading(false); }
    };

    return (
        <div className="space-y-6 animate-in">
            <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Sincronização e Offline</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">Gerencie o armazenamento local e a persistência de dados no dispositivo.</p>
            </div>
            <div className="bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-white/8 rounded-2xl p-6 space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {[
                        { label: 'Mensagens', value: stats.chatMessages },
                        { label: 'Relatórios', value: stats.pendingReports },
                        { label: 'Alertas', value: stats.notifications },
                    ].map(({ label, value }) => (
                        <div key={label} className="p-4 bg-slate-50 dark:bg-slate-950/40 rounded-xl border border-slate-100 dark:border-white/5 flex flex-col items-center gap-2">
                            <span className="text-3xl font-black text-slate-900 dark:text-white">{value}</span>
                            <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider text-center">{label}</span>
                        </div>
                    ))}
                </div>
                <div className="pt-4 border-t border-slate-100 dark:border-white/5">
                    <div className="flex items-center justify-between">
                        <div>
                            <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">Limpar Cache Local</h4>
                            <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">Remove todas as mensagens e relatórios armazenados neste dispositivo.</p>
                        </div>
                        <button onClick={handleClearCache} disabled={isLoading}
                            className="flex items-center gap-2 px-4 py-2 bg-red-50 dark:bg-red-500/10 text-red-500 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-500/20 rounded-xl text-xs font-bold uppercase tracking-wider transition-colors border border-red-100 dark:border-red-500/20 disabled:opacity-50">
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
    const navigate = useNavigate();

    return (
        <DashboardLayout
            user={{ name: user?.name, avatarUrl: user?.avatarUrl, role: user?.role }}
            onLogout={signOut}
            onProfileClick={() => navigate('/profile')}
        >
            <div className="w-full animate-in fade-in duration-500 pt-4">
                <div className="mb-8">
                    <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter">Configurações</h2>
                    <p className="text-slate-500 dark:text-slate-400 font-medium mt-1">Personalize sua experiência e gerencie sua conta localmente.</p>
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                    {/* Column 1 */}
                    <div className="space-y-8">
                        <section id="general"><GeneralSettings /></section>
                        <section id="appearance"><AppearanceSettings /></section>
                    </div>

                    {/* Column 2 */}
                    <div className="space-y-8">
                        <section id="notifications"><NotificationSettings /></section>
                        <section id="security"><SecuritySettings /></section>
                        <section id="offline"><OfflineSettings /></section>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
