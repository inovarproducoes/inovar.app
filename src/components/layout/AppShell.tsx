"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Menu, X, LayoutDashboard, Briefcase,
  GraduationCap, Bell, Layout, LogOut, Archive, 
  Sun, Moon, Search, MessageSquare, Settings
} from "lucide-react";
import { usePathname } from "next/navigation";
import { usePageTitle } from "@/context/PageTitleContext";
import { useAuth } from "@/context/AuthContext";
import { AuroraBackground } from "@/components/layout/AuroraBackground";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface SearchResultsState {
  alumnos: { id: string; nome: string; curso: string | null }[];
  clientes: { id: string; nome: string; empresa: string | null; telefone: string | null }[];
  os: { id: string; numero: string | null; nome: string; status: string }[];
}

const menuItems = [
  { name: "Dashboard",      href: "/",                icon: LayoutDashboard },
  { name: "Kanban OS",      href: "/kanban",           icon: Layout },
  { name: "OS Arquivadas",  href: "/os/arquivadas",    icon: Archive },
  { name: "Alunos",         href: "/alunos",           icon: GraduationCap },
  { name: "Clientes",       href: "/clientes",         icon: Briefcase },
  { name: "Histórico Chat", href: "/historico-chat",   icon: MessageSquare },
  { name: "Configurações",  href: "/configuracoes",    icon: Settings },
];

/* ─── Logo ────────────────────────────────────────────────────── */
function InovarLogo() {
  return (
    <div className="flex items-center gap-3 group">
      <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20 group-hover:rotate-3 transition-transform">
        <span className="font-syne font-black text-white text-lg leading-none">I</span>
      </div>
      <span className="font-syne font-black text-xl tracking-tighter text-foreground">INOVAR<span className="text-primary">.</span></span>
    </div>
  );
}

