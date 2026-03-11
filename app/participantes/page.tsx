"use client";
import { MainLayout } from "@/components/layout/MainLayout";
import { useEventos } from "@/hooks/useEventos";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Users, Edit2, Trash2 } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

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
        
        <Dialog>
          <DialogTrigger asChild>
            <Button disabled={!eventoSelecionado}>+ Novo Participante</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Novo Participante</DialogTitle>
              <DialogDescription>Adicionar um participante ao evento selecionado.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">Nome *</Label>
                <Input className="col-span-3" placeholder="Ex: Maria" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">Email</Label>
                <Input type="email" className="col-span-3" placeholder="maria@exemplo.com" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">Telefone</Label>
                <Input className="col-span-3" placeholder="(00) 00000-0000" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">Status</Label>
                <Select defaultValue="pendente">
                  <SelectTrigger className="col-span-3"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pendente">Pendente</SelectItem>
                    <SelectItem value="confirmado">Confirmado</SelectItem>
                    <SelectItem value="cancelado">Cancelado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">Tipo</Label>
                <Select defaultValue="comum">
                  <SelectTrigger className="col-span-3"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="comum">Comum</SelectItem>
                    <SelectItem value="vip">VIP</SelectItem>
                    <SelectItem value="staff">Staff</SelectItem>
                    <SelectItem value="palestrante">Palestrante</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-start gap-4">
                <Label className="text-right mt-2">Obs.</Label>
                <Textarea className="col-span-3" rows={3} placeholder="Observações..." />
              </div>
            </div>
            <DialogFooter>
              <Button onClick={() => toast.success("Participante adicionado!")}>Salvar</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
       </div>

       <div className={`border rounded-lg bg-card min-h-[400px] flex ${!eventoSelecionado ? 'items-center justify-center p-6 text-center text-muted-foreground' : 'flex-col'}`}>
          {!eventoSelecionado ? (
             <div className="flex flex-col items-center gap-2">
               <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-2">
                 <Users className="w-8 h-8 text-muted-foreground" />
               </div>
               <p className="text-lg font-medium text-foreground">Selecione um evento</p>
               <p>Escolha um evento no filtro acima para visualizar os participantes.</p>
             </div>
          ) : (
             <div className="w-full overflow-x-auto">
               <table className="w-full text-sm text-left">
                 <thead className="bg-muted text-muted-foreground uppercase text-xs">
                   <tr>
                     <th className="px-6 py-3">Nome</th>
                     <th className="px-6 py-3">Email</th>
                     <th className="px-6 py-3">Telefone</th>
                     <th className="px-6 py-3">Evento</th>
                     <th className="px-6 py-3">Status</th>
                     <th className="px-6 py-3">Tipo</th>
                     <th className="px-6 py-3 text-right">Ações</th>
                   </tr>
                 </thead>
                 <tbody>
                   <tr className="border-b transition-colors hover:bg-muted/50">
                     <td className="px-6 py-4 font-medium">João Exemplo</td>
                     <td className="px-6 py-4">joao@exemplo.com</td>
                     <td className="px-6 py-4">(11) 99999-9999</td>
                     <td className="px-6 py-4 truncate max-w-[150px]">{eventos?.find(e => e.id === eventoSelecionado)?.nome || "Evento"}</td>
                     <td className="px-6 py-4">
                       <Badge className="bg-success hover:bg-success/90 text-white">Confirmado</Badge>
                     </td>
                     <td className="px-6 py-4">
                       <Badge variant="outline">VIP</Badge>
                     </td>
                     <td className="px-6 py-4 text-right">
                       <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary"><Edit2 className="h-4 w-4" /></Button>
                       <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive"><Trash2 className="h-4 w-4" /></Button>
                     </td>
                   </tr>
                 </tbody>
               </table>
             </div>
          )}
       </div>
    </MainLayout>
  );
}
