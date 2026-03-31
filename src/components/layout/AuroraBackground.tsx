"use client";
import { useEffect, useRef } from "react";

/* Canvas de partículas Festivas (Estilo Bokeh/Bolhas) */
function ParticleCanvas() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let W = 0, H = 0;
    // Cores quentes/festa (Dourado, Champagne, Rosê, Branco suave)
    const COLORS = ["#FDE68A", "#FBCFE8", "#FCA5A5", "#FFFBEB"];

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

    const mk = (initial = false): Particle => ({
      x: Math.random() * W,
      y: initial ? Math.random() * H : H + 10,
      vx: (Math.random() - 0.5) * 0.2,
      vy: -(Math.random() * 0.3 + 0.1), // Sobe suavemente como bolhas de champagne
      r: Math.random() * 3 + 1, // Bolhas levemente maiores
      alpha: Math.random() * 0.4 + 0.1,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      life: 0,
      maxLife: Math.random() * 400 + 300,
    });

    for (let i = 0; i < 60; i++) particles.push(mk(true));

    let raf: number;
    const draw = () => {
      ctx.clearRect(0, 0, W, H);
      for (const p of particles) {
         p.x += p.vx; 
         p.y += p.vy; 
         p.life++;
         
         // Drift suave nas laterais (vento amigável)
         p.vx += (Math.random() - 0.5) * 0.01;

         if (p.life > p.maxLife || p.x < -10 || p.x > W + 10 || p.y < -10) {
           Object.assign(p, mk());
         }

         ctx.save();
         // Fade in/out suave
         const fade = Math.sin((p.life / p.maxLife) * Math.PI);
         ctx.globalAlpha = p.alpha * fade;
         ctx.fillStyle = p.color;
         
         // Efeito Bokeh leve (desfoque suave na renderização, se possível, simulado pela opacidade)
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
      className="fixed inset-0 z-0 pointer-events-none opacity-[0.3] dark:opacity-20 mix-blend-screen"
    />
  );
}

export function AuroraBackground() {
  return (
    <>
      {/* Event Bokeh Backgrounds - Cores quentes e elegantes adaptativas */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0" aria-hidden>
        <div className="absolute top-[5%] left-[5%] w-[45vw] h-[45vw] rounded-full blur-[140px] bg-amber-500/10 dark:bg-amber-500/15 animate-aurora-drift" />
        <div className="absolute bottom-[5%] right-[10%] w-[50vw] h-[50vw] rounded-full blur-[140px] bg-rose-500/10 dark:bg-rose-500/15 animate-aurora-drift" style={{ animationDelay: '-5s' }} />
        <div className="absolute top-[40%] right-[15%] w-[35vw] h-[35vw] rounded-full blur-[120px] bg-purple-500/5 dark:bg-purple-500/15 animate-aurora-drift" style={{ animationDelay: '-10s' }} />
      </div>

      {/* Dot grid suave (Opcional, dá profundidade sem tirar o foco de festa) */}
      <div className="fixed inset-0 pointer-events-none z-0 opacity-[0.02] dark:opacity-[0.04]" 
           style={{ backgroundImage: 'radial-gradient(currentColor 1px, transparent 1px)', backgroundSize: '40px 40px' }} 
      aria-hidden />

      {/* Particles simulando decoração fina/bolhas/confete flutuante */}
      <ParticleCanvas />
    </>
  );
}

