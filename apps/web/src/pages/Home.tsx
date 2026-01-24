import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Send,
    Shield,
    Zap,
    Users,
    MessageSquare,
    History,
    Code2,
    Mail,
    Phone,
    ArrowRight,
    CheckCircle2,
    Database,
    Globe,
    Cpu,
    Github,
    Instagram,
    Linkedin
} from 'lucide-react';

export function Home() {
    const navigate = useNavigate();
    const [formStatus, setFormStatus] = useState<'idle' | 'sending' | 'sent'>('idle');

    const handleContactSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setFormStatus('sending');
        setTimeout(() => setFormStatus('sent'), 1500);
    };

    const techStack = [
        { name: 'React', icon: <Globe className="w-6 h-6" />, color: 'from-blue-400 to-blue-600' },
        { name: 'Bun', icon: <Zap className="w-6 h-6" />, color: 'from-pink-400 to-pink-600' },
        { name: 'Prisma', icon: <Database className="w-6 h-6" />, color: 'from-indigo-400 to-indigo-600' },
        { name: 'Socket.io', icon: <Zap className="w-6 h-6" />, color: 'from-yellow-400 to-yellow-600' },
        { name: 'Tailwind', icon: <Globe className="w-6 h-6" />, color: 'from-cyan-400 to-cyan-600' },
        { name: 'TypeScript', icon: <Code2 className="w-6 h-6" />, color: 'from-blue-500 to-blue-700' },
    ];

    const features = [
        {
            title: 'Monitoramento em Tempo Real',
            desc: 'Receba notificações instantâneas via WebSockets assim que uma ocorrência é registrada.',
            icon: <Zap className="w-8 h-8 text-yellow-500" />
        },
        {
            title: 'Fluxo Departamental',
            desc: 'Encaminhe demandas para setores específicos com rastreabilidade total de trâmites.',
            icon: <Users className="w-8 h-8 text-blue-500" />
        },
        {
            title: 'Linha do Tempo Auditável',
            desc: 'Histórico completo de cada reporte, com fotos, feedbacks e logs de alteração.',
            icon: <History className="w-8 h-8 text-purple-500" />
        },
        {
            title: 'Gestão Profissional',
            desc: 'Dashboards analíticos com filtros por data e status para tomada de decisão estratégica.',
            icon: <Shield className="w-8 h-8 text-green-500" />
        }
    ];

    return (
        <div className="min-h-screen bg-white font-sans text-gray-900 scroll-smooth">
            {/* Navigation */}
            <nav className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-lg border-b border-gray-100">
                <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="bg-blue-600 p-1.5 rounded-lg">
                            <Send className="w-5 h-5 text-white" />
                        </div>
                        <span className="text-xl font-black tracking-tighter text-gray-900">FLASH<span className="text-blue-600">APP</span></span>
                    </div>

                    <div className="hidden md:flex items-center gap-8 text-sm font-bold text-gray-500 uppercase tracking-widest">
                        <a href="#features" className="hover:text-blue-600 transition">Recursos</a>
                        <a href="#stack" className="hover:text-blue-600 transition">Tecnologia</a>
                        <a href="#about" className="hover:text-blue-600 transition">O Desenvolvedor</a>
                        <a href="#contact" className="hover:text-blue-600 transition">Contato</a>
                    </div>

                    <button
                        onClick={() => navigate('/login')}
                        className="bg-gray-900 text-white px-6 py-3 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-blue-600 transition-all shadow-xl shadow-gray-200"
                    >
                        Acessar Sistema
                    </button>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="pt-40 pb-20 px-6 overflow-hidden">
                <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-16">
                    <div className="flex-1 space-y-8 animate-in fade-in slide-in-from-left duration-1000">
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 rounded-full border border-blue-100 italic">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                            </span>
                            <span className="text-xs font-black text-blue-600 uppercase tracking-widest">Plataforma Ready for Enterprise</span>
                        </div>

                        <h1 className="text-5xl lg:text-7xl font-black tracking-tight leading-[1.1]">
                            Otimize sua <span className="text-blue-600">Gestão Operacional</span> com precisão.
                        </h1>

                        <p className="text-lg text-gray-500 max-w-xl leading-relaxed">
                            O FLASH é a solução definitiva para empresas que buscam monitoramento em tempo real, auditoria de processos e comunicação ágil entre equipes e departamentos.
                        </p>

                        <div className="flex flex-col sm:flex-row items-center gap-4">
                            <button
                                onClick={() => navigate('/login')}
                                className="w-full sm:w-auto px-8 py-5 bg-blue-600 text-white rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-blue-700 transition-all shadow-2xl shadow-blue-200 flex items-center justify-center gap-3"
                            >
                                Começar Agora <ArrowRight className="w-5 h-5" />
                            </button>
                        </div>
                    </div>

                    <div className="flex-1 relative animate-in fade-in slide-in-from-right duration-1000">
                        <div className="relative z-10 bg-white p-4 rounded-[40px] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.15)] border border-gray-100 ring-1 ring-gray-900/5">
                            <div className="rounded-[32px] overflow-hidden bg-gray-50 border border-gray-200">
                                <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
                                    <div className="flex gap-1.5">
                                        <div className="w-3 h-3 rounded-full bg-red-400"></div>
                                        <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                                        <div className="w-3 h-3 rounded-full bg-green-400"></div>
                                    </div>
                                    <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest">flash-dashboard-v1.0</div>
                                </div>
                                <div className="p-8 space-y-6">
                                    <div className="h-4 w-1/3 bg-gray-200 rounded-lg"></div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="h-32 bg-blue-50 rounded-2xl border border-blue-100"></div>
                                        <div className="h-32 bg-purple-50 rounded-2xl border border-purple-100"></div>
                                    </div>
                                    <div className="space-y-3">
                                        <div className="h-3 w-full bg-gray-200 rounded-lg"></div>
                                        <div className="h-3 w-5/6 bg-gray-200 rounded-lg"></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        {/* Abstract blobs */}
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[140%] h-[140%] bg-blue-50 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse"></div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section id="features" className="py-32 bg-gray-50/50 relative">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="text-center max-w-3xl mx-auto mb-20 space-y-4">
                        <h2 className="text-[10px] font-black text-blue-600 uppercase tracking-[0.3em]">Operação Robusta</h2>
                        <h3 className="text-4xl font-black tracking-tight">Recursos que elevam o seu padrão de monitoramento</h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {features.map((f, i) => (
                            <div key={i} className="bg-white p-10 rounded-[32px] border border-gray-100 hover:shadow-2xl hover:shadow-gray-200 transition-all duration-500 group">
                                <div className="mb-8 p-4 bg-gray-50 rounded-2xl inline-block group-hover:bg-blue-600 group-hover:text-white transition-colors duration-500">
                                    {f.icon}
                                </div>
                                <h4 className="text-xl font-black mb-4 tracking-tight">{f.title}</h4>
                                <p className="text-gray-500 leading-relaxed text-sm">{f.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Tech Stack Section */}
            <section id="stack" className="py-32 overflow-hidden">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="flex flex-col lg:flex-row items-center gap-20">
                        <div className="flex-1 space-y-8">
                            <h2 className="text-[10px] font-black text-blue-600 uppercase tracking-[0.3em]">Modern Stack</h2>
                            <h3 className="text-4xl font-black tracking-tight">Construído com o que há de mais moderno no mercado</h3>
                            <p className="text-gray-500 leading-relaxed italic">
                                "Performance e segurança não são opcionais. O FLASH utiliza as tecnologias mais solicitadas e robustas da indústria para garantir estabilidade absoluta."
                            </p>
                            <div className="space-y-4">
                                <div className="flex items-center gap-3">
                                    <div className="bg-green-100 p-1 rounded-full"><CheckCircle2 className="w-4 h-4 text-green-600" /></div>
                                    <span className="text-sm font-bold text-gray-700">TypeScript para tipagem estrita e segurança</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="bg-green-100 p-1 rounded-full"><CheckCircle2 className="w-4 h-4 text-green-600" /></div>
                                    <span className="text-sm font-bold text-gray-700">Prisma ORM para manipulação de dados eficiente</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="bg-green-100 p-1 rounded-full"><CheckCircle2 className="w-4 h-4 text-green-600" /></div>
                                    <span className="text-sm font-bold text-gray-700">Socket.io para interatividade instantânea</span>
                                </div>
                            </div>
                        </div>

                        <div className="flex-1 grid grid-cols-2 md:grid-cols-3 gap-6">
                            {techStack.map((t, i) => (
                                <div key={i} className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl transition-all text-center space-y-4 group">
                                    <div className={`mx-auto w-12 h-12 rounded-2xl bg-gradient-to-br ${t.color} flex items-center justify-center text-white shadow-lg`}>
                                        {t.icon}
                                    </div>
                                    <span className="block text-xs font-black uppercase tracking-widest text-gray-400 group-hover:text-blue-600 transition">{t.name}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* Developer Section */}
            <section id="about" className="py-32 bg-gray-900 text-white relative overflow-hidden">
                <div className="max-w-7xl mx-auto px-6 relative z-10">
                    <div className="flex flex-col lg:flex-row items-center gap-20">
                        <div className="flex-1">
                            <div className="relative inline-block">
                                <div className="w-80 h-80 rounded-[48px] overflow-hidden border-8 border-white/5 rotate-3 shadow-2xl relative z-10 bg-gray-800 flex items-center justify-center">
                                    <Code2 className="w-40 h-40 text-blue-500 opacity-20" />
                                    <div className="absolute bottom-6 left-6 text-left">
                                        <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest block mb-1">Developer</span>
                                        <span className="text-2xl font-black uppercase tracking-tighter">Daniel de Almeida</span>
                                    </div>
                                </div>
                                <div className="absolute top-10 -left-10 w-40 h-40 bg-blue-600 rounded-full filter blur-[100px] opacity-20"></div>
                            </div>
                        </div>

                        <div className="flex-1 space-y-8 text-center lg:text-left">
                            <h2 className="text-[10px] font-black text-blue-400 uppercase tracking-[0.3em]">O Arquiteto</h2>
                            <h3 className="text-5xl font-black tracking-tight leading-tight">Uma visão focada em resolver problemas reais.</h3>
                            <p className="text-gray-400 leading-relaxed text-lg italic">
                                "Como desenvolvedor, acredito que tecnologia deve ser invisível e eficiente. O FLASH nasceu para preencher o gap entre a operação bruta e a gestão estratégica, entregando uma interface que as pessoas realmente gostam de usar."
                            </p>
                            <div className="flex items-center justify-center lg:justify-start gap-6 pt-4">
                                <a href="#" className="p-3 bg-white/5 border border-white/10 rounded-2xl hover:bg-blue-600 hover:border-blue-500 transition-all group">
                                    <Linkedin className="w-6 h-6 group-hover:scale-110 transition" />
                                </a>
                                <a href="#" className="p-3 bg-white/5 border border-white/10 rounded-2xl hover:bg-blue-600 hover:border-blue-500 transition-all group">
                                    <Instagram className="w-6 h-6 group-hover:scale-110 transition" />
                                </a>
                                <a href="#" className="p-3 bg-white/5 border border-white/10 rounded-2xl hover:bg-blue-600 hover:border-blue-500 transition-all group">
                                    <Github className="w-6 h-6 group-hover:scale-110 transition" />
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Contact Section */}
            <section id="contact" className="py-32 px-6">
                <div className="max-w-7xl mx-auto">
                    <div className="bg-white rounded-[60px] border border-gray-100 shadow-[0_50px_100px_-20px_rgba(0,0,0,0.1)] p-8 md:p-20 relative overflow-hidden">
                        <div className="flex flex-col lg:flex-row gap-20">
                            <div className="flex-1 space-y-12">
                                <div className="space-y-4">
                                    <h2 className="text-[10px] font-black text-blue-600 uppercase tracking-[0.3em]">Vamos Conversar</h2>
                                    <h3 className="text-4xl font-black tracking-tight">Interessado em levar o FLASH para sua empresa?</h3>
                                    <p className="text-gray-500 leading-relaxed">
                                        Preencha o formulário ou entre em contato diretamente pelo WhatsApp para uma demonstração personalizada.
                                    </p>
                                </div>

                                <div className="space-y-6">
                                    <div className="flex items-center gap-6">
                                        <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600">
                                            <Phone className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">WhatsApp Profissional</p>
                                            <p className="text-lg font-black text-gray-800 tracking-tight">+55 (00) 00000-0000</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-6">
                                        <div className="w-14 h-14 bg-purple-50 rounded-2xl flex items-center justify-center text-purple-600">
                                            <Mail className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">E-mail para Orçamentos</p>
                                            <p className="text-lg font-black text-gray-800 tracking-tight">contato@daniel.almeida</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="flex-1">
                                <div className="bg-gray-50 p-10 rounded-[40px] border border-gray-100">
                                    {formStatus === 'sent' ? (
                                        <div className="py-20 text-center animate-in zoom-in duration-500">
                                            <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                                                <CheckCircle2 className="w-10 h-10" />
                                            </div>
                                            <h4 className="text-2xl font-black mb-2">Mensagem Enviada!</h4>
                                            <p className="text-gray-500 text-sm">Daniel entrará em contato em breve.</p>
                                            <button onClick={() => setFormStatus('idle')} className="mt-8 text-blue-600 font-bold text-xs uppercase underline tracking-widest">Enviar Outra</button>
                                        </div>
                                    ) : (
                                        <form onSubmit={handleContactSubmit} className="space-y-4">
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="space-y-2">
                                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Nome</label>
                                                    <input required type="text" className="w-full bg-white px-5 py-4 rounded-2xl border border-gray-200 focus:border-blue-500 outline-none transition text-sm font-medium" placeholder="Ex: João Silva" />
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Empresa</label>
                                                    <input required type="text" className="w-full bg-white px-5 py-4 rounded-2xl border border-gray-200 focus:border-blue-500 outline-none transition text-sm font-medium" placeholder="Nome da Empresa" />
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Seu E-mail</label>
                                                <input required type="email" className="w-full bg-white px-5 py-4 rounded-2xl border border-gray-200 focus:border-blue-500 outline-none transition text-sm font-medium" placeholder="contato@empresa.com" />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Mensagem</label>
                                                <textarea required className="w-full bg-white px-5 py-4 rounded-2xl border border-gray-200 focus:border-blue-500 outline-none transition h-32 resize-none text-sm font-medium" placeholder="Como podemos ajudar?"></textarea>
                                            </div>
                                            <button
                                                disabled={formStatus === 'sending'}
                                                className="w-full py-5 bg-gray-900 text-white rounded-2xl font-black text-xs uppercase tracking-[0.3em] hover:bg-blue-600 transition-all shadow-xl disabled:opacity-50"
                                            >
                                                {formStatus === 'sending' ? 'ENVIANDO...' : 'ENVIAR SOLICITAÇÃO'}
                                            </button>
                                        </form>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* WhatsApp Floating */}
                        <a
                            href="https://wa.me/5500000000000"
                            target="_blank"
                            className="bg-green-500 text-white p-5 rounded-full shadow-2xl hover:scale-110 active:scale-95 transition-all fixed bottom-10 right-10 z-50 flex items-center justify-center group"
                        >
                            <MessageSquare className="w-6 h-6" />
                            <span className="max-w-0 overflow-hidden group-hover:max-w-xs transition-all duration-500 ease-out font-black text-[10px] uppercase tracking-widest whitespace-nowrap group-hover:ml-3">Falar no WhatsApp</span>
                        </a>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="py-20 border-t border-gray-100">
                <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-10">
                    <div className="text-center md:text-left space-y-4">
                        <div className="flex items-center gap-2 justify-center md:justify-start">
                            <Send className="w-4 h-4 text-blue-600" />
                            <span className="text-sm font-black tracking-tighter">FLASH<span className="text-blue-600">APP</span></span>
                        </div>
                        <p className="text-xs text-gray-400 font-medium">© 2026 Daniel de Almeida. Todos os direitos reservados.</p>
                    </div>

                    <div className="flex gap-8 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                        <a href="#" className="hover:text-blue-600 transition">Políticas</a>
                        <a href="#" className="hover:text-blue-600 transition">Termos</a>
                        <a href="#" className="hover:text-blue-600 transition">Segurança</a>
                    </div>
                </div>
            </footer>
        </div>
    );
}
