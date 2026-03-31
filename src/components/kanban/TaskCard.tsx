"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Badge } from "@/components/ui/badge";
import { 
    MessageSquare, 
    Paperclip, 
    MoreHorizontal,
    Archive,
    Building2,
    Calendar,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
    DropdownMenu, 
    DropdownMenuContent, 
    DropdownMenuItem, 
    DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import type { ITask, PrioridadeTarefa } from "@/types/kanban";

interface TaskCardProps {
  id: string;
  task: ITask;
  onClick?: (task: ITask) => void;
  onUpdate?: () => void;
}

export function TaskCard({ id, task, onClick, onUpdate }: TaskCardProps) {
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

  const handleArchive = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm("Tem certeza que deseja arquivar esta OS?")) return;

    try {
      const res = await fetch(`/api/kanban/tasks/${task.id}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        toast.success("OS arquivada com sucesso");
        onUpdate?.();
      } else {
        toast.error("Erro ao arquivar OS");
      }
    } catch (error) {
      console.error(error);
      toast.error("Erro ao arquivar OS");
    }
  };

  const getPriorityStyle = (p: PrioridadeTarefa) => {
    switch (p) {
      case "urgente": return { bg: "bg-red-500/10", text: "text-red-500", dot: "bg-red-500" };
      case "alta":    return { bg: "bg-orange-500/10", text: "text-orange-500", dot: "bg-orange-500" };
      case "media":   return { bg: "bg-primary/10", text: "text-primary", dot: "bg-primary" };
      case "baixa":   return { bg: "bg-emerald-500/10", text: "text-emerald-500", dot: "bg-emerald-500" };
      default:        return { bg: "bg-muted", text: "text-muted-foreground", dot: "bg-muted-foreground" };
    }
  };

  const pStyle = getPriorityStyle(task.prioridade);

  return (
    <div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      onClick={() => onClick?.(task)}
      className={`
        bg-card p-5 rounded-2xl border border-white/10 dark:border-white/15 transition-all duration-300 cursor-pointer select-none group
        hover:border-primary/60 hover:shadow-xl hover:shadow-primary/5
        ${isDragging ? 'z-50 ring-2 ring-primary ring-offset-4 ring-offset-background opacity-30 cursor-grabbing scale-[1.02]' : 'hover:-translate-y-1'}
      `}
      style={{
          ...style,
          background: "var(--card)"
      }}
    >
      <div className="flex justify-between items-start mb-4">
        <div 
          className={`flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${pStyle.bg} ${pStyle.text}`}
        >
           <span className={`w-1 h-1 rounded-full ${pStyle.dot}`} />
           {task.prioridade}
        </div>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="text-muted-foreground/30 hover:text-foreground transition-colors p-1" onClick={e => e.stopPropagation()}>
              <MoreHorizontal size={14}/>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={handleArchive} className="text-red-500 focus:text-red-500 font-dm font-bold text-xs uppercase tracking-wider">
              <Archive className="w-3.5 h-3.5 mr-2"/> Arquivar OS
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <h3 className="font-dm font-bold text-[15px] leading-tight mb-2 group-hover:text-primary transition-colors">{task.titulo}</h3>
      {task.descricao && <p className="text-[11.5px] text-muted-foreground/80 line-clamp-2 mb-5 font-dm leading-relaxed">{task.descricao}</p>}

      {/* Institution Info */}
      {task.isOS && (
        <div className="flex flex-col gap-2.5 mb-5 p-3 rounded-xl bg-muted/30 border border-border/20">
          {task.instituicao && (
            <div className="flex items-center gap-2 text-[11px] text-muted-foreground font-medium font-dm">
              <Building2 className="w-3.5 h-3.5 text-primary/60"/>
              <span className="truncate">{task.instituicao}</span>
            </div>
          )}
          {task.created_at && (
            <div className="flex items-center gap-2 text-[11px] text-muted-foreground font-medium font-dm">
              <Calendar className="w-3.5 h-3.5 text-primary/60"/>
              <span className="truncate">Criado em {new Date(task.created_at).toLocaleDateString()}</span>
            </div>
          )}
        </div>
      )}

      {/* Tags */}
      {task.etiquetas && task.etiquetas.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-6">
          {(task.etiquetas || []).map((tag: string, idx: number) => (
            <Badge 
                key={idx} 
                variant="outline" 
                className="text-[9px] px-2 py-0 h-4.5 border-border bg-transparent text-muted-foreground font-bold uppercase tracking-widest font-dm"
            >
              {tag.trim()}
            </Badge>
          ))}
        </div>
      )}

      <div className="flex items-center justify-between pt-4 border-t border-border/40">
        <div className="flex items-center gap-4 text-muted-foreground/60">
          <div className="flex items-center gap-1.5 hover:text-primary transition-colors cursor-default">
            <MessageSquare size={13} />
            <span className="text-[10px] font-bold font-dm">0</span>
          </div>
          <div className="flex items-center gap-1.5 hover:text-primary transition-colors cursor-default">
            <Paperclip size={13} />
            <span className="text-[10px] font-bold font-dm">{task.anexos || 0}</span>
          </div>
        </div>

        <div className="flex items-center -space-x-2">
            <Avatar className="w-7 h-7 border-2 border-background shadow-md">
                <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${task.responsavel_nome || 'admin'}`} />
                <AvatarFallback className="text-[9px] font-bold bg-primary/20 text-primary">{task.responsavel_nome?.substring(0,2) || "AD"}</AvatarFallback>
            </Avatar>
        </div>
      </div>
    </div>
  );
}
