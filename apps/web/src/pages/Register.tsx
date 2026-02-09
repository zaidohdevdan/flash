import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '../services/api';
import { UserPlus, ChevronDown, CheckCircle, Mail, Lock, User, Briefcase, ArrowLeft, ShieldCheck } from 'lucide-react';
import { Button, Input } from '../components/ui';
import { AuthLayout } from '../layouts/AuthLayout';
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
        } catch {
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
        } catch (err: unknown) {
            const error = err as { response?: { data?: { error?: string } } };
            toast.error(error.response?.data?.error || 'Ocorreu um erro ao realizar o cadastro.', {
                style: { borderRadius: '1.5rem', background: '#0f172a', color: '#fff', fontSize: '12px', fontWeight: 'bold', border: '1px solid rgba(255,255,255,0.1)' }
            });
        } finally {
            setLoading(false);
        }
    }

    if (success) {
        return (
            <AuthLayout title="Cadastro Realizado" subtitle="Seu acesso está sendo preparado.">
                <div className="flex flex-col items-center justify-center text-center space-y-6 py-8">
                    <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center shadow-sm">
                        <CheckCircle className="w-10 h-10 text-green-500" />
                    </div>
                    <div className="space-y-2">
                        <h3 className="text-xl font-bold text-[var(--text-primary)]">Conta Criada com Sucesso!</h3>
                        <p className="text-sm text-[var(--text-secondary)]">
                            Sua conta foi registrada no sistema.<br />
                            Redirecionando para o login...
                        </p>
                    </div>
                </div>
            </AuthLayout>
        );
    }

    return (
        <AuthLayout
            title="Criar Conta"
            subtitle="Junte-se à nova era da gestão de campo."
        >
            <div className="mb-6">
                <Link to="/" className="inline-flex items-center gap-2 text-xs font-bold text-[var(--text-tertiary)] hover:text-[var(--text-primary)] transition-colors uppercase tracking-wider mb-4">
                    <ArrowLeft className="w-3 h-3" />
                    Voltar para Login
                </Link>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
                <Input
                    label="Nome Completo"
                    type="text"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="Como devemos te chamar?"
                    icon={<User className="w-4 h-4" />}
                    required
                />

                <Input
                    label="E-mail Corporativo"
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="seu.email@empresa.com"
                    icon={<Mail className="w-4 h-4" />}
                    required
                    autoComplete="email"
                />

                <Input
                    label="Senha de Acesso"
                    type="password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••"
                    icon={<Lock className="w-4 h-4" />}
                    required
                    autoComplete="new-password"
                />

                <div className="space-y-2">
                    <label className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wide">Função no Sistema</label>
                    <div className="grid grid-cols-2 gap-3">
                        <button
                            type="button"
                            onClick={() => setRole('PROFESSIONAL')}
                            className={`py-3 px-4 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all border ${role === 'PROFESSIONAL' ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 text-blue-600 dark:text-blue-400 ring-1 ring-blue-200 dark:ring-blue-800' : 'bg-[var(--bg-primary)] border-[var(--border-subtle)] text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)]'}`}
                        >
                            Profissional
                        </button>
                        <button
                            type="button"
                            onClick={() => setRole('SUPERVISOR')}
                            className={`py-3 px-4 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all border ${role === 'SUPERVISOR' ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 text-blue-600 dark:text-blue-400 ring-1 ring-blue-200 dark:ring-blue-800' : 'bg-[var(--bg-primary)] border-[var(--border-subtle)] text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)]'}`}
                        >
                            Supervisor
                        </button>
                    </div>
                </div>

                {role === 'PROFESSIONAL' && (
                    <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-300">
                        <label htmlFor="supervisor-select" className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wide">Supervisor Responsável</label>
                        <div className="relative group">
                            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)] group-focus-within:text-blue-500 transition-colors">
                                <Briefcase className="w-4 h-4" />
                            </div>
                            <select
                                id="supervisor-select"
                                value={supervisorId}
                                onChange={e => setSupervisorId(e.target.value)}
                                className="w-full pl-11 pr-10 py-3 bg-[var(--bg-primary)] border border-[var(--border-subtle)] rounded-xl outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all text-sm font-medium text-[var(--text-primary)] appearance-none cursor-pointer placeholder:text-[var(--text-tertiary)]"
                                required
                            >
                                <option value="" className="text-gray-400">Selecione seu supervisor</option>
                                {supervisors.map(s => (
                                    <option key={s.id} value={s.id}>{s.name}</option>
                                ))}
                            </select>
                            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-tertiary)] pointer-events-none" />
                        </div>
                    </div>
                )}

                <div className="pt-4">
                    <Button
                        type="submit"
                        variant="primary"
                        className="w-full"
                        isLoading={loading}
                    >
                        <span className="flex items-center gap-2">
                            Finalizar Cadastro
                            <UserPlus className="w-4 h-4" />
                        </span>
                    </Button>
                </div>
            </form>

            <div className="mt-6">
                <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-[var(--border-subtle)]" />
                    </div>
                    <div className="relative flex justify-center text-sm">
                        <span className="px-2 bg-[var(--bg-primary)] text-[var(--text-tertiary)]">
                            Sistemas de Segurança Ativos
                        </span>
                    </div>
                </div>

                <div className="mt-6 flex items-center justify-center gap-2 text-xs text-[var(--text-tertiary)]">
                    <ShieldCheck className="w-3 h-3 text-emerald-500" />
                    <span className="font-medium">Criptografia de Nível Militar (SSL)</span>
                </div>
            </div>
        </AuthLayout>
    );
}
