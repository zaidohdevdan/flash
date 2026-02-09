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
        <Card className="bg-white p-6 border border-[var(--border-subtle)] shadow-sm flex flex-col sm:flex-row items-center justify-between gap-6 mb-8 hover:border-[var(--accent-primary)] transition-all">
            <div className="flex items-center gap-4">
                <div className={`p-3 rounded-2xl transition-all duration-500 ${hasUnread ? 'bg-amber-50 animate-pulse border border-amber-200' : 'bg-[var(--bg-secondary)]'}`}>
                    <MessageSquare className={`w-6 h-6 ${hasUnread ? 'text-amber-500' : 'text-[var(--text-tertiary)]'}`} />
                    {hasUnread && (
                        <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full border-2 border-white animate-bounce" />
                    )}
                </div>
                <div>
                    <div className="flex items-center gap-2">
                        <p className="text-[9px] font-black text-[var(--text-tertiary)] uppercase tracking-widest">Seu Supervisor</p>
                        <div className={`w-1.5 h-1.5 rounded-full ${isOnline ? 'bg-emerald-500 animate-pulse' : 'bg-gray-300'}`} />
                    </div>
                    <h3 className={`text-lg font-bold transition-all duration-300 ${hasUnread ? 'text-amber-600' : 'text-[var(--text-primary)]'}`}>
                        {supervisorName}
                    </h3>
                </div>
            </div>
            <Button
                variant={hasUnread ? 'primary' : 'secondary'}
                className={!hasUnread ? "!bg-[var(--bg-secondary)] hover:!bg-[var(--bg-tertiary)] border-[var(--border-subtle)]" : ""}
                onClick={onChatOpen}
            >
                {hasUnread ? 'Ver Mensagens' : 'Falar com Supervisor'}
            </Button>
        </Card>
    );
};
