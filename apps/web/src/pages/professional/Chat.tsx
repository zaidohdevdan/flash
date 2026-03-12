import { useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useOutletContext, useNavigate } from 'react-router-dom';
import type { Socket } from 'socket.io-client';
import { ProfessionalHeader } from '../../components/domain/professional';
import { ChatWidget } from '../../components/ChatWidget';
import { Button } from '../../components/ui';

export function Chat() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const { socket, markAsRead, onlineUserIds = [] } = useOutletContext<{
        socket: Socket | null,
        markAsRead: (id: string) => void,
        onlineUserIds?: string[]
    }>();

    useEffect(() => {
        if (user?.supervisorId) {
            markAsRead(user.supervisorId);
        }
    }, [user?.supervisorId, markAsRead]);

    if (!user?.supervisorId) {
        return (
            <div className="flex h-full items-center justify-center p-6 text-center animate-in fade-in">
                <div className="max-w-md space-y-4">
                    <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">Acesso Negado</p>
                    <h2 className="text-2xl font-black text-slate-800 dark:text-white uppercase tracking-tight">Sem Superior Atribuído</h2>
                    <p className="text-slate-600 dark:text-slate-400">
                        Você precisa ter um supervisor ou gerente responsável atribuído ao seu perfil para utilizar o canal de comunicação tática. Contate o administrador.
                    </p>
                    <Button variant="primary" onClick={() => navigate('/dashboard/overview')} className="mt-4 uppercase tracking-widest text-[10px] font-black w-full h-12">
                        Voltar ao Início
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-[calc(100dvh-5rem)] w-full max-w-5xl mx-auto p-2 sm:p-4 animate-in slide-in-from-bottom-5 duration-700">
            <div className="flex-shrink-0 mb-2 cursor-pointer" onClick={() => navigate('/dashboard/overview')}>
                <ProfessionalHeader
                    userName={user.name || 'Profissional'}
                    isConnected={navigator.onLine}
                />
            </div>
            <div className="flex-1 min-h-0 flex flex-col relative">
                <ChatWidget
                    inline
                    currentUser={{ id: user.id || '', name: user.name || '', role: user.role || '' }}
                    targetUser={{
                        id: user.supervisorId || '',
                        name: user.supervisorName || 'Supervisor',
                        role: 'SUPERVISOR',
                        isOnline: onlineUserIds.includes(user.supervisorId || '')
                    }}
                    onClose={() => navigate('/dashboard/overview')}
                    socket={socket as Socket | null}
                    onRead={() => { }}
                />
            </div>
        </div>
    );
}
