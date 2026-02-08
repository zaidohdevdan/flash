import React from 'react';
import { useTranslation } from 'react-i18next';
import { Modal, Button, TextArea } from '../../ui';

interface Department {
    id: string;
    name: string;
}

interface AnalysisModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    targetStatus: 'IN_REVIEW' | 'FORWARDED' | 'RESOLVED';
    setTargetStatus: (status: 'IN_REVIEW' | 'FORWARDED' | 'RESOLVED') => void;
    feedback: string;
    setFeedback: (feedback: string) => void;
    selectedDeptId: string;
    setSelectedDeptId: (id: string) => void;
    departments: Department[];
    title?: string;
}

export const AnalysisModal: React.FC<AnalysisModalProps> = ({
    isOpen,
    onClose,
    onConfirm,
    targetStatus,
    setTargetStatus,
    feedback,
    setFeedback,
    selectedDeptId,
    setSelectedDeptId,
    departments,
    title
}) => {
    const { t } = useTranslation();
    const modalTitle = title || t('dashboard.analysis.title');

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={modalTitle}
            subtitle={t('dashboard.analysisModal.subtitle')}
            maxWidth="lg"
            footer={
                <>
                    <Button variant="secondary" onClick={onClose}>
                        {t('dashboard.analysisModal.cancel')}
                    </Button>
                    <Button
                        variant={targetStatus === 'RESOLVED' ? 'success' : 'primary'}
                        onClick={onConfirm}
                    >
                        {targetStatus === 'RESOLVED'
                            ? t('dashboard.analysisModal.confirm.resolve')
                            : targetStatus === 'FORWARDED'
                                ? t('dashboard.analysisModal.confirm.forward')
                                : t('dashboard.analysisModal.confirm.update')}
                    </Button>
                </>
            }
        >
            <div className="space-y-6 py-2">
                <TextArea
                    label={t('dashboard.analysisModal.feedbackLabel')}
                    value={feedback}
                    onChange={e => setFeedback(e.target.value)}
                    placeholder={t('dashboard.analysisModal.feedbackPlaceholder')}
                    rows={5}
                />

                <div className="space-y-4">
                    <label className="text-[10px] font-black text-[var(--text-tertiary)] uppercase tracking-widest ml-1">{t('dashboard.analysisModal.nextStep')}</label>
                    <div className="flex items-center justify-between p-1 bg-[var(--bg-secondary)] rounded-2xl border border-[var(--border-subtle)]">
                        {[
                            { id: 'IN_REVIEW', label: t('dashboard.analysisModal.status.review'), color: 'text-blue-600' },
                            { id: 'FORWARDED', label: t('dashboard.analysisModal.status.department'), color: 'text-purple-600' },
                            { id: 'RESOLVED', label: t('dashboard.analysisModal.status.resolved'), color: 'text-emerald-600' }
                        ].map(opt => (
                            <button
                                type="button"
                                key={opt.id}
                                onClick={() => setTargetStatus(opt.id as AnalysisModalProps['targetStatus'])}
                                className={`flex-1 py-3 text-[9px] font-black tracking-widest rounded-xl transition-all ${targetStatus === opt.id ? 'bg-[var(--bg-primary)] shadow-xl ' + opt.color : 'text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]'}`}
                            >
                                {opt.label}
                            </button>
                        ))}
                    </div>

                    {targetStatus === 'FORWARDED' && (
                        <div className="space-y-4 animate-in slide-in-from-top-4 duration-500">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-[var(--text-tertiary)] uppercase tracking-widest ml-1">{t('dashboard.analysisModal.forwardTo')}</label>
                                <select
                                    value={selectedDeptId}
                                    onChange={e => setSelectedDeptId(e.target.value)}
                                    className="w-full px-5 py-3.5 bg-[var(--bg-secondary)] border border-[var(--border-subtle)] rounded-2xl outline-none focus:bg-[var(--bg-primary)] focus:border-[var(--accent-primary)] transition-all font-bold text-[var(--text-primary)] appearance-none text-xs"
                                    aria-label={t('dashboard.analysisModal.forwardTo')}
                                    title={t('dashboard.analysisModal.forwardTo')}
                                >
                                    <option value="">{t('dashboard.analysisModal.selectDest')}</option>
                                    {departments.map(d => (
                                        <option key={d.id} value={d.id}>{d.name}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </Modal>
    );
};
