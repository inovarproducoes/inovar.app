"use client";
import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  Menu, X, LayoutDashboard, Briefcase,
  GraduationCap, Bell, Layout, LogOut, Archive, Settings,
  ChevronRight,
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
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`
          fixed inset-y-0 left-0 z-50 w-60 flex flex-col
          transform transition-transform duration-200
          md:relative md:translate-x-0
          ${isOpen ? "translate-x-0" : "-translate-x-full"}
        `}
        style={{
          background: "rgba(7,8,15,0.92)",
          borderRight: "1px solid rgba(255,255,255,0.07)",
          backdropFilter: "blur(20px)",
        }}
      >
        {/* Logo */}
        <div
          className="h-16 flex items-center px-5 shrink-0"
          style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}
        >
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
              style={{
                background: "linear-gradient(135deg, #4a4bd7, #6e3bd8)",
                boxShadow: "0 0 12px rgba(74,75,215,0.45)",
              }}
            >
              <span style={{ fontFamily: "Syne, sans-serif", color: "white", fontSize: 14, fontWeight: 800 }}>I</span>
            </div>
            <div>
              <p style={{ fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: 16, letterSpacing: "-0.5px", color: "#f0f0ff" }}>
                Inovar
              </p>
              <p style={{ fontSize: 9, color: "rgba(144,144,176,0.5)", letterSpacing: "0.15em", textTransform: "uppercase", marginTop: 1 }}>
                Enterprise OS
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="md:hidden p-1 rounded-lg transition-colors hover:bg-white/10"
            style={{ color: "rgba(240,240,255,0.6)" }}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-4 px-3 no-scrollbar flex flex-col gap-0.5">
          <p style={{ fontSize: 10, fontWeight: 600, letterSpacing: "0.15em", textTransform: "uppercase", color: "rgba(144,144,176,0.35)", padding: "0 12px", marginBottom: 8 }}>
            Menu
          </p>
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href ||
              (item.href !== "/" && pathname.startsWith(item.href + "/"));
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={onClose}
                onMouseEnter={() => handlePrefetch(item.href)}
                onFocus={() => handlePrefetch(item.href)}
                className={`
                  relative flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium
                  overflow-hidden transition-all duration-200
                  ${isActive ? "nav-active" : ""}
                `}
                style={!isActive ? {
                  color: "rgba(144,144,176,0.75)",
                } : undefined}
                onMouseOver={e => {
                  if (!isActive) {
                    (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.04)";
                    (e.currentTarget as HTMLElement).style.color = "#f0f0ff";
                  }
                }}
                onMouseOut={e => {
                  if (!isActive) {
                    (e.currentTarget as HTMLElement).style.background = "";
                    (e.currentTarget as HTMLElement).style.color = "rgba(144,144,176,0.75)";
                  }
                }}
              >
                <Icon
                  className="w-4 h-4 shrink-0"
                  style={isActive ? { color: "#8083ff", filter: "drop-shadow(0 0 6px rgba(128,131,255,0.7))" } : undefined}
                />
                <span style={{ fontFamily: "'DM Sans', sans-serif" }}>{item.name}</span>
                {isActive && (
                  <span
                    className="ml-auto w-1.5 h-1.5 rounded-full"
                    style={{ background: "#8083ff", boxShadow: "0 0 6px rgba(128,131,255,0.8)" }}
                  />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div
          className="p-3 shrink-0 flex flex-col gap-1"
          style={{ borderTop: "1px solid rgba(255,255,255,0.07)" }}
        >
          {/* User card */}
          <div
            className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg mb-1 cursor-pointer transition-colors"
            style={{ background: "rgba(255,255,255,0.04)" }}
          >
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 font-syne font-bold text-white text-xs"
              style={{
                background: "linear-gradient(135deg, #4a4bd7, #6e3bd8)",
                boxShadow: "0 0 10px rgba(74,75,215,0.35)",
              }}
            >
              {initials}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium truncate" style={{ color: "#f0f0ff" }}>
                {usuario?.nome ?? "Usuário"}
              </p>
              <p className="text-[10px] truncate flex items-center gap-1" style={{ color: "rgba(144,144,176,0.55)" }}>
                <span className="status-dot" style={{ width: 5, height: 5, marginRight: 2 }} />
                {usuario?.role === "admin" ? "Admin" : "Usuário"}
              </p>
            </div>
            <ChevronRight className="w-3.5 h-3.5 shrink-0" style={{ color: "rgba(144,144,176,0.3)" }} />
          </div>

          <Link
            href="#"
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all"
            style={{ color: "rgba(144,144,176,0.65)" }}
            onMouseOver={e => { (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.04)"; (e.currentTarget as HTMLElement).style.color = "#f0f0ff"; }}
            onMouseOut={e  => { (e.currentTarget as HTMLElement).style.background = "";                       (e.currentTarget as HTMLElement).style.color = "rgba(144,144,176,0.65)"; }}
          >
            <Settings className="w-4 h-4 shrink-0" />
            <span>Configurações</span>
          </Link>

          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium w-full text-left transition-all"
            style={{ color: "#f76a80" }}
            onMouseOver={e => { (e.currentTarget as HTMLElement).style.background = "rgba(172,49,73,0.12)"; }}
            onMouseOut={e  => { (e.currentTarget as HTMLElement).style.background = ""; }}
          >
            <LogOut className="w-4 h-4 shrink-0" />
            <span>Sair do Sistema</span>
          </button>
        </div>
      </aside>
    </>
  );
}

/* ─── Header / Topbar ─────────────────────────────────────────── */
function Header({ onMenuClick }: { onMenuClick: () => void }) {
  const { title, subtitle } = usePageTitle();
  const { usuario } = useAuth();
  const [liveTime, setLiveTime] = useState("");

  useEffect(() => {
    const tick = () =>
      setLiveTime(new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit", second: "2-digit" }));
    tick();
    const t = setInterval(tick, 1000);
    return () => clearInterval(t);
  }, []);

  return (
    <header
      className="h-16 flex items-center justify-between px-4 lg:px-6 shrink-0"
      style={{
        background: "rgba(7,8,15,0.8)",
        borderBottom: "1px solid rgba(255,255,255,0.07)",
        backdropFilter: "blur(12px)",
      }}
    >
      {/* Left */}
      <div className="flex items-center gap-4">
        <button
          className="md:hidden w-9 h-9 rounded-lg flex items-center justify-center transition-colors"
          style={{ background: "rgba(255,255,255,0.04)", color: "rgba(144,144,176,0.8)" }}
          onClick={onMenuClick}
        >
          <Menu className="w-5 h-5" />
        </button>
        <div>
          <h1
            className="font-syne text-xl font-extrabold leading-tight"
            style={{ color: "#f0f0ff", letterSpacing: "-0.5px" }}
          >
            {title}
          </h1>
          {subtitle && (
            <p className="text-xs mt-0.5 hidden sm:block" style={{ color: "rgba(144,144,176,0.7)" }}>
              {subtitle}
              {liveTime && (
                <span
                  className="font-mono ml-2"
                  style={{ color: "#8083ff", fontSize: 11 }}
                >
                  {liveTime}
                </span>
              )}
            </p>
          )}
        </div>
      </div>

      {/* Right */}
      <div className="flex items-center gap-2">
        {/* Search */}
        <div
          className="hidden md:flex items-center gap-2 px-3 py-2 rounded-lg transition-all"
          style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4" style={{ color: "rgba(90,90,122,1)" }}>
            <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
          </svg>
          <input
            type="text" placeholder="Buscar..."
            className="bg-transparent border-none outline-none text-sm w-36"
            style={{ color: "#f0f0ff", fontFamily: "'DM Sans', sans-serif" }}
          />
        </div>

        {/* Bell */}
        <button
          className="relative w-9 h-9 rounded-lg flex items-center justify-center transition-all"
          style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)", color: "rgba(144,144,176,0.8)" }}
          onMouseOver={e => { (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.08)"; (e.currentTarget as HTMLElement).style.borderColor = "rgba(74,75,215,0.3)"; }}
          onMouseOut={e  => { (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.04)"; (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.07)"; }}
        >
          <Bell className="w-4 h-4" />
          <span className="notif-dot" />
        </button>

        {/* User pill */}
        <div
          className="hidden md:flex items-center gap-2.5 px-3 py-1.5 rounded-lg cursor-pointer transition-all"
          style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}
          onMouseOver={e => { (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.08)"; }}
          onMouseOut={e  => { (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.04)"; }}
        >
          <div
            className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold font-syne text-white shrink-0"
            style={{ background: "linear-gradient(135deg, #4a4bd7, #6e3bd8)" }}
          >
            {usuario?.nome?.charAt(0)?.toUpperCase() ?? "U"}
          </div>
          <div className="hidden lg:block">
            <p className="text-xs font-medium" style={{ color: "#f0f0ff" }}>{usuario?.nome ?? "Usuário"}</p>
            <p className="text-[10px]" style={{ color: "rgba(144,144,176,0.5)" }}>{usuario?.email ?? ""}</p>
          </div>
        </div>
      </div>
    </header>
  );
}

/* ─── AppShell ─────────────────────────────────────────────────── */
export function AppShell({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const queryClient = useQueryClient();

  useEffect(() => {
    const t = setTimeout(() => {
      Object.values(PREFETCH_MAP).forEach(({ queryKey, queryFn }) =>
        queryClient.prefetchQuery({ queryKey, queryFn })
      );
    }, 1000);
    return () => clearTimeout(t);
  }, [queryClient]);

  return (
    <div className="flex w-full h-screen overflow-hidden" style={{ background: "#07080f" }}>
      {/* Background apenas no app */}
      <AuroraBackground />

      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="relative z-10 flex-1 flex flex-col h-full min-w-0 overflow-hidden">
        <Header onMenuClick={() => setSidebarOpen(true)} />
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
