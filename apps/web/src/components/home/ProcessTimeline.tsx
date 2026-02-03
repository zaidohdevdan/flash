import { motion } from 'framer-motion';
import { Camera, Zap, LayoutDashboard, CheckCircle2, ArrowRight } from 'lucide-react';

const steps = [
    {
        id: 1,
        title: "Captura",
        desc: "O profissional registra a ocorrência com foto e GPS automático.",
        icon: <Camera className="w-6 h-6" />,
        color: "bg-blue-500",
        shadow: "shadow-blue-500/50"
    },
    {
        id: 2,
        title: "Transmissão",
        desc: "Dados criptografados via Socket.io em < 100ms.",
        icon: <Zap className="w-6 h-6" />,
        color: "bg-yellow-500",
        shadow: "shadow-yellow-500/50"
    },
    {
        id: 3,
        title: "Triagem",
        desc: "Supervisores recebem alertas visuais e sonoros instantâneos.",
        icon: <LayoutDashboard className="w-6 h-6" />,
        color: "bg-purple-500",
        shadow: "shadow-purple-500/50"
    },
    {
        id: 4,
        title: "Resolução",
        desc: "Encaminhamento para setor ou arquivamento auditado.",
        icon: <CheckCircle2 className="w-6 h-6" />,
        color: "bg-green-500",
        shadow: "shadow-green-500/50"
    }
];

export const ProcessTimeline = () => {
    return (
        <section className="py-32 bg-[#020617] relative overflow-hidden">
            {/* Background Gradients */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[100px]" />
                <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[100px]" />
            </div>

            <div className="max-w-7xl mx-auto px-6 relative z-10">
                <div className="text-center mb-24">
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-xs font-black text-blue-500 uppercase tracking-[0.3em] mb-4"
                    >
                        Fluxo Operacional
                    </motion.h2>
                    <motion.h3
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.1 }}
                        className="text-4xl md:text-5xl font-black text-white tracking-tight"
                    >
                        Velocidade da luz, <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">literalmente.</span>
                    </motion.h3>
                </div>

                <div className="relative">
                    {/* Connecting Line (Desktop) */}
                    <div className="hidden lg:block absolute top-1/2 left-0 w-full h-1 bg-gray-800 -translate-y-1/2 rounded-full overflow-hidden">
                        <motion.div
                            className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-green-500"
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
                                    <div className={`w-20 h-20 rounded-2xl ${step.color} bg-opacity-10 backdrop-blur-xl border border-white/10 flex items-center justify-center mb-8 relative z-10 group-hover:scale-110 transition-transform duration-300 shadow-2xl ${step.shadow}`}>
                                        <div className="text-white">
                                            {step.icon}
                                        </div>
                                        {/* Pulse Effect */}
                                        <div className={`absolute inset-0 rounded-2xl ${step.color} blur-xl opacity-20 group-hover:opacity-40 transition-opacity`} />
                                    </div>

                                    <h4 className="text-xl font-bold text-white mb-3">{step.title}</h4>
                                    <p className="text-gray-400 text-sm leading-relaxed max-w-[200px] mx-auto">
                                        {step.desc}
                                    </p>

                                    {/* Arrow connecting steps (Mobile only) */}
                                    {index < steps.length - 1 && (
                                        <ArrowRight className="lg:hidden w-6 h-6 text-gray-700 mt-8 rotate-90" />
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
