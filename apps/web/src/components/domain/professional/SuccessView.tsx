import { useTranslation } from 'react-i18next';
import { Send } from 'lucide-react';
import { Button } from '../../ui';

interface SuccessViewProps {
    onBack: () => void;
}

export const SuccessView: React.FC<SuccessViewProps> = ({ onBack }) => {
    const { t } = useTranslation();

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-[var(--bg-primary)] p-6 text-center">
            <div className="bg-emerald-50 mb-8 p-8 rounded-[3rem] border border-emerald-100 shadow-sm animate-in zoom-in-50 duration-500">
                <Send className="w-20 h-20 text-emerald-500" />
            </div>
            <h2 className="text-3xl font-black text-[var(--text-primary)] mb-2 tracking-tight uppercase">{t('reports.success.title')}</h2>
            <p className="text-[var(--text-tertiary)] mb-10 font-bold uppercase tracking-widest text-[10px]">{t('reports.success.subtitle')}</p>
            <Button variant="primary" size="lg" className="px-12" onClick={onBack}>
                {t('reports.success.back')}
            </Button>
        </div>
    );
};
