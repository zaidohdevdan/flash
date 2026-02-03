import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '../services/api';
import { UserPlus, ChevronDown, CheckCircle, Mail, Lock, User, Briefcase, Zap, ArrowLeft, ShieldCheck } from 'lucide-react';
import { GlassCard } from '../components/ui';
import { toast } from 'react-hot-toast';

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
                style: { borderRadius: '1.5rem', background: '#0f172a', color: '#fff', fontSize: '12px', fontWeight: 'bold' }
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
                style: { borderRadius: '1.5rem', background: '#0f172a', color: '#fff', fontSize: '12px', fontWeight: 'bold' }
            });
        } finally {
            setLoading(false);
        }
    }

    if (success) {
        return (
            <div className="min-h-screen flex items-center justify-center p-4 bg-[#fafafa] relative overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(34,197,94,0.05),transparent_70%)]" />
                <GlassCard className="p-12 text-center !rounded-[3rem] border-white shadow-2xl max-w-sm w-full animate-in zoom-in-95 duration-500">
                    <div className="w-24 h-24 bg-green-500 rounded-[2rem] flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-green-500/20 animate-bounce">
                        <CheckCircle className="w-12 h-12 text-white" />
                    </div>
                    <h2 className="text-3xl font-black text-gray-950 uppercase tracking-tighter mb-2">Conta Criada!</h2>
                    <p className="text-xs text-gray-400 font-bold uppercase tracking-widest leading-relaxed">
                        Bem-vindo ao Flash. <br /> Redirecionando para o login...
                    </p>
                </GlassCard>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center p-6 bg-[#fafafa] relative overflow-hidden">
            {/* Dynamic Background Elements */}
            <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-600/10 rounded-full blur-[120px] animate-pulse" />
            <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-indigo-600/10 rounded-full blur-[140px] animate-pulse" style={{ animationDelay: '2s' }} />

            <div className="w-full max-w-[480px] relative z-10 space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
                {/* Header */}
                <div className="flex justify-between items-center">
                    <Link to="/" className="group flex items-center gap-3 px-4 py-2 bg-white/50 hover:bg-white rounded-2xl border border-gray-100 transition-all">
                        <ArrowLeft className="w-4 h-4 text-gray-400 group-hover:text-blue-600 group-hover:-translate-x-1 transition-all" />
                        <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Voltar</span>
                    </Link>
                    <div className="flex items-center gap-2">
                        <Zap className="w-5 h-5 text-blue-600" fill="currentColor" />
                        <span className="text-xl font-black text-gray-950 tracking-tighter uppercase">Flash.</span>
                    </div>
                </div>

                <GlassCard blur="lg" className="p-10 !rounded-[3rem] border-white/60 shadow-2xl shadow-blue-900/5 bg-white/40">
                    <div className="mb-10 text-center sm:text-left">
                        <h1 className="text-3xl font-black text-gray-950 tracking-tight uppercase mb-2">Criar Conta</h1>
                        <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">Junte-se à maior rede de inteligência operacional.</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Nome Completo</label>
                            <div className="relative group">
                                <div className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-600 transition-colors">
                                    <User className="w-4 h-4" />
                                </div>
                                <input
                                    type="text"
                                    value={name}
                                    onChange={e => setName(e.target.value)}
                                    placeholder="Ex: Carlos Oliveira"
                                    className="w-full pl-14 pr-6 py-4 bg-white/50 border border-transparent rounded-2xl outline-none focus:bg-white focus:border-blue-500/30 focus:ring-4 focus:ring-blue-50 transition-all text-sm font-bold text-gray-800 placeholder:text-gray-300"
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">E-mail</label>
                            <div className="relative group">
                                <div className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-600 transition-colors">
                                    <Mail className="w-4 h-4" />
                                </div>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={e => setEmail(e.target.value)}
                                    placeholder="seu@flash.com"
                                    className="w-full pl-14 pr-6 py-4 bg-white/50 border border-transparent rounded-2xl outline-none focus:bg-white focus:border-blue-500/30 focus:ring-4 focus:ring-blue-50 transition-all text-sm font-bold text-gray-800 placeholder:text-gray-300"
                                    required
                                    autoComplete="email"
                                />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Senha</label>
                            <div className="relative group">
                                <div className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-600 transition-colors">
                                    <Lock className="w-4 h-4" />
                                </div>
                                <input
                                    type="password"
                                    value={password}
                                    onChange={e => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    className="w-full pl-14 pr-6 py-4 bg-white/50 border border-transparent rounded-2xl outline-none focus:bg-white focus:border-blue-500/30 focus:ring-4 focus:ring-blue-50 transition-all text-sm font-bold text-gray-800 placeholder:text-gray-300"
                                    required
                                    autoComplete="new-password"
                                />
                            </div>
                        </div>

                        <div className="py-4">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 mb-3 block text-center sm:text-left">Tipo de Acesso</label>
                            <div className="grid grid-cols-2 gap-2 p-1.5 bg-gray-100/50 rounded-2xl border border-gray-100">
                                <button
                                    type="button"
                                    onClick={() => setRole('PROFESSIONAL')}
                                    className={`py-3 rounded-[1rem] text-[10px] font-black uppercase tracking-widest transition-all ${role === 'PROFESSIONAL' ? 'bg-white text-blue-600 shadow-md border border-blue-50' : 'text-gray-400 hover:text-gray-600'}`}
                                >
                                    PROFISSIONAL
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setRole('SUPERVISOR')}
                                    className={`py-3 rounded-[1rem] text-[10px] font-black uppercase tracking-widest transition-all ${role === 'SUPERVISOR' ? 'bg-white text-blue-600 shadow-md border border-blue-50' : 'text-gray-400 hover:text-gray-600'}`}
                                >
                                    SUPERVISOR
                                </button>
                            </div>
                        </div>

                        {role === 'PROFESSIONAL' && (
                            <div className="space-y-1.5 animate-in slide-in-from-top-4 duration-500">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Responsável Técnico</label>
                                <div className="relative group">
                                    <div className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-600 transition-colors">
                                        <Briefcase className="w-4 h-4" />
                                    </div>
                                    <select
                                        value={supervisorId}
                                        onChange={e => setSupervisorId(e.target.value)}
                                        className="w-full pl-14 pr-12 py-4 bg-white/50 border border-transparent rounded-2xl outline-none focus:bg-white focus:border-blue-500/30 focus:ring-4 focus:ring-blue-50 transition-all text-sm font-black text-gray-800 appearance-none cursor-pointer"
                                        required
                                    >
                                        <option value="">Selecione seu supervisor</option>
                                        {supervisors.map(s => (
                                            <option key={s.id} value={s.id}>{s.name}</option>
                                        ))}
                                    </select>
                                    <ChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                                </div>
                            </div>
                        )}

                        <div className="pt-6">
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
                    <div className="flex items-center gap-2 px-4 py-2 bg-white/50 backdrop-blur-sm rounded-full border border-gray-100 shadow-sm">
                        <ShieldCheck className="w-3.5 h-3.5 text-blue-500" />
                        <span className="text-[9px] font-black text-gray-500 uppercase tracking-widest">Protocolos de Segurança Ativos</span>
                    </div>

                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest text-center">
                        © 2024 Flash Intelligence. <br />
                        <span className="opacity-50">Operational Excellence.</span>
                    </p>
                </div>
            </div>
        </div>
    );
}
