import { useState, useEffect } from 'react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { Badge } from '../../components/ui/Badge';
import { Input } from '../../components/ui/Input';
import { api } from '../../services/api';
import toast from 'react-hot-toast';
import { Building2, Plus, Edit2, Trash2 } from 'lucide-react';

interface Department {
    id: string;
    name: string;
    description?: string;
}

export function DepartmentManagement() {
    const [departments, setDepartments] = useState<Department[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
    const [editingDepartmentId, setEditingDepartmentId] = useState<string | null>(null);
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');

    const [page, setPage] = useState(1);
    const ITEMS_PER_PAGE = 7;

    useEffect(() => {
        fetchDepartments();
    }, []);

    const fetchDepartments = async () => {
        setLoading(true);
        try {
            const res = await api.get('/departments');
            setDepartments(res.data);
        } catch {
            toast.error('Erro ao carregar setores');
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
        setEditingDepartmentId(null);
        setName('');
        setDescription('');
        setModalMode('create');
    };

    const openCreateModal = () => {
        resetForm();
        setModalMode('create');
        setIsModalOpen(true);
    };

    const openEditModal = (dept: Department) => {
        resetForm();
        setModalMode('edit');
        setEditingDepartmentId(dept.id);
        setName(dept.name);
        setDescription(dept.description || '');
        setIsModalOpen(true);
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (modalMode === 'create') {
                await api.post('/departments', { name, description });
                toast.success('Setor criado com sucesso');
            } else {
                await api.patch(`/departments/${editingDepartmentId}`, { name, description });
                toast.success('Setor atualizado com sucesso');
            }
            setIsModalOpen(false);
            fetchDepartments();
        } catch (error) {
            const err = error as { response?: { data?: { error?: string } } };
            toast.error(err.response?.data?.error || 'Erro ao salvar setor');
        }
    };

    const handleDelete = async (id: string, name: string) => {
        if (window.confirm(`Tem certeza que deseja excluir o setor ${name}?`)) {
            try {
                await api.delete(`/departments/${id}`);
                toast.success('Setor excluído!');
                fetchDepartments();
            } catch {
                toast.error('Erro ao excluir setor');
            }
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center flex-col gap-4 items-center py-20">
                <div className="w-8 h-8 rounded-full border-4 border-blue-500 border-t-transparent animate-spin"></div>
            </div>
        );
    }

    const totalPages = Math.ceil(departments.length / ITEMS_PER_PAGE);
    const displayedDepartments = departments.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-black text-[var(--text-primary)] uppercase tracking-tight mb-1">
                        Departamentos e Setores
                    </h1>
                    <p className="text-xs text-[var(--text-secondary)] font-medium">Gerencie a estrutura organizacional da empresa</p>
                </div>
                <Button variant="primary" onClick={openCreateModal} className="shrink-0">
                    <Plus className="w-4 h-4 mr-2" /> Novo Departamento
                </Button>
            </div>

            <Card variant="white" className="overflow-hidden border-[var(--border-subtle)]">
                <div className="overflow-x-auto w-full">
                    <table className="w-full min-w-max text-left border-collapse">
                        <thead>
                            <tr className="bg-[var(--bg-tertiary)] text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-widest border-b border-[var(--border-subtle)]">
                                <th className="px-6 py-4">Nome do Setor</th>
                                <th className="px-6 py-4 text-right">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[var(--border-subtle)]">
                            {departments.length === 0 ? (
                                <tr>
                                    <td colSpan={2} className="px-6 py-12 text-center text-[var(--text-tertiary)]">
                                        Nenhum setor encontrado.
                                    </td>
                                </tr>
                            ) : (
                                displayedDepartments.map(d => (
                                    <tr key={d.id} className="table-row-hover group">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500">
                                                    <Building2 className="w-5 h-5" />
                                                </div>
                                                <div>
                                                    <p className="font-bold text-[var(--text-primary)] text-sm mb-0.5">{d.name}</p>
                                                    <Badge status="RESOLVED" label="ATIVO" />
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-1 opacity-60 group-hover:opacity-100 transition-opacity">
                                                <Button variant="ghost" size="sm" onClick={() => openEditModal(d)}>
                                                    <Edit2 className="w-4 h-4" />
                                                </Button>
                                                <Button variant="ghost" size="sm" onClick={() => handleDelete(d.id, d.name)} className="hover:text-red-600 hover:bg-red-50">
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
                            Mostrando {displayedDepartments.length} de {departments.length} setores
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
                title={modalMode === 'create' ? 'Novo Setor' : 'Editar Setor'}
            >
                <form onSubmit={handleSave} className="space-y-6 mt-4">
                    <Input
                        label="Nome do Setor"
                        value={name}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setName(e.target.value.toUpperCase())}
                        placeholder="EX: FINANCEIRO"
                        required
                    />
                    <div className="flex justify-end gap-3 pt-6">
                        <Button type="button" variant="secondary" onClick={() => setIsModalOpen(false)}>
                            Cancelar
                        </Button>
                        <Button type="submit" variant="primary">
                            Salvar
                        </Button>
                    </div>
                </form>
            </Modal>
        </div>
    );
}
