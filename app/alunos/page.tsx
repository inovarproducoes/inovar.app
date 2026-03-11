"use client";
import { MainLayout } from "@/components/layout/MainLayout";
import { useAlunos } from "@/hooks/useAlunos";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TURMAS_OPTIONS, CURSOS_OPTIONS } from "@/types/alunos";
import { useDebounce } from "@/hooks/useDebounce";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { formatarCPF } from "@/lib/cpfUtils";

export default function AlunosPage() {
  const [busca, setBusca] = useState("");
  const debouncedBusca = useDebounce(busca, 300);
  const [turma, setTurma] = useState<string>("todas");
  const [curso, setCurso] = useState<string>("todos");
  
  const { data: alunos, isLoading } = useAlunos({ 
    termo: debouncedBusca.length >= 3 ? debouncedBusca : undefined,
    turma: turma !== "todas" ? turma : undefined,
    curso: curso !== "todos" ? curso : undefined
  });

  const total = alunos?.length || 0;
  const ativos = alunos?.filter(a => a.status === 'ativo').length || 0;
  const inadimplentes = alunos?.filter(a => a.status === 'inadimplente' || a.status === 'trancado').length || 0;
  const concluidos = alunos?.filter(a => a.status === 'formado' || a.status === 'concluido').length || 0;

  const [novoAluno, setNovoAluno] = useState({nome: "", email: "", cpf: "", matricula: "", celular: "", turma: "A", curso: "Administração", status: "ativo"});

  return (
    <MainLayout title="Alunos" subtitle="Gestão de alunos e matrículas">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-card/60 backdrop-blur-xl p-4 rounded-xl border border-white/5 shadow-sm flex flex-col justify-center items-center hover:border-primary/30 transition-colors">
          <span className="text-3xl font-bold">{total}</span>
          <span className="text-sm font-medium text-muted-foreground mt-1">Matriculados</span>
        </div>
        <div className="bg-card/60 backdrop-blur-xl p-4 rounded-xl border border-white/5 shadow-sm flex flex-col justify-center items-center hover:border-success/30 transition-colors relative overflow-hidden">
          <div className="absolute top-0 right-0 w-16 h-16 bg-success/10 rounded-bl-full -mr-8 -mt-8" />
          <span className="text-3xl font-bold text-success relative z-10">{ativos}</span>
          <span className="text-sm font-medium text-muted-foreground mt-1 relative z-10">Ativos</span>
        </div>
        <div className="bg-card/60 backdrop-blur-xl p-4 rounded-xl border border-white/5 shadow-sm flex flex-col justify-center items-center hover:border-destructive/30 transition-colors relative overflow-hidden">
          <div className="absolute top-0 right-0 w-16 h-16 bg-destructive/10 rounded-bl-full -mr-8 -mt-8" />
          <span className="text-3xl font-bold text-destructive relative z-10">{inadimplentes}</span>
          <span className="text-sm font-medium text-muted-foreground mt-1 relative z-10">Inadimplentes</span>
        </div>
        <div className="bg-card/60 backdrop-blur-xl p-4 rounded-xl border border-white/5 shadow-sm flex flex-col justify-center items-center hover:border-info/30 transition-colors relative overflow-hidden">
          <div className="absolute top-0 right-0 w-16 h-16 bg-info/10 rounded-bl-full -mr-8 -mt-8" />
          <span className="text-3xl font-bold text-info relative z-10">{concluidos}</span>
          <span className="text-sm font-medium text-muted-foreground mt-1 relative z-10">Concluídos</span>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <Input placeholder="Buscar por nome, email, CPF (mín. 3 letras)..." className="flex-1" value={busca} onChange={e => setBusca(e.target.value)} />
        <Select value={turma} onValueChange={setTurma}>
          <SelectTrigger className="w-[200px]"><SelectValue placeholder="Turma" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="todas">Todas as turmas</SelectItem>
            {TURMAS_OPTIONS.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={curso} onValueChange={setCurso}>
          <SelectTrigger className="w-[250px]"><SelectValue placeholder="Curso" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos os cursos</SelectItem>
            {CURSOS_OPTIONS.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
          </SelectContent>
        </Select>
        <Dialog>
          <DialogTrigger asChild>
            <Button>Novo Aluno</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Adicionar Novo Aluno</DialogTitle>
              <DialogDescription>
                Preencha os dados básicos do aluno.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="nome" className="text-right">Nome *</Label>
                <Input id="nome" className="col-span-3" placeholder="Ex: João Silva" value={novoAluno.nome} onChange={e => setNovoAluno({...novoAluno, nome: e.target.value})} />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="email" className="text-right">Email *</Label>
                <Input id="email" type="email" className="col-span-3" placeholder="joao@exemplo.com" value={novoAluno.email} onChange={e => setNovoAluno({...novoAluno, email: e.target.value})} />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="cpf" className="text-right">CPF *</Label>
                <Input id="cpf" className="col-span-3" placeholder="000.000.000-00" maxLength={14} value={novoAluno.cpf} onChange={e => setNovoAluno({...novoAluno, cpf: formatarCPF(e.target.value)})} />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="matricula" className="text-right">Matrícula</Label>
                <Input id="matricula" className="col-span-3" placeholder="Ex: 2024001" value={novoAluno.matricula} onChange={e => setNovoAluno({...novoAluno, matricula: e.target.value})} />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="celular" className="text-right">Celular</Label>
                <Input id="celular" className="col-span-3" placeholder="(00) 00000-0000" value={novoAluno.celular} onChange={e => setNovoAluno({...novoAluno, celular: e.target.value})} />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="curso" className="text-right">Curso *</Label>
                <Select value={novoAluno.curso} onValueChange={v => setNovoAluno({...novoAluno, curso: v})}>
                  <SelectTrigger className="col-span-3"><SelectValue placeholder="Selecione o Curso" /></SelectTrigger>
                  <SelectContent>
                    {CURSOS_OPTIONS.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="turma" className="text-right">Turma *</Label>
                <Select value={novoAluno.turma} onValueChange={v => setNovoAluno({...novoAluno, turma: v})}>
                  <SelectTrigger className="col-span-3"><SelectValue placeholder="Selecione a Turma" /></SelectTrigger>
                  <SelectContent>
                    {TURMAS_OPTIONS.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
               <Button onClick={() => toast("Aluno salvo com sucesso!", { description: "Esta é uma simulação de sucesso." })}>Salvar Aluno</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="border rounded-lg overflow-x-auto bg-card">
        <table className="w-full text-sm text-left">
          <thead className="bg-muted text-muted-foreground uppercase text-xs">
            <tr>
              <th className="px-6 py-3">Nome / Email</th>
              <th className="px-6 py-3">Matrícula</th>
              <th className="px-6 py-3 hidden md:table-cell">Turma</th>
              <th className="px-6 py-3 hidden lg:table-cell">Curso</th>
              <th className="px-6 py-3">Status</th>
              <th className="px-6 py-3">Ações</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              [1, 2, 3, 4, 5].map(i => (
                 <tr key={i} className="border-b">
                   <td className="px-6 py-4"><Skeleton className="h-4 w-32 mb-2"/><Skeleton className="h-3 w-24"/></td>
                   <td className="px-6 py-4"><Skeleton className="h-4 w-20"/></td>
                   <td className="px-6 py-4 hidden md:table-cell"><Skeleton className="h-4 w-16"/></td>
                   <td className="px-6 py-4 hidden lg:table-cell"><Skeleton className="h-4 w-24"/></td>
                   <td className="px-6 py-4"><Skeleton className="h-6 w-16 rounded-full"/></td>
                   <td className="px-6 py-4"><Skeleton className="h-8 w-16"/></td>
                 </tr>
              ))
            ) : alunos?.length === 0 ? (
              <tr><td colSpan={6} className="text-center py-6 text-muted-foreground">Nenhum aluno encontrado.</td></tr>
            ) : alunos?.map(aluno => (
              <tr key={aluno.id} className="border-b hover:bg-muted/50">
                <td className="px-6 py-4">
                  <p className="font-semibold text-foreground">{aluno.nome}</p>
                  <p className="text-xs text-muted-foreground">{aluno.email}</p>
                </td>
                <td className="px-6 py-4">{aluno.matricula}</td>
                <td className="px-6 py-4 hidden md:table-cell">{aluno.turma}</td>
                <td className="px-6 py-4 hidden lg:table-cell text-xs truncate max-w-[200px]" title={aluno.curso}>{aluno.curso}</td>
                <td className="px-6 py-4">
                  <Badge className={`capitalize font-medium text-xs
                    ${aluno.status === 'ativo' ? 'bg-success text-white hover:bg-success/90' : ''}
                    ${aluno.status === 'inadimplente' ? 'bg-destructive text-white hover:bg-destructive/90' : ''}
                    ${aluno.status === 'formado' || aluno.status === 'concluido' ? 'bg-info text-white hover:bg-info/90' : ''}
                    ${aluno.status === 'trancado' || aluno.status === 'cancelado' ? 'bg-muted text-muted-foreground' : ''}
                  `}>
                    {aluno.status}
                  </Badge>
                </td>
                <td className="px-6 py-4">
                  <Button variant="ghost" size="sm">Editar</Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </MainLayout>
  );
}
