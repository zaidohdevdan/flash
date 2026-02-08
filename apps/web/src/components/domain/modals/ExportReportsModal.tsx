import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
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
    const { t } = useTranslation();
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
                const statusLabel = selectedStatus === 'ALL'
                    ? t('dashboard.exportModal.allStatus')
                    : t(`dashboard.exportModal.status.${selectedStatus}`);

                const deptLabel = selectedDept === 'ALL'
                    ? t('dashboard.exportModal.allSectors')
                    : departments.find(d => d.id === selectedDept)?.name || t('dashboard.exportModal.unknownSector');

                const filterInfo = `${t('dashboard.exportModal.filterStatus')}: ${statusLabel} | ${t('dashboard.exportModal.filterSector')}: ${deptLabel} | ${t('dashboard.exportModal.total')} ${filtered.length}`;

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
        <Modal isOpen={isOpen} onClose={onClose} title={t('dashboard.exportModal.title')}>
            <div className="space-y-6">
                <div className="flex items-center gap-4 p-4 bg-blue-50/50 border border-blue-100 rounded-2xl">
                    <div className="p-3 bg-blue-600 rounded-xl text-white shadow-lg shadow-blue-200">
                        <FileText className="w-6 h-6" />
                    </div>
                    <div>
                        <h4 className="text-sm font-bold text-gray-900">{t('dashboard.exportModal.configTitle')}</h4>
                        <p className="text-xs text-blue-600/80 font-medium">{t('dashboard.exportModal.configDesc')}</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-700 uppercase tracking-widest ml-1">{t('dashboard.exportModal.filterStatus')}</label>
                        <select
                            value={selectedStatus}
                            onChange={(e) => setSelectedStatus(e.target.value as ReportStatus | 'ALL')}
                            className="w-full bg-gray-50/50 border border-gray-100 rounded-xl px-4 py-3 text-sm text-gray-900 focus:border-blue-500 focus:bg-white transition-all outline-none font-bold"
                            title={t('dashboard.exportModal.filterStatus')}
                            aria-label={t('dashboard.exportModal.filterStatus')}
                        >
                            <option value="ALL">{t('dashboard.exportModal.allStatus')}</option>
                            <option value="SENT">{t('dashboard.exportModal.status.SENT')}</option>
                            <option value="IN_REVIEW">{t('dashboard.exportModal.status.IN_REVIEW')}</option>
                            <option value="FORWARDED">{t('dashboard.exportModal.status.FORWARDED')}</option>
                            <option value="RESOLVED">{t('dashboard.exportModal.status.RESOLVED')}</option>
                        </select>
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-700 uppercase tracking-widest ml-1">{t('dashboard.exportModal.filterSector')}</label>
                        <select
                            value={selectedDept}
                            onChange={(e) => setSelectedDept(e.target.value)}
                            className="w-full bg-gray-50/50 border border-gray-100 rounded-xl px-4 py-3 text-sm text-gray-900 focus:border-blue-500 focus:bg-white transition-all outline-none font-bold"
                            title={t('dashboard.exportModal.filterSector')}
                            aria-label={t('dashboard.exportModal.filterSector')}
                        >
                            <option value="ALL">{t('dashboard.exportModal.allSectors')}</option>
                            {departments.map(dept => (
                                <option key={dept.id} value={dept.id}>{dept.name}</option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
                    <div className="text-xs text-gray-500 font-medium">
                        {t('dashboard.exportModal.total')} <span className="text-gray-900 font-black">
                            {reports.filter(r =>
                                (selectedStatus === 'ALL' || r.status === selectedStatus) &&
                                (selectedDept === 'ALL' || r.departmentId === selectedDept)
                            ).length} {t('dashboard.exportModal.reports')}
                        </span>
                    </div>
                    <div className="flex gap-3">
                        <Button type="button" variant="ghost" onClick={onClose} disabled={isGenerating}>{t('dashboard.exportModal.cancel')}</Button>
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
                                    {t('dashboard.exportModal.generating')}
                                </div>
                            ) : (
                                <div className="flex items-center gap-2">
                                    <Download className="w-4 h-4" />
                                    {t('dashboard.exportModal.export')}
                                </div>
                            )}
                        </Button>
                    </div>
                </div>
            </div>
        </Modal>
    );
};
