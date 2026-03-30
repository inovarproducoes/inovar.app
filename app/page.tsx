"use client";
import dynamic from "next/dynamic";
import { MainLayout } from "@/components/layout/MainLayout";
import { StatCard } from "@/components/dashboard/StatCard";
import { RecentOsTable } from "@/components/dashboard/RecentOsTable";
import { useOsStats } from "@/hooks/useOS";
import { FileText, ClipboardList, CheckCircle2, TrendingUp, PlusCircle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import Link from "next/link";

// Recharts (~130KB) carregado apenas quando necessário
const OsPorMesChart = dynamic(
  () => import("@/components/dashboard/OsPorMesChart").then(m => ({ default: m.OsPorMesChart })),
  {
    ssr: false,
    loading: () => <Skeleton className="col-span-1 lg:col-span-2 h-[280px] w-full rounded-xl" />,
  }
);

export default function Dashboard() {
  const { data: stats } = useOsStats();

  const {
    abertas, emAndamento, finalizadas, taxaFinalizacao,
    tendencias, osPorMes, 
    recentes,
  } = stats!;

  return (
    <MainLayout title="Dashboard" subtitle="Visão geral das Ordens de Serviço (OS)">
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <StatCard title="OS Abertas / Pendentes" value={abertas} icon={ClipboardList} accent="blue" trend={{ value: tendencias.abertas, label: 'vs. mês anterior', isPositive: true }} />
        <StatCard title="OS em Andamento" value={emAndamento} icon={FileText} accent="brown" description="Trabalho iniciado" />
        <StatCard title="OS Finalizadas" value={finalizadas} icon={CheckCircle2} accent="green" trend={{ value: tendencias.finalizadas, label: 'vs. mês anterior', isPositive: true }} />
        <StatCard title="Taxa de Finalização" value={`${taxaFinalizacao}%`} icon={TrendingUp} accent="purple" trend={{ value: tendencias.taxa, label: 'vs. mês anterior', isPositive: true }} />
      </div>

      <div className="grid gap-6 lg:grid-cols-3 mb-8">
        <OsPorMesChart data={osPorMes} />
        {/* Usando DistribuicaoPorTipo placeholder ou algo similar. Como OS não tem tipo por padrão, vamos deixar vazio por enquanto ou colocar algo genérico */}
        <div className="col-span-1 rounded-xl border border-white/5 bg-card/60 backdrop-blur-xl p-6 flex flex-col items-center justify-center text-center">
            <ClipboardList className="h-12 w-12 text-muted-foreground/30 mb-4" />
            <h3 className="text-lg font-medium text-foreground">Distribuição</h3>
            <p className="text-sm text-muted-foreground mt-2 max-w-[200px]">
              Estatísticas detalhadas por tipos de chamados estarão disponíveis em breve.
            </p>
        </div>
      </div>

      <div className="space-y-6">
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">Ordens de Serviço Recentes</h2>
            <Button asChild size="sm">
              <Link href="/kanban"><PlusCircle className="mr-2 h-4 w-4" />Painel Kanban</Link>
            </Button>
          </div>
          <RecentOsTable ordens={recentes} />
        </div>
      </div>
    </MainLayout>
  );
}
