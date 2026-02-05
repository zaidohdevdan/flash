import { useEffect, useRef } from 'react';
import { useReducedMotion } from 'framer-motion';

export const ParticleBackground = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const shouldReduceMotion = useReducedMotion();

    useEffect(() => {
        if (shouldReduceMotion) return; // Disable particles if reduced motion is on

        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let animationFrameId: number;
        let particles: Particle[] = [];
        let mouseX = -1000;
        let mouseY = -1000;

        const resizeCanvas = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            initParticles();
        };

        class Particle {
            x: number;
            y: number;
            vx: number;
            vy: number;
            size: number;

            constructor() {
                this.x = Math.random() * (canvas?.width || 0);
                this.y = Math.random() * (canvas?.height || 0);
                this.vx = (Math.random() - 0.5) * 0.5;
                this.vy = (Math.random() - 0.5) * 0.5;
                this.size = Math.random() * 2;
            }

            update() {
                this.x += this.vx;
                this.y += this.vy;

                if (canvas && (this.x < 0 || this.x > canvas.width)) this.vx *= -1;
                if (canvas && (this.y < 0 || this.y > canvas.height)) this.vy *= -1;
            }

            draw() {
                if (!ctx) return;
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                ctx.fillStyle = 'rgba(59, 130, 246, 0.5)'; // Blue-500 equivalent
                ctx.fill();
            }
        }

        const initParticles = () => {
            particles = [];
            const particleCount = window.innerWidth < 768 ? 50 : 100;
            for (let i = 0; i < particleCount; i++) {
                particles.push(new Particle());
            }
        };

        const animate = () => {
            if (!ctx || !canvas) return;
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            particles.forEach((particle, index) => {
                particle.update();
                particle.draw();

                // Connect particles close to each other
                for (let j = index; j < particles.length; j++) {
                    const dx = particles[j].x - particle.x;
                    const dy = particles[j].y - particle.y;
                    const distance = Math.sqrt(dx * dx + dy * dy);

                    if (distance < 100) {
                        ctx.beginPath();
                        ctx.strokeStyle = `rgba(59, 130, 246, ${0.1 - distance / 1000})`;
                        ctx.lineWidth = 1;
                        ctx.moveTo(particle.x, particle.y);
                        ctx.lineTo(particles[j].x, particles[j].y);
                        ctx.stroke();
                    }
                }

                // Connect particles to mouse
                const dx = mouseX - particle.x;
                const dy = mouseY - particle.y;
                const distance = Math.sqrt(dx * dx + dy * dy);

                if (distance < 150) {
                    ctx.beginPath();
                    ctx.strokeStyle = `rgba(147, 51, 234, ${0.2 - distance / 750})`; // Purple connection
                    ctx.lineWidth = 1; // Thicker connection to mouse
                    ctx.moveTo(particle.x, particle.y);
                    ctx.lineTo(mouseX, mouseY);
                    ctx.stroke();
                }
            });

            animationFrameId = requestAnimationFrame(animate);
        };

        const handleMouseMove = (e: MouseEvent) => {
            mouseX = e.clientX;
            mouseY = e.clientY;
        };

        window.addEventListener('resize', resizeCanvas);
        window.addEventListener('mousemove', handleMouseMove);

        resizeCanvas();
        animate();

        return () => {
            window.removeEventListener('resize', resizeCanvas);
            window.removeEventListener('mousemove', handleMouseMove);
            cancelAnimationFrame(animationFrameId);
        };
    });

    if (shouldReduceMotion) return null;

    return (
        <canvas
            ref={canvasRef}
            className="fixed inset-0 z-0 pointer-events-none opacity-40"
        />
    );
};
