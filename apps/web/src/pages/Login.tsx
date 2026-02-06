import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Mail, Lock, Zap, ArrowRight, ShieldCheck } from 'lucide-react';
import { GlassCard } from '../components/ui';
import { toast } from 'react-hot-toast';
import { ParticleBackground } from '../components/home/ParticleBackground';
import { TacticalHud } from '../components/home/TacticalHud';
import { TextScramble } from '../components/home/TextScramble';

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
        } catch {
            toast.error('Credenciais inválidas. Verifique seu e-mail e senha.', {
                style: {
                    borderRadius: '1.5rem',
                    background: '#0f172a',
                    color: '#fff',
                    fontSize: '12px',
                    fontWeight: 'bold',
                    border: '1px solid rgba(255,255,255,0.1)'
                }
            });
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-[#020617] text-slate-200 font-sans selection:bg-blue-500/30 selection:text-blue-200">
            {/* Mission Control Elements */}
            <TacticalHud />
            <ParticleBackground />

            {/* Background Effects */}
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/10 rounded-full blur-[120px] animate-pulse" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-indigo-600/10 rounded-full blur-[140px] animate-pulse" style={{ animationDelay: '2s' }} />
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000,transparent)] opacity-[0.1] pointer-events-none" />

            <div className="w-full max-w-[440px] relative z-10 space-y-8 animate-in fade-in zoom-in-95 duration-700">
                {/* Logo & Header */}
                <div className="flex flex-col items-center gap-4 text-center">
                    <div className="relative">
                        <div className="absolute inset-0 bg-blue-600 blur-2xl opacity-20 animate-pulse" />
                        <div className="relative w-20 h-20 bg-slate-900 rounded-[2rem] flex items-center justify-center shadow-2xl shadow-blue-900/20 border border-white/10 group overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-tr from-blue-600/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                            <Zap className="text-blue-500 w-10 h-10 relative z-10 group-hover:scale-110 transition-transform duration-500" fill="currentColor" />
                        </div>
                    </div>
                    <div>
                        <h1 className="text-4xl font-black text-white tracking-tighter uppercase mb-1">
                            <TextScramble>Flash</TextScramble><span className="text-blue-600">.</span>
                        </h1>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] flex items-center justify-center gap-2">
                            Access Verification <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                        </p>
                    </div>
                </div>

                <GlassCard variant="dark" blur="lg" className="p-10 !rounded-[3rem] border-white/5 shadow-2xl shadow-blue-900/5 bg-slate-950/40 backdrop-blur-xl">
                    <div className="mb-8">
                        <h2 className="text-xl font-black text-white uppercase tracking-tight mb-2">Login Seguro</h2>
                        <p className="text-xs text-slate-400 font-bold uppercase tracking-widest leading-relaxed">
                            Identifique-se para acessar o comando.
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-300 uppercase tracking-widest ml-1">ID / E-mail</label>
                            <div className="relative group">
                                <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-500 transition-colors">
                                    <Mail className="w-4 h-4" />
                                </div>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={e => setEmail(e.target.value)}
                                    placeholder="agente@flash.com"
                                    className="w-full pl-14 pr-6 py-4 bg-slate-950/50 border border-white/5 rounded-2xl outline-none focus:bg-slate-900 focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all text-xs font-bold text-white placeholder:text-slate-400"
                                    required
                                    autoComplete="username"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-300 uppercase tracking-widest ml-1">Chave de Acesso</label>
                            <div className="relative group">
                                <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-500 transition-colors">
                                    <Lock className="w-4 h-4" />
                                </div>
                                <input
                                    type="password"
                                    value={password}
                                    onChange={e => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    className="w-full pl-14 pr-6 py-4 bg-slate-950/50 border border-white/5 rounded-2xl outline-none focus:bg-slate-900 focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all text-xs font-bold text-white placeholder:text-slate-400"
                                    required
                                    autoComplete="current-password"
                                />
                            </div>
                        </div>

                        <div className="pt-2">
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full group relative overflow-hidden bg-blue-600 text-white py-5 rounded-[2rem] font-black uppercase tracking-[0.2em] text-[11px] shadow-lg shadow-blue-500/20 active:scale-[0.98] transition-all disabled:opacity-50 hover:bg-blue-500"
                            >
                                <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-indigo-400 opacity-0 group-hover:opacity-20 transition-opacity duration-500" />
                                <span className="relative z-10 flex items-center justify-center gap-3">
                                    {loading ? (
                                        <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                                    ) : (
                                        <>
                                            <TextScramble>Autorizar Acesso</TextScramble>
                                            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                        </>
                                    )}
                                </span>
                            </button>
                        </div>
                    </form>
                </GlassCard>

                <div className="flex flex-col items-center gap-6">
                    <div className="flex items-center gap-2 px-4 py-2 bg-slate-900/50 backdrop-blur-sm rounded-full border border-white/5 shadow-sm">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                        <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Conexão Segura Ativa (SSL)</span>
                    </div>

                    <p className="text-[10px] text-slate-600 font-bold uppercase tracking-widest text-center">
                        © 2026 Daniel de Almeida. <br />
                        <span className="opacity-50">Enterprise Operation System.</span>
                    </p>
                </div>
            </div>
        </div>
    );
}
