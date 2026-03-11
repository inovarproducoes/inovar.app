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
  const formados = alunos?.filter(a => a.status === 'formado').length || 0;

  return (
    <MainLayout title="Alunos" subtitle="Gestão de alunos e matrículas">
      <div className="grid md:grid-cols-3 gap-6 mb-6">
        <div className="bg-gradient-to-br from-primary/20 to-primary/5 p-4 rounded-xl border flex flex-col justify-center items-center">
          <span className="text-3xl font-bold">{total}</span>
          <span className="text-sm font-medium text-muted-foreground">Total de Alunos</span>
        </div>
        <div className="bg-gradient-to-br from-success/20 to-success/5 p-4 rounded-xl border flex flex-col justify-center items-center">
          <span className="text-3xl font-bold text-success">{ativos}</span>
          <span className="text-sm font-medium text-muted-foreground">Alunos Ativos</span>
        </div>
        <div className="bg-gradient-to-br from-info/20 to-info/5 p-4 rounded-xl border flex flex-col justify-center items-center">
          <span className="text-3xl font-bold text-info">{formados}</span>
          <span className="text-sm font-medium text-muted-foreground">Formados/Egressos</span>
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
        <Button>Novo Aluno</Button>
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
              <tr><td colSpan={6} className="text-center py-6">Carregando...</td></tr>
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
                  <Badge variant={aluno.status === 'ativo' ? 'default' : 'secondary'}>{aluno.status}</Badge>
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
