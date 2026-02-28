import React, { useState, useRef, useEffect } from 'react';
import { TerminalSquare, X, ChevronRight, Loader2, HelpCircle } from 'lucide-react';
import { api } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { db } from '../../services/db';
import toast from 'react-hot-toast';

type TerminalAction =
    | { action: 'SET_APPEARANCE'; params: { theme?: 'light' | 'dark' | 'system'; density?: 'comfortable' | 'compact' } }
    | { action: 'SET_NOTIFICATIONS'; params: { enabled?: boolean; desktop?: boolean } }
    | { action: 'CLEAR_OFFLINE_CACHE'; params?: never };

type TerminalOutput = {
    type: 'success' | 'error' | 'info' | 'warning';
    message: string;
} & (TerminalAction | { action?: never; params?: never });

interface CommandHistory {
    command: string;
    output: TerminalOutput[];
    timestamp: Date;
}

interface AdminTerminalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const AdminTerminal: React.FC<AdminTerminalProps> = ({ isOpen, onClose }) => {
    const { user, setNotificationsEnabled, setDesktopNotificationsEnabled } = useAuth();
    const [input, setInput] = useState('');
    const [history, setHistory] = useState<CommandHistory[]>([]);
    const [commandIndex, setCommandIndex] = useState(-1);
    const [isExecuting, setIsExecuting] = useState(false);

    // Resize state
    const [heightPx, setHeightPx] = useState(400);
    const isDraggingRef = useRef(false);

    const inputRef = useRef<HTMLInputElement>(null);
    const bottomRef = useRef<HTMLDivElement>(null);

    const handleRemoteAction = async (output: TerminalAction) => {
        const { action, params } = output;

        switch (action) {
            case 'SET_APPEARANCE':
                if (params.theme) {
                    const newTheme = params.theme;
                    localStorage.setItem('theme', newTheme);
                    if (user?.id) localStorage.setItem(`settings_${user.id}_theme`, newTheme);

                    if (newTheme === 'dark') document.documentElement.classList.add('dark');
                    else if (newTheme === 'light') document.documentElement.classList.remove('dark');
                    else {
                        if (window.matchMedia('(prefers-color-scheme: dark)').matches) document.documentElement.classList.add('dark');
                        else document.documentElement.classList.remove('dark');
                    }
                }
                if (params.density) {
                    localStorage.setItem('density', params.density);
                    if (user?.id) localStorage.setItem(`settings_${user.id}_density`, params.density);
                    document.documentElement.setAttribute('data-density', params.density);
                }
                toast.success('Aparência atualizada via Terminal');
                break;

            case 'SET_NOTIFICATIONS':
                if (params.enabled !== undefined) setNotificationsEnabled(params.enabled);
                if (params.desktop !== undefined) setDesktopNotificationsEnabled(params.desktop);
                toast.success('Preferências de notificação sincronizadas');
                break;

            case 'CLEAR_OFFLINE_CACHE':
                try {
                    await db.chatMessages.clear();
                    await db.notifications.clear();
                    await db.pendingReports.clear();
                    toast.success('Cache offline (DexieDB) limpo com sucesso');
                } catch (err) {
                    console.error('Terminal Cache Clear Error:', err);
                    toast.error('Erro ao limpar cache via terminal');
                }
                break;
        }
    };

    const commandHistoryOnly = history.map(h => h.command);

