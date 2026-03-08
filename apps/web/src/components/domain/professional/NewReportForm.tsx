import React, { type ChangeEvent, type FC, useEffect, useRef } from 'react';
import { Camera, Send, X } from 'lucide-react';
import { Button, TextArea } from '../../ui';

interface NewReportFormProps {
    comment: string;
    onCommentChange: (val: string) => void;
    previews: string[];
    onImagesChange: (e: ChangeEvent<HTMLInputElement>) => void;
    onRemoveImage: (index: number) => void;
    onSubmit: React.SubmitEventHandler<HTMLFormElement>;
    isSending: boolean;
}

export const NewReportForm: FC<NewReportFormProps> = ({
    comment,
    onCommentChange,
    previews,
    onImagesChange,
    onRemoveImage,
    onSubmit,
    isSending
}) => {
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (fileInputRef.current) {
            fileInputRef.current.setAttribute('capture', 'environment');
        }
    }, []);

    return (
        <form onSubmit={onSubmit} className="space-y-8 animate-in slide-in-from-bottom-5 duration-700">
            <div className="space-y-4">
                <label className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-[0.2em] pl-1">
                    Evidências Fotográficas <span className="text-slate-400 dark:text-slate-600">[{previews.length}/10]</span>
                </label>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
                    {previews.map((preview, index) => (
                        <div key={index} className="relative aspect-square rounded-2xl bg-slate-100 dark:bg-black/40 border border-slate-200 dark:border-white/5 overflow-hidden group shadow-md md:shadow-2xl backdrop-blur-sm">
                            <img src={preview} alt={`Evidence ${index + 1}`} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                            <button
                                type="button"
                                onClick={() => onRemoveImage(index)}
                                className="absolute top-2 right-2 p-2 bg-rose-500/90 text-white rounded-xl shadow-lg backdrop-blur-md transition-all hover:bg-rose-600 scale-100 md:scale-0 md:group-hover:scale-100 hover:scale-110"
                                title="Remover"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                    ))}

                    <label className="aspect-square flex flex-col items-center justify-center cursor-pointer bg-slate-50 dark:bg-white/5 border-2 border-dashed border-slate-200 dark:border-white/10 rounded-2xl hover:bg-slate-100 dark:hover:bg-white/10 hover:border-indigo-400 dark:hover:border-indigo-500/50 transition-all group">
                        <div className="p-4 bg-white dark:bg-black/40 rounded-2xl shadow-xl mb-3 group-hover:scale-110 transition-transform border border-slate-100 dark:border-white/5">
                            <Camera className="w-7 h-7 text-slate-400 dark:text-slate-400 group-hover:text-indigo-500 dark:group-hover:text-indigo-400" />
                        </div>
                        <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 group-hover:text-indigo-600 dark:group-hover:text-slate-300 uppercase tracking-[0.2em]">
                            Capturar Imagem
                        </span>
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            multiple
                            onChange={onImagesChange}
                            className="hidden"
                        />
                    </label>
                </div>
            </div>

            <div className="space-y-6">
                <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-[0.2em] pl-1">
                        Relatório Detalhado
                    </label>
                    <TextArea
                        placeholder="Descreva a situação operacional..."
                        value={comment}
                        onChange={e => onCommentChange(e.target.value)}
                        className="!rounded-2xl p-6 text-sm font-bold text-slate-800 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-600 placeholder:uppercase placeholder:tracking-[0.2em] bg-slate-50 dark:bg-black/40 border-slate-200 dark:border-white/5 focus:border-indigo-400 dark:focus:border-indigo-500/50 focus:ring-indigo-500/20 shadow-inner"
                        rows={5}
                    />
                </div>

                <Button
                    type="submit"
                    variant="primary"
                    size="lg"
                    fullWidth
                    disabled={isSending || previews.length === 0}
                    className="h-16 !rounded-2xl text-[11px] font-black uppercase tracking-[0.3em] shadow-2xl shadow-indigo-500/20 bg-indigo-600 hover:bg-indigo-500 border-none transition-all hover:-translate-y-1 active:translate-y-0"
                >
                    <Send className={`w-5 h-5 mr-4 ${isSending ? 'animate-pulse' : ''}`} />
                    {isSending ? 'Sincronizando...' : 'Publicar no Sistema'}
                </Button>
            </div>
        </form>
    );
};
