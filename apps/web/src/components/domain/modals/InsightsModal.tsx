import React, { useEffect, useState } from 'react';
import { Copy, Check, Brain } from 'lucide-react';
import { Modal, Button, GlassCard } from '../../ui';

interface InsightsModalProps {
    isOpen: boolean;
    onClose: () => void;
    data: any;
}

export const InsightsModal: React.FC<InsightsModalProps> = ({ isOpen, onClose, data }) => {
    const [step, setStep] = useState<'generating' | 'done'>('generating');
    const [copied, setCopied] = useState(false);
    const [insightText, setInsightText] = useState('');

    useEffect(() => {
        if (isOpen && data) {
            setStep('generating');
            generateText(data);
        }
    }, [isOpen, data]);

    const generateText = (d: any) => {
        // Simulating AI processing delay
        setTimeout(() => {
            const date = new Date().toLocaleDateString('pt-BR');
            const criticalSector = d.bottlenecks.criticalSector;

            const text = `
📊 **Relatório Executivo de Operações - ${date}**
*Gerado via Flash Intelligence Hub*

**1. Resumo de Eficiência**
A equipe manteve uma média de resolução de **${d.efficiency.avgResolutionTime}h** em um total de **${d.efficiency.resolvedCount} casos resolvidos**. A taxa de resolução global indica uma saúde operacional de **${d.efficiency.resolvedCount > 0 ? Math.round((d.efficiency.resolvedCount / (d.efficiency.resolvedCount + d.bottlenecks.impactedCount)) * 100) : 0}%**.

**2. Análise de Gargalos**
Identificamos que o setor **${criticalSector?.name || 'Geral'}** apresenta o maior impacto na latência, com tempo médio de resposta de **${criticalSector?.avgHours || 0}h**. Isso representa um ponto de atenção para a próxima sprint.

**3. Previsão & Tendência (AI)**
Nossos modelos preditivos indicam uma tendência de **${d.predictions.trend === 'UP' ? 'ALTA 📈' : 'BAIXA 📉'}** no volume para amanhã, com uma estimativa de **+${d.predictions.nextDayVolume} novas demandas**.

**Recomendação do Sistema:**
${d.predictions.trend === 'UP'
                    ? "⚠️ Preparar escala de sobreaviso devido ao aumento previsto de demanda."
                    : "✅ Manter operação padrão e focar na redução de backlog do setor crítico."}
            `.trim();

            setInsightText(text);
            setStep('done');
        }, 2000);
    };

    const handleCopy = () => {
        navigator.clipboard.writeText(insightText);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="AI Executive Summary" maxWidth="lg" variant="dark">
            <div className="p-6 space-y-6">
                {step === 'generating' ? (
                    <div className="flex flex-col items-center justify-center py-12 space-y-4">
                        <div className="relative">
                            <div className="absolute inset-0 bg-blue-500/30 blur-xl rounded-full animate-pulse" />
                            <Brain className="w-16 h-16 text-blue-400 relative z-10 animate-bounce" />
                        </div>
                        <p className="text-sm font-black text-blue-300 uppercase tracking-widest animate-pulse">
                            Analisando padrões e gerando insights...
                        </p>
                    </div>
                ) : (
                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <GlassCard className="p-6 bg-slate-950/50 border-blue-500/20">
                            <pre className="whitespace-pre-wrap font-mono text-sm text-slate-400 leading-relaxed">
                                {insightText}
                            </pre>
                        </GlassCard>

                        <div className="flex gap-3 justify-end">
                            <Button variant="ghost" onClick={onClose}>
                                Fechar
                            </Button>
                            <Button
                                variant="primary"
                                onClick={handleCopy}
                                className="min-w-[140px]"
                            >
                                {copied ? (
                                    <>
                                        <Check className="w-4 h-4 mr-2" />
                                        Copiado!
                                    </>
                                ) : (
                                    <>
                                        <Copy className="w-4 h-4 mr-2" />
                                        Copiar Texto
                                    </>
                                )}
                            </Button>
                        </div>
                    </div>
                )}
            </div>
        </Modal>
    );
};
