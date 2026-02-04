import { BarChart3, Clock, AlertCircle, Download, Video, Calendar } from 'lucide-react';
import { Button, GlassCard } from '../ui';
import { KpiCard } from './KpiCard';

interface KPIConfig {
    label: string;
    status: string;
    icon: any;
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
        <div className="bg-[#020617] relative overflow-hidden pb-24 pt-12">
            {/* Background Decorations */}
            <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-blue-600/20 rounded-full blur-[160px] -mr-96 -mt-96 animate-pulse duration-[10s] pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-indigo-600/15 rounded-full blur-[140px] -ml-40 -mb-40 pointer-events-none" />

            <div className="max-w-7xl mx-auto px-6 relative z-10">
                <div className="flex flex-col gap-8 mb-12">
                    <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
                        <div>
                            <h2 className="text-3xl font-black text-white tracking-tight uppercase">{title}</h2>
                            <p className="text-white/90 text-sm font-medium mt-1 uppercase tracking-widest">{subtitle}</p>
                        </div>
                        <div className="flex flex-wrap items-center gap-3">
                            {onAnalyticsClick && (
                                <Button
                                    variant="glass"
                                    className="!px-4 !py-2 !bg-blue-500/20 hover:!bg-blue-500/30 text-blue-300 border-blue-500/30 backdrop-blur-md whitespace-nowrap"
                                    onClick={onAnalyticsClick}
                                >
                                    <BarChart3 className="w-5 h-5 mr-2" />
                                    Analytics
                                </Button>
                            )}
                            {onExportClick && (
                                <Button
                                    variant="glass"
                                    className="!px-4 !py-2 !bg-emerald-500/20 hover:!bg-emerald-500/30 text-emerald-300 border-emerald-500/30 backdrop-blur-md whitespace-nowrap"
                                    onClick={onExportClick}
                                >
                                    <Download className="w-5 h-5 mr-2" />
                                    Exportar
                                </Button>
                            )}
                            {onConferenceClick && (
                                <Button
                                    variant="glass"
                                    className="!px-4 !py-2 !bg-red-600/20 hover:!bg-red-600/30 text-red-400 border-red-500/30 backdrop-blur-md whitespace-nowrap animate-pulse hover:animate-none"
                                    onClick={onConferenceClick}
                                >
                                    <Video className="w-5 h-5 mr-2" />
                                    War Room
                                </Button>
                            )}
                            {onAgendaClick && (
                                <Button
                                    variant="glass"
                                    className="!px-4 !py-2 !bg-blue-600/20 hover:!bg-blue-600/30 text-blue-200 border-blue-500/30 backdrop-blur-md whitespace-nowrap"
                                    onClick={onAgendaClick}
                                >
                                    <Calendar className="w-5 h-5 mr-2" />
                                    Agenda
                                </Button>
                            )}
                            {children}
                        </div>
                    </div>

                    <div className="flex flex-col xl:flex-row items-center justify-between gap-4 w-full">
                        <GlassCard blur="lg" className="p-1 px-1.5 flex flex-wrap items-center gap-1 border-white/10 !rounded-[1.25rem] w-full xl:w-auto justify-center">
                            {filters.map(filter => (
                                <button
                                    key={filter.id}
                                    onClick={() => onStatusFilterChange(filter.id)}
                                    className={`flex-1 sm:flex-none px-6 py-2.5 rounded-[1rem] text-[10px] font-black uppercase tracking-widest transition-all ${statusFilter === filter.id
                                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30'
                                        : 'text-gray-400 hover:text-white hover:bg-white/10'
                                        }`}
                                >
                                    {filter.label}
                                </button>
                            ))}
                        </GlassCard>

                        {showDateFilters && (
                            <GlassCard variant="light" blur="lg" className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 bg-white/80 backdrop-blur-xl p-1.5 !rounded-[1.25rem] border border-white/20 w-full xl:w-auto">
                                <div className="flex items-center gap-2 px-4 border-b sm:border-b-0 sm:border-r border-gray-200/50 py-2 sm:py-0">
                                    <Clock className="w-3.5 h-3.5 text-blue-600" />
                                    <input
                                        type="date"
                                        value={startDate}
                                        onChange={e => onStartDateChange?.(e.target.value)}
                                        className="bg-transparent text-[10px] font-black outline-none text-gray-900 h-8 uppercase flex-1"
                                    />
                                </div>
                                <div className="flex items-center gap-2 px-4 py-2 sm:py-0">
                                    <Clock className="w-3.5 h-3.5 text-blue-600" />
                                    <input
                                        type="date"
                                        value={endDate}
                                        onChange={e => onEndDateChange?.(e.target.value)}
                                        className="bg-transparent text-[10px] font-black outline-none text-gray-900 h-8 uppercase flex-1"
                                    />
                                </div>
                                {(startDate || endDate) && (
                                    <button
                                        onClick={onClearDates}
                                        className="p-3 sm:p-2 hover:bg-red-50 rounded-xl transition text-gray-400 hover:text-red-500 flex justify-center"
                                    >
                                        <AlertCircle className="w-3.5 h-3.5" />
                                    </button>
                                )}
                            </GlassCard>
                        )}
                    </div>
                </div>

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
        </div>
    );
};
