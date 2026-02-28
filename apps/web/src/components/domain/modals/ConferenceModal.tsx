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
    const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const intentionalExitRef = useRef(false); // Flag única e soberana

    // Resetar estado quando o modal abrir
    useEffect(() => {
        if (isOpen) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setIsTerminated(false);
            setIsReconnecting(false);
            intentionalExitRef.current = false;
        }

        // LIMPEZA CRÍTICA: Matar todos os timers ao desmontar ou fechar
        const termTimer = terminateTimeoutRef.current;
        const recTimer = reconnectTimeoutRef.current;
        return () => {
            if (termTimer) clearTimeout(termTimer);
            if (recTimer) clearTimeout(recTimer);
        };
    }, [isOpen]);

    const handleCleanExit = useCallback(() => {
        console.log('[Jitsi] Saída limpa disparada.');
        intentionalExitRef.current = true;

        // Limpar timers imediatamente
        if (terminateTimeoutRef.current) clearTimeout(terminateTimeoutRef.current);
        if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);

        // Forçar estados de sumiço do Jitsi e exibição da tela de término
        setIsReconnecting(false);
        setIsTerminated(true);

        // O onClose() só será chamado agora no botão final da tela de término
    }, []);

    const handleReadyToHangup = useCallback(() => {
        console.log('[Jitsi] Evento Hangup (Botão Vermelho).');
        handleCleanExit();
    }, [handleCleanExit]);

    const handleLeave = useCallback((event: unknown) => {
        console.log('[Jitsi] Conferência finalizada com sucesso (videoConferenceLeft).', event);
        handleCleanExit();
    }, [handleCleanExit]);

    const handleConnectionFailed = useCallback((event: unknown) => {
        console.log('[Jitsi] Queda de conexão/Erro detectado (conferenceFailed).', event);
        if (intentionalExitRef.current) return;

        setIsReconnecting(true);

        terminateTimeoutRef.current = setTimeout(() => {
            if (!intentionalExitRef.current) {
                setIsReconnecting(false);
                setIsTerminated(true);
            }
        }, 10000);
    }, []);

    const handleJoined = useCallback((event: unknown) => {
        console.log('[Jitsi] Usuário entrou/re-entrou:', event);
        if (intentionalExitRef.current) return;

        setIsReconnecting(false);
        setIsTerminated(false);

        if (terminateTimeoutRef.current) clearTimeout(terminateTimeoutRef.current);
        if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);
    }, []);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-0 md:p-10 animate-in fade-in duration-500">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-xl"
                onClick={onClose}
            />

            {/* Modal Content */}
            <div className="relative w-full h-full md:max-w-6xl md:h-[85vh] bg-white dark:bg-[#020617] rounded-none md:rounded-[3rem] shadow-2xl overflow-hidden border border-slate-200 dark:border-white/5 flex flex-col backdrop-blur-3xl">
                {/* Header */}
                <div className="px-8 py-6 bg-slate-50 dark:bg-black/40 border-b border-slate-200 dark:border-white/5 flex justify-between items-center shrink-0 backdrop-blur-md">
                    <div className="flex items-center gap-4">
                        <div className="relative">
                            <div className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse shadow-[0_0_10px_rgba(244,63,94,0.6)]" />
                            <div className="absolute inset-0 w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
                        </div>
                        <div>
                            <h2 className="text-xs font-black text-slate-800 dark:text-white uppercase tracking-[0.3em] leading-none">War Room Operacional</h2>
                            <p className="text-[9px] font-black text-indigo-500 dark:text-indigo-400 uppercase tracking-widest mt-1.5 opacity-80">Conexão Segura Ativa</p>
                        </div>
                        <span className="ml-2 text-[9px] text-white font-black bg-rose-600 px-3 py-1 rounded-full uppercase tracking-widest border border-rose-500/30">AO VIVO</span>
                    </div>

                    <div className="flex items-center gap-4">
                        {onInviteClick && (
                            <button
                                type="button"
                                onClick={onInviteClick}
                                className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600/10 hover:bg-indigo-600/20 rounded-xl transition-all text-indigo-400 font-black uppercase tracking-widest text-[10px] border border-indigo-500/30 shadow-lg shadow-indigo-500/10 active:scale-95"
                                title="Convidar Mais Membros"
                            >
                                <UserPlus className="w-4 h-4" />
                                <span className="hidden sm:inline">Convocar</span>
                            </button>
                        )}

                        <button
                            type="button"
                            onClick={handleCleanExit}
                            className="p-3 bg-slate-100 dark:bg-white/5 hover:bg-rose-500/10 dark:hover:bg-rose-500/20 rounded-2xl transition-all text-slate-500 dark:text-slate-400 hover:text-rose-500 dark:hover:text-rose-400 border border-slate-200 dark:border-white/5 active:scale-90"
                            title="Sair da Sala"
                        >
                            <X className="w-6 h-6" />
                        </button>
                    </div>
                </div>

                {/* Content Area */}
                <div className="flex-1 bg-slate-900 dark:bg-black relative overflow-hidden">
                    {/* Jitsi Meeting */}
                    <div className="absolute inset-0">
                        {!isTerminated && (
                            <JitsiMeeting
                                key={mountKey}
                                domain="meet.ffmuc.net"
                                roomName={roomName}
                                configOverwrite={{
                                    startWithAudioMuted: false,
                                    startWithVideoMuted: false,
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
                                    DEFAULT_BACKGROUND: '#020617',
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
                                            onParticipantsUpdate?.([event.id]);
                                        },
                                        videoConferenceLeft: (event: JitsiEvent) => {
                                            handleLeave(event);
                                            onParticipantsUpdate?.([]);
                                        },
                                        conferenceFailed: (event: unknown) => {
                                            handleConnectionFailed(event);
                                        },
                                        suspended: (event: unknown) => {
                                            console.log('[Jitsi] Conexão suspensa.');
                                            handleConnectionFailed(event);
                                        },
                                        readyToHangup: handleReadyToHangup,
                                        hangup: () => {
                                            console.log('[Jitsi] Comando HANGUP recebido.');
                                            handleCleanExit();
                                        },
                                        toolbarButtonClicked: (event: { key?: string; id?: string }) => {
                                            if (event.key === 'hangup' || event.id === 'hangup') {
                                                console.log('[Jitsi] Clique no Hangup detectado!');
                                                handleCleanExit();
                                            }
                                        },
                                        participantJoined: (event: JitsiEvent) => {
                                            console.log('[Jitsi] Participant joined:', event);
                                            const info = externalApi.getParticipantsInfo();
                                            const ids = info.map((p: JitsiParticipant) => p.participantId || p.id);
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
                        )}
                    </div>

                    {/* Reconnection Overlay */}
                    {isReconnecting && !isTerminated && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-8 bg-black/80 backdrop-blur-xl z-20 animate-in fade-in duration-300">
                            <div className="w-20 h-20 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin mb-8 shadow-2xl shadow-indigo-500/20" />
                            <h3 className="text-2xl font-black text-white uppercase tracking-[0.4em] mb-3">
                                Reconectando...
                            </h3>
                            <p className="text-slate-500 font-bold uppercase tracking-[0.2em] text-[10px] max-w-sm leading-relaxed">
                                HOUVE UMA OSCILAÇÃO NA PONTE DE VÍDEO.<br />AGUARDE ENQUANTO REESTABELECEMOS O CANAL.
                            </p>
                        </div>
                    )}

                    {/* Termination Overlay */}
                    {isTerminated && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-8 bg-white dark:bg-[#020617] animate-in zoom-in-95 duration-700 z-30">
                            <div className="relative mb-12">
                                <div className="absolute inset-0 bg-indigo-500/20 blur-[80px] rounded-full" />
                                <div className="relative w-32 h-32 bg-indigo-600 rounded-[2.5rem] flex items-center justify-center shadow-2xl shadow-indigo-500/40 border border-indigo-300 dark:border-white/10 active:scale-95 transition-transform duration-500 group">
                                    <Zap className="w-16 h-16 text-white fill-current drop-shadow-[0_0_15px_rgba(255,255,255,0.4)] animate-pulse" />
                                </div>
                                <div className="absolute -bottom-3 -right-3 bg-emerald-500 text-white rounded-2xl p-3 shadow-2xl scale-110 animate-bounce border-4 border-white dark:border-[#020617]">
                                    <CheckCircle2 className="w-8 h-8" />
                                </div>
                            </div>

                            <h3 className="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-[0.4em] mb-4">
                                Canal Desativado
                            </h3>
                            <p className="text-slate-500 font-black uppercase tracking-[0.2em] text-[10px] mb-12 max-w-sm leading-relaxed">
                                TODOS OS REGISTROS DE ÁUDIO E VÍDEO FORAM<br />DEVIDAMENTE INDEXADOS E A SALA LIBERADA.
                            </p>

                            <div className="flex flex-col sm:flex-row gap-5">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setIsTerminated(false);
                                        setIsReconnecting(false);
                                        setMountKey(prev => prev + 1);
                                        intentionalExitRef.current = false;
                                    }}
                                    className="px-12 py-4 bg-indigo-600 text-white rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-indigo-500 transition-all active:scale-95 shadow-2xl shadow-indigo-600/30 border border-indigo-400/20"
                                >
                                    Reativar Canal
                                </button>
                                <button
                                    type="button"
                                    onClick={onClose}
                                    className="px-12 py-4 bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-slate-200 dark:hover:bg-white/10 transition-all border border-slate-200 dark:border-white/5"
                                >
                                    Sair da Sala
                                </button>
                            </div>

                            <div className="absolute bottom-10 left-1/2 -translate-x-1/2 opacity-20">
                                <div className="flex gap-2">
                                    <div className="w-1 h-1 bg-slate-500 rounded-full" />
                                    <div className="w-1 h-1 bg-slate-500 rounded-full" />
                                    <div className="w-1 h-1 bg-slate-500 rounded-full" />
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
