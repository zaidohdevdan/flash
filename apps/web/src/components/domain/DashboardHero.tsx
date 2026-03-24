import { BarChart3, AlertCircle, Download, Video, Calendar, LifeBuoy, History as HistoryIcon, type LucideIcon } from 'lucide-react';
import { motion } from 'framer-motion';
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
    reports?: { id: string; comment: string; status: string }[];
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
    onSupportClick?: () => void;
    onHistoryClick?: () => void;
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
    reports,
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
    onSupportClick,
    onHistoryClick,
    children
}) => {
    const btnMotion = {
        whileHover: { scale: 1.05, y: -2 },
        whileTap: { scale: 0.95 },
        transition: { type: 'spring', stiffness: 400, damping: 10 }
    } as const;

    return (
        <div className="pb-10 relative overflow-hidden">

            <div className="flex flex-col gap-8 mb-10 relative z-20">
                {/* Header Section */}
                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-8">
                    <div>
                        <h2 className="text-4xl font-black tracking-tight text-slate-900 dark:text-white uppercase">{title}</h2>
                        <p className="text-slate-500 dark:text-slate-400 font-bold mt-2 uppercase tracking-[0.2em] text-[12px]">{subtitle}</p>
                    </div>
                    <div className="flex flex-wrap items-center gap-3">
                        {onAnalyticsClick && (
                            <motion.div {...btnMotion}>
                                <Button
                                    variant="secondary"
                                    onClick={onAnalyticsClick}
                                    className="bg-white/70 dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-white/10 hover:text-slate-900 dark:hover:text-white font-black uppercase tracking-widest text-[11px] h-10 px-4 rounded-xl shadow-lg shadow-black/5 transition-all"
                                >
                                    <BarChart3 className="w-4 h-4 mr-2 text-indigo-500 dark:text-indigo-400" />
                                    Inteligência
                                </Button>
                            </motion.div>
                        )}
                        {onExportClick && (
                            <motion.div {...btnMotion}>
                                <Button
                                    variant="secondary"
                                    onClick={onExportClick}
                                    className="bg-white/70 dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-white/10 hover:text-slate-900 dark:hover:text-white font-black uppercase tracking-widest text-[11px] h-10 px-4 rounded-xl shadow-lg shadow-black/5 transition-all"
                                >
                                    <Download className="w-4 h-4 mr-2 text-indigo-500 dark:text-indigo-400" />
                                    Transmitir
                                </Button>
                            </motion.div>
                        )}
                        {onConferenceClick && (
                            <motion.div {...btnMotion}>
                                <Button
                                    variant="secondary"
                                    onClick={onConferenceClick}
                                    className="bg-indigo-50 dark:bg-indigo-600/20 border-indigo-200 dark:border-indigo-500/20 text-indigo-600 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-indigo-600/30 hover:text-indigo-700 dark:hover:text-indigo-200 font-black uppercase tracking-widest text-[11px] h-10 px-4 rounded-xl shadow-xl shadow-indigo-500/10 transition-all"
                                >
                                    <Video className="w-4 h-4 mr-2" />
                                    Operações
                                </Button>
                            </motion.div>
                        )}
                        {onAgendaClick && (
                            <motion.div {...btnMotion}>
                                <Button
                                    variant="secondary"
                                    onClick={onAgendaClick}
                                    className="bg-white/70 dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-white/10 hover:text-slate-900 dark:hover:text-white font-black uppercase tracking-widest text-[11px] h-10 px-4 rounded-xl shadow-lg shadow-black/5 transition-all"
                                >
                                    <Calendar className="w-4 h-4 mr-2 text-indigo-500 dark:text-indigo-400" />
                                    Agenda
                                </Button>
                            </motion.div>
                        )}
                        {onSupportClick && (
                            <motion.div {...btnMotion}>
                                <Button
                                    variant="secondary"
                                    onClick={onSupportClick}
                                    className="bg-white/70 dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-white/10 hover:text-slate-900 dark:hover:text-white font-black uppercase tracking-widest text-[11px] h-10 px-4 rounded-xl shadow-lg shadow-black/5 transition-all"
                                >
                                    <LifeBuoy className="w-4 h-4 mr-2 text-indigo-500 dark:text-indigo-400" />
                                    Suporte
                                </Button>
                            </motion.div>
                        )}
                        {onHistoryClick && (
                            <motion.div {...btnMotion}>
                                <Button
                                    variant="secondary"
                                    onClick={onHistoryClick}
                                    className="bg-white/70 dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-white/10 hover:text-slate-900 dark:hover:text-white font-black uppercase tracking-widest text-[11px] h-10 px-4 rounded-xl shadow-lg shadow-black/5 transition-all"
                                >
                                    <HistoryIcon className="w-4 h-4 mr-2 text-indigo-500 dark:text-indigo-400" />
                                    Arquivos
                                </Button>
                            </motion.div>
                        )}
                        {children}
                    </div>
                </div>

                {/* Filters Section */}
                <div className="flex flex-col xl:flex-row items-center justify-between gap-6 w-full">
                    {/* Status Filter Tabs */}
                    <div className="flex bg-white/70 dark:bg-black/60 p-1 rounded-2xl w-full xl:w-auto overflow-x-auto border border-slate-200 dark:border-white/5 backdrop-blur-md shadow-inner transition-all">
                        {filters.map(filter => (
                            <button
                                type="button"
                                key={filter.id}
                                onClick={() => onStatusFilterChange(filter.id)}
                                className={`
                                    flex-1 sm:flex-none px-6 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-[0.15em] transition-all whitespace-nowrap
                                    ${statusFilter === filter.id
                                        ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20'
                                        : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 hover:bg-slate-200/50 dark:hover:bg-white/5'
                                    }
                                `}
                            >
                                {filter.label}
                            </button>
                        ))}
                    </div>

                    {/* Date Filters */}
                    {showDateFilters && (
                        <div className="flex items-center bg-white/70 dark:bg-black/60 border border-slate-200 dark:border-white/5 p-1 rounded-2xl shadow-xl backdrop-blur-md transition-all">
                            <div className="relative group">
                                <div className="flex items-center gap-3 px-5 py-2.5 hover:bg-slate-200 dark:hover:bg-white/5 rounded-xl transition-colors cursor-pointer border-r border-slate-200 dark:border-white/5">
                                    <Calendar className="w-4 h-4 text-indigo-500 dark:text-indigo-400" />
                                    <div className="flex flex-col">
                                        <span className="text-[11px] font-black text-slate-500 dark:text-slate-600 uppercase leading-none mb-1">Início</span>
                                        <input
                                            type="date"
                                            value={startDate}
                                            onChange={e => onStartDateChange?.(e.target.value)}
                                            className="bg-transparent text-[13px] font-black outline-none text-slate-700 dark:text-slate-300 uppercase font-sans cursor-pointer p-0 m-0 w-[120px]"
                                            aria-label="Start Date"
                                        />
                                    </div>
                                </div>
                            </div>
                            <div className="relative group">
                                <div className="flex items-center gap-3 px-5 py-2.5 hover:bg-slate-200 dark:hover:bg-white/5 rounded-xl transition-colors cursor-pointer">
                                    <Calendar className="w-4 h-4 text-indigo-500 dark:text-indigo-400" />
                                    <div className="flex flex-col">
                                        <span className="text-[11px] font-black text-slate-500 dark:text-slate-600 uppercase leading-none mb-1">Término</span>
                                        <input
                                            type="date"
                                            value={endDate}
                                            onChange={e => onEndDateChange?.(e.target.value)}
                                            className="bg-transparent text-[13px] font-black outline-none text-slate-700 dark:text-slate-300 uppercase font-sans cursor-pointer p-0 m-0 w-[120px]"
                                            aria-label="End Date"
                                        />
                                    </div>
                                </div>
                            </div>
                            {(startDate || endDate) && (
                                <button
                                    type="button"
                                    onClick={onClearDates}
                                    className="p-2.5 hover:bg-rose-100 dark:hover:bg-rose-500/10 text-rose-500 rounded-xl transition-colors mx-1"
                                    title="Zerar Filtros"
                                >
                                    <AlertCircle className="w-5 h-5" />
                                </button>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* KPI Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {kpiConfigs.map(kpi => {
                    const value = stats.find(s => s.status === kpi.status)?._count || 0;
                    const items = reports?.filter(r => r.status === kpi.status).map(r => ({ id: r.id, comment: r.comment })) || [];
                    return (
                        <KpiCard
                            key={kpi.status}
                            label={kpi.label}
                            value={value}
                            icon={kpi.icon}
                            variant={kpi.status === 'SENT' && value > 0 ? 'rose' : kpi.color}
                            trend={kpi.trend}
                            isCritical={kpi.status === 'SENT' && value > 0}
                            items={items}
                        />
                    );
                })}
            </div>
        </div>
    );
};
