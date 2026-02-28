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
                    initial={{ opacity: 0, y: 50, scale: 0.9, filter: 'blur(10px)' }}
                    animate={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
                    exit={{ opacity: 0, y: 50, scale: 0.9, filter: 'blur(10px)' }}
                    transition={{ type: 'spring', damping: 20, stiffness: 300 }}
                    className="fixed bottom-10 right-10 z-[110] max-w-sm w-full"
                >
                    <div className="bg-[#020617]/90 border border-white/10 rounded-[2.5rem] shadow-[0_0_50px_rgba(0,0,0,0.5)] p-8 backdrop-blur-3xl overflow-hidden relative">
                        {/* Background Pulse */}
                        <div className="absolute top-0 left-0 w-full h-full bg-indigo-500/5 animate-pulse pointer-events-none" />

                        <div className="flex items-center gap-6 relative z-10">
                            <div className="w-16 h-16 rounded-[1.5rem] bg-indigo-600 flex items-center justify-center text-white shadow-2xl shadow-indigo-600/20 shrink-0 border border-indigo-400/30">
                                <PhoneCall className="w-8 h-8 animate-vibrate" />
                            </div>

                            <div className="flex-1">
                                <h4 className="text-[11px] font-black text-white uppercase tracking-[0.3em] mb-2 leading-none">Canal de Voz</h4>
                                <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest leading-relaxed">
                                    <span className="text-indigo-400">{hostName.toUpperCase()}</span> SOLICITA SUA PRESENÇA NA WAR ROOM.
                                </p>
                            </div>
                        </div>

                        <div className="flex gap-4 mt-8 relative z-10">
                            <button
                                title='ABORTAR'
                                type='button'
                                onClick={onDecline}
                                className="flex-1 py-3.5 px-4 bg-white/5 hover:bg-white/10 text-slate-500 hover:text-white rounded-2xl text-[9px] font-black uppercase tracking-widest transition-all border border-white/5 active:scale-95"
                            >
                                <div className="flex items-center justify-center gap-2">
                                    <X className="w-4 h-4" />
                                    Abortar
                                </div>
                            </button>

                            <button
                                title='ESTABELECER'
                                type='button'
                                onClick={onAccept}
                                className="flex-1 py-3.5 px-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl text-[9px] font-black uppercase tracking-widest transition-all shadow-2xl shadow-indigo-600/20 border border-indigo-400/20 active:scale-95"
                            >
                                <div className="flex items-center justify-center gap-2">
                                    <Video className="w-4 h-4" />
                                    Estabelecer
                                </div>
                            </button>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};
