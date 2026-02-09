import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Minus, MessageCircle } from 'lucide-react';

export const FaqSection = () => {
    const [openIndex, setOpenIndex] = useState<number | null>(0);

    const FAQS = [
        {
            q: "Como o sistema funciona sem internet?",
            a: "O FLASH utiliza arquitetura Offline-First. Todos os dados coletados são salvos localmente em um banco de dados ultra-rápido no próprio dispositivo. Assim que uma conexão é detectada, o mecanismo de sincronização inteligente resolve conflitos e atualiza a nuvem automaticamente."
        },
        {
            q: "Meus dados estão seguros na nuvem?",
            a: "Sim. Utilizamos os padrões mais elevados de segurança do mercado. Todos os dados são criptografados em trânsito (TLS 1.3) e em repouso (AES-256). Nossos servidores possuem certificação SOC2 Type II e ISO 27001."
        },
        {
            q: "Posso customizar os formulários de relatório?",
            a: "Absolutamente. O FLASH oferece um motor dinâmico onde administradores podem criar, editar e publicar novos modelos de formulários em tempo real, sem necessidade de uma nova versão do aplicativo ou código."
        },
        {
            q: "O FLASH suporta quantos usuários simultâneos?",
            a: "Nossa infraestrutura foi projetada para escala global. Suportamos desde pequenas equipes de 5 pessoas até operações corporativas com milhares de profissionais de campo simultâneos, sem degradação de performance."
        }
    ];

    return (
        <section className="py-32 relative z-10 bg-slate-50 border-t border-slate-100">
            <div className="max-w-4xl mx-auto px-6">
                <div className="text-center mb-16">
                    <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-4">SUPORTE E DÚVIDAS</h2>
                    <h3 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight">Perguntas Frequentes</h3>
                </div>

                <div className="space-y-4">
                    {FAQS.map((faq, idx) => (
                        <div
                            key={idx}
                            className={`group rounded-3xl border transition-all duration-300 ${openIndex === idx ? 'bg-white border-slate-200 shadow-xl shadow-slate-200/50' : 'bg-white/60 border-slate-200 hover:border-slate-300 hover:bg-white'}`}
                        >
                            <button
                                title={faq.q}
                                type='button'
                                onClick={() => setOpenIndex(openIndex === idx ? null : idx)}
                                className="w-full flex items-center justify-between p-6 md:p-8 text-left"
                            >
                                <span className={`text-lg font-bold transition-colors ${openIndex === idx ? 'text-slate-900' : 'text-slate-500 group-hover:text-slate-800'}`}>
                                    {faq.q}
                                </span>
                                <div className={`p-2 rounded-full transition-colors ${openIndex === idx ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-400 group-hover:bg-slate-200'}`}>
                                    {openIndex === idx ? <Minus className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                                </div>
                            </button>

                            <AnimatePresence>
                                {openIndex === idx && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: "auto", opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        className="overflow-hidden"
                                    >
                                        <div className="px-6 md:px-8 pb-8 pt-0">
                                            <p className="text-slate-500 leading-relaxed border-l-2 border-slate-200 pl-4">
                                                {faq.a}
                                            </p>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    ))}
                </div>

                {/* Floating Testimonial Card */}
                <motion.div
                    initial={{ opacity: 0, x: 50 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    className="mt-20 bg-white p-8 rounded-[2rem] border border-slate-200 shadow-2xl shadow-slate-200/50 relative overflow-hidden"
                >
                    <MessageCircle className="absolute top-8 right-8 w-24 h-24 text-slate-100 rotate-12" />
                    <div className="relative z-10 flex gap-4 items-start">
                        <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center border border-slate-200 text-slate-600 font-black">
                            JP
                        </div>
                        <div>
                            <div className="flex gap-1 mb-2">
                                {[1, 2, 3, 4, 5].map(i => <div key={i} className="w-4 h-4 bg-[#d4e720] rounded-sm" />)}
                            </div>
                            <p className="text-xl font-medium text-slate-900 mb-4 italic">"O FLASH transformou nossa operação de campo. O que levava dias para ser processado, agora acontece em tempo real."</p>
                            <p className="text-xs font-black text-slate-400 uppercase tracking-widest">João Pedro, Gerente de Operações</p>
                        </div>
                    </div>
                </motion.div>
            </div>
        </section>
    );
};
