import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import { UserPlus, Shield, Users, LogOut, CheckCircle, Search, Filter, Edit2, X } from 'lucide-react';

interface Supervisor {
    id: string;
    name: string;
}

interface UserSummary {
    id: string;
    name: string;
    email: string;
    role: string;
    supervisor?: string;
    supervisorId?: string;
}

export function AdminDashboard() {
    const { user, signOut } = useAuth();
    const [view, setView] = useState<'list' | 'create' | 'edit'>('list');
    const [users, setUsers] = useState<UserSummary[]>([]);
    const [supervisors, setSupervisors] = useState<Supervisor[]>([]);
    const [editingUser, setEditingUser] = useState<UserSummary | null>(null);

    // Filters
    const [searchQuery, setSearchQuery] = useState('');
    const [roleFilter, setRoleFilter] = useState('');

    // Form State
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState<'PROFESSIONAL' | 'SUPERVISOR' | 'ADMIN'>('PROFESSIONAL');
    const [supervisorId, setSupervisorId] = useState('');

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        fetchSupervisors();
        fetchUsers();
    }, [searchQuery, roleFilter]);

    async function fetchUsers() {
        try {
            const response = await axios.get('http://localhost:3000/users', {
                params: { search: searchQuery, role: roleFilter }
            });
            setUsers(response.data);
        } catch (err) {
            console.error('Erro ao buscar usuários');
        }
    }

    async function fetchSupervisors() {
        try {
            const response = await axios.get('http://localhost:3000/supervisors');
            setSupervisors(response.data);
        } catch (err) {
            console.error('Erro ao buscar supervisores');
        }
    }

    async function handleCreateUser(e: React.FormEvent) {
        e.preventDefault();
        setError('');
        setLoading(true);

        if (role === 'PROFESSIONAL' && !supervisorId) {
            setError('Profissionais devem ter um supervisor vinculado.');
            setLoading(false);
            return;
        }

        try {
            await axios.post('http://localhost:3000/register', {
                name, email, password, role,
                supervisorId: role === 'PROFESSIONAL' ? supervisorId : undefined
            });

            setSuccess(true);
            setTimeout(() => {
                setSuccess(false);
                setView('list');
                resetForm();
                fetchUsers();
            }, 2000);
        } catch (err: any) {
            setError(err.response?.data?.error || 'Erro ao criar usuário.');
        } finally {
            setLoading(false);
        }
    }

    async function handleUpdateUser(e: React.FormEvent) {
        e.preventDefault();
        if (!editingUser) return;

        setError('');
        setLoading(true);

        try {
            await axios.put(`http://localhost:3000/users/${editingUser.id}`, {
                name, email, role,
                password: password || undefined,
                supervisorId: role === 'PROFESSIONAL' ? supervisorId : null
            });

            setSuccess(true);
            setTimeout(() => {
                setSuccess(false);
                setView('list');
                resetForm();
                fetchUsers();
            }, 2000);
        } catch (err: any) {
            setError(err.response?.data?.error || 'Erro ao editar usuário.');
        } finally {
            setLoading(false);
        }
    }

    function startEdit(u: UserSummary) {
        setEditingUser(u);
        setName(u.name);
        setEmail(u.email);
        setRole(u.role as any);
        setSupervisorId(u.supervisorId || '');
        setPassword('');
        setView('edit');
    }

    function resetForm() {
        setName('');
        setEmail('');
        setPassword('');
        setRole('PROFESSIONAL');
        setSupervisorId('');
        setEditingUser(null);
    }

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
            <header className="bg-white border-b px-6 py-4 flex justify-between items-center shadow-sm sticky top-0 z-20">
                <div className="flex items-center gap-3">
                    <div className="bg-red-600 p-2 rounded-lg">
                        <Shield className="text-white w-5 h-5" />
                    </div>
                    <span className="font-black text-gray-900 tracking-tighter text-xl uppercase">Flash Admin</span>
                </div>
                <div className="flex items-center gap-6">
                    <span className="text-sm text-gray-500 font-medium hidden md:block">Olá, <b className="text-gray-900">{user?.name}</b></span>
                    <button onClick={signOut} className="text-gray-400 hover:text-red-600 transition p-1"><LogOut className="w-5 h-5" /></button>
                </div>
            </header>

            <main className="flex-1 p-6 max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-4 gap-8">
                <aside className="lg:col-span-1 space-y-2">
                    <button
                        onClick={() => { setView('list'); resetForm(); }}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm transition-all ${view === 'list' ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-500 hover:bg-white'}`}
                    >
                        <Users className="w-5 h-5" /> GESTÃO DE USUÁRIOS
                    </button>
                    <button
                        onClick={() => { setView('create'); resetForm(); }}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm transition-all ${view === 'create' ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-500 hover:bg-white'}`}
                    >
                        <UserPlus className="w-5 h-5" /> NOVO CADASTRO
                    </button>
                </aside>

                <section className="lg:col-span-3 space-y-6">
                    {view === 'list' ? (
                        <>
                            {/* Search and Filters */}
                            <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col md:flex-row gap-4 items-center">
                                <div className="relative flex-1 w-full">
                                    <Search className="absolute left-4 top-3.5 w-4 h-4 text-gray-400" />
                                    <input
                                        type="text"
                                        placeholder="Buscar por nome ou e-mail..."
                                        value={searchQuery}
                                        onChange={e => setSearchQuery(e.target.value)}
                                        className="w-full pl-11 pr-4 py-3 bg-gray-50 border-transparent border rounded-xl focus:bg-white focus:border-blue-500 outline-none transition-all text-sm font-medium"
                                    />
                                </div>
                                <div className="flex items-center gap-2 bg-gray-50 p-1 rounded-xl w-full md:w-auto">
                                    <Filter className="w-4 h-4 text-gray-400 ml-3 hidden md:block" />
                                    <select
                                        value={roleFilter}
                                        onChange={e => setRoleFilter(e.target.value)}
                                        className="bg-transparent border-none outline-none text-xs font-bold text-gray-600 py-2.5 px-4 cursor-pointer"
                                    >
                                        <option value="">Todos Papéis</option>
                                        <option value="ADMIN">Administradores</option>
                                        <option value="SUPERVISOR">Supervisores</option>
                                        <option value="PROFESSIONAL">Profissionais</option>
                                    </select>
                                </div>
                            </div>

                            {/* Users Table */}
                            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                                <div className="p-6 border-b flex justify-between items-center bg-gray-50/30">
                                    <h2 className="text-lg font-black text-gray-800 uppercase tracking-widest">Base de Usuários</h2>
                                    <span className="text-[10px] bg-blue-100 text-blue-600 px-3 py-1 rounded-full font-black uppercase">{users.length} Encontrados</span>
                                </div>

                                <div className="overflow-x-auto">
                                    <table className="w-full text-left border-collapse">
                                        <thead>
                                            <tr className="bg-gray-50/50 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b">
                                                <th className="px-6 py-4">Usuário</th>
                                                <th className="px-6 py-4">Papel</th>
                                                <th className="px-6 py-4">Supervisor Atribuído</th>
                                                <th className="px-6 py-4 text-right">Ações</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-50 text-sm">
                                            {users.length === 0 ? (
                                                <tr>
                                                    <td colSpan={4} className="px-6 py-20 text-center text-gray-400 italic">
                                                        Nenhum usuário encontrado para estes filtros.
                                                    </td>
                                                </tr>
                                            ) : (
                                                users.map(u => (
                                                    <tr key={u.id} className="hover:bg-gray-50/30 transition-colors group">
                                                        <td className="px-6 py-5">
                                                            <div className="flex items-center gap-3">
                                                                <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 font-bold text-sm">
                                                                    {u.name.charAt(0)}
                                                                </div>
                                                                <div>
                                                                    <p className="font-bold text-gray-800">{u.name}</p>
                                                                    <p className="text-xs text-gray-400">{u.email}</p>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-5">
                                                            <span className={`px-2 py-1 rounded-lg text-[9px] font-black tracking-widest ${u.role === 'ADMIN' ? 'bg-red-100 text-red-600' :
                                                                u.role === 'SUPERVISOR' ? 'bg-purple-100 text-purple-600' :
                                                                    'bg-green-100 text-green-600'
                                                                }`}>
                                                                {u.role}
                                                            </span>
                                                        </td>
                                                        <td className="px-6 py-5 text-gray-500 font-bold text-xs uppercase italic">
                                                            {u.supervisor || '-'}
                                                        </td>
                                                        <td className="px-6 py-5 text-right">
                                                            <button
                                                                onClick={() => startEdit(u)}
                                                                className="p-2 text-gray-300 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                                                            >
                                                                <Edit2 className="w-4 h-4" />
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 max-w-2xl mx-auto lg:mx-0">
                            <div className="flex justify-between items-start mb-8">
                                <div>
                                    <h2 className="text-2xl font-black text-gray-900 mb-1">{view === 'create' ? 'Novo Cadastro' : 'Editar Usuário'}</h2>
                                    <p className="text-sm text-gray-500 font-medium">{view === 'create' ? 'Insira um novo membro na equipe.' : `Editando perfil de ${editingUser?.name}`}</p>
                                </div>
                                <button onClick={() => { setView('list'); resetForm(); }} className="p-2 text-gray-400 hover:bg-gray-100 rounded-full transition"><X className="w-5 h-5" /></button>
                            </div>

                            {error && <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded-lg mb-6 text-sm font-bold">{error}</div>}
                            {success && <div className="bg-green-50 border-l-4 border-green-500 text-green-700 p-4 rounded-lg mb-6 text-sm font-bold flex items-center gap-2"><CheckCircle className="w-4 h-4" /> Operação realizada com sucesso!</div>}

                            <form onSubmit={view === 'create' ? handleCreateUser : handleUpdateUser} className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Nome Completo</label>
                                        <input type="text" value={name} onChange={e => setName(e.target.value)} className="w-full px-4 py-3 bg-gray-50 border rounded-2xl outline-none focus:border-blue-500 transition-all font-medium" placeholder="Ex: Pedro Alvares" required />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">E-mail</label>
                                        <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full px-4 py-3 bg-gray-50 border rounded-2xl outline-none focus:border-blue-500 transition-all font-medium" placeholder="nome@empresa.com" required />
                                    </div>
                                </div>

                                <div className="space-y-1">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">{view === 'edit' ? 'Alterar Senha (opcional)' : 'Senha Inicial'}</label>
                                    <input type="password" value={password} onChange={e => setPassword(e.target.value)} className="w-full px-4 py-3 bg-gray-50 border rounded-2xl outline-none focus:border-blue-500 transition-all font-medium" placeholder="••••••••" required={view === 'create'} />
                                </div>

                                <div className="pt-2">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 mb-2 block">Papel no Sistema</label>
                                    <div className="grid grid-cols-2 gap-3 p-1 bg-gray-100 rounded-2xl">
                                        {['PROFESSIONAL', 'SUPERVISOR'].map(r => (
                                            <button key={r} type="button" onClick={() => setRole(r as any)} className={`py-2.5 rounded-xl text-[10px] font-black tracking-widest transition-all ${role === r ? 'bg-blue-600 text-white shadow-md' : 'text-gray-500'}`}>{r}</button>
                                        ))}
                                    </div>
                                </div>

                                {role === 'PROFESSIONAL' && (
                                    <div className="space-y-1 animate-in fade-in slide-in-from-top-2 duration-300">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Supervisor Responsável</label>
                                        <select value={supervisorId} onChange={e => setSupervisorId(e.target.value)} className="w-full px-4 py-3 bg-gray-50 border rounded-2xl outline-none focus:border-blue-500 transition-all font-bold text-gray-700 appearance-none" required>
                                            <option value="">Selecione um supervisor...</option>
                                            {supervisors.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                                        </select>
                                    </div>
                                )}

                                <button type="submit" disabled={loading} className={`w-full py-5 rounded-2xl font-black text-white shadow-xl active:scale-[0.98] transition-all ${loading ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700 shadow-blue-100'}`}>
                                    {loading ? 'PROCESSANDO...' : (view === 'create' ? 'CADASTRAR MEMBRO' : 'SALVAR ALTERAÇÕES')}
                                </button>
                            </form>
                        </div>
                    )}
                </section>
            </main>
        </div>
    );
}
