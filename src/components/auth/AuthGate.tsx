"use client";
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { AuroraBackground } from "@/components/layout/AuroraBackground";
import { Eye, EyeOff, Loader2, LogIn, UserPlus } from "lucide-react";

type Modo = "login" | "registro";

/* ─── Logo Elegante do App (Branding Roxo) ─── */
import { Sparkles } from "lucide-react";

function EventLogo() {
  return (
    <div className="flex justify-center mb-8 relative">
       <div className="relative w-24 h-24 rounded-full flex items-center justify-center border-4 border-primary/5 bg-gradient-to-tr from-[#7D539F] to-[#a886c5] shadow-[0_0_40px_rgba(125,83,159,0.2)] backdrop-blur-md">
          <Sparkles className="text-white w-10 h-10 animate-pulse" />
       </div>
    </div>
  );
}

/* ─── Trust badges ────────────────────────────────────────────── */
function TrustBadges() {
  const badges = [
    { label: "AES-256", icon: "🔒" },
    { label: "99.9% Up",  icon: "☁️" },
    { label: "SOC 2",    icon: "🛡️" },
  ];
  return (
    <div className="flex justify-center gap-6 mt-7">
      {badges.map((b) => (
        <div key={b.label} className="flex items-center gap-1.5" style={{ color: "#6b7280", fontSize: 11 }}>
          <span style={{ fontSize: 12 }}>{b.icon}</span>
          <span style={{ letterSpacing: "0.05em", fontWeight: 600 }}>{b.label}</span>
        </div>
      ))}
    </div>
  );
}

