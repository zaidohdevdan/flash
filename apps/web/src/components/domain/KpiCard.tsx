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
}

export const KpiCard: React.FC<KpiCardProps> = ({
    label,
    value,
    icon: Icon,
    variant,
    trend,
    isCritical
}) => {
    // Mission Control Tactical Colors
    const colorMap = {
        blue: { icon: 'text-blue-400', glow: 'shadow-[0_0_15px_rgba(59,130,246,0.15)]', border: 'border-blue-500/20' },
        purple: { icon: 'text-indigo-400', glow: 'shadow-[0_0_15px_rgba(99,102,241,0.15)]', border: 'border-indigo-500/20' },
        emerald: { icon: 'text-emerald-400', glow: 'shadow-[0_0_15px_rgba(16,185,129,0.15)]', border: 'border-emerald-500/20' },
        orange: { icon: 'text-amber-400', glow: 'shadow-[0_0_15px_rgba(245,158,11,0.15)]', border: 'border-amber-500/20' },
        rose: { icon: 'text-rose-500', glow: 'shadow-[0_0_15px_rgba(244,63,94,0.3)]', border: 'border-rose-500/30' }
    };

    const colors = colorMap[variant] || colorMap.blue;

    return (
        <Card className={`p-6 flex flex-col justify-between h-full bg-white dark:bg-black/40 border ${isCritical ? 'border-rose-500/50' : 'border-slate-200 dark:border-white/5'} rounded-2xl backdrop-blur-md transition-all duration-300 hover:border-slate-300 dark:hover:border-white/10 group ${colors.glow} relative overflow-hidden`}>
            {isCritical && (
                <div className="absolute inset-0 rounded-2xl border-2 border-rose-500/30 animate-pulse pointer-events-none" />
            )}
            <div className="flex justify-between items-start mb-6 relative z-10">
                <div className={`p-3 rounded-2xl bg-slate-50 dark:bg-white/5 border ${colors.border} transition-transform duration-500 group-hover:scale-110 shadow-inner`}>
                    <Icon className={`w-5 h-5 ${colors.icon}`} />
                </div>
                {trend && (
                    <span className="text-[11px] font-black text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 px-2.5 py-1 rounded-lg uppercase tracking-[0.2em] border border-emerald-200 dark:border-emerald-500/20 shadow-sm dark:shadow-md">
                        {trend}
                    </span>
                )}
            </div>

            <div>
                <h3 className="text-4xl font-black tracking-tight text-slate-800 dark:text-white mb-2">
                    {value}
                </h3>
                <p className="text-[12px] font-black text-slate-500 dark:text-slate-500 uppercase tracking-[0.2em] group-hover:text-slate-400 transition-colors">
                    {label}
                </p>
            </div>
        </Card>
    );
};
