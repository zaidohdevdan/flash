import React from 'react';
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
    variant?: 'list' | 'grid' | 'minimal';
}

export const ReportFeed: React.FC<ReportFeedProps> = ({
    reports,
    hasMore,
    onLoadMore,
    renderReportActions,
    emptyMessage,
    isLoading = false,
    variant = 'list'
}) => {
    const displayMessage = emptyMessage || "Radar de Operações Limpo";

    return (
        <div className="flex-1 space-y-8 animate-in slide-in-from-bottom-5 duration-700">
            {reports.length === 0 && !isLoading ? (
                <Card className="p-32 flex flex-col items-center justify-center bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/5 rounded-[3rem] shadow-2xl backdrop-blur-md group">
                    <div className="mb-8 p-8 rounded-3xl bg-indigo-50 dark:bg-indigo-500/5 border border-indigo-100 dark:border-indigo-500/10 shadow-inner group-hover:scale-110 transition-transform duration-700">
                        <MessageSquare className="w-16 h-16 text-indigo-300 dark:text-slate-700 opacity-50 dark:opacity-20" />
                    </div>
                    <p className="font-black uppercase tracking-[0.4em] text-[12px] text-slate-400 dark:text-slate-600 text-center">{displayMessage}</p>
                </Card>
            ) : (
                <div className={(variant === 'grid' || variant === 'minimal') ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6" : "grid gap-8"}>
                    {reports.map(report => (
                        <ReportCard
                            key={report.id}
                            report={report}
                            showUser
                            actions={renderReportActions(report)}
                            variant={variant}
                        />
                    ))}
                </div>
            )}

            {hasMore && reports.length > 0 && (
                <div className="flex justify-center pt-12 pb-16">
                    <Button
                        variant="secondary"
                        size="lg"
                        onClick={onLoadMore}
                        className="bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-600 dark:bg-white/5 dark:hover:bg-white/10 dark:border-white/5 dark:text-slate-400 font-black uppercase tracking-[0.3em] h-16 px-16 !rounded-2xl transition-all shadow-xl dark:shadow-2xl hover:-translate-y-1"
                    >
                        Indexar Mais Registros
                    </Button>
                </div>
            )}
        </div>
    );
};