/* ─── Sidebar ─────────────────────────────────────────────────── */
function Sidebar({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const pathname   = usePathname();
  const { usuario, logout } = useAuth();

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
          fixed inset-y-0 left-0 z-50 w-72 flex flex-col
          transform transition-transform duration-500 ease-[cubic-bezier(0.23,1,0.32,1)]
          md:relative md:translate-x-0 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-2xl border-r border-border/40
          ${isOpen ? "translate-x-0 shadow-2xl " : "-translate-x-full"}
        `}
      >
        <div className="h-28 flex items-center px-8 relative overflow-hidden">
          <div className="absolute -top-12 -left-12 w-32 h-32 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
          <InovarLogo />
          <button onClick={onClose} className="md:hidden ml-auto p-2 text-muted-foreground hover:bg-muted rounded-xl">
            <X size={20} />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto py-6 px-6 space-y-2 custom-scrollbar">
          <p className="text-[10px] font-black uppercase tracking-[0.25em] text-muted-foreground/40 px-4 mb-4">Menu de Produção</p>
          {menuItems.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={`
                  flex items-center gap-4 px-5 py-4 rounded-2xl transition-all group font-dm text-sm font-medium
                  ${active 
                    ? "bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 shadow-xl shadow-black/10 " 
                    : "text-muted-foreground hover:bg-zinc-100 dark:hover:bg-zinc-900 hover:text-foreground"
                  }
                `}
              >
                <item.icon size={20} className={active ? "" : "group-hover:scale-110 group-hover:text-primary transition-all duration-300"} />
                {item.name}
              </Link>
            );
          })}
        </nav>

        <div className="p-6">
           <div className="bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200/50 dark:border-white/5 p-5 rounded-[2rem] relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full -mr-12 -mt-12 blur-2xl group-hover:bg-primary/10 transition-colors" />
              <div className="flex items-center gap-4 mb-5">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-brand text-white font-syne font-black flex items-center justify-center shadow-lg text-sm rotate-3">
                      {initials}
                  </div>
                  <div className="min-w-0">
                      <p className="font-syne font-bold text-sm text-foreground truncate">{usuario?.nome || "Admin User"}</p>
                      <p className="text-[9px] text-primary uppercase font-black tracking-widest">Acesso VIP Platinum</p>
                  </div>
              </div>
              <button 
                onClick={handleLogout}
                className="w-full h-11 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200/50 dark:border-white/5 text-zinc-400 font-dm font-bold text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-red-500 hover:text-white hover:border-red-500 transition-all shadow-sm"
              >
                <LogOut size={14} /> Encerrar Sessão
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
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResultsState>({ alumnos: [], clientes: [], os: [] });
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);

  useEffect(() => {
    const savedTheme = localStorage.getItem("inovar-theme") as "light" | "dark";
    if (savedTheme) {
      setTheme(savedTheme);
      document.documentElement.classList.toggle("dark", savedTheme === "dark");
    } else {
      document.documentElement.classList.add("dark");
    }

    const t = setInterval(() => {
      const now = new Date();
      setClock(now.toLocaleTimeString([], { hour: '2-digit', minute:'2-digit' }));
    }, 1000);

    const handleKeyDown = (e: KeyboardEvent) => {
       if (e.altKey && e.key === 's') { e.preventDefault(); document.getElementById('global-search-input')?.focus(); }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => { clearInterval(t); window.removeEventListener('keydown', handleKeyDown); };
  }, []);

  useEffect(() => {
    if (searchQuery.length < 2) {
      setSearchResults({ alumnos: [], clientes: [], os: [] });
      setShowResults(false);
      return;
    }
    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(searchQuery)}`);
        if (res.ok) {
           const data = await res.json();
           setSearchResults(data);
           setShowResults(true);
        }
      } catch (err) { console.error("Search error", err); } 
      finally { setIsSearching(false); }
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const toggleTheme = () => {
    const newTheme = theme === "dark" ? "light" : "dark";
    setTheme(newTheme);
    localStorage.setItem("inovar-theme", newTheme);
    document.documentElement.classList.toggle("dark", newTheme === "dark");
  };

  return (
    <div className="flex h-screen overflow-hidden bg-[#F9FAFB] dark:bg-zinc-950 font-dm">
      <AuroraBackground />
      
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <main className="flex-1 flex flex-col min-w-0 h-full relative z-10 selection:bg-primary/20">
        <header className="h-24 flex items-center justify-between px-8 md:px-12 border-b border-zinc-200/40 dark:border-white/5 backdrop-blur-2xl sticky top-0 bg-white/60 dark:bg-zinc-950/60 transition-all">
           <div className="flex items-center gap-6">
              <button 
                onClick={() => setSidebarOpen(true)}
                className="p-3 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200/50 dark:border-white/5 md:hidden text-foreground shadow-sm hover:scale-105 transition-all"
              >
                <Menu size={22} />
              </button>
              <div>
                 <h1 className="font-dm font-bold text-lg md:text-2xl tracking-tight text-zinc-900 dark:text-white leading-none mb-1">{title || "Inovar APP"}</h1>
                 <p className="text-[8px] md:text-[9px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-[0.2em] md:tracking-[0.3em] font-dm">{clock} • ENTERPRISE VIP ACCESS</p>
              </div>
           </div>

           <div className="flex items-center gap-4 sm:gap-8">
              <div className="hidden lg:flex relative group">
                 <Search size={18} className={`absolute left-4 top-1/2 -translate-y-1/2 transition-all duration-300 ${isSearching ? 'text-primary animate-pulse' : 'text-zinc-400 group-focus-within:text-primary group-focus-within:scale-110'}`} />
                 <input 
                    id="global-search-input"
                    placeholder="Busca Inteligente (Alt + S)" 
                    className="h-12 pl-12 pr-6 bg-zinc-100 dark:bg-zinc-900/50 border-none rounded-2xl text-xs font-dm w-72 focus:ring-4 focus:ring-primary/5 focus:bg-white dark:focus:bg-zinc-900 transition-all text-foreground placeholder:text-zinc-400/70"
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    onFocus={() => searchQuery.length >= 2 && setShowResults(true)}
                 />

                 {showResults && (
                    <div className="absolute top-14 left-0 w-[440px] bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 shadow-2xl rounded-[2rem] p-6 z-50 animate-in fade-in zoom-in-95 duration-200">
                        <div className="flex justify-between items-center mb-6">
                           <h4 className="text-[10px] font-black uppercase tracking-[0.25em] text-zinc-400">Resultados da Central</h4>
                           <button onClick={() => setShowResults(false)} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-zinc-100 dark:hover:bg-white/10 text-zinc-400 transition-colors"><X size={16}/></button>
                        </div>
                        
                        <div className="space-y-8 max-h-[450px] overflow-y-auto no-scrollbar pr-2">
                           {searchResults.os.length > 0 && (
                               <div className="space-y-3">
                                  <div className="flex items-center gap-2 mb-2 px-1">
                                     <Layout size={14} className="text-primary"/>
                                     <span className="text-[10px] font-black uppercase tracking-widest text-primary">Ordens de Serviço</span>
                                  </div>
                                  <div className="grid gap-2">
                                     {searchResults.os.map((os) => (
                                        <Link key={os.id} href="/kanban" onClick={() => setShowResults(false)} className="flex items-center justify-between p-4 bg-zinc-50 dark:bg-white/5 hover:bg-primary/5 dark:hover:bg-primary/10 rounded-2xl transition-all group">
                                           <div className="flex items-center gap-4">
                                              <div className="w-10 h-10 rounded-xl bg-white dark:bg-zinc-900 flex items-center justify-center shadow-sm font-syne font-bold text-[10px] text-primary group-hover:scale-110 transition-transform">OS</div>
                                              <div className="flex flex-col">
                                                 <span className="text-sm font-bold text-zinc-900 dark:text-zinc-100">#{os.numero || os.id.split('-')[0]}</span>
                                                 <span className="text-[11px] text-zinc-500 truncate w-40">{os.nome}</span>
                                              </div>
                                           </div>
                                           <span className="text-[9px] px-2 py-1 bg-primary/10 text-primary rounded-lg font-black uppercase tracking-widest">{os.status}</span>
                                        </Link>
                                     ))}
                                  </div>
                               </div>
                           )}

                           {searchResults.alumnos.length > 0 && (
                               <div className="space-y-3">
                                  <div className="flex items-center gap-2 mb-2 px-1">
                                     <GraduationCap size={14} className="text-violet-500"/>
                                     <span className="text-[10px] font-black uppercase tracking-widest text-violet-500">Alunos Cadastrados</span>
                                  </div>
                                  <div className="grid gap-2">
                                     {searchResults.alumnos.map((aluno) => (
                                        <Link key={aluno.id} href="/alunos" onClick={() => setShowResults(false)} className="flex items-center gap-4 p-4 hover:bg-zinc-50 dark:hover:bg-white/5 rounded-2xl transition-all group">
                                           <Avatar className="h-10 w-10 rounded-xl">
                                              <AvatarFallback className="bg-violet-500/10 text-violet-500 text-xs font-black">{aluno.nome.charAt(0)}</AvatarFallback>
                                           </Avatar>
                                           <div className="flex flex-col">
                                              <span className="text-sm font-bold text-zinc-800 dark:text-zinc-100 group-hover:text-violet-500 transition-colors uppercase">{aluno.nome}</span>
                                              <span className="text-[10px] text-zinc-500">{aluno.curso}</span>
                                           </div>
                                        </Link>
                                     ))}
                                  </div>
                               </div>
                           )}

                           {searchResults.clientes.length > 0 && (
                               <div className="space-y-3">
                                  <div className="flex items-center gap-2 mb-2 px-1">
                                     <Briefcase size={14} className="text-emerald-500"/>
                                     <span className="text-[10px] font-black uppercase tracking-widest text-emerald-500">Parceiros & Clientes</span>
                                  </div>
                                  <div className="grid gap-2">
                                     {searchResults.clientes.map((cli) => (
                                        <Link key={cli.id} href="/clientes" onClick={() => setShowResults(false)} className="flex items-center gap-4 p-4 hover:bg-zinc-50 dark:hover:bg-white/5 rounded-2xl transition-all group">
                                           <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 text-xs font-black uppercase">
                                              {cli.nome.charAt(0)}
                                           </div>
                                           <div className="flex flex-col">
                                              <span className="text-sm font-bold text-zinc-800 dark:text-zinc-100 group-hover:text-emerald-500 transition-colors uppercase">{cli.nome}</span>
                                              <span className="text-[10px] text-zinc-500">{cli.empresa || cli.telefone}</span>
                                           </div>
                                        </Link>
                                     ))}
                                  </div>
                               </div>
                           )}
                        </div>
                    </div>
                 )}
              </div>

              <div className="flex items-center gap-3">
                  <div className="h-10 w-px bg-zinc-200 dark:bg-white/10 mx-2 hidden sm:block" />
                  <button 
                    onClick={toggleTheme}
                    className="w-12 h-12 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200/50 dark:border-white/5 flex items-center justify-center text-foreground hover:bg-muted transition-all shadow-sm group"
                  >
                    {theme === "dark" ? <Sun size={20} className="group-hover:rotate-45 transition-transform" /> : <Moon size={20} className="group-hover:-rotate-12 transition-transform" />}
                  </button>
                  <button className="w-12 h-12 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200/50 dark:border-white/5 flex items-center justify-center text-foreground hover:bg-muted transition-all shadow-sm relative group">
                    <Bell size={20} className="group-hover:animate-swing" />
                    <span className="absolute top-4 right-4 w-2 h-2 bg-primary rounded-full border-2 border-white dark:border-zinc-900" />
                  </button>
              </div>
           </div>
        </header>

        <div className="flex-1 overflow-y-auto p-8 md:p-12 no-scrollbar custom-scrollbar relative">
          {children}
        </div>
      </main>
    </div>
  );
}
