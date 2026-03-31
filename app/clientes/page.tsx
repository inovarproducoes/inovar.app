"use client";

import { MainLayout } from "@/components/layout/MainLayout";
import { useState } from "react";
import { useQuery } from '@tanstack/react-query';
import { clientesService } from "@/services/clientesService";
import { Cliente } from "@/types/clientes";
import { useDebounce } from "@/hooks/useDebounce";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { User, Phone, CheckCircle2, Search, Filter, Plus, Mail, MessageSquare, ExternalLink, Hash } from "lucide-react";
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
    <MainLayout title="Gestão CRM" subtitle="Relacionamento e prospecção em tempo real">
      
      {/* Top Stats */}
      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <div className="glass-card p-6 flex items-center gap-5 fade-up-1 group hover:border-primary/40 transition-all cursor-default">
          <div className="bg-primary/10 p-3 rounded-2xl border border-primary/20 text-primary group-hover:scale-110 transition-transform">
            <User size={24} />
          </div>
          <div>
            <p className="text-3xl font-syne font-black text-white">{total}</p>
            <p className="text-[10px] font-black uppercase tracking-[0.15em] text-muted-foreground font-mono">Contatos no CRM</p>
          </div>
        </div>
        <div className="glass-card p-6 flex items-center gap-5 fade-up-2 group hover:border-[#00b4a0]/40 transition-all cursor-default">
          <div className="bg-[#00b4a0]/10 p-3 rounded-2xl border border-[#00b4a0]/20 text-[#00b4a0] group-hover:scale-110 transition-transform">
            <MessageSquare size={24} />
          </div>
          <div>
            <p className="text-3xl font-syne font-black text-[#00b4a0]">12</p>
            <p className="text-[10px] font-black uppercase tracking-[0.15em] text-muted-foreground font-mono">Interações Hoje</p>
          </div>
        </div>
        <div className="glass-card p-6 flex items-center gap-5 fade-up-3 group hover:border-[#8083ff]/40 transition-all cursor-default">
          <div className="bg-[#8083ff]/10 p-3 rounded-2xl border border-[#8083ff]/20 text-[#8083ff] group-hover:scale-110 transition-transform">
            <Hash size={24} />
          </div>
          <div>
            <p className="text-3xl font-syne font-black text-[#8083ff]">04</p>
            <p className="text-[10px] font-black uppercase tracking-[0.15em] text-muted-foreground font-mono">Novas Leads</p>
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col lg:flex-row items-center gap-4 mb-8 fade-up-4">
        <div className="relative w-full lg:flex-1">
          <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none">
            <Search size={16} className="text-white/20" />
          </div>
          <Input 
            placeholder="Pesquisar por nome ou canal de contato..." 
            className="pl-12 h-12 bg-white/[0.03] border-white/10 rounded-2xl text-sm font-dm" 
            value={busca} 
            onChange={e => setBusca(e.target.value)} 
          />
        </div>
        <div className="flex items-center gap-3 w-full lg:w-auto">
            <Select value={origem} onValueChange={setOrigem}>
                <SelectTrigger className="h-12 bg-white/[0.03] border-white/10 rounded-2xl min-w-[180px] font-syne font-bold text-xs uppercase tracking-widest">
                    <Filter size={14} className="mr-2 text-primary" />
                    <SelectValue placeholder="Canal" />
                </SelectTrigger>
                <SelectContent className="bg-[#0d0f1e] border-white/10 text-white font-dm">
                    <SelectItem value="todas">Todos Canais</SelectItem>
                    <SelectItem value="whatsapp">WhatsApp</SelectItem>
                </SelectContent>
            </Select>

            <Dialog>
                <DialogTrigger asChild>
                    <Button className="h-12 bg-gradient-brand text-white rounded-2xl px-6 font-syne font-black text-xs uppercase tracking-widest shadow-lg shadow-primary/20 flex-1 lg:flex-none">
                        <Plus size={16} className="mr-2" /> Novo Cadastro
                    </Button>
                </DialogTrigger>
                <DialogContent className="glass-card border-white/10 text-white">
                    <DialogHeader>
                    <DialogTitle className="font-syne font-extrabold text-xl">Cadastrar no CRM</DialogTitle>
                    <DialogDescription className="text-white/40">Inicie um novo relacionamento comercial.</DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-5 py-6">
                        <div className="space-y-2">
                            <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground font-mono">Nome do Cliente</Label>
                            <Input className="bg-white/5 border-white/10 h-11 rounded-xl" placeholder="Ex: Maria Eduarda" value={novoCliente.nome} onChange={e => setNovoCliente({...novoCliente, nome: e.target.value})} />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground font-mono">WhatsApp</Label>
                                <Input className="bg-white/5 border-white/10 h-11 rounded-xl" placeholder="(00) 00000-0000" value={novoCliente.telefone} onChange={e => setNovoCliente({...novoCliente, telefone: e.target.value})} />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground font-mono">Email</Label>
                                <Input className="bg-white/5 border-white/10 h-11 rounded-xl" placeholder="email@exemplo.com" value={novoCliente.email} onChange={e => setNovoCliente({...novoCliente, email: e.target.value})} />
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button className="w-full h-12 bg-gradient-brand text-white font-syne font-black rounded-xl uppercase tracking-widest" onClick={() => toast.success("Simulação: Cliente cadastrado!")}>Finalizar Cadastro</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
      </div>

      {/* Main Table */}
      <div className="glass-card overflow-hidden fade-up-5 mb-10">
        <div className="w-full overflow-x-auto no-scrollbar">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/5 bg-white/[0.02]">
                <th className="px-6 py-5 text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] font-mono">Canal / Cliente</th>
                <th className="px-6 py-5 text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] font-mono">Contato Direto</th>
                <th className="px-6 py-5 text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] font-mono">Origem</th>
                <th className="px-6 py-5 text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] font-mono text-right">Perfil</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.03]">
              {isLoading ? (
                 [1, 2, 3, 4].map(i => (
                    <tr key={i} className="bg-transparent">
                      <td className="px-6 py-5"><div className="flex gap-4 items-center"><Skeleton className="h-10 w-10 rounded-xl bg-white/5"/><Skeleton className="h-4 w-32 bg-white/5"/></div></td>
                      <td className="px-6 py-5"><Skeleton className="h-3 w-44 bg-white/5"/></td>
                      <td className="px-6 py-5"><Skeleton className="h-6 w-20 rounded-full bg-white/5"/></td>
                      <td className="px-6 py-5 text-right"><Skeleton className="h-8 w-8 ml-auto bg-white/5 rounded-lg"/></td>
                    </tr>
                 ))
              ) : (
                clientes?.map(cliente => (
                    <tr key={cliente.id} className="group hover:bg-white/[0.03] transition-all duration-300 cursor-pointer" onClick={() => setClienteDetalhes(cliente)}>
                    <td className="px-6 py-5">
                       <div className="flex items-center gap-4">
                          <Avatar className="h-10 w-10 rounded-xl border border-white/10 group-hover:border-primary/40 transition-colors">
                             <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${cliente.nome}`} />
                             <AvatarFallback className="bg-primary text-white font-syne font-black text-[10px]">{cliente.nome.substring(0, 2).toUpperCase()}</AvatarFallback>
                          </Avatar>
                          <span className="font-syne font-bold text-[14px] text-white/90 truncate max-w-[200px]">{cliente.nome}</span>
                       </div>
                    </td>
                    <td className="px-6 py-5">
                       <div className="flex flex-col gap-0.5">
                          <div className="flex items-center gap-2 text-xs font-dm text-white/80">
                             <Phone size={12} className="text-primary/60" />
                             {cliente.telefone}
                          </div>
                          {cliente.email && (
                            <div className="flex items-center gap-2 text-[11px] font-dm text-muted-foreground/60">
                               <Mail size={12} />
                               {cliente.email}
                            </div>
                          )}
                       </div>
                    </td>
                    <td className="px-6 py-5">
                        <Badge variant="outline" className="h-6 px-3 bg-[#00b4a0]/10 text-[#00b4a0] border-[#00b4a0]/20 font-mono font-bold text-[9px] uppercase tracking-widest">
                           WhatsApp
                        </Badge>
                    </td>
                    <td className="px-6 py-5 text-right">
                       <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl text-white/20 hover:text-white hover:bg-white/5 transition-all">
                          <ExternalLink size={16} />
                       </Button>
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
        <DialogContent className="glass-card border-white/10 p-0 overflow-hidden sm:max-w-[500px]">
          <div className="h-24 bg-gradient-brand opacity-10" />
          <div className="px-8 pb-8 -mt-6">
            <div className="flex justify-between items-end mb-8">
               <Avatar className="h-24 w-24 border-4 border-[#07080f] rounded-2xl shadow-2xl">
                  <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${clienteDetalhes?.nome}`} />
                  <AvatarFallback className="font-syne font-black text-2xl bg-primary text-white">
                    {clienteDetalhes?.nome.substring(0,2).toUpperCase()}
                  </AvatarFallback>
               </Avatar>
               <Badge className="mb-2 bg-primary text-white font-mono font-bold uppercase tracking-widest text-[9px]">Cliente VIP</Badge>
            </div>
            
            <DialogHeader className="mb-8">
              <DialogTitle className="font-syne font-extrabold text-3xl text-white">
                {clienteDetalhes?.nome}
              </DialogTitle>
              <DialogDescription className="font-dm text-muted-foreground">
                Cliente registrado desde {clienteDetalhes?.created_at ? format(new Date(clienteDetalhes.created_at), "dd 'de' MMMM 'de' yyyy", { locale: ptBR }) : ''}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 mb-8">
               <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/5 border-l-2 border-l-primary">
                     <p className="text-[10px] font-black uppercase text-muted-foreground mb-1 font-mono">Telefone</p>
                     <p className="font-syne font-bold text-sm text-foreground">{clienteDetalhes?.telefone}</p>
                  </div>
                  <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/5 border-l-2 border-l-primary">
                     <p className="text-[10px] font-black uppercase text-muted-foreground mb-1 font-mono">Email</p>
                     <p className="font-syne font-bold text-sm text-foreground truncate">{clienteDetalhes?.email || 'N/A'}</p>
                  </div>
               </div>
               
               <div className="p-5 rounded-2xl bg-[#00b4a0]/5 border border-[#00b4a0]/10">
                  <div className="flex items-center gap-3 mb-2">
                     <CheckCircle2 size={16} className="text-[#00b4a0]" />
                     <h4 className="font-syne font-bold text-sm text-white">Integridade Cadastral</h4>
                  </div>
                  <p className="text-xs font-dm text-muted-foreground/80 leading-relaxed">
                     O cadastro deste cliente foi verificado via canal WhatsApp Inbound. O histórico de conversas e transações está disponível no módulo de monitoramento.
                  </p>
               </div>
            </div>

            <div className="flex gap-3">
               <Button className="flex-1 h-12 bg-gradient-brand text-white font-syne font-black text-xs uppercase tracking-widest rounded-xl shadow-lg shadow-primary/20">Abrir WhatsApp</Button>
               <Button variant="ghost" className="h-12 w-12 rounded-xl bg-white/5 border border-white/10 p-0 text-white hover:bg-white/10" onClick={() => setClienteDetalhes(null)}>X</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </MainLayout>
  );
}
