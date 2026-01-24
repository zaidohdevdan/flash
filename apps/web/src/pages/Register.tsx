import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '../services/api';
import { UserPlus, ChevronDown, CheckCircle } from 'lucide-react';

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
    const [error, setError] = useState('');
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
        setError('');
        setLoading(true);

        if (role === 'PROFESSIONAL' && !supervisorId) {
            setError('Por favor, selecione um supervisor.');
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
            setError(err.response?.data?.error || 'Erro ao realizar cadastro.');
        } finally {
            setLoading(false);
        }
    }

    if (success) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4 text-center">
                <div className="bg-white p-8 rounded-3xl shadow-xl max-w-sm w-full">
                    <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">Conta Criada!</h2>
                    <p className="text-gray-500 mb-6">Redirecionando para o login em instantes...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
            <div className="bg-white p-8 rounded-3xl shadow-xl w-full max-w-md border border-gray-100">
                <div className="flex justify-center mb-6">
                    <div className="bg-blue-600 p-4 rounded-2xl shadow-lg shadow-blue-100">
                        <UserPlus className="text-white w-8 h-8" />
                    </div>
                </div>

                <h2 className="text-3xl font-black text-center text-gray-900 mb-2">Criar Conta</h2>
                <p className="text-center text-gray-500 mb-8 font-medium">Junte-se à rede FLASH</p>

                {error && (
                    <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded-lg mb-6 text-sm font-bold">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="space-y-1">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Nome Completo</label>
                        <input
                            type="text"
                            value={name}
                            onChange={e => setName(e.target.value)}
                            className="w-full px-4 py-3 bg-gray-50 border-transparent border rounded-2xl focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-50 outline-none transition-all font-medium"
                            placeholder="Ex: João Silva"
                            required
                        />
                    </div>

                    <div className="space-y-1">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">E-mail</label>
                        <input
                            type="email"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            className="w-full px-4 py-3 bg-gray-50 border-transparent border rounded-2xl focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-50 outline-none transition-all font-medium"
                            placeholder="seu@email.com"
                            required
                        />
                    </div>

                    <div className="space-y-1">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Senha</label>
                        <input
                            type="password"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            className="w-full px-4 py-3 bg-gray-50 border-transparent border rounded-2xl focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-50 outline-none transition-all font-medium"
                            placeholder="••••••••"
                            required
                        />
                    </div>

                    <div className="pt-2">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 mb-2 block">Eu sou...</label>
                        <div className="grid grid-cols-2 gap-3 p-1 bg-gray-100 rounded-2xl">
                            <button
                                type="button"
                                onClick={() => setRole('PROFESSIONAL')}
                                className={`py-2.5 rounded-xl text-xs font-bold transition-all ${role === 'PROFESSIONAL' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500'}`}
                            >
                                PROFISSIONAL
                            </button>
                            <button
                                type="button"
                                onClick={() => setRole('SUPERVISOR')}
                                className={`py-2.5 rounded-xl text-xs font-bold transition-all ${role === 'SUPERVISOR' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500'}`}
                            >
                                SUPERVISOR
                            </button>
                        </div>
                    </div>

                    {role === 'PROFESSIONAL' && (
                        <div className="space-y-1 animate-in fade-in slide-in-from-top-2 duration-300">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Quem é seu Supervisor?</label>
                            <div className="relative">
                                <select
                                    value={supervisorId}
                                    onChange={e => setSupervisorId(e.target.value)}
                                    className="w-full px-4 py-3 bg-gray-50 border-transparent border rounded-2xl focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-50 outline-none transition-all font-bold text-gray-700 appearance-none"
                                    required
                                >
                                    <option value="">Selecione um supervisor</option>
                                    {supervisors.map(s => (
                                        <option key={s.id} value={s.id}>{s.name}</option>
                                    ))}
                                </select>
                                <ChevronDown className="absolute right-4 top-3.5 w-5 h-5 text-gray-400 pointer-events-none" />
                            </div>
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className={`w-full py-4 mt-4 rounded-2xl font-black text-white flex items-center justify-center gap-2 shadow-xl shadow-blue-100 active:scale-[0.98] transition-all ${loading ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700'}`}
                    >
                        {loading ? 'CADASTRANDO...' : 'CRIAR CONTA'}
                    </button>

                    <div className="text-center mt-6">
                        <p className="text-sm text-gray-500 font-medium">
                            Já tem conta? <Link to="/" className="text-blue-600 font-bold hover:underline">Faça login</Link>
                        </p>
                    </div>
                </form>
            </div>
        </div>
    );
}
