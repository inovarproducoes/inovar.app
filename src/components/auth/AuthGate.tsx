"use client";
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { Eye, EyeOff, Loader2, LogIn, UserPlus, Zap } from "lucide-react";

type Modo = "login" | "registro";

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

  if (carregando) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-violet-500/30 animate-pulse">
            <Zap className="w-8 h-8 text-white" />
          </div>
          <Loader2 className="w-5 h-5 text-muted-foreground animate-spin" />
        </div>
      </div>
    );
  }

  if (autenticado) return <>{children}</>;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErro("");

    if (modo === "registro") {
      if (senha !== confirmar) {
        setErro("As senhas não coincidem");
        return;
      }
      if (senha.length < 6) {
        setErro("A senha deve ter pelo menos 6 caracteres");
        return;
      }
    }

    setEnviando(true);
    try {
      const resultado =
        modo === "login"
          ? await login(email, senha)
          : await registrar(nome, email, senha);

      if (!resultado.sucesso) {
        setErro(resultado.erro ?? "Ocorreu um erro");
      }
    } finally {
      setEnviando(false);
    }
  };

  const trocarModo = (novoModo: Modo) => {
    setModo(novoModo);
    setErro("");
    setSenha("");
    setConfirmar("");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background relative overflow-hidden p-4">
      {/* Background decorativo */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full bg-violet-600/10 blur-3xl" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] rounded-full bg-indigo-600/10 blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full bg-violet-900/5 blur-3xl" />
      </div>

      {/* Card principal */}
      <div className="relative w-full max-w-md">
        {/* Logo e cabeçalho */}
        <div className="text-center mb-8">
          <div className="inline-flex w-20 h-20 rounded-2xl bg-gradient-to-br from-violet-600 to-indigo-600 items-center justify-center shadow-2xl shadow-violet-500/40 mb-5">
            <Zap className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-white to-white/70 bg-clip-text text-transparent">
            Inovar App
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Plataforma de Gestão Educacional
          </p>
        </div>

        {/* Tabs de Login / Registro */}
        <div className="relative bg-card/60 backdrop-blur-2xl border border-white/10 rounded-2xl p-1 flex mb-6 shadow-xl">
          <button
            type="button"
            onClick={() => trocarModo("login")}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 ${
              modo === "login"
                ? "bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-lg shadow-violet-500/30"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <LogIn className="w-4 h-4" />
            Entrar
          </button>
          <button
            type="button"
            onClick={() => trocarModo("registro")}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 ${
              modo === "registro"
                ? "bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-lg shadow-violet-500/30"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <UserPlus className="w-4 h-4" />
            Criar conta
          </button>
        </div>

        {/* Formulário */}
        <div className="bg-card/60 backdrop-blur-2xl border border-white/10 rounded-2xl p-8 shadow-2xl">
          <form onSubmit={handleSubmit} className="space-y-4">
            {modo === "registro" && (
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground/80">Nome completo</label>
                <input
                  type="text"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  placeholder="Seu nome"
                  required
                  autoComplete="name"
                  className="w-full bg-background/50 border border-white/10 rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all"
                />
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground/80">E-mail</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu@email.com"
                required
                autoComplete="email"
                className="w-full bg-background/50 border border-white/10 rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground/80">Senha</label>
              <div className="relative">
                <input
                  type={mostrarSenha ? "text" : "password"}
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  placeholder={modo === "registro" ? "Mínimo 6 caracteres" : "Digite sua senha"}
                  required
                  autoComplete={modo === "login" ? "current-password" : "new-password"}
                  className="w-full bg-background/50 border border-white/10 rounded-xl px-4 py-3 pr-12 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all"
                />
                <button
                  type="button"
                  onClick={() => setMostrarSenha(!mostrarSenha)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors p-1"
                >
                  {mostrarSenha ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {modo === "registro" && (
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground/80">Confirmar senha</label>
                <input
                  type={mostrarSenha ? "text" : "password"}
                  value={confirmar}
                  onChange={(e) => setConfirmar(e.target.value)}
                  placeholder="Repita a senha"
                  required
                  autoComplete="new-password"
                  className="w-full bg-background/50 border border-white/10 rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all"
                />
              </div>
            )}

            {erro && (
              <div className="bg-destructive/10 border border-destructive/30 rounded-xl px-4 py-3 text-sm text-destructive">
                {erro}
              </div>
            )}

            <button
              type="submit"
              disabled={enviando}
              className="w-full bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 disabled:opacity-60 text-white font-semibold py-3 rounded-xl transition-all duration-300 shadow-lg shadow-violet-500/30 hover:shadow-violet-500/50 hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-2 mt-2"
            >
              {enviando ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  {modo === "login" ? "Entrando..." : "Criando conta..."}
                </>
              ) : modo === "login" ? (
                <>
                  <LogIn className="w-4 h-4" />
                  Entrar no painel
                </>
              ) : (
                <>
                  <UserPlus className="w-4 h-4" />
                  Criar minha conta
                </>
              )}
            </button>
          </form>
        </div>

        <p className="text-center text-xs text-muted-foreground/50 mt-6">
          © {new Date().getFullYear()} Inovar.app · Gestão Educacional
        </p>
      </div>
    </div>
  );
}
