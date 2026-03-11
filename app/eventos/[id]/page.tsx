"use client";
import { MainLayout } from "@/components/layout/MainLayout";
import { useEvento, useUpdateEvento } from "@/hooks/useEventos";
import { useParams } from "next/navigation";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
import { format } from "date-fns";
import { MapPin, Calendar, Users, DollarSign, Clock, UsersIcon, ShieldCheck } from "lucide-react";

export default function EventoDetalhesPage() {
  const params = useParams();
  const id = params.id as string;
  const { data: evento, isLoading } = useEvento(id);
  const { mutate: updateEvento } = useUpdateEvento();

  if (isLoading || !evento) return <MainLayout title="Detalhes do Evento"><div className="flex justify-center items-center h-full">Carregando...</div></MainLayout>;

  const handleChecklistToggle = (idx: number) => {
    if (!evento.checklist) return;
    const newList = [...evento.checklist];
    newList[idx].feito = !newList[idx].feito;
    updateEvento({ id, checklist: newList });
  };

  const percentOcupado = evento.capacidade_maxima > 0 ? ((evento.capacidade_maxima - evento.vagas_disponiveis) / evento.capacidade_maxima) * 100 : 0;

  return (
    <MainLayout title={evento.nome} subtitle={`Cadastrado em ${format(new Date(evento.created_at), 'dd/MM/yyyy')}`}>
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
           <Card>
             <CardHeader className="flex flex-row justify-between items-center">
                <CardTitle className="text-xl">Visão Geral</CardTitle>
                <Badge>{evento.status}</Badge>
             </CardHeader>
             <CardContent className="grid sm:grid-cols-2 gap-4">
               <div className="flex items-center gap-3">
                 <Calendar className="w-5 h-5 text-muted-foreground" />
                 <div>
                   <p className="text-sm text-muted-foreground">Data</p>
                   <p className="font-medium">{format(new Date(evento.data_inicio), 'dd/MM/yyyy')}</p>
                 </div>
               </div>
               <div className="flex items-center gap-3">
                 <Clock className="w-5 h-5 text-muted-foreground" />
                 <div>
                   <p className="text-sm text-muted-foreground">Horário</p>
                   <p className="font-medium">{evento.horario_inicio} - {evento.horario_fim}</p>
                 </div>
               </div>
               <div className="flex items-center gap-3">
                 <MapPin className="w-5 h-5 text-muted-foreground" />
                 <div>
                   <p className="text-sm text-muted-foreground">Local</p>
                   {evento.link_maps ? (
                     <a href={evento.link_maps} target="_blank" rel="noreferrer" className="text-primary hover:underline">{evento.local_nome}</a>
                   ) : <p className="font-medium">{evento.local_nome}</p>}
                 </div>
               </div>
               <div className="flex items-center gap-3">
                 <UsersIcon className="w-5 h-5 text-muted-foreground" />
                 <div>
                   <p className="text-sm text-muted-foreground">Ocupação</p>
                   <p className="font-medium">{evento.capacidade_maxima - evento.vagas_disponiveis} / {evento.capacidade_maxima}</p>
                 </div>
               </div>
             </CardContent>
           </Card>

           <Card>
             <CardHeader>
                <CardTitle>Checklist</CardTitle>
             </CardHeader>
             <CardContent className="space-y-3">
               {evento.checklist && evento.checklist.length > 0 ? evento.checklist.map((item, idx) => (
                 <div key={idx} className="flex items-center space-x-2">
                   <Checkbox id={`check-${idx}`} checked={item.feito} onCheckedChange={() => handleChecklistToggle(idx)} />
                   <label htmlFor={`check-${idx}`} className={`text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 ${item.feito ? 'line-through text-muted-foreground' : ''}`}>
                     {item.item}
                   </label>
                 </div>
               )) : <p className="text-muted-foreground text-sm">Nenhum item adicionado.</p>}
             </CardContent>
           </Card>

           {evento.tipo_evento === 'formatura' && (
             <Card>
               <CardHeader><CardTitle>Alunos Vinculados</CardTitle></CardHeader>
               <CardContent>
                 <p className="text-sm text-muted-foreground">Componente AlunosEventoSection renderizado aqui.</p>
               </CardContent>
             </Card>
           )}
        </div>

        <div className="space-y-6">
           <Card>
              <CardHeader><CardTitle>Capacidade</CardTitle></CardHeader>
              <CardContent>
                <div className="mb-2 flex justify-between text-sm">
                  <span>{percentOcupado.toFixed(1)}% Ocupado</span>
                </div>
                <Progress value={percentOcupado} className="h-2" />
                <p className="text-xs text-muted-foreground mt-3">{evento.vagas_disponiveis} vagas restantes</p>
              </CardContent>
           </Card>
           
           <Card>
              <CardHeader><CardTitle>Financeiro</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                 <div className="flex justify-between items-center p-3 bg-muted rounded">
                   <span className="text-sm font-medium">Valor Total</span>
                   <span className="font-bold">R$ {evento.valor_total.toFixed(2)}</span>
                 </div>
                 <div className="flex justify-between items-center p-3 bg-success/10 text-success rounded">
                   <span className="text-sm font-medium">Entrada Paga</span>
                   <span className="font-bold">R$ {evento.valor_entrada.toFixed(2)}</span>
                 </div>
                 <div className="flex justify-between items-center p-3 bg-destructive/10 text-destructive rounded">
                   <span className="text-sm font-medium">Pendente</span>
                   <span className="font-bold">R$ {evento.valor_pendente.toFixed(2)}</span>
                 </div>
              </CardContent>
           </Card>

           <Card>
              <CardHeader><CardTitle>Responsável/Cliente</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                 <div className="flex items-center gap-2 text-sm"><Users className="w-4 h-4 text-muted-foreground" /> <span>{evento.cliente_nome || evento.responsavel_nome || 'Não definido'}</span></div>
                 {evento.responsavel_cpf && <div className="flex items-center gap-2 text-sm"><ShieldCheck className="w-4 h-4 text-muted-foreground" /> <span>{evento.responsavel_cpf}</span></div>}
              </CardContent>
           </Card>
        </div>
      </div>
    </MainLayout>
  );
}
