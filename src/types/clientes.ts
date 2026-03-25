export interface Cliente {
  id: string; nome: string; telefone: string;
  email?: string | null; agente_ativo: boolean; created_at: string; updated_at?: string;
}
export interface ClienteFormData { nome: string; telefone: string; agente_ativo?: boolean; }
export interface MensagemConversa {
  id?: string; remetente: 'cliente' | 'agente'; conteudo: string;
  timestamp: string; tipo?: 'texto' | 'audio' | 'imagem' | 'pdf';
}
export interface HistoricoConversa { telefone: string; mensagens: MensagemConversa[]; }
