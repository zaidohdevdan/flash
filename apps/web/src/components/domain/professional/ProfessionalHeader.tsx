import React from 'react';

interface ProfessionalHeaderProps {
    userName: string;
    isConnected: boolean;
}

export const ProfessionalHeader: React.FC<ProfessionalHeaderProps> = ({ userName, isConnected }) => {
    return (
        <header className="flex justify-between items-center mb-8">
            <div>
                <h1 className="text-3xl font-black text-white tracking-tight uppercase">Olá, {userName.split(' ')[0]}!</h1>
                <p className="text-[10px] text-slate-300 font-black uppercase tracking-widest mt-1">Seu histórico operacional</p>
            </div>

            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white/10 border border-white/10 rounded-full shadow-sm backdrop-blur-sm">
                <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`} />
                <span className={`text-[9px] font-black uppercase ${isConnected ? 'text-emerald-400' : 'text-slate-300'}`}>{isConnected ? 'Online' : 'Offline'}</span>
            </div>
        </header>
    );
};
