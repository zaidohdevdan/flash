import { useState, useEffect, useRef } from 'react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { api } from '../../services/api';
import toast from 'react-hot-toast';
import { FolderArchive, Search, Clock, AlertTriangle, RotateCcw, Trash2, FileText, History, Upload } from 'lucide-react';
import { format } from 'date-fns';
import { Modal } from '../../components/ui/Modal';
import { ReportHistoryModal } from '../../components/domain/modals/ReportHistoryModal';

interface ArchivedReport {
    id: string;
    comment: string;
    status: string;
    createdAt: string;
    archivedAt: string;
    user: {
        name: string;
    };
    history: {
        status: string;
        createdAt: string;
        comment: string;
        userName: string;
        departmentName?: string;
    }[];
}

export function AdminAudit() {
    const [archivedReports, setArchivedReports] = useState<ArchivedReport[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isUploading, setIsUploading] = useState(false);

    const [page, setPage] = useState(1);
    const ITEMS_PER_PAGE = 7;

    // Modal states
    const [archivedReportSelected, setArchivedReportSelected] = useState<ArchivedReport | null>(null);
    const [isRestoreModalOpen, setIsRestoreModalOpen] = useState(false);
    const [isHardDeleteModalOpen, setIsHardDeleteModalOpen] = useState(false);
    const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
    const [isRestoring, setIsRestoring] = useState(false);
    const [isHardDeleting, setIsHardDeleting] = useState(false);
    const [isExportingId, setIsExportingId] = useState<string | null>(null);

    useEffect(() => {
        fetchArchivedReports();
    }, []);

    const fetchArchivedReports = async () => {
        setLoading(true);
        try {
            const res = await api.get('/admin/reports/archived');
            setArchivedReports(res.data);
        } catch {
            toast.error('Erro ao carregar arquivos');
        } finally {
            setLoading(false);
        }
    };

    const confirmRestoreArchived = async () => {
        if (!archivedReportSelected) return;
        setIsRestoring(true);
        try {
            await api.post(`/admin/reports/${archivedReportSelected.id}/restore`);
            toast.success(`Protocolo restaurado com sucesso!`);
            setArchivedReportSelected(null);
            setIsRestoreModalOpen(false);
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
            setIsHardDeleteModalOpen(false);
            fetchArchivedReports();
        } catch {
            toast.error('Erro ao excluir definitivamente o processo.');
        } finally {
            setIsHardDeleting(false);
        }
    };

    const handleRestoreClick = (report: ArchivedReport) => {
        setArchivedReportSelected(report);
        setIsRestoreModalOpen(true);
    };

    const handleHardDeleteClick = (report: ArchivedReport) => {
        setArchivedReportSelected(report);
        setIsHardDeleteModalOpen(true);
    };

    const handleHistoryClick = (report: ArchivedReport) => {
        setArchivedReportSelected(report);
        setIsHistoryModalOpen(true);
    };

    const handleExportBackup = async (report: ArchivedReport) => {
        const protocol = report.id.slice(-6).toUpperCase();
        setIsExportingId(report.id);

        try {
            const res = await api.get(`/admin/reports/protocol/${protocol}/export`, {
                responseType: 'blob'
            });

            // Cria um link temporário para baixar o PDF gerado pelo backend
            const url = window.URL.createObjectURL(new Blob([res.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `backup_arquivado_${protocol}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.parentNode?.removeChild(link);

            toast.success(`Backup do protocolo ${protocol} gerado com sucesso!`);
        } catch {
            toast.error('Erro ao gerar o backup PDF do documento.');
        } finally {
            setIsExportingId(null);
        }
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('file', file);

        setIsUploading(true);
        try {
            await api.post('/admin/reports/import', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            toast.success('Backup importado com sucesso!');
            fetchArchivedReports();
        } catch {
            toast.error('Erro ao importar o backup. Verifique o arquivo.');
        } finally {
            setIsUploading(false);
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    };

    const filteredReports = archivedReports.filter(r =>
        r.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.user?.name?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const totalPages = Math.ceil(filteredReports.length / ITEMS_PER_PAGE);
    const displayedReports = filteredReports.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

    if (loading) {
        return (
            <div className="flex justify-center flex-col gap-4 items-center py-20">
                <div className="w-8 h-8 rounded-full border-4 border-amber-500 border-t-transparent animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-black text-[var(--text-primary)] uppercase tracking-tight mb-1 flex items-center gap-3">
                        <FolderArchive className="w-8 h-8 text-amber-500" /> Auditoria e Arquivos
                    </h1>
                    <p className="text-xs text-[var(--text-secondary)] font-medium">Registro de relatórios arquivados ou removidos temporariamente</p>
                </div>
                <div className="flex gap-2">
                    <input
                        accept=".pdf"
                        title='Selecione um arquivo PDF'
                        type="file"
                        ref={fileInputRef}
                        className="hidden"
                        onChange={handleFileUpload}
                    />
                    <Button variant="primary" className="bg-amber-500 hover:bg-amber-600 border-none text-white" onClick={() => fileInputRef.current?.click()} isLoading={isUploading}>
                        <Upload className="w-4 h-4 mr-2" /> Importar Backup
                    </Button>
                    <Button variant="secondary" onClick={fetchArchivedReports}>
                        Atualizar Registros
                    </Button>
                </div>
            </div>

            <Card variant="white" className="p-4 flex flex-col md:flex-row gap-4 items-center border-[var(--border-subtle)]">
                <div className="relative flex-1 w-full">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-tertiary)]" />
                    <input
                        type="text"
                        placeholder="Buscar por Protocolo, Autor ou Responsável..."
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 bg-[var(--bg-tertiary)] border-transparent border rounded-xl focus:bg-[var(--bg-primary)] focus:border-[var(--accent-primary)] outline-none transition-all text-sm font-medium text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)]"
                    />
                </div>
            </Card>

            <Card variant="white" className="overflow-hidden border-[var(--border-subtle)]">
                <div className="overflow-x-auto w-full">
                    <table className="w-full min-w-max text-left border-collapse">
                        <thead>
                            <tr className="bg-[var(--bg-tertiary)] text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-widest border-b border-[var(--border-subtle)]">
                                <th className="px-6 py-4">Protocolo / Data</th>
                                <th className="px-6 py-4">Autor Original</th>
                                <th className="px-6 py-4">Arquivado Por</th>
                                <th className="px-6 py-4 text-right">Ações de Auditoria</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[var(--border-subtle)]">
                            {filteredReports.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="px-6 py-24 text-center text-[var(--text-tertiary)]">
                                        <FolderArchive className="w-12 h-12 mx-auto mb-4 opacity-20" />
                                        <p className="text-xs font-bold uppercase tracking-widest text-[var(--text-secondary)]">O arquivo morto está vazio</p>
                                    </td>
                                </tr>
                            ) : (
                                displayedReports.map(report => (
                                    <tr key={report.id} className="hover:bg-[var(--bg-tertiary)]/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col gap-1">
                                                <span className="font-mono text-sm font-black text-[var(--text-primary)]">
                                                    #{report.id.slice(-6).toUpperCase()}
                                                </span>
                                                <div className="flex items-center gap-1.5 text-[10px] font-bold text-[var(--text-tertiary)] uppercase tracking-wider">
                                                    <Clock className="w-3 h-3" />
                                                    {format(new Date(report.createdAt), "dd/MM/yy")} (Criado)
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col gap-1">
                                                <span className="font-bold text-sm text-[var(--text-primary)] flex items-center gap-2">
                                                    {report.user?.name || 'Autor Desconhecido'}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col gap-1">
                                                <span className="font-bold text-sm text-amber-600 flex items-center gap-2">
                                                    Sistema
                                                </span>
                                                <span className="text-[10px] font-bold uppercase text-[var(--text-tertiary)] tracking-wider">
                                                    Restrito
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2 outline-none">
                                                <Button size="sm" variant="ghost" onClick={() => handleHistoryClick(report)} className="text-blue-500 hover:bg-blue-50 hover:text-blue-600 px-3">
                                                    <History className="w-4 h-4 mr-1.5" /> Detalhes
                                                </Button>
                                                <Button size="sm" variant="ghost" isLoading={isExportingId === report.id} onClick={() => handleExportBackup(report)} className="text-gray-600 hover:bg-gray-100 hover:text-gray-800 px-3">
                                                    <FileText className="w-4 h-4 mr-1.5" /> Backup
                                                </Button>
                                                <Button size="sm" variant="secondary" onClick={() => handleRestoreClick(report)} className="bg-emerald-50 text-emerald-600 hover:bg-emerald-100 border-none px-3">
                                                    <RotateCcw className="w-4 h-4" />
                                                </Button>
                                                <Button size="sm" variant="ghost" onClick={() => handleHardDeleteClick(report)} className="text-red-500 hover:bg-red-50 hover:text-red-600">
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
                            Mostrando {displayedReports.length} de {filteredReports.length} arquivos
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

            {/* Modals for Audit Actions */}
            <Modal
                isOpen={isRestoreModalOpen}
                onClose={() => setIsRestoreModalOpen(false)}
                title="Restaurar Processo"
                maxWidth="md"
            >
                <div className="space-y-4 pt-4">
                    <p className="text-sm text-[var(--text-secondary)]">
                        Você está prestes a restaurar o processo <strong>#{archivedReportSelected?.id.slice(-6).toUpperCase()}</strong>.
                        Ele retornará para a lista de relatórios ativos visível pelo autor original e supervisão.
                    </p>
                    <div className="flex justify-end gap-3 pt-4 border-t border-[var(--border-subtle)]">
                        <Button variant="secondary" onClick={() => setIsRestoreModalOpen(false)}>Cancelar</Button>
                        <Button variant="primary" isLoading={isRestoring} onClick={confirmRestoreArchived}>
                            Confirmar Restauração
                        </Button>
                    </div>
                </div>
            </Modal>

            <Modal
                isOpen={isHardDeleteModalOpen}
                onClose={() => setIsHardDeleteModalOpen(false)}
                title="Atenção: Destruição Permanente"
                maxWidth="md"
            >
                <div className="space-y-4 pt-4">
                    <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
                        <div className="flex items-center gap-3 mb-2">
                            <AlertTriangle className="w-5 h-5 text-red-600" />
                            <h3 className="font-bold text-red-600">Ação Irreversível</h3>
                        </div>
                        <p className="text-sm text-red-600/80">
                            A exclusão definitiva apaga o documento <strong>#{archivedReportSelected?.id.slice(-6).toUpperCase()}</strong> dos bancos de dados do Flash permanentemente. Nenhum log de recuperação ficará disponível.
                        </p>
                    </div>
                    <div className="flex justify-end gap-3 pt-4 border-t border-[var(--border-subtle)]">
                        <Button variant="secondary" onClick={() => setIsHardDeleteModalOpen(false)}>Cancelar</Button>
                        <Button variant="primary" className="bg-red-600 hover:bg-red-700 text-white border-0" isLoading={isHardDeleting} onClick={confirmHardDeleteArchived}>
                            Destruir Processo
                        </Button>
                    </div>
                </div>
            </Modal>

            <ReportHistoryModal
                isOpen={isHistoryModalOpen}
                onClose={() => setIsHistoryModalOpen(false)}
                report={archivedReportSelected as unknown as Parameters<typeof ReportHistoryModal>[0]['report']}
            />
        </div>
    );
}
