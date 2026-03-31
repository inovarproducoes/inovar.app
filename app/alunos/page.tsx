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
import { Search, Eye, Filter, UserPlus, FileText, Building2, Phone, Hash, CreditCard } from "lucide-react";
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
    if (['ativo', 'sucesso', 'ok'].includes(s)) return { bg: 'rgba(0,180,160,0.15)', color: '#00b4a0' };
    if (['inadimplente', 'trancado', 'atraso'].includes(s)) return { bg: 'rgba(172,49,73,0.15)', color: '#f76a80' };
    if (['formado', 'concluido'].includes(s)) return { bg: 'rgba(74,75,215,0.15)', color: '#8083ff' };
    return { bg: 'rgba(255,255,255,0.06)', color: '#9090b0' };
  };

  return (
    <MainLayout title="Alunos & Contatos" subtitle="Diretório inteligente de participantes">
      
      {/* Aluno Detail Dialog */}
      <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
        <DialogContent className="glass-card sm:max-w-[620px] max-h-[90vh] overflow-y-auto border-white/10 p-0 overflow-hidden">
          <div className="h-32 bg-gradient-brand opacity-20 absolute top-0 left-0 right-0" />
          <div className="relative p-8">
            <DialogHeader className="mb-8">
              <div className="flex items-center gap-5">
                 <Avatar className="h-20 w-20 border-4 border-[#07080f] shadow-2xl ring-2 ring-primary/20">
                    <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${alunoSelecionado?.nome}`} />
                    <AvatarFallback className="font-syne font-black text-xl bg-primary text-white">
                      {alunoSelecionado?.nome.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                 </Avatar>
                 <div>
                    <DialogTitle className="font-syne font-extrabold text-2xl text-white">{alunoSelecionado?.nome}</DialogTitle>
                    <div className="flex items-center gap-2 mt-1">
                       <span className="text-xs font-mono font-bold uppercase tracking-widest text-primary/80">ID: {alunoSelecionado?.id.split('-')[0]}</span>
                       <span className="w-1 h-1 rounded-full bg-white/20" />
                       <span className="text-xs font-dm text-muted-foreground">{alunoSelecionado?.instituicao}</span>
                    </div>
                 </div>
              </div>
            </DialogHeader>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 my-6">
                <div className="space-y-4">
                    <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/5 group hover:border-primary/30 transition-all">
                        <div className="flex items-center gap-3 mb-2">
                            <Phone size={14} className="text-primary" />
                            <span className="text-[10px] uppercase font-mono font-black tracking-widest text-muted-foreground">Telefone</span>
                        </div>
                        <p className="font-syne font-bold text-sm text-foreground">{alunoSelecionado?.telefone || '--'}</p>
                    </div>
                    <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/5 group hover:border-primary/30 transition-all">
                        <div className="flex items-center gap-3 mb-2">
                            <CreditCard size={14} className="text-primary" />
                            <span className="text-[10px] uppercase font-mono font-black tracking-widest text-muted-foreground">Documento</span>
                        </div>
                        <p className="font-syne font-bold text-sm text-foreground">{alunoSelecionado?.cpf || '--'}</p>
                    </div>
                </div>
                <div className="space-y-4">
                    <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/5 group hover:border-primary/30 transition-all">
                        <div className="flex items-center gap-3 mb-2">
                            <Building2 size={14} className="text-primary" />
                            <span className="text-[10px] uppercase font-mono font-black tracking-widest text-muted-foreground">Instituição</span>
                        </div>
                        <p className="font-syne font-bold text-sm text-foreground truncate">{alunoSelecionado?.instituicao || '--'}</p>
                    </div>
                    <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/5 group hover:border-primary/30 transition-all">
                        <div className="flex items-center gap-3 mb-2">
                            <FileText size={14} className="text-primary" />
                            <span className="text-[10px] uppercase font-mono font-black tracking-widest text-muted-foreground">Projeto</span>
                        </div>
                        <p className="font-syne font-bold text-sm text-foreground truncate">{alunoSelecionado?.projeto || '--'}</p>
                    </div>
                </div>
            </div>

            <DialogFooter className="mt-8">
              <Button variant="ghost" onClick={() => setIsViewOpen(false)} className="rounded-xl font-syne font-bold text-xs uppercase tracking-widest text-muted-foreground hover:text-white transition-all">Fechar Perfil</Button>
              <Button className="bg-gradient-brand text-white rounded-xl px-8 font-syne font-bold text-xs uppercase tracking-widest shadow-lg shadow-primary/20">Editar Aluno</Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>

      {/* Grid Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="glass-card p-6 fade-up-1 group hover:border-primary/40 transition-all cursor-default">
          <div className="flex justify-between items-start mb-4">
             <div className="p-2 rounded-lg bg-primary/10 border border-primary/20">
                <Hash size={18} className="text-primary" />
             </div>
          </div>
          <span className="text-3xl font-syne font-black text-white">{total}</span>
          <p className="text-[10px] font-black uppercase tracking-[0.15em] text-muted-foreground mt-1 font-mono">Total Registros</p>
        </div>
        <div className="glass-card p-6 fade-up-2 group hover:border-[#00b4a0]/40 transition-all cursor-default">
          <div className="flex justify-between items-start mb-4">
             <div className="p-2 rounded-lg bg-[#00b4a0]/10 border border-[#00b4a0]/20">
                <Check size={18} className="text-[#00b4a0]" />
             </div>
          </div>
          <span className="text-3xl font-syne font-black text-[#00b4a0]">{ativos}</span>
          <p className="text-[10px] font-black uppercase tracking-[0.15em] text-muted-foreground mt-1 font-mono">Contatos Ativos</p>
        </div>
        <div className="glass-card p-6 fade-up-3 group hover:border-[#f76a80]/40 transition-all cursor-default">
          <div className="flex justify-between items-start mb-4">
             <div className="p-2 rounded-lg bg-[#f76a80]/10 border border-[#f76a80]/20">
                <Filter size={18} className="text-[#f76a80]" />
             </div>
          </div>
          <span className="text-3xl font-syne font-black text-[#f76a80]">{pendentes}</span>
          <p className="text-[10px] font-black uppercase tracking-[0.15em] text-muted-foreground mt-1 font-mono">Pendências</p>
        </div>
        <div className="glass-card p-6 fade-up-4 group hover:border-[#8083ff]/40 transition-all cursor-default">
           <div className="flex justify-between items-start mb-4">
             <div className="p-2 rounded-lg bg-[#8083ff]/10 border border-[#8083ff]/20">
                <FileText size={18} className="text-[#8083ff]" />
             </div>
          </div>
          <span className="text-3xl font-syne font-black text-[#8083ff]">0</span>
          <p className="text-[10px] font-black uppercase tracking-[0.15em] text-muted-foreground mt-1 font-mono">Novas Mensagens</p>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col lg:flex-row items-center gap-4 mb-8 fade-up-5">
        <div className="relative w-full lg:flex-1">
          <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center pointer-events-none">
             <Search className="h-4 w-4 text-white/20" />
          </div>
          <Input 
            placeholder="Pesquisar por nome, CPF ou instituição..." 
            className="pl-11 h-12 bg-white/[0.03] border-white/10 rounded-2xl focus:ring-primary/20 text-sm font-dm" 
            value={busca} 
            onChange={e => setBusca(e.target.value)} 
          />
        </div>

        <div className="flex items-center gap-3 w-full lg:w-auto">
            <Select value={statusFiltro} onValueChange={setStatusFiltro}>
                <SelectTrigger className="h-12 bg-white/[0.03] border-white/10 rounded-2xl min-w-[180px] font-syne font-bold text-xs uppercase tracking-wider">
                    <div className="flex items-center gap-2">
                        <Filter size={14} className="text-primary" />
                        <SelectValue placeholder="Estado" />
                    </div>
                </SelectTrigger>
                <SelectContent className="bg-[#0d0f1e] border-white/10 text-white font-dm">
                    <SelectItem value="todos">Todos Status</SelectItem>
                    <SelectItem value="ativo">Ativos</SelectItem>
                    <SelectItem value="formado">Formados</SelectItem>
                    <SelectItem value="inadimplente">Inadimplentes</SelectItem>
                </SelectContent>
            </Select>

            <Dialog>
                <DialogTrigger asChild>
                    <Button className="h-12 bg-gradient-brand text-white rounded-2xl px-6 font-syne font-black text-xs uppercase tracking-[0.1em] shadow-lg shadow-primary/20 hover:scale-[1.02] transition-transform flex-1 lg:flex-none">
                        <UserPlus size={16} className="mr-2" /> Novo Aluno
                    </Button>
                </DialogTrigger>
                <DialogContent className="glass-card border-white/10 backdrop-blur-3xl text-white">
                    <DialogHeader>
                    <DialogTitle className="font-syne font-extrabold text-xl">Novo Cadastro</DialogTitle>
                    <DialogDescription className="text-white/40">Preencha as informações do contato abaixo.</DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-5 py-6">
                    <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground font-mono">Nome Completo</Label>
                        <Input className="bg-white/5 border-white/10 h-11 rounded-xl" placeholder="João Silva..." />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground font-mono">CPF</Label>
                            <Input className="bg-white/5 border-white/10 h-11 rounded-xl" placeholder="000.000.000-00" />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground font-mono">Telefone</Label>
                            <Input className="bg-white/5 border-white/10 h-11 rounded-xl" placeholder="(00) 00000-0000" />
                        </div>
                    </div>
                    </div>
                    <DialogFooter>
                        <Button className="w-full bg-gradient-brand text-white rounded-xl h-12 font-syne font-black text-xs uppercase tracking-widest">Criar Registro</Button>
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
              <tr className="border-b border-white/5 bg-white/[0.02] select-none">
                <th className="px-6 py-5 text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] font-mono">Aluno</th>
                <th className="px-6 py-5 text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] font-mono hidden md:table-cell">CPF / Documento</th>
                <th className="px-6 py-5 text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] font-mono">Instituição</th>
                <th className="px-6 py-5 text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] font-mono">Projeto Ativo</th>
                <th className="px-6 py-5 text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] font-mono text-center">Status</th>
                <th className="px-6 py-5 text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] font-mono text-right">Ação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.03]">
              {isLoading ? (
                [1, 2, 3, 4, 5, 6].map(i => (
                   <tr key={i} className="bg-transparent">
                     <td className="px-6 py-5"><div className="flex items-center gap-3"><Skeleton className="h-10 w-10 rounded-xl bg-white/5"/><div className="space-y-2"><Skeleton className="h-3 w-32 bg-white/5"/><Skeleton className="h-2 w-20 bg-white/5"/></div></div></td>
                     <td className="px-6 py-5 hidden md:table-cell"><Skeleton className="h-3 w-28 bg-white/5"/></td>
                     <td className="px-6 py-5"><Skeleton className="h-3 w-32 bg-white/5"/></td>
                     <td className="px-6 py-5"><Skeleton className="h-3 w-32 bg-white/5"/></td>
                     <td className="px-6 py-5"><center><Skeleton className="h-6 w-20 rounded-full bg-white/5"/></center></td>
                     <td className="px-6 py-5 text-right"><Skeleton className="h-8 w-8 ml-auto rounded-lg bg-white/5"/></td>
                   </tr>
                ))
              ) : (
                alunos?.map(aluno => {
                    const st = getStatusStyle(aluno.status);
                    return (
                        <tr key={aluno.id} className="group hover:bg-white/[0.03] transition-all duration-300">
                        <td className="px-6 py-5">
                            <div className="flex items-center gap-4">
                            <div className="relative">
                                <Avatar className="h-11 w-11 rounded-xl border border-white/10 shadow-lg">
                                    <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${aluno.nome}`} />
                                    <AvatarFallback className="bg-gradient-brand text-white font-syne font-black text-xs">
                                        {aluno.nome.substring(0, 2).toUpperCase()}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-[#07080f] shadow-sm" style={{ backgroundColor: st.color }} />
                            </div>
                            <div className="flex flex-col">
                                <span className="font-syne font-bold text-[14px] text-white/90 group-hover:text-primary transition-colors">{aluno.nome}</span>
                                <span className="text-[11px] font-dm text-muted-foreground/60">{aluno.telefone || "Sem contato"}</span>
                            </div>
                            </div>
                        </td>
                        <td className="px-6 py-5 hidden md:table-cell">
                            <span className="font-mono text-xs text-white/40 tracking-wider">
                                {aluno.cpf || 'S/N'}
                            </span>
                        </td>
                        <td className="px-6 py-5">
                            <div className="flex items-center gap-2">
                                <Building2 size={12} className="text-primary/40" />
                                <span className="text-xs font-dm text-white/60 truncate max-w-[160px]">{aluno.instituicao || '-'}</span>
                            </div>
                        </td>
                        <td className="px-6 py-5">
                            <div className="flex items-center gap-2">
                                <div className="w-1.5 h-1.5 rounded-full bg-primary/30" />
                                <span className="text-xs font-dm text-white/60 truncate max-w-[160px]">{aluno.projeto || '-'}</span>
                            </div>
                        </td>
                        <td className="px-6 py-5">
                            <center>
                                <div 
                                className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest font-mono shadow-sm border"
                                style={{ backgroundColor: st.bg, color: st.color, borderColor: `${st.color}25` }}
                                >
                                {aluno.status}
                                </div>
                            </center>
                        </td>
                        <td className="px-6 py-5 text-right">
                            <Button 
                                variant="ghost" size="icon" 
                                className="h-9 w-9 rounded-xl text-white/30 hover:text-white hover:bg-white/[0.05] hover:border-white/10 border border-transparent transition-all"
                                onClick={() => handleVerAluno(aluno)}
                            >
                                <Eye size={16} />
                            </Button>
                        </td>
                        </tr>
                    );
                })
              )}
              {!isLoading && alunos?.length === 0 && (
                 <tr>
                    <td colSpan={6} className="py-20 text-center">
                        <Search size={40} className="mx-auto text-white/5 mb-4" />
                        <p className="text-[11px] font-black uppercase tracking-widest text-white/20 font-mono italic">Busca sem resultados nesta frequência</p>
                    </td>
                 </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </MainLayout>
  );
}

// Para manter ícones consistentes
import { Check } from "lucide-react";
