"use client";
import React, { useState } from "react";
import Link from "next/link";
import { Menu, X, LayoutDashboard, Calendar, Users, Briefcase, DollarSign, HelpCircle, MessageCircle } from "lucide-react";
import { usePathname } from "next/navigation";

function Sidebar({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const pathname = usePathname();
  const menuItems = [
    { name: "Dashboard", href: "/", icon: LayoutDashboard },
    { name: "Eventos", href: "/eventos", icon: Calendar },
    { name: "Participantes", href: "/participantes", icon: Users },
    { name: "Alunos", href: "/alunos", icon: Users },
    { name: "Clientes", href: "/clientes", icon: Briefcase },
    { name: "Financeiro", href: "/financeiro", icon: DollarSign },
    { name: "FAQs", href: "/faqs", icon: HelpCircle },
    { name: "Suporte", href: "/suporte", icon: MessageCircle },
  ];

  return (
    <>
      {isOpen && (
         <div className="fixed inset-0 z-40 bg-black/50 md:hidden" onClick={onClose} />
      )}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-sidebar flex flex-col transform transition-transform md:relative md:translate-x-0 border-r border-sidebar-border ${isOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="h-16 flex items-center px-4 justify-between border-b border-sidebar-border">
          <span className="text-lg font-bold text-primary">Inovar App</span>
          <button onClick={onClose} className="md:hidden"><X className="w-5 h-5"/></button>
        </div>
        <nav className="flex-1 overflow-y-auto py-4">
          <ul className="space-y-1 px-2">
            {menuItems.map(item => {
              const Icon = item.icon;
              const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
              return (
                <li key={item.name}>
                  <Link href={item.href} className={`flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${isActive ? 'bg-sidebar-primary text-sidebar-primary-foreground font-medium' : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'}`}>
                    <Icon className="w-5 h-5" />
                    {item.name}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
        <div className="p-4 border-t border-sidebar-border flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">U</div>
          <div className="text-sm truncate text-sidebar-foreground">admin@inovar.com</div>
        </div>
      </div>
    </>
  );
}

function Header({ title, subtitle, onMenuClick }: { title: string; subtitle?: string; onMenuClick: () => void }) {
  return (
    <header className="h-16 border-b bg-card flex items-center justify-between px-4 lg:px-8">
      <div className="flex items-center gap-4">
        <button className="md:hidden" onClick={onMenuClick}><Menu className="w-5 h-5"/></button>
        <div>
          <h1 className="text-lg font-bold">{title}</h1>
          {subtitle && <p className="text-sm text-muted-foreground hidden sm:block">{subtitle}</p>}
        </div>
      </div>
      <div className="flex items-center gap-4">
        <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center">U</div>
      </div>
    </header>
  );
}

export function MainLayout({ children, title, subtitle }: { children: React.ReactNode; title: string; subtitle?: string; }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  return (
    <div className="flex w-full h-screen overflow-hidden bg-background">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex-1 flex flex-col h-full w-full overflow-hidden">
        <Header title={title} subtitle={subtitle} onMenuClick={() => setSidebarOpen(true)} />
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
