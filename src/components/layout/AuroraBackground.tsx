"use client";
import { useEffect, useRef } from "react";

/* Canvas de partículas flutuantes */
function ParticleCanvas() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let W = 0, H = 0;
    const COLORS = ["#4a4bd7", "#6e3bd8", "#8083ff", "#006b62", "#00b4a0"];

    interface Particle {
      x: number; y: number;
      vx: number; vy: number;
      r: number; alpha: number;
      color: string;
      life: number; maxLife: number;
    }

    const particles: Particle[] = [];

    const resize = () => {
      W = canvas.width = window.innerWidth;
      H = canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    const mk = (): Particle => ({
      x: Math.random() * W,
      y: Math.random() * H,
      vx: (Math.random() - 0.5) * 0.3,
      vy: (Math.random() - 0.5) * 0.3,
      r: Math.random() * 1.5 + 0.5,
      alpha: Math.random() * 0.35 + 0.08,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      life: 0,
      maxLife: Math.random() * 300 + 200,
    });

    for (let i = 0; i < 70; i++) particles.push(mk());

    let raf: number;
    const draw = () => {
      ctx.clearRect(0, 0, W, H);
      for (const p of particles) {
        p.x += p.vx; p.y += p.vy; p.life++;
        if (p.life > p.maxLife || p.x < 0 || p.x > W || p.y < 0 || p.y > H) {
          Object.assign(p, mk());
        }
        ctx.save();
        ctx.globalAlpha = p.alpha * (1 - p.life / p.maxLife);
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
      raf = requestAnimationFrame(draw);
    };
    draw();
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={ref}
      className="fixed inset-0 z-0 pointer-events-none opacity-[0.15] dark:opacity-40"
    />
  );
}

export function AuroraBackground() {
  return (
    <>
      {/* Aurora blobs - Adaptive Colors */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0" aria-hidden>
        <div className="absolute top-[10%] left-[10%] w-[40vw] h-[40vw] rounded-full blur-[120px] bg-primary/10 dark:bg-primary/20 animate-aurora-drift" />
        <div className="absolute bottom-[10%] right-[10%] w-[40vw] h-[40vw] rounded-full blur-[120px] bg-indigo-500/10 dark:bg-indigo-500/20 animate-aurora-drift" style={{ animationDelay: '-5s' }} />
        <div className="absolute top-[40%] right-[20%] w-[30vw] h-[30vw] rounded-full blur-[120px] bg-teal-500/5 dark:bg-teal-500/15 animate-aurora-drift" style={{ animationDelay: '-10s' }} />
      </div>

      {/* Dot grid - Adaptive Color */}
      <div className="fixed inset-0 pointer-events-none z-0 opacity-[0.03] dark:opacity-[0.06]" 
           style={{ backgroundImage: 'radial-gradient(currentColor 1px, transparent 1px)', backgroundSize: '32px 32px' }} 
      aria-hidden />

      {/* Particle canvas */}
      <ParticleCanvas />
    </>
  );
}
