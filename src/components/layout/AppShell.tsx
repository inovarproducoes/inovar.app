"use client";
import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  Menu, X, LayoutDashboard, Briefcase,
  GraduationCap, Bell, Layout, LogOut, Archive, 
  Sun, Moon, Search,
} from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { alunosService } from "@/services/alunosService";
import { clientesService } from "@/services/clientesService";
import { usePageTitle } from "@/context/PageTitleContext";
import { useAuth } from "@/context/AuthContext";
import { AuroraBackground } from "@/components/layout/AuroraBackground";

const PREFETCH_MAP: Record<string, { queryKey: unknown[]; queryFn: () => Promise<unknown> }> = {
  "/alunos":   { queryKey: ["alunos", {}],  queryFn: () => alunosService.buscarAlunos() },
  "/clientes": { queryKey: ["clientes", ""], queryFn: () => clientesService.buscarClientes() },
};

const menuItems = [
  { name: "Dashboard",   href: "/",                icon: LayoutDashboard },
  { name: "Kanban OS",   href: "/kanban",           icon: Layout },
  { name: "OS Arquivadas", href: "/os/arquivadas",  icon: Archive },
  { name: "Alunos",      href: "/alunos",           icon: GraduationCap },
  { name: "Clientes",    href: "/clientes",         icon: Briefcase },
];

/* ─── Sidebar ─────────────────────────────────────────────────── */
function Sidebar({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const pathname   = usePathname();
  const queryClient = useQueryClient();
  const router     = useRouter();
  const { usuario, logout } = useAuth();

  const handlePrefetch = useCallback((href: string) => {
    router.prefetch(href);
    const cfg = PREFETCH_MAP[href];
    if (cfg) queryClient.prefetchQuery({ queryKey: cfg.queryKey, queryFn: cfg.queryFn });
  }, [queryClient, router]);

  const handleLogout = async () => { await logout(); };

  const initials = usuario?.nome
    ? usuario.nome.split(" ").slice(0, 2).map((w) => w[0]?.toUpperCase()).join("")
    : "?";

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm md:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`
          fixed inset-y-0 left-0 z-50 w-64 flex flex-col
          transform transition-transform duration-300 ease-in-out
          md:relative md:translate-x-0 bg-card border-r border-border
          ${isOpen ? "translate-x-0 shadow-2xl " : "-translate-x-full"}
        `}
      >
        {/* Logo */}
        <div className="h-20 flex items-center px-6 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-brand flex items-center justify-center shadow-lg shadow-primary/25">
              <span className="font-syne font-black text-white text-lg italic">I</span>
            </div>
            <div>
              <p className="font-syne font-black text-lg tracking-tight text-foreground">Inovar</p>
              <p className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground -mt-1 opacity-60">System OS</p>
            </div>
          </div>
          <button onClick={onClose} className="md:hidden ml-auto p-2 text-muted-foreground hover:bg-muted rounded-lg">
            <X size={18} />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-1 custom-scrollbar">
          {menuItems.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => { onClose(); handlePrefetch(item.href); }}
                onMouseEnter={() => handlePrefetch(item.href)}
                className={`
                  flex items-center gap-3.5 px-4 py-3 rounded-xl transition-all group font-dm text-[13.5px] font-medium
                  ${active 
                    ? "bg-primary text-white shadow-lg shadow-primary/20 " 
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  }
                `}
              >
                <item.icon size={19} className={active ? "text-white" : "group-hover:scale-110 transition-transform"} />
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* Footer User */}
        <div className="p-4 border-t border-border">
           <div className="bg-muted/50 p-4 rounded-2xl">
              <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-gradient-brand text-white font-dm font-bold flex items-center justify-center border-2 border-background shadow-inner">
                      {initials}
                  </div>
                  <div className="min-w-0">
                      <p className="font-bold text-[13px] text-foreground truncate">{usuario?.nome || "Admin User"}</p>
                      <p className="text-[10px] text-muted-foreground uppercase font-black font-mono tracking-wider">SuperAdmin</p>
                  </div>
              </div>
              <button 
                onClick={handleLogout}
                className="w-full h-10 rounded-xl bg-red-500/10 text-red-500 font-dm font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 hover:bg-red-500 hover:text-white transition-all shadow-sm"
              >
                <LogOut size={14} /> Sair do Sistema
              </button>
           </div>
        </div>
      </aside>
    </>
  );
}

/* ─── Main Shell ─────────────────────────────────────────────── */
export function AppShell({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [theme, setTheme] = useState<"light" | "dark">("dark");
  const { title } = usePageTitle();
  const [clock, setClock] = useState("--:--");

  useEffect(() => {
    const savedTheme = localStorage.getItem("inovar-theme") as "light" | "dark";
    if (savedTheme) {
      setTheme(savedTheme);
      document.documentElement.classList.toggle("dark", savedTheme === "dark");
    }

    const t = setInterval(() => {
      const now = new Date();
      setClock(now.toLocaleTimeString([], { hour: '2-digit', minute:'2-digit' }));
    }, 1000);
    return () => clearInterval(t);
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === "dark" ? "light" : "dark";
    setTheme(newTheme);
    localStorage.setItem("inovar-theme", newTheme);
    document.documentElement.classList.toggle("dark", newTheme === "dark");
  };

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <AuroraBackground />
      
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <main className="flex-1 flex flex-col min-w-0 h-full relative z-10">
        {/* Header */}
        <header className="h-20 flex items-center justify-between px-6 md:px-10 border-b border-border/50 backdrop-blur-md sticky top-0 bg-background/40">
           <div className="flex items-center gap-3">
              <button 
                onClick={() => setSidebarOpen(true)}
                className="p-2.5 rounded-xl bg-card border border-border md:hidden text-foreground shadow-sm"
              >
                <Menu size={20} />
              </button>
              <div className="hidden sm:block">
                 <h1 className="font-dm font-black text-xl tracking-tight text-foreground uppercase">{title || "Inovar OS"}</h1>
                 <p className="text-[10px] font-bold text-muted-foreground uppercase font-mono tracking-widest">{clock} • Enterprise</p>
              </div>
           </div>

           <div className="flex items-center gap-3 sm:gap-6">
              <div className="hidden lg:flex relative group">
                 <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" />
                 <input 
                    placeholder="Busca global (Alt + S)" 
                    className="h-10 pl-11 pr-4 bg-muted/40 border-none rounded-xl text-xs font-dm w-64 focus:ring-2 focus:ring-primary/20 transition-all"
                 />
              </div>

              <div className="flex items-center gap-2">
                  <button 
                    onClick={toggleTheme}
                    className="w-10 h-10 rounded-xl bg-card border border-border flex items-center justify-center text-foreground hover:bg-muted transition-all shadow-sm group"
                  >
                    {theme === "dark" ? <Sun size={18} className="group-hover:rotate-45 transition-transform" /> : <Moon size={18} className="group-hover:-rotate-12 transition-transform" />}
                  </button>
                  <button className="w-10 h-10 rounded-xl bg-card border border-border flex items-center justify-center text-foreground hover:bg-muted transition-all shadow-sm relative">
                    <Bell size={18} />
                    <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-red-500 rounded-full border-2 border-background" />
                  </button>
              </div>
           </div>
        </header>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 md:p-10 no-scrollbar custom-scrollbar relative">
          {children}
        </div>
      </main>
    </div>
  );
}
