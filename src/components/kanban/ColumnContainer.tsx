"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { TaskCard } from "./TaskCard";
import { Plus, MoreVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { 
  SortableContext, 
  verticalListSortingStrategy 
} from "@dnd-kit/sortable";
import type { ITask } from "@/types/kanban";

interface ColumnContainerProps {
  id: string;
  title: string;
  tasks: ITask[];
  boardId: string;
  onUpdate: () => void;
  onEditTask: (task: ITask) => void;
}

export function ColumnContainer({ id, title, tasks, boardId, onUpdate, onEditTask }: ColumnContainerProps) {
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
      type: "Column",
      column: { id, title }
    }
  });

  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
  };

  const handleAddTask = async () => {
    try {
      const resp = await fetch('/api/kanban/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          titulo: 'Nova Tarefa',
          coluna_id: id,
          quadro_id: boardId,
          prioridade: 'media'
        })
      });
      if (resp.ok) {
        toast.success("Tarefa criada");
        onUpdate();
      }
    } catch {
      toast.error("Erro ao criar tarefa");
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`w-[320px] md:w-[350px] flex flex-col h-full bg-slate-50/50 dark:bg-slate-900/20 backdrop-blur-sm rounded-2xl border ${isDragging ? 'border-primary shadow-2xl scale-[1.02] rotate-1 z-30' : 'border-border/40'} flex-shrink-0 transition-all duration-200`}
    >
      <div 
        {...attributes} 
        {...listeners}
        className="p-5 flex justify-between items-center cursor-grab active:cursor-grabbing hover:bg-black/5 dark:hover:bg-white/5 rounded-t-2xl transition-colors"
      >
        <div className="flex items-center gap-2.5">
           <h4 className="font-bold text-[14px] text-foreground/80 tracking-tight">{title}</h4>
           <Badge variant="secondary" className="h-5 px-1.5 min-w-[20px] justify-center text-[10px] font-bold bg-muted/50 border-none">
             {tasks.length}
           </Badge>
        </div>
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 md:opacity-100 transition-opacity">
          <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary hover:bg-primary/10" onClick={handleAddTask}>
            <Plus className="w-4 h-4"/>
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground"><MoreVertical className="w-4 h-4"/></Button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-4 no-scrollbar">
        <SortableContext items={tasks.map(t => t.id)} strategy={verticalListSortingStrategy}>
          {tasks.map((task) => (
            <TaskCard key={task.id} id={task.id} task={task} onClick={onEditTask} />
          ))}
        </SortableContext>
        
        {tasks.length === 0 && (
          <div className="py-20 text-center text-muted-foreground/30 flex flex-col items-center">
            <Plus className="w-8 h-8 opacity-20 mb-2"/>
            <p className="text-xs italic">Nenhuma tarefa</p>
          </div>
        )}
      </div>

      <div className="p-3">
         <Button 
           variant="ghost" 
           className="w-full justify-start text-muted-foreground hover:text-primary hover:bg-primary/5 h-9"
           onClick={handleAddTask}
         >
           <Plus className="w-4 h-4 mr-2"/> Nova Tarefa
         </Button>
      </div>
    </div>
  );
}
