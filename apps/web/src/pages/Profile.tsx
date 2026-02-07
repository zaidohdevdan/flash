import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../services/api';
import { Button, Card } from '../components/ui';
import { DashboardLayout } from '../layouts/DashboardLayout';
import { Camera, Save, User, Mail, Shield, Briefcase, MessageSquare } from 'lucide-react';
import { toast } from 'react-hot-toast';

export function Profile() {
    const { user, signOut, updateUser } = useAuth();
    const navigate = useNavigate();
    const [statusPhrase, setStatusPhrase] = useState('');
    const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
    const [avatarFile, setAvatarFile] = useState<File | null>(null);
    const [loading, setLoading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (user) {
            setStatusPhrase(user.statusPhrase || '');
            setAvatarPreview(user.avatarUrl || null);
        }
    }, [user]);

    const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setAvatarFile(file);
            setAvatarPreview(URL.createObjectURL(file));
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();

        if (user?.role === 'ADMIN') {
            toast.error('Administradores não podem realizar alterações no próprio perfil por normas de segurança.', { icon: '🛡️' });
            return;
        }

        setLoading(true);

        try {
            let avatarUrl = user?.avatarUrl;

            // 1. Upload Avatar se houver novo arquivo
            if (avatarFile) {
                const formData = new FormData();
                formData.append('file', avatarFile);
                formData.append('upload_preset', 'flash_preset');
                formData.append('folder', 'avatars'); // Opcional, se o preset permitir

                const cloudinaryRes = await fetch('https://api.cloudinary.com/v1_1/dfr8mjlnb/image/upload', {
                    method: 'POST',
                    body: formData
                });

                if (!cloudinaryRes.ok) throw new Error('Falha no upload do avatar');

                const cloudinaryJson = await cloudinaryRes.json();
                avatarUrl = cloudinaryJson.secure_url;
            }

            // 2. Atualizar Perfil no Backend
            const response = await api.patch('/profile', {
                statusPhrase,
                avatarUrl
            });

            // 3. Atualizar Contexto
            updateUser(response.data);
            toast.success('Perfil atualizado com sucesso!', { icon: '✨' });
            setAvatarFile(null);

            // Redirecionar baseado na role
            setTimeout(() => {
                if (user?.role === 'SUPERVISOR') navigate('/dashboard');
                else if (user?.role === 'MANAGER') navigate('/manager-dashboard');
                else if (user?.role === 'ADMIN') navigate('/admin-dashboard');
                else navigate('/create-report');
            }, 1000);

        } catch (error) {
            console.error(error);
            toast.error('Erro ao atualizar perfil.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <DashboardLayout
            user={{ name: user?.name, avatarUrl: user?.avatarUrl, role: user?.role }}
            onLogout={signOut}
        >
            <div className="max-w-4xl mx-auto w-full animate-in fade-in duration-500">
                <div className="mb-8">
                    <h1 className="text-2xl font-bold text-[var(--text-primary)] uppercase tracking-tight">Meu Perfil</h1>
                    <p className="text-xs text-[var(--text-tertiary)] font-bold uppercase tracking-widest mt-1">Gerencie sua identidade no Flash</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Coluna da Esquerda: Avatar e Status */}
                    <div className="md:col-span-1 space-y-6">
                        <Card variant="white" className="p-6 flex flex-col items-center text-center border-[var(--border-subtle)] h-full">
                            <div className="relative group cursor-pointer" onClick={() => user?.role !== 'ADMIN' && fileInputRef.current?.click()}>
                                <div className={`w-32 h-32 rounded-full overflow-hidden ring-4 transition-all shadow-sm ${user?.role === 'ADMIN' ? 'ring-[var(--border-subtle)] opacity-80 cursor-not-allowed' : 'ring-[var(--bg-tertiary)] group-hover:ring-[var(--accent-secondary)]'}`}>
                                    {avatarPreview ? (
                                        <img src={avatarPreview} alt="Avatar" className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full bg-[var(--bg-tertiary)] flex items-center justify-center text-[var(--text-secondary)] text-4xl font-bold">
                                            {user?.name.charAt(0)}
                                        </div>
                                    )}
                                </div>
                                {user?.role !== 'ADMIN' && (
                                    <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all backdrop-blur-sm">
                                        <Camera className="w-8 h-8 text-white" />
                                    </div>
                                )}
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    title="Alterar foto de perfil"
                                    className="hidden"
                                    accept="image/*"
                                    onChange={handleAvatarChange}
                                />
                            </div>

                            <h2 className="mt-4 text-lg font-bold text-[var(--text-primary)]">{user?.name}</h2>
                            <span className="px-3 py-1 bg-[var(--bg-tertiary)] text-[var(--text-secondary)] rounded-full text-[10px] font-bold uppercase tracking-wider mt-2 border border-[var(--border-subtle)]">
                                {user?.role}
                            </span>
                        </Card>
                    </div>

                    {/* Coluna da Direita: Formulário e Detalhes */}
                    <div className="md:col-span-2 space-y-6">
                        <Card variant="white" className="p-6 border-[var(--border-subtle)]">
                            <form onSubmit={handleSave} className="space-y-6">
                                <div>
                                    <label htmlFor="status-phrase" className="block text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wide mb-2 flex items-center gap-2">
                                        <MessageSquare className="w-4 h-4" />
                                        Frase de Status
                                    </label>
                                    <input
                                        id="status-phrase"
                                        type="text"
                                        value={statusPhrase}
                                        onChange={(e) => setStatusPhrase(e.target.value)}
                                        disabled={user?.role === 'ADMIN'}
                                        placeholder={user?.role === 'ADMIN' ? 'Alterações desativadas para administradores' : 'O que você está pensando ou fazendo...'}
                                        className={`w-full px-4 py-3 border rounded-xl outline-none transition-all font-medium text-sm ${user?.role === 'ADMIN' ? 'bg-[var(--bg-tertiary)] text-[var(--text-tertiary)] border-[var(--border-subtle)] cursor-not-allowed' : 'bg-[var(--bg-primary)] border-[var(--border-subtle)] focus:ring-2 focus:ring-[var(--accent-secondary)] focus:border-[var(--accent-secondary)] text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)]'}`}
                                    />
                                    <p className="text-[10px] text-[var(--text-tertiary)] mt-2 font-medium">
                                        {user?.role === 'ADMIN'
                                            ? 'Como Administrador, seu perfil é de sistema e não permite alterações diretas.'
                                            : 'Essa frase aparecerá abaixo do seu nome nos chats e lista de membros.'}
                                    </p>
                                </div>

                                <div className="pt-6 border-t border-[var(--border-subtle)] grid grid-cols-1 sm:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-[10px] font-bold text-[var(--text-tertiary)] uppercase tracking-widest mb-1 flex items-center gap-2">
                                            <Mail className="w-3 h-3" /> Email
                                        </label>
                                        <p className="text-sm font-semibold text-[var(--text-primary)]">{user?.email}</p>
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-bold text-[var(--text-tertiary)] uppercase tracking-widest mb-1 flex items-center gap-2">
                                            <Shield className="w-3 h-3" /> ID do Usuário
                                        </label>
                                        <p className="text-xs font-mono text-[var(--text-secondary)] truncate" title={user?.id}>{user?.id}</p>
                                    </div>
                                    {user?.departmentId && (
                                        <div>
                                            <label className="block text-[10px] font-bold text-[var(--text-tertiary)] uppercase tracking-widest mb-1 flex items-center gap-2">
                                                <Briefcase className="w-3 h-3" /> Departamento
                                            </label>
                                            <p className="text-sm font-semibold text-[var(--text-primary)]">Setor {user.departmentId}</p>
                                        </div>
                                    )}
                                    {user?.supervisorName && (
                                        <div>
                                            <label className="block text-[10px] font-bold text-[var(--text-tertiary)] uppercase tracking-widest mb-1 flex items-center gap-2">
                                                <User className="w-3 h-3" /> Supervisor
                                            </label>
                                            <p className="text-sm font-semibold text-[var(--text-primary)]">{user.supervisorName}</p>
                                        </div>
                                    )}
                                </div>

                                <div className="pt-6 flex justify-end">
                                    <Button
                                        type="submit"
                                        variant={user?.role === 'ADMIN' ? 'secondary' : 'primary'}
                                        isLoading={loading}
                                        disabled={user?.role === 'ADMIN'}
                                        className="px-8"
                                    >
                                        <Save className="w-4 h-4 mr-2" />
                                        {user?.role === 'ADMIN' ? 'EDIÇÃO DESATIVADA' : 'SALVAR ALTERAÇÕES'}
                                    </Button>
                                </div>
                            </form>
                        </Card>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
