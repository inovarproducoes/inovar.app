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
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 4;
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
      style={{
        position: "fixed", inset: 0, zIndex: 0,
        pointerEvents: "none", opacity: 0.4,
      }}
    />
  );
}

export function AuroraBackground() {
  return (
    <>
      {/* Aurora blobs */}
      <div className="aurora" aria-hidden>
        <div className="aurora-blob" />
        <div className="aurora-blob" />
        <div className="aurora-blob" />
        <div className="aurora-blob" />
      </div>

      {/* Dot grid */}
      <div className="dot-grid" aria-hidden />

      {/* CRT scanlines */}
      <div className="scanlines" aria-hidden />

      {/* Particle canvas */}
      <ParticleCanvas />
    </>
  );
}
