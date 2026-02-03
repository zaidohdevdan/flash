import React from 'react';
import { Send } from 'lucide-react';
import { Button } from '../../ui';

interface SuccessViewProps {
    onBack: () => void;
}

export const SuccessView: React.FC<SuccessViewProps> = ({ onBack }) => {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-[#0f172a] p-6 text-center">
            <div className="bg-emerald-500/10 p-8 rounded-[3rem] border border-emerald-500/20 mb-8 animate-in zoom-in-50 duration-500">
                <Send className="w-20 h-20 text-emerald-500" />
            </div>
            <h2 className="text-3xl font-black text-white mb-2 tracking-tight uppercase">Relatório Enviado!</h2>
            <p className="text-gray-600 mb-10 font-medium uppercase tracking-widest text-[10px]">O seu supervisor foi notificado em tempo real.</p>
            <Button variant="success" size="lg" className="px-12" onClick={onBack}>
                VOLTAR AO INÍCIO
            </Button>
        </div>
    );
};
