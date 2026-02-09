import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { motion, useScroll, useTransform, useReducedMotion, useSpring, AnimatePresence } from 'framer-motion';
import {
    Send,
    ArrowRight,
    CheckCircle2,
    Code2,
    Linkedin,
    Instagram,
    Github,
    Brain,
    WifiOff,
    Zap,
    BarChart3,
    Globe2,
    Smartphone,
    Twitter,
    Moon,
    Sun
} from 'lucide-react';
import { ProcessTimeline } from '../components/home/ProcessTimeline';
import { TechSpecs } from '../components/home/TechSpecs';
import { FaqSection } from '../components/home/FaqSection';
import { Globe } from '../components/home/Globe';
import { api } from '../services/api';
import { DocsModal } from '../components/domain/modals/DocsModal';
import { toast } from 'react-hot-toast';

export function Home() {
    const navigate = useNavigate();
    const { isAuthenticated, user, loading } = useAuth();
    const [formStatus, setFormStatus] = useState<'idle' | 'sending' | 'sent'>('idle');
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isDocsOpen, setIsDocsOpen] = useState(false);
    const { scrollY, scrollYProgress } = useScroll();

    // Theme Management
    const [isDark, setIsDark] = useState(document.documentElement.classList.contains('dark'));

    // Sync React state with DOM mutations (if UserSettingsEffects changes it)
    useEffect(() => {
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.attributeName === 'class') {
                    setIsDark(document.documentElement.classList.contains('dark'));
                }
            });
        });
        observer.observe(document.documentElement, { attributes: true });
        return () => observer.disconnect();
    }, []);

    const toggleTheme = () => {
        const newTheme = isDark ? 'light' : 'dark';
        if (newTheme === 'dark') {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
        localStorage.setItem('theme', newTheme);
        setIsDark(!isDark);
    };

    // Smooth progress bar
    const scaleX = useSpring(scrollYProgress, {
        stiffness: 100,
        damping: 30,
        restDelta: 0.001
    });

    // 3D Tilt Effect State
    const [rotateX, setRotateX] = useState(0);
    const [rotateY, setRotateY] = useState(0);
    const [glarePosition, setGlarePosition] = useState({ x: 50, y: 50 });

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;

        const rotateXValue = ((y - centerY) / centerY) * -8;
        const rotateYValue = ((x - centerX) / centerX) * 8;

        setRotateX(rotateXValue);
        setRotateY(rotateYValue);
        setGlarePosition({ x: (x / rect.width) * 100, y: (y / rect.height) * 100 });
    };

    const handleMouseLeave = () => {
        setRotateX(0);
        setRotateY(0);
        setGlarePosition({ x: 50, y: 50 });
    }

    const shouldReduceMotion = useReducedMotion();

    // Parallax & Explosive Scrollytelling Effects
    const yHeroText = useTransform(scrollY, [0, 500], shouldReduceMotion ? [0, 0] : [0, 150]);
    const opacityHero = useTransform(scrollY, [0, 400], [1, 0]);

    // Layer 1 (Base Map)
    const yLayer1 = useTransform(scrollY, [0, 500], shouldReduceMotion ? [0, 0] : [0, -200]);
    const opacityLayer1 = useTransform(scrollY, [100, 500], [1, 0]);
    const scaleLayer1 = useTransform(scrollY, [0, 500], shouldReduceMotion ? [1, 1] : [1, 0.9]);

    // Layer 2 (Main UI)
    const xLayer2A = useTransform(scrollY, [0, 500], shouldReduceMotion ? [0, 0] : [0, -200]);
    const xLayer2B = useTransform(scrollY, [0, 500], shouldReduceMotion ? [0, 0] : [0, 200]);
    const rotateLayer2 = useTransform(scrollY, [0, 500], shouldReduceMotion ? [0, 0] : [0, 15]);
    const opacityLayer2 = useTransform(scrollY, [200, 600], [1, 0]);

    // Layer 3 (Floating)
    const zLayer3 = useTransform(scrollY, [0, 500], shouldReduceMotion ? [0, 0] : [0, 500]);
    const opacityLayer3 = useTransform(scrollY, [300, 600], [1, 0]);

    useEffect(() => {
        if (!loading && isAuthenticated && user) {
            if (user.role === 'ADMIN') navigate('/admin-dashboard');
            else if (user.role === 'SUPERVISOR') navigate('/dashboard');
            else if (user.role === 'PROFESSIONAL') navigate('/create-report');
            else if (user.role === 'MANAGER') navigate('/manager-dashboard');
        }
    }, [isAuthenticated, user, loading, navigate]);

    const handleContactSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setFormStatus('sending');

        const formData = new FormData(e.currentTarget);
        const data = {
            name: formData.get('name'),
            email: formData.get('email'),
            company: formData.get('company'),
            message: formData.get('message'),
        };

        try {
            // Hybrid solution: Save to DB AND send to Email via Formspree
            // Replace 'xfoyonza' with your actual ID when you have it.
            // Documentation: https://formspree.io
            await Promise.all([
                api.post('/contacts', data),
                fetch('https://formspree.io/f/mvzbgbdk', {
                    method: 'POST',
                    body: JSON.stringify(data),
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json'
                    }
                })
            ]);

            setFormStatus('sent');
        } catch (error) {
            console.error('Erro ao enviar contato:', error);
            toast.error('Erro ao enviar mensagem. Tente novamente.');
            setFormStatus('idle');
        }
    };

    return (
        <div className="min-h-screen bg-white dark:bg-slate-950 font-sans text-slate-900 dark:text-slate-100 overflow-x-hidden selection:bg-lime-200 selection:text-lime-900 relative transition-colors duration-500">

            {/* Scroll Progress Bar */}
            <motion.div
                className="fixed top-0 left-0 right-0 h-1 bg-[#d4e720] origin-left z-[60]"
                style={{ scaleX }}
            />

            {/* Premium Grain Texture Overlay */}
            <div className="fixed inset-0 pointer-events-none opacity-[0.035] z-[100] mix-blend-multiply dark:mix-blend-overlay" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}></div>

            {/* Dynamic Mesh Gradient Background */}
            <div className="fixed inset-0 pointer-events-none z-0">
                <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-100/40 dark:bg-blue-900/20 rounded-full blur-[120px] mix-blend-multiply dark:mix-blend-normal animate-pulse-slow" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-[#d4e720]/15 dark:bg-[#d4e720]/5 rounded-full blur-[120px] mix-blend-multiply dark:mix-blend-normal animate-pulse-slow delay-1000" />
                <div className="absolute top-[40%] left-[40%] w-[40%] h-[40%] bg-slate-100/80 dark:bg-slate-800/20 rounded-full blur-[100px] mix-blend-multiply dark:mix-blend-normal animate-pulse-slow delay-500" />
            </div>

            {/* Navigation */}
            <nav className="fixed top-0 w-full z-50 bg-white/70 dark:bg-slate-950/70 backdrop-blur-2xl border-b border-white/20 dark:border-slate-800/50 shadow-[0_2px_20px_rgba(0,0,0,0.02)] transition-all">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 h-20 sm:h-24 flex items-center justify-between">
                    {/* Logo Section */}
                    <div className="flex items-center gap-2 sm:gap-3 shrink-0">
                        <div className="bg-[#d4e720] p-1.5 sm:p-2 rounded-xl shadow-lg shadow-lime-500/20 border border-[#bed20e]">
                            <Send className="w-4 h-4 sm:w-5 sm:h-5 text-[#1a2e05]" />
                        </div>
                        <span className="text-xl sm:text-2xl font-black tracking-tighter text-slate-900 dark:text-white">
                            FLASH<span className="text-[#a3b60b] hidden sm:inline">APP</span>
                        </span>
                    </div>

                    {/* Desktop Navigation Links */}
                    <div className="hidden lg:flex items-center gap-8 xl:gap-10 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-[0.15em]">
                        <a href="#features" className="hover:text-slate-900 dark:hover:text-white transition-colors relative group">
                            Recursos
                            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[#d4e720] transition-all group-hover:w-full" />
                        </a>
                        <a href="#process" className="hover:text-slate-900 dark:hover:text-white transition-colors relative group">
                            Processo
                            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[#d4e720] transition-all group-hover:w-full" />
                        </a>
                        <a href="#specs" className="hover:text-slate-900 dark:hover:text-white transition-colors relative group">
                            Tecnologia
                            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[#d4e720] transition-all group-hover:w-full" />
                        </a>
                        <a href="#contact" className="hover:text-slate-900 dark:hover:text-white transition-colors relative group">
                            Contato
                            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[#d4e720] transition-all group-hover:w-full" />
                        </a>
                    </div>

                    {/* Action Area (Selectors + CTA) */}
                    <div className="flex items-center gap-2 sm:gap-4 ml-auto">
                        {/* Settings Toggles - Hidden on Mobile, shown on Desktop */}
                        <div className="hidden lg:flex items-center gap-1 sm:gap-2 border-r border-slate-200 dark:border-slate-800 pr-2 sm:pr-4">
                            <button
                                title='Alternar Tema'
                                type='button'
                                onClick={toggleTheme}
                                className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-slate-500 dark:text-slate-400"
                                aria-label="Alterar Tema"
                            >
                                {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                            </button>
                        </div>

                        {/* CTA Button - Hidden on very small screens, compact on mid-mobile */}
                        <button
                            title='Acessar Sistema'
                            type='button'
                            onClick={() => navigate('/login')}
                            className="hidden sm:flex bg-[#d4e720] text-[#1a2e05] border border-[#bed20e] px-4 sm:px-8 py-2.5 sm:py-4 rounded-xl sm:rounded-2xl font-black text-[10px] sm:text-[11px] uppercase tracking-[0.1em] sm:tracking-[0.15em] hover:bg-[#a3b60b] transition-all shadow-xl hover:shadow-2xl hover:shadow-lime-500/10 hover:scale-[1.02] active:scale-95 group relative overflow-hidden whitespace-nowrap"
                        >
                            <span className="relative z-10">Acessar Sistema</span>
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                        </button>

                        {/* Mobile Menu Toggle */}
                        <button
                            title='Menu'
                            type='button'
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                            className="lg:hidden p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        >
                            <div className="w-6 h-5 flex flex-col justify-between items-center relative">
                                <span className={`w-full h-0.5 bg-current transition-all duration-300 ${isMobileMenuOpen ? 'rotate-45 translate-y-[9px]' : ''}`} />
                                <span className={`w-full h-0.5 bg-current transition-all duration-300 ${isMobileMenuOpen ? 'opacity-0' : ''}`} />
                                <span className={`w-full h-0.5 bg-current transition-all duration-300 ${isMobileMenuOpen ? '-rotate-45 -translate-y-[9px]' : ''}`} />
                            </div>
                        </button>
                    </div>
                </div>

                {/* Mobile Menu Overlay */}
                <AnimatePresence>
                    {isMobileMenuOpen && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="lg:hidden bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-t border-slate-200 dark:border-slate-800 overflow-hidden"
                        >
                            <div className="px-6 py-8 flex flex-col gap-8">
                                {/* Navigation Links */}
                                <div className="flex flex-col gap-6 text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-[0.2em]">
                                    <a
                                        href="#features"
                                        onClick={() => setIsMobileMenuOpen(false)}
                                        className="hover:text-[#d4e720] transition-colors"
                                    >
                                        Recursos
                                    </a>
                                    <a
                                        href="#process"
                                        onClick={() => setIsMobileMenuOpen(false)}
                                        className="hover:text-[#d4e720] transition-colors"
                                    >
                                        Processo
                                    </a>
                                    <a
                                        href="#specs"
                                        onClick={() => setIsMobileMenuOpen(false)}
                                        className="hover:text-[#d4e720] transition-colors"
                                    >
                                        Tecnologia
                                    </a>
                                    <a
                                        href="#contact"
                                        onClick={() => setIsMobileMenuOpen(false)}
                                        className="hover:text-[#d4e720] transition-colors"
                                    >
                                        Contato
                                    </a>
                                </div>

                                <div className="h-px bg-slate-200 dark:bg-slate-800 w-full" />

                                {/* Settings Toggles */}
                                <div className="grid grid-cols-1 gap-4">
                                    <button
                                        title='Alternar Tema'
                                        type='button'
                                        onClick={toggleTheme}
                                        className="flex items-center justify-center gap-3 p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-bold text-xs uppercase tracking-widest hover:bg-white dark:hover:bg-slate-700 transition-all"
                                    >
                                        {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                                        <span className="text-[10px]">{isDark ? 'Tema Claro' : 'Tema Escuro'}</span>
                                    </button>
                                </div>

                                {/* Primary Phone Call / CTA */}
                                <button
                                    title='Acessar Sistema'
                                    type='button'
                                    onClick={() => {
                                        setIsMobileMenuOpen(false);
                                        navigate('/login');
                                    }}
                                    className="w-full bg-[#d4e720] text-[#1a2e05] py-5 rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-lg shadow-lime-500/20 hover:scale-[1.02] active:scale-95 transition-all"
                                >
                                    Acessar Sistema
                                </button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </nav>

            {/* Hero Section */}
            <section className="relative pt-32 sm:pt-48 pb-20 sm:pb-32 px-4 sm:px-6 overflow-visible perspective-distant">
                <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-12 sm:gap-16 relative z-10">
                    <motion.div
                        style={{ y: yHeroText, opacity: opacityHero }}
                        className="flex-1 space-y-8 sm:space-y-10 text-center lg:text-left"
                    >
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8, ease: "easeOut" }}
                            className="inline-flex items-center gap-3 px-4 sm:px-5 py-2 sm:py-2.5 bg-white dark:bg-slate-900 backdrop-blur-md rounded-full border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 shadow-sm hover:shadow-md transition-shadow cursor-default group"
                        >
                            <span className="relative flex h-2 sm:h-2.5 w-2 sm:w-2.5">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#d4e720] opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 sm:h-2.5 w-2 sm:w-2.5 bg-[#a3b60b]"></span>
                            </span>
                            <span className="text-[10px] sm:text-[11px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-500 group-hover:text-slate-900 dark:group-hover:text-slate-300 transition-colors">Sistema Enterprise v4.0</span>
                        </motion.div>

                        <motion.h1
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8, delay: 0.1, ease: "easeOut" }}
                            className="text-4xl sm:text-6xl md:text-7xl lg:text-[6.5rem] font-black tracking-tighter leading-[0.9] text-slate-900 dark:text-white relative"
                        >
                            Gestão <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-slate-800 via-slate-600 to-slate-400 dark:from-slate-100 dark:via-slate-400 dark:to-slate-600 bg-[length:200%_auto] animate-shimmer">Sem Ruído.</span>
                        </motion.h1>

                        <motion.p
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
                            className="text-lg sm:text-xl text-slate-500 dark:text-slate-400 max-w-xl mx-auto lg:mx-0 leading-relaxed font-medium"
                        >
                            O <span className="font-bold text-slate-900 dark:text-white">FLASH</span> unifica sua operação de campo. Inteligência preditiva, operação offline e design minimalista para quem lidera o futuro.
                        </motion.p>

                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
                            className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 sm:gap-6 pt-4"
                        >
                            <button
                                title='Iniciar Operação'
                                type='button'
                                onClick={() => navigate('/login')}
                                className="w-full sm:w-auto px-10 py-5 sm:py-6 bg-[#d4e720] text-[#1a2e05] border border-[#bed20e] rounded-[1.25rem] font-black text-xs uppercase tracking-widest hover:bg-[#bfd40b] hover:shadow-2xl hover:scale-105 transition-all shadow-xl shadow-lime-500/20 flex items-center justify-center gap-3 group relative overflow-hidden"
                            >
                                <span className="relative z-10 flex items-center gap-3">
                                    Iniciar Operação <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                </span>
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                            </button>
                            <button
                                onClick={() => setIsDocsOpen(true)}
                                className="w-full sm:w-auto px-10 py-5 sm:py-6 bg-white dark:bg-slate-900 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-800 rounded-[1.25rem] font-black text-xs uppercase tracking-widest hover:bg-slate-50 dark:hover:bg-slate-800 hover:border-slate-300 transition-all flex items-center justify-center gap-3 hover:shadow-lg hover:-translate-y-0.5"
                            >
                                Ver Documentação
                            </button>
                        </motion.div>
                    </motion.div>

                    {/* 3D Composition Hero - Ultra Premium with Glare */}
                    <div
                        className="flex-1 w-full perspective-[2500px] group h-[400px] sm:h-[600px] flex items-center justify-center relative"
                        onMouseMove={handleMouseMove}
                        onMouseLeave={handleMouseLeave}
                    >
                        <motion.div
                            className="relative w-full aspect-[4/3] transform-style-3d transition-transform duration-300 ease-out"
                            style={{
                                rotateX,
                                rotateY
                            }}
                        >
                            {/* Layer 1: Base - Clean Card with heavy shadow */}
                            <motion.div
                                style={{ y: yLayer1, opacity: opacityLayer1, scale: scaleLayer1 }}
                                className="absolute inset-0 bg-white dark:bg-slate-900 rounded-[3rem] border border-slate-100 dark:border-slate-800 shadow-[0_50px_100px_-20px_rgba(0,0,0,0.1)] dark:shadow-[0_50px_100px_-20px_rgba(0,0,0,0.5)] overflow-hidden transform-style-3d translate-z-[-50px]"
                            >
                                <div className="absolute inset-0 bg-slate-50/50 dark:bg-slate-900/50" />
                                {/* Dynamic Glare */}
                                <div
                                    className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none z-50 mix-blend-overlay"
                                    style={{
                                        backgroundPosition: `${glarePosition.x}% ${glarePosition.y}%`
                                    }}
                                />

                                <div className="p-10 opacity-40 blur-[0.5px]">
                                    <div className="flex gap-4 mb-8">
                                        <div className="w-16 h-16 rounded-2xl bg-slate-200 dark:bg-slate-800 animate-pulse" />
                                        <div className="flex-1 space-y-3 pt-2">
                                            <div className="h-4 w-1/3 bg-slate-200 dark:bg-slate-800 rounded-full" />
                                            <div className="h-3 w-1/4 bg-slate-100 dark:bg-slate-800/60 rounded-full" />
                                        </div>
                                    </div>
                                    <div className="h-64 rounded-[2rem] bg-slate-100 dark:bg-slate-800/50 w-full mb-6 border border-slate-200 dark:border-slate-800" />
                                    <div className="grid grid-cols-3 gap-6">
                                        <div className="h-24 rounded-[1.5rem] bg-slate-100 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800" />
                                        <div className="h-24 rounded-[1.5rem] bg-slate-100 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800" />
                                        <div className="h-24 rounded-[1.5rem] bg-slate-100 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800" />
                                    </div>
                                </div>
                            </motion.div>

                            {/* Layer 2: Main UI - Glass Panel with Realism */}
                            <motion.div
                                style={{ rotateZ: rotateLayer2, opacity: opacityLayer2 }}
                                className="absolute inset-8 bg-white/80 dark:bg-slate-900/80 backdrop-blur-2xl rounded-[2.5rem] border border-white/60 dark:border-slate-700/60 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.15)] dark:shadow-[0_20px_60px_-15px_rgba(0,0,0,0.5)] transform-style-3d translate-z-[20px] flex flex-col overflow-hidden"
                            >
                                {/* Header Mock */}
                                <div className="h-20 border-b border-slate-100/50 dark:border-slate-800/50 flex items-center justify-between px-8 bg-white/50 dark:bg-slate-900/50">
                                    <div className="flex gap-2.5">
                                        <div className="w-3.5 h-3.5 rounded-full bg-slate-300 dark:bg-slate-700" />
                                        <div className="w-3.5 h-3.5 rounded-full bg-slate-200 dark:bg-slate-800" />
                                    </div>
                                    <div className="flex gap-4">
                                        <div className="h-2 w-20 bg-slate-200 dark:bg-slate-800 rounded-full opacity-50" />
                                        <div className="h-2 w-6 bg-slate-200 dark:bg-slate-800 rounded-full opacity-50" />
                                    </div>
                                </div>
                                <div className="p-8 grid grid-cols-2 gap-6 h-full p-6 relative">
                                    <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/40 to-white/10 dark:via-white/5 dark:to-transparent pointer-events-none" />

                                    <motion.div style={{ x: xLayer2A }} className="bg-white dark:bg-slate-950/50 border border-slate-100 dark:border-slate-800 rounded-[1.5rem] flex items-center justify-center flex-col gap-3 p-6 shadow-sm">
                                        <div className="p-3 bg-blue-50 dark:bg-blue-950/50 rounded-xl">
                                            <Brain className="w-6 h-6 text-blue-500" />
                                        </div>
                                        <div className="h-2 w-12 bg-slate-100 dark:bg-slate-800 rounded-full" />
                                    </motion.div>
                                    <motion.div style={{ x: xLayer2B }} className="bg-white dark:bg-slate-950/50 border border-slate-100 dark:border-slate-800 rounded-[1.5rem] flex items-center justify-center flex-col gap-3 p-6 shadow-sm">
                                        <div className="p-3 bg-[#f7fccb] dark:bg-lime-950/30 rounded-xl">
                                            <Zap className="w-6 h-6 text-[#a3b60b]" />
                                        </div>
                                        <div className="h-2 w-12 bg-slate-100 dark:bg-slate-800 rounded-full" />
                                    </motion.div>
                                    <div className="col-span-2 bg-slate-50/50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800 rounded-[1.5rem] h-full p-6 relative overflow-hidden">
                                        <div className="flex gap-3 items-end h-full justify-around pb-2">
                                            {[45, 75, 55, 95, 65, 85].map((h, i) => (
                                                <div key={i} className="w-8 bg-gradient-to-t from-[#d4e720] to-[#eaff66] rounded-t-lg shadow-sm" style={{ height: `${h}%` }} />
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </motion.div>

                            {/* Layer 3: Floating Elements - High Definition */}
                            <motion.div
                                style={{ z: zLayer3, opacity: opacityLayer3 }}
                                className="absolute top-[10%] right-4 lg:right-[-40px] bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-4 md:p-5 rounded-[1.5rem] shadow-[0_20px_40px_-10px_rgba(0,0,0,0.1)] dark:shadow-[0_20px_40px_-10px_rgba(0,0,0,0.5)] flex items-center gap-4 md:gap-5 transform-style-3d translate-z-[40px] md:translate-z-[80px] scale-75 md:scale-90 lg:scale-100"
                            >
                                <div className="w-12 h-12 rounded-full bg-emerald-500 flex items-center justify-center text-white shadow-xl shadow-emerald-500/30">
                                    <CheckCircle2 className="w-6 h-6" />
                                </div>
                                <div>
                                    <div className="h-2.5 w-24 bg-slate-800 dark:bg-slate-200 rounded-full mb-2.5" />
                                    <div className="h-2 w-16 bg-slate-200 dark:bg-slate-600 rounded-full" />
                                </div>
                            </motion.div>

                            <motion.div
                                style={{ z: zLayer3, opacity: opacityLayer3 }}
                                className="absolute bottom-[10%] left-4 lg:left-[-40px] bg-slate-900 dark:bg-slate-800 backdrop-blur-md border border-slate-800 p-4 md:p-5 rounded-[1.5rem] shadow-[0_30px_60px_-15px_rgba(0,0,0,0.5)] flex items-center gap-4 md:gap-5 transform-style-3d translate-z-[60px] md:translate-z-[120px] scale-75 md:scale-90 lg:scale-100"
                            >
                                <div className="w-12 h-12 rounded-full bg-[#d4e720] flex items-center justify-center text-[#1a2e05] shadow-xl shadow-lime-500/20 animate-pulse">
                                    <WifiOff className="w-6 h-6" />
                                </div>
                                <div>
                                    <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1.5">Modo Offline</p>
                                    <p className="text-sm font-bold text-white">Sincronização Ativa</p>
                                </div>
                            </motion.div>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* System Capabilities - Bento Grid Premium */}
            <section id="features" className="py-20 sm:py-40 relative z-10 bg-white dark:bg-slate-950 border-y border-slate-100 dark:border-slate-800/50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6">
                    <div className="mb-16 sm:mb-24 text-center max-w-2xl mx-auto">
                        <h2 className="text-[10px] sm:text-xs font-black text-slate-400 uppercase tracking-[0.4em] mb-4 sm:mb-6">SISTEMA CORE</h2>
                        <h3 className="text-3xl sm:text-4xl md:text-6xl font-black text-slate-900 dark:text-white tracking-tighter mb-4 sm:mb-6">
                            Capacidades <br className="hidden sm:block" />Expandidas
                        </h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 auto-rows-[350px]">
                        {/* AI & Neural Core */}
                        <div className="md:col-span-2 group relative bg-slate-50 dark:bg-slate-900 rounded-[3rem] p-12 overflow-hidden hover:shadow-2xl hover:shadow-slate-200/50 dark:hover:shadow-black/50 transition-all duration-500 hover:-translate-y-1">
                            <div className="absolute inset-0 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[3rem] transition-all group-hover:border-slate-300 dark:group-hover:border-slate-700" />
                            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-to-br from-blue-100/50 via-purple-100/50 to-transparent dark:from-blue-900/20 dark:via-purple-900/20 rounded-full blur-[100px] group-hover:scale-110 transition-transform duration-700 opacity-0 group-hover:opacity-100" />

                            <div className="relative z-10 flex flex-col justify-between h-full">
                                <div className="w-16 h-16 bg-white dark:bg-slate-800 rounded-2xl flex items-center justify-center border border-slate-100 dark:border-slate-700 mb-8 shadow-sm group-hover:rotate-6 transition-transform duration-500">
                                    <Brain className="w-8 h-8 text-slate-800 dark:text-slate-200" />
                                </div>
                                <div>
                                    <h4 className="text-3xl font-black text-slate-900 dark:text-white mb-4 tracking-tight">IA Neural Core</h4>
                                    <p className="text-slate-500 dark:text-slate-400 text-lg leading-relaxed max-w-md">Processamento inteligente de dados em tempo real para insights preditivos e automação de fluxo de trabalho.</p>
                                </div>
                            </div>
                        </div>

                        {/* Offline First */}
                        <div className="group relative bg-slate-50 dark:bg-slate-900 rounded-[3rem] p-12 overflow-hidden hover:shadow-2xl hover:shadow-slate-200/50 dark:hover:shadow-black/50 transition-all duration-500 hover:-translate-y-1">
                            <div className="absolute inset-0 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[3rem] transition-all group-hover:border-slate-300 dark:group-hover:border-slate-700" />
                            <div className="relative z-10 flex flex-col justify-between h-full">
                                <div className="w-16 h-16 bg-white dark:bg-slate-800 rounded-2xl flex items-center justify-center border border-slate-100 dark:border-slate-700 mb-8 shadow-sm group-hover:rotate-6 transition-transform duration-500">
                                    <Smartphone className="w-8 h-8 text-slate-800 dark:text-slate-200" />
                                </div>
                                <div>
                                    <h4 className="text-3xl font-black text-slate-900 dark:text-white mb-4 tracking-tight">Offline First</h4>
                                    <p className="text-slate-500 dark:text-slate-400 text-lg leading-relaxed">Continue trabalhando mesmo sem conexão. O FLASH sincroniza seus dados automaticamente assim que o sinal retornar.</p>
                                </div>
                            </div>
                        </div>

                        {/* Real-time Mesh (Orbital) */}
                        <div className="group relative bg-slate-900 dark:bg-slate-950 rounded-[3rem] overflow-hidden shadow-2xl shadow-slate-900/20 dark:shadow-black/50 hover:-translate-y-1 transition-all duration-500">
                            <div className="absolute inset-0 z-0 opacity-40 group-hover:opacity-60 transition-opacity duration-700 flex items-center justify-center scale-150">
                                <Globe className="w-full h-full text-[#d4e720]" />
                            </div>
                            <div className="relative z-10 flex flex-col justify-end h-full p-12 pointer-events-none bg-gradient-to-t from-slate-900 via-slate-900/50 to-transparent">
                                <div className="w-16 h-16 bg-[#d4e720]/20 rounded-2xl flex items-center justify-center border border-[#d4e720]/20 mb-6 backdrop-blur-md">
                                    <Globe2 className="w-8 h-8 text-[#d4e720]" />
                                </div>
                                <div>
                                    <h4 className="text-3xl font-black text-white mb-2 tracking-tight">Mesh Global</h4>
                                    <p className="text-slate-400 leading-relaxed">Conectividade resiliente e distribuída, garantindo que sua equipe esteja sempre sincronizada em qualquer lugar do mundo.</p>
                                </div>
                            </div>
                        </div>

                        {/* Deep Analytics */}
                        <div className="md:col-span-2 group relative bg-slate-50 dark:bg-slate-900 rounded-[3rem] p-12 overflow-hidden hover:shadow-2xl hover:shadow-slate-200/50 dark:hover:shadow-black/50 transition-all duration-500 hover:-translate-y-1">
                            <div className="absolute inset-0 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[3rem] transition-all group-hover:border-slate-300 dark:group-hover:border-slate-700" />
                            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-to-br from-orange-100/50 via-red-100/50 to-transparent dark:from-orange-900/20 dark:via-red-900/20 rounded-full blur-[100px] group-hover:scale-110 transition-transform duration-700 opacity-0 group-hover:opacity-100" />
                            <div className="relative z-10 flex flex-col justify-between h-full">
                                <div className="w-16 h-16 bg-white dark:bg-slate-800 rounded-2xl flex items-center justify-center border border-slate-100 dark:border-slate-700 mb-8 shadow-sm group-hover:rotate-6 transition-transform duration-500">
                                    <BarChart3 className="w-8 h-8 text-slate-800 dark:text-slate-200" />
                                </div>
                                <div>
                                    <h4 className="text-3xl font-black text-slate-900 dark:text-white mb-4 tracking-tight">Deep Analytics</h4>
                                    <p className="text-slate-500 dark:text-slate-400 text-lg leading-relaxed max-w-md">Visualize dados complexos com extrema clareza. Dashboards interativos projetados para decisões baseadas em evidências.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Developer Section */}
            <section id="about" className="py-20 sm:py-40 bg-slate-100 dark:bg-slate-900 relative overflow-hidden">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
                    <div className="flex flex-col lg:flex-row items-center gap-24">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            className="flex-1 w-full"
                        >
                            <div className="p-8 md:p-12 bg-white dark:bg-slate-800 rounded-[3rem] border border-slate-200 dark:border-slate-700 shadow-2xl shadow-slate-200/50 dark:shadow-black/30 relative overflow-hidden group hover:shadow-[0_40px_80px_-20px_rgba(0,0,0,0.1)] transition-all duration-500">
                                <Code2 className="w-32 h-32 md:w-64 md:h-64 text-slate-50 dark:text-slate-700 absolute top-[-20px] right-[-20px] md:top-[-40px] md:right-[-40px] group-hover:rotate-6 transition-transform duration-1000" />
                                <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-6 relative z-10">Engenharia de Software</h3>
                                <h2 className="text-3xl md:text-4xl lg:text-5xl font-black mb-8 text-slate-900 dark:text-white tracking-tight relative z-10">Daniel de Almeida</h2>
                                <p className="text-slate-500 dark:text-slate-400 text-lg leading-relaxed mb-10 relative z-10">
                                    Arquiteto de soluções focado em experiências digitais de alto impacto. Combinando design minimalista com engenharia de precisão para criar ferramentas que capacitam indivíduos e empresas.
                                </p>
                                <div className="flex gap-4 relative z-10">
                                    <a href="#" aria-label="LinkedIn" className="p-4 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-2xl hover:bg-slate-900 dark:hover:bg-black hover:border-slate-800 dark:hover:border-black hover:text-white transition-all text-slate-500 dark:text-slate-400 hover:shadow-lg hover:-translate-y-1"><Linkedin className="w-6 h-6" /></a>
                                    <a href="#" aria-label="Instagram" className="p-4 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-2xl hover:bg-pink-600 hover:border-pink-500 hover:text-white transition-all text-slate-500 dark:text-slate-400 hover:shadow-lg hover:-translate-y-1"><Instagram className="w-6 h-6" /></a>
                                    <a href="#" aria-label="GitHub" className="p-4 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-2xl hover:bg-slate-900 dark:hover:bg-black hover:border-slate-800 dark:hover:border-black hover:text-white transition-all text-slate-500 dark:text-slate-400 hover:shadow-lg hover:-translate-y-1"><Github className="w-6 h-6" /></a>
                                </div>
                            </div>
                        </motion.div>

                        <div className="flex-1 space-y-10">
                            <h2 className="text-xs font-black text-slate-400 uppercase tracking-[0.4em]">NOSSO MANIFESTO</h2>
                            <h3 className="text-3xl md:text-5xl lg:text-7xl font-black tracking-tighter leading-[0.9] text-slate-900 dark:text-white">
                                Simplicidade <br className="hidden sm:block" />
                                é Poder.
                            </h3>
                            <p className="text-xl text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
                                Acreditamos que a tecnologia deve ser invisível e potente. Menos cliques, mais resultados. Onde outros veem complexidade, nós entregamos clareza absoluta e performance implacável.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Imported Components */}
            <div id="process">
                <ProcessTimeline />
            </div>

            <div id="specs">
                <TechSpecs />
            </div>

            {/* Tier S: Active FAQ Section */}
            <FaqSection />

            {/* Contact Section */}
            <section id="contact" className="py-20 sm:py-40 px-4 sm:px-6 bg-white dark:bg-slate-950 border-t border-slate-100 dark:border-slate-800">
                <div className="max-w-5xl mx-auto">
                    <div className="bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-[3.5rem] shadow-2xl shadow-slate-200/50 dark:shadow-black/50 p-10 md:p-20 relative overflow-hidden">
                        <div className="text-center mb-12 sm:mb-16 space-y-4 sm:space-y-6">
                            <h2 className="text-[10px] sm:text-xs font-black text-slate-400 uppercase tracking-[0.4em]">FALE CONOSCO</h2>
                            <h3 className="text-3xl sm:text-5xl md:text-6xl font-black tracking-tighter text-slate-900 dark:text-white">
                                Vamos falar <br className="hidden sm:block" /> sobre o seu futuro.
                            </h3>
                        </div>

                        {formStatus === 'sent' ? (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="py-24 text-center"
                            >
                                <div className="w-24 h-24 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-8 border border-emerald-100 dark:border-emerald-800 animate-bounce">
                                    <CheckCircle2 className="w-12 h-12" />
                                </div>
                                <h4 className="text-3xl font-black mb-4 text-slate-900 dark:text-white tracking-tight">Mensagem Enviada!</h4>
                                <p className="text-slate-500 dark:text-slate-400 text-lg">Recebemos seu contato. Nossa equipe entrará em contato em breve.</p>
                                <button
                                    title='Enviar outra mensagem'
                                    type='button'
                                    onClick={() => setFormStatus('idle')} className="mt-10 text-blue-600 dark:text-blue-400 font-bold text-xs uppercase underline tracking-widest hover:text-blue-500 dark:hover:text-blue-300">Enviar outra mensagem</button>
                            </motion.div>
                        ) : (
                            <form onSubmit={handleContactSubmit} className="space-y-8 max-w-2xl mx-auto">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="space-y-3">
                                        <label htmlFor="name" className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Seu Nome</label>
                                        <input id="name" name="name" required type="text" placeholder="Ex: João Silva" className="w-full bg-white dark:bg-slate-900 px-6 py-5 rounded-2xl border border-slate-200 dark:border-slate-800 focus:border-slate-300 dark:focus:border-slate-700 focus:ring-4 focus:ring-slate-100 dark:focus:ring-slate-800 text-slate-900 dark:text-white outline-none transition font-medium placeholder:text-slate-300 dark:placeholder:text-slate-600 text-lg" />
                                    </div>
                                    <div className="space-y-3">
                                        <label htmlFor="company" className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Empresa</label>
                                        <input id="company" name="company" required type="text" placeholder="Nome da sua empresa" className="w-full bg-white dark:bg-slate-900 px-6 py-5 rounded-2xl border border-slate-200 dark:border-slate-800 focus:border-slate-300 dark:focus:border-slate-700 focus:ring-4 focus:ring-slate-100 dark:focus:ring-slate-800 text-slate-900 dark:text-white outline-none transition font-medium placeholder:text-slate-300 dark:placeholder:text-slate-600 text-lg" />
                                    </div>
                                </div>
                                <div className="space-y-3">
                                    <label htmlFor="email" className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">E-mail Corporativo</label>
                                    <input id="email" name="email" required type="email" placeholder="email@empresa.com" className="w-full bg-white dark:bg-slate-900 px-6 py-5 rounded-2xl border border-slate-200 dark:border-slate-800 focus:border-slate-300 dark:focus:border-slate-700 focus:ring-4 focus:ring-slate-100 dark:focus:ring-slate-800 text-slate-900 dark:text-white outline-none transition font-medium placeholder:text-slate-300 dark:placeholder:text-slate-600 text-lg" />
                                </div>
                                <div className="space-y-3">
                                    <label htmlFor="message" className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Como podemos ajudar?</label>
                                    <textarea id="message" name="message" required placeholder="Conte-nos brevemente sobre sua necessidade..." className="w-full bg-white dark:bg-slate-900 px-6 py-5 rounded-2xl border border-slate-200 dark:border-slate-800 focus:border-slate-300 dark:focus:border-slate-700 focus:ring-4 focus:ring-slate-100 dark:focus:ring-slate-800 text-slate-900 dark:text-white outline-none transition h-40 resize-none font-medium placeholder:text-slate-300 dark:placeholder:text-slate-600 text-lg"></textarea>
                                </div>
                                <button
                                    title='Enviar Solicitação'
                                    type='submit'
                                    disabled={formStatus === 'sending'}
                                    className="w-full py-6 bg-[#d4e720] text-[#1a2e05] border border-[#bed20e] rounded-3xl font-black text-sm uppercase tracking-[0.2em] hover:bg-[#a3b60b] transition-all shadow-xl disabled:opacity-50 hover:shadow-2xl hover:shadow-lime-500/20 hover:scale-[1.02] relative overflow-hidden group"
                                >
                                    <span className="relative z-10">{formStatus === 'sending' ? 'Enviando...' : 'Enviar Solicitação'}</span>
                                    <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                                </button>
                            </form>
                        )}
                    </div>
                </div>
            </section>

            {/* Fat Footer - Enterprise Level */}
            <footer className="py-20 bg-slate-50 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 relative z-10 text-sm">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-12 mb-16">
                        <div className="col-span-2 lg:col-span-2 space-y-6">
                            <div className="flex items-center gap-3">
                                <Send className="w-6 h-6 text-slate-900 dark:text-white" />
                                <span className="text-xl font-black tracking-tighter text-slate-900 dark:text-white">FLASH<span className="text-slate-400">APP</span></span>
                            </div>
                            <p className="text-slate-500 dark:text-slate-400 leading-relaxed max-w-xs">Elevando a gestão de campo ao próximo nível com inteligência e performance.</p>
                            <div className="flex gap-4">
                                <a href="#" aria-label="Twitter" className="w-10 h-10 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-400 hover:text-slate-900 dark:hover:text-white hover:border-slate-300 dark:hover:border-slate-600 transition-all"><Twitter className="w-4 h-4" /></a>
                                <a href="#" aria-label="GitHub" className="w-10 h-10 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-400 hover:text-slate-900 dark:hover:text-white hover:border-slate-300 dark:hover:border-slate-600 transition-all"><Github className="w-4 h-4" /></a>
                                <a href="#" aria-label="LinkedIn" className="w-10 h-10 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-400 hover:text-slate-900 dark:hover:text-white hover:border-slate-300 dark:hover:border-slate-600 transition-all"><Linkedin className="w-4 h-4" /></a>
                            </div>
                        </div>

                        <div>
                            <h4 className="font-black text-slate-900 dark:text-white mb-6 tracking-wide uppercase text-xs">Produto</h4>
                            <ul className="space-y-4 text-slate-500 dark:text-slate-400">
                                <li><a href="#" className="hover:text-[#d4e720] transition-colors">Neural Core</a></li>
                                <li><a href="#" className="hover:text-[#d4e720] transition-colors">Offline First</a></li>
                                <li><a href="#" className="hover:text-[#d4e720] transition-colors">Global Mesh</a></li>
                                <li><a href="#" className="hover:text-[#d4e720] transition-colors">Changelog</a></li>
                            </ul>
                        </div>

                        <div>
                            <h4 className="font-black text-slate-900 dark:text-white mb-6 tracking-wide uppercase text-xs">Empresa</h4>
                            <ul className="space-y-4 text-slate-500 dark:text-slate-400">
                                <li><a href="#" className="hover:text-[#d4e720] transition-colors">Sobre Nós</a></li>
                                <li><a href="#" className="hover:text-[#d4e720] transition-colors">Carreiras</a></li>
                                <li><a href="#" className="hover:text-[#d4e720] transition-colors">Blog</a></li>
                                <li><a href="#" className="hover:text-[#d4e720] transition-colors">Contato</a></li>
                            </ul>
                        </div>

                        <div>
                            <h4 className="font-black text-slate-900 dark:text-white mb-6 tracking-wide uppercase text-xs">Jurídico</h4>
                            <ul className="space-y-4 text-slate-500 dark:text-slate-400">
                                <li><a href="#" className="hover:text-[#d4e720] transition-colors">Privacidade</a></li>
                                <li><a href="#" className="hover:text-[#d4e720] transition-colors">Termos</a></li>
                                <li><a href="#" className="hover:text-[#d4e720] transition-colors">Compliance</a></li>
                            </ul>
                        </div>
                    </div>

                    <div className="pt-8 border-t border-slate-200 dark:border-slate-800 flex flex-col md:flex-row justify-between items-center gap-4">
                        <p className="text-slate-400 font-medium text-xs">© 2026 FLASH APP. Todos os direitos reservados.</p>
                        <div className="flex gap-2 items-center text-xs font-bold text-slate-400 bg-white dark:bg-slate-800 px-3 py-1 rounded-full border border-slate-200 dark:border-slate-700">
                            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                            Sistemas Operantes
                        </div>
                    </div>
                </div>
            </footer>

            <DocsModal isOpen={isDocsOpen} onClose={() => setIsDocsOpen(false)} />
        </div>
    );
}