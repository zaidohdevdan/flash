import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../services/api';
import { toast } from 'react-hot-toast';
import { useDashboardSocket } from '../hooks/useDashboardSocket';
import { db } from '../services/db';
import { useLiveQuery } from 'dexie-react-hooks';
import { Users, UserPlus, Filter, Mail, Trash2, Search, Archive, AlertTriangle, FolderArchive, CheckCircle, Download, UploadCloud, Shield, Edit2, Eye } from 'lucide-react';
import {
    Button,
    Input,
    Card,
    Badge,
    Modal
} from '../components/ui';
import { DashboardLayout } from '../layouts/DashboardLayout';
import { ProfileSettingsModal } from '../components/domain/modals/ProfileSettingsModal';
import { ReportCard } from '../components/domain/ReportCard';
import type { Report } from '../types';

interface Supervisor {
    id: string;
    name: string;
}

interface Department {
    id: string;
    name: string;
}

interface UserSummary {
    id: string;
    name: string;
    email: string;
    role: string;
    avatarUrl?: string | null;
    supervisor?: string;
    supervisorId?: string;
    departmentId?: string;
    departmentName?: string;
}

interface ContactMessage {
    id: string;
    name: string;
    email: string;
    company?: string;
    message: string;
    read: boolean;
    createdAt: string;
}

