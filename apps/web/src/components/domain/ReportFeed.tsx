import React from 'react';
import { Search, MessageSquare } from 'lucide-react';
import { Card, Button } from '../ui';
import { ReportCard } from './ReportCard';

interface Report {
    id: string;
    imageUrl: string;
    comment: string;
    status: string;
    createdAt: string;
    user?: {
        name: string;
        avatarUrl?: string | null;
    };
    department?: { name: string };
    history?: any[];
}

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
    searchTerm,
    onSearchChange,
    hasMore,
    onLoadMore,
    renderReportActions,
    emptyMessage = "Nenhum reporte encontrado",
    isLoading = false
}) => {
    return (
        <div className="flex-1 space-y-6">
            <Card variant="glass" className="p-4 border-white/10 !rounded-[2rem]">
                <div className="relative group">
                    <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-400 opacity-60 group-focus-within:opacity-100 transition-opacity" />
                    <input
                        type="text"
                        placeholder="Buscar por protocolo (#000000) ou palavras-chave..."
                        value={searchTerm}
                        onChange={e => onSearchChange(e.target.value)}
                        className="w-full pl-14 pr-8 py-4 bg-white/5 border border-white/5 rounded-3xl outline-none focus:bg-white/10 focus:border-blue-500/30 transition-all text-sm font-bold text-white placeholder:text-gray-500 placeholder:font-medium placeholder:uppercase placeholder:tracking-widest"
                    />
                </div>
            </Card>

            {reports.length === 0 && !isLoading ? (
                <Card variant="glass" className="p-20 flex flex-col items-center justify-center text-gray-400">
                    <MessageSquare className="w-12 h-12 mb-4 opacity-20" />
                    <p className="font-bold uppercase tracking-widest text-[10px] text-gray-600">{emptyMessage}</p>
                </Card>
            ) : (
                <div className="grid gap-6">
                    {reports.map(report => (
                        <ReportCard
                            key={report.id}
                            report={report as any}
                            showUser
                            actions={renderReportActions(report)}
                        />
                    ))}
                </div>
            )}

            {hasMore && reports.length > 0 && (
                <div className="flex justify-center pt-8">
                    <Button variant="secondary" size="lg" onClick={onLoadMore} className="bg-white px-10">
                        Carregar Mais
                    </Button>
                </div>
            )}
        </div>
    );
};
