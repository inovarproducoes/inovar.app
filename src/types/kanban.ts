export type PrioridadeTarefa = "baixa" | "media" | "alta" | "urgente";

export interface ITask {
  id: string;
  titulo: string;
  descricao?: string | null;
  prioridade: PrioridadeTarefa;
  responsavel_nome?: string | null;
  ordem: number;
  coluna_id: string;
  quadro_id: string;
  etiquetas: string[];
  anexos?: number;
  isOS?: boolean;
  numero_os?: string | number;
  aluno_nome?: string | null;
  aluno_cpf?: string | null;
  projeto_nome?: string | null;
  instituicao?: string | null;
  created_at?: string | Date | null;
}

export interface IColumn {
  id: string;
  nome: string;
  ordem: number;
  quadro_id: string;
  tarefas: ITask[];
}

export interface IBoard {
  id: string;
  nome: string;
  descricao?: string | null;
  ativo: boolean;
  arquivado: boolean;
  colunas: IColumn[];
}
