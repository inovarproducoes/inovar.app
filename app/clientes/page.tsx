"use client";

import { MainLayout } from "@/components/layout/MainLayout";
import { useState } from "react";
import { useQuery } from '@tanstack/react-query';
import { clientesService } from "@/services/clientesService";
import { Cliente } from "@/types/clientes";
import { useDebounce } from "@/hooks/useDebounce";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { User, Phone, CheckCircle2, Search, Filter, Plus, Mail, MessageSquare, ExternalLink, Hash, Calendar } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function ClientesPage() {
  const [busca, setBusca] = useState("");
  const debouncedBusca = useDebounce(busca, 300);
  const [origem, setOrigem] = useState("todas");
  const [novoCliente, setNovoCliente] = useState({nome: "", telefone: "", email: "", origem: "whatsapp"});
  const [clienteDetalhes, setClienteDetalhes] = useState<Cliente | null>(null);

  const { data: clientes, isLoading } = useQuery({
    queryKey: ['clientes', debouncedBusca],
    queryFn: () => clientesService.buscarClientes(debouncedBusca.length >= 2 ? debouncedBusca : undefined),
    staleTime: 1000 * 60 * 5
  });

  const total = clientes?.length || 0;

  const handleOpenWhatsApp = (telefone: string) => {
    const cleaned = telefone.replace(/\D/g, '');
    if (!cleaned) return toast.error("Telefone não cadastrado corretamente.");
    const url = `https://wa.me/55${cleaned}`;
    window.open(url, '_blank');
  };

  return (
    <MainLayout title="Gestão de Clientes" subtitle="Relacionamento e prospecção em tempo real">
      
      {/* Top Stats */}
      <div className="grid md:grid-cols-3 gap-5 mb-8">
        <div className="kpi-card flex items-center gap-5">
          <div className="bg-primary/10 p-3 rounded-2xl border border-primary/20 text-primary">
            <User size={24} />
          </div>
          <div>
            <p className="text-3xl font-dm font-black text-foreground">{total}</p>
            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">CRM Global</p>
          </div>
        </div>
        <div className="kpi-card flex items-center gap-5">
          <div className="bg-emerald-500/10 p-3 rounded-2xl border border-emerald-500/20 text-emerald-500">
            <MessageSquare size={24} />
          </div>
          <div>
            <p className="text-3xl font-dm font-black text-emerald-500">12</p>
            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Novas Leads</p>
          </div>
        </div>
        <div className="kpi-card flex items-center gap-5">
          <div className="bg-indigo-500/10 p-3 rounded-2xl border border-indigo-500/20 text-indigo-500">
            <Hash size={24} />
          </div>
          <div>
            <p className="text-3xl font-dm font-black text-indigo-500">04</p>
            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Prospeção</p>
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col lg:flex-row items-center gap-4 mb-8">
        <div className="relative w-full lg:flex-1">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground/30" />
          <Input 
            placeholder="Pesquisar por nome ou canal..." 
            className="pl-12 h-12 bg-white/40 dark:bg-muted/30 border-border/70 rounded-2xl" 
            value={busca} 
            onChange={e => setBusca(e.target.value)} 
          />
        </div>
        <div className="flex items-center gap-4 w-full lg:w-auto">
            <Select value={origem} onValueChange={setOrigem}>
                <SelectTrigger className="h-12 bg-white/40 dark:bg-muted/30 border-border/70 rounded-2xl min-w-[180px] font-dm-bold text-xs uppercase">
                    <Filter size={14} className="mr-2 text-primary" />
                    <SelectValue placeholder="Canal" />
                </SelectTrigger>
                <SelectContent><SelectItem value="todas">Todos Canais</SelectItem></SelectContent>
            </Select>

            <Button className="h-12 bg-primary text-white rounded-2xl px-6 font-dm-bold text-xs uppercase tracking-widest shadow-lg flex-1 lg:flex-none">
                <Plus size={18} className="mr-2" /> NOVO CLIENTE
            </Button>
        </div>
      </div>

      {/* Table Table */}
      <div className="glass-card shadow-lg rounded-2xl overflow-hidden mb-10">
        <div className="w-full overflow-x-auto no-scrollbar">
          <table className="w-full text-left font-dm">
            <thead>
              <tr className="border-b border-border/40 bg-muted/40">
                <th className="px-6 py-4 text-[11px] font-bold text-muted-foreground uppercase tracking-widest">Cliente / Canal</th>
                <th className="px-6 py-4 text-[11px] font-bold text-muted-foreground uppercase tracking-widest">Contato</th>
                <th className="px-6 py-4 text-[11px] font-bold text-muted-foreground uppercase tracking-widest text-center">Origem</th>
                <th className="px-6 py-4 text-[11px] font-bold text-muted-foreground uppercase tracking-widest text-right">Ação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/20">
              {isLoading ? (
                 [1, 2, 3].map(i => <tr key={i}><td colSpan={4} className="p-8"><Skeleton className="h-10 w-full rounded-xl opacity-20" /></td></tr>)
              ) : (
                clientes?.map(cliente => (
                    <tr key={cliente.id} className="group hover:bg-muted/30 cursor-pointer transition-all" onClick={() => setClienteDetalhes(cliente)}>
                    <td className="px-6 py-5">
                       <div className="flex items-center gap-4">
                          <Avatar className="h-10 w-10 border border-border group-hover:scale-105 transition-transform">
                             <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${cliente.nome}`} />
                             <AvatarFallback className="bg-primary/10 text-primary text-[10px] font-bold">{cliente.nome[0]}</AvatarFallback>
                          </Avatar>
                          <span className="font-bold text-[14.5px] text-foreground truncate max-w-[200px]">{cliente.nome}</span>
                       </div>
                    </td>
                    <td className="px-6 py-5">
                       <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-2 text-xs font-bold text-foreground/80"><Phone size={12} className="text-primary/60" /> {cliente.telefone}</div>
                          {cliente.email && <div className="flex items-center gap-2 text-[11px] text-muted-foreground/60"><Mail size={12} /> {cliente.email}</div>}
                       </div>
                    </td>
                    <td className="px-6 py-5">
                        <Badge variant="outline" className="h-6 px-3 bg-emerald-500/10 text-emerald-500 border-emerald-500/20 font-bold text-[9px] uppercase tracking-widest">WhatsApp</Badge>
                    </td>
                    <td className="px-6 py-5 text-right">
                       <Button variant="ghost" size="icon" className="h-9 w-9 text-muted-foreground/50 hover:text-primary transition-all"><ExternalLink size={16} /></Button>
                    </td>
                    </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail Dialog */}
      <Dialog open={!!clienteDetalhes} onOpenChange={(open) => !open && setClienteDetalhes(null)}>
        <DialogContent className="sm:max-w-[480px] p-0 border-none shadow-2xl overflow-hidden">
          <div className="bg-gradient-brand h-24 w-full flex items-end px-8 pb-4 relative">
             <div className="relative z-10 flex items-center gap-4">
                 <Avatar className="h-20 w-20 border-4 border-background -mb-10 shadow-lg">
                    <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${clienteDetalhes?.nome}`} />
                    <AvatarFallback className="text-xl font-bold bg-primary text-white">{clienteDetalhes?.nome.substring(0, 2).toUpperCase()}</AvatarFallback>
                 </Avatar>
             </div>
          </div>

          <div className="pt-12 px-8 pb-8 space-y-6">
            <div>
              <DialogTitle className="font-dm font-bold text-xl">{clienteDetalhes?.nome}</DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground flex items-center gap-1.5 mt-1 font-dm">
                <Calendar size={12}/> Registrado em {clienteDetalhes?.created_at ? format(new Date(clienteDetalhes.created_at), 'dd/MM/yyyy', { locale: ptBR }) : ''}
              </DialogDescription>
            </div>
            
            <div className="grid grid-cols-1 gap-3 py-2 font-dm">
               <div className="p-4 rounded-xl bg-muted/40 border border-border/30">
                  <p className="text-[10px] font-bold uppercase text-muted-foreground mb-1 tracking-widest">Contato Principal</p>
                  <p className="font-bold text-sm text-foreground flex items-center gap-2"><Phone size={14} className="text-primary"/> {clienteDetalhes?.telefone}</p>
                  {clienteDetalhes?.email && <p className="text-xs text-muted-foreground mt-2 flex items-center gap-2"><Mail size={12}/> {clienteDetalhes.email}</p>}
               </div>
            </div>

            <div className="flex gap-3 pt-2">
               <Button className="flex-1 h-12 bg-emerald-500 hover:bg-emerald-600 text-white font-dm-bold text-xs uppercase tracking-widest rounded-xl shadow-lg shadow-emerald-500/20" onClick={() => handleOpenWhatsApp(clienteDetalhes?.telefone || '')}>ABRIR WHATSAPP</Button>
               <Button variant="outline" className="h-12 rounded-xl font-dm-bold text-[10px] uppercase tracking-wider" onClick={() => setClienteDetalhes(null)}>FECHAR</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </MainLayout>
  );
}
