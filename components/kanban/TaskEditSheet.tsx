"use client";

import { useState, useEffect } from "react";
import { 
  Sheet, 
  SheetContent, 
  SheetHeader, 
  SheetTitle,
  SheetDescription,
  SheetFooter
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { toast } from "sonner";
import { Trash2, Save } from "lucide-react";
import type { ITask, PrioridadeTarefa } from "@/types/kanban";

interface TaskEditSheetProps {
  task: ITask | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: () => void;
}

export function TaskEditSheet({ task, isOpen, onClose, onUpdate }: TaskEditSheetProps) {
  const [formData, setFormData] = useState<Partial<ITask>>({});
  const [loading, setLoading] = useState(false);

  const [usuarios, setUsuarios] = useState<{id: string, nome: string}[]>([]);

  useEffect(() => {
    if (task) {
      setFormData(task);
    }
    fetchUsuarios();
  }, [task]);

  const fetchUsuarios = async () => {
    try {
      const res = await fetch('/api/usuarios');
      if (res.ok) {
        const data = await res.json();
        setUsuarios(data);
      }
    } catch (error) {
      console.error("Erro ao buscar usuários:", error);
    }
  };

  const handleSave = async () => {
    if (!task) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/kanban/tasks/${task.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        toast.success("Tarefa atualizada");
        onUpdate();
        onClose();
      } else {
        toast.error("Erro ao salvar");
      }
    } catch {
      toast.error("Erro de conexão");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!task) return;
    if (!confirm("Deseja realmente excluir esta tarefa?")) return;
    
    setLoading(true);
    try {
      const res = await fetch(`/api/kanban/tasks/${task.id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        toast.success("Tarefa excluída");
        onUpdate();
        onClose();
      } else {
        toast.error("Erro ao excluir");
      }
    } catch {
      toast.error("Erro de conexão");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="sm:max-w-md border-l border-border/40 backdrop-blur-xl bg-background/95 overflow-y-auto">
        <SheetHeader className="mb-6">
          <SheetTitle className="text-xl font-bold flex items-center gap-2">
            Editar {task?.isOS ? 'Ordem de Serviço' : 'Tarefa'}
          </SheetTitle>
          <SheetDescription>
            Ajuste os detalhes e mantenha o fluxo atualizado.
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-6 py-4">
          <div className="space-y-2">
            <Label htmlFor="titulo" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Título</Label>
            <Input 
              id="titulo" 
              value={formData.titulo || ""} 
              onChange={e => setFormData({...formData, titulo: e.target.value})}
              className="bg-muted/30 border-none focus:ring-1 ring-primary"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="descricao" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Descrição</Label>
            <Textarea 
              id="descricao" 
              rows={3}
              value={formData.descricao || ""} 
              onChange={e => setFormData({...formData, descricao: e.target.value})}
              className="bg-muted/30 border-none resize-none focus:ring-1 ring-primary"
              placeholder="Descreva os detalhes desta atividade..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Prioridade</Label>
              <Select 
                value={formData.prioridade} 
                onValueChange={(val: PrioridadeTarefa) => setFormData({...formData, prioridade: val})}
              >
                <SelectTrigger className="bg-muted/30 border-none capitalize">
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="baixa">Baixa</SelectItem>
                  <SelectItem value="media">Média</SelectItem>
                  <SelectItem value="alta">Alta</SelectItem>
                  <SelectItem value="urgente">Urgente</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Responsável</Label>
              <Select 
                value={formData.responsavel_id || "unassigned"} 
                onValueChange={(val) => {
                  const user = usuarios.find(u => u.id === val);
                  setFormData({
                    ...formData, 
                    responsavel_id: val === "unassigned" ? null : val,
                    responsavel_nome: user ? user.nome : null
                  });
                }}
              >
                <SelectTrigger className="bg-muted/30 border-none">
                  <SelectValue placeholder="Selecione..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="unassigned">Sem responsável</SelectItem>
                  {usuarios.map(u => (
                    <SelectItem key={u.id} value={u.id}>{u.nome}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-6 pt-4 border-t border-border/30">
            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-primary/50">Aluno 1</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="aluno_nome" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Nome</Label>
                <Input 
                  id="aluno_nome" 
                  value={formData.aluno_nome || ""} 
                  onChange={e => setFormData({...formData, aluno_nome: e.target.value})}
                  className="bg-muted/30 border-none"
                  placeholder="Nome do aluno..."
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="aluno_cpf" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">CPF</Label>
                <Input 
                  id="aluno_cpf" 
                  value={formData.aluno_cpf || ""} 
                  onChange={e => setFormData({...formData, aluno_cpf: e.target.value})}
                  className="bg-muted/30 border-none"
                  placeholder="000.000.000-00"
                />
              </div>
            </div>

            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-primary/50">Aluno 2 (Opcional)</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="aluno2_nome" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Nome</Label>
                <Input 
                  id="aluno2_nome" 
                  value={formData.aluno2_nome || ""} 
                  onChange={e => setFormData({...formData, aluno2_nome: e.target.value})}
                  className="bg-muted/30 border-none"
                  placeholder="Nome do segundo aluno..."
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="aluno2_cpf" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">CPF</Label>
                <Input 
                  id="aluno2_cpf" 
                  value={formData.aluno2_cpf || ""} 
                  onChange={e => setFormData({...formData, aluno2_cpf: e.target.value})}
                  className="bg-muted/30 border-none"
                  placeholder="000.000.000-00"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="instituicao" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Instituição</Label>
                <Input 
                  id="instituicao" 
                  value={formData.instituicao || ""} 
                  onChange={e => setFormData({...formData, instituicao: e.target.value})}
                  className="bg-muted/30 border-none"
                  placeholder="Ex: Escola X..."
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="projeto_nome" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Projeto</Label>
                <Input 
                  id="projeto_nome" 
                  value={formData.projeto_nome || ""} 
                  onChange={e => setFormData({...formData, projeto_nome: e.target.value})}
                  className="bg-muted/30 border-none"
                  placeholder="Ex: Projeto Y..."
                />
              </div>
            </div>
          </div>
        </div>

        <SheetFooter className="mt-8 gap-3 sm:gap-0 border-t border-border/30 pt-6">
          <Button variant="ghost" size="sm" className="text-destructive hover:bg-destructive/10 hover:text-destructive flex-1 justify-center gap-2" onClick={handleDelete} disabled={loading}>
            <Trash2 className="w-4 h-4" /> Excluir
          </Button>
          <div className="flex gap-2 flex-1">
            <Button variant="outline" size="sm" className="flex-1" onClick={onClose}>Cancelar</Button>
            <Button size="sm" className="flex-1 gap-2" onClick={handleSave} disabled={loading}>
              <Save className="w-4 h-4" /> Salvar
            </Button>
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
