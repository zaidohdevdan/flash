import createGlobe from 'cobe';
import { useEffect, useRef } from 'react';
import { useReducedMotion } from 'framer-motion';

export function Globe({ className = "" }: { className?: string }) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const shouldReduceMotion = useReducedMotion();

    useEffect(() => {
        let phi = 0;

        if (!canvasRef.current || shouldReduceMotion) return;

        const globe = createGlobe(canvasRef.current, {
            devicePixelRatio: 2,
            width: 600 * 2,
            height: 600 * 2,
            phi: 0,
            theta: 0,
            dark: 1,
            diffuse: 1.2,
            mapSamples: 16000,
            mapBrightness: 6,
            baseColor: [0.1, 0.1, 0.2], // Dark slate
            markerColor: [0.1, 0.5, 1], // Blue
            glowColor: [0.2, 0.4, 0.8], // Blue glow
            markers: [
                { location: [37.7595, -122.4367], size: 0.03 }, // San Francisco
                { location: [40.7128, -74.006], size: 0.03 }, // New York
                { location: [-23.5505, -46.6333], size: 0.1 }, // São Paulo (Base)
                { location: [51.5074, -0.1278], size: 0.03 }, // London
                { location: [35.6762, 139.6503], size: 0.03 }, // Tokyo
            ],
            onRender: (state) => {
                state.phi = phi;
                phi += 0.005;
            },
        });

        return () => {
            globe.destroy();
        };
    }, [shouldReduceMotion]);

    if (shouldReduceMotion) return (
        <div className={`flex items-center justify-center bg-blue-900/10 rounded-full ${className}`}>
            <span className="text-blue-500 font-bold">Project Orbital (Reduced Motion)</span>
        </div>
    );

    return (
        <canvas
            ref={canvasRef}
            style={{ width: 600, height: 600, maxWidth: '100%', aspectRatio: 1 }}
            className={className}
        />
    );
}
