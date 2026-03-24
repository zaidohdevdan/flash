import React, { useState, useRef, useEffect, useCallback } from 'react';
import { X, ZoomIn, ZoomOut, RotateCcw, ChevronLeft, ChevronRight, ExternalLink, Download } from 'lucide-react';
import { FileIcon } from '../ui/FileIcon';
import { formatDownloadUrl } from '../../services/api';
import { toast } from 'react-hot-toast';

interface ImageZoomModalProps {
    isOpen: boolean;
    onClose: () => void;
    images: string[];
    downloadUrls?: string[];
    formats?: string[];
    initialIndex?: number;
}

export const ImageZoomModal: React.FC<ImageZoomModalProps> = ({ isOpen, onClose, images, downloadUrls = [], formats = [], initialIndex = 0 }) => {
    const [currentIndex, setCurrentIndex] = useState(initialIndex);
    const [scale, setScale] = useState(1);
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [isDragging, setIsDragging] = useState(false);
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
    const imgRef = useRef<HTMLImageElement>(null);

    // Helper to reset zoom/pan
    const handleReset = useCallback(() => {
        setScale(1);
        setPosition({ x: 0, y: 0 });
    }, []);

    // Handlers defined BEFORE useEffect
    const handleNext = useCallback(() => {
        setCurrentIndex(prev => (prev + 1) % images.length);
        handleReset();
    }, [images.length, handleReset]);

    const handlePrev = useCallback(() => {
        setCurrentIndex(prev => (prev - 1 + images.length) % images.length);
        handleReset();
    }, [images.length, handleReset]);

    // Handle ESC key & Arrow keys
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (!isOpen) return;

            if (e.key === 'Escape') onClose();
            if (e.key === 'ArrowLeft') handlePrev();
            if (e.key === 'ArrowRight') handleNext();
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, onClose, handleNext, handlePrev]);

    if (!isOpen || images.length === 0) return null;

    const currentMedia = images[currentIndex];
    const isImage = /\.(jpg|jpeg|png|gif|webp)$/i.test(currentMedia) && !currentMedia.toLowerCase().includes('.pdf');

    const handleZoomIn = () => setScale(prev => Math.min(prev + 0.5, 5));
    const handleZoomOut = () => setScale(prev => Math.max(prev - 0.5, 1));

    const handleMouseDown = (e: React.MouseEvent) => {
        if (isImage && scale > 1) {
            setIsDragging(true);
            setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
        }
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (isDragging && scale > 1) {
            setPosition({
                x: e.clientX - dragStart.x,
                y: e.clientY - dragStart.y
            });
        }
    };

    const handleMouseUp = () => setIsDragging(false);

    const handleDownload = () => {
        const downloadUrl = downloadUrls[currentIndex] || formatDownloadUrl(currentMedia);
        const format = formats[currentIndex];
        const isPdf = format === 'pdf' || currentMedia.toLowerCase().includes('.pdf');
        
        if (isPdf) {
            window.open(currentMedia, '_blank');
            toast.success('Abrindo PDF...');
            return;
        }

        if (!downloadUrl) return;

        const link = document.createElement('a');
        link.href = downloadUrl;
        link.download = currentMedia.split('/').pop()?.split('?')[0] || 'download';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        toast.success('Iniciando download...');
    };

    return (
        <div className="fixed inset-0 z-[9998] flex items-center justify-center p-4 animate-in fade-in duration-300">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-slate-950/90 backdrop-blur-xl"
                onClick={onClose}
            />

            {/* Controls bar */}
            <div className="fixed top-0 left-0 right-0 p-8 flex justify-center z-[9999] pointer-events-none">
                <div className="w-full max-w-6xl flex items-center justify-between pointer-events-auto">
                    <div className="flex bg-white/10 backdrop-blur-md rounded-2xl p-1.5 border border-white/20 shadow-2xl">
                        {isImage && (
                            <>
                                <button
                                    type="button"
                                    onClick={handleZoomOut}
                                    className="p-2.5 text-white hover:bg-white/10 rounded-xl transition-colors"
                                    title="Diminuir Zoom"
                                    aria-label="Diminuir Zoom"
                                >
                                    <ZoomOut className="w-5 h-5" />
                                </button>
                                <button
                                    type="button"
                                    onClick={handleReset}
                                    className="p-2.5 text-white hover:bg-white/10 rounded-xl transition-colors"
                                    title="Resetar"
                                    aria-label="Resetar"
                                >
                                    <RotateCcw className="w-5 h-5" />
                                </button>
                                <button
                                    type="button"
                                    onClick={handleZoomIn}
                                    className="p-2.5 text-white hover:bg-white/10 rounded-xl transition-colors"
                                    title="Aumentar Zoom"
                                    aria-label="Aumentar Zoom"
                                >
                                    <ZoomIn className="w-5 h-5" />
                                </button>
                            </>
                        )}
                        <button
                            type="button"
                            onClick={handleDownload}
                            className={`flex items-center gap-2 px-4 py-2.5 text-white hover:bg-white/10 rounded-xl transition-colors text-xs font-black uppercase tracking-widest ${isImage ? 'border-l border-white/10 ml-1.5' : ''}`}
                            title="Baixar Arquivo"
                        >
                            <Download className="w-4 h-4" />
                            <span className="hidden sm:inline">Baixar</span>
                        </button>
                    </div>

                    <div className="flex items-center gap-4">
                        <span className="text-white/50 text-xs font-bold uppercase tracking-widest hidden sm:block">
                            {currentIndex + 1} / {images.length}
                        </span>
                        <button
                            type="button"
                            onClick={onClose}
                            className="p-3 bg-red-500/80 hover:bg-red-500 text-white rounded-2xl backdrop-blur-md shadow-2xl transition-all hover:scale-110 active:scale-95 border border-red-400/50"
                            title="Fechar Visualização"
                            aria-label="Fechar Visualização"
                        >
                            <X className="w-6 h-6" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Navigation Arrows */}
            {images.length > 1 && (
                <>
                    <button
                        type="button"
                        onClick={handlePrev}
                        className="fixed left-4 md:left-8 top-1/2 -translate-y-1/2 p-4 text-white/50 hover:text-white hover:bg-white/10 rounded-full transition-all z-[9999]"
                        aria-label="Item Anterior"
                    >
                        <ChevronLeft className="w-8 h-8 md:w-10 md:h-10" />
                    </button>
                    <button
                        type="button"
                        onClick={handleNext}
                        className="fixed right-4 md:right-8 top-1/2 -translate-y-1/2 p-4 text-white/50 hover:text-white hover:bg-white/10 rounded-full transition-all z-[9999]"
                        aria-label="Próximo Item"
                    >
                        <ChevronRight className="w-8 h-8 md:w-10 md:h-10" />
                    </button>
                </>
            )}

            {/* Media Container */}
            <div
                className={`relative w-full h-full flex items-center justify-center overflow-hidden cursor-${scale > 1 ? (isDragging ? 'grabbing' : 'grab') : 'default'}`}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
            >
                {isImage ? (
                    <img
                        ref={imgRef}
                        key={currentMedia}
                        src={currentMedia}
                        alt={`Visualização ${currentIndex + 1}`}
                        style={{
                            transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
                            transition: isDragging ? 'none' : 'transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
                            maxWidth: '98%',
                            maxHeight: '98%',
                            objectFit: 'contain'
                        }}
                        className="rounded-lg shadow-[0_0_100px_rgba(0,0,0,0.8)] select-none border border-white/5"
                        draggable={false}
                    />
                ) : (
                    <div className="flex flex-col items-center gap-8 p-12 bg-white/5 border border-white/10 rounded-[40px] backdrop-blur-2xl shadow-2xl max-w-md w-full animate-in zoom-in-95 duration-500">
                        <div className="p-10 bg-white/5 rounded-full border border-white/10 shadow-inner">
                            <FileIcon filename={currentMedia} size={80} />
                        </div>
                        <div className="text-center space-y-4">
                            <h3 className="text-white font-black text-xl uppercase tracking-tighter truncate w-64">
                                {currentMedia.split('/').pop()?.split('?')[0] || 'Arquivo de Relatório'}
                            </h3>
                            <p className="text-white/40 text-xs font-bold uppercase tracking-[0.2em]">
                                Este formato não pode ser pré-visualizado
                            </p>
                        </div>
                        <a 
                            href={currentMedia} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="flex items-center gap-3 px-8 py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] transition-all shadow-xl shadow-indigo-500/20 active:scale-95"
                        >
                            <ExternalLink className="w-4 h-4" />
                            Abrir em Nova Aba
                        </a>
                    </div>
                )}
            </div>

            {/* Bottom Indicators */}
            {images.length > 1 && (
                <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2 z-[9999]">
                    {images.map((_, idx) => (
                        <button
                            key={idx}
                            type="button"
                            onClick={() => { setCurrentIndex(idx); handleReset(); }}
                            className={`w-2 h-2 rounded-full transition-all ${idx === currentIndex ? 'bg-white w-6' : 'bg-white/30 hover:bg-white/60'}`}
                            aria-label={`Ir para item ${idx + 1}`}
                        />
                    ))}
                </div>
            )}

            {/* Zoom Indicator */}
            {isImage && scale > 1 && (
                <div className="absolute bottom-20 left-1/2 -translate-x-1/2 px-4 py-2 bg-white/10 backdrop-blur-md rounded-full border border-white/20 text-white text-xs font-black uppercase tracking-widest shadow-2xl">
                    Zoom: {Math.round(scale * 100)}%
                </div>
            )}
        </div>
    );
};
