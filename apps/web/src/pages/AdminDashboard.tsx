import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../services/api';
import { toast } from 'react-hot-toast';
import {
    UserPlus,
    Shield,
    Users,
    Search,
    Filter,
    Edit2,
    CheckCircle,
    Trash2
} from 'lucide-react';
import {
    Button,
    Input,
    Card,
    Badge
} from '../components/ui';
import { DashboardLayout } from '../layouts/DashboardLayout';

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

export function AdminDashboard() {
    const { user, signOut } = useAuth();
    const [view, setView] = useState<'list' | 'create' | 'edit' | 'departments'>('list');
    const [users, setUsers] = useState<UserSummary[]>([]);
    const [supervisors, setSupervisors] = useState<Supervisor[]>([]);
    const [departments, setDepartments] = useState<Department[]>([]);
    const [editingUser, setEditingUser] = useState<UserSummary | null>(null);

    // Filters
    const [searchQuery, setSearchQuery] = useState('');
    const [roleFilter, setRoleFilter] = useState('');

    // Form State
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState<'PROFESSIONAL' | 'SUPERVISOR' | 'MANAGER'>('PROFESSIONAL');
    const [supervisorId, setSupervisorId] = useState('');
    const [departmentId, setDepartmentId] = useState('');
    const [newDepartmentName, setNewDepartmentName] = useState('');

    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);



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

    useEffect(() => {
        fetchSupervisors();
        fetchDepartments();
        fetchUsers();
    }, [fetchUsers, fetchSupervisors, fetchDepartments]);

    async function handleProcessUser(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true);

        let deptId = departmentId;

        try {
            // Cria novo departamento se especificado
            if (role === 'MANAGER' && !deptId && newDepartmentName.trim()) {
                const deptRes = await api.post('/departments', { name: newDepartmentName });
                deptId = deptRes.data.id;
            }

            if (view === 'create') {
                await api.post('/register', {
                    name, email, password, role,
                    supervisorId: role === 'PROFESSIONAL' ? supervisorId : undefined,
                    departmentId: role === 'MANAGER' ? deptId : undefined
                });
            } else if (editingUser) {
                await api.put(`/users/${editingUser.id}`, {
                    name, email, role,
                    password: password || undefined,
                    supervisorId: role === 'PROFESSIONAL' ? supervisorId : null,
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

    return (
        <DashboardLayout
            user={{ name: user?.name, avatarUrl: user?.avatarUrl, role: user?.role }}
            onLogout={signOut}
        >
            <div className="flex flex-col lg:flex-row gap-8 animate-in fade-in duration-500">
                <aside className="w-full lg:w-72 shrink-0 space-y-4">
                    <Card variant="white" className="p-2 space-y-1 shadow-sm sticky top-6">
                        <button
                            onClick={() => { setView('list'); resetForm(); }}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-xs uppercase tracking-wide transition-all ${view === 'list'
                                ? 'bg-[var(--accent-primary)] text-white shadow-md'
                                : 'text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)]'
                                }`}
                        >
                            <Users className="w-4 h-4" /> Gestão de Usuários
                        </button>
                        <button
                            onClick={() => { setView('create'); resetForm(); }}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-xs uppercase tracking-wide transition-all ${view === 'create'
                                ? 'bg-[var(--accent-primary)] text-white shadow-md'
                                : 'text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)]'
                                }`}
                        >
                            <UserPlus className="w-4 h-4" /> Novo Cadastro
                        </button>
                        <button
                            onClick={() => { setView('departments'); resetForm(); }}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-xs uppercase tracking-wide transition-all ${view === 'departments'
                                ? 'bg-[var(--accent-primary)] text-white shadow-md'
                                : 'text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)]'
                                }`}
                        >
                            <Filter className="w-4 h-4" /> Gestão de Setores
                        </button>

                        <div className="pt-4 mt-4 border-t border-[var(--border-subtle)] px-2 pb-2">
                            <div className="bg-emerald-50 p-3 rounded-xl border border-emerald-100">
                                <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest leading-none mb-1">Status do Sistema</p>
                                <div className="flex items-center gap-2 text-emerald-700 font-bold text-xs">
                                    <CheckCircle className="w-4 h-4" /> Operacional
                                </div>
                            </div>
                        </div>
                    </Card>
                </aside>

                <section className="flex-1 space-y-6">
                    {view === 'list' ? (
                        <>
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
                        </>
                    ) : view === 'departments' ? (
                        <div className="animate-in slide-in-from-right-4 duration-500">
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
                    ) : (
                        <div className="max-w-3xl mx-auto animate-in slide-in-from-bottom-5 duration-500">
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
                                                        ? 'bg-white text-[var(--accent-primary)] shadow-sm border border-[var(--border-subtle)]'
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
                                                    required
                                                >
                                                    <option value="">-- Selecione o responsável técnico --</option>
                                                    {supervisors.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                                                </select>
                                                <Users className="w-4 h-4 absolute right-4 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)] pointer-events-none" />
                                            </div>
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
        </DashboardLayout>
    );
}
