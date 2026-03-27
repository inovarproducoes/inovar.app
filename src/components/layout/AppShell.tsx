"use client";
import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  Menu, X, LayoutDashboard, Calendar, Users, Briefcase,
  DollarSign, HelpCircle, MessageCircle, GraduationCap, Bell, Layout, LogOut
} from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { eventosService } from "@/services/eventosService";
import { alunosService } from "@/services/alunosService";
import { clientesService } from "@/services/clientesService";
import { usePageTitle } from "@/context/PageTitleContext";

const PREFETCH_MAP: Record<string, { queryKey: unknown[]; queryFn: () => Promise<unknown> }> = {
  "/eventos": {
    queryKey: ["eventos", undefined],
    queryFn: () => eventosService.getEventos(),
  },
  "/alunos": {
    queryKey: ["alunos", {}],
    queryFn: () => alunosService.buscarAlunos(),
  },
  "/clientes": {
    queryKey: ["clientes", ""],
    queryFn: () => clientesService.buscarClientes(),
  },
  "/eventos-stats": {
    queryKey: ["eventos-stats"],
    queryFn: () => fetch("/api/eventos/stats").then(r => r.json()),
  },
};

const menuItems = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Kanban OS", href: "/kanban", icon: Layout },
  { name: "Eventos", href: "/eventos", icon: Calendar },
  { name: "Participantes", href: "/participantes", icon: Users },
  { name: "Alunos", href: "/alunos", icon: GraduationCap },
  { name: "Clientes", href: "/clientes", icon: Briefcase },
  { name: "Financeiro", href: "/financeiro", icon: DollarSign },
  { name: "FAQs", href: "/faqs", icon: HelpCircle },
  { name: "Suporte IA", href: "/suporte", icon: MessageCircle },
];

