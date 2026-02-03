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
            title="Configurações de Perfil"
            subtitle="Atualize suas informações de rede"
            footer={
                <Button
                    variant="primary"
                    fullWidth
                    isLoading={isLoading}
                    onClick={onSave}
                >
                    Salvar Alterações
                </Button>
            }
        >
            <form className="space-y-6 py-2" onSubmit={onSave}>
                <div className="flex flex-col items-center gap-4 mb-6">
                    <div
                        className="relative group cursor-pointer"
                        onClick={() => fileInputRef.current?.click()}
                    >
                        <Avatar src={avatarUrl} size="xl" className="ring-8 ring-blue-50" />
                        <div className="absolute inset-0 bg-black/40 rounded-2xl md:rounded-[1.5rem] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <Camera className="text-white w-6 h-6" />
                        </div>
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={e => {
                                const file = e.target.files?.[0];
                                if (file) onAvatarChange(file);
                            }}
                        />
                    </div>
                    <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest">Clique para alterar foto</p>
                </div>

                <Input
                    label="Frase de Status"
                    value={profilePhrase}
                    onChange={e => setProfilePhrase(e.target.value)}
                    placeholder="Ex: Em campo / Operacional hoje"
                />
            </form>
        </Modal>
    );
};
