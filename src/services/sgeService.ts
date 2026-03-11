import { ParcelaSGE, AlunoSGE } from "@/types/financeiro";

export const sgeService = {
  buscarAlunoSGE: async (cpf: string) => {
    const res = await fetch(`/api/sge?endpoint=/aluno/${cpf}`);
    if (!res.ok) throw new Error("Erro SGE aluno");
    return res.json() as Promise<AlunoSGE>;
  },
  buscarParcelasSGE: async (cpf: string) => {
    const res = await fetch(`/api/sge?endpoint=/aluno/${cpf}/parcelas`);
    if (!res.ok) throw new Error("Erro SGE parcelas");
    return res.json() as Promise<ParcelaSGE[]>;
  }
};
