import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Minus, MessageCircle } from 'lucide-react';

export const FaqSection = () => {
    const { t } = useTranslation();
    const [openIndex, setOpenIndex] = useState<number | null>(0);

    const FAQS = [
        {
            q: t('home.faq.items.offline.q'),
            a: t('home.faq.items.offline.a')
        },
        {
            q: t('home.faq.items.security.q'),
            a: t('home.faq.items.security.a')
        },
        {
            q: t('home.faq.items.custom.q'),
            a: t('home.faq.items.custom.a')
        },
        {
            q: t('home.faq.items.scale.q'),
            a: t('home.faq.items.scale.a')
        }
    ];

    return (
        <section className="py-32 relative z-10 bg-slate-50 border-t border-slate-100">
            <div className="max-w-4xl mx-auto px-6">
                <div className="text-center mb-16">
                    <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-4">{t('home.faq.overline')}</h2>
                    <h3 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight">{t('home.faq.title')}</h3>
                </div>

                <div className="space-y-4">
                    {FAQS.map((faq, idx) => (
                        <div
                            key={idx}
                            className={`group rounded-3xl border transition-all duration-300 ${openIndex === idx ? 'bg-white border-slate-200 shadow-xl shadow-slate-200/50' : 'bg-white/60 border-slate-200 hover:border-slate-300 hover:bg-white'}`}
                        >
                            <button
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
                            <p className="text-xl font-medium text-slate-900 mb-4 italic">{t('home.faq.testimonial.text')}</p>
                            <p className="text-xs font-black text-slate-400 uppercase tracking-widest">{t('home.faq.testimonial.author')}</p>
                        </div>
                    </div>
                </motion.div>
            </div>
        </section>
    );
};
