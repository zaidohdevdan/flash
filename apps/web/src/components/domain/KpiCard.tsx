import React from 'react';
import type { LucideIcon } from 'lucide-react';
import { Card } from '../ui/Card';

interface KpiCardProps {
    label: string;
    value: number;
    icon: LucideIcon;
    variant: 'blue' | 'purple' | 'emerald' | 'orange';
    trend?: string;
}

export const KpiCard: React.FC<KpiCardProps> = ({
    label,
    value,
    icon: Icon,
    variant,
    trend
}) => {
    // We map colors to our new design system
    const colorMap = {
        blue: { icon: 'text-blue-600', bg: 'bg-blue-50' },
        purple: { icon: 'text-purple-600', bg: 'bg-purple-50' },
        emerald: { icon: 'text-emerald-600', bg: 'bg-emerald-50' },
        orange: { icon: 'text-orange-600', bg: 'bg-orange-50' }
    };

    const colors = colorMap[variant] || colorMap.blue;

    return (
        <Card className="p-5 flex flex-col justify-between h-full hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-4">
                <div className={`p-2 rounded-xl ${colors.bg}`}>
                    <Icon className={`w-5 h-5 ${colors.icon}`} />
                </div>
                {trend && (
                    <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">
                        {trend}
                    </span>
                )}
            </div>

            <div>
                <h3 className="text-3xl font-bold tracking-tight text-[var(--text-primary)]">
                    {value}
                </h3>
                <p className="text-sm font-medium text-[var(--text-secondary)] mt-1">
                    {label}
                </p>
            </div>
        </Card>
    );
};
