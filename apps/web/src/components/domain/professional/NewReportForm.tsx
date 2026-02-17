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
        <form onSubmit={onSubmit} className="space-y-6">
            <div className="space-y-4">
                <label className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-widest pl-1">
                    Evidências ({previews.length})
                </label>

                <div className="grid grid-cols-2 gap-4">
                    {previews.map((preview, index) => (
                        <div key={index} className="relative aspect-square rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border-subtle)] overflow-hidden group shadow-sm">
                            <img src={preview} alt={`Evidence ${index + 1}`} className="w-full h-full object-cover" />
                            <button
                                type="button"
                                onClick={() => onRemoveImage(index)}
                                className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-xl shadow-sm transition-all hover:bg-red-600 opacity-0 group-hover:opacity-100"
                                title="Remover foto"
                                aria-label="Remover foto"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                    ))}

                    <label className="aspect-square flex flex-col items-center justify-center cursor-pointer bg-[var(--bg-secondary)] border-2 border-dashed border-[var(--border-medium)] rounded-2xl hover:bg-[var(--bg-tertiary)] hover:border-[var(--accent-primary)] transition-all group">
                        <div className="p-3 bg-[var(--bg-primary)] rounded-full shadow-sm mb-2 group-hover:scale-110 transition-transform">
                            <Camera className="w-6 h-6 text-[var(--text-tertiary)] group-hover:text-[var(--accent-primary)]" />
                        </div>
                        <span className="text-[10px] font-bold text-[var(--text-tertiary)] group-hover:text-[var(--text-primary)] uppercase tracking-widest">
                            {previews.length === 0 ? 'Adicionar Foto' : 'Mais Fotos'}
                        </span>
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            multiple
                            onChange={onImagesChange}
                            className="hidden"
                            title="Adicionar fotos"
                            aria-label="Adicionar fotos"
                        />
                    </label>
                </div>
            </div>

            <div className="space-y-6">
                <TextArea
                    placeholder="Descreva o incidente com o máximo de detalhes..."
                    value={comment}
                    onChange={e => onCommentChange(e.target.value)}
                    className="!rounded-[2rem] p-6 text-sm font-bold text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] placeholder:uppercase placeholder:tracking-widest bg-[var(--bg-primary)] border-[var(--border-subtle)] focus:border-[var(--accent-primary)] focus:ring-[var(--accent-primary)]"
                    rows={4}
                    aria-label="Descrição da ocorrência"
                />
                <Button
                    type="submit"
                    variant="primary"
                    size="lg"
                    fullWidth
                    disabled={isSending || previews.length === 0}
                    className="h-16 !rounded-[2rem] text-sm shadow-xl shadow-[var(--accent-primary)]/20"
                >
                    <Send className={`w-5 h-5 mr-3 ${isSending ? 'animate-ping' : ''}`} />
                    {isSending ? 'Enviando...' : 'Enviar Relatório AGORA'}
                </Button>
            </div>
        </form>
    );
};
