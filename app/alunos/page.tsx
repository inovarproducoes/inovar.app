"use client";

import { MainLayout } from "@/components/layout/MainLayout";
import { useAlunos } from "@/hooks/useAlunos";
import { useState, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Aluno } from "@/types/alunos";
import { useDebounce } from "@/hooks/useDebounce";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Search, Eye, Filter, UserPlus, FileText, Building2, Phone, CreditCard } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function AlunosPage() {
  const [busca, setBusca] = useState("");
  const debouncedBusca = useDebounce(busca, 300);
  const [statusFiltro, setStatusFiltro] = useState<string>("todos");
  
  const { data: alunosData, isLoading } = useAlunos({ 
    termo: debouncedBusca.length >= 3 ? debouncedBusca : undefined,
  });

  const alunos = useMemo(() => {
     let filtered = alunosData || [];
     if (statusFiltro !== "todos") {
       filtered = filtered.filter(a => a.status.toLowerCase() === statusFiltro.toLowerCase());
     }
     return filtered;
  }, [alunosData, statusFiltro]);

  const total = alunosData?.length || 0;
  const ativos = alunosData?.filter(a => a.status === 'ativo').length || 0;
  const pendentes = alunosData?.filter(a => a.status === 'inadimplente' || a.status === 'trancado').length || 0;
  
  const [alunoSelecionado, setAlunoSelecionado] = useState<Aluno | null>(null);
  const [isViewOpen, setIsViewOpen] = useState(false);

  const handleVerAluno = (aluno: Aluno) => {
    setAlunoSelecionado(aluno);
    setIsViewOpen(true);
  };

  const getStatusStyle = (status: string) => {
    const s = status.toLowerCase();
    if (['ativo', 'sucesso', 'ok'].includes(s)) return { bg: 'bg-emerald-500/10', text: 'text-emerald-500', dot: 'bg-emerald-500' };
    if (['inadimplente', 'trancado', 'atraso'].includes(s)) return { bg: 'bg-red-500/10', text: 'text-red-500', dot: 'bg-red-500' };
    if (['formado', 'concluido'].includes(s)) return { bg: 'bg-primary/10', text: 'text-primary', dot: 'bg-primary' };
    return { bg: 'bg-muted', text: 'text-muted-foreground', dot: 'bg-muted-foreground' };
  };

  return (
    <MainLayout title="Diretório de Alunos" subtitle="Gestão centralizada de contatos e participações">
      
      {/* Aluno Detail Dialog - FIXED Centering and UX */}
      <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
        <DialogContent className="sm:max-w-[550px] overflow-hidden p-0 border-none shadow-2xl">
          <div className="bg-gradient-brand h-24 w-full flex items-end px-8 pb-4 relative">
             <div className="absolute top-0 left-0 w-full h-full bg-black/10" />
             <div className="relative z-10 flex items-center gap-4">
                 <Avatar className="h-20 w-20 border-4 border-background -mb-10 shadow-lg">
                    <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${alunoSelecionado?.nome}`} />
                    <AvatarFallback className="font-dm font-bold text-xl bg-primary text-white">
                      {alunoSelecionado?.nome.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                 </Avatar>
             </div>
          </div>
          
          <div className="pt-12 px-8 pb-8 space-y-6">
            <div className="flex justify-between items-start">
                <div>
                   <DialogTitle className="font-dm font-bold text-xl">{alunoSelecionado?.nome}</DialogTitle>
                   <p className="text-sm text-muted-foreground font-dm">{alunoSelecionado?.instituicao}</p>
                </div>
                <div className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider h-fit ${getStatusStyle(alunoSelecionado?.status || '').bg} ${getStatusStyle(alunoSelecionado?.status || '').text}`}>
                    {alunoSelecionado?.status}
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-1.5"><Phone size={10}/> Telefone</span>
                    <span className="text-sm font-dm">{alunoSelecionado?.telefone || '--'}</span>
                </div>
                <div className="flex flex-col gap-1">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-1.5"><CreditCard size={10}/> Documento</span>
                    <span className="text-sm font-dm">{alunoSelecionado?.cpf || '--'}</span>
                </div>
                <div className="flex flex-col gap-1">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-1.5"><Building2 size={10}/> Instituição</span>
                    <span className="text-sm font-dm truncate">{alunoSelecionado?.instituicao || '--'}</span>
                </div>
                <div className="flex flex-col gap-1">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-1.5"><FileText size={10}/> Projeto Ativo</span>
                    <span className="text-sm font-dm truncate">{alunoSelecionado?.projeto || '--'}</span>
                </div>
            </div>
          </div>

          <DialogFooter className="bg-muted px-8 py-4">
              <Button variant="ghost" onClick={() => setIsViewOpen(false)} className="font-dm font-bold text-xs">FECHAR</Button>
              <Button className="bg-primary text-white font-dm font-bold text-xs rounded-lg px-6">EDITAR CADASTRO</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Grid Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="glass-card p-6 fade-up-1">
          <span className="text-3xl font-dm font-bold text-foreground">{total}</span>
          <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mt-1">Registros</p>
        </div>
        <div className="glass-card p-6 fade-up-2 border-emerald-500/10">
          <span className="text-3xl font-dm font-bold text-emerald-500">{ativos}</span>
          <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mt-1">Ativos</p>
        </div>
        <div className="glass-card p-6 fade-up-3 border-red-500/10">
          <span className="text-3xl font-dm font-bold text-red-500">{pendentes}</span>
          <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mt-1">Pendências</p>
        </div>
        <div className="glass-card p-6 fade-up-4 border-primary/10">
          <span className="text-3xl font-dm font-bold text-primary">--</span>
          <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mt-1">Em Aberto</p>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col lg:flex-row items-center gap-3 mb-8 fade-up-5">
        <div className="relative w-full lg:flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/50" />
          <Input 
            placeholder="Buscar por nome ou instituição..." 
            className="pl-11 h-11 bg-card/40 border-border/50 rounded-xl font-dm" 
            value={busca} 
            onChange={e => setBusca(e.target.value)} 
          />
        </div>

        <div className="flex items-center gap-3 w-full lg:w-auto">
            <Select value={statusFiltro} onValueChange={setStatusFiltro}>
                <SelectTrigger className="h-11 bg-card/40 border-border/50 rounded-xl min-w-[170px] font-dm text-xs font-bold uppercase tracking-wider">
                    <Filter size={14} className="mr-2 text-primary" />
                    <SelectValue placeholder="Estado" />
                </SelectTrigger>
                <SelectContent className="font-dm">
                    <SelectItem value="todos">Todos Status</SelectItem>
                    <SelectItem value="ativo">Ativos</SelectItem>
                    <SelectItem value="formado">Formados</SelectItem>
                    <SelectItem value="inadimplente">Inadimplentes</SelectItem>
                </SelectContent>
            </Select>

            <Dialog>
                <DialogTrigger asChild>
                    <Button className="h-11 bg-primary text-white rounded-xl px-6 font-dm font-bold text-xs uppercase tracking-wider shadow-lg hover:translate-y-[-1px] transition-all flex-1 lg:flex-none">
                        <UserPlus size={16} className="mr-2" /> NOVO ALUNO
                    </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[450px]">
                    <DialogHeader>
                        <DialogTitle className="font-dm font-bold">Novo Cadastro</DialogTitle>
                        <DialogDescription className="font-dm">Preencha os dados do aluno/contato.</DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4 font-dm">
                        <div className="space-y-1">
                            <Label className="text-xs text-muted-foreground">Nome Completo</Label>
                            <Input placeholder="Ex: João da Silva" className="bg-muted/50 border-none" />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <Label className="text-xs text-muted-foreground">WhatsApp</Label>
                                <Input placeholder="(00) 00000-0000" className="bg-muted/50 border-none" />
                            </div>
                            <div className="space-y-1">
                                <Label className="text-xs text-muted-foreground">CPF / RG</Label>
                                <Input placeholder="000.000.000-00" className="bg-muted/50 border-none" />
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button className="w-full bg-primary text-white font-dm font-bold text-xs uppercase tracking-widest h-12">SALVAR REGISTRO</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
      </div>

      {/* Main Table */}
      <div className="glass-card shadow-sm rounded-2xl overflow-hidden fade-up-5 mb-10 border-border/50">
        <div className="w-full overflow-x-auto">
          <table className="w-full text-left font-dm">
            <thead>
              <tr className="border-b border-border/50 bg-muted/30">
                <th className="px-6 py-4 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Aluno</th>
                <th className="px-6 py-4 text-[10px] font-bold text-muted-foreground uppercase tracking-widest hidden md:table-cell">CPF</th>
                <th className="px-6 py-4 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Instituição</th>
                <th className="px-6 py-4 text-[10px] font-bold text-muted-foreground uppercase tracking-widest text-center">Status</th>
                <th className="px-6 py-4 text-[10px] font-bold text-muted-foreground uppercase tracking-widest text-right">Ação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/30">
              {isLoading ? (
                [1, 2, 3, 4, 5].map(i => (
                   <tr key={i}><td colSpan={5} className="p-6"><Skeleton className="h-10 w-full rounded-xl opacity-20" /></td></tr>
                ))
              ) : (
                alunos?.map(aluno => {
                    const st = getStatusStyle(aluno.status);
                    return (
                        <tr key={aluno.id} className="group hover:bg-muted/30 transition-all cursor-pointer" onClick={() => handleVerAluno(aluno)}>
                        <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                                <Avatar className="h-9 w-9 rounded-lg shadow-sm border border-border/50 group-hover:scale-105 transition-transform">
                                    <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${aluno.nome}`} />
                                    <AvatarFallback className="bg-primary/10 text-primary text-xs font-bold">{aluno.nome[0]}</AvatarFallback>
                                </Avatar>
                                <div className="flex flex-col">
                                    <span className="font-bold text-[13.5px] text-foreground/90">{aluno.nome}</span>
                                    <span className="text-[11px] text-muted-foreground">{aluno.telefone || "Sem contato"}</span>
                                </div>
                            </div>
                        </td>
                        <td className="px-6 py-4 hidden md:table-cell text-xs text-muted-foreground">{aluno.cpf || '---'}</td>
                        <td className="px-6 py-4 text-xs font-medium text-muted-foreground/80 truncate max-w-[180px]">{aluno.instituicao || '-'}</td>
                        <td className="px-6 py-4">
                            <center>
                                <div className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider border ${st.bg} ${st.text} border-transparent`}>
                                    <span className={`w-1 h-1 rounded-full ${st.dot}`} />
                                    {aluno.status}
                                </div>
                            </center>
                        </td>
                        <td className="px-6 py-4 text-right">
                            <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-primary/10 text-muted-foreground hover:text-primary transition-all">
                                <Eye size={14} />
                            </Button>
                        </td>
                        </tr>
                    );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </MainLayout>
  );
}
