import { Aluno, EventoAluno } from "@/types/alunos";

export const alunosService = {
  buscarAlunos: async (filtros?: { termo?: string; turma?: string; curso?: string; status?: string }) => {
    const params = new URLSearchParams();
    if (filtros?.termo) params.append("termo", filtros.termo);
    if (filtros?.turma) params.append("turma", filtros.turma);
    if (filtros?.curso) params.append("curso", filtros.curso);
    if (filtros?.status) params.append("status", filtros.status);
    
    const res = await fetch(`/api/alunos?${params.toString()}`);
    if (!res.ok) throw new Error("Erro alunos");
    return res.json() as Promise<Aluno[]>;
  },
  buscarAlunoPorMatricula: async (mat: string) => {
    const res = await fetch(`/api/alunos/matricula/${mat}`);
    if (!res.ok && res.status !== 404) throw new Error("Erro");
    if (res.status === 404) return null;
    return res.json() as Promise<Aluno>;
  },
  criarAluno: async (data: Partial<Aluno>) => {
    const res = await fetch(`/api/alunos`, {
      method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data)
    });
    if (!res.ok) {
       const err = await res.json();
       throw new Error(err.error || "Erro");
    }
    return res.json() as Promise<Aluno>;
  },
  vincularAlunoEvento: async (data: { evento_id: string; aluno_id: string; [key: string]: any }) => {
    const res = await fetch(`/api/evento-alunos`, {
      method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data)
    });
    if (!res.ok && res.status !== 409) throw new Error("Erro");
    return res.json() as Promise<EventoAluno>;
  },
  buscarAlunosDoEvento: async (evId: string) => {
    const res = await fetch(`/api/evento-alunos?evento_id=${evId}`);
    if (!res.ok) throw new Error("Erro");
    return res.json() as Promise<EventoAluno[]>;
  }
};
