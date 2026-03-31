"use client";
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { AuroraBackground } from "@/components/layout/AuroraBackground";
import { Eye, EyeOff, Loader2, LogIn, UserPlus } from "lucide-react";

type Modo = "login" | "registro";

/* ─── Orb orbital animado ─────────────────────────────────────── */
function OrbCore() {
  return (
    <div className="flex justify-center mb-10 relative">
      <div className="relative" style={{ width: 80, height: 80 }}>
        {/* Órbita externa */}
        <div
          className="orbit-spin-reverse absolute rounded-full border"
          style={{
            inset: -44,
            borderColor: "rgba(110,59,216,0.2)",
          }}
        >
          <span
            style={{
              position: "absolute",
              width: 8, height: 8,
              borderRadius: "50%",
              background: "#6e3bd8",
              boxShadow: "0 0 10px #6e3bd8",
              top: -4, left: "50%",
              transform: "translateX(-50%)",
            }}
          />
        </div>

        {/* Órbita interna */}
        <div
          className="orbit-spin absolute rounded-full border"
          style={{ inset: -24, borderColor: "rgba(74,75,215,0.3)" }}
        >
          <span
            style={{
              position: "absolute",
              width: 8, height: 8,
              borderRadius: "50%",
              background: "#4a4bd7",
              boxShadow: "0 0 10px #4a4bd7",
              top: -4, left: "50%",
              transform: "translateX(-50%)",
            }}
          />
        </div>

        {/* Núcleo */}
        <div
          className="orb-pulse relative z-10 w-20 h-20 rounded-full flex items-center justify-center"
          style={{
            background: "linear-gradient(135deg, #4a4bd7, #6e3bd8)",
          }}
        >
          <svg width="36" height="36" viewBox="0 0 24 24" fill="white">
            <path d="M12 2.5l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17.4l-6.2 4.5 2.4-7.4L2 9.9h7.6z"/>
          </svg>
        </div>
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
        <div key={b.label} className="flex items-center gap-1.5" style={{ color: "rgba(144,144,176,0.7)", fontSize: 11 }}>
          <span style={{ fontSize: 12 }}>{b.icon}</span>
          <span style={{ letterSpacing: "0.05em" }}>{b.label}</span>
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
        style={{ background: "#07080f" }}
      >
        <AuroraBackground />
        <div
          className="glitch-text font-syne font-extrabold z-10 mb-10"
          style={{
            fontSize: 28,
            background: "linear-gradient(135deg, #fff, #a0a0ff)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          Inovar OS
        </div>
        <div className="z-10 relative mb-8" style={{ width: 56, height: 56 }}>
          <div style={{
            position: "absolute", inset: 0, borderRadius: "50%",
            border: "2px solid rgba(74,75,215,0.15)",
          }} />
          <div style={{
            position: "absolute", inset: 0, borderRadius: "50%",
            border: "2px solid transparent",
            borderTopColor: "#4a4bd7", borderRightColor: "#6e3bd8",
            animation: "spinRing 1s cubic-bezier(0.4,0,0.2,1) infinite",
          }} />
          <style>{`@keyframes spinRing { to { transform: rotate(360deg); } }`}</style>
        </div>
        <p className="z-10 font-mono text-xs uppercase tracking-widest"
          style={{ color: "rgba(144,144,176,0.6)", letterSpacing: "0.15em" }}>
          Verificando sessão...
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
    font-dm text-sm pl-12 pr-4 py-3.5 rounded-xl
  `;
  const inputStyle = {
    background: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(255,255,255,0.08)",
    color: "#f0f0ff",
    fontFamily: "'DM Sans', sans-serif",
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden"
      style={{ background: "#07080f" }}>
      <AuroraBackground />

      <div className="relative z-10 w-full" style={{ maxWidth: 440 }}>
        {/* Orb */}
        <OrbCore />

        {/* Brand */}
        <div className="text-center mb-9">
          <h1
            className="glitch-text font-syne"
            style={{
              fontSize: 38, fontWeight: 800,
              background: "linear-gradient(135deg, #fff 0%, #a0a0ff 50%, #6e3bd8 100%)",
              WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
              letterSpacing: "-1px", lineHeight: 1,
            }}
          >
            Inovar OS
          </h1>
          <p style={{ color: "#9090b0", fontSize: 13, marginTop: 6, letterSpacing: "0.05em" }}>
            Next Generation Enterprise Platform
          </p>
        </div>

        {/* Tabs */}
        <div
          className="flex p-1 rounded-2xl mb-6"
          style={{
            background: "rgba(13,15,30,0.8)",
            border: "1px solid rgba(255,255,255,0.08)",
            backdropFilter: "blur(20px)",
          }}
        >
          {(["login", "registro"] as Modo[]).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => trocarModo(m)}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300"
              style={modo === m ? {
                background: "linear-gradient(135deg, #4a4bd7, #6e3bd8)",
                color: "white",
                boxShadow: "0 4px 20px rgba(74,75,215,0.4)",
                fontFamily: "'Syne', sans-serif",
              } : { color: "#9090b0", fontFamily: "'Syne', sans-serif" }}
            >
              {m === "login" ? <LogIn size={15} /> : <UserPlus size={15} />}
              {m === "login" ? "Entrar" : "Criar conta"}
            </button>
          ))}
        </div>

        {/* Glass card */}
        <div className="glass-card p-10">
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            {/* Nome — só no registro */}
            {modo === "registro" && (
              <div>
                <label style={{ display: "block", fontSize: 11, fontWeight: 500, color: "#9090b0", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 8 }}>
                  Nome completo
                </label>
                <div style={{ position: "relative" }}>
                  <span style={{ position: "absolute", left: 16, top: "50%", transform: "translateY(-50%)", color: "#5a5a7a", fontSize: 16 }}>👤</span>
                  <input
                    type="text" value={nome} onChange={e => setNome(e.target.value)}
                    placeholder="Seu nome" required autoComplete="name"
                    className={inputCls} style={inputStyle}
                    onFocus={e => { e.currentTarget.style.borderColor = "rgba(74,75,215,0.6)"; e.currentTarget.style.boxShadow = "0 0 0 4px rgba(74,75,215,0.1), 0 0 20px rgba(74,75,215,0.12)"; }}
                    onBlur={e  => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)"; e.currentTarget.style.boxShadow = "none"; }}
                  />
                </div>
              </div>
            )}

            {/* E-mail */}
            <div>
              <label style={{ display: "block", fontSize: 11, fontWeight: 500, color: "#9090b0", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 8 }}>
                {modo === "login" ? "Email corporativo" : "E-mail"}
              </label>
              <div style={{ position: "relative" }}>
                <span style={{ position: "absolute", left: 16, top: "50%", transform: "translateY(-50%)", color: "#5a5a7a", fontSize: 16 }}>✉️</span>
                <input
                  type="email" value={email} onChange={e => setEmail(e.target.value)}
                  placeholder="voce@inovar.io" required autoComplete="email"
                  className={inputCls} style={inputStyle}
                  onFocus={e => { e.currentTarget.style.borderColor = "rgba(74,75,215,0.6)"; e.currentTarget.style.boxShadow = "0 0 0 4px rgba(74,75,215,0.1), 0 0 20px rgba(74,75,215,0.12)"; }}
                  onBlur={e  => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)"; e.currentTarget.style.boxShadow = "none"; }}
                />
              </div>
            </div>

            {/* Senha */}
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                <label style={{ fontSize: 11, fontWeight: 500, color: "#9090b0", letterSpacing: "0.08em", textTransform: "uppercase" }}>
                  Senha
                </label>
                {modo === "login" && (
                  <a href="#" style={{ fontSize: 11, color: "#8083ff", textDecoration: "none" }}>Esqueceu?</a>
                )}
              </div>
              <div style={{ position: "relative" }}>
                <span style={{ position: "absolute", left: 16, top: "50%", transform: "translateY(-50%)", color: "#5a5a7a", fontSize: 16 }}>🔒</span>
                <input
                  type={mostrarSenha ? "text" : "password"}
                  value={senha} onChange={e => setSenha(e.target.value)}
                  placeholder={modo === "registro" ? "Mínimo 6 caracteres" : "••••••••••••"}
                  required autoComplete={modo === "login" ? "current-password" : "new-password"}
                  className={inputCls} style={{ ...inputStyle, paddingRight: "3rem" }}
                  onFocus={e => { e.currentTarget.style.borderColor = "rgba(74,75,215,0.6)"; e.currentTarget.style.boxShadow = "0 0 0 4px rgba(74,75,215,0.1), 0 0 20px rgba(74,75,215,0.12)"; }}
                  onBlur={e  => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)"; e.currentTarget.style.boxShadow = "none"; }}
                />
                <button type="button" onClick={() => setMostrarSenha(!mostrarSenha)}
                  style={{ position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", color: "#5a5a7a", cursor: "pointer", display: "flex", alignItems: "center" }}>
                  {mostrarSenha ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Confirmar senha */}
            {modo === "registro" && (
              <div>
                <label style={{ display: "block", fontSize: 11, fontWeight: 500, color: "#9090b0", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 8 }}>
                  Confirmar senha
                </label>
                <div style={{ position: "relative" }}>
                  <span style={{ position: "absolute", left: 16, top: "50%", transform: "translateY(-50%)", color: "#5a5a7a", fontSize: 16 }}>🔒</span>
                  <input
                    type={mostrarSenha ? "text" : "password"}
                    value={confirmar} onChange={e => setConfirmar(e.target.value)}
                    placeholder="Repita a senha" required autoComplete="new-password"
                    className={inputCls} style={inputStyle}
                    onFocus={e => { e.currentTarget.style.borderColor = "rgba(74,75,215,0.6)"; e.currentTarget.style.boxShadow = "0 0 0 4px rgba(74,75,215,0.1), 0 0 20px rgba(74,75,215,0.12)"; }}
                    onBlur={e  => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)"; e.currentTarget.style.boxShadow = "none"; }}
                  />
                </div>
              </div>
            )}

            {/* Erro */}
            {erro && (
              <div style={{ background: "rgba(172,49,73,0.12)", border: "1px solid rgba(172,49,73,0.3)", borderRadius: 10, padding: "10px 14px", fontSize: 13, color: "#f76a80" }}>
                {erro}
              </div>
            )}

            {/* Botão */}
            <button
              type="submit"
              disabled={enviando}
              className="w-full flex items-center justify-center gap-2 font-syne font-bold rounded-xl py-4 transition-all duration-300 mt-1"
              style={{
                background: "linear-gradient(135deg, #4a4bd7, #6e3bd8)",
                color: "white", fontSize: 15, letterSpacing: "0.05em",
                boxShadow: "0 8px 32px rgba(74,75,215,0.45)",
                cursor: enviando ? "not-allowed" : "pointer",
                opacity: enviando ? 0.7 : 1,
              }}
              onMouseEnter={e => { if (!enviando) { (e.currentTarget as HTMLElement).style.transform = "translateY(-2px)"; (e.currentTarget as HTMLElement).style.boxShadow = "0 12px 48px rgba(74,75,215,0.65)"; } }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = ""; (e.currentTarget as HTMLElement).style.boxShadow = "0 8px 32px rgba(74,75,215,0.45)"; }}
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
        <p className="text-center mt-6" style={{ color: "#5a5a7a", fontSize: 13 }}>
          {modo === "login"
            ? <>Novo na plataforma? <button onClick={() => trocarModo("registro")} style={{ color: "#8083ff", background: "none", border: "none", cursor: "pointer", fontWeight: 500 }}>Criar conta</button></>
            : <>Já tem conta? <button onClick={() => trocarModo("login")} style={{ color: "#8083ff", background: "none", border: "none", cursor: "pointer", fontWeight: 500 }}>Entrar</button></>
          }
        </p>

        <TrustBadges />

        <p className="text-center mt-6" style={{ color: "rgba(90,90,122,0.4)", fontSize: 11 }}>
          © {new Date().getFullYear()} Inovar.app · Gestão Educacional
        </p>
      </div>
    </div>
  );
}
