"use client";
import { MainLayout } from "@/components/layout/MainLayout";
import { useState } from "react";
import { useCreateEvento } from "@/hooks/useEventos";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { formatarCPF } from "@/lib/cpfUtils";
import { toast } from "sonner";
import { TipoEvento, StatusEvento } from "@/types/database";

export default function NovoEventoPage() {
  const router = useRouter();
  const { mutateAsync: createEvento } = useCreateEvento();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<{
    nome: string; tipo_evento: TipoEvento; descricao: string; status: StatusEvento;
    data_inicio: string; data_fim: string; horario_inicio: string; horario_fim: string;
    local_nome: string; endereco_completo: string; cidade: string; estado: string; cep: string; link_maps: string;
    capacidade_maxima: number; vagas_disponiveis: number;
    cliente_nome: string; cliente_email: string; cliente_telefone: string; cliente_empresa: string;
    responsavel_nome: string; responsavel_cpf: string; responsavel_email: string;
    observacoes: string; necessidades_especiais: string;
    valor_total: number; valor_entrada: number;
  }>({
    nome: "", tipo_evento: "corporativo", descricao: "", status: "planejamento",
    data_inicio: "", data_fim: "", horario_inicio: "", horario_fim: "",
    local_nome: "", endereco_completo: "", cidade: "", estado: "", cep: "", link_maps: "",
    capacidade_maxima: 0, vagas_disponiveis: 0,
    cliente_nome: "", cliente_email: "", cliente_telefone: "", cliente_empresa: "",
    responsavel_nome: "", responsavel_cpf: "", responsavel_email: "",
    observacoes: "", necessidades_especiais: "",
    valor_total: 0, valor_entrada: 0
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await createEvento({
        ...formData,
        valor_pendente: formData.valor_total - formData.valor_entrada,
        vagas_disponiveis: formData.vagas_disponiveis || formData.capacidade_maxima,
        responsavel_cpf: formData.responsavel_cpf.replace(/\D/g, '')
      });
      router.push("/eventos");
    } catch {
      toast.error("Erro ao criar evento. Verifique os dados e tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <MainLayout title="Novo Evento" subtitle="Criar um novo evento no sistema">
      <div className="max-w-4xl mx-auto bg-card border rounded-lg p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <Tabs defaultValue="basico">
            <TabsList className="mb-6 flex-wrap pb-0 border-b justify-start overflow-x-auto h-auto rounded-none bg-transparent w-full">
              <TabsTrigger value="basico" className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none">Básico</TabsTrigger>
              <TabsTrigger value="datahora" className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none">Data/Hora</TabsTrigger>
              <TabsTrigger value="local" className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none">Local</TabsTrigger>
              <TabsTrigger value="capacidade" className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none">Capacidade</TabsTrigger>
              <TabsTrigger value="cliente" className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none">Cliente</TabsTrigger>
              <TabsTrigger value="responsavel" className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none">Responsável</TabsTrigger>
              <TabsTrigger value="observacoes" className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none">Observações</TabsTrigger>
            </TabsList>

            <TabsContent value="basico" className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-1">Nome do Evento *</label>
                  <Input required value={formData.nome} onChange={e => setFormData({...formData, nome: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Tipo de Evento</label>
                  <Select value={formData.tipo_evento} onValueChange={(v) => setFormData({...formData, tipo_evento: v as TipoEvento})}>
                    <SelectTrigger><SelectValue placeholder="Selecione o tipo" /></SelectTrigger>
                    <SelectContent>
                      {["corporativo", "casamento", "festa", "workshop", "conferencia", "aniversario", "formatura", "outro"].map(t => <SelectItem key={t} value={t} className="capitalize">{t}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Status</label>
                  <Select value={formData.status} onValueChange={(v) => setFormData({...formData, status: v as StatusEvento})}>
                    <SelectTrigger><SelectValue placeholder="Selecione o status" /></SelectTrigger>
                    <SelectContent>
                      {["planejamento", "confirmado", "em_andamento", "finalizado", "cancelado"].map(t => <SelectItem key={t} value={t} className="capitalize">{t.replace("_", " ")}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-1">Descrição</label>
                  <Textarea rows={3} value={formData.descricao} onChange={e => setFormData({...formData, descricao: e.target.value})} />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="datahora" className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Data Início *</label>
                  <Input type="date" required value={formData.data_inicio} onChange={e => setFormData({...formData, data_inicio: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Data Fim</label>
                  <Input type="date" value={formData.data_fim} onChange={e => setFormData({...formData, data_fim: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Horário de Início *</label>
                  <Input type="time" required value={formData.horario_inicio} onChange={e => setFormData({...formData, horario_inicio: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Horário de Fim</label>
                  <Input type="time" value={formData.horario_fim} onChange={e => setFormData({...formData, horario_fim: e.target.value})} />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="local" className="space-y-4">
               <div className="grid md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-1">Nome do Local *</label>
                  <Input required value={formData.local_nome} onChange={e => setFormData({...formData, local_nome: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Endereço Completo</label>
                  <Input value={formData.endereco_completo} onChange={e => setFormData({...formData, endereco_completo: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Cidade</label>
                  <Input value={formData.cidade} onChange={e => setFormData({...formData, cidade: e.target.value})} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">UF</label>
                    <Input maxLength={2} value={formData.estado} onChange={e => setFormData({...formData, estado: e.target.value.toUpperCase()})} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">CEP</label>
                    <Input maxLength={9} value={formData.cep} onChange={e => setFormData({...formData, cep: e.target.value})} />
                  </div>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-1">Link do Google Maps</label>
                  <Input value={formData.link_maps} onChange={e => setFormData({...formData, link_maps: e.target.value})} placeholder="https://maps.google.com/..." />
                </div>
               </div>
            </TabsContent>

            <TabsContent value="capacidade" className="space-y-4">
               <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Capacidade Máxima</label>
                    <Input type="number" min={0} value={formData.capacidade_maxima} onChange={e => setFormData({...formData, capacidade_maxima: Number(e.target.value), vagas_disponiveis: Number(e.target.value)})} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Vagas Disponíveis</label>
                    <Input type="number" min={0} value={formData.vagas_disponiveis} onChange={e => setFormData({...formData, vagas_disponiveis: Number(e.target.value)})} />
                  </div>
               </div>
            </TabsContent>

            <TabsContent value="cliente" className="space-y-4">
               <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Nome do Contratante</label>
                    <Input value={formData.cliente_nome} onChange={e => setFormData({...formData, cliente_nome: e.target.value})} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Empresa</label>
                    <Input value={formData.cliente_empresa} onChange={e => setFormData({...formData, cliente_empresa: e.target.value})} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Email</label>
                    <Input type="email" value={formData.cliente_email} onChange={e => setFormData({...formData, cliente_email: e.target.value})} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Telefone / WhatsApp</label>
                    <Input value={formData.cliente_telefone} onChange={e => setFormData({...formData, cliente_telefone: e.target.value})} />
                  </div>
               </div>
            </TabsContent>

            <TabsContent value="responsavel" className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Responsável Legal (Nome)</label>
                    <Input value={formData.responsavel_nome} onChange={e => setFormData({...formData, responsavel_nome: e.target.value})} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Responsável Legal (CPF)</label>
                    <Input maxLength={14} value={formData.responsavel_cpf} onChange={e => setFormData({...formData, responsavel_cpf: formatarCPF(e.target.value)})} placeholder="000.000.000-00"/>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium mb-1">Email do Responsável</label>
                    <Input type="email" value={formData.responsavel_email} onChange={e => setFormData({...formData, responsavel_email: e.target.value})} />
                  </div>
                </div>
            </TabsContent>

            <TabsContent value="observacoes" className="space-y-4">
                <div className="grid gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Observações Internas</label>
                    <Textarea rows={4} value={formData.observacoes} onChange={e => setFormData({...formData, observacoes: e.target.value})} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Necessidades Especiais</label>
                    <Textarea rows={4} value={formData.necessidades_especiais} onChange={e => setFormData({...formData, necessidades_especiais: e.target.value})} placeholder="Acessibilidade, restrições alimentares, etc." />
                  </div>
                </div>
            </TabsContent>
          </Tabs>

          {formData.tipo_evento === "formatura" && (
            <div className="bg-primary/5 p-6 rounded-lg border border-primary/20 space-y-4 mt-8">
              <h3 className="text-lg font-semibold text-primary">Alunos da Formatura</h3>
              <p className="text-sm text-muted-foreground">Adicione alunos à lista desta formatura. O sistema verificará duplicidades por matrícula e e-mail.</p>
              
              <div className="grid md:grid-cols-3 gap-4 bg-background p-4 rounded border">
                 <div><label className="block text-xs font-medium mb-1">Nome do Aluno</label><Input placeholder="Ex: João Silva" /></div>
                 <div><label className="block text-xs font-medium mb-1">Matrícula</label><Input placeholder="Ex: 2024001" /></div>
                 <div><label className="block text-xs font-medium mb-1">Email</label><Input type="email" placeholder="joao@alu.com" /></div>
                 <div className="md:col-span-3 text-right">
                   <Button type="button" variant="secondary" size="sm">+ Adicionar à Lista</Button>
                 </div>
              </div>
            </div>
          )}

          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button type="button" variant="outline" onClick={() => router.back()}>Cancelar</Button>
            <Button type="submit" disabled={loading}>{loading ? 'Salvando...' : 'Salvar Evento'}</Button>
          </div>
        </form>
      </div>
    </MainLayout>
  );
}
