"use client";
import { MainLayout } from "@/components/layout/MainLayout";
import { StatCard } from "@/components/dashboard/StatCard";
import { EventCard } from "@/components/dashboard/EventCard";
import { RecentEventsTable } from "@/components/dashboard/RecentEventsTable";
import { useEventos, useEventosStats } from "@/hooks/useEventos";
import { Calendar, Users, BarChart3, Clock } from "lucide-react";

export default function Dashboard() {
  const { total, proximos, vagasOcupadas, taxaOcupacao } = useEventosStats();
  const { data: eventos, isLoading } = useEventos();

  if (isLoading) return <MainLayout title="Dashboard"><div className="flex justify-center items-center h-full">Carregando...</div></MainLayout>;

  const proximosEventos = eventos?.filter(e => new Date(e.data_inicio) >= new Date() && e.status !== "cancelado").slice(0, 4) || [];
  const recentes = eventos?.slice(0, 5) || [];

  return (
    <MainLayout title="Dashboard" subtitle="Visão geral do sistema Inovar App">
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <StatCard title="Total Eventos" value={total} icon={Calendar} description="Todos os eventos" className="bg-gradient-to-br from-primary/10 to-primary/5" />
        <StatCard title="Próximos Eventos" value={proximos} icon={Clock} description="Para os próximos dias" className="bg-gradient-to-br from-info/10 to-info/5" />
        <StatCard title="Vagas Ocupadas" value={vagasOcupadas} icon={Users} description="Participantes confirmados" className="bg-gradient-to-br from-success/10 to-success/5" />
        <StatCard title="Taxa Ocupação" value={`${taxaOcupacao}%`} icon={BarChart3} description="Média geral" className="bg-gradient-to-br from-warning/10 to-warning/5" />
      </div>

      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-bold mb-4">Próximos Eventos</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {proximosEventos.length === 0 ? (
              <p className="text-muted-foreground">Nenhum evento próximo programado.</p>
            ) : proximosEventos.map(ev => <EventCard key={ev.id} evento={ev} />)}
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
