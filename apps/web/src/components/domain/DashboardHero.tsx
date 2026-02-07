import { BarChart3, AlertCircle, Download, Video, Calendar, type LucideIcon } from 'lucide-react';
import { Button } from '../ui';
import { KpiCard } from './KpiCard';

interface KPIConfig {
    label: string;
    status: string;
    icon: LucideIcon;
    color: 'blue' | 'purple' | 'emerald' | 'orange';
    trend?: string;
}

interface FilterOption {
    id: string;
    label: string;
}

interface DashboardHeroProps {
    title: string;
    subtitle: string;
    stats: { status: string; _count: number }[];
    kpiConfigs: KPIConfig[];
    statusFilter: string;
    onStatusFilterChange: (status: string) => void;
    filters: FilterOption[];
    showDateFilters?: boolean;
    startDate?: string;
    endDate?: string;
    onStartDateChange?: (val: string) => void;
    onEndDateChange?: (val: string) => void;
    onClearDates?: () => void;
    onAnalyticsClick?: () => void;
    onExportClick?: () => void;
    onConferenceClick?: () => void;
    onAgendaClick?: () => void;
    children?: React.ReactNode;
}

export const DashboardHero: React.FC<DashboardHeroProps> = ({
    title,
    subtitle,
    stats,
    kpiConfigs,
    statusFilter,
    onStatusFilterChange,
    filters,
    showDateFilters,
    startDate,
    endDate,
    onStartDateChange,
    onEndDateChange,
    onClearDates,
    onAnalyticsClick,
    onExportClick,
    onConferenceClick,
    onAgendaClick,
    children
}) => {
    return (
        <div className="pb-8 animate-in">
            <div className="flex flex-col gap-6 mb-8">
                {/* Header Section */}
                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6">
                    <div>
                        <h2 className="text-3xl font-bold tracking-tight text-[var(--text-primary)]">{title}</h2>
                        <p className="text-[var(--text-secondary)] font-medium mt-1">{subtitle}</p>
                    </div>
                    <div className="flex flex-wrap items-center gap-3">
                        {onAnalyticsClick && (
                            <Button
                                variant="secondary"
                                onClick={onAnalyticsClick}
                                leftIcon={<BarChart3 className="w-4 h-4" />}
                            >
                                Analytics
                            </Button>
                        )}
                        {onExportClick && (
                            <Button
                                variant="secondary"
                                onClick={onExportClick}
                                leftIcon={<Download className="w-4 h-4" />}
                            >
                                Exportar
                            </Button>
                        )}
                        {onConferenceClick && (
                            <Button
                                variant="secondary"
                                onClick={onConferenceClick}
                                leftIcon={<Video className="w-4 h-4" />}
                            >
                                War Room
                            </Button>
                        )}
                        {onAgendaClick && (
                            <Button
                                variant="secondary"
                                onClick={onAgendaClick}
                                leftIcon={<Calendar className="w-4 h-4" />}
                            >
                                Agenda
                            </Button>
                        )}
                        {children}
                    </div>
                </div>

                {/* Filters Section */}
                <div className="flex flex-col xl:flex-row items-center justify-between gap-4 w-full">
                    {/* Status Filter Tabs */}
                    <div className="flex bg-[var(--bg-tertiary)] p-1 rounded-xl w-full xl:w-auto overflow-x-auto">
                        {filters.map(filter => (
                            <button
                                type="button"
                                key={filter.id}
                                onClick={() => onStatusFilterChange(filter.id)}
                                className={`
                                    flex-1 sm:flex-none px-4 py-2 rounded-lg text-xs font-semibold uppercase tracking-wide transition-all whitespace-nowrap
                                    ${statusFilter === filter.id
                                        ? 'bg-white text-[var(--text-primary)] shadow-sm'
                                        : 'text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]'
                                    }
                                `}
                            >
                                {filter.label}
                            </button>
                        ))}
                    </div>

                    {/* Date Filters */}
                    {showDateFilters && (
                        <div className="flex items-center bg-white border border-[var(--border-subtle)] p-1 rounded-xl shadow-sm">
                            <div className="relative group">
                                <div className="flex items-center gap-2 px-4 py-2 hover:bg-[var(--bg-secondary)] rounded-lg transition-colors cursor-pointer border-r border-[var(--border-subtle)]">
                                    <Calendar className="w-4 h-4 text-[var(--accent-secondary)]" />
                                    <div className="flex flex-col">
                                        <span className="text-[10px] font-bold text-[var(--text-tertiary)] uppercase leading-none">De</span>
                                        <input
                                            type="date"
                                            value={startDate}
                                            onChange={e => onStartDateChange?.(e.target.value)}
                                            className="bg-transparent text-xs font-bold outline-none text-[var(--text-primary)] uppercase font-sans cursor-pointer p-0 m-0 w-[110px]"
                                            aria-label="Start Date"
                                        />
                                    </div>
                                </div>
                            </div>
                            <div className="relative group">
                                <div className="flex items-center gap-2 px-4 py-2 hover:bg-[var(--bg-secondary)] rounded-lg transition-colors cursor-pointer">
                                    <Calendar className="w-4 h-4 text-[var(--accent-secondary)]" />
                                    <div className="flex flex-col">
                                        <span className="text-[10px] font-bold text-[var(--text-tertiary)] uppercase leading-none">Até</span>
                                        <input
                                            type="date"
                                            value={endDate}
                                            onChange={e => onEndDateChange?.(e.target.value)}
                                            className="bg-transparent text-xs font-bold outline-none text-[var(--text-primary)] uppercase font-sans cursor-pointer p-0 m-0 w-[110px]"
                                            aria-label="End Date"
                                        />
                                    </div>
                                </div>
                            </div>
                            {(startDate || endDate) && (
                                <button
                                    type="button"
                                    onClick={onClearDates}
                                    className="p-2 hover:bg-red-50 text-red-400 hover:text-red-500 rounded-lg transition-colors mx-1"
                                    title="Limpar datas"
                                >
                                    <AlertCircle className="w-4 h-4" />
                                </button>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* KPI Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {kpiConfigs.map(kpi => (
                    <KpiCard
                        key={kpi.status}
                        label={kpi.label}
                        value={stats.find(s => s.status === kpi.status)?._count || 0}
                        icon={kpi.icon}
                        variant={kpi.color}
                        trend={kpi.trend}
                    />
                ))}
            </div>
        </div>
    );
};
