import React from 'react';
import { Video, X, PhoneCall } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface ConferenceInviteNotificationProps {
    isOpen: boolean;
    onAccept: () => void;
    onDecline: () => void;
    hostName: string;
}

export const ConferenceInviteNotification: React.FC<ConferenceInviteNotificationProps> = ({
    isOpen,
    onAccept,
    onDecline,
    hostName
}) => {
    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0, y: 50, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 50, scale: 0.9 }}
                    className="fixed bottom-10 right-10 z-[110] max-w-sm w-full"
                >
                    <div className="bg-slate-900 border border-blue-500/30 rounded-[2rem] shadow-2xl p-6 backdrop-blur-3xl overflow-hidden relative">
                        {/* Background Pulse */}
                        <div className="absolute top-0 left-0 w-full h-full bg-blue-500/5 animate-pulse pointer-events-none" />

                        <div className="flex items-center gap-5 relative z-10">
                            <div className="w-14 h-14 rounded-2xl bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/20 shrink-0">
                                <PhoneCall className="w-7 h-7 animate-bounce" />
                            </div>

                            <div className="flex-1">
                                <h4 className="text-sm font-black text-white uppercase tracking-wider mb-1">Chamada em Vídeo</h4>
                                <p className="text-xs text-slate-400 font-medium">
                                    <span className="text-blue-400 font-bold">{hostName}</span> está convidando você para a War Room.
                                </p>
                            </div>
                        </div>

                        <div className="flex gap-3 mt-6 relative z-10">
                            <button
                                onClick={onDecline}
                                className="flex-1 py-3 px-4 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all"
                            >
                                <div className="flex items-center justify-center gap-2">
                                    <X className="w-3.5 h-3.5" />
                                    Recusar
                                </div>
                            </button>

                            <button
                                onClick={onAccept}
                                className="flex-1 py-3 px-4 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-lg shadow-blue-500/20"
                            >
                                <div className="flex items-center justify-center gap-2">
                                    <Video className="w-3.5 h-3.5" />
                                    Entrar
                                </div>
                            </button>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};
