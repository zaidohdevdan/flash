import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { motion, useScroll, useTransform, useSpring } from 'framer-motion';
import {
    Send,
    ArrowRight,
    MessageSquare,
    CheckCircle2,
    Code2,
    Linkedin,
    Instagram,
    Github,
    Brain,
    WifiOff,
    Zap,
    BarChart3,
    Layers,
    ShieldCheck,
    Globe2,
    Smartphone
} from 'lucide-react';
import { ProcessTimeline } from '../components/home/ProcessTimeline';
import { TechSpecs } from '../components/home/TechSpecs';

export function Home() {
    const navigate = useNavigate();
    const { isAuthenticated, user, loading } = useAuth();
    const [formStatus, setFormStatus] = useState<'idle' | 'sending' | 'sent'>('idle');
    const { scrollY } = useScroll();

    // 3D Tilt Effect State
    const [rotateX, setRotateX] = useState(0);
    const [rotateY, setRotateY] = useState(0);

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;

        const rotateXValue = ((y - centerY) / centerY) * -10; // Max 10 deg rotation
        const rotateYValue = ((x - centerX) / centerX) * 10;

        setRotateX(rotateXValue);
        setRotateY(rotateYValue);
    };

    const handleMouseLeave = () => {
        setRotateX(0);
        setRotateY(0);
    }

    // Parallax Effects
    const yHeroText = useTransform(scrollY, [0, 500], [0, 200]);
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
        <div className="min-h-screen bg-[#020617] font-sans text-slate-200 overflow-x-hidden selection:bg-blue-500/30 selection:text-blue-200">
            {/* Background Effects */}
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute top-0 left-0 w-full h-[800px] bg-gradient-to-b from-blue-900/10 via-slate-900/5 to-transparent" />
                <div className="absolute top-[-20%] right-[-10%] w-[800px] h-[800px] bg-blue-600/10 rounded-full blur-[120px] animate-pulse-slow" />
                <div className="absolute bottom-[-20%] left-[-10%] w-[600px] h-[600px] bg-purple-600/10 rounded-full blur-[100px] animate-pulse-slow delay-1000" />
                {/* Grid Pattern */}
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000,transparent)] opacity-[0.15]" />
            </div>

            {/* Navigation */}
            <nav className="fixed top-0 w-full z-50 bg-slate-950/70 backdrop-blur-xl border-b border-white/5">
                <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="bg-blue-600 p-1.5 rounded-lg shadow-lg shadow-blue-500/20">
                            <Send className="w-5 h-5 text-white" />
                        </div>
                        <span className="text-xl font-black tracking-tighter text-white">FLASH<span className="text-blue-500">APP</span></span>
                    </div>

                    <div className="hidden md:flex items-center gap-8 text-[11px] font-bold text-slate-400 uppercase tracking-[0.15em]">
                        <a href="#features" className="hover:text-white transition-colors">Recursos</a>
                        <a href="#process" className="hover:text-white transition-colors">Processo</a>
                        <a href="#specs" className="hover:text-white transition-colors">Tecnologia</a>
                        <a href="#contact" className="hover:text-white transition-colors">Contato</a>
                    </div>

                    <button
                        onClick={() => navigate('/login')}
                        className="bg-white text-slate-950 px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-[0.15em] hover:bg-blue-500 hover:text-white transition-all shadow-xl hover:shadow-2xl hover:shadow-blue-500/20 active:scale-95"
                    >
                        Acessar Sistema
                    </button>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="relative pt-48 pb-32 px-6 overflow-hidden perspective-distant">
                <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-20 relative z-10">
                    <motion.div
                        style={{ y: yHeroText, opacity: opacityHero }}
                        className="flex-1 space-y-8"
                    >
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6 }}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500/10 backdrop-blur-sm rounded-full border border-blue-500/20"
                        >
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                            </span>
                            <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest">Enterprise System v4.0</span>
                        </motion.div>

                        <motion.h1
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.1 }}
                            className="text-6xl lg:text-[5.5rem] font-black tracking-tighter leading-[0.95] text-white"
                        >
                            Gestão Tática <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">Em Tempo Real.</span>
                        </motion.h1>

                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.2 }}
                            className="text-lg text-slate-400 max-w-xl leading-relaxed font-medium"
                        >
                            O FLASH evoluiu. Além do ruído operacional, entregamos inteligência preditiva, operação offline e sincronia instantânea em uma única plataforma visual.
                        </motion.p>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.3 }}
                            className="flex flex-col sm:flex-row items-center gap-4"
                        >
                            <button
                                onClick={() => navigate('/login')}
                                className="w-full sm:w-auto px-8 py-5 bg-blue-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-blue-500 transition-all shadow-2xl shadow-blue-500/20 flex items-center justify-center gap-3 hover:-translate-y-1 group"
                            >
                                Iniciar Operação <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                            </button>
                        </motion.div>
                    </motion.div>

                    {/* 3D Composition Hero */}
                    <div
                        className="flex-1 w-full perspective-[2000px] group"
                        onMouseMove={handleMouseMove}
                        onMouseLeave={handleMouseLeave}
                    >
                        <motion.div
                            className="relative w-full aspect-[4/3] transform-style-3d transition-transform duration-200 ease-out"
                            style={{
                                rotateX,
                                rotateY
                            }}
                        >
                            {/* Layer 1: Base - Map/Dashboard Aesthetic */}
                            <div className="absolute inset-0 bg-slate-900 rounded-[2.5rem] border border-white/10 shadow-2xl overflow-hidden transform-style-3d translate-z-[-50px]">
                                <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(68,68,68,.2)_50%,transparent_75%,transparent_100%)] bg-[length:250%_250%,100%_100%] animate-shine opacity-20" />
                                <div className="p-8 opacity-30 blur-[1px]">
                                    <div className="h-64 rounded-3xl bg-slate-800/50 w-full mb-6 border border-white/5" />
                                    <div className="grid grid-cols-2 gap-6">
                                        <div className="h-32 rounded-3xl bg-slate-800/50 border border-white/5" />
                                        <div className="h-32 rounded-3xl bg-slate-800/50 border border-white/5" />
                                    </div>
                                </div>
                            </div>

                            {/* Layer 2: Main UI - Glass Elements */}
                            <div className="absolute inset-4 bg-slate-900/80 backdrop-blur-xl rounded-[2rem] border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.5)] transform-style-3d translate-z-[0px] flex flex-col overflow-hidden">
                                {/* Header Mock */}
                                <div className="h-16 border-b border-white/5 flex items-center justify-between px-8 bg-white/5">
                                    <div className="flex gap-2">
                                        <div className="w-3 h-3 rounded-full bg-red-500/20 border border-red-500/50" />
                                        <div className="w-3 h-3 rounded-full bg-yellow-500/20 border border-yellow-500/50" />
                                        <div className="w-3 h-3 rounded-full bg-green-500/20 border border-green-500/50" />
                                    </div>
                                    <div className="h-2 w-20 bg-slate-700 rounded-full" />
                                </div>
                                <div className="p-8 grid grid-cols-2 gap-6 h-full p-6">
                                    <div className="bg-blue-500/10 border border-blue-500/20 rounded-2xl flex items-center justify-center flex-col gap-2 p-4">
                                        <Brain className="w-8 h-8 text-blue-400" />
                                        <div className="h-2 w-16 bg-blue-400/20 rounded-full" />
                                    </div>
                                    <div className="bg-purple-500/10 border border-purple-500/20 rounded-2xl flex items-center justify-center flex-col gap-2 p-4">
                                        <Zap className="w-8 h-8 text-purple-400" />
                                        <div className="h-2 w-16 bg-purple-400/20 rounded-full" />
                                    </div>
                                    <div className="col-span-2 bg-slate-800/30 border border-white/5 rounded-2xl h-full p-4">
                                        <div className="flex gap-2 items-end h-full justify-around pb-2">
                                            {[40, 70, 50, 90, 60, 80].map((h, i) => (
                                                <div key={i} className="w-8 bg-blue-500/40 rounded-t-lg" style={{ height: `${h}%` }} />
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Layer 3: Floating Elements - Notifications & Badges */}
                            <motion.div
                                className="absolute top-[20%] right-[-20px] bg-white/10 backdrop-blur-md border border-white/20 p-4 rounded-2xl shadow-xl flex items-center gap-4 transform-style-3d translate-z-[60px]"
                                animate={{ y: [0, -10, 0] }}
                                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                            >
                                <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center text-white shadow-lg shadow-green-500/20">
                                    <CheckCircle2 className="w-6 h-6" />
                                </div>
                                <div>
                                    <div className="h-2 w-24 bg-white/40 rounded-full mb-2" />
                                    <div className="h-2 w-16 bg-white/20 rounded-full" />
                                </div>
                            </motion.div>

                            <motion.div
                                className="absolute bottom-[20%] left-[-20px] bg-slate-900/90 backdrop-blur-md border border-blue-500/30 p-4 rounded-2xl shadow-xl flex items-center gap-4 transform-style-3d translate-z-[80px]"
                                animate={{ y: [0, 10, 0] }}
                                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                            >
                                <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
                                    <WifiOff className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="text-[10px] font-black uppercase text-blue-300 tracking-widest mb-1">Modo Offline</p>
                                    <p className="text-xs font-bold text-white">Sincronizando...</p>
                                </div>
                            </motion.div>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* System Capabilities - Bento Grid */}
            <section id="features" className="py-32 relative z-10">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="mb-20 text-center">
                        <h2 className="text-[10px] font-black text-blue-500 uppercase tracking-[0.3em] mb-4">Core System</h2>
                        <h3 className="text-4xl md:text-5xl font-black text-white tracking-tight">Capacidades Expandidas</h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[300px]">
                        {/* AI & Neural Core */}
                        <div className="md:col-span-2 group relative bg-slate-900/50 border border-white/5 rounded-[2.5rem] p-10 overflow-hidden hover:border-blue-500/30 transition-all">
                            <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-blue-600/10 rounded-full blur-[80px] group-hover:bg-blue-600/20 transition-all" />
                            <div className="relative z-10 flex flex-col justify-between h-full">
                                <div className="w-14 h-14 bg-blue-500/10 rounded-2xl flex items-center justify-center border border-blue-500/20 mb-6">
                                    <Brain className="w-7 h-7 text-blue-400" />
                                </div>
                                <div>
                                    <h4 className="text-2xl font-black text-white mb-2">Neural Core AI</h4>
                                    <p className="text-slate-400 leading-relaxed max-w-md">Análise preditiva integrada que identifica gargalos operacionais antes que eles virem crise. Sumarização executiva automática.</p>
                                </div>
                            </div>
                        </div>

                        {/* Offline First */}
                        <div className="group relative bg-slate-900/50 border border-white/5 rounded-[2.5rem] p-10 overflow-hidden hover:border-purple-500/30 transition-all">
                            <div className="absolute bottom-0 left-0 w-[200px] h-[200px] bg-purple-600/10 rounded-full blur-[60px] group-hover:bg-purple-600/20 transition-all" />
                            <div className="relative z-10 flex flex-col justify-between h-full">
                                <div className="w-14 h-14 bg-purple-500/10 rounded-2xl flex items-center justify-center border border-purple-500/20 mb-6">
                                    <Smartphone className="w-7 h-7 text-purple-400" />
                                </div>
                                <div>
                                    <h4 className="text-2xl font-black text-white mb-2">Offline First</h4>
                                    <p className="text-slate-400 text-sm leading-relaxed">PWA robusto. Trabalhe em zonas sem sinal com sincronização automática.</p>
                                </div>
                            </div>
                        </div>

                        {/* Real-time Mesh */}
                        <div className="group relative bg-slate-900/50 border border-white/5 rounded-[2.5rem] p-10 overflow-hidden hover:border-emerald-500/30 transition-all">
                            <div className="absolute top-0 left-0 w-[200px] h-[200px] bg-emerald-600/10 rounded-full blur-[60px] group-hover:bg-emerald-600/20 transition-all" />
                            <div className="relative z-10 flex flex-col justify-between h-full">
                                <div className="w-14 h-14 bg-emerald-500/10 rounded-2xl flex items-center justify-center border border-emerald-500/20 mb-6">
                                    <Globe2 className="w-7 h-7 text-emerald-400" />
                                </div>
                                <div>
                                    <h4 className="text-2xl font-black text-white mb-2">Real-time Mesh</h4>
                                    <p className="text-slate-400 text-sm leading-relaxed">Socket Cluster garantindo latência zero na comunicação entre campo e base.</p>
                                </div>
                            </div>
                        </div>

                        {/* Deep Analytics */}
                        <div className="md:col-span-2 group relative bg-slate-900/50 border border-white/5 rounded-[2.5rem] p-10 overflow-hidden hover:border-orange-500/30 transition-all">
                            <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-orange-600/10 rounded-full blur-[80px] group-hover:bg-orange-600/20 transition-all" />
                            <div className="relative z-10 flex flex-col justify-between h-full">
                                <div className="w-14 h-14 bg-orange-500/10 rounded-2xl flex items-center justify-center border border-orange-500/20 mb-6">
                                    <BarChart3 className="w-7 h-7 text-orange-400" />
                                </div>
                                <div>
                                    <h4 className="text-2xl font-black text-white mb-2">Deep Analytics</h4>
                                    <p className="text-slate-400 leading-relaxed max-w-md">Dashboards executivos com inteligência de dados, exportação em diversos formatos e métricas de eficiência em tempo real.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Developer Section */}
            <section id="about" className="py-32 bg-slate-900/30 border-y border-white/5 relative overflow-hidden">
                <div className="max-w-7xl mx-auto px-6 relative z-10">
                    <div className="flex flex-col lg:flex-row items-center gap-20">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            className="flex-1"
                        >
                            <div className="p-10 bg-slate-950 rounded-[3rem] border border-white/5 relative overflow-hidden group hover:border-blue-500/30 transition-all">
                                <Code2 className="w-40 h-40 text-blue-500/5 absolute top-[-20px] right-[-20px] group-hover:rotate-12 transition-transform duration-700" />
                                <h3 className="text-[10px] font-black text-blue-500 uppercase tracking-widest mb-4">Engenharia de Software</h3>
                                <h2 className="text-4xl font-black mb-6 text-white">Daniel de Almeida</h2>
                                <p className="text-slate-400 leading-relaxed mb-8">
                                    Especialista em criar sistemas que unem estética refinada com arquitetura robusta. O FLASH é o resultado dessa filosofia: invisível na complexidade, poderoso na entrega.
                                </p>
                                <div className="flex gap-4">
                                    <a href="#" className="p-3 bg-white/5 border border-white/10 rounded-xl hover:bg-blue-600 hover:border-blue-500 hover:text-white transition-all text-slate-400"><Linkedin className="w-5 h-5" /></a>
                                    <a href="#" className="p-3 bg-white/5 border border-white/10 rounded-xl hover:bg-pink-600 hover:border-pink-500 hover:text-white transition-all text-slate-400"><Instagram className="w-5 h-5" /></a>
                                    <a href="#" className="p-3 bg-white/5 border border-white/10 rounded-xl hover:bg-white hover:border-white hover:text-black transition-all text-slate-400"><Github className="w-5 h-5" /></a>
                                </div>
                            </div>
                        </motion.div>

                        <div className="flex-1 space-y-8">
                            <h2 className="text-[10px] font-black text-blue-500 uppercase tracking-[0.3em]">Manifesto</h2>
                            <h3 className="text-4xl lg:text-5xl font-black tracking-tight leading-time text-white">
                                "Software corporativo não precisa ser chato."
                            </h3>
                            <p className="text-lg text-slate-400 leading-relaxed">
                                Acreditamos que a qualidade da ferramenta define a qualidade do trabalho. Por isso, investimos tempo em cada pixel, cada transição e cada milissegundo de performance.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Contact Section */}
            <section id="contact" className="py-32 px-6">
                <div className="max-w-4xl mx-auto">
                    <div className="bg-slate-900/80 backdrop-blur-xl border border-white/5 rounded-[3rem] shadow-2xl p-8 md:p-16 relative overflow-hidden">
                        <div className="text-center mb-12 space-y-4">
                            <h2 className="text-[10px] font-black text-blue-500 uppercase tracking-[0.3em]">Contato</h2>
                            <h3 className="text-4xl font-black tracking-tight text-white">Pronto para transformar sua operação?</h3>
                        </div>

                        {formStatus === 'sent' ? (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="py-20 text-center"
                            >
                                <div className="w-20 h-20 bg-green-500/20 text-green-400 rounded-full flex items-center justify-center mx-auto mb-6 border border-green-500/30">
                                    <CheckCircle2 className="w-10 h-10" />
                                </div>
                                <h4 className="text-2xl font-black mb-2 text-white">Solicitação Recebida!</h4>
                                <p className="text-slate-400 text-sm">Entraremos em contato em breve.</p>
                                <button onClick={() => setFormStatus('idle')} className="mt-8 text-blue-400 font-bold text-xs uppercase underline tracking-widest hover:text-blue-300">Enviar Outra</button>
                            </motion.div>
                        ) : (
                            <form onSubmit={handleContactSubmit} className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Seu Nome</label>
                                        <input required type="text" className="w-full bg-slate-950/50 px-6 py-4 rounded-2xl border border-white/5 focus:border-blue-500/50 focus:bg-slate-900 text-white outline-none transition font-medium" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Empresa</label>
                                        <input required type="text" className="w-full bg-slate-950/50 px-6 py-4 rounded-2xl border border-white/5 focus:border-blue-500/50 focus:bg-slate-900 text-white outline-none transition font-medium" />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">E-mail Corporativo</label>
                                    <input required type="email" className="w-full bg-slate-950/50 px-6 py-4 rounded-2xl border border-white/5 focus:border-blue-500/50 focus:bg-slate-900 text-white outline-none transition font-medium" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Mensagem</label>
                                    <textarea required className="w-full bg-slate-950/50 px-6 py-4 rounded-2xl border border-white/5 focus:border-blue-500/50 focus:bg-slate-900 text-white outline-none transition h-32 resize-none font-medium"></textarea>
                                </div>
                                <button
                                    disabled={formStatus === 'sending'}
                                    className="w-full py-5 bg-white text-slate-950 rounded-2xl font-black text-xs uppercase tracking-[0.3em] hover:bg-blue-500 hover:text-white transition-all shadow-xl disabled:opacity-50"
                                >
                                    {formStatus === 'sending' ? 'ENVIANDO...' : 'SOLICITAR DEMO'}
                                </button>
                            </form>
                        )}
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="py-12 border-t border-white/5 bg-slate-950 relative z-10">
                <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="flex items-center gap-2">
                        <Send className="w-4 h-4 text-blue-500" />
                        <span className="text-sm font-black tracking-tighter text-white">FLASH<span className="text-blue-500">APP</span></span>
                    </div>
                    <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">© 2026 Daniel de Almeida.</p>
                </div>
            </footer>
        </div>
    );
}
