import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '../services/api';
import { UserPlus, ChevronDown, CheckCircle, Mail, Lock, User, Briefcase, Zap, ArrowLeft, ShieldCheck } from 'lucide-react';
import { GlassCard } from '../components/ui';
import { toast } from 'react-hot-toast';
import { ParticleBackground } from '../components/home/ParticleBackground';
import { TacticalHud } from '../components/home/TacticalHud';
import { TextScramble } from '../components/home/TextScramble';

interface Supervisor {
    id: string;
    name: string;
}

export function Register() {
    const navigate = useNavigate();
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState<'PROFESSIONAL' | 'SUPERVISOR'>('PROFESSIONAL');
    const [supervisorId, setSupervisorId] = useState('');
    const [supervisors, setSupervisors] = useState<Supervisor[]>([]);
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        if (role === 'PROFESSIONAL') {
            fetchSupervisors();
        }
    }, [role]);

    async function fetchSupervisors() {
        try {
            const response = await api.get('/supervisors');
            setSupervisors(response.data);
        } catch (err) {
            console.error('Erro ao buscar supervisores');
        }
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true);

        if (role === 'PROFESSIONAL' && !supervisorId) {
            toast.error('Por favor, selecione um supervisor.', {
                style: { borderRadius: '1.5rem', background: '#0f172a', color: '#fff', fontSize: '12px', fontWeight: 'bold', border: '1px solid rgba(255,255,255,0.1)' }
            });
            setLoading(false);
            return;
        }

        try {
            await api.post('/register', {
                name,
                email,
                password,
                role,
                supervisorId: role === 'PROFESSIONAL' ? supervisorId : undefined
            });

            setSuccess(true);
            setTimeout(() => {
                navigate('/');
            }, 3000);
        } catch (err: any) {
            toast.error(err.response?.data?.error || 'Erro ao realizar cadastro.', {
                style: { borderRadius: '1.5rem', background: '#0f172a', color: '#fff', fontSize: '12px', fontWeight: 'bold', border: '1px solid rgba(255,255,255,0.1)' }
            });
        } finally {
            setLoading(false);
        }
    }

    if (success) {
        return (
            <div className="min-h-screen flex items-center justify-center p-4 bg-[#020617] relative overflow-hidden text-white">
                <ParticleBackground />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(34,197,94,0.1),transparent_70%)]" />
                <GlassCard className="p-12 text-center !rounded-[3rem] border-white/10 shadow-2xl max-w-sm w-full animate-in zoom-in-95 duration-500 bg-slate-900/60 backdrop-blur-xl relative z-20">
                    <div className="w-24 h-24 bg-green-500/20 border border-green-500/30 rounded-[2rem] flex items-center justify-center mx-auto mb-6 shadow-xl shadow-green-500/10 animate-bounce">
                        <CheckCircle className="w-12 h-12 text-green-400" />
                    </div>
                    <h2 className="text-3xl font-black text-white uppercase tracking-tighter mb-2">Conta Criada!</h2>
                    <p className="text-xs text-slate-400 font-bold uppercase tracking-widest leading-relaxed">
                        Bem-vindo ao Flash. <br /> Redirecionando para o login...
                    </p>
                </GlassCard>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center p-6 bg-[#020617] relative overflow-hidden text-slate-200 font-sans selection:bg-blue-500/30 selection:text-blue-200">
            {/* Mission Control Elements */}
            <TacticalHud />
            <ParticleBackground />

            {/* Dynamic Background Elements */}
            <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-600/10 rounded-full blur-[120px] animate-pulse" />
            <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-indigo-600/10 rounded-full blur-[140px] animate-pulse" style={{ animationDelay: '2s' }} />
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000,transparent)] opacity-[0.1] pointer-events-none" />


            <div className="w-full max-w-[480px] relative z-10 space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
                {/* Header */}
                <div className="flex justify-between items-center">
                    <Link to="/" className="group flex items-center gap-3 px-4 py-2 bg-slate-900/50 hover:bg-slate-800 rounded-2xl border border-white/5 transition-all text-slate-400 hover:text-white">
                        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-all" />
                        <span className="text-[10px] font-black uppercase tracking-widest">Voltar</span>
                    </Link>
                    <div className="flex items-center gap-2">
                        <Zap className="w-5 h-5 text-blue-500" fill="currentColor" />
                        <span className="text-xl font-black text-white tracking-tighter uppercase">Flash<span className="text-blue-500">.</span></span>
                    </div>
                </div>

                <GlassCard blur="lg" className="p-10 !rounded-[3rem] border-white/10 shadow-2xl shadow-blue-900/5 bg-slate-900/60 backdrop-blur-xl">
                    <div className="mb-10 text-center sm:text-left">
                        <h1 className="text-3xl font-black text-white tracking-tight uppercase mb-2"><TextScramble>Criar Conta</TextScramble></h1>
                        <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Junte-se à maior rede de inteligência operacional.</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Nome Completo</label>
                            <div className="relative group">
                                <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-500 transition-colors">
                                    <User className="w-4 h-4" />
                                </div>
                                <input
                                    type="text"
                                    value={name}
                                    onChange={e => setName(e.target.value)}
                                    placeholder="Ex: Carlos Oliveira"
                                    className="w-full pl-14 pr-6 py-4 bg-slate-950/50 border border-white/5 rounded-2xl outline-none focus:bg-slate-900 focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all text-sm font-bold text-white placeholder:text-slate-600"
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">E-mail</label>
                            <div className="relative group">
                                <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-500 transition-colors">
                                    <Mail className="w-4 h-4" />
                                </div>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={e => setEmail(e.target.value)}
                                    placeholder="seu@flash.com"
                                    className="w-full pl-14 pr-6 py-4 bg-slate-950/50 border border-white/5 rounded-2xl outline-none focus:bg-slate-900 focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all text-sm font-bold text-white placeholder:text-slate-600"
                                    required
                                    autoComplete="email"
                                />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Senha</label>
                            <div className="relative group">
                                <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-500 transition-colors">
                                    <Lock className="w-4 h-4" />
                                </div>
                                <input
                                    type="password"
                                    value={password}
                                    onChange={e => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    className="w-full pl-14 pr-6 py-4 bg-slate-950/50 border border-white/5 rounded-2xl outline-none focus:bg-slate-900 focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all text-sm font-bold text-white placeholder:text-slate-600"
                                    required
                                    autoComplete="new-password"
                                />
                            </div>
                        </div>

                        <div className="py-4">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1 mb-3 block text-center sm:text-left">Tipo de Acesso</label>
                            <div className="grid grid-cols-2 gap-2 p-1.5 bg-slate-950/50 rounded-2xl border border-white/5">
                                <button
                                    type="button"
                                    onClick={() => setRole('PROFESSIONAL')}
                                    className={`py-3 rounded-[1rem] text-[10px] font-black uppercase tracking-widest transition-all ${role === 'PROFESSIONAL' ? 'bg-blue-600/10 text-blue-400 border border-blue-500/30 shadow-lg shadow-blue-500/10' : 'text-slate-500 hover:text-slate-300'}`}
                                >
                                    PROFISSIONAL
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setRole('SUPERVISOR')}
                                    className={`py-3 rounded-[1rem] text-[10px] font-black uppercase tracking-widest transition-all ${role === 'SUPERVISOR' ? 'bg-blue-600/10 text-blue-400 border border-blue-500/30 shadow-lg shadow-blue-500/10' : 'text-slate-500 hover:text-slate-300'}`}
                                >
                                    SUPERVISOR
                                </button>
                            </div>
                        </div>

                        {role === 'PROFESSIONAL' && (
                            <div className="space-y-1.5 animate-in slide-in-from-top-4 duration-500">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Responsável Técnico</label>
                                <div className="relative group">
                                    <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-500 transition-colors">
                                        <Briefcase className="w-4 h-4" />
                                    </div>
                                    <select
                                        value={supervisorId}
                                        onChange={e => setSupervisorId(e.target.value)}
                                        className="w-full pl-14 pr-12 py-4 bg-slate-950/50 border border-white/5 rounded-2xl outline-none focus:bg-slate-900 focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all text-sm font-black text-white appearance-none cursor-pointer"
                                        required
                                    >
                                        <option value="" className="bg-slate-900 text-slate-400">Selecione seu supervisor</option>
                                        {supervisors.map(s => (
                                            <option key={s.id} value={s.id} className="bg-slate-900">{s.name}</option>
                                        ))}
                                    </select>
                                    <ChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
                                </div>
                            </div>
                        )}

                        <div className="pt-6">
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
                                            Finalizar Cadastro
                                            <UserPlus className="w-4 h-4 group-hover:scale-110 transition-transform" />
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
                        <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Protocolos de Segurança Ativos</span>
                    </div>

                    <p className="text-[10px] text-slate-600 font-bold uppercase tracking-widest text-center">
                        © 2026 Flash Intelligence. <br />
                        <span className="opacity-50">Operational Excellence.</span>
                    </p>
                </div>
            </div>
        </div>
    );
}
