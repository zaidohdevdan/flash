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
            <div className="relative aspect-video rounded-[2.5rem] bg-[var(--bg-secondary)] border border-[var(--border-subtle)] overflow-hidden group shadow-sm transition-all hover:border-[var(--accent-primary)]">
                {preview ? (
                    <>
                        <img src={preview} alt="Evidence" className="w-full h-full object-cover" />
                        <button
                            type="button"
                            onClick={onClearImage}
                            className="absolute top-6 right-6 p-3 bg-white/90 hover:bg-white text-red-600 rounded-2xl backdrop-blur-md transition-all scale-90 opacity-0 group-hover:opacity-100 group-hover:scale-100 shadow-sm"
                            title="Remover foto"
                            aria-label="Remover foto"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </>
                ) : (
                    <label className="w-full h-full flex flex-col items-center justify-center cursor-pointer hover:bg-[var(--bg-tertiary)] transition-colors">
                        <div className="p-4 bg-white rounded-full shadow-sm mb-4 group-hover:scale-110 transition-transform">
                            <Camera className="w-8 h-8 text-[var(--accent-primary)]" />
                        </div>
                        <p className="text-[10px] text-[var(--text-secondary)] font-black uppercase tracking-widest">Capturar Evidência</p>
                        <input
                            type="file"
                            accept="image/*"
                            onChange={onImageChange}
                            className="hidden"
                            title="Capturar foto"
                            aria-label="Capturar foto"
                        />
                    </label>
                )}
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
                    disabled={isSending || !preview}
                    className="h-16 !rounded-[2rem] text-sm shadow-xl shadow-[var(--accent-primary)]/20"
                >
                    <Send className={`w-5 h-5 mr-3 ${isSending ? 'animate-ping' : ''}`} />
                    {isSending ? 'Enviando...' : 'Enviar Relatório AGORA'}
                </Button>
            </div>
        </form>
    );
};
