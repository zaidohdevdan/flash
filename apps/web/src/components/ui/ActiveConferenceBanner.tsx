import { Video, X, ArrowRight } from 'lucide-react';

interface ActiveConferenceBannerProps {
    roomName: string;
    onRejoin: () => void;
    onDismiss: () => void;
}

export function ActiveConferenceBanner({ roomName, onRejoin, onDismiss }: ActiveConferenceBannerProps) {
    if (!roomName) return null;

    return (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-top-4 duration-500">
            <div className="flex items-center gap-4 px-6 py-3 bg-[var(--bg-primary)] border border-[var(--accent-primary)]/30 rounded-2xl shadow-2xl shadow-[var(--accent-primary)]/10 backdrop-blur-xl">
                <div className="relative">
                    <div className="w-10 h-10 bg-red-500/10 rounded-xl flex items-center justify-center text-red-500">
                        <Video className="w-5 h-5 fill-current animate-pulse" />
                    </div>
                    <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-[var(--bg-primary)] animate-ping" />
                </div>

                <div className="pr-4 border-r border-[var(--border-subtle)]">
                    <h4 className="text-[10px] font-black text-[var(--accent-primary)] uppercase tracking-tighter mb-0.5">
                        War Room Aberta
                    </h4>
                    <p className="text-[12px] font-bold text-[var(--text-primary)] uppercase tracking-widest truncate max-w-[120px]">
                        {roomName.split('-').pop()}
                    </p>
                </div>

                <button
                    type="button"
                    onClick={onRejoin}
                    className="flex items-center gap-2 group hover:scale-105 transition-all"
                >
                    <span className="text-[11px] font-black text-[var(--text-primary)] uppercase tracking-widest group-hover:text-[var(--accent-primary)] transition-colors">
                        Retorne Já!
                    </span>
                    <div className="w-6 h-6 bg-[var(--bg-secondary)] rounded-lg flex items-center justify-center group-hover:bg-[var(--accent-primary)] group-hover:text-white transition-all">
                        <ArrowRight className="w-3 h-3" />
                    </div>
                </button>

                <button
                    type="button"
                    onClick={onDismiss}
                    title="Encerrar Sessão"
                    className="p-1 text-[var(--text-tertiary)] hover:text-red-500 transition-colors"
                >
                    <X className="w-4 h-4" />
                </button>
            </div>
        </div>
    );
}
