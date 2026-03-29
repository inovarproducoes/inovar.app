export type TipoEvento = 'corporativo' | 'casamento' | 'festa' | 'workshop' | 
                 'conferencia' | 'aniversario' | 'formatura' | 'outro';
export type StatusEvento = 'planejamento' | 'confirmado' | 'em_andamento' | 'finalizado' | 'cancelado';
export interface ChecklistItem { item: string; feito: boolean; }
export interface Fornecedor { nome: string; contato: string; }

export interface Evento {
  id: string; nome: string; descricao: string | null;
  instituicao?: string | null;
  tipo_evento: TipoEvento; data_inicio: string; data_fim: string;
  horario_inicio: string; horario_fim: string;
  local_nome: string; endereco_completo: string;
  cidade: string; estado: string; cep: string | null; link_maps: string | null;
  capacidade_maxima: number; vagas_disponiveis: number;
  status: StatusEvento;
  valor_total: number; valor_entrada: number; valor_pendente: number;
  cliente_nome: string | null; cliente_email: string | null;
  cliente_telefone: string | null; cliente_empresa: string | null;
  responsavel_nome: string | null; responsavel_cpf: string | null;
  responsavel_email: string | null;
  observacoes: string | null; necessidades_especiais: string | null;
  fornecedores: (Fornecedor | string)[] | null;
  checklist: ChecklistItem[] | null;
  created_at: string; updated_at: string;
}
