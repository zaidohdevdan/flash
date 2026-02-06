import React, { useState } from 'react';
import { Modal } from '../../ui';
import { FileText, Download } from 'lucide-react';
import { Button } from '../../ui';
import type { Report, ReportStatus, Department } from '../../../types';
import { generateReportsPDF } from '../../../utils/pdfGenerator';

interface ExportReportsModalProps {
    isOpen: boolean;
    onClose: () => void;
    reports: Report[];
    departments: Department[];
}

export const ExportReportsModal: React.FC<ExportReportsModalProps> = ({
    isOpen,
    onClose,
    reports,
    departments
}) => {
    const [selectedStatus, setSelectedStatus] = useState<ReportStatus | 'ALL'>('ALL');
    const [selectedDept, setSelectedDept] = useState<string>('ALL');
    const [isGenerating, setIsGenerating] = useState(false);

    const handleExport = () => {
        setIsGenerating(true);

        setTimeout(() => {
            try {
                // Filtrar relatórios com base nas opções do modal
                let filtered = [...reports];

                if (selectedStatus !== 'ALL') {
                    filtered = filtered.filter(r => r.status === selectedStatus);
                }

                if (selectedDept !== 'ALL') {
                    filtered = filtered.filter(r => r.departmentId === selectedDept);
                }

                // Criar string de informação de filtro para o PDF
                const statusLabel = selectedStatus === 'ALL' ? 'Todos os Status' : selectedStatus;
                const deptLabel = selectedDept === 'ALL'
                    ? 'Todos os Departamentos'
                    : departments.find(d => d.id === selectedDept)?.name || 'Setor Desconhecido';

                const filterInfo = `Status: ${statusLabel} | Setor: ${deptLabel} | Total: ${filtered.length} ocorrências`;

                generateReportsPDF(filtered, filterInfo);
                onClose();
            } catch (error) {
                console.error("Erro ao gerar PDF:", error);
            } finally {
                setIsGenerating(false);
            }
        }, 1000);
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Exportar Relatórios">
            <div className="space-y-6">
                <div className="flex items-center gap-4 p-4 bg-blue-50/50 border border-blue-100 rounded-2xl">
                    <div className="p-3 bg-blue-600 rounded-xl text-white shadow-lg shadow-blue-200">
                        <FileText className="w-6 h-6" />
                    </div>
                    <div>
                        <h4 className="text-sm font-bold text-gray-900">Configuração do Documento</h4>
                        <p className="text-xs text-blue-600/80 font-medium">O PDF incluirá todos os dados operacionais visíveis no dashboard com base nos filtros abaixo.</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-700 uppercase tracking-widest ml-1">Filtrar por Status</label>
                        <select
                            value={selectedStatus}
                            onChange={(e) => setSelectedStatus(e.target.value as ReportStatus | 'ALL')}
                            className="w-full bg-gray-50/50 border border-gray-100 rounded-xl px-4 py-3 text-sm text-gray-900 focus:border-blue-500 focus:bg-white transition-all outline-none font-bold"
                            title="Filtrar por Status"
                            aria-label="Filtrar por Status"
                        >
                            <option value="ALL">Todos os status</option>
                            <option value="SENT">Enviado</option>
                            <option value="IN_REVIEW">Em Análise</option>
                            <option value="FORWARDED">Encaminhado</option>
                            <option value="RESOLVED">Resolvido</option>
                        </select>
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-700 uppercase tracking-widest ml-1">Filtrar por Setor</label>
                        <select
                            value={selectedDept}
                            onChange={(e) => setSelectedDept(e.target.value)}
                            className="w-full bg-gray-50/50 border border-gray-100 rounded-xl px-4 py-3 text-sm text-gray-900 focus:border-blue-500 focus:bg-white transition-all outline-none font-bold"
                            title="Filtrar por Setor"
                            aria-label="Filtrar por Setor"
                        >
                            <option value="ALL">Todos os setores</option>
                            {departments.map(dept => (
                                <option key={dept.id} value={dept.id}>{dept.name}</option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
                    <div className="text-xs text-gray-500 font-medium">
                        Total a exportar: <span className="text-gray-900 font-black">
                            {reports.filter(r =>
                                (selectedStatus === 'ALL' || r.status === selectedStatus) &&
                                (selectedDept === 'ALL' || r.departmentId === selectedDept)
                            ).length} reportes
                        </span>
                    </div>
                    <div className="flex gap-3">
                        <Button type="button" variant="ghost" onClick={onClose} disabled={isGenerating}>Cancelar</Button>
                        <Button
                            type="button"
                            variant="primary"
                            onClick={handleExport}
                            disabled={isGenerating}
                            className="!px-8"
                        >
                            {isGenerating ? (
                                <div className="flex items-center gap-2">
                                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    Gerando...
                                </div>
                            ) : (
                                <div className="flex items-center gap-2">
                                    <Download className="w-4 h-4" />
                                    Exportar PDF
                                </div>
                            )}
                        </Button>
                    </div>
                </div>
            </div>
        </Modal>
    );
};
