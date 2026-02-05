import { useEffect, useState } from 'react';
import {useReducedMotion } from 'framer-motion';

export const TacticalHud = () => {
    const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
    const shouldReduceMotion = useReducedMotion();

    useEffect(() => {
        if (shouldReduceMotion) return;

        const handleMouseMove = (e: MouseEvent) => {
            setMousePos({ x: e.clientX, y: e.clientY });
        };

        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, [shouldReduceMotion]);

    if (shouldReduceMotion) return null;

    return (
        <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden mix-blend-screen opacity-40">
            {/* Corner Crosshairs */}
            <div className="absolute top-8 left-8 w-8 h-8 border-t-2 border-l-2 border-blue-500/50" />
            <div className="absolute top-8 right-8 w-8 h-8 border-t-2 border-r-2 border-blue-500/50" />
            <div className="absolute bottom-8 left-8 w-8 h-8 border-b-2 border-l-2 border-blue-500/50" />
            <div className="absolute bottom-8 right-8 w-8 h-8 border-b-2 border-r-2 border-blue-500/50" />

            {/* Center Crosshair (follows mouse smoothly via CSS or simplified tracking) */}
            {/* Using a fixed central crosshair instead of mouse follower to avoid performance lag */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[2px] h-4 bg-blue-500/20" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-[2px] bg-blue-500/20" />

            {/* Telemetry Data - Bottom Bar */}
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-8 font-mono text-[10px] text-blue-400 tracking-widest uppercase">
                <span>SYS.NOMINAL</span>
                <span>
                    X: {mousePos.x.toString().padStart(4, '0')} | Y: {mousePos.y.toString().padStart(4, '0')}
                </span>
                <span>MESH.ACTIVE</span>
            </div>

            {/* Scanning Grid Lines (Vertical) */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(59,130,246,0.03)_1px,transparent_1px)] bg-[size:10%_100%]"></div>
        </div>
    );
};
