"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Badge } from "@/components/ui/badge";
import { MessageCircle, Clock, Paperclip } from "lucide-react";
import type { ITask } from "@/types/kanban";

interface TaskCardProps {
  id: string;
  task: ITask;
  onClick?: (task: ITask) => void;
}

export function TaskCard({ id, task, onClick }: TaskCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ 
    id,
    data: {
      type: "Task",
      task
    }
  });

  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  const priorityStyles = {
    baixa: { color: "bg-emerald-500", label: "Baixa", text: "text-emerald-700 bg-emerald-50" },
    media: { color: "bg-amber-500", label: "Média", text: "text-amber-700 bg-amber-50" },
    alta: { color: "bg-rose-500", label: "Alta", text: "text-rose-700 bg-rose-50" },
    urgente: { color: "bg-red-600 animate-pulse", label: "Urgente", text: "text-white bg-red-600" }
  };

  const priority = priorityStyles[task.prioridade as keyof typeof priorityStyles] || priorityStyles.media;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={() => onClick?.(task)}
      className={`bg-background/80 backdrop-blur-sm p-4 rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.04)] border border-border/50 group hover:border-primary/40 hover:shadow-md transition-all cursor-pointer select-none ${isDragging ? 'z-50 ring-2 ring-primary ring-offset-2 opacity-30 cursor-grabbing' : ''}`}
    >
      <div className="flex justify-between items-start mb-3">
        <Badge variant="outline" className={`text-[10px] px-2 py-0 border-none font-bold uppercase ${priority.text}`}>
          {priority.label}
        </Badge>
        <button className="text-muted-foreground hover:text-primary opacity-0 group-hover:opacity-100 transition-opacity">
          <MessageCircle className="w-3.5 h-3.5"/>
        </button>
      </div>

      <h3 className="font-bold text-[13.5px] leading-tight mb-2 group-hover:text-primary transition-colors">{task.titulo}</h3>
      {task.descricao && <p className="text-xs text-muted-foreground line-clamp-2 mb-3 leading-relaxed">{task.descricao}</p>}
      {(task.etiquetas && task.etiquetas.length > 0) && (
        <div className="flex flex-wrap gap-1 mb-4">
          {(task.etiquetas || []).map((tag, idx) => (
            <span key={idx} className="text-[9px] font-bold px-1.5 py-0.5 rounded-md bg-secondary text-secondary-foreground uppercase">
              {tag}
            </span>
          ))}
        </div>
      )}
      <div className="flex items-center justify-between pt-3 border-t border-border/30">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 text-muted-foreground/60">
             <Clock className="w-3 h-3"/>
             <span className="text-[10px] font-medium">Hoje</span>
          </div>
          {task.anexos && task.anexos > 0 && (
            <div className="flex items-center gap-1 text-muted-foreground/60">
               <Paperclip className="w-3 h-3"/>
               <span className="text-[10px]">{task.anexos}</span>
            </div>
          )}
        </div>
        <div className="h-6 w-6 rounded-full bg-gradient-to-tr from-primary/20 to-primary/5 flex items-center justify-center text-primary text-[10px] font-bold border border-primary/20 shadow-inner">
          {task.responsavel_nome ? task.responsavel_nome.substring(0, 1).toUpperCase() : "I"}
        </div>
      </div>
    </div>
  );
}
