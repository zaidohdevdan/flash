import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Minus, MessageCircle } from 'lucide-react';

const FAQS = [
    {
        q: "O Flash funciona totalmente offline?",
        a: "Sim. Nossa arquitetura 'Offline-First' armazena dados localmente no dispositivo e sincroniza automaticamente assim que a conexão é restabelecida, garantindo zero perda de dados."
    },
    {
        q: "Como é feita a segurança dos dados?",
        a: "Utilizamos criptografia de ponta a ponta (E2EE) em trânsito e em repouso. Logs de auditoria imutáveis garantem total rastreabilidade de todas as ações no sistema."
    },
    {
        q: "É possível personalizar os fluxos de trabalho?",
        a: "Absolutamente. O Flash é modular. Supervisores podem criar tipos de relatórios e SLAs específicos para cada departamento sem necessidade de código."
    },
    {
        q: "Quantos usuários o sistema suporta?",
        a: "Nossa arquitetura em cluster no Kubernetes escala horizontalmente. Atualmente suportamos operações com +50.000 usuários simultâneos com latência < 100ms."
    }
];

export const FaqSection = () => {
    const [openIndex, setOpenIndex] = useState<number | null>(0);

    return (
        <section className="py-32 relative z-10">
            <div className="max-w-4xl mx-auto px-6">
                <div className="text-center mb-16">
                    <h2 className="text-[10px] font-black text-purple-500 uppercase tracking-[0.3em] mb-4">Dúvidas Frequentes</h2>
                    <h3 className="text-3xl md:text-4xl font-black text-white tracking-tight">Perguntas de quem exige excelência.</h3>
                </div>

                <div className="space-y-4">
                    {FAQS.map((faq, idx) => (
                        <div
                            key={idx}
                            className={`group rounded-3xl border transition-all duration-300 ${openIndex === idx ? 'bg-slate-900 border-purple-500/50 shadow-2xl shadow-purple-900/20' : 'bg-slate-900/40 border-white/5 hover:border-white/10'}`}
                        >
                            <button
                                onClick={() => setOpenIndex(openIndex === idx ? null : idx)}
                                className="w-full flex items-center justify-between p-6 md:p-8 text-left"
                            >
                                <span className={`text-lg font-bold transition-colors ${openIndex === idx ? 'text-white' : 'text-slate-400 group-hover:text-slate-200'}`}>
                                    {faq.q}
                                </span>
                                <div className={`p-2 rounded-full transition-colors ${openIndex === idx ? 'bg-purple-500 text-white' : 'bg-white/5 text-slate-400 group-hover:bg-white/10'}`}>
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
                                            <p className="text-slate-400 leading-relaxed border-l-2 border-purple-500/30 pl-4">
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
                    className="mt-20 bg-gradient-to-br from-slate-900 to-slate-950 p-8 rounded-[2rem] border border-white/10 relative overflow-hidden"
                >
                    <MessageCircle className="absolute top-8 right-8 w-24 h-24 text-white/5 rotate-12" />
                    <div className="relative z-10 flex gap-4 items-start">
                        <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center border border-blue-500/30 text-blue-400 font-black">
                            JP
                        </div>
                        <div>
                            <div className="flex gap-1 mb-2">
                                {[1, 2, 3, 4, 5].map(i => <div key={i} className="w-4 h-4 bg-yellow-500 rounded-sm" />)}
                            </div>
                            <p className="text-xl font-medium text-white mb-4 italic">"Mudou radicalmente nossa operação de campo. O que levava horas de alinhamento, agora é automático e visível."</p>
                            <p className="text-xs font-black text-slate-500 uppercase tracking-widest">João Pereira • Diretor de Operações Logísticas</p>
                        </div>
                    </div>
                </motion.div>
            </div>
        </section>
    );
};
