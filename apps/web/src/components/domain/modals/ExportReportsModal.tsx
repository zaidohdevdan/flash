import React, { useState } from 'react';
import { Modal } from '../../ui';
import { FileText, Download, X } from 'lucide-react';
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
                const statusMap: Record<string, string> = {
                    ALL: 'Todos os Status',
                    SENT: 'Enviado',
                    IN_REVIEW: 'Em Análise',
                    FORWARDED: 'Encaminhado',
                    RESOLVED: 'Resolvido'
                };

                const statusLabel = statusMap[selectedStatus] || selectedStatus;

                const deptLabel = selectedDept === 'ALL'
                    ? 'Todos os Setores'
                    : departments.find(d => d.id === selectedDept)?.name || 'Setor Desconhecido';

                const filterInfo = `Status: ${statusLabel} | Setor: ${deptLabel} | Total: ${filtered.length}`;

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
        <Modal isOpen={isOpen} onClose={onClose} title="Central de Exportação" maxWidth="xl">
            <div className="space-y-8 py-2">
                <div className="flex items-center gap-5 p-6 bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/5 rounded-[2rem] backdrop-blur-md shadow-inner">
                    <div className="p-4 bg-indigo-50 dark:bg-indigo-500/10 rounded-2xl border border-indigo-200 dark:border-indigo-500/20 shadow-xl">
                        <FileText className="w-6 h-6 text-indigo-500 dark:text-indigo-400" />
                    </div>
                    <div>
                        <h4 className="text-xs font-black text-slate-800 dark:text-white uppercase tracking-widest">Protocolos de Extração</h4>
                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-tight mt-1">Configure o filtro para indexação tática.</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] ml-1">STATUS OPERACIONAL</label>
                        <div className="relative group/select">
                            <select
                                value={selectedStatus}
                                onChange={(e) => setSelectedStatus(e.target.value as ReportStatus | 'ALL')}
                                className="w-full bg-white dark:bg-black/40 border border-slate-200 dark:border-white/5 rounded-2xl px-6 py-4 text-[11px] font-black text-slate-800 dark:text-white uppercase tracking-widest outline-none focus:border-indigo-500/50 transition-all appearance-none backdrop-blur-md shadow-inner"
                                title="Filtrar por Status"
                                aria-label="Filtrar por Status"
                            >
                                <option value="ALL" className="bg-white dark:bg-[#020617]">TODOS OS STATUS</option>
                                <option value="SENT" className="bg-white dark:bg-[#020617]">ENVIADO</option>
                                <option value="IN_REVIEW" className="bg-white dark:bg-[#020617]">EM ANÁLISE</option>
                                <option value="FORWARDED" className="bg-white dark:bg-[#020617]">ENCAMINHADO</option>
                                <option value="RESOLVED" className="bg-white dark:bg-[#020617]">RESOLVIDO</option>
                            </select>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] ml-1">SETOR DE ORIGEM</label>
                        <div className="relative group/select">
                            <select
                                value={selectedDept}
                                onChange={(e) => setSelectedDept(e.target.value)}
                                className="w-full bg-white dark:bg-black/40 border border-slate-200 dark:border-white/5 rounded-2xl px-6 py-4 text-[11px] font-black text-slate-800 dark:text-white uppercase tracking-widest outline-none focus:border-indigo-500/50 transition-all appearance-none backdrop-blur-md shadow-inner"
                                title="Filtrar por Setor"
                                aria-label="Filtrar por Setor"
                            >
                                <option value="ALL" className="bg-white dark:bg-[#020617]">TODOS OS SETORES</option>
                                {departments.map(dept => (
                                    <option key={dept.id} value={dept.id} className="bg-white dark:bg-[#020617]">{dept.name.toUpperCase()}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>

                <div className="pt-8 border-t border-slate-200 dark:border-white/5 flex flex-col sm:flex-row items-center justify-between gap-6">
                    <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest bg-slate-100 dark:bg-white/5 px-4 py-2 rounded-full border border-slate-200 dark:border-white/5">
                        TOTAL INDEXADO: <span className="text-slate-800 dark:text-white ml-1">
                            {reports.filter(r =>
                                (selectedStatus === 'ALL' || r.status === selectedStatus) &&
                                (selectedDept === 'ALL' || r.departmentId === selectedDept)
                            ).length} REGISTROS
                        </span>
                    </div>
                    <div className="flex items-center justify-end gap-3 w-full sm:w-auto mt-4 sm:mt-0">
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={onClose}
                            disabled={isGenerating}
                            title="Abortar Exportação"
                            className="flex items-center justify-center w-12 h-12 text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-white/5 hover:bg-rose-100 dark:hover:bg-rose-500/10 hover:text-rose-600 dark:hover:text-rose-400 rounded-xl transition-all p-0 flex-shrink-0"
                        >
                            <X className="w-5 h-5" />
                        </Button>
                        <Button
                            type="button"
                            variant="primary"
                            onClick={handleExport}
                            disabled={isGenerating}
                            title="Extrair PDF"
                            className="flex items-center justify-center w-12 h-12 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl shadow-xl shadow-indigo-600/20 transition-all p-0 flex-shrink-0"
                        >
                            {isGenerating ? (
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                <Download className="w-5 h-5" />
                            )}
                        </Button>
                    </div>
                </div>
            </div>
        </Modal>
    );
};
