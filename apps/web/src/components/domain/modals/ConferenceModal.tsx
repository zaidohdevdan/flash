import React, { useState, useRef, useCallback, useEffect } from 'react';
import { JitsiMeeting } from '@jitsi/react-sdk';
import { X, Zap, CheckCircle2, UserPlus } from 'lucide-react';

interface JitsiParticipant {
    id: string;
    participantId?: string;
    displayName: string;
}

interface JitsiEvent {
    id: string;
    [key: string]: unknown;
}

interface JitsiApi {
    addEventListeners: (listeners: Record<string, (event: JitsiEvent) => void>) => void;
    getParticipantsInfo: () => JitsiParticipant[];
    _myUserID: string;
}

interface ConferenceModalProps {
    isOpen: boolean;
    onClose: () => void;
    roomName: string;
    userName?: string;
    userId?: string;
    onInviteClick?: () => void;
    onParticipantsUpdate?: (ids: string[]) => void;
}

export const ConferenceModal: React.FC<ConferenceModalProps> = ({
    isOpen,
    onClose,
    roomName,
    userName = 'Operador Flash',
    userId,
    onInviteClick,
    onParticipantsUpdate
}) => {
    const [isTerminated, setIsTerminated] = useState(false);
    const [isReconnecting, setIsReconnecting] = useState(false);
    const [mountKey, setMountKey] = useState(0);
    const terminateTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const userIntendsToLeaveRef = useRef(false);

    // Resetar estado quando o modal abrir/fechar
    useEffect(() => {
        if (!isOpen) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
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

    // Efeito para recarregar a página em caso de oscilação (solicitação do usuário)
    useEffect(() => {
        if (isReconnecting) {
            console.log('[Jitsi] Oscilação detectada. Recarregando a página em 2s...');
            const reloadTimer = setTimeout(() => {
                window.location.reload();
            }, 2000);
            return () => clearTimeout(reloadTimer);
        }
    }, [isReconnecting]);

    const handleReadyToHangup = useCallback(() => {
        console.log('[Jitsi] Intenção de saída: Hangup clicado.');
        userIntendsToLeaveRef.current = true;
    }, []);

    const handleLeave = useCallback((event: unknown) => {
        console.log('[Jitsi] Evento left detectado:', event);

        if (terminateTimeoutRef.current) clearTimeout(terminateTimeoutRef.current);

        if (userIntendsToLeaveRef.current) {
            console.log('[Jitsi] Encerramento confirmado (intencional)');
            setIsTerminated(true);
            setIsReconnecting(false);
            return;
        }

        console.log('[Jitsi] Saída não intencional detectada. Tentando reconexão...');
        setIsReconnecting(true);

        terminateTimeoutRef.current = setTimeout(() => {
            console.log('[Jitsi] Re-entry não detectado após 10s. Encerrando sessão.');
            setIsReconnecting(false);
            setIsTerminated(true);
        }, 10000);
    }, []);

    const handleJoined = useCallback((event: unknown) => {
        console.log('[Jitsi] Usuário entrou/re-entrou:', event);
        setIsReconnecting(false);
        setIsTerminated(false);
        if (terminateTimeoutRef.current) {
            console.log('[Jitsi] Re-entry detectado. Cancelando timeout de finalização.');
            clearTimeout(terminateTimeoutRef.current);
            terminateTimeoutRef.current = null;
        }
    }, []);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-0 md:p-10 animate-in fade-in duration-300">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-slate-900/40 backdrop-blur-md"
                onClick={onClose}
            />

            {/* Modal Content */}
            <div className="relative w-full h-full md:max-w-6xl md:h-[85vh] bg-[var(--bg-primary)] rounded-none md:rounded-[2.5rem] shadow-2xl overflow-hidden border border-[var(--border-subtle)] flex flex-col">
                {/* Header */}
                <div className="px-6 py-4 bg-[var(--bg-primary)] border-b border-[var(--border-subtle)] flex justify-between items-center shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                        <h2 className="text-sm font-black text-[var(--text-primary)] uppercase tracking-widest">War Room Operacional</h2>
                        <span className="text-[10px] text-[var(--text-tertiary)] font-bold bg-[var(--bg-secondary)] px-2 py-1 rounded-md uppercase border border-[var(--border-subtle)]">AO VIVO</span>
                    </div>

                    <div className="flex items-center gap-2">
                        {onInviteClick && (
                            <button
                                type="button"
                                onClick={onInviteClick}
                                className="flex items-center gap-2 px-4 py-2 hover:bg-[var(--bg-secondary)] rounded-xl transition-all text-[var(--accent-primary)] font-black uppercase tracking-widest text-[10px] border border-[var(--accent-primary)]/20"
                                title="Convidar Mais Membros"
                            >
                                <UserPlus className="w-4 h-4" />
                                <span className="hidden sm:inline">Convidar</span>
                            </button>
                        )}

                        <button
                            type="button"
                            onClick={onClose}
                            className="p-2 hover:bg-[var(--bg-secondary)] rounded-xl transition-colors text-[var(--text-tertiary)] hover:text-[var(--text-primary)]"
                            title="Sair da Sala"
                        >
                            <X className="w-6 h-6" />
                        </button>
                    </div>
                </div>

                {/* Content Area */}
                <div className="flex-1 bg-[var(--bg-secondary)] relative overflow-hidden">
                    {/* Jitsi Meeting */}
                    <div className={`absolute inset-0 transition-opacity duration-500 ${isTerminated ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
                        <JitsiMeeting
                            key={mountKey}
                            domain="meet.ffmuc.net"
                            roomName={roomName}
                            configOverwrite={{
                                startWithAudioMuted: true,
                                startWithVideoMuted: true,
                                disableModeratorIndicator: true,
                                startScreenSharing: false,
                                enableEmailInStats: false,
                                prejoinPageEnabled: false,
                                lobbyModeEnabled: false,
                                enableLobby: false,
                                p2p: { enabled: true },
                                disableP2P: false,
                                preferH264: true,
                                enableLayerSuspension: true,
                                hideConferenceTimer: true,
                                subject: 'War Room Flash',
                                defaultLanguage: 'pt-br',
                                lang: 'pt-BR',
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
                                DEFAULT_BACKGROUND: 'linear-gradient(to bottom, #0f172a, #1e293b)',
                            }}
                            userInfo={{
                                displayName: userName,
                                email: '',
                                id: userId
                            } as { id?: string; displayName: string; email: string }}
                            onApiReady={(api: unknown) => {
                                const externalApi = api as JitsiApi;
                                externalApi.addEventListeners({
                                    videoConferenceJoined: (event: JitsiEvent) => {
                                        handleJoined(event);
                                        // Notificar lista inicial (eu)
                                        onParticipantsUpdate?.([event.id]);
                                    },
                                    videoConferenceLeft: (event: JitsiEvent) => {
                                        handleLeave(event);
                                        onParticipantsUpdate?.([]);
                                    },
                                    participantJoined: (event: JitsiEvent) => {
                                        console.log('[Jitsi] Participant joined:', event);
                                        const info = externalApi.getParticipantsInfo();
                                        const ids = info.map((p: JitsiParticipant) => p.participantId || p.id);
                                        // Incluir eu mesmo (local)
                                        const myId = externalApi._myUserID || userId;
                                        if (myId) onParticipantsUpdate?.(Array.from(new Set([myId, ...ids])));
                                    },
                                    participantLeft: (event: JitsiEvent) => {
                                        console.log('[Jitsi] Participant left:', event);
                                        const info = externalApi.getParticipantsInfo();
                                        const ids = info.map((p: JitsiParticipant) => p.participantId || p.id);
                                        const myId = externalApi._myUserID || userId;
                                        if (myId) onParticipantsUpdate?.(Array.from(new Set([myId, ...ids])));
                                    },
                                    readyToHangup: handleReadyToHangup,
                                    participantRoleChanged: (event: unknown) => {
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

                    {/* Reconnection Overlay */}
                    {isReconnecting && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-8 bg-slate-900/60 backdrop-blur-sm z-20 animate-in fade-in duration-300">
                            <div className="w-16 h-16 border-4 border-[var(--accent-primary)]/20 border-t-[var(--accent-primary)] rounded-full animate-spin mb-6" />
                            <h3 className="text-xl font-black text-white uppercase tracking-tighter mb-2">
                                Reconectando...
                            </h3>
                            <p className="text-slate-300 font-bold uppercase tracking-widest text-[10px] max-w-xs">
                                Houve uma oscilação na ponte de vídeo. Aguarde um instante enquanto estabilizamos sua conexão.
                            </p>
                        </div>
                    )}

                    {/* Termination Overlay */}
                    {isTerminated && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-8 bg-[var(--bg-primary)] animate-in zoom-in-95 duration-500 z-10">
                            <div className="relative mb-8">
                                <div className="absolute inset-0 bg-[var(--accent-primary)]/20 blur-[50px] rounded-full" />
                                <div className="relative w-24 h-24 bg-[var(--accent-primary)] rounded-[2rem] flex items-center justify-center shadow-2xl shadow-[var(--accent-primary)]/40 border border-[var(--border-subtle)] active:scale-95 transition-transform">
                                    <Zap className="w-12 h-12 text-[var(--accent-text)] fill-current drop-shadow-[0_0_8px_rgba(253,224,71,0.6)] animate-vibrate-fast" />
                                </div>
                                <div className="absolute -bottom-2 -right-2 bg-emerald-500 text-white rounded-full p-2 shadow-lg scale-110 animate-bounce">
                                    <CheckCircle2 className="w-6 h-6" />
                                </div>
                            </div>

                            <h3 className="text-2xl font-black text-[var(--text-primary)] uppercase tracking-tighter mb-2">
                                Conferência Encerrada
                            </h3>
                            <p className="text-[var(--text-tertiary)] font-bold uppercase tracking-widest text-[10px] mb-8 max-w-xs">
                                Todos os registros foram salvos e a sala foi liberada.
                            </p>

                            <div className="flex flex-col gap-3">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setIsTerminated(false);
                                        setIsReconnecting(false);
                                        setMountKey(prev => prev + 1);
                                        userIntendsToLeaveRef.current = false;
                                    }}
                                    className="px-8 py-3 bg-[var(--accent-primary)] text-[var(--accent-text)] rounded-2xl font-black uppercase tracking-widest text-xs hover:brightness-110 transition-all active:scale-95 shadow-xl shadow-[var(--accent-primary)]/20"
                                >
                                    Retorne Já!
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        userIntendsToLeaveRef.current = true;
                                        onClose();
                                    }}
                                    className="px-8 py-2 text-[var(--text-tertiary)] font-bold uppercase tracking-widest text-[10px] hover:text-[var(--text-primary)] transition-colors"
                                >
                                    Sair da Sala
                                </button>
                            </div>

                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60%] h-[60%] bg-[var(--accent-primary)]/5 rounded-full blur-[100px] pointer-events-none" />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
