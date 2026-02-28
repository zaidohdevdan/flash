import React from 'react';
import { MessageSquare } from 'lucide-react';
import { Card, Button } from '../../ui';

interface SupervisorHighlightProps {
    supervisorName: string;
    isOnline: boolean;
    hasUnread: boolean;
    onChatOpen: () => void;
}

export const SupervisorHighlight: React.FC<SupervisorHighlightProps> = ({
    hasUnread,
    supervisorName,
    isOnline,
    onChatOpen
}) => {
    return (
        <Card className="bg-white dark:bg-black/40 p-6 border border-slate-200 dark:border-white/5 rounded-2xl shadow-xl backdrop-blur-md flex flex-col sm:flex-row items-center justify-between gap-6 mb-10 hover:border-indigo-500/30 transition-all group">
            <div className="flex items-center gap-5">
                <div className={`p-4 rounded-2xl transition-all duration-500 relative ${hasUnread ? 'bg-indigo-50 dark:bg-indigo-500/20 border border-indigo-200 dark:border-indigo-500/30 shadow-[0_0_20px_rgba(99,102,241,0.2)]' : 'bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/5'}`}>
                    <MessageSquare className={`w-7 h-7 ${hasUnread ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400 dark:text-slate-400'}`} />
                    {hasUnread && (
                        <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 rounded-full border-2 border-white dark:border-[#020617] animate-bounce shadow-lg" />
                    )}
                </div>
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-[0.2em]">Célula de Comando</p>
                        <div className={`w-2 h-2 rounded-full ${isOnline ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)] animate-pulse' : 'bg-slate-300 dark:bg-slate-600'}`} />
                    </div>
                    <h3 className={`text-xl font-black tracking-tight ${hasUnread ? 'text-indigo-600 dark:text-indigo-300' : 'text-slate-800 dark:text-white'}`}>
                        {supervisorName}
                    </h3>
                </div>
            </div>
            <Button
                variant={hasUnread ? 'primary' : 'secondary'}
                className={`!rounded-xl px-6 h-12 uppercase text-[10px] font-black tracking-widest transition-all ${!hasUnread ? 'bg-slate-100 hover:bg-slate-200 text-slate-600 dark:bg-white/5 dark:hover:bg-white/10 dark:border-white/10 dark:text-slate-300 border-transparent dark:border-white/10' : 'shadow-[0_0_20px_rgba(99,102,241,0.3)] hover:scale-105'}`}
                onClick={onChatOpen}
            >
                {hasUnread ? 'Ler Mensagens' : 'Contatar Supervisor'}
            </Button>
        </Card>
    );
};
