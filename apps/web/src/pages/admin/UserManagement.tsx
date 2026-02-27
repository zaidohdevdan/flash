import { useState, useEffect } from 'react';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Modal } from '../../components/ui/Modal';
import { api } from '../../services/api';
import toast from 'react-hot-toast';
import { Users, Search, Filter, Shield, Edit2, Trash2, UserPlus } from 'lucide-react';

interface User {
    id: string;
    name: string;
    email: string;
    role: string;
    departmentName?: string;
    supervisor?: string;
}

interface Supervisor {
    id: string;
    name: string;
}

interface Department {
    id: string;
    name: string;
}

export function UserManagement() {
    const [users, setUsers] = useState<User[]>([]);
    const [supervisors, setSupervisors] = useState<Supervisor[]>([]);
    const [departments, setDepartments] = useState<Department[]>([]);
    const [loading, setLoading] = useState(true);

    const [searchQuery, setSearchQuery] = useState('');
    const [roleFilter, setRoleFilter] = useState('');

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');

    const [page, setPage] = useState(1);
    const ITEMS_PER_PAGE = 7;

    // Form State
    const [editingUserId, setEditingUserId] = useState<string | null>(null);
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState<'PROFESSIONAL' | 'SUPERVISOR' | 'MANAGER' | 'ADMIN'>('PROFESSIONAL');
    const [supervisorId, setSupervisorId] = useState('');
    const [departmentId, setDepartmentId] = useState('');
    const [newSupervisorName, setNewSupervisorName] = useState('');
    const [newSupervisorEmail, setNewSupervisorEmail] = useState('');
    const [newDepartmentName, setNewDepartmentName] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);


    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [usersRes, supervisorsRes, deptsRes] = await Promise.all([
                api.get('/users'),
                api.get('/supervisors'),
                api.get('/departments')
            ]);
            setUsers(usersRes.data);
            setSupervisors(supervisorsRes.data);
            setDepartments(deptsRes.data);
        } catch {
            toast.error('Erro ao carregar dados dos usuários');
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
        setEditingUserId(null);
        setName('');
        setEmail('');
        setPassword('');
        setRole('PROFESSIONAL');
        setSupervisorId('');
        setDepartmentId('');
        setNewSupervisorName('');
        setNewSupervisorEmail('');
        setNewDepartmentName('');
        setModalMode('create');
    };

    const openCreateModal = () => {
        resetForm();
        setModalMode('create');
        setIsModalOpen(true);
    };

    const openEditModal = (user: User) => {
        resetForm();
        setModalMode('edit');
        setEditingUserId(user.id);
        setName(user.name);
        setEmail(user.email);
        setRole(user.role as 'PROFESSIONAL' | 'SUPERVISOR' | 'MANAGER' | 'ADMIN');
        setIsModalOpen(true);
    };

    const handleProcessUser = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsProcessing(true);

        try {
            const payload = {
                name,
                email,
                password: password || undefined,
                role,
                supervisorId: supervisorId || undefined,
                departmentId: departmentId || undefined,
                newSupervisorName: newSupervisorName || undefined,
                newSupervisorEmail: newSupervisorEmail || undefined,
                newDepartmentName: newDepartmentName || undefined,
            };

            if (modalMode === 'create') {
                await api.post('/register', payload);
                toast.success('Usuário criado com sucesso!');
            } else {
                await api.put(`/users/${editingUserId}`, payload);
                toast.success('Usuário atualizado com sucesso!');
            }

            setIsModalOpen(false);
            fetchData();
        } catch (error) {
            const err = error as { response?: { data?: { error?: string } } };
            toast.error(err.response?.data?.error || 'Erro ao salvar usuário');
        } finally {
            setIsProcessing(false);
        }
    };

    const handleDeleteUser = async (id: string, userName: string) => {
        if (window.confirm(`Tem certeza que deseja excluir o usuário ${userName}?`)) {
            try {
                await api.delete(`/users/${id}`);
                toast.success('Usuário excluído!');
                fetchData();
            } catch {
                toast.error('Erro ao excluir usuário');
            }
        }
    };

    const filteredUsers = users.filter(u => {
        const matchesSearch = u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            u.email.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesRole = roleFilter ? u.role === roleFilter : true;
        return matchesSearch && matchesRole;
    });

    const totalPages = Math.ceil(filteredUsers.length / ITEMS_PER_PAGE);
    const displayedUsers = filteredUsers.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

    if (loading) {
        return (
            <div className="flex justify-center items-center py-20">
                <div className="w-8 h-8 rounded-full border-4 border-blue-500 border-t-transparent animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-black text-[var(--text-primary)] uppercase tracking-tight mb-1">
                        Gestão de Usuários
                    </h1>
                    <p className="text-xs text-[var(--text-secondary)] font-medium">Controle de acessos e hierarquia corporativa</p>
                </div>
                <Button variant="primary" onClick={openCreateModal} className="shrink-0">
                    <UserPlus className="w-4 h-4 mr-2" /> Novo Cadastro
                </Button>
            </div>

            <Card variant="white" className="p-3 flex flex-col md:flex-row gap-4 items-center border-[var(--border-subtle)]">
                <div className="relative flex-1 w-full">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-tertiary)]" />
                    <input
                        type="text"
                        placeholder="Buscar usuários..."
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 bg-[var(--bg-tertiary)] border-transparent border rounded-xl focus:bg-[var(--bg-primary)] focus:border-[var(--accent-primary)] outline-none transition-all text-sm font-medium text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)]"
                    />
                </div>
                <div className="flex items-center gap-2 bg-[var(--bg-tertiary)] p-1.5 rounded-xl w-full md:w-auto border border-[var(--border-subtle)]">
                    <Filter className="w-4 h-4 text-[var(--text-tertiary)] ml-2 hidden md:block" />
                    <select
                        title="Filtrar por Papel"
                        value={roleFilter}
                        onChange={e => setRoleFilter(e.target.value)}
                        className="bg-transparent border-none outline-none text-xs font-bold text-[var(--text-secondary)] py-2 px-4 cursor-pointer uppercase tracking-wide w-full md:w-auto"
                    >
                        <option value="">Todos os Papéis</option>
                        <option value="ADMIN">Admins</option>
                        <option value="SUPERVISOR">Supervisores</option>
                        <option value="MANAGER">Gestores</option>
                        <option value="PROFESSIONAL">Profissionais</option>
                    </select>
                </div>
            </Card>

            <Card variant="white" className="overflow-hidden border-[var(--border-subtle)]">
                <div className="overflow-x-auto w-full">
                    <table className="w-full min-w-max text-left border-collapse">
                        <thead>
                            <tr className="bg-[var(--bg-tertiary)] text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-widest border-b border-[var(--border-subtle)]">
                                <th className="px-6 py-4">Usuário / Identidade</th>
                                <th className="px-6 py-4">Nível / Papel</th>
                                <th className="px-6 py-4">Supervisão / Dep</th>
                                <th className="px-6 py-4 text-right">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[var(--border-subtle)]">
                            {filteredUsers.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="px-6 py-24 text-center text-[var(--text-tertiary)]">
                                        <Users className="w-12 h-12 mx-auto mb-4 opacity-20" />
                                        <p className="text-xs font-bold uppercase tracking-widest">Nenhum usuário encontrado</p>
                                    </td>
                                </tr>
                            ) : (
                                displayedUsers.map(u => (
                                    <tr key={u.id} className="table-row-hover group">
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
                                            <div className="flex items-center justify-end gap-1 opacity-60 group-hover:opacity-100 transition-opacity">
                                                <Button variant="ghost" size="sm" onClick={() => openEditModal(u)}>
                                                    <Edit2 className="w-4 h-4" />
                                                </Button>
                                                <Button variant="ghost" size="sm" onClick={() => handleDeleteUser(u.id, u.name)} className="hover:text-red-600 hover:bg-red-50">
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

                {/* Pagination Controls */}
                {totalPages > 1 && (
                    <div className="flex items-center justify-between p-4 border-t border-[var(--border-subtle)]">
                        <p className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider">
                            Mostrando {displayedUsers.length} de {filteredUsers.length} usuários
                        </p>
                        <div className="flex items-center gap-2">
                            <Button
                                variant="secondary"
                                onClick={() => setPage(p => Math.max(1, p - 1))}
                                disabled={page === 1}
                            >
                                Anterior
                            </Button>
                            <span className="text-sm font-bold text-[var(--text-primary)] px-4">
                                Página {page} de {totalPages}
                            </span>
                            <Button
                                variant="secondary"
                                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                disabled={page === totalPages}
                            >
                                Próxima
                            </Button>
                        </div>
                    </div>
                )}
            </Card>

            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={modalMode === 'create' ? 'Novo Usuário' : 'Editar Usuário'}
                maxWidth="4xl"
            >
                <form onSubmit={handleProcessUser} className="space-y-6 mt-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Input
                            label="Nome Operacional"
                            value={name}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setName(e.target.value.toUpperCase())}
                            placeholder="EX: PEDRO SILVA"
                            required
                        />
                        <Input
                            label="E-mail de Acesso"
                            type="email"
                            value={email}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
                            placeholder="nome@empresa.com"
                            required
                        />
                    </div>

                    <Input
                        label={modalMode === 'edit' ? 'Redefinir Senha (opcional)' : 'Senha de Acesso'}
                        type="password"
                        value={password}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        required={modalMode === 'create'}
                    />

                    <div className="space-y-2">
                        <label className="text-xs font-bold text-[var(--text-secondary)] ml-1">Nível de Hierarquia</label>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 p-1 bg-[var(--bg-tertiary)] border border-[var(--border-medium)] rounded-xl">
                            {['PROFESSIONAL', 'SUPERVISOR', 'MANAGER', 'ADMIN'].map(r => (
                                <button
                                    key={r}
                                    type="button"
                                    onClick={() => setRole(r as 'PROFESSIONAL' | 'SUPERVISOR' | 'MANAGER' | 'ADMIN')}
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
                            <label className="text-xs font-bold text-[var(--text-secondary)] ml-1">Vincular Supervisor Existent</label>
                            <div className="relative">
                                <select
                                    title="Selecionar Supervisor"
                                    value={supervisorId}
                                    onChange={e => setSupervisorId(e.target.value)}
                                    className="w-full px-4 py-3 bg-[var(--bg-primary)] border border-[var(--border-medium)] rounded-xl outline-none focus:ring-2 focus:ring-[var(--border-subtle)] focus:border-[var(--text-primary)] transition-all font-medium text-[var(--text-primary)] text-sm appearance-none"
                                >
                                    <option value="">-- Selecione --</option>
                                    {supervisors.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                                </select>
                            </div>
                            {modalMode === 'create' && (
                                <div className="pt-4 mt-4 border-t border-[var(--border-subtle)] space-y-4">
                                    <p className="text-[10px] font-black uppercase tracking-widest text-[var(--accent-primary)] mb-2">Ou criar novo supervisor:</p>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <Input
                                            label="Nome"
                                            value={newSupervisorName}
                                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewSupervisorName(e.target.value.toUpperCase())}
                                        />
                                        <Input
                                            label="E-mail"
                                            type="email"
                                            value={newSupervisorEmail}
                                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewSupervisorEmail(e.target.value)}
                                        />
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {role === 'MANAGER' && (
                        <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-[var(--text-secondary)] ml-1">Vincular Departamento</label>
                                <select
                                    title="Selecionar Departamento"
                                    value={departmentId}
                                    onChange={e => setDepartmentId(e.target.value)}
                                    className="w-full px-4 py-3 bg-[var(--bg-primary)] border border-[var(--border-medium)] rounded-xl outline-none focus:ring-2 focus:ring-[var(--border-subtle)] focus:border-[var(--text-primary)] transition-all font-medium text-[var(--text-primary)] text-sm appearance-none"
                                >
                                    <option value="">-- Selecione --</option>
                                    {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                                </select>
                            </div>
                            <Input
                                label="Ou criar novo setor:"
                                value={newDepartmentName}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewDepartmentName(e.target.value.toUpperCase())}
                            />
                        </div>
                    )}

                    <div className="flex justify-end gap-3 pt-6 border-t border-[var(--border-subtle)]">
                        <Button type="button" variant="secondary" onClick={() => setIsModalOpen(false)}>
                            Cancelar
                        </Button>
                        <Button type="submit" variant="primary" isLoading={isProcessing}>
                            {modalMode === 'create' ? 'Concluir Cadastro' : 'Salvar Alterações'}
                        </Button>
                    </div>
                </form>
            </Modal>
        </div>
    );
}
