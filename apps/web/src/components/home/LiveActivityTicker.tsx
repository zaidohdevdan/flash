import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';
import { CheckCircle2, Siren, Zap, Activity } from 'lucide-react';

const EVENTS = [
    { text: "Operação #4029 iniciada em São Paulo", type: "info", icon: Zap },
    { text: "Incidente crítico resolvido em < 3min", type: "success", icon: CheckCircle2 },
    { text: "Equipe Alpha sincronizada (Offline -> Online)", type: "sync", icon: Activity },
    { text: "Novo alerta de perímetro detectado", type: "alert", icon: Siren },
];

export const LiveActivityTicker = () => {
    const [index, setIndex] = useState(0);

    useEffect(() => {
        const timer = setInterval(() => {
            setIndex((prev) => (prev + 1) % EVENTS.length);
        }, 4000);
        return () => clearInterval(timer);
    }, []);

    const CurrentIcon = EVENTS[index].icon;

    return (
        <div className="fixed bottom-8 left-8 z-40 hidden md:block">
            <AnimatePresence mode='wait'>
                <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="bg-slate-900/80 backdrop-blur-md border border-white/10 pr-6 pl-3 py-3 rounded-full flex items-center gap-3 shadow-2xl shadow-blue-900/20"
                >
                    <div className="relative">
                        <div className="w-2 h-2 rounded-full bg-green-500 absolute top-0 right-0 animate-ping" />
                        <div className="bg-white/10 p-2 rounded-full">
                            <CurrentIcon className="w-4 h-4 text-blue-400" />
                        </div>
                    </div>
                    <div>
                        <p className="text-[10px] font-black uppercase text-slate-500 tracking-widest leading-none mb-1">Live Activity</p>
                        <p className="text-xs font-bold text-slate-200 whitespace-nowrap">{EVENTS[index].text}</p>
                    </div>
                </motion.div>
            </AnimatePresence>
        </div>
    );
};
