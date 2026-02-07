import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Mail, Lock, ArrowRight, ShieldCheck, Send, Loader2, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

export function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const { signIn } = useAuth();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            await signIn(email, password);
            // Navigation handled by AuthContext or useEffect, but we can double check
        } catch {
            setError('Credenciais inválidas. Verifique e tente novamente.');
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="min-h-screen w-full flex items-center justify-center relative overflow-hidden bg-white selection:bg-lime-200 selection:text-lime-900 font-sans">

            {/* Premium Grain Texture Overlay */}
            <div className="fixed inset-0 pointer-events-none opacity-[0.035] z-[100] mix-blend-multiply" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}></div>

            {/* Dynamic Mesh Gradient Background */}
            <div className="fixed inset-0 pointer-events-none z-0">
                <div className="absolute top-[-20%] left-[-20%] w-[60%] h-[60%] bg-blue-100/50 rounded-full blur-[120px] mix-blend-multiply animate-pulse-slow" />
                <div className="absolute bottom-[-20%] right-[-20%] w-[60%] h-[60%] bg-[#d4e720]/20 rounded-full blur-[120px] mix-blend-multiply animate-pulse-slow delay-1000" />
            </div>

            {/* Floating Navigation/Logo Area */}
            <div className="absolute top-8 left-8 z-20">
                <div
                    onClick={() => navigate('/')}
                    className="flex items-center gap-3 cursor-pointer group"
                >
                    <div className="bg-[#d4e720] p-2 rounded-xl shadow-lg shadow-lime-500/20 border border-[#bed20e] group-hover:scale-105 transition-transform">
                        <Send className="w-5 h-5 text-[#1a2e05]" />
                    </div>
                    <span className="text-xl font-black tracking-tighter text-slate-900 group-hover:opacity-80 transition-opacity">FLASH<span className="text-[#a3b60b]">APP</span></span>
                </div>
            </div>

            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="w-full max-w-md relative z-10 px-6"
            >
                <div className="bg-white/70 backdrop-blur-2xl border border-white/50 rounded-[2.5rem] shadow-[0_20px_50px_-12px_rgba(0,0,0,0.1)] p-8 md:p-12 relative overflow-hidden group">

                    {/* Glass Glare Effect */}
                    <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/40 to-transparent pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

                    <div className="relative z-10">
                        <div className="text-center mb-10">
                            <div className="inline-flex items-center justify-center p-3 bg-slate-50 rounded-2xl mb-6 shadow-inner border border-slate-100">
                                <ShieldCheck className="w-6 h-6 text-slate-400" />
                            </div>
                            <h2 className="text-2xl font-black text-slate-900 tracking-tight mb-2">Acesso Restrito</h2>
                            <p className="text-slate-500 text-sm font-medium">
                                Identifique-se para acessar o dashboard.
                            </p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">ID Operacional / E-mail</label>
                                <div className="relative group/input">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <Mail className="h-5 w-5 text-slate-400 group-focus-within/input:text-slate-900 transition-colors" />
                                    </div>
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={e => setEmail(e.target.value)}
                                        className="block w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-slate-100 focus:border-slate-300 transition-all font-medium text-sm"
                                        placeholder="agente@flash.com"
                                        required
                                        autoComplete="username"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Chave de Acesso</label>
                                <div className="relative group/input">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <Lock className="h-5 w-5 text-slate-400 group-focus-within/input:text-slate-900 transition-colors" />
                                    </div>
                                    <input
                                        type="password"
                                        value={password}
                                        onChange={e => setPassword(e.target.value)}
                                        className="block w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-slate-100 focus:border-slate-300 transition-all font-medium text-sm"
                                        placeholder="••••••••"
                                        required
                                        autoComplete="current-password"
                                    />
                                </div>
                            </div>

                            <AnimatePresence>
                                {error && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        exit={{ opacity: 0, height: 0 }}
                                        className="flex items-center gap-2 text-red-500 text-xs font-bold bg-red-50 p-3 rounded-xl border border-red-100"
                                    >
                                        <AlertCircle className="w-4 h-4" />
                                        {error}
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full flex items-center justify-center py-4 px-4 bg-slate-900 hover:bg-[#d4e720] text-white hover:text-[#1a2e05] rounded-2xl transition-all duration-300 font-bold text-sm tracking-wide shadow-xl hover:shadow-2xl hover:shadow-lime-500/20 hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:pointer-events-none group/btn"
                            >
                                {loading ? (
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                ) : (
                                    <span className="flex items-center gap-2">
                                        Entrar no Sistema
                                        <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                                    </span>
                                )}
                            </button>
                        </form>

                        <div className="mt-8 text-center invisible">
                            <p className="text-xs font-medium text-slate-400">
                                Esqueceu sua senha? <a href="#" className="text-slate-900 underline hover:text-blue-600 transition-colors">Recuperar acesso</a>
                            </p>
                        </div>
                    </div>
                </div>

                <div className="mt-8 text-center">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/50 backdrop-blur-md rounded-full border border-white/20">
                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                        <span className="text-[10px] uppercase tracking-widest font-bold text-slate-500">Conexão Segura E2EE</span>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
