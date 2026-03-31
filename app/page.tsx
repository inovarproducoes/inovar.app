"use client";
import dynamic from "next/dynamic";
import { MainLayout } from "@/components/layout/MainLayout";
import { StatCard } from "@/components/dashboard/StatCard";
import { RecentOsTable } from "@/components/dashboard/RecentOsTable";
import { useOsStats } from "@/hooks/useOS";
import { ClipboardList, CheckCircle2, TrendingUp, LayoutPanelLeft } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { OS } from "@prisma/client";

const OsPorMesChart = dynamic(
  () => import("@/components/dashboard/OsPorMesChart").then(m => ({ default: m.OsPorMesChart })),
  {
    ssr: false,
    loading: () => <Skeleton className="col-span-1 lg:col-span-2 h-[340px] w-full rounded-2xl opacity-10" />,
  }
);

/* ─── Goal Card Component ───────────────────────────────────────── */
interface GoalCardProps {
  percentage: number;
  current: number;
  target: number;
  label: string;
  sublabel: string;
}

function GoalCard({ percentage, current, target, label, sublabel }: GoalCardProps) {
  return (
    <div className="glass-card p-7 fade-up flex flex-col h-full overflow-hidden border-border/80 text-foreground">
      <div className="relative z-10">
        <h3 className="font-dm font-bold text-base text-foreground mb-1">{label}</h3>
        <p className="text-[10px] uppercase font-bold text-muted-foreground/70 mb-8 tracking-widest">{sublabel}</p>
        
        <div className="flex justify-center mb-8 relative">
          <svg className="w-32 h-32 rotate-[-90deg]">
            <circle cx="64" cy="64" r="54" fill="none" stroke="currentColor" strokeWidth="8" className="text-muted/10" />
            <circle 
                cx="64" cy="64" r="54" fill="none" stroke="url(#goalRingGradDashboard)" strokeWidth="8" strokeLinecap="round"
                strokeDasharray="339" strokeDashoffset={339 - (339 * percentage / 100)}
                className="transition-all duration-1000 ease-out"
                style={{ filter: 'drop-shadow(0 0 8px rgba(74,75,215,0.4))' }}
            />
            <defs>
              <linearGradient id="goalRingGradDashboard" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#4a4bd7" />
                <stop offset="100%" stopColor="#8083ff" />
              </linearGradient>
            </defs>
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center translate-y-1">
             <span className="text-3xl font-dm font-black text-foreground">{percentage}%</span>
             <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">Sucesso</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mt-auto">
           <div className="bg-muted/30 p-3 rounded-xl border border-border/40">
              <p className="text-[9px] font-black text-muted-foreground uppercase mb-1">Atual</p>
              <p className="text-sm font-bold text-foreground">{current}</p>
           </div>
           <div className="bg-muted/30 p-3 rounded-xl border border-border/40 text-right">
              <p className="text-[9px] font-black text-muted-foreground uppercase mb-1">Meta</p>
              <p className="text-sm font-bold text-foreground">{target}</p>
           </div>
        </div>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const { data: stats, isLoading } = useOsStats();

  if (isLoading) {
    return (
      <MainLayout title="Painel de Controle" subtitle="Carregando estatísticas...">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
           {[1,2,3,4].map(i => <Skeleton key={i} className="h-40 rounded-2xl opacity-10" />)}
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout title="Dashboard Estratégico" subtitle="Inteligência de operações em tempo real">
      
      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-10 text-foreground">
        <StatCard 
          title="Total de OS" 
          value={stats?.total || 0} 
          icon={ClipboardList} 
          trend={{ value: Math.abs(stats?.tendencias.total || 0), label: "vs mês anterior", isPositive: (stats?.tendencias.total || 0) >= 0 }}
          delay={0}
        />
        <StatCard 
          title="Abertas" 
          value={stats?.abertas || 0} 
          icon={LayoutPanelLeft} 
          trend={{ value: Math.abs(stats?.tendencias.abertas || 0), label: "novas hoje", isPositive: true }}
          color="#4a4bd7"
          delay={100}
        />
        <StatCard 
          title="Finalizadas" 
          value={stats?.finalizadas || 0} 
          icon={CheckCircle2} 
          trend={{ value: Math.abs(stats?.tendencias.finalizadas || 0), label: "concluídas", isPositive: true }}
          color="#10b981"
          delay={200}
        />
        <StatCard 
          title="Conversão" 
          value={`${stats?.taxaFinalizacao || 0}%`} 
          icon={TrendingUp} 
          trend={{ value: Math.abs(stats?.tendencias.taxa || 0), label: "conversão", isPositive: (stats?.tendencias.taxa || 0) >= 0 }}
          color="#8b5cf6"
          delay={300}
        />
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-10">
        <div className="lg:col-span-2">
            <div className="kpi-card h-full p-8 text-foreground">
               <div className="flex items-center justify-between mb-8">
                  <div>
                    <h3 className="text-base font-bold text-foreground uppercase tracking-tight">Produtividade Anual</h3>
                    <p className="text-[10px] font-bold text-muted-foreground mt-1 uppercase tracking-widest">Métricas consolidadas de 2024</p>
                  </div>
                  <div className="hidden sm:flex items-center gap-2">
                     <span className="w-2.5 h-2.5 rounded-full bg-primary" />
                     <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Volume OS</span>
                  </div>
               </div>
               <OsPorMesChart data={stats?.osPorMes || []} />
            </div>
        </div>

        <div className="lg:col-span-1">
           <GoalCard 
             label="Meta Trimestral" 
             sublabel="Desempenho de entregas concluídas" 
             percentage={stats?.taxaFinalizacao || 0}
             current={stats?.finalizadas || 0}
             target={Math.max(stats?.total || 50, 50)}
           />
        </div>
      </div>

      {/* Bottom Section */}
      <div className="space-y-6 text-foreground">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
             <div>
                <h2 className="text-xl font-dm font-black text-foreground uppercase tracking-tight">Ordens de Serviço Recentes</h2>
                <p className="text-xs text-muted-foreground font-dm">Últimas interações registradas no ecossistema</p>
             </div>
             <Link href="/kanban" className="w-full sm:w-auto">
                <Button className="w-full sm:w-auto h-11 bg-primary text-white rounded-xl px-8 font-black text-[11px] uppercase tracking-wider shadow-xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all">
                   Acessar Painel Kanban
                </Button>
             </Link>
          </div>

          <div className="w-full overflow-hidden">
             <RecentOsTable ordens={(stats?.recentes as unknown as OS[]) || []} />
          </div>
      </div>
      
    </MainLayout>
  );
}
