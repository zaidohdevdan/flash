import React, { useState, useEffect } from 'react';
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
    Header,
    Badge,
    GlassCard
} from '../components/ui';
import { TacticalHud } from '../components/home/TacticalHud';

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
    const [view, setView] = useState<'list' | 'create' | 'edit'>('list');
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

    useEffect(() => {
        fetchSupervisors();
        fetchDepartments();
        fetchUsers();
    }, [searchQuery, roleFilter]);

    async function fetchUsers() {
        try {
            const response = await api.get('/users', {
                params: { search: searchQuery, role: roleFilter }
            });
            setUsers(response.data);
        } catch (err) {
            console.error('Erro ao buscar usuários');
        }
    }

    async function fetchSupervisors() {
        try {
            const response = await api.get('/supervisors');
            setSupervisors(response.data);
        } catch (err) {
            console.error('Erro ao buscar supervisores');
        }
    }

    async function fetchDepartments() {
        try {
            const response = await api.get('/departments');
            setDepartments(response.data);
        } catch (err) {
            console.error('Erro ao buscar departamentos');
        }
    }

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
        } catch (err: any) {
            console.error('Erro na operação:', err.response?.data?.error);
        } finally {
            setLoading(false);
        }
    }

    async    async function handleDeleteDepartment(deptId: string, deptName: string) {
        if (!window.confirm(`ATENÇÃO: Você está prestes a excluir o setor "${deptName}".\n\nTodos os processos (reports) atualmente neste setor serão devolvidos para o SUPERVISOR responsável para reanálise.\n\nTem certeza que deseja continuar?`)) {
            return;
        }

        try {
            await api.delete(`/departments/${deptId}`);
            setSuccess(true);
            toast.success('Departamento excluído e processos reatribuídos.');
            setTimeout(() => {
                setSuccess(false);
                fetchDepartments();
            }, 1500);
        } catch (err: any) {
            console.error('Erro ao deletar departamento:', err);
            toast.error('Erro ao excluir departamento.');
        }
    }

    return (
        <div className="min-h-screen bg-[#020617] text-slate-200 flex flex-col font-sans selection:bg-blue-500/30 overflow-x-hidden relative">
            <TacticalHud />

            <div className="fixed inset-0 pointer-events-none z-0">
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000,transparent)] opacity-[0.1]" />
            </div>

            <Header
                user={{
                    name: user?.name,
                    avatarUrl: user?.avatarUrl
                }}
                onLogout={signOut}
            />

            <main className="max-w-7xl mx-auto px-6 w-full mt-8 grid grid-cols-1 lg:grid-cols-4 gap-8 relative z-10">
                {/* Background Decorations - Removed in favor of Global Mesh */}
                <aside className="lg:col-span-1">
                    <Card variant="dark" className="p-2 space-y-1 shadow-xl shadow-black/50 border-white/5 !rounded-[2rem] sticky top-28">
                        <button
                            onClick={() => { setView('list'); resetForm(); }}
                            className={`w-full flex items-center gap-3 px-6 py-4 rounded-2xl font-black text-[10px] tracking-widest uppercase transition-all ${view === 'list' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-300 hover:bg-white/5'}`}
                        >
                            <Users className="w-5 h-5" /> GESTÃO DE USUÁRIOS
                        </button>
                        <button
                            onClick={() => { setView('create'); resetForm(); }}
                            className={`w-full flex items-center gap-3 px-6 py-4 rounded-2xl font-black text-[10px] tracking-widest uppercase transition-all ${view === 'create' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-300 hover:bg-white/5'}`}
                        >
                            <UserPlus className="w-5 h-5" /> NOVO CADASTRO
                        </button>
                        <button
                            onClick={() => { setView('departments' as any); resetForm(); }}
                            className={`w-full flex items-center gap-3 px-6 py-4 rounded-2xl font-black text-[10px] tracking-widest uppercase transition-all ${view === 'departments' as any ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-300 hover:bg-white/5'}`}
                        >
                            <Filter className="w-5 h-5" /> GESTÃO DE SETORES
                        </button>

                        <div className="pt-4 mt-4 border-t border-white/5 p-4">
                            <div className="bg-emerald-500/10 p-4 rounded-2xl border border-emerald-500/20">
                                <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest leading-none mb-1">Status do Sistema</p>
                                <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs">
                                    <CheckCircle className="w-4 h-4" /> Operacional
                                </div>
                            </div>
                        </div>
                    </Card>
                </aside>

                <section className="lg:col-span-3 space-y-8">
                    {view === 'list' ? (
                        <>
                            {/* Filter Bar */}
                            <GlassCard variant="dark" blur="lg" className="p-3 flex flex-col md:flex-row gap-4 items-center !rounded-[2rem] border-white/10 shadow-xl shadow-black/50">
                                <div className="relative flex-1 w-full">
                                    <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                                    <input
                                        type="text"
                                        placeholder="Buscar usuários..."
                                        value={searchQuery}
                                        onChange={e => setSearchQuery(e.target.value)}
                                        className="w-full pl-12 pr-6 py-4 bg-slate-900/50 border-transparent border rounded-2xl focus:bg-slate-800 focus:border-blue-500/30 outline-none transition-all text-xs font-bold text-white uppercase tracking-wider placeholder:text-slate-400"
                                    />
                                </div>
                                <div className="flex items-center gap-2 bg-white/5 p-1.5 rounded-2xl w-full md:w-auto border border-white/10">
                                    <Filter className="w-4 h-4 text-slate-300 ml-3 hidden md:block" />
                                    <select
                                        value={roleFilter}
                                        onChange={e => setRoleFilter(e.target.value)}
                                        className="bg-transparent border-none outline-none text-[10px] font-black text-slate-300 py-2.5 px-4 cursor-pointer uppercase tracking-widest"
                                    >
                                        <option value="">TODOS PAPÉIS</option>
                                        <option value="ADMIN">ADMINS</option>
                                        <option value="SUPERVISOR">SUPERVISORES</option>
                                        <option value="MANAGER">GERENTES</option>
                                        <option value="PROFESSIONAL">PROFISSIONAIS</option>
                                    </select>
                                </div>
                            </GlassCard>

                            {/* Users Table */}
                            <Card variant="dark" className="!rounded-[2.5rem] shadow-2xl shadow-black/20 overflow-hidden border-white/5">
                                <div className="p-8 border-b border-white/5 flex justify-between items-center bg-white/5">
                                    <div>
                                        <h2 className="text-xl font-black text-white uppercase tracking-tight">Equipe FLASH</h2>
                                        <p className="text-[10px] text-slate-300 font-black uppercase tracking-widest mt-1">Gerenciamento de acessos e permissões</p>
                                    </div>
                                    <Badge status="SENT" label={`${users.length} ATIVOS`} />
                                </div>

                                <div className="overflow-x-auto">
                                    <table className="w-full text-left border-collapse">
                                        <thead>
                                            <tr className="bg-white/5 text-[10px] font-black text-slate-300 uppercase tracking-widest border-b border-white/5">
                                                <th className="px-8 py-5">USUÁRIO / IDENTIDADE</th>
                                                <th className="px-8 py-5">NÍVEL / PAPEL</th>
                                                <th className="px-8 py-5">SUPERVISÃO / DEP</th>
                                                <th className="px-8 py-5 text-right">AÇÕES</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-white/5">
                                            {users.length === 0 ? (
                                                <tr>
                                                    <td colSpan={4} className="px-8 py-32 text-center text-slate-400">
                                                        <Users className="w-12 h-12 mx-auto mb-4 opacity-10" />
                                                        <p className="text-[10px] font-black uppercase tracking-widest">Nenhum usuário encontrado</p>
                                                    </td>
                                                </tr>
                                            ) : (
                                                users.map(u => (
                                                    <tr key={u.id} className="hover:bg-blue-500/10 transition-all group">
                                                        <td className="px-8 py-6">
                                                            <div className="flex items-center gap-4">
                                                                <div className="w-11 h-11 rounded-2xl bg-white/5 shadow-lg shadow-black/20 flex items-center justify-center text-blue-400 font-black text-sm border border-white/10 group-hover:scale-110 transition-transform">
                                                                    {u.name.charAt(0)}
                                                                </div>
                                                                <div>
                                                                    <p className="font-bold text-white text-sm leading-none mb-1">{u.name}</p>
                                                                    <p className="text-xs text-slate-300 font-medium">{u.email}</p>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className="px-8 py-6">
                                                            <Badge
                                                                status={u.role === 'ADMIN' ? 'RESOLVED' : u.role === 'SUPERVISOR' ? 'FORWARDED' : u.role === 'MANAGER' ? 'SENT' : 'IN_REVIEW'}
                                                                label={u.role}
                                                            />
                                                        </td>
                                                        <td className="px-8 py-6">
                                                            {u.supervisor ? (
                                                                <div className="flex items-center gap-2">
                                                                    <Shield className="w-3.5 h-3.5 text-purple-400" />
                                                                    <span className="text-xs font-bold text-slate-300 uppercase tracking-tight">{u.supervisor}</span>
                                                                </div>
                                                            ) : u.departmentName ? (
                                                                <div className="flex items-center gap-2">
                                                                    <Filter className="w-3.5 h-3.5 text-blue-400" />
                                                                    <span className="text-xs font-bold text-slate-300 uppercase tracking-tight">{u.departmentName}</span>
                                                                </div>
                                                            ) : (
                                                                <span className="text-[10px] font-black text-slate-500 uppercase italic">DIRETO / GLOBAL</span>
                                                            )}
                                                        </td>
                                                        <td className="px-8 py-6 text-right">
                                                            {u.id !== user?.id && (
                                                                <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
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
                                                                        className="hover:text-red-500 hover:bg-red-500/10"
                                                                    >
                                                                        <Trash2 className="w-4 h-4" />
                                                                    </Button>
                                                                </div>
                                                            )}
                                                            {u.id === user?.id && (
                                                                <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest bg-blue-500/10 px-3 py-1 rounded-full">VOCÊ</span>
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
                    ) : view === 'departments' as any ? (
                        <div className="max-w-4xl mx-auto lg:mx-0 animate-in slide-in-from-bottom-5 duration-500">
                            <Card variant="dark" className="!rounded-[2.5rem] shadow-2xl shadow-black/20 overflow-hidden border-white/5">
                                <div className="p-8 border-b border-white/5 flex justify-between items-center bg-white/5">
                                    <div>
                                        <h2 className="text-xl font-black text-white uppercase tracking-tight">Setores Operacionais</h2>
                                        <p className="text-[10px] text-slate-300 font-black uppercase tracking-widest mt-1">Gestão de Departamentos</p>
                                    </div>
                                    <Button variant="secondary" size="sm" onClick={() => setView('list')}>
                                        Voltar
                                    </Button>
                                </div>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left border-collapse">
                                        <thead>
                                            <tr className="bg-white/5 text-[10px] font-black text-slate-300 uppercase tracking-widest border-b border-white/5">
                                                <th className="px-8 py-5">NOME DO SETOR</th>
                                                <th className="px-8 py-5 text-right w-32">AÇÕES</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-white/5">
                                            {departments.length === 0 ? (
                                                <tr>
                                                    <td colSpan={2} className="px-8 py-16 text-center text-slate-400">
                                                        <Filter className="w-12 h-12 mx-auto mb-4 opacity-10" />
                                                        <p className="text-[10px] font-black uppercase tracking-widest">Nenhum departamento encontrado</p>
                                                    </td>
                                                </tr>
                                            ) : (
                                                departments.map(dept => (
                                                    <tr key={dept.id} className="hover:bg-blue-500/10 transition-all group">
                                                        <td className="px-8 py-6">
                                                            <div className="flex items-center gap-3">
                                                                <div className="bg-blue-500/20 p-2 rounded-lg text-blue-400">
                                                                    <Filter className="w-5 h-5" />
                                                                </div>
                                                                <span className="font-bold text-white text-sm">{dept.name}</span>
                                                            </div>
                                                        </td>
                                                        <td className="px-8 py-6 text-right">
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => handleDeleteDepartment(dept.id, dept.name)}
                                                                className="hover:text-red-500 hover:bg-red-500/10 opacity-0 group-hover:opacity-100 transition-opacity"
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
                        <div className="max-w-2xl mx-auto lg:mx-0 animate-in slide-in-from-bottom-5 duration-500">
                            <Card variant="dark" className="p-10 !rounded-[3rem] shadow-2xl shadow-black/20 border-white/5">
                                <div className="flex justify-between items-start mb-10">
                                    <div>
                                        <h2 className="text-3xl font-black text-white tracking-tight uppercase mb-1">{view === 'create' ? 'Novo Cadastro' : 'Editar Membro'}</h2>
                                        <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Controle de acesso à rede operacional</p>
                                    </div>
                                    <Button variant="secondary" size="sm" onClick={() => { setView('list'); resetForm(); }}>
                                        Voltar para Lista
                                    </Button>
                                </div>

                                <form onSubmit={handleProcessUser} className="space-y-8">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <Input
                                            label="Nome Operacional"
                                            value={name}
                                            variant="dark"
                                            onChange={e => setName(e.target.value.toUpperCase())}
                                            placeholder="EX: PEDRO SILVA"
                                            required
                                        />
                                        <Input
                                            label="E-mail de Acesso"
                                            type="email"
                                            value={email}
                                            variant="dark"
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
                                        variant="dark"
                                        onChange={e => setPassword(e.target.value)}
                                        placeholder="••••••••"
                                        required={view === 'create'}
                                        autoComplete="new-password"
                                    />

                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Nível de Hierarquia</label>
                                        <div className="grid grid-cols-3 gap-3 p-1.5 bg-slate-900/50 border border-white/5 rounded-[1.5rem]">
                                            {['PROFESSIONAL', 'SUPERVISOR', 'MANAGER'].map(r => (
                                                <button
                                                    key={r}
                                                    type="button"
                                                    onClick={() => setRole(r as any)}
                                                    className={`py-3.5 rounded-2xl text-[10px] font-black tracking-widest uppercase transition-all ${role === r ? 'bg-blue-600 text-white shadow-xl' : 'text-slate-500 hover:text-white'}`}
                                                >
                                                    {r}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {role === 'PROFESSIONAL' && (
                                        <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-300">
                                            <label className="text-[10px] font-black text-slate-300 uppercase tracking-widest ml-1">Vincular Supervisor</label>
                                            <div className="relative">
                                                <select
                                                    value={supervisorId}
                                                    onChange={e => setSupervisorId(e.target.value)}
                                                    className="w-full px-6 py-4 bg-slate-900/50 border border-white/5 rounded-[1.5rem] outline-none focus:border-blue-500/30 transition-all font-bold text-white text-xs appearance-none"
                                                    required
                                                >
                                                    <option value="">-- Selecione o responsável técnico --</option>
                                                    {supervisors.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                                                </select>
                                                <Users className="w-4 h-4 absolute right-6 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
                                            </div>
                                        </div>
                                    )}

                                    {role === 'MANAGER' && (
                                        <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black text-slate-300 uppercase tracking-widest ml-1">Vincular Departamento</label>
                                                <div className="relative">
                                                    <select
                                                        value={departmentId}
                                                        onChange={e => setDepartmentId(e.target.value)}
                                                        className="w-full px-6 py-4 bg-slate-900/50 border border-white/5 rounded-[1.5rem] outline-none focus:border-blue-500/30 transition-all font-bold text-white text-xs appearance-none"
                                                    >
                                                        <option value="">-- Selecione o departamento (ou crie um abaixo) --</option>
                                                        {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                                                    </select>
                                                    <Filter className="w-4 h-4 absolute right-6 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
                                                </div>
                                            </div>

                                            <Input
                                                label="Ou criar novo setor:"
                                                placeholder="EX: TI / RH / LOGÍSTICA"
                                                value={newDepartmentName}
                                                variant="dark"
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
                                        className="!py-6 mt-4 shadow-xl shadow-blue-900/20"
                                    >
                                        {view === 'create' ? 'CONCLUIR CADASTRO' : 'SALVAR ALTERAÇÕES OPERACIONAIS'}
                                    </Button>
                                </form>
                            </Card>
                        </div>
                    )}
                </section>
            </main>

            {success && (
                <div className="fixed bottom-10 right-10 z-50 animate-in slide-in-from-right-10">
                    <Card variant="dark" className="p-6 bg-emerald-500 !text-white border-none shadow-2xl flex items-center gap-4">
                        <CheckCircle className="w-8 h-8" />
                        <div>
                            <p className="font-black text-sm uppercase tracking-tight">Operação Concluída</p>
                            <p className="text-[10px] font-bold uppercase tracking-widest opacity-80">Dados sincronizados com sucesso</p>
                        </div>
                    </Card>
                </div>
            )}
        </div>
    );
}
