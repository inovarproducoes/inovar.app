import { z } from "zod";

const tipoEventoEnum = z.enum([
  "corporativo", "casamento", "festa", "workshop",
  "conferencia", "aniversario", "formatura", "outro"
]);

const statusEventoEnum = z.enum([
  "planejamento", "confirmado", "em_andamento", "finalizado", "cancelado"
]);

export const createEventoSchema = z.object({
  nome: z.string().min(2, "Nome deve ter no mínimo 2 caracteres"),
  descricao: z.string().optional().nullable(),
  tipo_evento: tipoEventoEnum,
  data_inicio: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Data inválida (use YYYY-MM-DD)"),
  data_fim: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Data inválida (use YYYY-MM-DD)"),
  horario_inicio: z.string().min(3, "Horário inválido"),
  horario_fim: z.string().min(3, "Horário inválido"),
  local_nome: z.string().min(2, "Nome do local é obrigatório"),
  endereco_completo: z.string().min(5, "Endereço é obrigatório"),
  cidade: z.string().min(2, "Cidade é obrigatória"),
  estado: z.string().min(2, "Estado é obrigatório").max(2, "Use a sigla do estado (ex: SP)"),
  cep: z.string().optional().nullable(),
  link_maps: z.string().url("URL inválida").optional().nullable().or(z.literal("")),
  capacidade_maxima: z.number().int().positive("Capacidade deve ser positiva"),
  vagas_disponiveis: z.number().int().min(0, "Vagas não podem ser negativas"),
  status: statusEventoEnum.optional().default("planejamento"),
  valor_total: z.number().min(0).optional().default(0),
  valor_entrada: z.number().min(0).optional().default(0),
  valor_pendente: z.number().min(0).optional().default(0),
  cliente_nome: z.string().optional().nullable(),
  cliente_email: z.string().email("Email inválido").optional().nullable().or(z.literal("")),
  cliente_telefone: z.string().optional().nullable(),
  cliente_empresa: z.string().optional().nullable(),
  responsavel_nome: z.string().optional().nullable(),
  responsavel_cpf: z.string().optional().nullable(),
  responsavel_email: z.string().email("Email inválido").optional().nullable().or(z.literal("")),
  observacoes: z.string().optional().nullable(),
  necessidades_especiais: z.string().optional().nullable(),
  fornecedores: z.array(z.object({ nome: z.string(), contato: z.string() })).optional(),
  checklist: z.array(z.object({ item: z.string(), feito: z.boolean() })).optional(),
});

export const updateEventoSchema = createEventoSchema.partial();

export type CreateEventoInput = z.infer<typeof createEventoSchema>;
export type UpdateEventoInput = z.infer<typeof updateEventoSchema>;
