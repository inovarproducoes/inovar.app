"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { TaskCard } from "./TaskCard";
import { Plus, MoreVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { 
  SortableContext, 
  verticalListSortingStrategy 
} from "@dnd-kit/sortable";

interface ColumnContainerProps {
  id: string;
  title: string;
  tasks: any[];
  boardId: string;
  onUpdate: () => void;
}

export function ColumnContainer({ id, title, tasks, boardId, onUpdate }: ColumnContainerProps) {
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
      className={`w-80 flex flex-col h-full bg-background/40 rounded-2xl border ${isDragging ? 'border-primary shadow-xl opacity-50' : 'border-border/30'} flex-shrink-0`}
    >
      <div 
        {...attributes} 
        {...listeners}
        className="p-4 flex justify-between items-center cursor-grab active:cursor-grabbing hover:bg-muted/30 rounded-t-2xl transition-colors"
      >
        <div className="flex items-center gap-2">
           <h4 className="font-bold text-sm tracking-tight">{title}</h4>
           <div className="h-5 w-5 rounded-full bg-muted flex items-center justify-center text-[10px] font-bold text-muted-foreground">{tasks.length}</div>
        </div>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={handleAddTask}>
            <Plus className="w-4 h-4"/>
          </Button>
          <Button variant="ghost" size="icon" className="h-7 w-7"><MoreVertical className="w-4 h-4"/></Button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-4 no-scrollbar">
        <SortableContext items={tasks.map(t => t.id)} strategy={verticalListSortingStrategy}>
          {tasks.map((task) => (
            <TaskCard key={task.id} id={task.id} task={task} />
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