export function AdminDashboard() {
    const {
        user,
        signOut,
        updateUser,
        notificationsEnabled,
        setNotificationsEnabled,
        desktopNotificationsEnabled,
        setDesktopNotificationsEnabled
    } = useAuth();
    const [view, setView] = useState<'list' | 'create' | 'edit' | 'departments' | 'contacts' | 'delete_report' | 'archived'>('list');
    const [users, setUsers] = useState<UserSummary[]>([]);
    const [supervisors, setSupervisors] = useState<Supervisor[]>([]);
    const [departments, setDepartments] = useState<Department[]>([]);
    // Contact Messages State
    const [contacts, setContacts] = useState<ContactMessage[]>([]);
    const [contactSearch, setContactSearch] = useState('');
    const [contactFilter, setContactFilter] = useState<'all' | 'read' | 'unread'>('all');
    const [contactPage, setContactPage] = useState(1);
    const [totalContactPages, setTotalContactPages] = useState(1);
    const [isDeletingContact, setIsDeletingContact] = useState<string | null>(null);
    const [editingUser, setEditingUser] = useState<UserSummary | null>(null);

    // Filters
    const [searchQuery, setSearchQuery] = useState('');
    const [roleFilter, setRoleFilter] = useState('');

    // Form State
    const hasShownSummaryRef = useRef(false);
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState<'PROFESSIONAL' | 'SUPERVISOR' | 'MANAGER'>('PROFESSIONAL');
    const [supervisorId, setSupervisorId] = useState('');
    const [departmentId, setDepartmentId] = useState('');
    const [newDepartmentName, setNewDepartmentName] = useState('');
    const [newSupervisorName, setNewSupervisorName] = useState('');
    const [newSupervisorEmail, setNewSupervisorEmail] = useState('');

    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    // Protocol Deletion State
    const [protocolToDelete, setProtocolToDelete] = useState('');
    const [isDeletingProtocol, setIsDeletingProtocol] = useState(false);
    const [reportToDelete, setReportToDelete] = useState<Report | null>(null);

    // Archived Reports State
    const [archivedReports, setArchivedReports] = useState<Report[]>([]);
    const [isLoadingArchived, setIsLoadingArchived] = useState(false);
    const [archivedReportSelected, setArchivedReportSelected] = useState<Report | null>(null);
    const [isRestoring, setIsRestoring] = useState(false);
    const [isHardDeleting, setIsHardDeleting] = useState(false);
    const [isExporting, setIsExporting] = useState(false);
    const [isImporting, setIsImporting] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Profile Management State
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [profilePhrase, setProfilePhrase] = useState(user?.statusPhrase || '');
    const [profileAvatar, setProfileAvatar] = useState<File | null>(null);
    const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);

    // Dexie Notifications
    const notifications = useLiveQuery(() => db.notifications.orderBy('createdAt').reverse().toArray()) || [];

    const socketUser = React.useMemo(() => user ? {
        id: user.id || '',
        name: user.name || '',
        role: user.role || ''
    } : null, [user]);

    const {
        playNotificationSound
    } = useDashboardSocket({
        user: socketUser,
        notificationsEnabled,
        onNotification: (data) => {
            toast(`Mensagem: ${data.text}`, {
                icon: '💬',
                duration: 5000,
            });
            playNotificationSound();
        }
    });

    // Hidden input for backup file selection
    const RestorationInput = () => (
        <input
            type="file"
            ref={fileInputRef}
            onChange={handleUploadBackup}
            accept=".json"
            title="Importar Backup JSON"
            placeholder="Selecionar arquivo de backup"
            className="hidden"
        />
    );

    const fetchNotifications = useCallback(async () => {
        if (hasShownSummaryRef.current) return;
        hasShownSummaryRef.current = true;

        try {
            const res = await api.get('/notifications');
            const remoteNotifications = res.data;
            let unreadCount = 0;

            // Upsert remote notifications into Dexie
            await db.transaction('rw', db.notifications, async () => {
                for (const notif of remoteNotifications) {
                    if (!notif.read) unreadCount++;
                    await db.notifications.put({
                        id: String(notif.id),
                        title: notif.title,
                        message: notif.message,
                        type: notif.type || 'system',
                        read: !!notif.read,
                        createdAt: notif.createdAt,
                        link: notif.link || undefined
                    });
                }
            });

            if (unreadCount > 0) {
                toast(`Você tem ${unreadCount} ${unreadCount === 1 ? 'notificação não lida' : 'notificações não lidas'}`, {
                    icon: '🔔',
                    duration: 4000
                });
            }

            // Also check for unread chat messages
            const chatRes = await api.get('/chat/unread-count');
            const unreadChatCount = chatRes.data.count;

            if (unreadChatCount > 0) {
                toast(`Você tem ${unreadChatCount} ${unreadChatCount === 1 ? 'mensagem não lida' : 'mensagens não lidas'} no chat`, {
                    icon: '💬',
                    duration: 5000,
                    style: {
                        borderRadius: '1.5rem',
                        background: '#333',
                        color: '#fff',
                        fontSize: '12px',
                        fontWeight: 'bold'
                    }
                });
            }
        } catch {
            console.error('Erro ao buscar notificações');
        }
    }, []);

    const handleMarkAsRead = async (id: string) => {
        try {
            await api.patch(`/notifications/${id}/read`);
            await db.notifications.update(id, { read: true });
        } catch {
            await db.notifications.update(id, { read: true });
            toast.error('Erro ao sincronizar com servidor');
        }
    };

    const handleMarkAllAsRead = async () => {
        try {
            await api.post('/notifications/read-all');
            const allLocal = await db.notifications.toArray();
            await db.transaction('rw', db.notifications, async () => {
                for (const n of allLocal) {
                    await db.notifications.update(n.id, { read: true });
                }
            });
            toast.success('Todas marcadas como lidas');
        } catch {
            toast.error('Erro ao marcar todas');
        }
    };

    const handleDeleteNotification = async (id: string) => {
        try {
            await api.delete(`/notifications/${id}`);
            await db.notifications.delete(id);
            toast.success("Notificação removida");
        } catch (error) {
            console.error('Erro ao deletar notificação:', error);
            await db.notifications.delete(id);
        }
    };

    const fetchUsers = useCallback(async () => {
        try {
            const response = await api.get('/users', {
                params: { search: searchQuery, role: roleFilter }
            });
            setUsers(response.data);
        } catch {
            console.error('Erro ao buscar usuários');
        }
    }, [searchQuery, roleFilter]);

    const fetchSupervisors = useCallback(async () => {
        try {
            const response = await api.get('/supervisors');
            setSupervisors(response.data);
        } catch {
            console.error('Erro ao buscar supervisores');
        }
    }, []);

    const fetchDepartments = useCallback(async () => {
        try {
            const response = await api.get('/departments');
            setDepartments(response.data);
        } catch {
            console.error('Erro ao buscar departamentos');
        }
    }, []);

    const fetchContacts = useCallback(async () => {
        try {
            const params = new URLSearchParams({
                page: contactPage.toString(),
                limit: '10'
            });

            if (contactSearch) {
                params.append('search', contactSearch);
            }

            if (contactFilter !== 'all') {
                params.append('readStatus', contactFilter === 'read' ? 'true' : 'false');
            }

            const response = await api.get(`/admin/contacts?${params.toString()}`);
            setContacts(response.data.data);
            setTotalContactPages(response.data.totalPages);
        } catch {
            console.error('Erro ao buscar contatos');
        }
    }, [contactPage, contactSearch, contactFilter]);

    const fetchArchivedReports = useCallback(async () => {
        setIsLoadingArchived(true);
        try {
            const response = await api.get('/admin/reports/archived');
            setArchivedReports(response.data);
        } catch {
            console.error('Erro ao buscar relatórios arquivados');
            toast.error('Erro ao buscar relatórios arquivados');
        } finally {
            setIsLoadingArchived(false);
        }
    }, []);

    useEffect(() => {
        fetchSupervisors();
        fetchDepartments();
        fetchUsers();
        fetchNotifications();
        fetchContacts();
        if (view === 'archived') {
            fetchArchivedReports();
        }
    }, [fetchUsers, fetchSupervisors, fetchDepartments, fetchNotifications, fetchContacts, view, fetchArchivedReports]);

    async function handleProcessUser(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true);
        let deptId = departmentId;
        let finalSupervisorId = supervisorId;

        try {
            // Cria novo supervisor se especificado (apenas em criação)
            if (view === 'create' && role === 'PROFESSIONAL' && !finalSupervisorId && newSupervisorName.trim() && newSupervisorEmail.trim()) {
                const supRes = await api.post('/register', {
                    name: newSupervisorName,
                    email: newSupervisorEmail,
                    password: 'flash2026',
                    role: 'SUPERVISOR'
                });
                finalSupervisorId = supRes.data.id;
                toast.success(`Supervisor ${newSupervisorName} criado! Senha: flash2026`);
                fetchSupervisors();
            }

            // Validação básica para profissional
            if (role === 'PROFESSIONAL' && !finalSupervisorId) {
                toast.error('Selecione um supervisor ou preencha os dados para criar um novo.');
                setLoading(false);
                return;
            }

            // Cria novo departamento se especificado
            if (role === 'MANAGER' && !deptId && newDepartmentName.trim()) {
                const deptRes = await api.post('/departments', { name: newDepartmentName });
                deptId = deptRes.data.id;
            }

            if (view === 'create') {
                await api.post('/register', {
                    name, email, password, role,
                    supervisorId: role === 'PROFESSIONAL' ? finalSupervisorId : undefined,
                    departmentId: role === 'MANAGER' ? deptId : undefined
                });
            } else if (editingUser) {
                await api.put(`/users/${editingUser.id}`, {
                    name, email, role,
                    password: password || undefined,
                    supervisorId: role === 'PROFESSIONAL' ? finalSupervisorId : null,
                    departmentId: role === 'MANAGER' ? deptId : null
                });
            }

            setSuccess(true);
            setTimeout(() => {
                setSuccess(false);
                setView('list');
                resetForm();
                fetchUsers();
            }, 1500);
        } catch (err: unknown) {
            const error = err as { response?: { data?: { error?: string } } };
            console.error('Erro na operação:', error.response?.data?.error);
            toast.error(error.response?.data?.error || 'Erro ao processar operação.');
        } finally {
            setLoading(false);
        }
    }

    async function handleDeleteUser(userId: string, userName: string) {
        if (userId === user?.id) {
            toast.error('Você não pode remover seu próprio acesso administrativo.');
            return;
        }
        if (!window.confirm(`Tem certeza que deseja remover o usuário ${userName}? Esta ação não pode ser desfeita.`)) {
            return;
        }

        // Optimistic Update: Remove visualmente antes da confirmação do backend para sensação de instantaneidade
        setUsers(prev => prev.filter(u => u.id !== userId));

        try {
            await api.delete(`/users/${userId}`);
            toast.success('Usuário removido com sucesso!');
            // Recarrega dados reais em background para garantir consistência
            fetchUsers();
        } catch (err: unknown) {
            // Reverte em caso de error (opcional, mas boa prática)
            const error = err as { response?: { data?: { error?: string } } };
            console.error('Erro ao deletar:', error.response?.data?.error);
            toast.error('Erro ao deletar usuário. A lista será atualizada.');
            fetchUsers(); // Restaura lista
        }
    }

    function startEdit(u: UserSummary) {
        if (u.id === user?.id) {
            toast.error('Alterações no seu próprio perfil administrativo não são permitidas por segurança.');
            return;
        }
        setEditingUser(u);
        setName(u.name);
        setEmail(u.email);
        setRole(u.role as 'PROFESSIONAL' | 'SUPERVISOR' | 'MANAGER');
        setSupervisorId(u.supervisorId || '');
        setDepartmentId(u.departmentId || '');
        setPassword('');
        setView('edit');
    }

    function resetForm() {
        setName('');
        setEmail('');
        setPassword('');
        setRole('PROFESSIONAL');
        setSupervisorId('');
        setDepartmentId('');
        setNewDepartmentName('');
        setNewSupervisorName('');
        setNewSupervisorEmail('');
        setEditingUser(null);
    }

    async function handleDeleteDepartment(deptId: string, deptName: string) {
        if (!window.confirm(`ATENÇÃO: Você está prestes a excluir o setor "${deptName}".\n\nTodos os processos (reports) atualmente neste setor serão devolvidos para o SUPERVISOR responsável para reanálise.\n\nTem certeza que deseja continuar?`)) {
            return;
        }

        // Optimistic Update
        setDepartments(prev => prev.filter(d => d.id !== deptId));

        try {
            await api.delete(`/departments/${deptId}`);
            toast.success('Departamento excluído e processos reatribuídos.');
            fetchDepartments();
        } catch (err: unknown) {
            console.error('Erro ao deletar departamento:', err);
            toast.error('Erro ao excluir departamento.');
            fetchDepartments();
        }
    }

    const handleMarkContactAsRead = async (id: string) => {
        try {
            await api.patch(`/admin/contacts/${id}/read`);
            fetchContacts();
            toast.success('Mensagem marcada como lida');
        } catch {
            toast.error('Erro ao atualizar mensagem');
        }
    };

    const handleDeleteContact = async (id: string) => {
        if (!window.confirm('Tem certeza que deseja apagar esta mensagem permanentemente?')) return;

        setIsDeletingContact(id);
        try {
            await api.delete(`/admin/contacts/${id}`);
            toast.success('Mensagem apagada com sucesso');
            fetchContacts();
        } catch {
            toast.error('Erro ao apagar mensagem');
        } finally {
            setIsDeletingContact(null);
        }
    };

    const handleUpdateProfile = async () => {
        if (!user) return;
        setIsUpdatingProfile(true);
        try {
            const formData = new FormData();
            formData.append('statusPhrase', profilePhrase);
            if (profileAvatar) {
                formData.append('avatar', profileAvatar);
            }

            const response = await api.patch('/profile', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            updateUser(response.data);
            setIsProfileOpen(false);
            setProfileAvatar(null);
            toast.success('Perfil atualizado com sucesso!');
        } catch (error) {
            console.error('Update profile error:', error);
            toast.error('Erro ao atualizar perfil.');
        } finally {
            setIsUpdatingProfile(false);
        }
    };

    const handleDownloadBackup = async (protocol: string) => {
        try {
            setIsExporting(true);
            const response = await api.get(`/admin/reports/protocol/${protocol}/export`, {
                responseType: 'blob'
            });

            // Create a temporary link to download the JSON blob
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `backup_protocol_${protocol}.json`);
            document.body.appendChild(link);
            link.click();
            link.parentNode?.removeChild(link);

            toast.success('Backup exportado com sucesso!');
        } catch (error: unknown) {
            console.error('Erro ao exportar backup:', error);
            toast.error('Falha ao baixar o backup do processo.');
        } finally {
            setIsExporting(false);
        }
    };

    const handleUploadBackup = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        // Limpa o target value para permitir upar o mesmo arquivo novamente se precisar
        event.target.value = '';

        const formData = new FormData();
        formData.append('file', file);

        try {
            setIsImporting(true);
            await api.post('/admin/reports/import', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            fetchArchivedReports();
            toast.success('Backup importado com sucesso!');
        } catch (error: unknown) {
            console.error('Erro ao importar backup:', error);
            let errorMessage = 'Falha ao importar o arquivo JSON. O arquivo pode estar corrompido ou o protocolo já existir ativamente.';

            if (error && typeof error === 'object' && 'response' in error) {
                const axiosError = error as { response?: { data?: { error?: string } } };
                if (axiosError.response?.data?.error) {
                    errorMessage = axiosError.response.data.error;
                }
            }

            toast.error(errorMessage);
        } finally {
            setIsImporting(false);
        }
    };

    const handleProtocolSearch = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!protocolToDelete || protocolToDelete.length !== 6) {
            toast.error('O protocolo deve ter exatamente 6 caracteres.');
            return;
        }

        setIsDeletingProtocol(true);
        try {
            const response = await api.get(`/admin/reports/protocol/${protocolToDelete}`);
            setReportToDelete(response.data);
        } catch (err: unknown) {
            const error = err as { response?: { data?: { error?: string } } };
            console.error('Erro ao buscar protocolo:', error.response?.data?.error);
            toast.error(error.response?.data?.error || 'Relatório não encontrado ou erro na busca.');
            setReportToDelete(null);
        } finally {
            setIsDeletingProtocol(false);
        }
    };

    const confirmProtocolArchive = async () => {
        if (!protocolToDelete || protocolToDelete.length !== 6 || !reportToDelete) return;

        setIsDeletingProtocol(true);
        try {
            await api.patch(`/admin/reports/protocol/${protocolToDelete}/archive`);
            toast.success('Processo arquivado com sucesso para auditoria.');
            setProtocolToDelete('');
            setReportToDelete(null);
            setView('list'); // Retorna pra lista ou reseta
        } catch (err: unknown) {
            const error = err as { response?: { data?: { error?: string } } };
            console.error('Erro ao arquivar protocolo:', error.response?.data?.error);
            toast.error(error.response?.data?.error || 'Erro ao arquivar o processo.');
        } finally {
            setIsDeletingProtocol(false);
        }
    };

    const confirmRestoreArchived = async () => {
        if (!archivedReportSelected) return;
        const protocol = archivedReportSelected.id.slice(-6).toUpperCase();
        setIsRestoring(true);
        try {
            await api.patch(`/admin/reports/protocol/${protocol}/restore`);
            toast.success(`Protocolo ${protocol} restaurado com sucesso!`);
            setArchivedReportSelected(null);
            fetchArchivedReports();
        } catch {
            toast.error('Erro ao restaurar o processo.');
        } finally {
            setIsRestoring(false);
        }
    };

    const confirmHardDeleteArchived = async () => {
        if (!archivedReportSelected) return;
        const protocol = archivedReportSelected.id.slice(-6).toUpperCase();
        setIsHardDeleting(true);
        try {
            await api.delete(`/admin/reports/protocol/${protocol}`);
            toast.success(`Protocolo ${protocol} excluído permanentemente!`);
            setArchivedReportSelected(null);
            fetchArchivedReports();
        } catch {
            toast.error('Erro ao excluir definitivamente o processo.');
        } finally {
            setIsHardDeleting(false);
        }
    };

    return (
        <DashboardLayout
            user={{ name: user?.name, avatarUrl: user?.avatarUrl, role: user?.role }}
            onLogout={signOut}
            notifications={notifications}
            onMarkAsRead={handleMarkAsRead}
            onMarkAllAsRead={handleMarkAllAsRead}
            onDelete={handleDeleteNotification}
            onProfileClick={() => setIsProfileOpen(true)}
        >
            <div className="flex flex-col lg:flex-row gap-8 animate-in fade-in duration-500 items-start">
                <aside className="w-full lg:w-72 shrink-0 space-y-4 lg:sticky lg:top-0 lg:h-[calc(100vh-8rem)] lg:overflow-y-auto custom-scrollbar">
                    <Card variant="white" className="p-2 space-y-1 shadow-sm">
                        <button
                            title='Gestão de Usuários'
                            type='button'
                            onClick={() => { setView('list'); resetForm(); }}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-xs uppercase tracking-wide transition-all ${view === 'list'
                                ? 'bg-[var(--accent-primary)] text-[var(--accent-text)] shadow-md'
                                : 'text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)]'
                                }`}
                        >
                            <Users className="w-4 h-4" /> Gestão de Usuários
                        </button>
                        <button
                            title='Novo Cadastro'
                            type='button'
                            onClick={() => { setView('create'); resetForm(); }}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-xs uppercase tracking-wide transition-all ${view === 'create'
                                ? 'bg-[var(--accent-primary)] text-[var(--accent-text)] shadow-md'
                                : 'text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)]'
                                }`}
                        >
                            <UserPlus className="w-4 h-4" /> Novo Cadastro
                        </button>
                        <button
                            title='Gestão de Setores'
                            type='button'
                            onClick={() => { setView('departments'); resetForm(); }}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-xs uppercase tracking-wide transition-all ${view === 'departments'
                                ? 'bg-[var(--accent-primary)] text-[var(--accent-text)] shadow-md'
                                : 'text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)]'
                                }`}
                        >
                            <Filter className="w-4 h-4" /> Gestão de Setores
                        </button>

                        <button
                            title='Mensagens de Contato'
                            type='button'
                            onClick={() => { setView('contacts'); resetForm(); }}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-xs uppercase tracking-wide transition-all ${view === 'contacts'
                                ? 'bg-[var(--accent-primary)] text-[var(--accent-text)] shadow-md'
                                : 'text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)]'
                                }`}
                        >
                            <Mail className="w-4 h-4" /> Mensagens
                            {contacts.filter(c => !c.read).length > 0 && (
                                <span className="ml-auto bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full ring-2 ring-[var(--bg-primary)]">
                                    {contacts.filter(c => !c.read).length}
                                </span>
                            )}
                        </button>

                        <button
                            title='Excluir Processo'
                            type='button'
                            onClick={() => { setView('delete_report'); resetForm(); }}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-xs uppercase tracking-wide transition-all ${view === 'delete_report'
                                ? 'bg-red-500 text-white shadow-md'
                                : 'text-red-500 hover:bg-red-50'
                                }`}
                        >
                            <Trash2 className="w-4 h-4" /> Excluir Processo
                        </button>

                        <button
                            title='Arquivos de Auditoria'
                            type='button'
                            onClick={() => { setView('archived'); resetForm(); }}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-xs uppercase tracking-wide transition-all ${view === 'archived'
                                ? 'bg-amber-500 text-white shadow-md'
                                : 'text-amber-600 hover:bg-amber-50'
                                }`}
                        >
                            <FolderArchive className="w-4 h-4" /> Arquivos
                        </button>

                        <div className="pt-4 mt-4 border-t border-[var(--border-subtle)] px-2 pb-2">
                            <div className="bg-emerald-500/10 p-3 rounded-xl border border-emerald-500/20">
                                <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest leading-none mb-1">Status do Sistema</p>
                                <div className="flex items-center gap-2 text-emerald-500 font-bold text-xs uppercase tracking-tight">
                                    <CheckCircle className="w-4 h-4" /> Operacional
                                </div>
                            </div>
                        </div>
                    </Card>
                </aside>

                <section className="flex-1">
                    {view === 'list' ? (
                        <div className="space-y-6 min-h-[calc(100vh-12rem)] flex flex-col">
                            {/* Filter Bar */}
                            <Card variant="white" className="p-3 flex flex-col md:flex-row gap-4 items-center border-[var(--border-subtle)]">
                                <div className="relative flex-1 w-full">
                                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-tertiary)]" />
                                    <input
                                        type="text"
                                        placeholder="Buscar usuários..."
                                        title="Buscar usuários"
                                        value={searchQuery}
                                        onChange={e => setSearchQuery(e.target.value)}
                                        className="w-full pl-10 pr-4 py-3 bg-[var(--bg-tertiary)] border-transparent border rounded-xl focus:bg-[var(--bg-primary)] focus:border-[var(--accent-primary)] outline-none transition-all text-sm font-medium text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)]"
                                    />
                                </div>
                                <div className="flex items-center gap-2 bg-[var(--bg-tertiary)] p-1.5 rounded-xl w-full md:w-auto border border-[var(--border-subtle)]">
                                    <Filter className="w-4 h-4 text-[var(--text-tertiary)] ml-2 hidden md:block" />
                                    <select
                                        value={roleFilter}
                                        onChange={e => setRoleFilter(e.target.value)}
                                        title="Filtrar por papel"
                                        className="bg-transparent border-none outline-none text-xs font-bold text-[var(--text-secondary)] py-2 px-4 cursor-pointer uppercase tracking-wide w-full md:w-auto"
                                    >
                                        <option value="">Todos os Papéis</option>
                                        <option value="ADMIN">Admins</option>
                                        <option value="SUPERVISOR">Supervisores</option>
                                        <option value="MANAGER">Gerentes</option>
                                        <option value="PROFESSIONAL">Profissionais</option>
                                    </select>
                                </div>
                            </Card>

                            {/* Users Table */}
                            <Card variant="white" className="overflow-hidden border-[var(--border-subtle)]">
                                <div className="p-6 border-b border-[var(--border-subtle)] flex justify-between items-center bg-[var(--bg-primary)]">
                                    <div>
                                        <h2 className="text-lg font-bold text-[var(--text-primary)] uppercase tracking-tight">Equipe FLASH</h2>
                                        <p className="text-xs text-[var(--text-tertiary)] font-medium mt-1">Gerenciamento de acessos e permissões</p>
                                    </div>
                                    <Badge status="SENT" label={`${users.length} ATIVOS`} className="bg-[var(--bg-tertiary)] text-[var(--text-secondary)] border-[var(--border-medium)]" />
                                </div>

                                <div className="overflow-x-auto">
                                    <table className="w-full text-left border-collapse">
                                        <thead>
                                            <tr className="bg-[var(--bg-tertiary)] text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-widest border-b border-[var(--border-subtle)]">
                                                <th className="px-6 py-4">Usuário / Identidade</th>
                                                <th className="px-6 py-4">Nível / Papel</th>
                                                <th className="px-6 py-4">Supervisão / Dep</th>
                                                <th className="px-6 py-4 text-right">Ações</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-[var(--border-subtle)]">
                                            {users.length === 0 ? (
                                                <tr>
                                                    <td colSpan={4} className="px-6 py-24 text-center text-[var(--text-tertiary)]">
                                                        <Users className="w-12 h-12 mx-auto mb-4 opacity-20" />
                                                        <p className="text-xs font-bold uppercase tracking-widest">Nenhum usuário encontrado</p>
                                                    </td>
                                                </tr>
                                            ) : (
                                                users.map(u => (
                                                    <tr key={u.id} className="hover:bg-[var(--bg-tertiary)]/50 transition-colors group">
                                                        <td className="px-6 py-4">
                                                            <div className="flex items-center gap-3">
                                                                <div className="w-10 h-10 rounded-xl bg-[var(--bg-tertiary)] flex items-center justify-center text-[var(--accent-primary)] font-black text-sm border border-[var(--border-subtle)]">
                                                                    {u.name.charAt(0)}
                                                                </div>
                                                                <div>
                                                                    <p className="font-bold text-[var(--text-primary)] text-sm leading-tight mb-0.5">{u.name}</p>
                                                                    <p className="text-xs text-[var(--text-secondary)]">{u.email}</p>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <Badge
                                                                status={u.role === 'ADMIN' ? 'RESOLVED' : u.role === 'SUPERVISOR' ? 'FORWARDED' : u.role === 'MANAGER' ? 'SENT' : 'IN_REVIEW'}
                                                                label={u.role}
                                                            />
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            {u.supervisor ? (
                                                                <div className="flex items-center gap-2">
                                                                    <Shield className="w-3.5 h-3.5 text-purple-500" />
                                                                    <span className="text-xs font-semibold text-[var(--text-secondary)]">{u.supervisor}</span>
                                                                </div>
                                                            ) : u.departmentName ? (
                                                                <div className="flex items-center gap-2">
                                                                    <Filter className="w-3.5 h-3.5 text-blue-500" />
                                                                    <span className="text-xs font-semibold text-[var(--text-secondary)]">{u.departmentName}</span>
                                                                </div>
                                                            ) : (
                                                                <span className="text-[10px] font-bold text-[var(--text-tertiary)] uppercase">Direto / Global</span>
                                                            )}
                                                        </td>
                                                        <td className="px-6 py-4 text-right">
                                                            {u.id !== user?.id && (
                                                                <div className="flex items-center justify-end gap-1 opacity-60 group-hover:opacity-100 transition-opacity">
                                                                    <Button
                                                                        variant="ghost"
                                                                        size="sm"
                                                                        onClick={() => startEdit(u)}
                                                                    >
                                                                        <Edit2 className="w-4 h-4" />
                                                                    </Button>
                                                                    <Button
                                                                        variant="ghost"
                                                                        size="sm"
                                                                        onClick={() => handleDeleteUser(u.id, u.name)}
                                                                        className="hover:text-red-600 hover:bg-red-50"
                                                                    >
                                                                        <Trash2 className="w-4 h-4" />
                                                                    </Button>
                                                                </div>
                                                            )}
                                                            {u.id === user?.id && (
                                                                <span className="text-[10px] font-bold text-[var(--accent-primary)] uppercase tracking-wider bg-blue-50 px-2 py-1 rounded-md">Você</span>
                                                            )}
                                                        </td>
                                                    </tr>
                                                ))
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </Card>
                        </div>
                    ) : view === 'departments' ? (
                        <div className="animate-in slide-in-from-right-4 duration-500 min-h-[calc(100vh-12rem)] flex flex-col space-y-6">
                            <Card variant="white" className="overflow-hidden border-[var(--border-subtle)]">
                                <div className="p-6 border-b border-[var(--border-subtle)] flex justify-between items-center bg-[var(--bg-primary)]">
                                    <div>
                                        <h2 className="text-lg font-bold text-[var(--text-primary)] uppercase tracking-tight">Setores Operacionais</h2>
                                        <p className="text-xs text-[var(--text-tertiary)] font-medium mt-1">Gestão de Departamentos</p>
                                    </div>
                                    <Button variant="secondary" size="sm" onClick={() => setView('list')}>
                                        Voltar
                                    </Button>
                                </div>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left border-collapse">
                                        <thead>
                                            <tr className="bg-[var(--bg-tertiary)] text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-widest border-b border-[var(--border-subtle)]">
                                                <th className="px-6 py-4">Nome do Setor</th>
                                                <th className="px-6 py-4 text-right w-32">Ações</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-[var(--border-subtle)]">
                                            {departments.length === 0 ? (
                                                <tr>
                                                    <td colSpan={2} className="px-6 py-16 text-center text-[var(--text-tertiary)]">
                                                        <Filter className="w-12 h-12 mx-auto mb-4 opacity-20" />
                                                        <p className="text-xs font-bold uppercase tracking-widest">Nenhum departamento encontrado</p>
                                                    </td>
                                                </tr>
                                            ) : (
                                                departments.map(dept => (
                                                    <tr key={dept.id} className="hover:bg-[var(--bg-tertiary)]/50 transition-colors group">
                                                        <td className="px-6 py-4">
                                                            <div className="flex items-center gap-3">
                                                                <div className="bg-blue-50 p-2 rounded-lg text-blue-600">
                                                                    <Filter className="w-5 h-5" />
                                                                </div>
                                                                <span className="font-semibold text-[var(--text-primary)] text-sm">{dept.name}</span>
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4 text-right">
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => handleDeleteDepartment(dept.id, dept.name)}
                                                                className="hover:text-red-600 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-opacity"
                                                                title="Excluir Setor"
                                                            >
                                                                <Trash2 className="w-4 h-4" />
                                                            </Button>
                                                        </td>
                                                    </tr>
                                                ))
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </Card>
                        </div>
                    ) : view === 'contacts' ? (
                        <div className="animate-in slide-in-from-right-4 duration-500 min-h-[calc(100vh-12rem)] flex flex-col">
                            <Card variant="white" className="overflow-hidden border-[var(--border-subtle)] h-full flex flex-col">
                                <div className="p-6 border-b border-[var(--border-subtle)] bg-[var(--bg-primary)]">
                                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                                        <div>
                                            <h2 className="text-lg font-bold text-[var(--text-primary)] uppercase tracking-tight">Mensagens de Contato</h2>
                                            <p className="text-xs text-[var(--text-tertiary)] font-medium mt-1">Leads e solicitações da Landing Page</p>
                                        </div>
                                    </div>

                                    <div className="flex flex-col sm:flex-row gap-4">
                                        <div className="relative flex-1">
                                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                            <input
                                                type="text"
                                                placeholder="Buscar por nome, e-mail ou empresa..."
                                                value={contactSearch}
                                                onChange={(e) => {
                                                    setContactSearch(e.target.value);
                                                    setContactPage(1);
                                                }}
                                                className="w-full pl-10 pr-4 py-2 bg-[var(--bg-secondary)] border border-[var(--border-strong)] rounded-lg text-sm text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-[var(--text-tertiary)]"
                                            />
                                        </div>
                                        <select
                                            aria-label="Filtrar por Status"
                                            value={contactFilter}
                                            onChange={(e) => {
                                                setContactFilter(e.target.value as 'all' | 'read' | 'unread');
                                                setContactPage(1);
                                            }}
                                            className="px-4 py-2 bg-[var(--bg-secondary)] border border-[var(--border-strong)] rounded-lg text-sm font-medium text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all cursor-pointer"
                                        >
                                            <option value="all">Todas as Mensagens</option>
                                            <option value="unread">Não Lidas</option>
                                            <option value="read">Lidas</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="overflow-x-auto flex-1">
                                    <table className="w-full text-left border-collapse">
                                        <thead>
                                            <tr className="bg-[var(--bg-tertiary)] text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-widest border-b border-[var(--border-subtle)]">
                                                <th className="px-6 py-4">Remetente / Empresa</th>
                                                <th className="px-6 py-4">Mensagem</th>
                                                <th className="px-6 py-4">Data</th>
                                                <th className="px-6 py-4 text-right">Ações</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-[var(--border-subtle)]">
                                            {contacts.length === 0 ? (
                                                <tr>
                                                    <td colSpan={4} className="px-6 py-16 text-center text-[var(--text-tertiary)]">
                                                        <Mail className="w-12 h-12 mx-auto mb-4 opacity-20" />
                                                        <p className="text-xs font-bold uppercase tracking-widest">Nenhuma mensagem recebida</p>
                                                    </td>
                                                </tr>
                                            ) : (
                                                contacts.map(msg => (
                                                    <tr key={msg.id} className={`hover:bg-[var(--bg-tertiary)]/50 transition-colors group ${!msg.read ? 'bg-blue-50/30' : ''}`}>
                                                        <td className="px-6 py-4">
                                                            <div className="flex flex-col">
                                                                <span className="font-bold text-[var(--text-primary)] text-sm">{msg.name}</span>
                                                                <span className="text-xs text-[var(--text-secondary)]">{msg.email}</span>
                                                                {msg.company && (
                                                                    <span className="text-[10px] font-black text-[var(--accent-primary)] uppercase tracking-tighter mt-1">{msg.company}</span>
                                                                )}
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4 max-w-md">
                                                            <p className="text-xs text-[var(--text-secondary)] line-clamp-2 italic">
                                                                "{msg.message}"
                                                            </p>
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <span className="text-[10px] font-bold text-[var(--text-tertiary)]">
                                                                {new Date(msg.createdAt).toLocaleDateString('pt-BR')}
                                                            </span>
                                                        </td>
                                                        <td className="px-6 py-4 text-right">
                                                            <div className="flex items-center justify-end gap-2">
                                                                {!msg.read && (
                                                                    <Button
                                                                        variant="ghost"
                                                                        size="sm"
                                                                        onClick={() => handleMarkContactAsRead(msg.id)}
                                                                        title="Marcar como lida"
                                                                    >
                                                                        <CheckCircle className="w-4 h-4 text-emerald-500" />
                                                                    </Button>
                                                                )}
                                                                <Button
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    onClick={() => {
                                                                        alert(`Detalhes da Mensagem:\n\nDe: ${msg.name}\nE-mail: ${msg.email}\nEmpresa: ${msg.company || 'N/A'}\n\n"${msg.message}"`);
                                                                        if (!msg.read) handleMarkContactAsRead(msg.id);
                                                                    }}
                                                                >
                                                                    <Eye className="w-4 h-4" />
                                                                </Button>
                                                                <Button
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    onClick={() => handleDeleteContact(msg.id)}
                                                                    isLoading={isDeletingContact === msg.id}
                                                                    className="hover:text-red-600 hover:bg-red-50 transition-colors"
                                                                    title="Excluir Mensagem"
                                                                >
                                                                    <Trash2 className="w-4 h-4" />
                                                                </Button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))
                                            )}
                                        </tbody>
                                    </table>
                                </div>

                                {totalContactPages > 1 && (
                                    <div className="p-4 border-t border-[var(--border-subtle)] flex items-center justify-between bg-[var(--bg-primary)]">
                                        <p className="text-xs text-slate-500 font-medium tracking-wide">
                                            Página {contactPage} de {totalContactPages}
                                        </p>
                                        <div className="flex gap-2">
                                            <Button
                                                variant="secondary"
                                                size="sm"
                                                onClick={() => setContactPage(p => Math.max(1, p - 1))}
                                                disabled={contactPage === 1}
                                            >
                                                Anterior
                                            </Button>
                                            <Button
                                                variant="secondary"
                                                size="sm"
                                                onClick={() => setContactPage(p => Math.min(totalContactPages, p + 1))}
                                                disabled={contactPage === totalContactPages}
                                            >
                                                Próxima
                                            </Button>
                                        </div>
                                    </div>
                                )}
                            </Card>
                        </div>
                    ) : (view === 'edit' || view === 'create') && (
                        <div className="animate-in slide-in-from-bottom-5 duration-500 min-h-[calc(100vh-12rem)] flex flex-col">
                            <Card variant="white" className="p-8 border-[var(--border-subtle)]">
                                <div className="flex justify-between items-start mb-8 border-b border-[var(--border-subtle)] pb-6">
                                    <div>
                                        <h2 className="text-2xl font-bold text-[var(--text-primary)] tracking-tight mb-1">{view === 'create' ? 'Novo Cadastro' : 'Editar Membro'}</h2>
                                        <p className="text-xs text-[var(--text-secondary)] font-medium">Preencha as informações de acesso</p>
                                    </div>
                                    <Button variant="secondary" size="sm" onClick={() => { setView('list'); resetForm(); }}>
                                        Voltar para Lista
                                    </Button>
                                </div>

                                <form onSubmit={handleProcessUser} className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <Input
                                            label="Nome Operacional"
                                            value={name}
                                            onChange={e => setName(e.target.value.toUpperCase())}
                                            placeholder="EX: PEDRO SILVA"
                                            required
                                        />
                                        <Input
                                            label="E-mail de Acesso"
                                            type="email"
                                            value={email}
                                            onChange={e => setEmail(e.target.value)}
                                            placeholder="nome@empresa.com"
                                            required
                                            autoComplete="email"
                                        />
                                    </div>

                                    <Input
                                        label={view === 'edit' ? 'Redefinir Senha (opcional)' : 'Senha de Acesso'}
                                        type="password"
                                        value={password}
                                        onChange={e => setPassword(e.target.value)}
                                        placeholder="••••••••"
                                        required={view === 'create'}
                                        autoComplete="new-password"
                                    />

                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-[var(--text-secondary)] ml-1">Nível de Hierarquia</label>
                                        <div className="grid grid-cols-3 gap-3 p-1 bg-[var(--bg-tertiary)] border border-[var(--border-medium)] rounded-xl">
                                            {['PROFESSIONAL', 'SUPERVISOR', 'MANAGER'].map(r => (
                                                <button
                                                    key={r}
                                                    type="button"
                                                    onClick={() => setRole(r as 'PROFESSIONAL' | 'SUPERVISOR' | 'MANAGER')}
                                                    className={`py-2.5 rounded-lg text-[10px] font-black tracking-widest uppercase transition-all ${role === r
                                                        ? 'bg-[var(--bg-primary)] text-[var(--accent-primary)] shadow-sm border border-[var(--border-medium)]'
                                                        : 'text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]'
                                                        }`}
                                                >
                                                    {r}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {role === 'PROFESSIONAL' && (
                                        <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-300">
                                            <label htmlFor="supervisor-select" className="text-xs font-bold text-[var(--text-secondary)] ml-1">Vincular Supervisor</label>
                                            <div className="relative">
                                                <select
                                                    id="supervisor-select"
                                                    value={supervisorId}
                                                    onChange={e => setSupervisorId(e.target.value)}
                                                    className="w-full px-4 py-3 bg-[var(--bg-primary)] border border-[var(--border-medium)] rounded-xl outline-none focus:ring-2 focus:ring-[var(--border-subtle)] focus:border-[var(--text-primary)] transition-all font-medium text-[var(--text-primary)] text-sm appearance-none"
                                                >
                                                    <option value="">-- Selecione o responsável técnico --</option>
                                                    {supervisors.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                                                </select>
                                                <Users className="w-4 h-4 absolute right-4 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)] pointer-events-none" />
                                            </div>

                                            {view === 'create' && (
                                                <div className="pt-4 mt-4 border-t border-[var(--border-subtle)] space-y-4">
                                                    <p className="text-[10px] font-black uppercase tracking-widest text-[var(--accent-primary)] mb-2">Ou criar novo supervisor:</p>
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                        <Input
                                                            label="Nome do Supervisor"
                                                            placeholder="NOME COMPLETO"
                                                            value={newSupervisorName}
                                                            onChange={e => setNewSupervisorName(e.target.value.toUpperCase())}
                                                        />
                                                        <Input
                                                            label="E-mail do Supervisor"
                                                            type="email"
                                                            placeholder="email@flash.com"
                                                            value={newSupervisorEmail}
                                                            onChange={e => setNewSupervisorEmail(e.target.value)}
                                                        />
                                                    </div>
                                                    <p className="text-[9px] text-[var(--text-tertiary)] italic">* Senha padrão para novos supervisores: flash2026</p>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {role === 'MANAGER' && (
                                        <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
                                            <div className="space-y-2">
                                                <label htmlFor="department-select" className="text-xs font-bold text-[var(--text-secondary)] ml-1">Vincular Departamento</label>
                                                <div className="relative">
                                                    <select
                                                        id="department-select"
                                                        value={departmentId}
                                                        onChange={e => setDepartmentId(e.target.value)}
                                                        className="w-full px-4 py-3 bg-[var(--bg-primary)] border border-[var(--border-medium)] rounded-xl outline-none focus:ring-2 focus:ring-[var(--border-subtle)] focus:border-[var(--text-primary)] transition-all font-medium text-[var(--text-primary)] text-sm appearance-none"
                                                    >
                                                        <option value="">-- Selecione o departamento (ou crie um abaixo) --</option>
                                                        {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                                                    </select>
                                                    <Filter className="w-4 h-4 absolute right-4 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)] pointer-events-none" />
                                                </div>
                                            </div>

                                            <Input
                                                label="Ou criar novo setor:"
                                                placeholder="EX: TI / RH / LOGÍSTICA"
                                                value={newDepartmentName}
                                                onChange={e => setNewDepartmentName(e.target.value.toUpperCase())}
                                            />
                                        </div>
                                    )}

                                    <Button
                                        type="submit"
                                        variant="primary"
                                        size="lg"
                                        fullWidth
                                        isLoading={loading}
                                        className="mt-6"
                                    >
                                        {view === 'create' ? 'Concluir Cadastro' : 'Salvar Alterações'}
                                    </Button>
                                </form>
                            </Card>
                        </div>
                    )}
                    {view === 'delete_report' && (
                        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 min-h-[calc(100vh-12rem)] flex flex-col">
                            <Card variant="white" className="p-8">
                                <div className="flex items-center justify-between mb-8 pb-6 border-b border-[var(--border-subtle)]">
                                    <div>
                                        <h2 className="text-xl font-bold text-red-600 mb-1 flex items-center gap-2">
                                            <Trash2 className="w-5 h-5" /> Excluir Processo
                                        </h2>
                                        <p className="text-xs text-[var(--text-secondary)] font-medium">Insira o número de protocolo para exclusão permanente do relatório</p>
                                    </div>
                                    <Button variant="secondary" size="sm" onClick={() => { setView('list'); resetForm(); }}>
                                        Voltar para Lista
                                    </Button>
                                </div>

                                <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-xl mb-6">
                                    <h3 className="text-red-600 font-bold text-sm mb-2">Aviso de Exclusão</h3>
                                    <p className="text-red-500/80 text-xs leading-relaxed">
                                        A exclusão de um processo é <strong className="font-bold">permanente e irreversível</strong>.
                                        Todos os dados vinculados a este protocolo (histórico de movimentações, fotos, áudios e interações no chat)
                                        serão apagados permanentemente do banco de dados e do servidor de mídia.
                                    </p>
                                </div>

                                <form onSubmit={handleProtocolSearch} className="space-y-6">
                                    <div className="max-w-md">
                                        <Input
                                            label="Número do Protocolo (6 caracteres)"
                                            value={protocolToDelete}
                                            onChange={e => setProtocolToDelete(e.target.value.toUpperCase())}
                                            placeholder="Ex: A1B2C3"
                                            maxLength={6}
                                            required
                                            className="font-mono text-center tracking-widest uppercase text-lg"
                                        />
                                    </div>

                                    <Button
                                        type="submit"
                                        variant="primary"
                                        size="lg"
                                        isLoading={isDeletingProtocol}
                                        disabled={protocolToDelete.length !== 6 || isDeletingProtocol}
                                        className="mt-6 w-full md:w-auto"
                                    >
                                        <Search className="w-4 h-4 mr-2" /> Localizar Processo
                                    </Button>
                                </form>

                                {/* Modal de Confirmação Segura */}
                                <Modal
                                    isOpen={!!reportToDelete}
                                    onClose={() => setReportToDelete(null)}
                                    title="Confirmar Arquivamento (Soft Delete)"
                                    subtitle={`Processo #${protocolToDelete.toUpperCase()}`}
                                    maxWidth="2xl"
                                    footer={
                                        <>
                                            <Button variant="secondary" onClick={() => setReportToDelete(null)} disabled={isDeletingProtocol}>
                                                Cancelar
                                            </Button>
                                            <Button variant="danger" onClick={confirmProtocolArchive} isLoading={isDeletingProtocol} className="bg-amber-600 hover:bg-amber-700 text-white">
                                                <Archive className="w-4 h-4 mr-2" /> Sim, Arquivar Processo
                                            </Button>
                                        </>
                                    }
                                >
                                    <div className="mb-6 bg-red-50 p-4 rounded-xl border border-red-100 flex items-start gap-4">
                                        <AlertTriangle className="w-6 h-6 text-red-500 shrink-0 mt-0.5" />
                                        <div>
                                            <h4 className="text-red-800 font-bold mb-1">Último Aviso</h4>
                                            <p className="text-red-700/80 text-sm">
                                                Você está prestes a arquivar o relatório abaixo. Ele sairá das listagens e relatórios gerais, e ficará guardado na aba de Arquivos de Auditoria para consultas futuras.
                                            </p>
                                        </div>
                                    </div>

                                    {reportToDelete && (
                                        <div className="pointer-events-none">
                                            <ReportCard report={reportToDelete} showUser={true} />
                                        </div>
                                    )}
                                </Modal>
                            </Card>
                        </div>
                    )}

                    {view === 'archived' && (
                        <div className="space-y-6 min-h-[calc(100vh-12rem)] flex flex-col">
                            <Card variant="white" className="p-8 border-[var(--border-subtle)]">
                                <div className="max-w-xl mb-8">
                                    <h2 className="text-2xl font-black text-[var(--text-primary)] tracking-tight flex items-center gap-3 mb-2">
                                        <FolderArchive className="w-8 h-8 text-amber-500" />
                                        Arquivos de Auditoria
                                    </h2>
                                    <p className="text-[var(--text-secondary)]">Listagem de processos arquivados (soft delete). Estes dados estão ocultos para operações diárias.</p>
                                </div>

                                <div className="mb-8 flex flex-wrap gap-4">
                                    <Button
                                        variant="secondary"
                                        onClick={() => fileInputRef.current?.click()}
                                        isLoading={isImporting}
                                        className="bg-[var(--bg-tertiary)] border-[var(--border-strong)] hover:border-amber-500"
                                    >
                                        <UploadCloud className="w-4 h-4 mr-2 text-amber-500" /> Restaurar via Arquivo Local
                                    </Button>
                                </div>

                                {isLoadingArchived ? (
                                    <div className="flex justify-center py-12">
                                        <div className="w-8 h-8 rounded-full border-4 border-amber-500 border-t-transparent animate-spin"></div>
                                    </div>
                                ) : archivedReports.length === 0 ? (
                                    <div className="text-center py-12 text-[var(--text-tertiary)] bg-[var(--bg-tertiary)] rounded-xl border border-dashed border-[var(--border-strong)]">
                                        <FolderArchive className="w-12 h-12 mx-auto mb-3 opacity-20" />
                                        <p className="font-bold">Nenhum processo arquivado</p>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                        {archivedReports.map(report => (
                                            <div
                                                key={report.id}
                                                className="cursor-pointer ring-2 ring-transparent hover:ring-amber-500 rounded-[1.5rem] transition-all"
                                                onClick={() => setArchivedReportSelected(report)}
                                            >
                                                <div className="pointer-events-none opacity-80 mix-blend-luminosity">
                                                    <ReportCard report={report} showUser={true} />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </Card>

                            {/* Modal de Gestão de Arquivados */}
                            <Modal
                                isOpen={!!archivedReportSelected}
                                onClose={() => setArchivedReportSelected(null)}
                                title="Gerenciar Processo Arquivado"
                                subtitle={archivedReportSelected ? `Protocolo #${archivedReportSelected.id.slice(-6).toUpperCase()}` : ''}
                                maxWidth="2xl"
                                footer={
                                    <div className="flex flex-col sm:flex-row w-full gap-3 justify-end items-center">
                                        <Button variant="secondary" onClick={() => setArchivedReportSelected(null)} disabled={isRestoring || isHardDeleting || isExporting}>
                                            Cancelar
                                        </Button>
                                        <div className="flex-1"></div>
                                        <Button
                                            variant="secondary"
                                            onClick={() => archivedReportSelected && handleDownloadBackup(archivedReportSelected.id.slice(-6).toUpperCase())}
                                            isLoading={isExporting}
                                            disabled={isRestoring || isHardDeleting}
                                            className="bg-[var(--bg-tertiary)] w-full sm:w-auto"
                                        >
                                            <Download className="w-4 h-4 mr-2" /> Backup Offline
                                        </Button>
                                        <Button variant="primary" onClick={confirmRestoreArchived} isLoading={isRestoring} disabled={isHardDeleting || isExporting} className="bg-emerald-600 hover:bg-emerald-700 w-full sm:w-auto">
                                            Restaurar Processo
                                        </Button>
                                        <Button variant="danger" onClick={confirmHardDeleteArchived} isLoading={isHardDeleting} disabled={isRestoring || isExporting} className="w-full sm:w-auto">
                                            <Trash2 className="w-4 h-4 mr-2" /> Excluir
                                        </Button>
                                    </div>
                                }
                            >
                                <div className="mb-6 bg-amber-50 p-4 rounded-xl border border-amber-100 flex items-start gap-4">
                                    <FolderArchive className="w-6 h-6 text-amber-500 shrink-0 mt-0.5" />
                                    <div>
                                        <h4 className="text-amber-800 font-bold mb-1">Processo em Auditoria</h4>
                                        <p className="text-amber-700/80 text-sm">
                                            Este processo está protegido (soft delete). Você pode <strong className="font-bold text-emerald-700">restaurá-lo</strong> para a operação ativa ou <strong className="font-bold text-red-700">excluí-lo permanentemente</strong>.
                                        </p>
                                    </div>
                                </div>

                                {archivedReportSelected && (
                                    <div className="pointer-events-none">
                                        <ReportCard report={archivedReportSelected} showUser={true} />
                                    </div>
                                )}
                            </Modal>
                        </div>
                    )}
                    <RestorationInput />
                </section>
            </div>

            {success && (
                <div className="fixed bottom-10 right-10 z-50 animate-in slide-in-from-right-10">
                    <Card variant="white" className="p-4 bg-emerald-50 text-emerald-800 border-emerald-100 shadow-xl flex items-center gap-3">
                        <CheckCircle className="w-6 h-6 text-emerald-600" />
                        <div>
                            <p className="font-bold text-sm">Operação Concluída</p>
                            <p className="text-xs opacity-80">Dados sincronizados com sucesso</p>
                        </div>
                    </Card>
                </div>
            )}

            <ProfileSettingsModal
                isOpen={isProfileOpen}
                onClose={() => setIsProfileOpen(false)}
                onSave={handleUpdateProfile}
                isLoading={isUpdatingProfile}
                profilePhrase={profilePhrase}
                setProfilePhrase={setProfilePhrase}
                onAvatarChange={setProfileAvatar}
                avatarUrl={user?.avatarUrl}
                notificationsEnabled={notificationsEnabled}
                setNotificationsEnabled={setNotificationsEnabled}
                desktopNotificationsEnabled={desktopNotificationsEnabled}
                setDesktopNotificationsEnabled={setDesktopNotificationsEnabled}
            />
        </DashboardLayout>
    );
}
