import React, { useRef } from 'react';
import { Camera } from 'lucide-react';
import { Modal, Button, Avatar, Input } from '../../ui';

interface ProfileSettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (e: React.FormEvent) => void;
    isLoading: boolean;
    profilePhrase: string;
    setProfilePhrase: (val: string) => void;
    onAvatarChange: (file: File) => void;
    avatarUrl?: string | null;
    notificationsEnabled?: boolean;
    setNotificationsEnabled?: (enabled: boolean) => void;
    desktopNotificationsEnabled?: boolean;
    setDesktopNotificationsEnabled?: (enabled: boolean) => void;
}

export const ProfileSettingsModal: React.FC<ProfileSettingsModalProps> = ({
    isOpen,
    onClose,
    onSave,
    isLoading,
    profilePhrase,
    setProfilePhrase,
    onAvatarChange,
    avatarUrl,
    notificationsEnabled,
    setNotificationsEnabled,
    desktopNotificationsEnabled,
    setDesktopNotificationsEnabled
}) => {
    const fileInputRef = useRef<HTMLInputElement>(null);

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Sincronização de Identidade"
            subtitle="ATUALIZE SUA ASSINATURA TÁTICA NA REDE FLASH"
            maxWidth="sm"
            footer={
                <div className="flex gap-4 w-full">
                    <Button
                        variant="secondary"
                        onClick={onClose}
                        className="flex-1 bg-white/5 border-white/5 text-slate-400 font-black uppercase tracking-widest text-[11px] h-12 !rounded-xl"
                    >
                        Abortar
                    </Button>
                    <Button
                        variant="primary"
                        isLoading={isLoading}
                        onClick={onSave}
                        className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white font-black uppercase tracking-[0.2em] text-[11px] h-12 !rounded-xl shadow-2xl shadow-indigo-600/20"
                    >
                        Indexar Perfil
                    </Button>
                </div>
            }
        >
            <div className="py-8">
                <div className="flex flex-col items-center gap-6 mb-10">
                    <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                        <div className="relative rounded-full ring-4 ring-white/5 group-hover:ring-indigo-500/50 transition-all duration-500 p-1 bg-black/40 backdrop-blur-md">
                            <Avatar src={avatarUrl} size="xl" className="border-2 border-white/10" />
                            <div className="absolute inset-0 bg-indigo-900/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all backdrop-blur-md border border-indigo-500/30">
                                <Camera className="text-white w-8 h-8 drop-shadow-lg" />
                            </div>
                        </div>
                        <div className="absolute -bottom-1 -right-1 bg-indigo-600 rounded-2xl p-2.5 shadow-2xl border-2 border-[#020617] text-white group-hover:bg-indigo-500 transition-colors animate-bounce">
                            <Camera className="w-4 h-4" />
                        </div>
                    </div>

                    <input
                        ref={fileInputRef}
                        type="file"
                        title='Imagem de Perfil'
                        accept="image/*"
                        className="hidden"
                        onChange={e => {
                            const file = e.target.files?.[0];
                            if (file) onAvatarChange(file);
                        }}
                    />

                    <div className="text-center">
                        <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.3em] mb-2">IDENTIFICAÇÃO VISUAL</p>
                        <p className="text-[10px] text-slate-600 dark:text-slate-500 font-black uppercase tracking-widest">CLIQUE PARA ATUALIZAR AVATAR</p>
                    </div>
                </div>

                <div className="space-y-6">
                    <Input
                        label="FREQUÊNCIA DE STATUS"
                        value={profilePhrase}
                        onChange={e => setProfilePhrase(e.target.value)}
                        placeholder="EX: QAP OPERACIONAL / EM CAMPO..."
                        className="text-center font-black uppercase tracking-widest text-white bg-black/40 border-white/5 rounded-2xl h-14 focus:border-indigo-500/50"
                    />

                    <div className="space-y-3">
                        <label className="text-[11px] font-black text-slate-500 uppercase tracking-[0.3em] ml-1">PROTOCOLOS DE ALERTA</label>

                        {setNotificationsEnabled && (
                            <div className="flex items-center justify-between p-5 bg-black/40 rounded-2xl border border-white/5 backdrop-blur-md">
                                <div className="flex flex-col gap-1">
                                    <span className="text-[11px] font-black text-white uppercase tracking-widest">SINALIZAÇÃO SONORA</span>
                                    <span className="text-[10px] text-slate-500 font-black uppercase tracking-tight">ALERTAS AUDITIVOS DA REDE</span>
                                </div>
                                <button
                                    type="button"
                                    title={notificationsEnabled ? 'Desativar sons' : 'Ativar sons'}
                                    aria-label={notificationsEnabled ? 'Desativar sons de notificação' : 'Ativar sons de notificação'}
                                    onClick={() => setNotificationsEnabled(!notificationsEnabled)}
                                    className={`relative inline-flex h-7 w-12 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-all duration-300 ease-in-out focus:outline-none shadow-inner ${notificationsEnabled ? 'bg-indigo-600' : 'bg-slate-800'}`}
                                >
                                    <span
                                        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-xl ring-0 transition-all duration-300 ease-in-out mt-0.5 ${notificationsEnabled ? 'translate-x-5' : 'translate-x-0'}`}
                                    />
                                </button>
                            </div>
                        )}

                        {setDesktopNotificationsEnabled && (
                            <div className="flex items-center justify-between p-5 bg-black/40 rounded-2xl border border-white/5 backdrop-blur-md">
                                <div className="flex flex-col gap-1">
                                    <span className="text-[11px] font-black text-white uppercase tracking-widest">HUD DE DESKTOP</span>
                                    <span className="text-[10px] text-slate-500 font-black uppercase tracking-tight">NOTIFICAÇÕES DE NÍVEL DE SISTEMA</span>
                                </div>
                                <button
                                    type="button"
                                    title={desktopNotificationsEnabled ? 'Desativar notificações desktop' : 'Ativar notificações desktop'}
                                    aria-label={desktopNotificationsEnabled ? 'Desativar notificações desktop' : 'Ativar notificações desktop'}
                                    onClick={() => setDesktopNotificationsEnabled(!desktopNotificationsEnabled)}
                                    className={`relative inline-flex h-7 w-12 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-all duration-300 ease-in-out focus:outline-none shadow-inner ${desktopNotificationsEnabled ? 'bg-indigo-600' : 'bg-slate-800'}`}
                                >
                                    <span
                                        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-xl ring-0 transition-all duration-300 ease-in-out mt-0.5 ${desktopNotificationsEnabled ? 'translate-x-5' : 'translate-x-0'}`}
                                    />
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </Modal>
    );
};
