import React from 'react';
import { useTranslation } from 'react-i18next';
import { MessageSquare } from 'lucide-react';
import { Card, Button } from '../ui';
import { ReportCard } from './ReportCard';

import type { Report } from '../../types';

interface ReportFeedProps {
    reports: Report[];
    searchTerm: string;
    onSearchChange: (val: string) => void;
    hasMore: boolean;
    onLoadMore: () => void;
    renderReportActions: (report: Report) => React.ReactNode;
    emptyMessage?: string;
    isLoading?: boolean;
}

export const ReportFeed: React.FC<ReportFeedProps> = ({
    reports,
    hasMore,
    onLoadMore,
    renderReportActions,
    emptyMessage,
    isLoading = false
}) => {
    const { t } = useTranslation();
    const displayMessage = emptyMessage || t('dashboard.feed.emptyMsg');

    return (
        <div className="flex-1 space-y-6">
            {/* Busca interna removida para evitar duplicidade com a busca global do Dashboard */}

            {reports.length === 0 && !isLoading ? (
                <Card variant="glass" className="p-20 flex flex-col items-center justify-center text-gray-400">
                    <MessageSquare className="w-12 h-12 mb-4 opacity-20" />
                    <p className="font-bold uppercase tracking-widest text-[10px] text-gray-600">{displayMessage}</p>
                </Card>
            ) : (
                <div className="grid gap-6">
                    {reports.map(report => (
                        <ReportCard
                            key={report.id}
                            report={report}
                            showUser
                            actions={renderReportActions(report)}
                        />
                    ))}
                </div>
            )}

            {hasMore && reports.length > 0 && (
                <div className="flex justify-center pt-8">
                    <Button variant="secondary" size="lg" onClick={onLoadMore} className="bg-white px-10">
                        {t('dashboard.actions.loadMore')}
                    </Button>
                </div>
            )}
        </div>
    );
};
