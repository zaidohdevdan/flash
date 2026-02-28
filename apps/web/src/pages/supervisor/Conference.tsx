import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { JitsiMeeting } from '@jitsi/react-sdk';
import {
    Zap,
    CheckCircle2,
    ShieldAlert,
    Video,
    Mic,
    Monitor as MonitorIcon,
    ArrowLeft,
    UserPlus
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { InviteConferenceModal } from '../../components/domain/modals/InviteConferenceModal';
import { api } from '../../services/api';
import { toast } from 'react-hot-toast';
import { useDashboardSocket } from '../../hooks/useDashboardSocket';

export function Conference() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const roomName = searchParams.get('room') || `war-room-${user?.id?.slice(-4) || 'flash'}`;
    const initialInviteId = searchParams.get('invite');

    const [isTerminated, setIsTerminated] = useState(false);
    const [isReady, setIsReady] = useState(false);
    const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
    const [availableParticipants, setAvailableParticipants] = useState<{ id: string; name: string; role: string; avatarUrl?: string | null }[]>([]);

    const socketUser = user ? { id: user.id || '', name: user.name || '', role: user.role || '' } : null;
    const { onlineUserIds } = useDashboardSocket({ user: socketUser });

    // Auto-invite if param is present
    useEffect(() => {
        if (initialInviteId && isReady) {
            api.post('/conference/invite', {
                roomId: roomName,
                participants: [initialInviteId]
            }).catch(err => console.error('Error sending initial invite', err));
        }
    }, [initialInviteId, isReady, roomName]);

    useEffect(() => {
        const fetchParticipants = async () => {
            try {
                const [subRes, supportRes] = await Promise.all([
                    api.get('/subordinates'),
                    api.get('/support-network')
                ]);

                // Unify and filter only online users (excluding self)
                const all = [...subRes.data, ...supportRes.data];
                const unique = Array.from(new Map(all.map((u: { id: string }) => [u.id, u])).values()) as { id: string; name: string; role: string; avatarUrl?: string | null }[];
                const online = unique.filter((u) =>
                    u.id !== user?.id && onlineUserIds.includes(u.id)
                );

                setAvailableParticipants(online);
            } catch (err) {
                console.error('Error fetching conference participants', err);
            }
        };

        if (isInviteModalOpen) {
            fetchParticipants();
        }
    }, [isInviteModalOpen, user?.id, onlineUserIds]);

    const handleSendInvites = async (selectedIds: string[]) => {
        try {
            await api.post('/conference/invite', {
                roomId: roomName,
                participants: selectedIds
            });
            toast.success(`${selectedIds.length} convite(s) enviado(s)`);
            setIsInviteModalOpen(false);
        } catch (error) {
            console.error('Error sending invites:', error);
            toast.error('Erro ao enviar convites');
        }
    };

    const handleTerminated = () => {
        setIsTerminated(true);
    };

    return (
        <div className="h-screen w-full bg-[#020617] flex flex-col overflow-hidden animate-in fade-in duration-700">
            {/* Tactical Header */}
            <div className="h-16 flex-shrink-0 flex items-center justify-between px-6 border-b border-white/5 bg-black/40 backdrop-blur-xl z-20">
                <div className="flex items-center gap-6">
                    <button
                        onClick={() => navigate(-1)}
                        className="p-2 hover:bg-white/5 rounded-xl text-slate-400 hover:text-white transition-all group"
                        title="Voltar"
                    >
                        <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                    </button>

                    <div className="flex items-center gap-4 border-l border-white/10 pl-6">
                        <div className="relative">
                            <div className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse shadow-[0_0_10px_rgba(244,63,94,0.6)]" />
                            <div className="absolute inset-0 w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
                        </div>
                        <div>
                            <h2 className="text-[11px] font-black text-white uppercase tracking-[0.3em] leading-none">War Room Operacional</h2>
                            <p className="text-[9px] font-black text-indigo-400 uppercase tracking-widest mt-1.5 opacity-80">Conexão Segura Ativa</p>
                        </div>
                        <span className="ml-2 text-[9px] text-white font-black bg-rose-600 px-3 py-1 rounded-full uppercase tracking-widest border border-rose-500/30">AO VIVO</span>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setIsInviteModalOpen(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 rounded-xl border border-indigo-500/20 transition-all font-black uppercase tracking-widest text-[9px]"
                        title="Convidar Operadores"
                    >
                        <UserPlus className="w-3.5 h-3.5" />
                        Convidar
                    </button>

                    <div className="hidden md:flex flex-col items-end mr-4">
                        <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">Sala Permanente</span>
                        <span className="text-[11px] font-mono text-indigo-400 uppercase tracking-wider">{roomName}</span>
                    </div>
                    <div className="px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center gap-2">
                        <ShieldAlert className="w-3 h-3 text-emerald-400" />
                        <span className="text-[9px] font-black text-emerald-400 uppercase tracking-widest">Encriptação P2P</span>
                    </div>
                </div>
            </div>

            {/* Content Area */}
            <div className="flex-1 relative flex">
                {/* Lateral Tactical HUD - Decorative */}
                <div className="hidden lg:flex flex-col w-12 border-r border-white/5 bg-black/20 items-center py-6 gap-6">
                    <Video className="w-4 h-4 text-white/20" />
                    <Mic className="w-4 h-4 text-white/20" />
                    <MonitorIcon className="w-4 h-4 text-white/20" />
                    <div className="mt-auto flex flex-col gap-1 items-center opacity-10">
                        <div className="w-1 h-1 bg-white rounded-full" />
                        <div className="w-1 h-4 bg-white rounded-full" />
                        <div className="w-1 h-1 bg-white rounded-full" />
                    </div>
                </div>

                {/* Jitsi Container */}
                <div className="flex-1 bg-black relative">
                    {!isTerminated ? (
                        <div className="absolute inset-0 transition-opacity duration-1000" style={{ opacity: isReady ? 1 : 0 }}>
                            <JitsiMeeting
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
                                    displayName: user?.name || 'Operador Flash',
                                    email: '',
                                    id: user?.id
                                } as { id?: string; displayName: string; email: string }}
                                onApiReady={(api: { addEventListeners: (listeners: Record<string, () => void>) => void; }) => {
                                    api.addEventListeners({
                                        videoConferenceLeft: handleTerminated,
                                        readyToHangup: handleTerminated,
                                    });
                                    setIsReady(true);
                                }}
                                getIFrameRef={(iframeRef) => {
                                    iframeRef.style.height = '100%';
                                    iframeRef.style.width = '100%';
                                    iframeRef.style.border = 'none';
                                }}
                            />
                        </div>
                    ) : (
                        <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-8 bg-[#020617] animate-in zoom-in-95 duration-700 z-30">
                            <div className="relative mb-12">
                                <div className="absolute inset-0 bg-indigo-500/20 blur-[80px] rounded-full" />
                                <div className="relative w-32 h-32 bg-indigo-600 rounded-[2.5rem] flex items-center justify-center shadow-2xl shadow-indigo-500/40 border border-indigo-300 dark:border-white/10 active:scale-95 transition-transform duration-500 group">
                                    <Zap className="w-16 h-16 text-white fill-current drop-shadow-[0_0_15px_rgba(255,255,255,0.4)] animate-pulse" />
                                </div>
                                <div className="absolute -bottom-3 -right-3 bg-emerald-500 text-white rounded-2xl p-3 shadow-2xl scale-110 animate-bounce border-4 border-[#020617]">
                                    <CheckCircle2 className="w-8 h-8" />
                                </div>
                            </div>

                            <h3 className="text-3xl font-black text-white uppercase tracking-[0.4em] mb-4">
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
                                        setIsReady(false);
                                    }}
                                    className="px-12 py-4 bg-indigo-600 text-white rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-indigo-500 transition-all active:scale-95 shadow-2xl shadow-indigo-600/30 border border-indigo-400/20"
                                >
                                    Reativar Canal
                                </button>
                                <button
                                    type="button"
                                    onClick={() => navigate('/supervisor/intelligence')}
                                    className="px-12 py-4 bg-white/5 text-slate-400 hover:text-white rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-white/10 transition-all border border-white/5"
                                >
                                    Sair da Sala
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Loading State */}
                    {!isReady && !isTerminated && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#020617] z-10 transition-opacity duration-1000">
                            <div className="relative">
                                <div className="w-20 h-20 border-4 border-indigo-500/10 border-t-indigo-500 rounded-full animate-spin mb-8" />
                                <Video className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 -mt-4 w-6 h-6 text-indigo-400 animate-pulse" />
                            </div>
                            <h3 className="text-sm font-black text-white uppercase tracking-[0.3em] animate-pulse">
                                Sincronizando Ponte de Vídeo
                            </h3>
                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-4">
                                Iniciando criptografia de canal...
                            </p>
                        </div>
                    )}
                </div>
            </div>

            {/* Invitation Modal */}
            <InviteConferenceModal
                isOpen={isInviteModalOpen}
                onClose={() => setIsInviteModalOpen(false)}
                participants={availableParticipants}
                onConfirm={handleSendInvites}
                isAdding={true}
            />
        </div>
    );
}
