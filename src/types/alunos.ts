export type StatusAluno = 'ativo' | 'inativo' | 'transferido' | 'formado' | 'inadimplente' | 'trancado' | 'concluido' | 'cancelado';
export type StatusParticipacao = 'pendente' | 'confirmado' | 'cancelado' | 'compareceu' | 'ausente';
export type Periodo = 'matutino' | 'vespertino' | 'noturno' | 'integral';
export type StatusTurma = 'ativa' | 'inativa' | 'concluida';

export interface Aluno {
  id: string; matricula?: string | null; nome: string; cpf?: string | null; idade?: number | null;
  email?: string | null; telefone?: string | null; turma?: string | null; curso?: string | null;
  instituicao?: string | null; projeto?: string | null;
  cidade?: string | null; responsavel?: string | null;
  cpf_responsavel?: string | null; telefone_responsavel?: string | null;
  email_responsavel?: string | null; foto_url?: string | null;
  status: StatusAluno; observacoes?: string | null;
  created_at: string; updated_at: string; created_by?: string | null;
}

export type AlunoFormData = Omit<Aluno, 'id' | 'created_at' | 'updated_at' | 'created_by'>;

export interface EventoAluno {
  id: string; evento_id: string; aluno_id: string;
  status_participacao: StatusParticipacao;
  funcao?: string | null; mesa?: string | null;
  acompanhantes: number; necessidades_especiais?: string | null;
  confirma_presenca: boolean; data_confirmacao?: string | null;
  observacoes?: string | null; aluno?: Aluno;
}

export const TURMAS_OPTIONS = [
  '1º Ano A', '1º Ano B', '1º Ano C',
  '2º Ano A', '2º Ano B', '2º Ano C',
  '3º Ano A', '3º Ano B', '3º Ano C'
];
export const CURSOS_OPTIONS = [
  'Ensino Médio Regular', 'Técnico em Informática',
  'Técnico em Administração', 'Técnico em Enfermagem',
  'Técnico em Mecânica', 'Técnico em Eletrônica',
];
