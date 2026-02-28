import React from 'react';
interface ProfessionalHeaderProps {
    userName: string;
    isConnected: boolean;
}

export const ProfessionalHeader: React.FC<ProfessionalHeaderProps> = ({ userName, isConnected }) => {
    return (
        <header className="flex justify-between items-center mb-10">
            <div>
                <h1 className="text-3xl font-black text-slate-900 dark:text-slate-100 tracking-tight uppercase">Olá, {userName.split(' ')[0]}</h1>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-[0.2em] mt-1">Pronto para a missão de hoje?</p>
            </div>

            <div className="flex items-center gap-2 px-3 py-1.5 bg-white dark:bg-black/40 border border-slate-200 dark:border-white/5 rounded-full shadow-lg backdrop-blur-md">
                <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)] animate-pulse' : 'bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.5)]'}`} />
                <span className={`text-[10px] font-black uppercase tracking-wider ${isConnected ? 'text-emerald-600 dark:text-emerald-500' : 'text-rose-600 dark:text-rose-500'}`}>{isConnected ? 'Sistemas Online' : 'Sistemas Offline'}</span>
            </div>
        </header>
    );
};
