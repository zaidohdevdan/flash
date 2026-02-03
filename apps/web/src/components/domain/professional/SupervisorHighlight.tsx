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
    supervisorName,
    isOnline,
    hasUnread,
    onChatOpen
}) => {
    return (
        <Card variant="blue" className="!bg-blue-600 p-6 shadow-xl shadow-blue-900/10 flex flex-col sm:flex-row items-center justify-between gap-6 mb-8">
            <div className="flex items-center gap-4 text-white">
                <div className={`p-3 rounded-2xl backdrop-blur-md relative transition-all duration-500 ${hasUnread ? 'bg-amber-500/20 animate-pulse shadow-[0_0_20px_rgba(245,158,11,0.4)] border border-amber-400/30' : 'bg-white/20'}`}>
                    <MessageSquare className={`w-6 h-6 ${hasUnread ? 'text-amber-400' : 'text-white'}`} />
                    {hasUnread && (
                        <span className="absolute -top-1 -right-1 w-4 h-4 bg-teal-400 rounded-full border-2 border-blue-600 animate-bounce" />
                    )}
                </div>
                <div>
                    <div className="flex items-center gap-2">
                        <p className="text-[9px] font-black text-gray-400/80 uppercase tracking-widest">Supervisor Direto</p>
                        <div className={`w-1.5 h-1.5 rounded-full ${isOnline ? 'bg-emerald-400 animate-pulse' : 'bg-white/30'}`} />
                    </div>
                    <h3 className={`text-lg font-bold transition-all duration-300 ${hasUnread ? 'text-amber-300 animate-pulse' : 'text-white'}`}>
                        {supervisorName}
                    </h3>
                </div>
            </div>
            <Button
                variant="glass"
                className="!bg-white/10 !text-white !border-white/20 hover:!bg-white/20"
                onClick={onChatOpen}
            >
                {hasUnread ? 'NOVA MENSAGEM' : 'CONTATAR SUPERVISOR'}
            </Button>
        </Card>
    );
};
