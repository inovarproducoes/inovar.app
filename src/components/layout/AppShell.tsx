"use client";
import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  Menu, X, LayoutDashboard, Calendar, Users, Briefcase,
  DollarSign, HelpCircle, MessageCircle, GraduationCap, Bell, Layout
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

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 z-40 bg-black/50 md:hidden" onClick={onClose} />
      )}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-sidebar flex flex-col transform transition-transform md:relative md:translate-x-0 border-r border-sidebar-border ${isOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="h-16 flex items-center px-4 justify-between border-b border-sidebar-border">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-primary-foreground text-xs font-bold">I</span>
            </div>
            <span className="text-lg font-bold text-sidebar-foreground">Inovar App</span>
          </div>
          <button onClick={onClose} className="md:hidden text-sidebar-foreground">
            <X className="w-5 h-5" />
          </button>
        </div>
        <nav className="flex-1 overflow-y-auto py-4">
          <ul className="space-y-1 px-2">
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
                    className={`flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${isActive ? "bg-sidebar-primary text-sidebar-primary-foreground font-medium" : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"}`}
                  >
                    <Icon className="w-5 h-5 flex-shrink-0" />
                    {item.name}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
        <div className="p-4 border-t border-sidebar-border flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-sm">A</div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium text-sidebar-foreground truncate">Administrador</div>
            <div className="text-xs text-muted-foreground truncate">admin@inovar.com</div>
          </div>
        </div>
      </div>
    </>
  );
}

function Header({ onMenuClick }: { onMenuClick: () => void }) {
  const { title, subtitle } = usePageTitle();
  return (
    <header className="h-16 border-b bg-card flex items-center justify-between px-4 lg:px-8 shrink-0">
      <div className="flex items-center gap-4">
        <button className="md:hidden text-foreground" onClick={onMenuClick}>
          <Menu className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-lg font-bold text-foreground">{title}</h1>
          {subtitle && <p className="text-sm text-muted-foreground hidden sm:block">{subtitle}</p>}
        </div>
      </div>
      <div className="flex items-center gap-2">
        <button className="w-8 h-8 rounded-full flex items-center justify-center text-muted-foreground hover:bg-muted transition-colors">
          <Bell className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const queryClient = useQueryClient();

  // Prefetch silencioso de todos os módulos 1s após o carregamento inicial
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
      <div className="flex-1 flex flex-col h-full w-full overflow-hidden">
        <Header onMenuClick={() => setSidebarOpen(true)} />
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
