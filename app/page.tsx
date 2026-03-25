"use client";
import dynamic from "next/dynamic";
import { MainLayout } from "@/components/layout/MainLayout";
import { StatCard } from "@/components/dashboard/StatCard";
import { EventCard } from "@/components/dashboard/EventCard";
import { RecentEventsTable } from "@/components/dashboard/RecentEventsTable";
import { DistribuicaoPorTipo } from "@/components/dashboard/DistribuicaoPorTipo";
import { useEventosStats } from "@/hooks/useEventos";
import { Evento } from "@/types/database";
import { Calendar, Users, CalendarCheck, TrendingUp, PlusCircle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import Link from "next/link";

// Recharts (~130KB) carregado apenas quando necessário
const EventosPorMesChart = dynamic(
  () => import("@/components/dashboard/EventosPorMesChart").then(m => ({ default: m.EventosPorMesChart })),
  {
    ssr: false,
    loading: () => <Skeleton className="col-span-1 lg:col-span-2 h-[280px] w-full rounded-xl" />,
  }
);

export default function Dashboard() {
  const { data: stats } = useEventosStats();

  const {
    total, proximos, vagasOcupadas, taxaOcupacao,
    tendencias, eventosPorMes, distribuicaoPorTipo,
    proximosEventos, recentes,
  } = stats!;

  return (
    <MainLayout title="Dashboard" subtitle="Visão geral do sistema Inovar App">
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <StatCard title="Total de Eventos" value={total} icon={Calendar} trend={{ value: tendencias.total, label: 'vs. mês anterior', isPositive: true }} className="bg-blue-50/5 dark:bg-card/60" />
        <StatCard title="Próximos Eventos" value={proximos} icon={CalendarCheck} description="Para os próximos dias" className="bg-orange-50/5 dark:bg-card/60" />
        <StatCard title="Total Participantes" value={vagasOcupadas} icon={Users} trend={{ value: tendencias.vagas, label: 'vs. mês anterior', isPositive: true }} className="bg-emerald-50/5 dark:bg-card/60" />
        <StatCard title="Taxa de Ocupação" value={`${taxaOcupacao}%`} icon={TrendingUp} trend={{ value: tendencias.taxa, label: 'vs. mês anterior', isPositive: true }} className="bg-yellow-50/5 dark:bg-card/60" />
      </div>

      <div className="grid gap-6 lg:grid-cols-3 mb-8">
        <EventosPorMesChart data={eventosPorMes} />
        <DistribuicaoPorTipo data={distribuicaoPorTipo} />
      </div>

      <div className="space-y-6">
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">Próximos Eventos</h2>
            <Button asChild size="sm">
              <Link href="/eventos/novo"><PlusCircle className="mr-2 h-4 w-4" />Novo Evento</Link>
            </Button>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {proximosEventos.length === 0 ? (
              <div className="col-span-full border border-dashed rounded-lg p-8 text-center bg-card/30">
                <p className="text-muted-foreground">Nenhum evento próximo encontrado.</p>
              </div>
            ) : proximosEventos.map((ev: Evento) => <EventCard key={ev.id} evento={ev} />)}
          </div>
        </div>

        <div>
          <h2 className="text-xl font-bold mb-4">Eventos Recentes</h2>
          <RecentEventsTable eventos={recentes} />
        </div>
      </div>
    </MainLayout>
  );
}
