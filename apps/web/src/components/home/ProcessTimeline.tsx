import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Camera, Zap, LayoutDashboard, CheckCircle2, ArrowRight } from 'lucide-react';

export const ProcessTimeline = () => {
    const { t } = useTranslation();

    const steps = [
        {
            id: 1,
            title: t('home.process.steps.capture.title'),
            desc: t('home.process.steps.capture.desc'),
            icon: <Camera className="w-6 h-6" />,
            color: "bg-slate-100 text-slate-700",
            shadow: "shadow-sm"
        },
        {
            id: 2,
            title: t('home.process.steps.transmission.title'),
            desc: t('home.process.steps.transmission.desc'),
            icon: <Zap className="w-6 h-6" />,
            color: "bg-[#d4e720]/20 text-[#1a2e05]",
            shadow: "shadow-sm"
        },
        {
            id: 3,
            title: t('home.process.steps.triage.title'),
            desc: t('home.process.steps.triage.desc'),
            icon: <LayoutDashboard className="w-6 h-6" />,
            color: "bg-blue-50/50 text-blue-700",
            shadow: "shadow-sm"
        },
        {
            id: 4,
            title: t('home.process.steps.resolution.title'),
            desc: t('home.process.steps.resolution.desc'),
            icon: <CheckCircle2 className="w-6 h-6" />,
            color: "bg-emerald-50/50 text-emerald-700",
            shadow: "shadow-sm"
        }
    ];

    return (
        <section className="py-32 bg-slate-50 relative overflow-hidden border-t border-slate-100">
            <div className="max-w-7xl mx-auto px-6 relative z-10">
                <div className="text-center mb-24">
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-xs font-black text-slate-400 uppercase tracking-[0.3em] mb-4"
                    >
                        {t('home.process.overline')}
                    </motion.h2>
                    <motion.h3
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.1 }}
                        className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight"
                    >
                        {t('home.process.title')} <span className="text-transparent bg-clip-text bg-gradient-to-r from-slate-700 to-slate-400">{t('home.process.subtitle')}</span>
                    </motion.h3>
                </div>

                <div className="relative">
                    {/* Connecting Line (Desktop) */}
                    <div className="hidden lg:block absolute top-1/2 left-0 w-full h-1 bg-slate-200 -translate-y-1/2 rounded-full overflow-hidden">
                        <motion.div
                            className="h-full bg-slate-900"
                            initial={{ width: "0%" }}
                            whileInView={{ width: "100%" }}
                            viewport={{ once: true }}
                            transition={{ duration: 1.5, ease: "easeInOut" }}
                        />
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-12 lg:gap-8">
                        {steps.map((step, index) => (
                            <motion.div
                                key={step.id}
                                initial={{ opacity: 0, y: 50 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.2, duration: 0.5 }}
                                className="relative group"
                            >
                                <div className="flex flex-col items-center text-center">
                                    <div className={`w-24 h-24 rounded-3xl ${step.color} border border-slate-200 flex items-center justify-center mb-8 relative z-10 group-hover:scale-110 transition-transform duration-300 shadow-xl ${step.shadow} bg-white`}>
                                        <div>
                                            {step.icon}
                                        </div>
                                    </div>

                                    <h4 className="text-xl font-bold text-slate-900 mb-3">{step.title}</h4>
                                    <p className="text-slate-500 text-sm leading-relaxed max-w-[200px] mx-auto">
                                        {step.desc}
                                    </p>

                                    {/* Arrow connecting steps (Mobile only) */}
                                    {index < steps.length - 1 && (
                                        <ArrowRight className="lg:hidden w-6 h-6 text-slate-300 mt-8 rotate-90" />
                                    )}
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
};
