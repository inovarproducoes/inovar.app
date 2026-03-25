"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Badge } from "@/components/ui/badge";
import { MessageCircle, Clock, Paperclip } from "lucide-react";
import type { ITask } from "@/types/kanban";

interface TaskCardProps {
  id: string;
  task: ITask;
}

export function TaskCard({ id, task }: TaskCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  const priorityColors = {
    baixa: "bg-blue-500",
    media: "bg-orange-500",
    alta: "bg-rose-500",
    urgente: "bg-red-600 animate-pulse"
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`bg-card p-4 rounded-xl shadow-sm border border-border group hover:border-primary/40 transition-all cursor-grab active:cursor-grabbing select-none ${isDragging ? 'z-50 ring-2 ring-primary ring-offset-2' : ''}`}
    >
      <div className="flex justify-between items-start mb-2">
        <div className={`w-8 h-1 rounded-full ${priorityColors[task.prioridade] || 'bg-muted'}`}/>
        <button className="text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity">
          <MessageCircle className="w-3.5 h-3.5"/>
        </button>
      </div>

      <h3 className="font-bold text-[13.5px] leading-tight mb-2 group-hover:text-primary transition-colors">{task.titulo}</h3>
      {task.descricao && <p className="text-xs text-muted-foreground line-clamp-2 mb-3 leading-relaxed">{task.descricao}</p>}

      <div className="flex flex-wrap gap-2 mb-3">
        {task.etiquetas?.map((tag: string, i: number) => (
          <Badge key={i} variant="secondary" className="text-[9px] px-1.5 py-0 font-normal uppercase tracking-wider">{tag}</Badge>
        ))}
      </div>

      <div className="flex items-center justify-between pt-3 border-t border-border/50">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-muted-foreground">
             <Clock className="w-3.5 h-3.5"/>
             <span className="text-[10px] font-medium">Auto</span>
          </div>
          {task.anexos && task.anexos > 0 ? (
            <div className="flex items-center gap-1 text-muted-foreground">
               <Paperclip className="w-3 h-3"/>
               <span className="text-[10px]">{task.anexos}</span>
            </div>
          ) : null}
        </div>
        <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center text-primary text-[10px] font-bold border border-primary/20">
          {task.responsavel_nome ? task.responsavel_nome.substring(0, 1) : "U"}
        </div>
      </div>
    </div>
  );
}
