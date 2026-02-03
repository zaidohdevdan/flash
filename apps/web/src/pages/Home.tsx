import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { motion, useScroll, useTransform } from 'framer-motion';
import {
    Send,
    ArrowRight,
    MessageSquare,
    CheckCircle2,
    Code2,
    Linkedin,
    Instagram,
    Github
} from 'lucide-react';
import { ProcessTimeline } from '../components/home/ProcessTimeline';
import { TechSpecs } from '../components/home/TechSpecs';

export function Home() {
    const navigate = useNavigate();
    const { isAuthenticated, user, loading } = useAuth();
    const [formStatus, setFormStatus] = useState<'idle' | 'sending' | 'sent'>('idle');
    const { scrollY } = useScroll();

    // Parallax Effects
    const yHeroText = useTransform(scrollY, [0, 500], [0, 200]);
    const yHeroImage = useTransform(scrollY, [0, 500], [0, 50]);
    const opacityHero = useTransform(scrollY, [0, 400], [1, 0]);

    useEffect(() => {
        if (!loading && isAuthenticated && user) {
            if (user.role === 'ADMIN') navigate('/admin-dashboard');
            else if (user.role === 'SUPERVISOR') navigate('/dashboard');
            else if (user.role === 'PROFESSIONAL') navigate('/create-report');
            else if (user.role === 'MANAGER') navigate('/manager-dashboard');
        }
    }, [isAuthenticated, user, loading, navigate]);

    const handleContactSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setFormStatus('sending');
        setTimeout(() => setFormStatus('sent'), 1500);
    };

    return (
        <div className="min-h-screen bg-[#FDFDFC] font-sans text-gray-900 overflow-x-hidden selection:bg-blue-100 selection:text-blue-900">
            {/* Navigation */}
            <nav className="fixed top-0 w-full z-50 bg-white/70 backdrop-blur-xl border-b border-gray-100/50">
                <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="bg-blue-600 p-1.5 rounded-lg shadow-lg shadow-blue-500/20">
                            <Send className="w-5 h-5 text-white" />
                        </div>
                        <span className="text-xl font-black tracking-tighter text-gray-900">FLASH<span className="text-blue-600">APP</span></span>
                    </div>

                    <div className="hidden md:flex items-center gap-8 text-[11px] font-bold text-gray-500 uppercase tracking-[0.15em]">
                        <a href="#features" className="hover:text-blue-600 transition-colors">Processo</a>
                        <a href="#specs" className="hover:text-blue-600 transition-colors">Tecnologia</a>
                        <a href="#about" className="hover:text-blue-600 transition-colors">Autor</a>
                        <a href="#contact" className="hover:text-blue-600 transition-colors">Contato</a>
                    </div>

                    <button
                        onClick={() => navigate('/login')}
                        className="bg-gray-900 text-white px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-[0.15em] hover:bg-blue-600 transition-all shadow-xl hover:shadow-2xl hover:shadow-blue-500/20 active:scale-95"
                    >
                        Acessar Sistema
                    </button>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="relative pt-44 pb-32 px-6 overflow-hidden">
                <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-20 relative z-10">
                    <motion.div
                        style={{ y: yHeroText, opacity: opacityHero }}
                        className="flex-1 space-y-8"
                    >
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6 }}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50/50 backdrop-blur-sm rounded-full border border-blue-100"
                        >
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                            </span>
                            <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest">Enterprise Ready Platform</span>
                        </motion.div>

                        <motion.h1
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.1 }}
                            className="text-6xl lg:text-[5.5rem] font-black tracking-tighter leading-[0.95] text-gray-900"
                        >
                            Gestão Tática <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">Em Tempo Real.</span>
                        </motion.h1>

                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.2 }}
                            className="text-lg text-gray-500 max-w-xl leading-relaxed font-medium"
                        >
                            O FLASH elimina o ruído operacional. Conecte equipes de campo, supervisores e gestores em um fluxo contínuo de dados, inteligência e resolução.
                        </motion.p>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.3 }}
                            className="flex flex-col sm:flex-row items-center gap-4"
                        >
                            <button
                                onClick={() => navigate('/login')}
                                className="w-full sm:w-auto px-8 py-5 bg-blue-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-blue-700 transition-all shadow-2xl shadow-blue-500/30 flex items-center justify-center gap-3 hover:-translate-y-1"
                            >
                                Iniciar Operação <ArrowRight className="w-4 h-4" />
                            </button>
                        </motion.div>
                    </motion.div>

                    <motion.div
                        style={{ y: yHeroImage }}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                        className="flex-1 relative w-full"
                    >
                        <div className="relative z-10 w-full aspect-[4/3] rounded-[3rem] bg-gradient-to-br from-gray-900 to-black p-4 shadow-[0_50px_100px_-20px_rgba(0,0,50,0.3)] border-4 border-white ring-1 ring-gray-900/5 rotate-[-2deg] hover:rotate-0 transition-transform duration-700 ease-out">
                            {/* Mock Interface */}
                            <div className="w-full h-full rounded-[2.5rem] bg-[#0F172A] overflow-hidden relative">
                                {/* Header */}
                                <div className="h-16 border-b border-white/10 flex items-center justify-between px-8 bg-white/5 backdrop-blur-md">
                                    <div className="w-24 h-3 bg-white/20 rounded-full"></div>
                                    <div className="flex gap-2">
                                        <div className="w-8 h-8 rounded-full bg-blue-500/20 border border-blue-500/30"></div>
                                        <div className="w-8 h-8 rounded-full bg-white/10"></div>
                                    </div>
                                </div>
                                {/* Body */}
                                <div className="p-8 grid grid-cols-3 gap-6">
                                    <div className="col-span-2 space-y-6">
                                        {/* Kpi Cards */}
                                        <div className="flex gap-4">
                                            <div className="h-28 flex-1 bg-gradient-to-br from-blue-500/20 to-blue-600/20 border border-blue-500/30 rounded-2xl"></div>
                                            <div className="h-28 flex-1 bg-white/5 border border-white/10 rounded-2xl"></div>
                                        </div>
                                        {/* List */}
                                        <div className="space-y-3">
                                            <div className="h-16 w-full bg-white/5 border border-white/10 rounded-xl"></div>
                                            <div className="h-16 w-full bg-white/5 border border-white/10 rounded-xl"></div>
                                            <div className="h-16 w-full bg-white/5 border border-white/10 rounded-xl"></div>
                                        </div>
                                    </div>
                                    <div className="col-span-1 bg-white/5 border border-white/10 rounded-2xl h-full"></div>
                                </div>

                                {/* Floating Notification */}
                                <motion.div
                                    initial={{ x: 50, opacity: 0 }}
                                    animate={{ x: 0, opacity: 1 }}
                                    transition={{ delay: 1, duration: 0.5 }}
                                    className="absolute bottom-8 right-8 bg-white/90 backdrop-blur-xl p-4 rounded-2xl shadow-xl flex items-center gap-3 max-w-[200px]"
                                >
                                    <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center text-white">
                                        <CheckCircle2 className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <div className="h-2 w-16 bg-gray-200 rounded mb-1"></div>
                                        <div className="h-2 w-24 bg-gray-200 rounded"></div>
                                    </div>
                                </motion.div>
                            </div>
                        </div>

                        {/* Blob Background */}
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-blue-500/20 rounded-full blur-[120px] -z-10 animate-pulse"></div>
                    </motion.div>
                </div>
            </section>

            {/* Imported Components */}
            <div id="features">
                <ProcessTimeline />
            </div>

            <div id="specs">
                <TechSpecs />
            </div>

            {/* Developer Section */}
            <section id="about" className="py-32 bg-white relative overflow-hidden">
                <div className="max-w-7xl mx-auto px-6 relative z-10">
                    <div className="flex flex-col lg:flex-row items-center gap-20">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            className="flex-1"
                        >
                            <div className="p-10 bg-gray-50 rounded-[3rem] border border-gray-100 relative overflow-hidden group">
                                <Code2 className="w-40 h-40 text-blue-500/10 absolute top-[-20px] right-[-20px] group-hover:rotate-12 transition-transform duration-700" />
                                <h3 className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-4">Desenvolvedor Full-Stack</h3>
                                <h2 className="text-4xl font-black mb-6">Daniel de Almeida</h2>
                                <p className="text-gray-500 leading-relaxed mb-8">
                                    Especialista em criar sistemas que unem estética refinada com arquitetura robusta. O FLASH é o resultado dessa filosofia: invisível na complexidade, poderoso na entrega.
                                </p>
                                <div className="flex gap-4">
                                    <a href="#" className="p-3 bg-white border border-gray-200 rounded-xl hover:border-blue-500 hover:text-blue-600 transition-all"><Linkedin className="w-5 h-5" /></a>
                                    <a href="#" className="p-3 bg-white border border-gray-200 rounded-xl hover:border-pink-500 hover:text-pink-600 transition-all"><Instagram className="w-5 h-5" /></a>
                                    <a href="#" className="p-3 bg-white border border-gray-200 rounded-xl hover:border-gray-900 hover:text-gray-900 transition-all"><Github className="w-5 h-5" /></a>
                                </div>
                            </div>
                        </motion.div>

                        <div className="flex-1 space-y-8">
                            <h2 className="text-[10px] font-black text-blue-600 uppercase tracking-[0.3em]">Manifesto</h2>
                            <h3 className="text-4xl lg:text-5xl font-black tracking-tight leading-time">
                                "Software corporativo não precisa ser chato."
                            </h3>
                            <p className="text-lg text-gray-500 leading-relaxed">
                                Acreditamos que a qualidade da ferramenta define a qualidade do trabalho. Por isso, investimos tempo em cada pixel, cada transição e cada milissegundo de performance.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Contact Section */}
            <section id="contact" className="py-32 px-6 bg-gray-50">
                <div className="max-w-4xl mx-auto">
                    <div className="bg-white rounded-[3rem] shadow-2xl shadow-gray-200 p-8 md:p-16 relative overflow-hidden">
                        <div className="text-center mb-12 space-y-4">
                            <h2 className="text-[10px] font-black text-blue-600 uppercase tracking-[0.3em]">Contato</h2>
                            <h3 className="text-4xl font-black tracking-tight">Pronto para transformar sua operação?</h3>
                        </div>

                        {formStatus === 'sent' ? (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="py-20 text-center"
                            >
                                <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                                    <CheckCircle2 className="w-10 h-10" />
                                </div>
                                <h4 className="text-2xl font-black mb-2">Solicitação Recebida!</h4>
                                <p className="text-gray-500 text-sm">Entraremos em contato em breve.</p>
                                <button onClick={() => setFormStatus('idle')} className="mt-8 text-blue-600 font-bold text-xs uppercase underline tracking-widest">Enviar Outra</button>
                            </motion.div>
                        ) : (
                            <form onSubmit={handleContactSubmit} className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Seu Nome</label>
                                        <input required type="text" className="w-full bg-gray-50 px-6 py-4 rounded-2xl border-2 border-transparent focus:border-blue-500 focus:bg-white outline-none transition font-medium" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Empresa</label>
                                        <input required type="text" className="w-full bg-gray-50 px-6 py-4 rounded-2xl border-2 border-transparent focus:border-blue-500 focus:bg-white outline-none transition font-medium" />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">E-mail Corporativo</label>
                                    <input required type="email" className="w-full bg-gray-50 px-6 py-4 rounded-2xl border-2 border-transparent focus:border-blue-500 focus:bg-white outline-none transition font-medium" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Mensagem</label>
                                    <textarea required className="w-full bg-gray-50 px-6 py-4 rounded-2xl border-2 border-transparent focus:border-blue-500 focus:bg-white outline-none transition h-32 resize-none font-medium"></textarea>
                                </div>
                                <button
                                    disabled={formStatus === 'sending'}
                                    className="w-full py-5 bg-gray-900 text-white rounded-2xl font-black text-xs uppercase tracking-[0.3em] hover:bg-blue-600 transition-all shadow-xl disabled:opacity-50"
                                >
                                    {formStatus === 'sending' ? 'ENVIANDO...' : 'SOLICITAR DEMO'}
                                </button>
                            </form>
                        )}
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="py-12 border-t border-gray-100 bg-white">
                <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="flex items-center gap-2">
                        <Send className="w-4 h-4 text-blue-600" />
                        <span className="text-sm font-black tracking-tighter">FLASH<span className="text-blue-600">APP</span></span>
                    </div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">© 2026 Daniel de Almeida.</p>
                </div>
            </footer>

            {/* WhatsApp Floating */}
            <a
                href="https://wa.me/5500000000000"
                target="_blank"
                className="fixed bottom-8 right-8 z-50 group"
            >
                <div className="bg-[#25D366] text-white p-4 rounded-full shadow-2xl hover:scale-110 transition-transform duration-300 flex items-center justify-center relative">
                    <MessageSquare className="w-6 h-6" />
                    <span className="absolute right-full mr-4 bg-white text-gray-900 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-xl opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                        Falar no WhatsApp
                    </span>
                </div>
            </a>
        </div>
    );
}
