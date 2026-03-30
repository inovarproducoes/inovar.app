"use client";
import { MainLayout } from "@/components/layout/MainLayout";
import { useState } from "react";
import { useQuery } from '@tanstack/react-query';
import { clientesService } from "@/services/clientesService";
import { Cliente } from "@/types/clientes";
import { useDebounce } from "@/hooks/useDebounce";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { User, Phone, CheckCircle2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function ClientesPage() {
  const [busca, setBusca] = useState("");
  const debouncedBusca = useDebounce(busca, 300);
  const [origem, setOrigem] = useState("todas");
  const [novoCliente, setNovoCliente] = useState({nome: "", telefone: "", email: "", origem: "whatsapp"});
  const [clienteDetalhes, setClienteDetalhes] = useState<Cliente | null>(null);

  const { data: clientes, isLoading } = useQuery({
    queryKey: ['clientes', debouncedBusca],
    queryFn: () => clientesService.buscarClientes(debouncedBusca.length >= 2 ? debouncedBusca : undefined),
    staleTime: 1000 * 60 * 5 // 5 minutes
  });

  const total = clientes?.length || 0;

  return (
    <MainLayout title="Clientes (CRM)" subtitle="Gestão de contatos de clientes">
      <div className="grid md:grid-cols-1 gap-6 mb-6">
        <div className="bg-card/60 backdrop-blur-xl p-4 rounded-xl border border-white/5 shadow-sm flex items-center gap-4 hover:border-primary/30 transition-colors">
          <div className="bg-primary/10 p-3 rounded-full text-primary"><User className="w-6 h-6"/></div>
          <div><p className="text-2xl font-bold">{total}</p><p className="text-sm text-muted-foreground">Total de Clientes no CRM</p></div>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-6">
         <Input placeholder="Buscar por nome ou telefone..." className="w-full md:max-w-md" value={busca} onChange={e => setBusca(e.target.value)} />
         <Select value={origem} onValueChange={setOrigem}>
           <SelectTrigger className="w-[200px]"><SelectValue placeholder="Origem" /></SelectTrigger>
           <SelectContent>
             <SelectItem value="todas">Todas as Origens</SelectItem>
             <SelectItem value="whatsapp">WhatsApp Inbound</SelectItem>
           </SelectContent>
         </Select>
         <div className="flex-1"></div>
         <Dialog>
           <DialogTrigger asChild>
             <Button>Novo Cliente</Button>
           </DialogTrigger>
             <DialogContent className="sm:max-w-[500px]">
               <DialogHeader>
                 <DialogTitle>Cadastrar Cliente</DialogTitle>
                 <DialogDescription>
                   Adicionar um novo cliente ao CRM.
                 </DialogDescription>
               </DialogHeader>
               <div className="grid gap-4 py-4">

                 <div className="grid grid-cols-4 items-center gap-4">
                   <Label className="text-right">Nome *</Label>
                   <Input className="col-span-3" placeholder="Ex: Maria" value={novoCliente.nome} onChange={e => setNovoCliente({...novoCliente, nome: e.target.value})} />
                 </div>
                 <div className="grid grid-cols-4 items-center gap-4">
                   <Label className="text-right">Email</Label>
                   <Input type="email" className="col-span-3" placeholder="email@exemplo.com" value={novoCliente.email} onChange={e => setNovoCliente({...novoCliente, email: e.target.value})} />
                 </div>
                 <div className="grid grid-cols-4 items-center gap-4">
                   <Label className="text-right">WhatsApp *</Label>
                   <Input className="col-span-3" placeholder="(00) 00000-0000" value={novoCliente.telefone} onChange={e => setNovoCliente({...novoCliente, telefone: e.target.value})} />
                 </div>
             </div>
             <DialogFooter>
                <Button onClick={() => toast("Cliente cadastrado!", { description: "Simulação de criação bem sucedida." })}>Salvar Cliente</Button>
             </DialogFooter>
           </DialogContent>
         </Dialog>
      </div>

      <div className="border rounded-lg overflow-hidden bg-card">
         <table className="w-full text-sm text-left">
           <thead className="bg-muted text-muted-foreground uppercase text-xs">
             <tr>
               <th className="px-6 py-3">Nome / Empresa</th>
                <th className="px-6 py-3">Contato</th>
                <th className="px-6 py-3">Origem</th>
               <th className="px-6 py-3 text-right">Ações</th>
             </tr>
           </thead>
           <tbody>
             {isLoading ? (
               [1, 2, 3, 4].map(i => (
                 <tr key={i} className="border-b">
                   <td className="px-6 py-4"><Skeleton className="h-4 w-32 mb-1"/><Skeleton className="h-3 w-20"/></td>
                   <td className="px-6 py-4"><Skeleton className="h-4 w-24 mb-1"/><Skeleton className="h-3 w-32"/></td>
                   <td className="px-6 py-4"><Skeleton className="h-6 w-16 rounded-full"/></td>
                   <td className="px-6 py-4 text-right"><Skeleton className="h-8 w-24 ml-auto"/></td>
                 </tr>
               ))
             ) : clientes?.length === 0 ? (
               <tr><td colSpan={4} className="text-center py-6 text-muted-foreground">Nenhum cliente encontrado.</td></tr>
             ) : clientes?.map(cliente => (
               <tr key={cliente.id} className="border-b hover:bg-muted/50 cursor-pointer" onClick={() => setClienteDetalhes(cliente)}>
                 <td className="px-6 py-4">
                   <p className="font-medium text-foreground">{cliente.nome}</p>
                 </td>
                 <td className="px-6 py-4">
                   <p className="text-sm font-medium">{cliente.telefone}</p>
                   {cliente.email && <p className="text-xs text-muted-foreground">{cliente.email}</p>}
                 </td>

                 <td className="px-6 py-4">
                   <Badge variant="outline" className="capitalize text-xs font-normal">{'WhatsApp'}</Badge>
                 </td>
                 <td className="px-6 py-4 text-right">
                   <Button variant="outline" size="sm" onClick={(e) => { e.stopPropagation(); setClienteDetalhes(cliente); }}>Ver Detalhes</Button>
                 </td>
               </tr>
             ))}
           </tbody>
         </table>
      </div>

      <Dialog open={!!clienteDetalhes} onOpenChange={(open) => !open && setClienteDetalhes(null)}>
        <DialogContent className="sm:max-w-[500px] h-[60vh] flex flex-col pt-8">
          <DialogHeader>
            <DialogTitle className="text-2xl flex items-center gap-3">
              <User className="w-6 h-6 text-muted-foreground" />
              {clienteDetalhes?.nome}
            </DialogTitle>
            <DialogDescription>
              Registrado em {clienteDetalhes?.created_at ? format(new Date(clienteDetalhes.created_at), 'dd/MM/yyyy') : ''}
            </DialogDescription>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto space-y-6 pr-4">
            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-1 bg-muted/30 p-4 rounded-md">
                <p className="text-sm text-muted-foreground">Contato Principal</p>
                <div className="flex items-center gap-2 font-medium">
                  <Phone className="w-4 h-4 text-primary" /> {clienteDetalhes?.telefone}
                </div>
                {clienteDetalhes?.email && <p className="text-sm text-muted-foreground mt-2">{clienteDetalhes.email}</p>}
              </div>

              <div className="space-y-1 bg-muted/30 p-4 rounded-md border border-border">
                <p className="text-sm text-muted-foreground mb-2">Origem do Cadastro</p>
                <Badge variant="outline" className="bg-success/10 text-success border-success/20">WhatsApp</Badge>
              </div>
            </div>
            
            <div className="space-y-3 mt-6">
              <h3 className="font-semibold text-lg flex items-center gap-2"><CheckCircle2 className="w-5 h-5 text-gray-400" /> Registro Ativo</h3>
              <div className="bg-card border rounded-lg p-4 w-full">
                <p className="text-sm text-muted-foreground">O cliente está devidamente cadastrado no CRM. Histórico de chamados ou compras podem ser consultados externamente (Integração).</p>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </MainLayout>
  );
}
