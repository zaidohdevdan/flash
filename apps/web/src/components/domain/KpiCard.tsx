import React from 'react';
import type { LucideIcon } from 'lucide-react';
import { GlassCard } from '../ui/GlassCard';

/**
 * Propriedades para o componente KpiCard.
 */
export interface KpiCardProps {
    /** Título da métrica (ex: 'Total de Reportes'). */
    label: string;
    /** Valor numérico ou texto principal. */
    value: string | number;
    /** Ícone da biblioteca lucide-react. */
    icon: LucideIcon;
    /** Variante de cor para o ícone e fundo sutil. */
    variant?: 'blue' | 'purple' | 'emerald' | 'orange';
    /** Tendência (ex: '+12%'). */
    trend?: string;
}

/**
 * Cartão de KPI (Key Performance Indicator) desenhado para o Dashboard.
 * Utiliza Glassmorphism avançado para criar profundidade.
 */
export const KpiCard: React.FC<KpiCardProps> = ({
    label,
    value,
    icon: Icon,
    variant = 'blue',
    trend
}) => {
    const variants = {
        blue: 'text-white bg-blue-500 shadow-lg shadow-blue-500/40',
        purple: 'text-white bg-purple-500 shadow-lg shadow-purple-500/40',
        emerald: 'text-white bg-emerald-500 shadow-lg shadow-emerald-500/40',
        orange: 'text-white bg-orange-500 shadow-lg shadow-orange-500/40'
    };

    return (
        <GlassCard
            blur="lg"
            className="p-5 flex flex-col gap-4 group hover:scale-[1.02] transition-all duration-300"
        >
            <div className="flex justify-between items-start">
                <div className={`p-3 rounded-2xl ${variants[variant]} transition-all duration-300 group-hover:scale-110`}>
                    <Icon className="w-6 h-6" />
                </div>
                {trend && (
                    <span className="text-[10px] font-black text-white bg-emerald-500 px-2.5 py-1 rounded-full border border-emerald-400 shadow-lg shadow-emerald-500/20 uppercase tracking-tighter">
                        {trend}
                    </span>
                )}
            </div>

            <div>
                <h3 className="text-[10px] font-black text-white uppercase tracking-widest leading-none mb-1">
                    {label}
                </h3>
                <p className="text-2xl font-black text-white tracking-tighter shadow-sm">
                    {value}
                </p>
            </div>
        </GlassCard>
    );
};
