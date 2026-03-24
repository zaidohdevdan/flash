import React from 'react';
import type { LucideIcon } from 'lucide-react';
import { Card } from '../ui/Card';

interface KpiCardProps {
    label: string;
    value: number;
    icon: LucideIcon;
    variant: 'blue' | 'purple' | 'emerald' | 'orange' | 'rose';
    trend?: string;
    isCritical?: boolean;
    items?: { id: string; comment: string }[];
}

export const KpiCard: React.FC<KpiCardProps> = ({
    label,
    value,
    icon: Icon,
    variant,
    trend,
    isCritical,
    items
}) => {
    // Mission Control Tactical Colors
    const colorMap = {
        blue: {
            bg: 'from-blue-500/10 to-transparent',
            border: 'border-blue-500/20 group-hover:border-blue-500/40',
            iconBg: 'bg-blue-500/10',
            iconColor: 'text-blue-500',
            glow: 'shadow-[0_0_30px_-10px_rgba(59,130,246,0.2)]',
            text: 'text-blue-600 dark:text-blue-400'
        },
        purple: {
            bg: 'from-indigo-500/10 to-transparent',
            border: 'border-indigo-500/20 group-hover:border-indigo-500/40',
            iconBg: 'bg-indigo-500/10',
            iconColor: 'text-indigo-500',
            glow: 'shadow-[0_0_30px_-10px_rgba(99,102,241,0.2)]',
            text: 'text-indigo-600 dark:text-indigo-400'
        },
        emerald: {
            bg: 'from-emerald-500/10 to-transparent',
            border: 'border-emerald-500/20 group-hover:border-emerald-500/40',
            iconBg: 'bg-emerald-500/10',
            iconColor: 'text-emerald-500',
            glow: 'shadow-[0_0_30px_-10px_rgba(16,185,129,0.2)]',
            text: 'text-emerald-600 dark:text-emerald-400'
        },
        orange: {
            bg: 'from-amber-500/10 to-transparent',
            border: 'border-amber-500/20 group-hover:border-amber-500/40',
            iconBg: 'bg-amber-500/10',
            iconColor: 'text-amber-500',
            glow: 'shadow-[0_0_30px_-10px_rgba(245,158,11,0.2)]',
            text: 'text-amber-600 dark:text-amber-400'
        },
        rose: {
            bg: 'from-rose-500/15 to-rose-500/5',
            border: 'border-rose-500/40 group-hover:border-rose-500/60',
            iconBg: 'bg-rose-500/20',
            iconColor: 'text-rose-500',
            glow: 'shadow-[0_0_40px_-10px_rgba(244,63,94,0.4)]',
            text: 'text-rose-600 dark:text-rose-400'
        }
    };

    const colors = colorMap[variant] || colorMap.blue;

    return (
        <Card className={`relative p-6 flex flex-col justify-between h-full bg-white dark:bg-black/40 backdrop-blur-xl border ${colors.border} rounded-[2rem] transition-all duration-500 ${colors.glow} group overflow-hidden`}>
            {/* Top Gradient Background */}
            <div className={`absolute top-0 left-0 right-0 h-32 bg-gradient-to-b ${colors.bg} opacity-50 pointer-events-none transition-opacity duration-500 group-hover:opacity-100`} />
            
            {/* Critical Pulse Border */}
            {isCritical && (
                <div className="absolute inset-0 rounded-[2rem] border-[3px] border-rose-500/30 animate-[pulse_2s_infinite] pointer-events-none" />
            )}

            <div className="relative z-10 flex justify-between items-start mb-8">
                <div className={`p-4 rounded-2xl ${colors.iconBg} backdrop-blur-md border border-white/10 transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3`}>
                    <Icon className={`w-6 h-6 ${colors.iconColor}`} />
                </div>
                {trend && (
                    <span className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 px-3 py-1.5 rounded-xl uppercase tracking-[0.2em] border border-emerald-200 dark:border-emerald-500/20 shadow-sm">
                        {trend}
                    </span>
                )}
            </div>

            <div className="relative z-10 flex flex-col gap-1">
                <h3 className="text-5xl font-black tracking-tighter text-slate-900 dark:text-white group-hover:scale-[1.02] origin-left transition-transform duration-500">
                    {value}
                </h3>
                <div className="flex items-center gap-2 mt-1">
                    {isCritical && <div className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />}
                    <p className={`text-[11px] font-black uppercase tracking-[0.2em] transition-colors duration-500 ${isCritical ? 'text-rose-500' : 'text-slate-500 dark:text-slate-400 group-hover:text-slate-700 dark:group-hover:text-slate-300'}`}>
                        {label}
                    </p>
                </div>
            </div>

            {/* List Overlay on Hover */}
            {items && items.length > 0 && (
                <div className="absolute inset-0 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-50 overflow-y-auto flex flex-col gap-2 no-scrollbar pointer-events-none group-hover:pointer-events-auto">
                    <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] sticky top-0 bg-white/95 dark:bg-slate-900/95 pb-2 z-10 w-full block">
                        Detalhamento ({items.length})
                    </span>
                    <div className="flex flex-col gap-2 pb-2">
                        {items.slice(0, 20).map(item => (
                            <div key={item.id} className="bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/10 rounded-xl p-2.5 flex flex-col gap-1 hover:border-indigo-500/30 transition-colors">
                                <span className="text-[10px] font-black text-indigo-500 dark:text-indigo-400 uppercase tracking-widest flex items-center gap-1">
                                    <span className="opacity-50">#</span>{item.id.slice(-6).toUpperCase()}
                                </span>
                                <span className="text-[11px] text-slate-700 dark:text-slate-300 font-medium line-clamp-2 leading-relaxed">"{item.comment}"</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </Card>
    );
};
