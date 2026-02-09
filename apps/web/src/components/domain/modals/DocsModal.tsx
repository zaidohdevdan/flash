import React, { useState } from 'react';
import {
    Book,
    Zap,
    MessageSquare,
    Shield,
    FileText,
    WifiOff,
    Clock,
    CheckCircle2,
    ArrowRight
} from 'lucide-react';
import { Modal } from '../../ui/Modal';

interface DocsModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const DocsModal: React.FC<DocsModalProps> = ({ isOpen, onClose }) => {
    const [activeTab, setActiveTab] = useState<'intro' | 'features' | 'security'>('intro');

    const sections = {
        intro: {
            title: 'Boas-vindas ao FLASH',
            icon: <Zap className="w-5 h-5 text-lime-500" />,
            content: (
                <div className="space-y-6">
                    <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                        O FLASH é uma plataforma enterprise de próxima geração desenvolvida para centralizar e otimizar operações de campo complexas.
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800">
                            <h4 className="font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
                                <Shield className="w-4 h-4 text-blue-500" /> Segurança
                            </h4>
                            <p className="text-[11px] text-slate-500 dark:text-slate-400">Dados criptografados de ponta a ponta e conformidade com protocolos LGPD.</p>
                        </div>
                        <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800">
                            <h4 className="font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
                                <WifiOff className="w-4 h-4 text-amber-500" /> Offline First
                            </h4>
                            <p className="text-[11px] text-slate-500 dark:text-slate-400">Total funcionalidade em áreas sem cobertura, com sincronização automática.</p>
                        </div>
                    </div>
                </div>
            )
        },
        features: {
            title: 'Recursos Principais',
            icon: <MessageSquare className="w-5 h-5 text-blue-500" />,
            content: (
                <div className="space-y-4">
                    <div className="flex items-start gap-4 p-4 hover:bg-slate-50 dark:hover:bg-slate-900 rounded-2xl transition-colors group">
                        <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                            <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                            <h4 className="font-bold text-slate-900 dark:text-white text-sm">Relatórios Inteligentes</h4>
                            <p className="text-xs text-slate-500 dark:text-slate-400">Envio de fotos, geolocalização e comentários em poucos segundos.</p>
                        </div>
                    </div>
                    <div className="flex items-start gap-4 p-4 hover:bg-slate-50 dark:hover:bg-slate-900 rounded-2xl transition-colors group">
                        <div className="w-10 h-10 rounded-xl bg-lime-100 dark:bg-lime-900/30 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                            <MessageSquare className="w-5 h-5 text-lime-600 dark:text-lime-400" />
                        </div>
                        <div>
                            <h4 className="font-bold text-slate-900 dark:text-white text-sm">Chat Direct</h4>
                            <p className="text-xs text-slate-500 dark:text-slate-400">Comunicação direta entre Profissionais e Supervisores via texto e áudio.</p>
                        </div>
                    </div>
                    <div className="flex items-start gap-4 p-4 hover:bg-slate-50 dark:hover:bg-slate-900 rounded-2xl transition-colors group">
                        <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                            <Clock className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                        </div>
                        <div>
                            <h4 className="font-bold text-slate-900 dark:text-white text-sm">Monitoramento Real-time</h4>
                            <p className="text-xs text-slate-500 dark:text-slate-400">Dashboard analítico com KPIs e status da operação em tempo real.</p>
                        </div>
                    </div>
                </div>
            )
        },
        security: {
            title: 'Gestão & Auditoria',
            icon: <Shield className="w-5 h-5 text-emerald-500" />,
            content: (
                <div className="space-y-6">
                    <div className="bg-slate-900 dark:bg-black rounded-2xl p-6 text-white overflow-hidden relative">
                        <div className="absolute top-[-20px] right-[-20px] opacity-10">
                            <Shield className="w-32 h-32" />
                        </div>
                        <h4 className="font-black text-xs uppercase tracking-[0.2em] mb-4 text-slate-400">Rastreabilidade</h4>
                        <div className="space-y-2">
                            <div className="flex items-center gap-2 text-[10px] font-bold">
                                <CheckCircle2 className="w-3.5 h-3.5 text-lime-500" /> Logs de Atividade Admin
                            </div>
                            <div className="flex items-center gap-2 text-[10px] font-bold">
                                <CheckCircle2 className="w-3.5 h-3.5 text-lime-500" /> Histórico de Alteração de Relatórios
                            </div>
                            <div className="flex items-center gap-2 text-[10px] font-bold">
                                <CheckCircle2 className="w-3.5 h-3.5 text-lime-500" /> Controle de Sessão Ativa
                            </div>
                        </div>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 italic">
                        * O acesso às funções de auditoria é restrito a usuários com cargo de administrador e gerente.
                    </p>
                </div>
            )
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Guia do Sistema FLASH"
            subtitle="Tudo o que você precisa saber para operar com máxima performance"
            maxWidth="4xl"
        >
            <div className="flex flex-col md:flex-row gap-8 lg:gap-12 py-6">
                {/* Sidebar Tabs */}
                <div className="w-full md:w-48 lg:w-64 flex flex-row md:flex-col gap-2 shrink-0 overflow-x-auto md:overflow-x-visible pb-2 md:pb-0 scrollbar-hide">
                    {(Object.keys(sections) as Array<keyof typeof sections>).map(key => (
                        <button
                            key={key}
                            onClick={() => setActiveTab(key)}
                            className={`flex-none md:flex-1 lg:flex-none flex items-center justify-center md:justify-start gap-4 px-5 py-4 rounded-2xl text-[10px] lg:text-xs font-black uppercase tracking-[0.2em] transition-all whitespace-nowrap md:whitespace-normal ${activeTab === key ? 'bg-slate-900 text-white shadow-xl shadow-slate-200 dark:shadow-none md:translate-x-1' : 'text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-600'}`}
                        >
                            <div className={`${activeTab === key ? 'text-white' : ''}`}>
                                {sections[key].icon}
                            </div>
                            <span className="hidden md:block">{key}</span>
                        </button>
                    ))}
                </div>

                {/* Content Area */}
                <div className="flex-1 min-h-[350px] md:min-h-[400px] animate-in fade-in slide-in-from-right-8 duration-500">
                    <h3 className="text-xl md:text-2xl lg:text-3xl font-black text-slate-900 dark:text-white mb-6 md:mb-8 border-b border-slate-100 dark:border-slate-800 pb-6 flex items-center gap-4">
                        <span className="w-8 lg:w-12 h-1 bg-[#d4e720] rounded-full hidden sm:block" />
                        {sections[activeTab].title}
                    </h3>
                    <div className="max-w-2xl">
                        {sections[activeTab].content}
                    </div>
                </div>
            </div>

            <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center">
                <div className="flex items-center gap-2 group cursor-pointer">
                    <div className="w-8 h-8 rounded-full bg-slate-900 flex items-center justify-center text-white">
                        <Book className="w-4 h-4" />
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white transition-colors">Manual.pdf</span>
                </div>
                <button
                    onClick={onClose}
                    className="flex items-center gap-2 px-6 py-3 bg-[#d4e720] text-[#1a2e05] rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-[#bfd40b] transition-all"
                >
                    Entendi <ArrowRight className="w-3 h-3" />
                </button>
            </div>
        </Modal>
    );
};
