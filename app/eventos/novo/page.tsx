"use client";
import { MainLayout } from "@/components/layout/MainLayout";
import { useState } from "react";
import { useCreateEvento } from "@/hooks/useEventos";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { formatarCPF } from "@/lib/cpfUtils";

export default function NovoEventoPage() {
  const router = useRouter();
  const { mutateAsync: createEvento } = useCreateEvento();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    nome: "", tipo_evento: "corporativo", data_inicio: "", horario_inicio: "",
    local_nome: "", endereco_completo: "", cidade: "", estado: "", capacidade_maxima: 0,
    vagas_disponiveis: 0, status: "planejamento", valor_total: 0, valor_entrada: 0,
    responsavel_nome: "", responsavel_cpf: ""
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await createEvento({
        ...formData,
        valor_pendente: formData.valor_total - formData.valor_entrada,
        data_fim: formData.data_inicio,
        horario_fim: formData.horario_inicio,
      } as any);
      router.push("/eventos");
    } catch (err) {
      alert("Erro ao criar evento");
    } finally {
      setLoading(false);
    }
  };

  return (
    <MainLayout title="Novo Evento" subtitle="Criar um novo evento no sistema">
      <div className="max-w-4xl mx-auto bg-card border rounded-lg p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <Tabs defaultValue="basico">
            <TabsList className="mb-4">
              <TabsTrigger value="basico">Básico</TabsTrigger>
              <TabsTrigger value="local">Local e Capacidade</TabsTrigger>
              <TabsTrigger value="financeiro">Financeiro / Responsável</TabsTrigger>
            </TabsList>

            <TabsContent value="basico" className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Nome do Evento *</label>
                  <Input required value={formData.nome} onChange={e => setFormData({...formData, nome: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Tipo de Evento</label>
                  <select className="w-full h-10 rounded-md border border-input bg-transparent px-3" value={formData.tipo_evento} onChange={e => setFormData({...formData, tipo_evento: e.target.value})}>
                    {["corporativo", "casamento", "festa", "workshop", "conferencia", "aniversario", "formatura", "outro"].map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Data *</label>
                  <Input type="date" required value={formData.data_inicio} onChange={e => setFormData({...formData, data_inicio: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Horário de Início *</label>
                  <Input type="time" required value={formData.horario_inicio} onChange={e => setFormData({...formData, horario_inicio: e.target.value})} />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="local" className="space-y-4">
               <div className="grid md:grid-cols-2 gap-4">
                <div>
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
                    <label className="block text-sm font-medium mb-1">Capacidade</label>
                    <Input type="number" min={0} value={formData.capacidade_maxima} onChange={e => setFormData({...formData, capacidade_maxima: Number(e.target.value), vagas_disponiveis: Number(e.target.value)})} />
                  </div>
                </div>
               </div>
            </TabsContent>

            <TabsContent value="financeiro" className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Valor Total (R$)</label>
                    <Input type="number" step="0.01" value={formData.valor_total} onChange={e => setFormData({...formData, valor_total: Number(e.target.value)})} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Valor Entrada (R$)</label>
                    <Input type="number" step="0.01" value={formData.valor_entrada} onChange={e => setFormData({...formData, valor_entrada: Number(e.target.value)})} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Responsável Nome</label>
                    <Input value={formData.responsavel_nome} onChange={e => setFormData({...formData, responsavel_nome: e.target.value})} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Responsável CPF</label>
                    <Input maxLength={14} value={formData.responsavel_cpf} onChange={e => setFormData({...formData, responsavel_cpf: formatarCPF(e.target.value)})} placeholder="000.000.000-00"/>
                  </div>
                </div>
            </TabsContent>

          </Tabs>

          {formData.tipo_evento === "formatura" && (
            <div className="bg-primary/5 p-4 rounded-lg border border-primary/20">
              <h3 className="font-semibold text-primary mb-2">Alunos da Formatura</h3>
              <p className="text-sm text-muted-foreground mb-4">Em um projeto completo, a funcionalidade criarEventoComAlunos (AlunosFormaturaSection) seria renderizada aqui para importar ou cadastrar alunos em lote e vinculá-los diretamente.</p>
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
