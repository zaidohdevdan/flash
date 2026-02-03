import React from 'react';
import { motion } from 'framer-motion';
import { Shield, Lock, Server, Cpu, Database, Eye } from 'lucide-react';

const specs = [
    {
        icon: <Lock className="w-5 h-5 text-blue-400" />,
        category: "SEGURANÇA",
        title: "Criptografia End-to-End",
        desc: "Todas as transmissões são protegidas via TLS 1.3. Dados sensíveis de usuários são hasheados com Argon2.",
        delay: 0
    },
    {
        icon: <Eye className="w-5 h-5 text-purple-400" />,
        category: "AUDITORIA",
        title: "Imutabilidade de Logs",
        desc: "Cada ação crítica gera um registro de auditoria inalterável (AuditLog), garantindo total rastreabilidade.",
        delay: 0.1
    },
    {
        icon: <Server className="w-5 h-5 text-green-400" />,
        category: "INFRAESTRUTURA",
        title: "Escalabilidade Horizontal",
        desc: "Backend Node.js/Bun preparado para escalar via clusters, com balanceamento de carga nativo.",
        delay: 0.2
    },
    {
        icon: <Database className="w-5 h-5 text-orange-400" />,
        category: "DADOS",
        title: "MongoDB Cluster",
        desc: "Armazenamento distribuído com réplicas para alta disponibilidade e tolerância a falhas.",
        delay: 0.3
    },
    {
        icon: <Cpu className="w-5 h-5 text-pink-400" />,
        category: "PERFORMANCE",
        title: "Real-time WebSockets",
        desc: "Comunicação bidirecional com latência sub-100ms para atualizações instantâneas de dashboard.",
        delay: 0.4
    },
    {
        icon: <Shield className="w-5 h-5 text-cyan-400" />,
        category: "COMPLIANCE",
        title: "RBAC Estrito",
        desc: "Controle de Acesso Baseado em Funções garante que cada usuário acesse apenas o permitido.",
        delay: 0.5
    }
];

export const TechSpecs = () => {
    return (
        <section className="py-32 bg-gray-900 relative">
            <div className="max-w-7xl mx-auto px-6">
                <div className="flex flex-col lg:flex-row gap-16 items-start">

                    {/* Left: Sticky Header */}
                    <div className="lg:w-1/3 lg:sticky lg:top-32">
                        <motion.h2
                            initial={{ opacity: 0, x: -20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            className="text-xs font-black text-green-500 uppercase tracking-[0.3em] mb-4"
                        >
                            Especificações Técnicas
                        </motion.h2>
                        <motion.h3
                            initial={{ opacity: 0, x: -20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.1 }}
                            className="text-4xl font-black text-white tracking-tight mb-6"
                        >
                            Engenharia de precisão para missões críticas.
                        </motion.h3>
                        <motion.p
                            initial={{ opacity: 0, x: -20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.2 }}
                            className="text-gray-400 leading-relaxed"
                        >
                            O Flash não é apenas bonito. Por baixo do capô, existe uma arquitetura desenhada para resistir ao caos operacional e garantir a integridade da informação.
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
                                className="p-8 rounded-3xl bg-white/5 border border-white/5 hover:bg-white/10 hover:border-white/10 transition-colors backdrop-blur-sm group"
                            >
                                <div className="flex items-center gap-4 mb-4">
                                    <div className="p-3 rounded-xl bg-white/5 group-hover:scale-110 transition-transform">
                                        {item.icon}
                                    </div>
                                    <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{item.category}</span>
                                </div>
                                <h4 className="text-lg font-bold text-white mb-2">{item.title}</h4>
                                <p className="text-sm text-gray-400 leading-relaxed">
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
