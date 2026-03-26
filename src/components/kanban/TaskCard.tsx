"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Badge } from "@/components/ui/badge";
import {
    Calendar,
    MessageSquare,
    Paperclip,
    MoreHorizontal,
    UserCircle2
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { ITask, PrioridadeTarefa } from "@/types/kanban";

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
  };

  const getPriorityColor = (p: PrioridadeTarefa) => {
    switch (p) {
      case "urgente": return { bg: "bg-red-500/15", text: "text-red-600", dot: "bg-red-500" };
      case "alta": return { bg: "bg-orange-500/15", text: "text-orange-600", dot: "bg-orange-500" };
      case "media": return { bg: "bg-blue-500/15", text: "text-blue-600", dot: "bg-blue-500" };
      case "baixa": return { bg: "bg-emerald-500/15", text: "text-emerald-600", dot: "bg-emerald-500" };
      default: return { bg: "bg-slate-500/15", text: "text-slate-600", dot: "bg-slate-500" };
    }
  };

  const priority = getPriorityColor(task.prioridade);

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
        <Badge variant="outline" className={`text-[10px] px-2 py-0 border-none font-bold uppercase ${priority.text} ${priority.bg}`}>
           <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${priority.dot}`} />
           {task.prioridade}
        </Badge>
        <button className="text-muted-foreground/30 hover:text-foreground transition-colors">
          <MoreHorizontal className="w-4 h-4"/>
        </button>
      </div>

      <h3 className="font-bold text-[14px] leading-tight mb-2 group-hover:text-primary transition-colors">{task.titulo}</h3>
      {task.descricao && <p className="text-xs text-muted-foreground line-clamp-2 mb-4 leading-relaxed">{task.descricao}</p>}

      {/* Tags */}
      {task.etiquetas && (
        <div className="flex flex-wrap gap-1.5 mb-5">
          {(task.etiquetas || []).map((tag: string, idx: number) => (
            <Badge 
                key={idx} 
                variant="secondary" 
                className="text-[9px] px-2 py-0 h-4 border-none bg-indigo-500/10 text-indigo-600 hover:bg-indigo-500/20 transition-colors font-bold uppercase tracking-tight"
            >
              {tag.trim()}
            </Badge>
          ))}
        </div>
      )}

      <div className="flex items-center justify-between pt-4 border-t border-border/30">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 text-muted-foreground/60 group/icon">
            <MessageSquare className="w-3.5 h-3.5 group-hover/icon:text-primary transition-colors" />
            <span className="text-[10px] font-medium">4</span>
          </div>
          <div className="flex items-center gap-1 text-muted-foreground/60 group/icon">
            <Paperclip className="w-3.5 h-3.5 group-hover/icon:text-primary transition-colors" />
            <span className="text-[10px] font-medium">{task.anexos || 0}</span>
          </div>
        </div>

        <div className="flex items-center -space-x-2">
            <Avatar className="w-6 h-6 border-2 border-background ring-2 ring-transparent group-hover:ring-primary/20 transition-all">
                <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${task.responsavel_nome || 'admin'}`} />
                <AvatarFallback className="text-[8px]">{task.responsavel_nome?.substring(0,2) || "AD"}</AvatarFallback>
            </Avatar>
        </div>
      </div>
    </div>
  );
}
