import { motion } from 'framer-motion';
import { Shield, Lock, Server, Cpu, Database, Eye } from 'lucide-react';

export const TechSpecs = () => {

    const specs = [
        {
            icon: <Lock className="w-5 h-5 text-slate-700" />,
            category: "SEGURANÇA",
            title: "Criptografia Ponta-a-Ponta",
            desc: "Seus dados são protegidos por camadas militares de criptografia (AES-256) em repouso e em trânsito.",
            delay: 0
        },
        {
            icon: <Eye className="w-5 h-5 text-slate-700" />,
            category: "AUDITORIA",
            title: "Rastreabilidade Total",
            desc: "Cada ação no sistema gera um log imutável, permitindo auditorias precisas e total transparência operacional.",
            delay: 0.1
        },
        {
            icon: <Server className="w-5 h-5 text-slate-700" />,
            category: "INFRAESTRUTURA",
            title: "Cloud Escalável",
            desc: "Arquitetura serverless que escala automaticamente de acordo com o volume de dados da sua operação.",
            delay: 0.2
        },
        {
            icon: <Database className="w-5 h-5 text-slate-700" />,
            category: "DADOS",
            title: "Data Sovereignty",
            desc: "Controle absoluto sobre onde seus dados residem, em conformidade com as leis locais e globais de proteção.",
            delay: 0.3
        },
        {
            icon: <Cpu className="w-5 h-5 text-slate-700" />,
            category: "PERFORMANCE",
            title: "Edge Computing",
            desc: "Processamento distribuído que garante latência próxima de zero, mesmo em operações globais complexas.",
            delay: 0.4
        },
        {
            icon: <Shield className="w-5 h-5 text-slate-700" />,
            category: "COMPLIANCE",
            title: "Padrões Enterprise",
            desc: "Cumprimos rigorosamente os requisitos da LGPD, GDPR e normas técnicas internacionais de segurança.",
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
                            ESPECIFICAÇÕES TÉCNICAS
                        </motion.h2>
                        <motion.h3
                            initial={{ opacity: 0, x: -20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.1 }}
                            className="text-4xl font-black text-slate-900 tracking-tight mb-6"
                        >
                            Poder Líquido.
                        </motion.h3>
                        <motion.p
                            initial={{ opacity: 0, x: -20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.2 }}
                            className="text-slate-500 leading-relaxed"
                        >
                            Design não é apenas o que parece. É como funciona por dentro. O FLASH foi construído com as tecnologias mais resilientes do mercado moderno.
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