/* ─── Main AuthGate ───────────────────────────────────────────── */
export function AuthGate({ children }: { children: React.ReactNode }) {
  const { autenticado, carregando, login, registrar } = useAuth();

  const [modo, setModo] = useState<Modo>("login");
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [confirmar, setConfirmar] = useState("");
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState("");

  /* ── Loading ── */
  if (carregando) {
    return (
      <div
        className="min-h-screen flex flex-col items-center justify-center"
        style={{ background: "#F8F9FA" }}
      >
        <AuroraBackground />
        <div
          className="glitch-text font-syne font-extrabold z-10 mb-10"
          style={{
            fontSize: 28,
            background: "linear-gradient(135deg, #7D539F, #4a4bd7)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          Inovar OS
        </div>
        <div className="z-10 relative mb-8" style={{ width: 56, height: 56 }}>
          <div style={{
            position: "absolute", inset: 0, borderRadius: "50%",
            border: "2px solid rgba(125,83,159,0.1)",
          }} />
          <div style={{
            position: "absolute", inset: 0, borderRadius: "50%",
            border: "2px solid transparent",
            borderTopColor: "#7D539F", borderRightColor: "#a886c5",
            animation: "spinRing 1s cubic-bezier(0.4,0,0.2,1) infinite",
          }} />
          <style>{`@keyframes spinRing { to { transform: rotate(360deg); } }`}</style>
        </div>
        <p className="z-10 font-mono text-xs uppercase tracking-widest text-muted-foreground"
          style={{ letterSpacing: "0.15em" }}>
          Sincronizando ambiente...
        </p>
      </div>
    );
  }

  if (autenticado) return <>{children}</>;

  /* ── Form submit ── */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErro("");

    if (modo === "registro") {
      if (senha !== confirmar) { setErro("As senhas não coincidem"); return; }
      if (senha.length < 6)    { setErro("Mínimo 6 caracteres"); return; }
    }

    setEnviando(true);
    const res = modo === "login"
      ? await login(email, senha)
      : await registrar(nome, email, senha);
    if (!res.sucesso) setErro(res.erro ?? "Ocorreu um erro");
    setEnviando(false);
  };

  const trocarModo = (m: Modo) => { setModo(m); setErro(""); setSenha(""); setConfirmar(""); };

  /* ── Shared input style ── */
  const inputCls = `
    w-full outline-none transition-all duration-300
    font-dm text-sm pl-12 pr-4 py-3.5 rounded-2xl
  `;
  const inputStyle = {
    background: "rgba(0,0,0,0.03)",
    border: "1px solid rgba(0,0,0,0.05)",
    color: "#1e293b",
    fontFamily: "'DM Sans', sans-serif",
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden"
      style={{ background: "#F8F9FA" }}>
      <div className="absolute inset-0 opacity-40">
        <AuroraBackground />
      </div>

      <div className="relative z-10 w-full" style={{ maxWidth: 440 }}>
        {/* Event Logo */}
        <EventLogo />

        {/* Brand */}
        <div className="text-center mb-9">
          <h1
            className="glitch-text font-syne"
            style={{
              fontSize: 42, fontWeight: 800,
              background: "linear-gradient(135deg, #7D539F 0%, #4a4bd7 100%)",
              WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
              letterSpacing: "-1.5px", lineHeight: 1,
            }}
          >
            Inovar OS
          </h1>
          <p style={{ color: "#64748b", fontSize: 13, marginTop: 10, letterSpacing: "0.1em", fontWeight: 700, textTransform: "uppercase" }}>
            Event Management Premium
          </p>
        </div>

        {/* Tabs */}
        <div
          className="flex p-1.5 rounded-2xl mb-6"
          style={{
            background: "rgba(255,255,255,0.8)",
            border: "1px solid rgba(0,0,0,0.05)",
            backdropFilter: "blur(20px)",
            boxShadow: "0 4px 24px rgba(0,0,0,0.04)"
          }}
        >
          {(["login", "registro"] as Modo[]).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => trocarModo(m)}
              className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition-all duration-300"
              style={modo === m ? {
                background: "#7D539F",
                color: "white",
                boxShadow: "0 4px 20px rgba(125,83,159,0.3)",
                fontFamily: "'Syne', sans-serif",
              } : { color: "#64748b", fontFamily: "'Syne', sans-serif" }}
            >
              {m === "login" ? <LogIn size={15} /> : <UserPlus size={15} />}
              {m === "login" ? "Entrar" : "Criar conta"}
            </button>
          ))}
        </div>

        {/* Glass card */}
        <div className="bg-white/80 backdrop-blur-2xl border border-white p-10 rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.05)]">
          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            {/* Nome — só no registro */}
            {modo === "registro" && (
              <div>
                <label style={{ display: "block", fontSize: 10, fontWeight: 800, color: "#64748b", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 10 }}>
                  Nome completo
                </label>
                <div style={{ position: "relative" }}>
                   <span style={{ position: "absolute", left: 16, top: "50%", transform: "translateY(-50%)", color: "#94a3b8", fontSize: 16 }}>👤</span>
                  <input
                    type="text" value={nome} onChange={e => setNome(e.target.value)}
                    placeholder="Seu nome" required autoComplete="name"
                    className={inputCls} style={inputStyle}
                    onFocus={e => { e.currentTarget.style.borderColor = "#7D539F"; e.currentTarget.style.background = "#fff"; e.currentTarget.style.boxShadow = "0 0 0 4px rgba(125,83,159,0.1)"; }}
                    onBlur={e  => { e.currentTarget.style.borderColor = "rgba(0,0,0,0.05)"; e.currentTarget.style.background = "rgba(0,0,0,0.03)"; e.currentTarget.style.boxShadow = "none"; }}
                  />
                </div>
              </div>
            )}

            {/* E-mail */}
            <div>
              <label style={{ display: "block", fontSize: 10, fontWeight: 800, color: "#64748b", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 10 }}>
                {modo === "login" ? "Email corporativo" : "E-mail"}
              </label>
              <div style={{ position: "relative" }}>
                <span style={{ position: "absolute", left: 16, top: "50%", transform: "translateY(-50%)", color: "#94a3b8", fontSize: 16 }}>✉️</span>
                <input
                  type="email" value={email} onChange={e => setEmail(e.target.value)}
                  placeholder="voce@inovar.io" required autoComplete="email"
                  className={inputCls} style={inputStyle}
                  onFocus={e => { e.currentTarget.style.borderColor = "#7D539F"; e.currentTarget.style.background = "#fff"; e.currentTarget.style.boxShadow = "0 0 0 4px rgba(125,83,159,0.1)"; }}
                  onBlur={e  => { e.currentTarget.style.borderColor = "rgba(0,0,0,0.05)"; e.currentTarget.style.background = "rgba(0,0,0,0.03)"; e.currentTarget.style.boxShadow = "none"; }}
                />
              </div>
            </div>

            {/* Senha */}
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                <label style={{ fontSize: 10, fontWeight: 800, color: "#64748b", letterSpacing: "0.1em", textTransform: "uppercase" }}>
                  Senha
                </label>
                {modo === "login" && (
                  <a href="#" style={{ fontSize: 11, color: "#7D539F", textDecoration: "none", fontWeight: 700 }}>Esqueceu?</a>
                )}
              </div>
              <div style={{ position: "relative" }}>
                <span style={{ position: "absolute", left: 16, top: "50%", transform: "translateY(-50%)", color: "#94a3b8", fontSize: 16 }}>🔒</span>
                <input
                  type={mostrarSenha ? "text" : "password"}
                  value={senha} onChange={e => setSenha(e.target.value)}
                  placeholder={modo === "registro" ? "Mínimo 6 caracteres" : "••••••••••••"}
                  required autoComplete={modo === "login" ? "current-password" : "new-password"}
                  className={inputCls} style={{ ...inputStyle, paddingRight: "3rem" }}
                  onFocus={e => { e.currentTarget.style.borderColor = "#7D539F"; e.currentTarget.style.background = "#fff"; e.currentTarget.style.boxShadow = "0 0 0 4px rgba(125,83,159,0.1)"; }}
                  onBlur={e  => { e.currentTarget.style.borderColor = "rgba(0,0,0,0.05)"; e.currentTarget.style.background = "rgba(0,0,0,0.03)"; e.currentTarget.style.boxShadow = "none"; }}
                />
                <button type="button" onClick={() => setMostrarSenha(!mostrarSenha)}
                  style={{ position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", color: "#94a3b8", cursor: "pointer", display: "flex", alignItems: "center" }}>
                  {mostrarSenha ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Confirmar senha */}
            {modo === "registro" && (
              <div>
                <label style={{ display: "block", fontSize: 10, fontWeight: 800, color: "#64748b", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 10 }}>
                  Confirmar senha
                </label>
                <div style={{ position: "relative" }}>
                  <span style={{ position: "absolute", left: 16, top: "50%", transform: "translateY(-50%)", color: "#94a3b8", fontSize: 16 }}>🔒</span>
                  <input
                    type={mostrarSenha ? "text" : "password"}
                    value={confirmar} onChange={e => setConfirmar(e.target.value)}
                    placeholder="Repita a senha" required autoComplete="new-password"
                    className={inputCls} style={inputStyle}
                    onFocus={e => { e.currentTarget.style.borderColor = "#7D539F"; e.currentTarget.style.background = "#fff"; e.currentTarget.style.boxShadow = "0 0 0 4px rgba(125,83,159,0.1)"; }}
                    onBlur={e  => { e.currentTarget.style.borderColor = "rgba(0,0,0,0.05)"; e.currentTarget.style.background = "rgba(0,0,0,0.03)"; e.currentTarget.style.boxShadow = "none"; }}
                  />
                </div>
              </div>
            )}

            {/* Erro */}
            {erro && (
              <div style={{ background: "#fef2f2", border: "1px solid #fee2e2", borderRadius: 12, padding: "12px 16px", fontSize: 13, color: "#ef4444", fontWeight: 600 }}>
                {erro}
              </div>
            )}

            {/* Botão */}
            <button
              type="submit"
              disabled={enviando}
              className="w-full flex items-center justify-center gap-2 font-syne font-bold rounded-2xl py-4.5 transition-all duration-300 mt-2 h-14"
              style={{
                background: "#7D539F",
                color: "white", fontSize: 15, letterSpacing: "0.05em",
                boxShadow: "0 10px 30px rgba(125,83,159,0.4)",
                cursor: enviando ? "not-allowed" : "pointer",
                opacity: enviando ? 0.7 : 1,
              }}
              onMouseEnter={e => { if (!enviando) { (e.currentTarget as HTMLElement).style.transform = "translateY(-2px)"; (e.currentTarget as HTMLElement).style.boxShadow = "0 15px 40px rgba(125,83,159,0.5)"; } }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = ""; (e.currentTarget as HTMLElement).style.boxShadow = "0 10px 30px rgba(125,83,159,0.4)"; }}
            >
              {enviando ? (
                <><Loader2 size={16} className="animate-spin" />{modo === "login" ? "Autenticando..." : "Criando conta..."}</>
              ) : modo === "login" ? (
                <><LogIn size={16} />Entrar na plataforma</>
              ) : (
                <><UserPlus size={16} />Criar minha conta</>
              )}
            </button>
          </form>
        </div>

        {/* Footer */}
        <p className="text-center mt-8" style={{ color: "#64748b", fontSize: 13, fontWeight: 600 }}>
          {modo === "login"
            ? <>Novo na plataforma? <button onClick={() => trocarModo("registro")} style={{ color: "#7D539F", background: "none", border: "none", cursor: "pointer", fontWeight: 800 }}>Criar conta</button></>
            : <>Já tem conta? <button onClick={() => trocarModo("login")} style={{ color: "#7D539F", background: "none", border: "none", cursor: "pointer", fontWeight: 800 }}>Entrar</button></>
          }
        </p>

        <TrustBadges />

        <p className="text-center mt-8 font-dm font-bold uppercase tracking-widest" style={{ color: "rgba(100,116,139,0.3)", fontSize: 10 }}>
          © {new Date().getFullYear()} Inovar.app · Premium Experience
        </p>
      </div>
    </div>
  );
}
