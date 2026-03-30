"use client";
import { MainLayout } from "@/components/layout/MainLayout";
import { useAlunos } from "@/hooks/useAlunos";
import { useState, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Aluno } from "@/types/alunos";
import { useDebounce } from "@/hooks/useDebounce";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { formatarCPF } from "@/lib/cpfUtils";
import { Search, Eye } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

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
  const inadimplentes = alunosData?.filter(a => a.status === 'inadimplente' || a.status === 'trancado').length || 0;
  const concluidos = alunosData?.filter(a => a.status === 'formado' || a.status === 'concluido').length || 0;

  const [novoAluno, setNovoAluno] = useState({nome: "", cpf: "", telefone: "", instituicao: "", projeto: "", status: "ativo"});
  const [alunoSelecionado, setAlunoSelecionado] = useState<Aluno | null>(null);
  const [isViewOpen, setIsViewOpen] = useState(false);

  const handleVerAluno = (aluno: Aluno) => {
    setAlunoSelecionado(aluno);
    setIsViewOpen(true);
  };

  return (
    <MainLayout title="Alunos / Contatos" subtitle="Gestão de contatos e participações">
      <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Detalhes do Aluno</DialogTitle>
            <DialogDescription>
              Visualize e gerencie os dados de {alunoSelecionado?.nome}
            </DialogDescription>
          </DialogHeader>
          
          {alunoSelecionado && (
            <div className="w-full space-y-4 py-4">
              <h3 className="text-sm font-semibold border-b pb-2 mb-4 text-muted-foreground uppercase tracking-wider">Dados Básicos e Organização</h3>
              <div className="grid gap-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label className="text-right">Nome</Label>
                  <Input className="col-span-3 font-semibold" value={alunoSelecionado.nome} readOnly />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label className="text-right">CPF</Label>
                  <Input className="col-span-3" value={alunoSelecionado.cpf || alunoSelecionado.cpf_responsavel || ''} readOnly />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label className="text-right">Telefone</Label>
                  <Input className="col-span-3" value={alunoSelecionado.telefone || alunoSelecionado.telefone_responsavel || ''} readOnly />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label className="text-right text-indigo-600 dark:text-indigo-400 font-medium">Instituição</Label>
                  <Input className="col-span-3 font-medium bg-indigo-50/50 dark:bg-indigo-950/20" value={alunoSelecionado.instituicao || ''} readOnly />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label className="text-right text-emerald-600 dark:text-emerald-400 font-medium">Projeto</Label>
                  <Input className="col-span-3 font-medium bg-emerald-50/50 dark:bg-emerald-950/20" value={alunoSelecionado.projeto || ''} readOnly />
                </div>
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsViewOpen(false)}>Fechar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-card/60 backdrop-blur-xl p-4 rounded-xl border border-white/5 shadow-sm flex flex-col justify-center items-center hover:border-primary/30 transition-colors">
          <span className="text-3xl font-bold">{total}</span>
          <span className="text-sm font-medium text-muted-foreground mt-1">Registrados</span>
        </div>
        <div className="bg-card/60 backdrop-blur-xl p-4 rounded-xl border border-white/5 shadow-sm flex flex-col justify-center items-center hover:border-success/30 transition-colors relative overflow-hidden">
          <div className="absolute top-0 right-0 w-16 h-16 bg-success/10 rounded-bl-full -mr-8 -mt-8" />
          <span className="text-3xl font-bold text-success relative z-10">{ativos}</span>
          <span className="text-sm font-medium text-muted-foreground mt-1 relative z-10">Ativos</span>
        </div>
        <div className="bg-card/60 backdrop-blur-xl p-4 rounded-xl border border-white/5 shadow-sm flex flex-col justify-center items-center hover:border-destructive/30 transition-colors relative overflow-hidden">
          <div className="absolute top-0 right-0 w-16 h-16 bg-destructive/10 rounded-bl-full -mr-8 -mt-8" />
          <span className="text-3xl font-bold text-destructive relative z-10">{inadimplentes}</span>
          <span className="text-sm font-medium text-muted-foreground mt-1 relative z-10">Pendências</span>
        </div>
        <div className="bg-card/60 backdrop-blur-xl p-4 rounded-xl border border-white/5 shadow-sm flex flex-col justify-center items-center hover:border-info/30 transition-colors relative overflow-hidden">
          <div className="absolute top-0 right-0 w-16 h-16 bg-info/10 rounded-bl-full -mr-8 -mt-8" />
          <span className="text-3xl font-bold text-info relative z-10">{concluidos}</span>
          <span className="text-sm font-medium text-muted-foreground mt-1 relative z-10">Historico Finalizado</span>
        </div>
      </div>

      <div className="flex flex-col md:flex-row items-center gap-4 mb-6">
        <div className="relative w-full md:max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Buscar por nome ou CPF..." className="pl-9 w-full bg-card" value={busca} onChange={e => setBusca(e.target.value)} />
        </div>

        <Select value={statusFiltro} onValueChange={setStatusFiltro}>
          <SelectTrigger className="w-full md:w-[150px] bg-card"><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos os status</SelectItem>
            <SelectItem value="ativo">Ativo</SelectItem>
            <SelectItem value="formado">Formado</SelectItem>
            <SelectItem value="inadimplente">Inadimplente</SelectItem>
            <SelectItem value="trancado">Trancado</SelectItem>
          </SelectContent>
        </Select>

        <Dialog>
          <DialogTrigger asChild>
            <Button className="w-full md:w-auto md:ml-auto">+ Novo Aluno</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Adicionar Novo Aluno</DialogTitle>
              <DialogDescription>
                Preencha as informações básicas do contato.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="nome" className="text-right">Nome *</Label>
                <Input id="nome" className="col-span-3" placeholder="Ex: João Silva" value={novoAluno.nome} onChange={e => setNovoAluno({...novoAluno, nome: e.target.value})} />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="cpf" className="text-right">CPF *</Label>
                <Input id="cpf" className="col-span-3" placeholder="000.000.000-00" maxLength={14} value={novoAluno.cpf || ''} onChange={e => setNovoAluno({...novoAluno, cpf: formatarCPF(e.target.value)})} />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="telefone" className="text-right">Telefone</Label>
                <Input id="telefone" className="col-span-3" placeholder="(00) 00000-0000" value={novoAluno.telefone || ''} onChange={e => setNovoAluno({...novoAluno, telefone: e.target.value})} />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="instituicao" className="text-right">Instituição</Label>
                <Input id="instituicao" className="col-span-3" placeholder="Ex: Colégio Adventista / Empresa X" value={novoAluno.instituicao} onChange={e => setNovoAluno({...novoAluno, instituicao: e.target.value})} />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="projeto" className="text-right">Projeto</Label>
                <Input id="projeto" className="col-span-3" placeholder="Ex: Formatura 2026" value={novoAluno.projeto} onChange={e => setNovoAluno({...novoAluno, projeto: e.target.value})} />
              </div>
            </div>
            <DialogFooter>
               <Button onClick={() => toast("Aluno salvo com sucesso!", { description: "Esta é uma simulação de sucesso." })}>Salvar Cadastro</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="border rounded-lg bg-card overflow-hidden shadow-sm">
        <div className="w-full overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-muted/50 text-muted-foreground uppercase text-[11.5px] tracking-wider">
              <tr>
                <th className="px-5 py-3 font-semibold">Contato</th>
                <th className="px-5 py-3 font-semibold hidden md:table-cell">CPF</th>
                <th className="px-5 py-3 font-semibold">Instituição</th>
                <th className="px-5 py-3 font-semibold">Projeto</th>
                <th className="px-5 py-3 font-semibold">Status</th>
                <th className="px-5 py-3 font-semibold text-right">Ação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {isLoading ? (
                [1, 2, 3, 4, 5].map(i => (
                   <tr key={i} className="bg-card">
                     <td className="px-5 py-3"><Skeleton className="h-4 w-32 mb-2"/><Skeleton className="h-3 w-24"/></td>
                     <td className="px-5 py-3 hidden md:table-cell"><Skeleton className="h-4 w-20"/></td>
                     <td className="px-5 py-3"><Skeleton className="h-4 w-24"/></td>
                     <td className="px-5 py-3"><Skeleton className="h-4 w-24"/></td>
                     <td className="px-5 py-3"><Skeleton className="h-6 w-16 rounded-full"/></td>
                     <td className="px-5 py-3 text-right"><Skeleton className="h-8 w-8 inline-block"/></td>
                   </tr>
                ))
              ) : alunos?.length === 0 ? (
                <tr><td colSpan={6} className="text-center py-8 text-muted-foreground text-sm">Nenhum registro encontrado.</td></tr>
              ) : alunos?.map(aluno => (
                <tr key={aluno.id} className="bg-card hover:bg-muted/30 transition-colors">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8 text-xs font-bold text-white bg-indigo-500">
                        <AvatarFallback className="bg-transparent">{aluno.nome.substring(0, 2).toUpperCase()}</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-bold text-[13.5px] text-foreground">{aluno.nome}</div>
                        <div className="text-[11px] text-muted-foreground">{aluno.telefone || "Sem telefone"}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3 hidden md:table-cell text-[13.5px] font-medium">{aluno.cpf || 'S/N'}</td>
                  <td className="px-5 py-3 text-[13.5px] truncate max-w-[180px]">{aluno.instituicao || '-'}</td>
                  <td className="px-5 py-3 text-[13.5px] truncate max-w-[180px]">{aluno.projeto || '-'}</td>
                  <td className="px-5 py-3">
                    <Badge variant="outline" className={`relative pl-3 capitalize ${
                      aluno.status === 'ativo' ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-400' :
                      aluno.status === 'inadimplente' ? 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950/50 dark:text-red-400' :
                      aluno.status === 'formado' || aluno.status === 'concluido' ? 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/50 dark:text-blue-400' :
                      'bg-secondary text-muted-foreground'
                    }`}>
                      <span className="absolute left-1.5 top-1/2 -translate-y-1/2 w-1 h-1 rounded-full bg-current" />
                      {aluno.status}
                    </Badge>
                  </td>
                  <td className="px-5 py-3 text-right">
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:bg-muted" onClick={() => handleVerAluno(aluno)}>
                      <Eye className="h-4 w-4" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </MainLayout>
  );
}
