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
            title="Configurações de Perfil"
            subtitle="Atualize sua identidade na rede FLASH"
            maxWidth="sm"
            footer={
                <div className="flex gap-3">
                    <Button
                        variant="ghost"
                        onClick={onClose}
                        className="flex-1"
                    >
                        Cancelar
                    </Button>
                    <Button
                        variant="primary"
                        isLoading={isLoading}
                        onClick={onSave}
                        className="flex-1"
                    >
                        Salvar Alterações
                    </Button>
                </div>
            }
        >
            <div className="py-6">
                <div className="flex flex-col items-center gap-6 mb-8">
                    <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                        <div className="relative rounded-full ring-4 ring-[var(--bg-tertiary)] group-hover:ring-[var(--accent-secondary)] transition-all duration-300">
                            <Avatar src={avatarUrl} size="xl" />
                            <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all backdrop-blur-sm">
                                <Camera className="text-white w-6 h-6" />
                            </div>
                        </div>
                        <div className="absolute -bottom-2 -right-2 bg-[var(--bg-primary)] rounded-full p-1.5 shadow-md border border-[var(--border-subtle)] text-[var(--text-tertiary)] group-hover:text-[var(--accent-secondary)] transition-colors">
                            <Camera className="w-3.5 h-3.5" />
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
                        <p className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-widest mb-1">Foto de Perfil</p>
                        <p className="text-[10px] text-[var(--text-tertiary)]">Clique para alterar seu avatar</p>
                    </div>
                </div>

                <div className="space-y-4 px-1">
                    <Input
                        label="Status da Operação"
                        value={profilePhrase}
                        onChange={e => setProfilePhrase(e.target.value)}
                        placeholder="Ex: Em campo / QAP / Em deslocamento"
                        className="text-center"
                    />

                    {setNotificationsEnabled && (
                        <div className="flex items-center justify-between p-4 bg-[var(--bg-secondary)] rounded-2xl border border-[var(--border-subtle)] mt-2">
                            <div className="flex flex-col gap-0.5">
                                <span className="text-xs font-bold text-[var(--text-primary)] uppercase tracking-tight">Sons de Notificação</span>
                                <span className="text-[10px] text-[var(--text-tertiary)] font-medium">Alertas sonoros para novas mensagens</span>
                            </div>
                            <button
                                type="button"
                                title={notificationsEnabled ? 'Desativar sons' : 'Ativar sons'}
                                aria-label={notificationsEnabled ? 'Desativar sons de notificação' : 'Ativar sons de notificação'}
                                onClick={() => setNotificationsEnabled(!notificationsEnabled)}
                                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${notificationsEnabled ? 'bg-[var(--accent-primary)]' : 'bg-[var(--border-medium)]'}`}
                            >
                                <span
                                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${notificationsEnabled ? 'translate-x-5' : 'translate-x-0'}`}
                                />
                            </button>
                        </div>
                    )}

                    {setDesktopNotificationsEnabled && (
                        <div className="flex items-center justify-between p-4 bg-[var(--bg-secondary)] rounded-2xl border border-[var(--border-subtle)] mt-2">
                            <div className="flex flex-col gap-0.5">
                                <span className="text-xs font-bold text-[var(--text-primary)] uppercase tracking-tight">Desktop Notificações</span>
                                <span className="text-[10px] text-[var(--text-tertiary)] font-medium">Avisos do sistema via navegador</span>
                            </div>
                            <button
                                type="button"
                                title={desktopNotificationsEnabled ? 'Desativar notificações desktop' : 'Ativar notificações desktop'}
                                aria-label={desktopNotificationsEnabled ? 'Desativar notificações desktop' : 'Ativar notificações desktop'}
                                onClick={() => setDesktopNotificationsEnabled(!desktopNotificationsEnabled)}
                                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${desktopNotificationsEnabled ? 'bg-[var(--accent-primary)]' : 'bg-[var(--border-medium)]'}`}
                            >
                                <span
                                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${desktopNotificationsEnabled ? 'translate-x-5' : 'translate-x-0'}`}
                                />
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </Modal>
    );
};
