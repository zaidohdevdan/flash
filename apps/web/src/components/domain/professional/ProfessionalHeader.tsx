import React from 'react';

interface ProfessionalHeaderProps {
    userName: string;
    isConnected: boolean;
}

export const ProfessionalHeader: React.FC<ProfessionalHeaderProps> = ({ userName, isConnected }) => {
    return (
        <header className="flex justify-between items-center mb-8">
            <div>
                <h1 className="text-3xl font-black text-gray-900 tracking-tight uppercase">Olá, {userName.split(' ')[0]}!</h1>
                <p className="text-[10px] text-gray-700 font-black uppercase tracking-widest mt-1">Seu histórico operacional</p>
            </div>

            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-100 rounded-full shadow-sm">
                <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`} />
                <span className={`text-[9px] font-black uppercase ${isConnected ? 'text-emerald-600' : 'text-gray-600'}`}>{isConnected ? 'Online' : 'Offline'}</span>
            </div>
        </header>
    );
};
