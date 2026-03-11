"use client";
import { MainLayout } from "@/components/layout/MainLayout";
import { useState } from "react";
import { useQuery } from '@tanstack/react-query';
import { clientesService } from "@/services/clientesService";
import { useDebounce } from "@/hooks/useDebounce";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Bot, User, Phone } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

export default function ClientesPage() {
  const [busca, setBusca] = useState("");
  const debouncedBusca = useDebounce(busca, 300);

  const { data: clientes, isLoading } = useQuery({
    queryKey: ['clientes', debouncedBusca],
    queryFn: () => clientesService.buscarClientes(debouncedBusca.length >= 2 ? debouncedBusca : undefined)
  });

  const total = clientes?.length || 0;
  const ativos = clientes?.filter(c => c.agente_ativo).length || 0;
  const inativos = total - ativos;

  return (
    <MainLayout title="Clientes (CRM)" subtitle="Gestão de clientes e Integração Sophia IA">
      <div className="grid md:grid-cols-3 gap-6 mb-6">
        <div className="bg-card p-4 rounded-xl border flex items-center gap-4">
          <div className="bg-primary/10 p-3 rounded-full text-primary"><User className="w-6 h-6"/></div>
          <div><p className="text-2xl font-bold">{total}</p><p className="text-sm text-muted-foreground">Total de Clientes</p></div>
        </div>
        <div className="bg-card p-4 rounded-xl border flex items-center gap-4">
          <div className="bg-success/10 p-3 rounded-full text-success"><Bot className="w-6 h-6"/></div>
          <div><p className="text-2xl font-bold text-success">{ativos}</p><p className="text-sm text-muted-foreground">Agente Sophia Ativo</p></div>
        </div>
        <div className="bg-card p-4 rounded-xl border flex items-center gap-4">
          <div className="bg-muted p-3 rounded-full text-muted-foreground"><Phone className="w-6 h-6"/></div>
          <div><p className="text-2xl font-bold text-muted-foreground">{inativos}</p><p className="text-sm text-muted-foreground">Agente Inativo</p></div>
        </div>
      </div>

      <div className="flex gap-4 mb-6">
         <Input placeholder="Buscar por nome ou telefone..." className="w-full md:max-w-md" value={busca} onChange={e => setBusca(e.target.value)} />
         <Button>Novo Cliente</Button>
      </div>

      <div className="border rounded-lg overflow-hidden bg-card">
         <table className="w-full text-sm text-left">
           <thead className="bg-muted text-muted-foreground uppercase text-xs">
             <tr>
               <th className="px-6 py-3">Nome do Cliente</th>
               <th className="px-6 py-3">Telefone</th>
               <th className="px-6 py-3">Agente Sophia</th>
               <th className="px-6 py-3">Cadastro</th>
               <th className="px-6 py-3">Ações</th>
             </tr>
           </thead>
           <tbody>
             {isLoading ? (
               <tr><td colSpan={5} className="text-center py-6">Carregando CRM...</td></tr>
             ) : clientes?.length === 0 ? (
               <tr><td colSpan={5} className="text-center py-6 text-muted-foreground">Nenhum cliente encontrado.</td></tr>
             ) : clientes?.map(cliente => (
               <tr key={cliente.id} className="border-b hover:bg-muted/50 cursor-pointer">
                 <td className="px-6 py-4 font-medium">{cliente.nome}</td>
                 <td className="px-6 py-4">{cliente.telefone}</td>
                 <td className="px-6 py-4">
                   {cliente.agente_ativo ? <Badge variant="default" className="bg-success text-success-foreground hover:bg-success/90">Ativo</Badge> : <Badge variant="secondary">Inativo</Badge>}
                 </td>
                 <td className="px-6 py-4">{format(new Date(cliente.created_at), 'dd/MM/yyyy')}</td>
                 <td className="px-6 py-4">
                   <Button variant="outline" size="sm">Ver Detalhes</Button>
                 </td>
               </tr>
             ))}
           </tbody>
         </table>
      </div>
    </MainLayout>
  );
}
