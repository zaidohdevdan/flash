import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../services/api';
import { Header } from '../components/ui/Header';
import { Button } from '../components/ui/Button';
import { GlassCard } from '../components/ui/GlassCard';
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
        <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
            <Header
                user={{
                    name: user?.name,
                    avatarUrl: user?.avatarUrl
                }}
                onLogout={signOut}
            />

            <main className="flex-1 p-6 md:p-12 max-w-4xl mx-auto w-full">
                <div className="mb-8">
                    <h1 className="text-3xl font-black text-gray-900 tracking-tight uppercase">Meu Perfil</h1>
                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-1">Gerencie sua identidade no Flash</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Coluna da Esquerda: Avatar e Status */}
                    <div className="md:col-span-1 space-y-6">
                        <GlassCard className="p-6 flex flex-col items-center text-center">
                            <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                                <div className="w-32 h-32 rounded-full overflow-hidden ring-4 ring-blue-50 group-hover:ring-blue-200 transition-all shadow-xl">
                                    {avatarPreview ? (
                                        <img src={avatarPreview} alt="Avatar" className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-4xl font-black">
                                            {user?.name.charAt(0)}
                                        </div>
                                    )}
                                </div>
                                <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Camera className="w-8 h-8 text-white" />
                                </div>
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    className="hidden"
                                    accept="image/*"
                                    onChange={handleAvatarChange}
                                />
                            </div>

                            <h2 className="mt-4 text-xl font-bold text-gray-900">{user?.name}</h2>
                            <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-[10px] font-black uppercase tracking-wider mt-2">
                                {user?.role}
                            </span>
                        </GlassCard>
                    </div>

                    {/* Coluna da Direita: Formulário e Detalhes */}
                    <div className="md:col-span-2 space-y-6">
                        <GlassCard className="p-8">
                            <form onSubmit={handleSave} className="space-y-6">
                                <div>
                                    <label className="block text-xs font-black text-gray-500 uppercase tracking-widest mb-2 flex items-center gap-2">
                                        <MessageSquare className="w-4 h-4" />
                                        Frase de Status
                                    </label>
                                    <input
                                        type="text"
                                        value={statusPhrase}
                                        onChange={(e) => setStatusPhrase(e.target.value)}
                                        placeholder="O que você está pensando ou fazendo..."
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all placeholder:text-gray-400 font-medium"
                                    />
                                    <p className="text-[10px] text-gray-400 mt-2">Essa frase aparecerá abaixo do seu nome nos chats e lista de membros.</p>
                                </div>

                                <div className="pt-6 border-t border-gray-100 grid grid-cols-1 sm:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 flex items-center gap-2">
                                            <Mail className="w-3 h-3" /> Email
                                        </label>
                                        <p className="text-sm font-semibold text-gray-700">{user?.email}</p>
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 flex items-center gap-2">
                                            <Shield className="w-3 h-3" /> ID do Usuário
                                        </label>
                                        <p className="text-xs font-mono text-gray-500 truncate" title={user?.id}>{user?.id}</p>
                                    </div>
                                    {user?.departmentId && (
                                        <div>
                                            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 flex items-center gap-2">
                                                <Briefcase className="w-3 h-3" /> Departamento
                                            </label>
                                            <p className="text-sm font-semibold text-gray-700">Setor {user.departmentId}</p>
                                        </div>
                                    )}
                                    {user?.supervisorName && (
                                        <div>
                                            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 flex items-center gap-2">
                                                <User className="w-3 h-3" /> Supervisor
                                            </label>
                                            <p className="text-sm font-semibold text-gray-700">{user.supervisorName}</p>
                                        </div>
                                    )}
                                </div>

                                <div className="pt-6 flex justify-end">
                                    <Button type="submit" variant="primary" size="lg" isLoading={loading} className="px-8">
                                        <Save className="w-4 h-4 mr-2" />
                                        SALVAR ALTERAÇÕES
                                    </Button>
                                </div>
                            </form>
                        </GlassCard>
                    </div>
                </div>
            </main>
        </div>
    );
}