    useEffect(() => {
        if (isOpen) {
            setTimeout(() => inputRef.current?.focus(), 100);
        }
    }, [isOpen]);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [history, isExecuting]);

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if (!isDraggingRef.current) return;
            let newHeight = e.clientY;
            if (newHeight < 200) newHeight = 200;
            if (newHeight > window.innerHeight - 50) newHeight = window.innerHeight - 50;
            setHeightPx(newHeight);
        };

        const handleMouseUp = () => {
            isDraggingRef.current = false;
            document.body.style.cursor = 'default';
        };

        if (isOpen) {
            window.addEventListener('mousemove', handleMouseMove);
            window.addEventListener('mouseup', handleMouseUp);
        }

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };
    }, [isOpen]);

    const handleExecute = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim()) return;

        const cmd = input.trim();
        setInput('');
        setCommandIndex(-1);

        if (cmd.toLowerCase() === 'clear') {
            setHistory([]);
            return;
        }

        if (cmd.toLowerCase() === 'exit') {
            onClose();
            return;
        }

        setIsExecuting(true);
        setHistory(prev => [...prev, { command: cmd, output: [], timestamp: new Date() }]);

        try {
            const response = await api.post('/admin/terminal/execute', { command: cmd });
            const outputStats = response.data as TerminalOutput[];

            for (const out of outputStats) {
                if (out.action) {
                    handleRemoteAction(out);
                }
            }

            setHistory(prev => {
                const newHistory = [...prev];
                newHistory[newHistory.length - 1].output = outputStats;
                return newHistory;
            });
        } catch (error: unknown) {
            let errorMsg = 'Falha crítica na conexão com o terminal.';
            const err = error as { response?: { data?: { message?: string }[] | { message?: string } } };

            if (err.response?.data) {
                if (Array.isArray(err.response.data)) {
                    errorMsg = err.response.data[0]?.message || errorMsg;
                } else if ('message' in err.response.data && err.response.data.message) {
                    errorMsg = err.response.data.message;
                }
            }

            setHistory(prev => {
                const newHistory = [...prev];
                newHistory[newHistory.length - 1].output = [{ type: 'error', message: errorMsg }];
                return newHistory;
            });
        } finally {
            setIsExecuting(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'ArrowUp') {
            e.preventDefault();
            if (commandHistoryOnly.length > 0) {
                const newIndex = commandIndex + 1;
                if (newIndex < commandHistoryOnly.length) {
                    setCommandIndex(newIndex);
                    setInput(commandHistoryOnly[commandHistoryOnly.length - 1 - newIndex] || '');
                }
            }
        } else if (e.key === 'ArrowDown') {
            e.preventDefault();
            if (commandIndex >= 0) {
                const newIndex = commandIndex - 1;
                setCommandIndex(newIndex);
                if (newIndex >= 0) {
                    setInput(commandHistoryOnly[commandHistoryOnly.length - 1 - newIndex] || '');
                } else {
                    setInput('');
                }
            }
        }
    };

    if (!isOpen) return null;

    return (
        <div
            style={{ height: `${heightPx}px` }}
            className="fixed top-0 left-0 w-full bg-zinc-950 dark:bg-[#300a24]/98 backdrop-blur-xl border-b border-white/10 dark:border-white/20 shadow-[0_10px_40px_rgba(0,0,0,0.6)] z-[100] flex flex-col font-mono text-sm animate-in slide-in-from-top duration-300"
        >
            {/* Terminal Header */}
            <div className="flex items-center justify-between px-4 py-2 border-b border-white/5 dark:border-white/10 bg-black/40 dark:bg-[#2c001e]/80 shadow-md">
                <div className="flex items-center gap-2 text-gray-300">
                    <TerminalSquare className="w-4 h-4" />
                    <span className="font-bold text-xs tracking-wide">FlashOS Terminal</span>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        title="Manual de Comandos"
                        type="button"
                        onClick={() => {
                            setHistory(prev => [...prev, { command: 'help', output: [{ type: 'info', message: 'Rodando comando help...' }], timestamp: new Date() }]);
                            api.post('/admin/terminal/execute', { command: 'help' }).then(res => {
                                setHistory(prev => {
                                    const newHistory = [...prev];
                                    newHistory[newHistory.length - 1].output = res.data;
                                    return newHistory;
                                });
                            });
                        }}
                        className="p-1 hover:bg-white/10 rounded text-gray-400 transition-colors"
                    >
                        <HelpCircle className="w-4 h-4" />
                    </button>
                    <button onClick={onClose} title="Fechar Terminal" className="p-1 hover:bg-red-500/20 hover:text-red-400 rounded text-gray-400 transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>
            </div>

            {/* Terminal Body */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 text-gray-300 scrollbar-thin scrollbar-thumb-zinc-800 dark:scrollbar-thumb-gray-800 scrollbar-track-transparent">
                <div className="text-gray-500 text-xs mb-4">
                    FlashOS [Versão 1.0.0]<br />
                    (c) FLASH Corporation. Todos os direitos reservados.<br />
                    Digite 'help' para ver a lista de comandos.
                </div>

                {history.map((entry, idx) => (
                    <div key={idx} className="space-y-1">
                        <div className="flex items-center gap-2 text-gray-400">
                            <span className="text-[#8ae234] font-bold">admin@flash<span className="text-white">:</span><span className="text-[#729fcf]">~</span><span className="text-white">$</span></span>
                            <span className="text-white">{entry.command}</span>
                        </div>
                        {entry.output.length === 0 && isExecuting && idx === history.length - 1 ? (
                            <div className="flex items-center gap-2 text-gray-500">
                                <Loader2 className="w-3 h-3 animate-spin" /> executando...
                            </div>
                        ) : (
                            <div className="pl-4 space-y-1">
                                {entry.output.map((out, j) => (
                                    <pre key={j} className={`whitespace-pre-wrap ${out.type === 'error' ? 'text-rose-400' :
                                        out.type === 'success' ? 'text-emerald-400' :
                                            out.type === 'warning' ? 'text-orange-400' :
                                                'text-gray-300'}`}>
                                        {out.message}
                                    </pre>
                                ))}
                            </div>
                        )}
                    </div>
                ))}
                <div ref={bottomRef} />
            </div>

            {/* Terminal Input */}
            <form onSubmit={handleExecute} className="px-4 py-3 bg-black dark:bg-[#300a24] border-t border-white/5 dark:border-white/10 flex items-center gap-2">
                <span className="text-[#8ae234] font-bold">admin@flash<span className="text-white">:</span><span className="text-[#729fcf]">~</span><span className="text-white">$</span></span>
                <input
                    ref={inputRef}
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    className="flex-1 bg-transparent border-none outline-none text-white font-mono placeholder-gray-600 dark:placeholder-gray-700"
                    placeholder="Digite o comando..."
                    autoCapitalize="off"
                    autoComplete="off"
                    spellCheck="false"
                />
                <button type="submit" title="Executar" disabled={!input.trim() || isExecuting} className="text-gray-500 hover:text-white disabled:opacity-50 transition-colors">
                    <ChevronRight className="w-4 h-4" />
                </button>
            </form>

            {/* Resize Handle */}
            <div
                className="w-full h-1.5 bg-black/40 hover:bg-indigo-500/50 cursor-row-resize flex justify-center items-center group transition-colors"
                onMouseDown={(e) => {
                    e.preventDefault();
                    isDraggingRef.current = true;
                    document.body.style.cursor = 'row-resize';
                }}
            >
                <div className="w-12 h-0.5 bg-white/20 group-hover:bg-white/60 rounded-full transition-colors" />
            </div>
        </div>
    );
};
