import React, { useState, useEffect, useCallback } from 'react';
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
                            className={`px-4 py-2 rounded-md text-xs font-bold uppercase tracking-wider transition-all ${density === 'comfortable' ? 'bg-white shadow-sm text-[var(--text-primary)]' : 'text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]'}`}
                        >
                            Confortável
                        </button>
                        <button
                            title='Compacto'
                            type='button'
                            onClick={() => applyDensity('compact')}
                            className={`px-4 py-2 rounded-md text-xs font-bold uppercase tracking-wider transition-all ${density === 'compact' ? 'bg-white shadow-sm text-[var(--text-primary)]' : 'text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]'}`}
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
                        <input type="checkbox" title="Ativar sons" className="w-5 h-5 accent-[var(--accent-primary)] cursor-pointer" defaultChecked />
                    </div>

                    <div className="flex items-center justify-between p-4 bg-[var(--bg-secondary)] rounded-xl border border-[var(--border-subtle)]">
                        <div className="flex items-center gap-3">
                            <Monitor className="w-5 h-5 text-[var(--text-tertiary)]" />
                            <div>
                                <p className="text-sm font-bold text-[var(--text-primary)]">Notificações de Desktop</p>
                                <p className="text-[10px] text-[var(--text-tertiary)]">Exibir avisos no navegador mesmo quando o FLASH está em segundo plano.</p>
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

const AdminSettings = () => {
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
        if (!window.confirm('Tem certeza que deseja excluir este usuário? Esta ação é irreversível.')) return;

        try {
            await api.delete(`/users/${userId}`);
            toast.success('Usuário removido com sucesso!');
            loadUsers();
        } catch (error) {
            const err = error as AxiosError<{ error: string }>;
            const message = err.response?.data?.error || 'Erro ao excluir usuário.';
            toast.error(message);
        }
    };

    return (
        <div className="space-y-6 animate-in">
            <div>
                <h3 className="text-lg font-bold text-[var(--text-primary)]">Administrativo</h3>
                <p className="text-sm text-[var(--text-tertiary)]">Gestão de usuários e permissões do sistema.</p>
            </div>

            <div className="bg-[var(--bg-primary)] border border-[var(--border-subtle)] rounded-2xl p-6 space-y-6">

                <div className="pt-6 border-t border-[var(--border-subtle)] space-y-4">
                    <h4 className="text-sm font-bold text-[var(--text-primary)]">Usuários do Sistema</h4>

                    <div className="flex gap-4">
                        <input
                            type="text"
                            placeholder="Buscar por nome ou e-mail..."
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
                                        title='Remover Usuário'
                                        type='button'
                                        onClick={() => handleDeleteUser(u.id)}
                                        className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            ))
                        )}
                        {!isLoading && users.length === 0 && (
                            <p className="text-center text-sm text-[var(--text-tertiary)] py-8">Nenhum usuário encontrado.</p>
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
    const [activeTab, setActiveTab] = useState<TabType>('general');

    const tabs = [
        { id: 'general', label: "Geral", icon: User },
        { id: 'notifications', label: "Notificações", icon: Bell },
        { id: 'appearance', label: "Aparência", icon: Monitor },
        { id: 'security', label: "Segurança", icon: Lock },
        { id: 'offline', label: "Offline", icon: Database },
    ];

    if (user?.role === 'ADMIN') {
        tabs.push({ id: 'admin', label: "Administrativo", icon: Users });
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
                    <h2 className="text-3xl font-black text-[var(--text-primary)] tracking-tighter">Configurações</h2>
                    <p className="text-[var(--text-secondary)] font-medium">Personalize sua experiência e gerencie sua conta.</p>
                </div>

                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Inner Sidebar */}
                    <aside className="w-full lg:w-64 space-y-1">
                        {tabs.map(tab => (
                            <button
                                title={tab.label}
                                type='button'
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
