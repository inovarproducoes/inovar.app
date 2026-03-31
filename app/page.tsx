"use client";
import dynamic from "next/dynamic";
import { MainLayout } from "@/components/layout/MainLayout";
import { StatCard } from "@/components/dashboard/StatCard";
import { RecentOsTable } from "@/components/dashboard/RecentOsTable";
import { useOsStats } from "@/hooks/useOS";
import { FileText, ClipboardList, CheckCircle2, TrendingUp, PlusCircle, ArrowUpRight } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import Link from "next/link";

// Recharts (~130KB) carregado apenas quando necessário
const OsPorMesChart = dynamic(
  () => import("@/components/dashboard/OsPorMesChart").then(m => ({ default: m.OsPorMesChart })),
  {
    ssr: false,
    loading: () => <Skeleton className="col-span-1 lg:col-span-2 h-[340px] w-full rounded-2xl" />,
  }
);

/* ─── Goal Card Component ───────────────────────────────────────── */
function GoalCard({ percentage, current, target, label, sublabel }: any) {
  return (
    <div className="glass-card p-7 fade-up-5 flex flex-col h-full overflow-hidden" 
         style={{ background: 'linear-gradient(145deg, rgba(74,75,215,0.12), rgba(110,59,216,0.08))', borderColor: 'rgba(74,75,215,0.2)' }}>
      <div className="relative z-10">
        <h3 className="font-syne font-bold text-base text-foreground mb-1">{label}</h3>
        <p className="text-xs text-muted-foreground/70 mb-8 font-dm">{sublabel}</p>
        
        <div className="flex justify-center mb-8 relative">
          <svg className="w-32 h-32 rotate-[-90deg]">
            <circle cx="64" cy="64" r="54" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="8" />
            <circle 
                cx="64" cy="64" r="54" fill="none" stroke="url(#goalRingGrad)" strokeWidth="8" strokeLinecap="round"
                strokeDasharray="339" strokeDashoffset={339 - (339 * percentage / 100)}
                className="transition-all duration-1000 ease-out"
                style={{ filter: 'drop-shadow(0 0 6px rgba(128,131,255,0.6))' }}
            />
            <defs>
              <linearGradient id="goalRingGrad" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#4a4bd7" />
                <stop offset="100%" stopColor="#8083ff" />
              </linearGradient>
            </defs>
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="font-syne font-black text-2xl text-white">{percentage}%</span>
            <span className="text-[10px] text-muted-foreground uppercase tracking-widest font-mono">Meta</span>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <div className="flex justify-between items-center mb-1.5 text-[11px] uppercase tracking-wider font-mono text-muted-foreground">
              <span>Performance</span>
              <span className="text-foreground font-bold">{percentage}%</span>
            </div>
            <div className="h-1.5 bg-white/5 rounded-full overflow-hidden border border-white/5">
              <div className="h-full bg-gradient-to-r from-primary to-[#8083ff] rounded-full shadow-[0_0_8px_rgba(128,131,255,0.5)]" style={{ width: `${percentage}%` }} />
            </div>
          </div>
          
          <div className="flex items-center justify-between text-[11px] font-dm py-1">
             <span className="text-muted-foreground">{current} de {target}</span>
             <span className="text-primary font-bold">Quase lá!</span>
          </div>
        </div>

        <Button className="w-full mt-6 bg-white/10 hover:bg-white/15 border-white/10 text-white font-syne font-bold text-xs rounded-xl h-10 tracking-wide transition-all group">
           Aumentar Meta <ArrowUpRight className="ml-1.5 w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
        </Button>
      </div>
      
      {/* Background decoration */}
      <div className="absolute -top-12 -right-12 w-48 h-48 bg-primary/20 blur-[80px] rounded-full" />
    </div>
  );
}

export default function Dashboard() {
  const { data: stats } = useOsStats();
  const { abertas, emAndamento, finalizadas, taxaFinalizacao, tendencias, osPorMes, recentes } = stats!;

  return (
    <MainLayout title="Dashboard" subtitle="Visão em tempo real da performance operacional">
      {/* Top Stats */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        <StatCard title="Pendentes" value={abertas} icon={ClipboardList} accent="blue" trend={{ value: tendencias.abertas, label: 'vs. mês anterior', isPositive: true }} className="fade-up-1" />
        <StatCard title="Em Execução" value={emAndamento} icon={FileText} accent="purple" description="Trabalho iniciado" className="fade-up-2" />
        <StatCard title="Finalizadas" value={finalizadas} icon={CheckCircle2} accent="teal" trend={{ value: tendencias.finalizadas, label: 'vs. mês anterior', isPositive: true }} className="fade-up-3" />
        <StatCard title="Taxa Resolvida" value={`${taxaFinalizacao}%`} icon={TrendingUp} accent="red" trend={{ value: tendencias.taxa, label: 'vs. mês anterior', isPositive: true }} className="fade-up-4" />
      </div>

      {/* Charts / Goal Section */}
      <div className="grid gap-6 lg:grid-cols-3 mb-8">
        <div className="lg:col-span-2">
            <OsPorMesChart data={osPorMes} />
        </div>
        <GoalCard 
            percentage={taxaFinalizacao} 
            current={finalizadas} 
            target={abertas + emAndamento + finalizadas} 
            label="Meta Mensal"
            sublabel="Performance de conclusão de OS" 
        />
      </div>

      {/* Recentes */}
      <div className="space-y-6">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h2 className="font-syne font-extrabold text-xl text-foreground">Ordens de Serviço Recentes</h2>
            <p className="text-xs text-muted-foreground font-dm">Ações operacionais em destaque</p>
          </div>
          <div className="flex gap-3">
             <Button asChild variant="outline" className="bg-white/5 border-white/10 text-white font-syne font-bold text-xs h-10 rounded-xl hover:bg-white/10 transition-all">
                <Link href="/os/arquivadas"><Archive className="mr-2 h-4 w-4" />Arquivo</Link>
             </Button>
             <Button asChild className="bg-gradient-brand text-white font-syne font-bold text-xs h-10 rounded-xl px-5 hover:opacity-90 transition-all shadow-lg shadow-primary/25">
                <Link href="/kanban"><Layout className="mr-2 h-4 w-4" />Painel Kanban</Link>
             </Button>
          </div>
        </div>
        <RecentOsTable ordens={recentes} />
      </div>

      <div className="pt-8 text-center text-[10px] text-muted-foreground uppercase tracking-[0.2em] font-mono opacity-50">
         End of Intelligence Dashboard System — Inovar OS v2.0
      </div>
    </MainLayout>
  );
}

// Para evitar conflito com lucide-react do AppShell
import { Layout, Archive } from "lucide-react";
