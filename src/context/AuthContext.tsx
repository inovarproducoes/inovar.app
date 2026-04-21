"use client";
import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";

interface Usuario {
  id: string;
  nome: string;
  email: string;
  role: string;
  foto_url?: string;
}

interface AuthContextType {
  usuario: Usuario | null;
  carregando: boolean;
  autenticado: boolean;
  login: (email: string, senha: string) => Promise<{ sucesso: boolean; erro?: string }>;
  registrar: (nome: string, email: string, senha: string) => Promise<{ sucesso: boolean; erro?: string }>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [carregando, setCarregando] = useState(true);

  const verificarSessao = useCallback(async () => {
    try {
      const res = await fetch("/api/auth/sessao");
      if (res.ok) {
        const data = await res.json();
        if (data.autenticado) {
          setUsuario(data.usuario);
        } else {
          setUsuario(null);
        }
      } else {
        setUsuario(null);
      }
    } catch {
      setUsuario(null);
    } finally {
      setCarregando(false);
    }
  }, []);

  useEffect(() => {
    verificarSessao();
  }, [verificarSessao]);

  const login = async (email: string, senha: string) => {
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, senha }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setUsuario(data.usuario);
        return { sucesso: true };
      }
      return { sucesso: false, erro: data.error ?? "Erro ao fazer login" };
    } catch {
      return { sucesso: false, erro: "Erro de conexão" };
    }
  };

  const registrar = async (nome: string, email: string, senha: string) => {
    try {
      const res = await fetch("/api/auth/registro", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nome, email, senha }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setUsuario(data.usuario);
        return { sucesso: true };
      }
      return { sucesso: false, erro: data.error ?? "Erro ao registrar" };
    } catch {
      return { sucesso: false, erro: "Erro de conexão" };
    }
  };

  const logout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    setUsuario(null);
  };

  return (
    <AuthContext.Provider
      value={{ usuario, carregando, autenticado: !!usuario, login, registrar, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth deve ser usado dentro de AuthProvider");
  return ctx;
}
