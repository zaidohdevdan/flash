import React from 'react';
import { useTranslation } from 'react-i18next';

interface ProfessionalHeaderProps {
    userName: string;
    isConnected: boolean;
}

export const ProfessionalHeader: React.FC<ProfessionalHeaderProps> = ({ userName, isConnected }) => {
    const { t } = useTranslation();

    return (
        <header className="flex justify-between items-center mb-8">
            <div>
                <h1 className="text-3xl font-black text-[var(--text-primary)] tracking-tight uppercase">{t('reports.header.greeting', { name: userName.split(' ')[0] })}</h1>
                <p className="text-[10px] text-[var(--text-tertiary)] font-black uppercase tracking-widest mt-1">{t('reports.header.subtitle')}</p>
            </div>

            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-[var(--border-subtle)] rounded-full shadow-sm">
                <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`} />
                <span className={`text-[9px] font-black uppercase ${isConnected ? 'text-emerald-600' : 'text-red-500'}`}>{isConnected ? t('layout.header.online') : t('layout.header.offline')}</span>
            </div>
        </header>
    );
};
