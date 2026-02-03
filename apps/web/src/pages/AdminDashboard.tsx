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

    async function handleDeleteUser(userId: string, userName: string) {
        if (userId === user?.id) {
            toast.error('Você não pode remover seu próprio acesso administrativo.');
            return;
        }
        if (!window.confirm(`Tem certeza que deseja remover o usuário ${userName}? Esta ação não pode ser desfeita.`)) {
            return;
        }

        try {
            await api.delete(`/users/${userId}`);
            setSuccess(true);
            toast.success('Usuário removido com sucesso!'); // Caso toast esteja disponível, senão setSuccess cuida.
            setTimeout(() => {
                setSuccess(false);
                fetchUsers();
            }, 1000);
        } catch (err: any) {
            console.error('Erro ao deletar:', err.response?.data?.error);
            alert(err.response?.data?.error || 'Erro ao deletar usuário.');
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
        setRole(u.role as any);
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

    return (
        <div className="min-h-screen bg-slate-50/50 flex flex-col font-sans selection:bg-blue-100 selection:text-blue-900 transition-colors duration-700 overflow-x-hidden">
            <Header
                user={{
                    name: user?.name,
                    avatarUrl: user?.avatarUrl
                }}
                onLogout={signOut}
            />

            <main className="max-w-7xl mx-auto px-6 w-full mt-8 grid grid-cols-1 lg:grid-cols-4 gap-8 relative">
                {/* Background Decorations */}
                <div className="absolute top-[-10%] right-[-10%] w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-[120px] animate-pulse pointer-events-none" />
                <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-[140px] animate-pulse pointer-events-none" style={{ animationDelay: '2s' }} />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[radial-gradient(circle_at_50%_50%,rgba(59,130,246,0.03),transparent_70%)] pointer-events-none" />
                {/* Sidebar Navigation */}
                <aside className="lg:col-span-1">
                    <Card variant="white" className="p-2 space-y-1 shadow-xl shadow-gray-200/50 border-gray-100 !rounded-[2rem] sticky top-28">
                        <button
                            onClick={() => { setView('list'); resetForm(); }}
                            className={`w-full flex items-center gap-3 px-6 py-4 rounded-2xl font-black text-[10px] tracking-widest uppercase transition-all ${view === 'list' ? 'bg-[#0f172a] text-white shadow-lg' : 'text-gray-400 hover:bg-gray-50'}`}
                        >
                            <Users className="w-5 h-5" /> GESTÃO DE USUÁRIOS
                        </button>
                        <button
                            onClick={() => { setView('create'); resetForm(); }}
                            className={`w-full flex items-center gap-3 px-6 py-4 rounded-2xl font-black text-[10px] tracking-widest uppercase transition-all ${view === 'create' ? 'bg-[#0f172a] text-white shadow-lg' : 'text-gray-400 hover:bg-gray-50'}`}
                        >
                            <UserPlus className="w-5 h-5" /> NOVO CADASTRO
                        </button>

                        <div className="pt-4 mt-4 border-t border-gray-50 p-4">
                            <div className="bg-emerald-50 p-4 rounded-2xl border border-emerald-100">
                                <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest leading-none mb-1">Status do Sistema</p>
                                <div className="flex items-center gap-2 text-emerald-700 font-bold text-xs">
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
                            <GlassCard variant="light" blur="lg" className="p-3 flex flex-col md:flex-row gap-4 items-center !rounded-[2rem] border-white shadow-xl shadow-gray-200/50">
                                <div className="relative flex-1 w-full">
                                    <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    <input
                                        type="text"
                                        placeholder="Buscar usuários..."
                                        value={searchQuery}
                                        onChange={e => setSearchQuery(e.target.value)}
                                        className="w-full pl-12 pr-6 py-4 bg-gray-50/50 border-transparent border rounded-2xl focus:bg-white focus:border-blue-500/30 outline-none transition-all text-xs font-bold text-gray-700 uppercase tracking-wider"
                                    />
                                </div>
                                <div className="flex items-center gap-2 bg-gray-50/50 p-1.5 rounded-2xl w-full md:w-auto border border-gray-100">
                                    <Filter className="w-4 h-4 text-gray-400 ml-3 hidden md:block" />
                                    <select
                                        value={roleFilter}
                                        onChange={e => setRoleFilter(e.target.value)}
                                        className="bg-transparent border-none outline-none text-[10px] font-black text-gray-500 py-2.5 px-4 cursor-pointer uppercase tracking-widest"
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
                            <Card variant="white" className="!rounded-[2.5rem] shadow-2xl shadow-gray-900/5 overflow-hidden border-gray-100">
                                <div className="p-8 border-b border-gray-50 flex justify-between items-center bg-gray-50/20">
                                    <div>
                                        <h2 className="text-xl font-black text-gray-900 uppercase tracking-tight">Equipe FLASH</h2>
                                        <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mt-1">Gerenciamento de acessos e permissões</p>
                                    </div>
                                    <Badge status="SENT" label={`${users.length} ATIVOS`} />
                                </div>

                                <div className="overflow-x-auto">
                                    <table className="w-full text-left border-collapse">
                                        <thead>
                                            <tr className="bg-gray-50/30 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-50">
                                                <th className="px-8 py-5">USUÁRIO / IDENTIDADE</th>
                                                <th className="px-8 py-5">NÍVEL / PAPEL</th>
                                                <th className="px-8 py-5">SUPERVISÃO / DEP</th>
                                                <th className="px-8 py-5 text-right">AÇÕES</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-50">
                                            {users.length === 0 ? (
                                                <tr>
                                                    <td colSpan={4} className="px-8 py-32 text-center text-gray-300">
                                                        <Users className="w-12 h-12 mx-auto mb-4 opacity-10" />
                                                        <p className="text-[10px] font-black uppercase tracking-widest">Nenhum usuário encontrado</p>
                                                    </td>
                                                </tr>
                                            ) : (
                                                users.map(u => (
                                                    <tr key={u.id} className="hover:bg-blue-50/20 transition-all group">
                                                        <td className="px-8 py-6">
                                                            <div className="flex items-center gap-4">
                                                                <div className="w-11 h-11 rounded-2xl bg-white shadow-lg shadow-gray-900/5 flex items-center justify-center text-blue-600 font-black text-sm border border-gray-100 group-hover:scale-110 transition-transform">
                                                                    {u.name.charAt(0)}
                                                                </div>
                                                                <div>
                                                                    <p className="font-bold text-gray-900 text-sm leading-none mb-1">{u.name}</p>
                                                                    <p className="text-xs text-gray-400 font-medium">{u.email}</p>
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
                                                                    <span className="text-xs font-bold text-gray-600 uppercase tracking-tight">{u.supervisor}</span>
                                                                </div>
                                                            ) : u.departmentName ? (
                                                                <div className="flex items-center gap-2">
                                                                    <Filter className="w-3.5 h-3.5 text-blue-400" />
                                                                    <span className="text-xs font-bold text-gray-600 uppercase tracking-tight">{u.departmentName}</span>
                                                                </div>
                                                            ) : (
                                                                <span className="text-[10px] font-black text-gray-300 uppercase italic">DIRETO / GLOBAL</span>
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
                                                                        className="hover:text-red-500 hover:bg-red-50"
                                                                    >
                                                                        <Trash2 className="w-4 h-4" />
                                                                    </Button>
                                                                </div>
                                                            )}
                                                            {u.id === user?.id && (
                                                                <span className="text-[10px] font-black text-blue-500 uppercase tracking-widest bg-blue-50 px-3 py-1 rounded-full">VOCÊ</span>
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
                    ) : (
                        <div className="max-w-2xl mx-auto lg:mx-0 animate-in slide-in-from-bottom-5 duration-500">
                            <Card variant="white" className="p-10 !rounded-[3rem] shadow-2xl shadow-gray-900/5 border-gray-100">
                                <div className="flex justify-between items-start mb-10">
                                    <div>
                                        <h2 className="text-3xl font-black text-gray-900 tracking-tight uppercase mb-1">{view === 'create' ? 'Novo Cadastro' : 'Editar Membro'}</h2>
                                        <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">Controle de acesso à rede operacional</p>
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

                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Nível de Hierarquia</label>
                                        <div className="grid grid-cols-3 gap-3 p-1.5 bg-gray-100/50 border border-gray-100 rounded-[1.5rem]">
                                            {['PROFESSIONAL', 'SUPERVISOR', 'MANAGER'].map(r => (
                                                <button
                                                    key={r}
                                                    type="button"
                                                    onClick={() => setRole(r as any)}
                                                    className={`py-3.5 rounded-2xl text-[10px] font-black tracking-widest uppercase transition-all ${role === r ? 'bg-[#0f172a] text-white shadow-xl' : 'text-gray-400 hover:text-gray-600'}`}
                                                >
                                                    {r}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {role === 'PROFESSIONAL' && (
                                        <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-300">
                                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Vincular Supervisor</label>
                                            <div className="relative">
                                                <select
                                                    value={supervisorId}
                                                    onChange={e => setSupervisorId(e.target.value)}
                                                    className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-[1.5rem] outline-none focus:border-blue-500/30 transition-all font-bold text-gray-800 text-xs appearance-none"
                                                    required
                                                >
                                                    <option value="">-- Selecione o responsável técnico --</option>
                                                    {supervisors.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                                                </select>
                                                <Users className="w-4 h-4 absolute right-6 top-1/2 -translate-y-1/2 text-gray-300 pointer-events-none" />
                                            </div>
                                        </div>
                                    )}

                                    {role === 'MANAGER' && (
                                        <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Vincular Departamento</label>
                                                <div className="relative">
                                                    <select
                                                        value={departmentId}
                                                        onChange={e => setDepartmentId(e.target.value)}
                                                        className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-[1.5rem] outline-none focus:border-blue-500/30 transition-all font-bold text-gray-800 text-xs appearance-none"
                                                    >
                                                        <option value="">-- Selecione o departamento (ou crie um abaixo) --</option>
                                                        {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                                                    </select>
                                                    <Filter className="w-4 h-4 absolute right-6 top-1/2 -translate-y-1/2 text-gray-300 pointer-events-none" />
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
                                        className="!py-6 mt-4 shadow-xl shadow-gray-900/10"
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
                    <Card variant="white" className="p-6 bg-emerald-500 !text-white border-none shadow-2xl flex items-center gap-4">
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
