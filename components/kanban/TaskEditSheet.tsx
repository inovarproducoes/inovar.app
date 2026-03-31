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

  useEffect(() => {
    if (task) {
      setFormData(task);
    }
  }, [task]);

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
      <SheetContent className="sm:max-w-md border-l border-border/40 backdrop-blur-xl bg-background/95">
        <SheetHeader className="mb-6">
          <SheetTitle className="text-xl font-bold flex items-center gap-2">
            Editar Tarefa
          </SheetTitle>
          <SheetDescription>
            Ajuste os detalhes da tarefa e mantenha o fluxo atualizado.
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
              rows={4}
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
              <Input 
                value={formData.responsavel_nome || ""} 
                onChange={e => setFormData({...formData, responsavel_nome: e.target.value})}
                className="bg-muted/30 border-none"
                placeholder="Nome..."
              />
            </div>
          </div>

          <div className="space-y-6 pt-4 border-t border-border/30">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="aluno_nome" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Nome do Aluno</Label>
                <Input 
                  id="aluno_nome" 
                  value={formData.aluno_nome || ""} 
                  onChange={e => setFormData({...formData, aluno_nome: e.target.value})}
                  className="bg-muted/30 border-none"
                  placeholder="Nome do aluno..."
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="aluno_cpf" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">CPF do Aluno</Label>
                <Input 
                  id="aluno_cpf" 
                  value={formData.aluno_cpf || ""} 
                  onChange={e => setFormData({...formData, aluno_cpf: e.target.value})}
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
