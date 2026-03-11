"use client";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";

export function AuthGate({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const isAuth = sessionStorage.getItem("inovar_auth") === "true";
    if (isAuth || pathname === "/documentacao") {
      setIsAuthenticated(true);
    }
  }, [pathname]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === "inovar2025") {
      sessionStorage.setItem("inovar_auth", "true");
      setIsAuthenticated(true);
    } else {
      setError(true);
    }
  };

  if (isAuthenticated) return <>{children}</>;

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="bg-card w-full max-w-md p-8 rounded-xl shadow border">
        <h1 className="text-2xl font-bold text-center mb-6">Login Inovar App</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Senha de Acesso</label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full flex h-10 rounded-md border border-input bg-transparent px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              placeholder="Digite a senha"
            />
            {error && <p className="text-destructive text-sm mt-1">Senha incorreta. Tente novamente.</p>}
          </div>
          <button type="submit" className="w-full h-10 pb-2 pt-2 bg-primary text-primary-foreground font-medium rounded-md hover:bg-primary/90">
            Entrar
          </button>
        </form>
      </div>
    </div>
  );
}
