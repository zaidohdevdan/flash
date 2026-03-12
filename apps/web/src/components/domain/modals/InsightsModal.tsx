import React, { useEffect, useState } from 'react';
import { Copy, Check, Brain } from 'lucide-react';
import { Modal, Button } from '../../ui';

interface InsightData {
    bottlenecks: {
        criticalSector?: {
            name: string;
            avgHours: number;
        } | null;
        impactedCount: number;
    };
    efficiency: {
        avgResolutionTime: string;
        resolvedCount: number;
    };
    predictions: {
        trend: 'UP' | 'DOWN';
        nextDayVolume: number;
    };
}

interface InsightsModalProps {
    isOpen: boolean;
    onClose: () => void;
    data: InsightData | null;
}

export const InsightsModal: React.FC<InsightsModalProps> = ({ isOpen, onClose, data }) => {
    const [step, setStep] = useState<'generating' | 'done'>('generating');
    const [copied, setCopied] = useState(false);
    const [insightText, setInsightText] = useState('');

    const generateText = (d: InsightData) => {
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

    useEffect(() => {
        if (isOpen && data) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setStep('generating');
            generateText(data);
        }
    }, [isOpen, data]);

    const handleCopy = () => {
        navigator.clipboard.writeText(insightText);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Flash Intelligence"
            subtitle="Análise Preditiva e Insights"
            maxWidth="lg"
            footer={
                step === 'done' ? (
                    <>
                        <Button variant="ghost" onClick={onClose}>
                            Fechar
                        </Button>
                        <Button
                            variant="primary"
                            onClick={handleCopy}
                            className="min-w-[140px]"
                            leftIcon={copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                        >
                            {copied ? 'Copiado!' : 'Copiar Análise'}
                        </Button>
                    </>
                ) : undefined
            }
        >
            <div className="py-4">
                {step === 'generating' ? (
                    <div className="flex flex-col items-center justify-center py-16 space-y-6">
                        <div className="relative">
                            <div className="absolute inset-0 bg-indigo-500/20 blur-xl rounded-full animate-pulse" />
                            <Brain className="w-16 h-16 text-indigo-500 relative z-10 animate-bounce" />
                        </div>
                        <div className="text-center space-y-2">
                            <p className="text-[12px] font-black text-slate-900 dark:text-white uppercase tracking-widest animate-pulse">
                                Processando Dados
                            </p>
                            <p className="text-[11px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-tight">
                                Analisando padrões operacionais...
                            </p>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-6 animate-in slide-in-from-bottom-2 duration-500">
                        <div className="p-6 bg-slate-50 dark:bg-white/5 rounded-2xl border border-slate-200 dark:border-white/5 shadow-inner">
                            <pre className="whitespace-pre-wrap font-sans text-sm text-slate-700 dark:text-slate-300 leading-relaxed font-bold">
                                {insightText}
                            </pre>
                        </div>
                    </div>
                )}
            </div>
        </Modal>
    );
};
