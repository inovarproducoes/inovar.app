"use client";
import { MainLayout } from "@/components/layout/MainLayout";
import { StatCard } from "@/components/dashboard/StatCard";
import { EventCard } from "@/components/dashboard/EventCard";
import { RecentEventsTable } from "@/components/dashboard/RecentEventsTable";
import { EventosPorMesChart } from "@/components/dashboard/EventosPorMesChart";
import { DistribuicaoPorTipo } from "@/components/dashboard/DistribuicaoPorTipo";
import { useEventos, useEventosStats } from "@/hooks/useEventos";
import { Calendar, Users, CalendarCheck, TrendingUp, PlusCircle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function Dashboard() {
  const { total, proximos, vagasOcupadas, taxaOcupacao, tendencias, eventosPorMes, distribuicaoPorTipo } = useEventosStats();
  const { data: eventos, isLoading } = useEventos();

  if (isLoading) return (
    <MainLayout title="Dashboard" subtitle="Visão geral do sistema Inovar App">
       <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
         {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-28 w-full rounded-xl" />)}
       </div>
       <div className="space-y-6">
         <div className="grid gap-6 lg:grid-cols-3">
           <Skeleton className="col-span-1 lg:col-span-2 h-[280px] w-full rounded-xl" />
           <Skeleton className="col-span-1 h-[280px] w-full rounded-xl" />
         </div>
       </div>
    </MainLayout>
  );

  const proximosEventos = eventos?.filter((e: any) => new Date(e.data_inicio) >= new Date() && e.status !== "cancelado").slice(0, 4) || [];
  const recentes = eventos?.slice(0, 5) || [];

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
              <Link href="/eventos/novo"><PlusCircle className="mr-2 h-4 w-4"/>Novo Evento</Link>
            </Button>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {proximosEventos.length === 0 ? (
              <div className="col-span-full border border-dashed rounded-lg p-8 text-center bg-card/30">
                <p className="text-muted-foreground">Nenhum evento próximo encontrado.</p>
              </div>
            ) : proximosEventos.map((ev: any) => <EventCard key={ev.id} evento={ev} />)}
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
