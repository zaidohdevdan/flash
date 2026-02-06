import React from 'react';
import { Camera, Send, X } from 'lucide-react';
import { Button, TextArea } from '../../ui';

interface NewReportFormProps {
    comment: string;
    onCommentChange: (val: string) => void;
    preview: string | null;
    onImageChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onClearImage: () => void;
    onSubmit: (e: React.FormEvent) => void;
    isSending: boolean;
}

export const NewReportForm: React.FC<NewReportFormProps> = ({
    comment,
    onCommentChange,
    preview,
    onImageChange,
    onClearImage,
    onSubmit,
    isSending
}) => {
    return (
        <form onSubmit={onSubmit} className="space-y-6">
            <div className="relative aspect-video rounded-[2.5rem] bg-slate-900/50 border border-white/5 overflow-hidden group shadow-2xl shadow-blue-500/10">
                {preview ? (
                    <>
                        <img src={preview} alt="Evidence" className="w-full h-full object-cover" />
                        <button
                            type="button"
                            onClick={onClearImage}
                            className="absolute top-6 right-6 p-3 bg-red-600/90 hover:bg-red-600 text-white rounded-2xl backdrop-blur-md transition-all scale-90 opacity-0 group-hover:opacity-100 group-hover:scale-100"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </>
                ) : (
                    <label className="w-full h-full flex flex-col items-center justify-center cursor-pointer hover:bg-slate-800/50 transition-colors">
                        <Camera className="w-20 h-20 text-slate-400 mb-4" />
                        <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Toque para capturar evidência</p>
                        <input type="file" accept="image/*" capture="environment" onChange={onImageChange} className="hidden" />
                    </label>
                )}
            </div>

            <div className="space-y-6">
                <TextArea
                    placeholder="DESCREVA A OCORRÊNCIA OU ATUALIZAÇÃO OPERACIONAL..."
                    value={comment}
                    onChange={e => onCommentChange(e.target.value)}
                    className="!rounded-[2rem] p-6 text-sm font-bold text-white placeholder:text-slate-400 placeholder:uppercase placeholder:tracking-widest bg-slate-900/50 border-white/5"
                    rows={4}
                />
                <Button
                    type="submit"
                    variant="primary"
                    size="lg"
                    fullWidth
                    disabled={isSending || !preview}
                    className="h-16 !rounded-[2rem] text-sm shadow-xl shadow-blue-500/20"
                >
                    <Send className={`w-5 h-5 mr-3 ${isSending ? 'animate-ping' : ''}`} />
                    {isSending ? 'ENVIANDO RELATÓRIO...' : 'CONFIRMAR OPERAÇÃO'}
                </Button>
            </div>
        </form>
    );
};
