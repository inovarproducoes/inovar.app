"use client";
import { MainLayout } from "@/components/layout/MainLayout";
import { useEventos } from "@/hooks/useEventos";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";

export default function ParticipantesPage() {
  const { data: eventos, isLoading: loadingEventos } = useEventos();
  const [eventoSelecionado, setEventoSelecionado] = useState("");
  const [busca, setBusca] = useState("");
  const [status, setStatus] = useState("todos");
  const [tipo, setTipo] = useState("todos");

  return (
    <MainLayout title="Participantes" subtitle="Gestão de inscritos e convidados por evento">
       <div className="flex flex-col md:flex-row gap-4 mb-6">
        <Select value={eventoSelecionado} onValueChange={setEventoSelecionado}>
          <SelectTrigger className="w-full md:w-[300px]">
            <SelectValue placeholder={loadingEventos ? "Carregando Eventos..." : "Selecione um Evento"} />
          </SelectTrigger>
          <SelectContent>
            {eventos?.map(e => <SelectItem key={e.id} value={e.id}>{e.nome}</SelectItem>)}
          </SelectContent>
        </Select>

        <Input placeholder="Buscar por nome ou email..." value={busca} onChange={e => setBusca(e.target.value)} className="flex-1" disabled={!eventoSelecionado} />
        
        <Select value={status} onValueChange={setStatus} disabled={!eventoSelecionado}>
          <SelectTrigger className="w-[150px]"><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos os Status</SelectItem>
            <SelectItem value="pendente">Pendente</SelectItem>
            <SelectItem value="confirmado">Confirmado</SelectItem>
            <SelectItem value="cancelado">Cancelado</SelectItem>
          </SelectContent>
        </Select>

        <Select value={tipo} onValueChange={setTipo} disabled={!eventoSelecionado}>
          <SelectTrigger className="w-[150px]"><SelectValue placeholder="Tipo" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos os Tipos</SelectItem>
            <SelectItem value="comum">Comum</SelectItem>
            <SelectItem value="vip">VIP</SelectItem>
            <SelectItem value="palestrante">Palestrante</SelectItem>
            <SelectItem value="staff">Staff</SelectItem>
          </SelectContent>
        </Select>
        
        <Button disabled={!eventoSelecionado}>Novo</Button>
       </div>

       <div className="border rounded-lg bg-card min-h-[400px] flex items-center justify-center p-6 text-center text-muted-foreground">
          {!eventoSelecionado ? (
             <p>Selecione um evento no filtro acima para visualizar os participantes.</p>
          ) : (
             <p>Lista de participantes mockada. Na implementação completa, buscaria da API /api/participantes?evento_id={eventoSelecionado}</p>
          )}
       </div>
    </MainLayout>
  );
}
