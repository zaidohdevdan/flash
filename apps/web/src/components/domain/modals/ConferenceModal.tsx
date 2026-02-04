import React, { useState, useRef, useCallback, useEffect } from 'react';
import { JitsiMeeting } from '@jitsi/react-sdk';
import { X, Zap, CheckCircle2 } from 'lucide-react';

interface ConferenceModalProps {
    isOpen: boolean;
    onClose: () => void;
    roomName: string;
    userName?: string;
}

export const ConferenceModal: React.FC<ConferenceModalProps> = ({
    isOpen,
    onClose,
    roomName,
    userName = 'Operador Flash'
}) => {
    const [isTerminated, setIsTerminated] = useState(false);
    const terminateTimeoutRef = useRef<any>(null);
    const userIntendsToLeaveRef = useRef(false);

    // Resetar estado quando o modal abrir/fechar
    useEffect(() => {
        if (!isOpen) {
            setIsTerminated(false);
            userIntendsToLeaveRef.current = false;
            if (terminateTimeoutRef.current) {
                clearTimeout(terminateTimeoutRef.current);
                terminateTimeoutRef.current = null;
            }
        } else {
            // Garantir que ao abrir tudo esteja limpo
            setIsTerminated(false);
            userIntendsToLeaveRef.current = false;
        }
    }, [isOpen]);

    const handleReadyToHangup = useCallback(() => {
        console.log('[Jitsi] Intenção de saída: Hangup clicado.');
        userIntendsToLeaveRef.current = true;
        // Não setamos isTerminated aqui ainda, esperamos o videoConferenceLeft confirmar
    }, []);

    const handleLeave = useCallback((event: any) => {
        console.log('[Jitsi] Evento left detectado:', event);

        if (terminateTimeoutRef.current) clearTimeout(terminateTimeoutRef.current);

        // Se o usuário explicitly clicou em sair, encerramos na hora
        if (userIntendsToLeaveRef.current) {
            console.log('[Jitsi] Encerramento confirmado (intencional)');
            setIsTerminated(true);
            return;
        }

        // Caso contrário, pode ser uma mudança de papel ou queda de rede.
        // Aguardamos 8 segundos antes de mostrar a tela de erro/fim.
        console.log('[Jitsi] Saída não intencional (possível reload/role change). Aguardando re-entry...');
        terminateTimeoutRef.current = setTimeout(() => {
            console.log('[Jitsi] Re-entry não detectado. Mostrando tela de encerramento.');
            setIsTerminated(true);
        }, 8000); // 8 segundos para ser bem conservativo
    }, []);

    const handleJoined = useCallback((event: any) => {
        console.log('[Jitsi] Usuário entrou/re-entrou:', event);
        if (terminateTimeoutRef.current) {
            console.log('[Jitsi] Re-entry detectado com sucesso. Cancelando timeout.');
            clearTimeout(terminateTimeoutRef.current);
            terminateTimeoutRef.current = null;
            setIsTerminated(false); // Resetar o estado de terminado se o usuário re-entrou
        }
    }, []);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-0 md:p-10 animate-in fade-in duration-300">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-slate-900/80 backdrop-blur-xl"
                onClick={onClose}
            />

            {/* Modal Content - Full Screen on mobile, large on desktop */}
            <div className="relative w-full h-full md:max-w-6xl md:h-[85vh] bg-slate-950 rounded-none md:rounded-[2.5rem] shadow-2xl overflow-hidden border border-white/10 flex flex-col">
                {/* Header */}
                <div className="px-6 py-4 bg-slate-900 border-b border-white/5 flex justify-between items-center shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                        <h2 className="text-sm font-black text-white uppercase tracking-widest">Operations War Room</h2>
                        <span className="text-[10px] text-slate-400 font-bold bg-white/5 px-2 py-1 rounded-md uppercase">Ao Vivo</span>
                    </div>

                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-white/10 rounded-xl transition-colors text-slate-400 hover:text-white"
                        title="Sair da Reunião"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Content Area */}
                <div className="flex-1 bg-slate-900 relative overflow-hidden">
                    {/* Jitsi Meeting - Sempre montado enquanto isOpen para evitar perda de estado do iframe */}
                    <div className={`absolute inset-0 transition-opacity duration-500 ${isTerminated ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
                        <JitsiMeeting
                            domain="meet.jit.si"
                            roomName={roomName}
                            configOverwrite={{
                                startWithAudioMuted: true,
                                disableModeratorIndicator: true,
                                startScreenSharing: false,
                                enableEmailInStats: false,
                                prejoinPageEnabled: false,
                                hideConferenceTimer: true,
                                subject: 'War Room Flash',
                                toolbarButtons: [
                                    'microphone', 'camera', 'closedcaptions', 'desktop', 'fullscreen',
                                    'fodeviceselection', 'hangup', 'profile', 'chat', 'recording',
                                    'livestreaming', 'sharedvideo', 'settings', 'raisehand',
                                    'videoquality', 'filmstrip', 'tileview', 'videobackgroundblur', 'help'
                                ],
                            }}
                            interfaceConfigOverwrite={{
                                DISABLE_JOIN_LEAVE_NOTIFICATIONS: true,
                                SHOW_JITSI_WATERMARK: false,
                                SHOW_WATERMARK_FOR_GUESTS: false,
                                SHOW_BRAND_WATERMARK: false,
                                BRAND_WATERMARK_LINK: '',
                                DEFAULT_BACKGROUND: '#020617',
                            }}
                            userInfo={{
                                displayName: userName,
                                email: ''
                            }}
                            onApiReady={(externalApi: any) => {
                                externalApi.addEventListeners({
                                    videoConferenceJoined: handleJoined,
                                    videoConferenceLeft: handleLeave,
                                    readyToHangup: handleReadyToHangup,
                                    participantRoleChanged: (event: any) => {
                                        console.log('[Jitsi] Role change:', event);
                                    }
                                });
                            }}
                            getIFrameRef={(iframeRef) => {
                                iframeRef.style.height = '100%';
                                iframeRef.style.width = '100%';
                            }}
                        />
                    </div>

                    {/* Termination Overlay */}
                    {isTerminated && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-8 bg-[#020617] animate-in zoom-in-95 duration-500 z-10">
                            <div className="relative mb-8">
                                <div className="absolute inset-0 bg-blue-500/20 blur-[50px] rounded-full" />
                                <div className="relative w-24 h-24 bg-blue-600 rounded-[2rem] flex items-center justify-center shadow-2xl shadow-blue-500/40 border border-white/10 active:scale-95 transition-transform">
                                    <Zap className="w-12 h-12 text-yellow-300 fill-current drop-shadow-[0_0_8px_rgba(253,224,71,0.6)] animate-vibrate-fast" />
                                </div>
                                <div className="absolute -bottom-2 -right-2 bg-emerald-500 text-white rounded-full p-2 shadow-lg scale-110 animate-bounce">
                                    <CheckCircle2 className="w-6 h-6" />
                                </div>
                            </div>

                            <h3 className="text-2xl font-black text-white uppercase tracking-tighter mb-2">
                                Transmissão Encerrada
                            </h3>
                            <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px] mb-8 max-w-xs">
                                A sala de operação foi desativada. As coordenadas e logs foram salvos no sistema.
                            </p>

                            <button
                                onClick={onClose}
                                className="px-8 py-3 bg-white text-slate-950 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-blue-50 transition-all active:scale-95 shadow-xl shadow-white/5"
                            >
                                Sair da Sala
                            </button>

                            {/* Background Decorations */}
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60%] h-[60%] bg-blue-600/5 rounded-full blur-[100px] pointer-events-none" />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
