import React, { useState, useRef, useEffect, useCallback } from 'react';
import { X, ZoomIn, ZoomOut, RotateCcw, ChevronLeft, ChevronRight } from 'lucide-react';

interface ImageZoomModalProps {
    isOpen: boolean;
    onClose: () => void;
    images: string[];
    initialIndex?: number;
}

export const ImageZoomModal: React.FC<ImageZoomModalProps> = ({ isOpen, onClose, images, initialIndex = 0 }) => {
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

    const currentImage = images[currentIndex];

    const handleZoomIn = () => setScale(prev => Math.min(prev + 0.5, 5));
    const handleZoomOut = () => setScale(prev => Math.max(prev - 0.5, 1));

    const handleMouseDown = (e: React.MouseEvent) => {
        if (scale > 1) {
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
                        aria-label="Imagem Anterior"
                    >
                        <ChevronLeft className="w-8 h-8 md:w-10 md:h-10" />
                    </button>
                    <button
                        type="button"
                        onClick={handleNext}
                        className="fixed right-4 md:right-8 top-1/2 -translate-y-1/2 p-4 text-white/50 hover:text-white hover:bg-white/10 rounded-full transition-all z-[9999]"
                        aria-label="Próxima Imagem"
                    >
                        <ChevronRight className="w-8 h-8 md:w-10 md:h-10" />
                    </button>
                </>
            )}

            {/* Image Container */}
            <div
                className={`relative w-full h-full flex items-center justify-center overflow-hidden cursor-${scale > 1 ? (isDragging ? 'grabbing' : 'grab') : 'default'}`}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
            >
                <img
                    ref={imgRef}
                    key={currentImage}
                    src={currentImage}
                    alt={`Visualização ${currentIndex + 1}`}
                    style={{
                        transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
                        transition: isDragging ? 'none' : 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                        maxWidth: '90%',
                        maxHeight: '90%',
                        objectFit: 'contain'
                    }}
                    className="rounded-2xl shadow-2xl select-none"
                    draggable={false}
                />
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
                            aria-label={`Ir para imagem ${idx + 1}`}
                        />
                    ))}
                </div>
            )}

            {/* Zoom Indicator */}
            {scale > 1 && (
                <div className="absolute bottom-20 left-1/2 -translate-x-1/2 px-4 py-2 bg-white/10 backdrop-blur-md rounded-full border border-white/20 text-white text-xs font-black uppercase tracking-widest shadow-2xl">
                    Zoom: {Math.round(scale * 100)}%
                </div>
            )}
        </div>
    );
};
