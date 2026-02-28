import { Send } from 'lucide-react';
import { Button } from '../../ui';

interface SuccessViewProps {
    onBack: () => void;
}

export const SuccessView: React.FC<SuccessViewProps> = ({ onBack }) => {
    return (
        <div className="h-full flex flex-col items-center justify-center p-6 text-center animate-in zoom-in-95 duration-700">
            <div className="bg-emerald-500/10 mb-8 p-10 rounded-[3rem] border border-emerald-500/20 shadow-[0_0_50px_rgba(16,185,129,0.1)] relative group">
                <div className="absolute inset-0 bg-emerald-500/5 rounded-[3rem] blur-2xl group-hover:bg-emerald-500/10 transition-all" />
                <Send className="w-24 h-24 text-emerald-500 relative z-10" />
            </div>
            <h2 className="text-4xl font-black text-white mb-3 tracking-tight uppercase">Missão Cumprida!</h2>
            <p className="text-slate-400 mb-12 font-bold uppercase tracking-[0.3em] text-[10px] max-w-sm">O relatório operacional foi transmitido com sucesso para a central de comando.</p>
            <Button
                variant="primary"
                size="lg"
                className="px-16 h-14 !rounded-2xl uppercase text-[11px] font-black tracking-[0.2em] shadow-xl shadow-emerald-500/20 bg-emerald-600 hover:bg-emerald-500 border-none transition-all hover:scale-105 active:scale-95"
                onClick={onBack}
            >
                Retornar ao Painel
            </Button>
        </div>
    );
};
