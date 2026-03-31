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

  return (
    <MainLayout title="Gestão de Clientes" subtitle="Relacionamento e prospecção em tempo real">
      
      {/* Top Stats */}
      <div className="grid md:grid-cols-3 gap-4 mb-8">
        <div className="glass-card p-6 flex items-center gap-5 fade-up-1 group hover:border-primary/40 transition-all cursor-default">
          <div className="bg-primary/10 p-3 rounded-2xl border border-primary/20 text-primary transition-transform">
            <User size={24} />
          </div>
          <div>
            <p className="text-3xl font-dm font-bold text-foreground">{total}</p>
            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground font-mono">Contatos no CRM</p>
          </div>
        </div>
        <div className="glass-card p-6 flex items-center gap-5 fade-up-2">
          <div className="bg-emerald-500/10 p-3 rounded-2xl border border-emerald-500/20 text-emerald-500">
            <MessageSquare size={24} />
          </div>
          <div>
            <p className="text-3xl font-dm font-bold text-emerald-500">12</p>
            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground font-mono">Interações Ativas</p>
          </div>
        </div>
        <div className="glass-card p-6 flex items-center gap-5 fade-up-3">
          <div className="bg-indigo-500/10 p-3 rounded-2xl border border-indigo-500/20 text-indigo-500">
            <Hash size={24} />
          </div>
          <div>
            <p className="text-3xl font-dm font-bold text-indigo-500">04</p>
            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground font-mono">Novas Leads</p>
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col lg:flex-row items-center gap-3 mb-8 fade-up-4">
        <div className="relative w-full lg:flex-1">
          <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none">
            <Search size={16} className="text-muted-foreground/30" />
          </div>
          <Input 
            placeholder="Pesquisar por nome ou canal de contato..." 
            className="pl-12 h-11 bg-card/40 border-border/50 rounded-xl text-sm font-dm" 
            value={busca} 
            onChange={e => setBusca(e.target.value)} 
          />
        </div>
        <div className="flex items-center gap-3 w-full lg:w-auto">
            <Select value={origem} onValueChange={setOrigem}>
                <SelectTrigger className="h-11 bg-card/40 border-border/50 rounded-xl min-w-[180px] font-dm font-bold text-xs uppercase tracking-widest">
                    <Filter size={14} className="mr-2 text-primary" />
                    <SelectValue placeholder="Canal" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="todas">Todos Canais</SelectItem>
                    <SelectItem value="whatsapp">WhatsApp</SelectItem>
                </SelectContent>
            </Select>

            <Dialog>
                <DialogTrigger asChild>
                    <Button className="h-11 bg-primary text-white rounded-xl px-6 font-dm font-bold text-xs uppercase tracking-widest shadow-lg flex-1 lg:flex-none">
                        <Plus size={16} className="mr-2" /> NOVO CADASTRO
                    </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[450px]">
                    <DialogHeader>
                        <DialogTitle className="font-dm font-bold">Novo Cliente</DialogTitle>
                        <DialogDescription className="font-dm">Inicie um novo relacionamento comercial.</DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4 font-dm">
                        <div className="space-y-1">
                            <Label className="text-xs text-muted-foreground">Nome Completo</Label>
                            <Input className="bg-muted/50 border-none h-11 rounded-xl" placeholder="Nome do cliente..." value={novoCliente.nome} onChange={e => setNovoCliente({...novoCliente, nome: e.target.value})} />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <Label className="text-xs text-muted-foreground">WhatsApp</Label>
                                <Input className="bg-muted/50 border-none h-11 rounded-xl" placeholder="(00) 00000-0000" value={novoCliente.telefone} onChange={e => setNovoCliente({...novoCliente, telefone: e.target.value})} />
                            </div>
                            <div className="space-y-1">
                                <Label className="text-xs text-muted-foreground">Email</Label>
                                <Input className="bg-muted/50 border-none h-11 rounded-xl" placeholder="email@exemplo.com" value={novoCliente.email} onChange={e => setNovoCliente({...novoCliente, email: e.target.value})} />
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button className="w-full h-12 bg-primary text-white font-dm font-bold rounded-xl uppercase tracking-widest text-xs" onClick={() => toast.success("Cliente cadastrado!")}>SALVAR CLIENTE</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
      </div>

      {/* Main Table */}
      <div className="glass-card shadow-sm rounded-2xl overflow-hidden fade-up-5 mb-10 border-border/50">
        <div className="w-full overflow-x-auto no-scrollbar">
          <table className="w-full text-left font-dm">
            <thead>
              <tr className="border-b border-border/50 bg-muted/30 select-none">
                <th className="px-6 py-4 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Canal / Cliente</th>
                <th className="px-6 py-4 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Contato Direto</th>
                <th className="px-6 py-4 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Status de Origem</th>
                <th className="px-6 py-4 text-[10px] font-bold text-muted-foreground uppercase tracking-widest text-right">Ver Mais</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/30">
              {isLoading ? (
                 [1, 2, 3, 4].map(i => (
                    <tr key={i}><td colSpan={4} className="p-6"><Skeleton className="h-10 w-full rounded-xl opacity-20" /></td></tr>
                 ))
              ) : (
                clientes?.map(cliente => (
                    <tr key={cliente.id} className="group hover:bg-muted/30 transition-all cursor-pointer" onClick={() => setClienteDetalhes(cliente)}>
                    <td className="px-6 py-4">
                       <div className="flex items-center gap-4">
                          <Avatar className="h-9 w-9 rounded-lg shadow-sm border border-border/50">
                             <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${cliente.nome}`} />
                             <AvatarFallback className="bg-primary/10 text-primary text-[10px] font-bold">{cliente.nome[0].toUpperCase()}</AvatarFallback>
                          </Avatar>
                          <span className="font-bold text-[14px] text-foreground/90 truncate max-w-[200px]">{cliente.nome}</span>
                       </div>
                    </td>
                    <td className="px-6 py-4">
                       <div className="flex flex-col gap-0.5">
                          <div className="flex items-center gap-2 text-xs font-dm text-foreground/80">
                             <Phone size={11} className="text-primary/60" />
                             {cliente.telefone}
                          </div>
                          {cliente.email && (
                            <div className="flex items-center gap-2 text-[11px] font-dm text-muted-foreground/60">
                               <Mail size={11} />
                               {cliente.email}
                            </div>
                          )}
                       </div>
                    </td>
                    <td className="px-6 py-4">
                        <Badge variant="outline" className="h-5.5 px-2 bg-emerald-500/10 text-emerald-500 border-emerald-500/20 font-dm font-bold text-[9px] uppercase tracking-widest">
                           WhatsApp
                        </Badge>
                    </td>
                    <td className="px-6 py-4 text-right">
                       <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-primary/10 text-muted-foreground hover:text-primary transition-all">
                          <ExternalLink size={14} />
                       </Button>
                    </td>
                    </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail Dialog - Centered and Clean */}
      <Dialog open={!!clienteDetalhes} onOpenChange={(open) => !open && setClienteDetalhes(null)}>
        <DialogContent className="sm:max-w-[480px] p-0 overflow-hidden border-none shadow-2xl">
          <div className="bg-gradient-brand h-24 w-full flex items-end px-8 pb-4 relative">
             <div className="absolute top-0 left-0 w-full h-full bg-black/10" />
             <div className="relative z-10 flex items-center gap-4">
                 <Avatar className="h-20 w-20 border-4 border-background -mb-10 shadow-lg">
                    <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${clienteDetalhes?.nome}`} />
                    <AvatarFallback className="font-dm font-bold text-xl bg-primary text-white">
                      {clienteDetalhes?.nome.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                 </Avatar>
             </div>
          </div>

          <div className="pt-12 px-8 pb-8 space-y-6">
            <div>
              <DialogTitle className="font-dm font-bold text-xl">{clienteDetalhes?.nome}</DialogTitle>
              <DialogDescription className="font-dm text-xs text-muted-foreground flex items-center gap-1.5 mt-1">
                <Calendar size={12}/> Registrado em {clienteDetalhes?.created_at ? format(new Date(clienteDetalhes.created_at), 'dd/MM/yyyy', { locale: ptBR }) : ''}
              </DialogDescription>
            </div>
            
            <div className="grid grid-cols-1 gap-3 py-2 font-dm">
               <div className="p-4 rounded-xl bg-muted/40 border border-border/30">
                  <p className="text-[10px] font-bold uppercase text-muted-foreground mb-1 tracking-widest">WhatsApp Principal</p>
                  <p className="font-bold text-sm text-foreground flex items-center gap-2">
                     <Phone size={14} className="text-primary"/> {clienteDetalhes?.telefone}
                  </p>
                  {clienteDetalhes?.email && (
                    <p className="text-xs text-muted-foreground mt-2 flex items-center gap-2">
                       <Mail size={12}/> {clienteDetalhes.email}
                    </p>
                  )}
               </div>
               
               <div className="p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/10">
                  <div className="flex items-center gap-2 mb-2 text-emerald-500">
                     <CheckCircle2 size={16} />
                     <h4 className="font-bold text-xs uppercase tracking-widest">Origem Verificada</h4>
                  </div>
                  <p className="text-xs text-muted-foreground/80 leading-relaxed">
                     Este contato iniciou o relacionamento via canal oficial InBound. Os registros de conversa e ordens vinculadas estão disponíveis em tempo real.
                  </p>
               </div>
            </div>

            <div className="flex gap-3 pt-2">
               <Button className="flex-1 h-11 bg-emerald-500 hover:bg-emerald-600 text-white font-dm font-bold text-xs uppercase tracking-widest rounded-xl shadow-lg">ABRIR WHATSAPP</Button>
               <Button variant="outline" className="h-11 rounded-xl font-dm font-bold text-xs" onClick={() => setClienteDetalhes(null)}>FECHAR</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </MainLayout>
  );
}
