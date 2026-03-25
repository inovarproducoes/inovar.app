"use client";
import { MainLayout } from "@/components/layout/MainLayout";
import { useEventos } from "@/hooks/useEventos";
import { useState, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Edit2, Search } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

// Mock data as per HTML until integrated with backend
const mockParticipantes = [
  { id: "1", nome: "Maria Lima", email: "maria@email.com", telefone: "(62) 99999-0001", evento: "Formatura Eng. Civil", tipo: "VIP", status: "Confirmado", avatarColor: "bg-indigo-500" },
  { id: "2", nome: "João Santos", email: "joao@email.com", telefone: "(62) 98888-0002", evento: "Workshop Liderança", tipo: "Comum", status: "Pendente", avatarColor: "bg-cyan-500" },
  { id: "3", nome: "Ana Ferreira", email: "ana@email.com", telefone: "(62) 97777-0003", evento: "Formatura Eng. Civil", tipo: "Staff", status: "Confirmado", avatarColor: "bg-emerald-600" },
];

export default function ParticipantesPage() {
  const { data: eventos, isLoading: loadingEventos } = useEventos();
  const [eventoSelecionado, setEventoSelecionado] = useState("todos");
  const [busca, setBusca] = useState("");
  const [status, setStatus] = useState("todos");

  const filtered = useMemo(() => {
    let result = mockParticipantes;
    if (busca) {
      result = result.filter(p => p.nome.toLowerCase().includes(busca.toLowerCase()) || p.email.toLowerCase().includes(busca.toLowerCase()));
    }
    if (eventoSelecionado !== "todos") {
      // In real scenario, filter by evento_id instead of string matching
      const evt = eventos?.find(e => e.id === eventoSelecionado);
      if (evt) {
         result = result.filter(p => p.evento === evt.nome || p.evento.includes("Eng. Civil")); // just for mock
      }
    }
    if (status !== "todos") {
      result = result.filter(p => p.status.toLowerCase() === status.toLowerCase());
    }
    return result;
  }, [busca, eventoSelecionado, status, eventos]);

  return (
    <MainLayout title="Participantes" subtitle="Gestão de inscritos e convidados por evento">
       <div className="flex flex-col md:flex-row items-center gap-4 mb-6">
        <div className="relative w-full md:max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Buscar participante..." value={busca} onChange={e => setBusca(e.target.value)} className="pl-9 w-full bg-card" />
        </div>

        <Select value={eventoSelecionado} onValueChange={setEventoSelecionado}>
          <SelectTrigger className="w-full md:w-[200px] bg-card">
            <SelectValue placeholder={loadingEventos ? "Carregando Eventos..." : "Todos os eventos"} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos os eventos</SelectItem>
            {eventos?.map(e => <SelectItem key={e.id} value={e.id}>{e.nome}</SelectItem>)}
          </SelectContent>
        </Select>

        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger className="w-full md:w-[160px] bg-card"><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos os status</SelectItem>
            <SelectItem value="confirmado">Confirmado</SelectItem>
            <SelectItem value="pendente">Pendente</SelectItem>
            <SelectItem value="cancelado">Cancelado</SelectItem>
          </SelectContent>
        </Select>
        
        <Dialog>
          <DialogTrigger asChild>
            <Button className="w-full md:w-auto md:ml-auto">+ Adicionar Participante</Button>
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

       <div className="border rounded-lg bg-card overflow-hidden shadow-sm">
          <div className="w-full overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-muted/50 text-muted-foreground uppercase text-[11.5px] tracking-wider">
                <tr>
                  <th className="px-5 py-3 font-semibold">Nome</th>
                  <th className="px-5 py-3 font-semibold">Email</th>
                  <th className="px-5 py-3 font-semibold">Telefone</th>
                  <th className="px-5 py-3 font-semibold">Evento</th>
                  <th className="px-5 py-3 font-semibold">Tipo</th>
                  <th className="px-5 py-3 font-semibold">Status</th>
                  <th className="px-5 py-3 font-semibold text-right"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map(p => (
                  <tr key={p.id} className="bg-card hover:bg-muted/30 transition-colors">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <Avatar className={`h-8 w-8 text-xs font-bold text-white ${p.avatarColor}`}>
                          <AvatarFallback className="bg-transparent">{p.nome.substring(0, 2).toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <div className="font-bold text-[13.5px]">{p.nome}</div>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-[13.5px] text-muted-foreground">{p.email}</td>
                    <td className="px-5 py-3 text-[13.5px]">{p.telefone}</td>
                    <td className="px-5 py-3 text-[13.5px]">{p.evento}</td>
                    <td className="px-5 py-3">
                      <Badge variant="outline" className={`font-semibold text-[10.5px] tracking-wide relative
                        ${p.tipo === 'VIP' ? 'bg-orange-50 text-orange-600 border-orange-200 dark:bg-orange-950/50 dark:text-orange-400' : ''}
                        ${p.tipo === 'Staff' ? 'bg-blue-50 text-blue-600 border-blue-200 dark:bg-blue-950/50 dark:text-blue-400' : ''}
                        ${p.tipo === 'Comum' ? 'bg-secondary text-muted-foreground' : ''}
                      `}>
                        {p.tipo}
                      </Badge>
                    </td>
                    <td className="px-5 py-3">
                      <Badge variant="outline" className={`relative pl-3 capitalize ${
                        p.status === 'Confirmado' ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-400' :
                        p.status === 'Pendente' ? 'bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-950/50 dark:text-yellow-400' :
                        'bg-red-50 text-red-700 border-red-200 dark:bg-red-950/50 dark:text-red-400'
                      }`}>
                        <span className="absolute left-1.5 top-1/2 -translate-y-1/2 w-1 h-1 rounded-full bg-current" />
                        {p.status}
                      </Badge>
                    </td>
                    <td className="px-5 py-3 text-right">
                       <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:bg-muted"><Edit2 className="h-4 w-4" /></Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filtered.length === 0 && (
              <div className="p-8 text-center text-muted-foreground text-sm">Nenhum participante encontrado.</div>
            )}
          </div>
       </div>
    </MainLayout>
  );
}
