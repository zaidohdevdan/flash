import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Shield, Lock, Server, Cpu, Database, Eye } from 'lucide-react';

export const TechSpecs = () => {
    const { t } = useTranslation();

    const specs = [
        {
            icon: <Lock className="w-5 h-5 text-slate-700" />,
            category: t('home.specs.categories.security'),
            title: t('home.specs.items.security.title'),
            desc: t('home.specs.items.security.desc'),
            delay: 0
        },
        {
            icon: <Eye className="w-5 h-5 text-slate-700" />,
            category: t('home.specs.categories.audit'),
            title: t('home.specs.items.audit.title'),
            desc: t('home.specs.items.audit.desc'),
            delay: 0.1
        },
        {
            icon: <Server className="w-5 h-5 text-slate-700" />,
            category: t('home.specs.categories.infra'),
            title: t('home.specs.items.infra.title'),
            desc: t('home.specs.items.infra.desc'),
            delay: 0.2
        },
        {
            icon: <Database className="w-5 h-5 text-slate-700" />,
            category: t('home.specs.categories.data'),
            title: t('home.specs.items.data.title'),
            desc: t('home.specs.items.data.desc'),
            delay: 0.3
        },
        {
            icon: <Cpu className="w-5 h-5 text-slate-700" />,
            category: t('home.specs.categories.performance'),
            title: t('home.specs.items.performance.title'),
            desc: t('home.specs.items.performance.desc'),
            delay: 0.4
        },
        {
            icon: <Shield className="w-5 h-5 text-slate-700" />,
            category: t('home.specs.categories.compliance'),
            title: t('home.specs.items.compliance.title'),
            desc: t('home.specs.items.compliance.desc'),
            delay: 0.5
        }
    ];

    return (
        <section className="py-32 bg-white relative">
            <div className="max-w-7xl mx-auto px-6">
                <div className="flex flex-col lg:flex-row gap-16 items-start">

                    {/* Left: Sticky Header */}
                    <div className="lg:w-1/3 lg:sticky lg:top-32">
                        <motion.h2
                            initial={{ opacity: 0, x: -20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            className="text-xs font-black text-slate-400 uppercase tracking-[0.3em] mb-4"
                        >
                            {t('home.specs.overline')}
                        </motion.h2>
                        <motion.h3
                            initial={{ opacity: 0, x: -20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.1 }}
                            className="text-4xl font-black text-slate-900 tracking-tight mb-6"
                        >
                            {t('home.specs.title')}
                        </motion.h3>
                        <motion.p
                            initial={{ opacity: 0, x: -20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.2 }}
                            className="text-slate-500 leading-relaxed"
                        >
                            {t('home.specs.description')}
                        </motion.p>
                    </div>

                    {/* Right: Grid */}
                    <div className="lg:w-2/3 grid grid-cols-1 md:grid-cols-2 gap-6">
                        {specs.map((item, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: item.delay, duration: 0.5 }}
                                className="p-8 rounded-3xl bg-slate-50 border border-slate-100 hover:bg-white hover:border-slate-200 hover:shadow-xl hover:shadow-slate-200/40 transition-all group"
                            >
                                <div className="flex items-center gap-4 mb-4">
                                    <div className="p-3 rounded-xl bg-white border border-slate-200 shadow-sm group-hover:scale-110 transition-transform">
                                        {item.icon}
                                    </div>
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{item.category}</span>
                                </div>
                                <h4 className="text-lg font-bold text-slate-900 mb-2">{item.title}</h4>
                                <p className="text-sm text-slate-500 leading-relaxed">
                                    {item.desc}
                                </p>
                            </motion.div>
                        ))}
                    </div>

                </div>
            </div>
        </section>
    );
};
