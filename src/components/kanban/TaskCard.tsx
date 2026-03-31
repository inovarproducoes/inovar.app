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
    FolderKanban
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
      case "urgente": return { bg: "rgba(172,49,73,0.15)", text: "text-[#f76a80]", dot: "bg-[#f76a80]", border: "rgba(172,49,73,0.25)" };
      case "alta":    return { bg: "rgba(247,158,0,0.12)", text: "text-[#f79e00]", dot: "bg-[#f79e00]", border: "rgba(247,158,0,0.25)" };
      case "media":   return { bg: "rgba(74,75,215,0.15)", text: "text-[#8083ff]", dot: "bg-[#8083ff]", border: "rgba(74,75,215,0.25)" };
      case "baixa":   return { bg: "rgba(0,180,160,0.15)", text: "text-[#00b4a0]", dot: "bg-[#00b4a0]", border: "rgba(0,180,160,0.25)" };
      default:        return { bg: "rgba(255,255,255,0.06)", text: "text-muted-foreground", dot: "bg-muted-foreground", border: "rgba(255,255,255,0.1)" };
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
        glass-card p-4 transition-all duration-300 cursor-pointer select-none group
        hover:border-primary/40 hover:shadow-[0_8px_32px_rgba(0,0,0,0.4),0_0_20px_rgba(74,75,215,0.15)]
        ${isDragging ? 'z-50 ring-2 ring-primary ring-offset-4 ring-offset-[#07080f] opacity-30 cursor-grabbing scale-[1.02]' : 'hover:-translate-y-1'}
      `}
      style={{
          ...style,
          background: "rgba(13,15,30,0.7)",
          border: isDragging ? '1px solid #4a4bd7' : '1px solid rgba(255,255,255,0.06)'
      }}
    >
      <div className="flex justify-between items-start mb-3">
        <div 
          className="flex items-center gap-1.5 px-2 py-0.5 rounded-full border text-[9px] font-bold uppercase tracking-wider font-mono shadow-sm"
          style={{ backgroundColor: pStyle.bg, color: pStyle.text, borderColor: pStyle.border }}
        >
           <span className={`w-1 h-1 rounded-full animate-pulse ${pStyle.dot}`} />
           {task.prioridade}
        </div>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="text-white/20 hover:text-white transition-colors p-1" onClick={e => e.stopPropagation()}>
              <MoreHorizontal size={14}/>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="bg-[#0d0f1e]/95 border-white/10 backdrop-blur-xl">
            <DropdownMenuItem onClick={handleArchive} className="text-[#f76a80] focus:text-[#f76a80] focus:bg-[#f76a80]/10 font-syne font-bold text-xs uppercase tracking-wider">
              <Archive className="w-3.5 h-3.5 mr-2"/> Arquivar OS
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <h3 className="font-syne font-bold text-[14px] leading-snug mb-2 group-hover:text-primary-foreground transition-colors group-hover:translate-x-0.5">{task.titulo}</h3>
      {task.descricao && <p className="text-[11px] text-muted-foreground/80 line-clamp-2 mb-4 leading-relaxed font-dm">{task.descricao}</p>}

      {/* Institution and Project Info (OS Only) */}
      {task.isOS && (
        <div className="flex flex-col gap-2 mb-4 p-2 rounded-lg bg-white/[0.02] border-l-2 border-primary/40">
          {task.instituicao && (
            <div className="flex items-center gap-2 text-[10px] text-muted-foreground font-medium font-dm">
              <Building2 className="w-3 h-3 text-primary/60"/>
              <span className="truncate">{task.instituicao}</span>
            </div>
          )}
          {task.projeto_nome && (
            <div className="flex items-center gap-2 text-[10px] text-muted-foreground font-medium font-dm">
              <FolderKanban className="w-3 h-3 text-primary/60"/>
              <span className="truncate">{task.projeto_nome}</span>
            </div>
          )}
        </div>
      )}

      {/* Tags */}
      {task.etiquetas && (
        <div className="flex flex-wrap gap-1.5 mb-5">
          {(task.etiquetas || []).map((tag: string, idx: number) => (
            <Badge 
                key={idx} 
                variant="outline" 
                className="text-[8px] px-1.5 py-0 h-4 border-white/10 bg-white/5 text-white/50 hover:bg-primary/20 hover:text-white transition-all font-bold uppercase tracking-widest font-mono"
            >
              {tag.trim()}
            </Badge>
          ))}
        </div>
      )}

      <div className="flex items-center justify-between pt-3.5 border-t border-white/5">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5 text-muted-foreground/50 group/icon cursor-default">
            <MessageSquare size={12} className="group-hover/icon:text-primary transition-colors" />
            <span className="text-[9px] font-bold font-mono">2</span>
          </div>
          <div className="flex items-center gap-1.5 text-muted-foreground/50 group/icon cursor-default">
            <Paperclip size={12} className="group-hover/icon:text-primary transition-colors" />
            <span className="text-[9px] font-bold font-mono">{task.anexos || 0}</span>
          </div>
        </div>

        <div className="flex items-center -space-x-2">
            <Avatar className="w-6 h-6 border uppercase font-syne border-white/10 bg-gradient-brand shadow-lg">
                <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${task.responsavel_nome || 'admin'}`} />
                <AvatarFallback className="text-[8px] font-black">{task.responsavel_nome?.substring(0,2) || "AD"}</AvatarFallback>
            </Avatar>
        </div>
      </div>
    </div>
  );
}
