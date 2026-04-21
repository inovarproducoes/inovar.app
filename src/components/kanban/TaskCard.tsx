"use client";
import React from "react";
import { ITask, IColumn } from "@/types/kanban";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { 
  User as UserIcon, Building2, 
  Clock, Briefcase, Check, Archive
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface TaskCardProps {
  task: ITask;
  id?: string; // Aceitar ID opcional do pai
  allColumns?: IColumn[]; // Receber todas as colunas para o seletor
  allUsers?: {id: string, nome: string}[]; // Receber usuários para o seletor
  onUpdate?: () => void; // Aceitar onUpdate opcional do pai
  onClick?: (task: ITask) => void;
}

const PRIORIDADE_COLORS = {
  baixa: { bg: "bg-blue-500/10", text: "text-blue-500", border: "border-blue-500/20" },
  media: { bg: "bg-yellow-500/10", text: "text-yellow-500", border: "border-yellow-500/20" },
  alta: { bg: "bg-orange-500/10", text: "text-orange-500", border: "border-orange-500/20" },
  urgente: { bg: "bg-red-500/10", text: "text-red-500", border: "border-red-500/20" },
};

export function TaskCard({ task, onClick, onUpdate, allColumns, allUsers }: TaskCardProps) {
  const {
    setNodeRef,
    attributes,
    listeners,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: task.id,
    data: {
      type: "Task",
      task,
    },
  });

  const style = {
    transition,
    transform: CSS.Translate.toString(transform),
  };

  const priorityStyle = PRIORIDADE_COLORS[task.prioridade] || PRIORIDADE_COLORS.baixa;

  const handleMoveColumn = async (newColumnId: string) => {
    if (newColumnId === task.coluna_id) return;
    try {
      const res = await fetch(`/api/kanban/tasks`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          id: task.id,
          coluna_id: newColumnId, 
          ordem: 0 
        })
      });
      if (res.ok) {
        toast.success("Movido com sucesso!");
        onUpdate?.();
      } else {
        toast.error("Erro ao mover a tarefa.");
      }
    } catch {
      toast.error("Erro de conexão");
    }
  };

  const handleUpdateResponsavel = async (responsavelId: string) => {
    try {
      const user = allUsers?.find(u => u.id === responsavelId);
      const res = await fetch(`/api/kanban/tasks/${task.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          responsavel_id: responsavelId === "unassigned" ? null : responsavelId,
          responsavel_nome: user ? user.nome : null
        })
      });
      if (res.ok) {
        toast.success("Responsável atualizado!");
        onUpdate?.();
      }
    } catch {
      toast.error("Erro ao atualizar responsável");
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={() => onClick?.(task)}
      className={`
        bg-card p-5 rounded-2xl border-2 border-border/40 transition-all duration-300 cursor-pointer select-none group
        hover:border-primary hover:shadow-xl hover:shadow-primary/5
        ${isDragging ? 'z-50 ring-2 ring-primary ring-offset-4 ring-offset-background opacity-30 cursor-grabbing scale-[1.02]' : 'hover:-translate-y-1'}
      `}
    >
      <div className="space-y-4">
        {/* Header: OS ID & Priority */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            <span className="text-[10px] font-black font-dm uppercase tracking-widest text-muted-foreground">
              OS #{task.numero_os || task.id.split('-')[0]}
            </span>
          </div>
          <Badge 
            variant="outline" 
            className={`text-[9px] px-2 h-5 font-bold uppercase tracking-tighter ${priorityStyle.bg} ${priorityStyle.text} ${priorityStyle.border} border`}
          >
            {task.prioridade}
          </Badge>
        </div>

        {/* Title */}
        <h4 className="font-dm font-bold text-[14.5px] leading-tight text-foreground group-hover:text-primary transition-colors">
          {task.titulo}
        </h4>

        {/* Dynamic Project/Student Info */}
        <div className="space-y-2.5">
          {task.aluno_nome && (
            <div className="flex items-center gap-2 text-[11.5px] text-primary/80 font-bold font-dm">
              <UserIcon className="w-3.5 h-3.5 text-primary" />
              <span className="truncate">{task.aluno_nome}</span>
            </div>
          )}

          {task.aluno2_nome && (
            <div className="flex items-center gap-2 text-[11.5px] text-primary/60 font-bold font-dm border-t border-primary/5 pt-1">
              <UserIcon className="w-3 h-3 text-primary/40" />
              <span className="truncate">{task.aluno2_nome}</span>
            </div>
          )}

          <div className="pt-2 border-t border-border/10" onClick={(e) => e.stopPropagation()} onPointerDown={(e) => e.stopPropagation()}>
            <div className="flex items-center gap-2 mb-1">
               <Check size={12} className="text-emerald-500" />
               <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Responsável</span>
            </div>
            <Select value={task.responsavel_id || "unassigned"} onValueChange={handleUpdateResponsavel}>
              <SelectTrigger className="h-7 text-[10px] bg-muted/20 border-none font-dm font-bold text-foreground">
                <SelectValue placeholder="Selecione..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="unassigned" className="text-[10px]">Sem responsável</SelectItem>
                {allUsers?.map(u => (
                  <SelectItem key={u.id} value={u.id} className="text-[10px]">{u.nome}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          {task.projeto_nome && (
            <div className="flex items-center gap-2 text-[11px] text-indigo-500 font-bold font-dm bg-indigo-500/5 px-2 py-1 rounded-md border border-indigo-500/10">
              <Briefcase className="w-3.5 h-3.5" />
              <span className="truncate uppercase tracking-tight">{task.projeto_nome}</span>
            </div>
          )}

          {task.instituicao && (
            <div className="flex items-center gap-2 text-[11px] text-muted-foreground font-medium font-dm">
              <Building2 className="w-3.5 h-3.5 text-muted-foreground/60" />
              <span className="truncate">{task.instituicao}</span>
            </div>
          )}
        </div>

        {/* Footer Meta */}
        <div className="pt-3 border-t border-border/30 space-y-3">
          {allColumns && allColumns.length > 0 && (
             <div onClick={(e) => e.stopPropagation()} onPointerDown={(e) => e.stopPropagation()}>
               <Select value={task.coluna_id} onValueChange={handleMoveColumn}>
                 <SelectTrigger className="h-7 text-[10px] w-full bg-muted/30 border-none font-dm font-bold text-muted-foreground hover:bg-muted/50 transition-colors">
                   <SelectValue placeholder="Mover..." />
                 </SelectTrigger>
                 <SelectContent className="text-[10px] font-dm bg-card border-border">
                   {allColumns.map(c => (
                     <SelectItem key={c.id} value={c.id} className="text-[10px]">
                       {c.nome}
                     </SelectItem>
                   ))}
                 </SelectContent>
               </Select>
             </div>
          )}

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground font-bold uppercase tracking-tighter">
               {task.created_at && (
                 <>
                   <Clock size={12} className="text-primary/50" />
                   {new Date(task.created_at).toLocaleDateString()}
                 </>
               )}
            </div>
          
            <button 
               onClick={async (e) => {
                 e.stopPropagation();
                 if (window.confirm('Tem certeza que deseja arquivar? O item não será mais exibido no Kanban.')) {
                   try {
                     const res = await fetch(`/api/kanban/tasks/${task.id}`, { method: 'DELETE' });
                     if (res.ok) {
                       toast.success("Arquivado com sucesso!");
                       onUpdate?.();
                     } else {
                       toast.error("Erro ao arquivar");
                     }
                   } catch {
                     toast.error("Erro de conexão");
                   }
                 }
               }}
               className="text-muted-foreground/40 hover:text-red-500 hover:bg-red-500/10 p-1.5 rounded-lg transition-all flex items-center gap-1.5 group/archive"
               title="Arquivar Ordem de Serviço / Tarefa"
            >
               <Archive size={14} className="group-hover/archive:scale-110 transition-transform" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
