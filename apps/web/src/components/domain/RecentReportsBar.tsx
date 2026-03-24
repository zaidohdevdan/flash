import React from 'react';
import { motion } from 'framer-motion';
import { Avatar } from '../ui/Avatar';
import { Clock, Activity, ArrowRight } from 'lucide-react';
import type { Report } from '../../types';

interface RecentReportsBarProps {
    events: Report[];
    viewed: string[];
    onReportClick: (id: string) => void;
    onViewAll: () => void;
}

export const RecentReportsBar = React.memo<RecentReportsBarProps>(({ events, viewed, onReportClick, onViewAll }) => {
    if (events.length === 0) return null;

    return (
        <div className="sticky top-0 z-50 py-3 -mx-4 px-4 bg-white/60 dark:bg-[#020617]/60 backdrop-blur-2xl border-b border-slate-200 dark:border-white/5 shadow-sm overflow-hidden no-scrollbar">
            <div className="flex items-center gap-6 max-w-full overflow-x-auto no-scrollbar pb-1">
                {/* Visual Label */}
                <div className="flex items-center gap-2 px-3 py-1.5 bg-indigo-500/10 rounded-xl border border-indigo-500/20 shrink-0">
                    <Activity className="w-4 h-4 text-indigo-500 animate-[pulse_2s_infinite]" />
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-600 dark:text-indigo-400 whitespace-nowrap">Últimos Recebimentos</span>
                </div>

                <div className="flex items-center gap-4 pr-10">
                    {events.map((report, idx) => {
                        const isViewed = viewed.includes(report.id);
                        return (
                            <motion.button
                                key={report.id}
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: idx * 0.05 }}
                                onClick={() => onReportClick(report.id)}
                                className={`
                                    flex items-center gap-3 p-1.5 rounded-2xl transition-all duration-300 group/item hover:scale-105 active:scale-95 relative
                                    ${isViewed ? 'hover:bg-slate-500/5' : 'bg-rose-500/5 border border-rose-500/20 shadow-lg shadow-rose-500/5 ring-1 ring-rose-500/10 animate-alert-intermittent'}
                                `}
                            >
                                <Avatar 
                                    src={report.user?.avatarUrl} 
                                    size="sm" 
                                    hasUnread={!isViewed} 
                                    className="ring-1 ring-white/10"
                                />
                                <div className="flex flex-col items-start leading-none pr-2">
                                    <span className={`text-[11px] font-black uppercase tracking-tight ${isViewed ? 'text-slate-700 dark:text-slate-300 group-hover/item:text-indigo-500' : 'text-rose-500'}`}>
                                        #{report.id.slice(-6).toUpperCase()}
                                    </span>
                                    <div className="flex items-center gap-1 mt-0.5">
                                        <Clock className="w-2.5 h-2.5 text-slate-400" />
                                        <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">
                                            {report.createdAt ? new Date(report.createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) : '--:--'}
                                        </span>
                                    </div>
                                </div>
                                {!isViewed && (
                                    <div className="absolute -top-1 -right-1 flex h-3 w-3">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                                        <span className="relative inline-flex rounded-full h-3 w-3 bg-rose-500"></span>
                                    </div>
                                )}
                            </motion.button>
                        );
                    })}
                </div>

                {/* Tactical Visual End */}
                <div className="h-4 w-px bg-slate-200 dark:bg-white/10 mx-2 shrink-0" />
                <button
                    onClick={onViewAll}
                    className="flex items-center gap-1.5 text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] hover:text-indigo-500 transition-colors shrink-0"
                >
                    Ver Tudo <ArrowRight className="w-3 h-3" />
                </button>
            </div>
        </div>
    );
});
RecentReportsBar.displayName = 'RecentReportsBar';
