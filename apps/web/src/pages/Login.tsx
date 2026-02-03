import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Mail, Lock, Zap, ArrowRight, ShieldCheck } from 'lucide-react';
import { GlassCard } from '../components/ui';
import { toast } from 'react-hot-toast';

export function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const { signIn } = useAuth();
    const [loading, setLoading] = useState(false);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true);
        try {
            await signIn(email, password);
        } catch (err) {
            toast.error('Credenciais inválidas. Verifique seu e-mail e senha.', {
                style: {
                    borderRadius: '1.5rem',
                    background: '#0f172a',
                    color: '#fff',
                    fontSize: '12px',
                    fontWeight: 'bold'
                }
            });
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-[#fafafa]">
            {/* Dynamic Background Elements */}
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/10 rounded-full blur-[120px] animate-pulse" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-indigo-600/10 rounded-full blur-[140px] animate-pulse" style={{ animationDelay: '2s' }} />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[radial-gradient(circle_at_50%_50%,rgba(59,130,246,0.03),transparent_70%)] pointer-events-none" />

            <div className="w-full max-w-[440px] relative z-10 space-y-8 animate-in fade-in zoom-in-95 duration-700">
                {/* Logo & Header */}
                <div className="flex flex-col items-center gap-4 text-center">
                    <div className="relative">
                        <div className="absolute inset-0 bg-blue-600 blur-2xl opacity-20 animate-pulse" />
                        <div className="relative w-20 h-20 bg-[#0f172a] rounded-[2rem] flex items-center justify-center shadow-2xl shadow-blue-900/20 border border-white/10 group overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-tr from-blue-600/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                            <Zap className="text-white w-10 h-10 relative z-10 group-hover:scale-110 transition-transform duration-500" fill="currentColor" />
                        </div>
                    </div>
                    <div>
                        <h1 className="text-4xl font-black text-gray-950 tracking-tighter uppercase mb-1">
                            Flash<span className="text-blue-600">.</span>
                        </h1>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em]">
                            Operational Intelligence
                        </p>
                    </div>
                </div>

                <GlassCard blur="lg" className="p-10 !rounded-[3rem] border-white/60 shadow-2xl shadow-blue-900/5 bg-white/40">
                    <div className="mb-8">
                        <h2 className="text-xl font-black text-gray-900 uppercase tracking-tight mb-2">Bem-vindo</h2>
                        <p className="text-xs text-gray-500 font-bold uppercase tracking-widest leading-relaxed">
                            Acesse seu painel operacional para gerenciar reportes e equipes.
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">E-mail Corporativo</label>
                            <div className="relative group">
                                <div className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-600 transition-colors">
                                    <Mail className="w-4 h-4" />
                                </div>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={e => setEmail(e.target.value)}
                                    placeholder="exemplo@flash.com"
                                    className="w-full pl-14 pr-6 py-4 bg-white/50 border border-transparent rounded-2xl outline-none focus:bg-white focus:border-blue-500/30 focus:ring-4 focus:ring-blue-50 transition-all text-xs font-bold text-gray-800 placeholder:text-gray-300"
                                    required
                                    autoComplete="username"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Senha de Acesso</label>
                            <div className="relative group">
                                <div className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-600 transition-colors">
                                    <Lock className="w-4 h-4" />
                                </div>
                                <input
                                    type="password"
                                    value={password}
                                    onChange={e => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    className="w-full pl-14 pr-6 py-4 bg-white/50 border border-transparent rounded-2xl outline-none focus:bg-white focus:border-blue-500/30 focus:ring-4 focus:ring-blue-50 transition-all text-xs font-bold text-gray-800 placeholder:text-gray-300"
                                    required
                                    autoComplete="current-password"
                                />
                            </div>
                        </div>

                        <div className="pt-2">
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full group relative overflow-hidden bg-[#0f172a] text-white py-5 rounded-[2rem] font-black uppercase tracking-[0.2em] text-[11px] shadow-2xl shadow-gray-900/10 active:scale-[0.98] transition-all disabled:opacity-50"
                            >
                                <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                                <span className="relative z-10 flex items-center justify-center gap-3">
                                    {loading ? (
                                        <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                                    ) : (
                                        <>
                                            Acessar Sistema
                                            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                        </>
                                    )}
                                </span>
                            </button>
                        </div>
                    </form>
                </GlassCard>

                <div className="flex flex-col items-center gap-6">
                    <div className="flex items-center gap-2 px-4 py-2 bg-white/50 backdrop-blur-sm rounded-full border border-gray-100 shadow-sm">
                        <ShieldCheck className="w-3.5 h-3.5 text-blue-500" />
                        <span className="text-[9px] font-black text-gray-500 uppercase tracking-widest">Acesso Seguro & Criptografado</span>
                    </div>

                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest text-center">
                        © 2024 Flash Intelligence. <br />
                        <span className="opacity-50">Todos os direitos reservados.</span>
                    </p>
                </div>
            </div>
        </div>
    );
}
