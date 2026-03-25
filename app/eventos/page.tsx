"use client";
import { MainLayout } from "@/components/layout/MainLayout";
import { useEventos, useDeleteEvento } from "@/hooks/useEventos";
import { EventCard } from "@/components/dashboard/EventCard";
import { RecentEventsTable } from "@/components/dashboard/RecentEventsTable";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { PlusCircle, LayoutGrid, List, Trash2, Calendar, FileText } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import Link from "next/link";
import { useState } from "react";
import { Evento } from "@/types/database";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useRouter } from "next/navigation";

export default function EventosPage() {
  const { data: eventos, isLoading } = useEventos();
  const { mutate: deleteEvento } = useDeleteEvento();
  const [view, setView] = useState<"grid" | "list">("grid");
  const [busca, setBusca] = useState("");
  const [statusFilter, setStatusFilter] = useState("todos");
  const [tipoFilter, setTipoFilter] = useState("todos");
  const [eventoToDelete, setEventoToDelete] = useState<string | null>(null);
  const router = useRouter();

  if (isLoading) return (
    <MainLayout title="Eventos">
      <div className="flex justify-between items-center mb-6 mt-2">
         <Skeleton className="h-10 w-64 rounded-md" />
         <Skeleton className="h-10 w-32 rounded-md" />
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {[1, 2, 3, 4, 5, 6, 7, 8].map(i => <Skeleton key={i} className="h-32 w-full rounded-xl bg-card/50" />)}
      </div>
    </MainLayout>
  );

  let filtered = eventos || [];
  if (statusFilter !== "todos") {
    filtered = filtered.filter((e: Evento) => e.status === statusFilter);
  }
  if (tipoFilter !== "todos") {
    filtered = filtered.filter((e: Evento) => e.tipo_evento === tipoFilter);
  }
  if (busca) {
    const q = busca.toLowerCase();
    filtered = filtered.filter((e: Evento) => e.nome.toLowerCase().includes(q) || e.local_nome.toLowerCase().includes(q));
  }

  const handleDelete = (id: string, e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
      e.preventDefault();
    }
    setEventoToDelete(id);
  };

  return (
    <MainLayout title="Eventos" subtitle="Gestão de todos os eventos educacionais e corporativos">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
          <Input placeholder="Buscar evento/local..." value={busca} onChange={e => setBusca(e.target.value)} className="w-full sm:w-64" />
          <Select value={tipoFilter} onValueChange={setTipoFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Tipo de Evento" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos os tipos</SelectItem>
              <SelectItem value="corporativo">Corporativo</SelectItem>
              <SelectItem value="casamento">Casamento</SelectItem>
              <SelectItem value="festa">Festa</SelectItem>
              <SelectItem value="workshop">Workshop</SelectItem>
              <SelectItem value="conferencia">Conferência</SelectItem>
              <SelectItem value="aniversario">Aniversário</SelectItem>
              <SelectItem value="formatura">Formatura</SelectItem>
              <SelectItem value="outro">Outro</SelectItem>
            </SelectContent>
          </Select>
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
        <div className="text-center py-12 text-muted-foreground bg-card border rounded-lg flex flex-col items-center">
          <FileText className="h-10 w-10 mb-4 opacity-50" />
          <p>Nenhum evento encontrado.</p>
        </div>
      ) : view === "grid" ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filtered.map((ev: Evento) => (
            <Link key={ev.id} href={`/eventos/${ev.id}`} className="block relative group">
              <EventCard evento={ev} onDelete={(e, id) => handleDelete(id, e)} />
            </Link>
          ))}
        </div>
      ) : (
        <div className="border rounded-lg overflow-x-auto bg-card">
          <table className="w-full text-sm text-left">
            <thead className="bg-muted text-muted-foreground uppercase text-xs">
              <tr>
                <th className="px-6 py-3">Nome</th>
                <th className="px-6 py-3">Tipo</th>
                <th className="px-6 py-3">Data</th>
                <th className="px-6 py-3">Local</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3 text-right">Ações</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((ev: Evento) => (
                <tr key={ev.id} onClick={() => router.push(`/eventos/${ev.id}`)} className="border-b transition-colors hover:bg-muted/50 cursor-pointer">
                  <td className="px-6 py-4 font-medium">{ev.nome}</td>
                  <td className="px-6 py-4 capitalize">{ev.tipo_evento}</td>
                  <td className="px-6 py-4">{format(new Date(ev.data_inicio), "dd/MM/yyyy")}</td>
                  <td className="px-6 py-4 truncate max-w-[200px]">{ev.local_nome}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize
                      ${ev.status === 'planejamento' ? 'bg-info/10 text-info' : ''}
                      ${ev.status === 'confirmado' ? 'bg-success/10 text-success' : ''}
                      ${ev.status === 'em_andamento' ? 'bg-warning/10 text-warning' : ''}
                      ${ev.status === 'finalizado' ? 'bg-muted text-muted-foreground' : ''}
                      ${ev.status === 'cancelado' ? 'bg-destructive/10 text-destructive' : ''}
                    `}>
                      {ev.status.replace("_", " ")}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Button variant="ghost" size="icon" className="text-destructive hover:bg-destructive/10 hover:text-destructive z-10 relative" onClick={(e) => handleDelete(ev.id, e)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <AlertDialog open={!!eventoToDelete} onOpenChange={(open) => !open && setEventoToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir evento?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. Todos os dados vinculados a este evento serão permanentemente apagados.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={() => eventoToDelete && deleteEvento(eventoToDelete)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Excluir Evento
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </MainLayout>
  );
}
