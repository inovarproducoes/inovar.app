"use client";
import { MainLayout } from "@/components/layout/MainLayout";
import { useEventos, useDeleteEvento } from "@/hooks/useEventos";
import { EventCard } from "@/components/dashboard/EventCard";
import { RecentEventsTable } from "@/components/dashboard/RecentEventsTable";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { PlusCircle, LayoutGrid, List } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

export default function EventosPage() {
  const { data: eventos, isLoading } = useEventos();
  const { mutate: deleteEvento } = useDeleteEvento();
  const [view, setView] = useState<"grid" | "list">("grid");
  const [busca, setBusca] = useState("");
  const [statusFilter, setStatusFilter] = useState("todos");

  if (isLoading) return <MainLayout title="Eventos"><div className="flex justify-center items-center h-full">Carregando...</div></MainLayout>;

  let filtered = eventos || [];
  if (statusFilter !== "todos") {
    filtered = filtered.filter((e: any) => e.status === statusFilter);
  }
  if (busca) {
    const q = busca.toLowerCase();
    filtered = filtered.filter((e: any) => e.nome.toLowerCase().includes(q) || e.local_nome.toLowerCase().includes(q));
  }

  const handleDelete = (id: string) => {
    if (confirm("Deseja realmente excluir este evento?")) {
      deleteEvento(id);
    }
  };

  return (
    <MainLayout title="Eventos" subtitle="Gestão de todos os eventos educacionais e corporativos">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
          <Input placeholder="Buscar evento/local..." value={busca} onChange={e => setBusca(e.target.value)} className="w-full sm:w-64" />
        </div>
        
        <div className="flex gap-2 w-full sm:w-auto justify-end">
          <div className="flex bg-muted rounded-md p-1 border">
            <button onClick={() => setView("grid")} className={`p-1.5 rounded ${view === 'grid' ? 'bg-background shadow-sm' : 'text-muted-foreground'}`}><LayoutGrid className="w-4 h-4" /></button>
            <button onClick={() => setView("list")} className={`p-1.5 rounded ${view === 'list' ? 'bg-background shadow-sm' : 'text-muted-foreground'}`}><List className="w-4 h-4" /></button>
          </div>
          <Link href="/eventos/novo">
            <Button className="gap-2"><PlusCircle className="w-4 h-4" /> Novo Evento</Button>
          </Link>
        </div>
      </div>

      <Tabs defaultValue="todos" value={statusFilter} onValueChange={setStatusFilter} className="w-full mb-6 relative z-0">
         <TabsList className="w-full justify-start overflow-x-auto border-b rounded-none bg-transparent p-0 pl-1 h-auto">
           {["todos", "planejamento", "confirmado", "em_andamento", "finalizado", "cancelado"].map(status => (
             <TabsTrigger key={status} value={status} className="capitalize rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none py-3">
               {status.replace("_", " ")}
             </TabsTrigger>
           ))}
         </TabsList>
      </Tabs>

      {filtered.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground bg-card border rounded-lg">
          Nenhum evento encontrado.
        </div>
      ) : view === "grid" ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filtered.map((ev: any) => (
            <Link key={ev.id} href={`/eventos/${ev.id}`} className="block relative group">
              <EventCard evento={ev} onDelete={(id) => {
                 // Previne o clique de link quando clicar no botão excluir
                 handleDelete(id);
              }} />
            </Link>
          ))}
        </div>
      ) : (
        <RecentEventsTable eventos={filtered} />
      )}
    </MainLayout>
  );
}
