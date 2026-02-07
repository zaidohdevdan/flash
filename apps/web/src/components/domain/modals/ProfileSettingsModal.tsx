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
}

export const ProfileSettingsModal: React.FC<ProfileSettingsModalProps> = ({
    isOpen,
    onClose,
    onSave,
    isLoading,
    profilePhrase,
    setProfilePhrase,
    onAvatarChange,
    avatarUrl
}) => {
    const fileInputRef = useRef<HTMLInputElement>(null);

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Perfil de Usuário"
            subtitle="Personalize sua identificação na rede"
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
                        Salvar
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
                        <p className="text-[10px] text-[var(--text-tertiary)]">Clique na imagem para alterar</p>
                    </div>
                </div>

                <div className="space-y-4 px-1">
                    <Input
                        label="Status Operacional"
                        value={profilePhrase}
                        onChange={e => setProfilePhrase(e.target.value)}
                        placeholder="Ex: Em operação / Disponível"
                        className="text-center"
                    />
                </div>
            </div>
        </Modal>
    );
};