function Sidebar({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const pathname = usePathname();
  const queryClient = useQueryClient();
  const router = useRouter();

  const handlePrefetch = useCallback((href: string) => {
    router.prefetch(href);
    const config = PREFETCH_MAP[href];
    if (!config) return;
    queryClient.prefetchQuery({ queryKey: config.queryKey, queryFn: config.queryFn });
  }, [queryClient, router]);

  const handleLogout = () => {
    sessionStorage.removeItem("inovar_auth");
    window.location.reload();
  };

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden" onClick={onClose} />
      )}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 flex flex-col transform transition-transform duration-200 md:relative md:translate-x-0 ${isOpen ? "translate-x-0" : "-translate-x-full"}`}
        style={{ background: "hsl(var(--sidebar-background))" }}>

        {/* Logo */}
        <div className="h-16 flex items-center px-5 justify-between shrink-0"
          style={{ borderBottom: "1px solid hsl(var(--sidebar-border))" }}>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
              style={{ background: "linear-gradient(110deg, hsl(var(--primary)), hsl(var(--brown)))" }}>
              <span className="text-white text-sm font-black">I</span>
            </div>
            <div>
              <span className="text-sm font-bold tracking-wide" style={{ color: "hsl(var(--sidebar-foreground))" }}>
                Inovar App
              </span>
              <p className="text-[10px] leading-none mt-0.5" style={{ color: "hsl(var(--sidebar-foreground) / 0.45)" }}>
                Gestão Inteligente
              </p>
            </div>
          </div>
          <button onClick={onClose} className="md:hidden p-1 rounded-md hover:bg-white/10 transition-colors"
            style={{ color: "hsl(var(--sidebar-foreground))" }}>
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-4 px-3 no-scrollbar">
          <p className="text-[10px] font-semibold uppercase tracking-widest px-3 mb-3"
            style={{ color: "hsl(var(--sidebar-foreground) / 0.35)" }}>
            Menu
          </p>
          <ul className="space-y-0.5">
            {menuItems.map(item => {
              const Icon = item.icon;
              const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href + "/"));
              return (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    onClick={onClose}
                    onMouseEnter={() => handlePrefetch(item.href)}
                    onFocus={() => handlePrefetch(item.href)}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium relative group transition-all"
                    style={isActive ? {
                      background: "hsl(var(--brown) / 0.15)",
                      color: "hsl(var(--sidebar-primary))",
                      borderLeft: "3px solid hsl(var(--sidebar-primary))",
                      paddingLeft: "calc(0.75rem - 3px)",
                    } : {
                      color: "hsl(var(--sidebar-foreground) / 0.75)",
                    }}
                    onMouseOver={e => {
                      if (!isActive) {
                        (e.currentTarget as HTMLElement).style.background = "hsl(var(--sidebar-accent))";
                        (e.currentTarget as HTMLElement).style.color = "hsl(var(--sidebar-foreground))";
                      }
                    }}
                    onMouseOut={e => {
                      if (!isActive) {
                        (e.currentTarget as HTMLElement).style.background = "transparent";
                        (e.currentTarget as HTMLElement).style.color = "hsl(var(--sidebar-foreground) / 0.75)";
                      }
                    }}
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    <span>{item.name}</span>
                    {isActive && (
                      <span className="ml-auto w-1.5 h-1.5 rounded-full status-dot-active"
                        style={{ background: "hsl(var(--sidebar-primary))" }} />
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* User & Logout */}
        <div className="p-4 shrink-0 flex flex-col gap-2" style={{ borderTop: "1px solid hsl(var(--sidebar-border))" }}>
          <div className="flex items-center gap-3 px-2 py-2 rounded-lg"
            style={{ background: "hsl(var(--sidebar-accent))" }}>
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0"
              style={{ background: "linear-gradient(135deg, hsl(var(--primary) / 0.7), hsl(var(--brown) / 0.7))", color: "white" }}>
              A
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold truncate" style={{ color: "hsl(var(--sidebar-foreground))" }}>
                Administrador
              </p>
              <p className="text-[10px] truncate" style={{ color: "hsl(var(--sidebar-foreground) / 0.45)" }}>
                admin@inovar.com
              </p>
            </div>
          </div>
          
          <button 
            onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-destructive hover:bg-destructive/10 transition-all w-full text-left"
          >
            <LogOut className="w-4 h-4 shrink-0" />
            <span>Sair do Sistema</span>
          </button>
        </div>
      </aside>
    </>
  );
}

function Header({ onMenuClick }: { onMenuClick: () => void }) {
  const { title, subtitle } = usePageTitle();
  return (
    <header className="h-16 bg-card border-b flex items-center justify-between px-4 lg:px-6 shrink-0">
      <div className="flex items-center gap-4">
        <button
          className="md:hidden w-9 h-9 rounded-lg flex items-center justify-center text-muted-foreground hover:bg-muted transition-colors"
          onClick={onMenuClick}
        >
          <Menu className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-xl font-bold text-foreground leading-tight">{title}</h1>
          {subtitle && (
            <p className="text-xs text-muted-foreground hidden sm:block mt-0.5">{subtitle}</p>
          )}
        </div>
      </div>
      <div className="flex items-center gap-2">
        <button className="relative w-9 h-9 rounded-lg flex items-center justify-center text-muted-foreground hover:bg-muted hover:text-foreground transition-colors">
          <Bell className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const queryClient = useQueryClient();

  useEffect(() => {
    const timer = setTimeout(() => {
      Object.values(PREFETCH_MAP).forEach(({ queryKey, queryFn }) => {
        queryClient.prefetchQuery({ queryKey, queryFn });
      });
    }, 1000);
    return () => clearTimeout(timer);
  }, [queryClient]);

  return (
    <div className="flex w-full h-screen overflow-hidden bg-background">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex-1 flex flex-col h-full min-w-0 overflow-hidden">
        <Header onMenuClick={() => setSidebarOpen(true)} />
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
