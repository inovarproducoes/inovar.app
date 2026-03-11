"use client";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

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
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="bg-card w-full max-w-md p-8 rounded-xl shadow border flex flex-col items-center">
        <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-6">
          <Lock className="w-8 h-8 text-primary" />
        </div>
        <h1 className="text-2xl font-bold text-center mb-2">Inovar App</h1>
        <p className="text-sm text-muted-foreground text-center mb-8">Digite a senha para acessar o painel</p>
        
        <form onSubmit={handleSubmit} className="space-y-4 w-full">
          <div>
            <Input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Digite a senha"
              autoFocus
              className="w-full text-center"
            />
            {error && <p className="text-destructive text-sm mt-2 text-center">Senha incorreta</p>}
          </div>
          <Button type="submit" className="w-full">
            Entrar
          </Button>
        </form>
      </div>
    </div>
  );
}
