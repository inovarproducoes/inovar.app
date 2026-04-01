"use client";
import { useState } from "react";
import Image from "next/image";
import { useAuth } from "@/context/AuthContext";
import { AuroraBackground } from "@/components/layout/AuroraBackground";
import { Sparkles, ArrowRight, Eye, EyeOff, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

type Modo = "login" | "registro";

function InovarLogo({ className }: { className?: string }) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
       <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20 rotate-3 group-hover:rotate-6 transition-transform">
          <Sparkles className="text-white w-5 h-5" />
       </div>
       <span className="font-syne font-black text-2xl tracking-tighter text-foreground">INOVAR<span className="text-primary">.</span></span>
    </div>
  );
}

/* ────────────────────────────────────────────────────────────── */
export function AuthGate({ children }: { children: React.ReactNode }) {
  const { autenticado, carregando, login, registrar } = useAuth();

  const [modo, setModo] = useState<Modo>("login");
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState("");

  if (carregando) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#F8F9FA]">
        <AuroraBackground />
        <InovarLogo className="z-10 mb-8 animate-pulse" />
        <div className="z-10 relative mb-8" style={{ width: 44, height: 44 }}>
          <div className="absolute inset-0 rounded-full border-2 border-primary/10" />
          <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-primary animate-spin" />
        </div>
        <p className="z-10 font-dm font-bold text-[10px] uppercase tracking-[0.2em] text-muted-foreground opacity-50">Sincronizando ambiente vip...</p>
      </div>
    );
  }

  if (autenticado) return <>{children}</>;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErro("");
    setEnviando(true);
    const res = modo === "login" ? await login(email, senha) : await registrar(nome, email, senha);
    if (!res.sucesso) setErro(res.erro ?? "Ocorreu um erro");
    setEnviando(false);
  };

  const inputCls = `
     w-full h-14 bg-white border border-border/50 rounded-2xl px-5 
     text-sm font-dm outline-none focus:border-primary focus:ring-4 focus:ring-primary/5
     transition-all duration-300 placeholder:text-muted-foreground/30
  `;

  return (
    <div className="min-h-screen flex bg-white font-dm selection:bg-primary/10">
      {/* ── PAINEL ESQUERDO (Brand Story) ── */}
      <div className="hidden lg:flex relative w-[45%] xl:w-[40%] bg-zinc-950 overflow-hidden flex-col justify-between p-16">
         {/* Background Decor */}
         <div className="absolute inset-0 z-0">
            <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/40 to-black/80 z-10" />
            <Image 
              src="https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&q=80" 
              className="w-full h-full object-cover grayscale opacity-40 hover:scale-105 transition-transform duration-10000"
              alt="High-end Event"
              fill
              unoptimized
            />
         </div>

         <div className="relative z-20">
            <InovarLogo className="brightness-200" />
         </div>

         <div className="relative z-20 space-y-6">
            <div className="w-12 h-1 bg-primary rounded-full shadow-[0_0_20px_#7D539F]" />
            <h2 className="text-5xl xl:text-6xl font-syne font-black text-white leading-[1.1] tracking-tighter">
               BEM-VINDO AO <br />
               <span className="text-primary italic">INOVAR APP.</span>
            </h2>
            <p className="text-zinc-400 max-w-md leading-relaxed text-lg font-dm">
               Gestão impecável para produções de eventos que não aceitam nada menos que a perfeição estética e operacional.
            </p>
         </div>

         <div className="relative z-20 flex items-center justify-between border-t border-white/5 pt-8">
            <p className="text-[10px] text-zinc-600 font-bold uppercase tracking-widest">© 2026 INOVAR PLATFORM</p>
            <p className="text-[10px] text-zinc-600 font-bold uppercase tracking-widest">BY NETLIFE</p>
         </div>
      </div>

      {/* ── PAINEL DIREITO (Login Form) ── */}
      <div className="flex-1 flex flex-col justify-center relative bg-[#F9FAFB]/50">
         <div className="absolute inset-0 z-0 pointer-events-none opacity-[0.4]">
            <AuroraBackground />
         </div>

         <div className="w-full max-w-[440px] px-8 mx-auto relative z-10">
            <div className="relative mb-12">
               <span className="absolute -left-12 -top-12 text-[180px] font-syne font-black text-primary/[0.03] select-none pointer-events-none">I</span>
               <h3 className="text-4xl font-syne font-black text-zinc-900 tracking-tighter mb-2">ACESSO VIP</h3>
               <p className="text-zinc-500 font-medium text-sm">Bem-vindo de volta à excelência.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
               {modo === "registro" && (
                  <div className="space-y-2">
                     <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Nome do Integrante</label>
                     <input 
                       type="text" value={nome} onChange={e => setNome(e.target.value)} required
                       placeholder="Ex: Carlos Henrique" className={inputCls} 
                     />
                  </div>
               )}

               <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">E-mail Corporativo</label>
                  <input 
                    type="email" value={email} onChange={e => setEmail(e.target.value)} required
                    placeholder="exemplo@inovarapp.com" className={inputCls} 
                  />
               </div>

               <div className="space-y-2">
                  <div className="flex justify-between items-center px-1">
                     <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Senha de Acesso</label>
                  </div>
                  <div className="relative">
                     <input 
                       type={mostrarSenha ? "text" : "password"} value={senha} onChange={e => setSenha(e.target.value)} required
                       placeholder="••••••••" className={inputCls} 
                     />
                     <button type="button" onClick={() => setMostrarSenha(!mostrarSenha)} className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-300 hover:text-zinc-500 transition-colors">
                        {mostrarSenha ? <EyeOff size={18} /> : <Eye size={18} />}
                     </button>
                  </div>
               </div>

               {erro && (
                  <div className="p-4 bg-red-50 border border-red-100 rounded-2xl text-red-500 text-xs font-bold flex items-center gap-3 animate-shake">
                     <div className="w-1.5 h-1.5 rounded-full bg-red-500" /> {erro}
                  </div>
               )}

               <Button 
                  type="submit" 
                  disabled={enviando}
                  className="w-full h-16 bg-zinc-900 hover:bg-black text-white rounded-2xl font-syne font-black text-sm uppercase tracking-widest shadow-2xl shadow-black/10 flex items-center justify-center gap-3 group transition-all"
               >
                  {enviando ? <Loader2 className="animate-spin" /> : <>ACESSAR PAINEL <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" /></>}
               </Button>
            </form>

            <div className="mt-12 pt-8 border-t border-zinc-100 text-center space-y-4">
               <p className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest">
                  {modo === "login" ? "Não tem conta?" : "Já possui acesso?"} 
                  <button onClick={() => setModo(modo === "login" ? "registro" : "login")} className="ml-2 text-primary hover:underline underline-offset-4">
                     {modo === "login" ? "CADASTRAR AGORA" : "FAZER LOGIN"}
                  </button>
               </p>
               <p className="text-[9px] font-black text-zinc-300 uppercase tracking-[0.3em]">Ambiente Seguro SSL Protected</p>
            </div>
         </div>
      </div>
      <style>{`
         @keyframes shake {
            0%, 100% { transform: translateX(0); }
            20%, 60% { transform: translateX(-4px); }
            40%, 80% { transform: translateX(4px); }
         }
         .animate-shake { animation: shake 0.4s cubic-bezier(.36,.07,.19,.97) both; }
      `}</style>
    </div>
  );
}
