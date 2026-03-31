"use client";
import React from "react";
import { ITask } from "@/types/kanban";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { 
  User as UserIcon, Building2, 
  Clock, Briefcase, Check, Archive
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

interface TaskCardProps {
  task: ITask;
  id?: string; // Aceitar ID opcional do pai
  onUpdate?: () => void; // Aceitar onUpdate opcional do pai
  onClick?: (task: ITask) => void;
}

const PRIORIDADE_COLORS = {
  baixa: { bg: "bg-blue-500/10", text: "text-blue-500", border: "border-blue-500/20" },
  media: { bg: "bg-yellow-500/10", text: "text-yellow-500", border: "border-yellow-500/20" },
  alta: { bg: "bg-orange-500/10", text: "text-orange-500", border: "border-orange-500/20" },
  urgente: { bg: "bg-red-500/10", text: "text-red-500", border: "border-red-500/20" },
};

export function TaskCard({ task, onClick }: TaskCardProps) {
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

          {task.responsavel_nome && task.responsavel_nome !== task.aluno_nome && (
            <div className="flex items-center gap-2 text-[10.5px] text-muted-foreground font-medium font-dm">
              <Check size={12} className="text-emerald-500" />
              <span className="truncate">{task.responsavel_nome}</span>
            </div>
          )}
          
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
        <div className="pt-3 border-t border-border/30 flex items-center justify-between">
          <div className="flex items-center gap-3">
             {task.created_at && (
                <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground font-bold uppercase tracking-tighter">
                   <Clock size={12} className="text-primary/50" />
                   {new Date(task.created_at).toLocaleDateString()}
                </div>
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
  );
}
