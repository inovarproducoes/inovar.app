"use client";

import { useState } from "react";

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
import { Progress } from "@/components/ui/progress";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Copy, Trash2, Edit2, Check } from "lucide-react";
import type { ITask, IColumn } from "@/types/kanban";

interface ColumnContainerProps {
  id: string;
  title: string;
  tasks: ITask[];
  boardId: string;
  allColumns: IColumn[]; 
  onUpdate: () => void;
  onEditTask: (task: ITask) => void;
}

export function ColumnContainer({ id, title, tasks, boardId, allColumns, onUpdate, onEditTask }: ColumnContainerProps) {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [targetColumnId, setTargetColumnId] = useState<string>("");
  const [isRenaming, setIsRenaming] = useState(false);
  const [newTitle, setNewTitle] = useState(title);
  const [copied, setCopied] = useState(false);
  
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

  const handleCopyId = () => {
    navigator.clipboard.writeText(id);
    setCopied(true);
    toast.success("ID da coluna copiado!");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRename = async () => {
    try {
      const res = await fetch('/api/kanban/columns', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, nome: newTitle })
      });
      if (res.ok) {
        toast.success("Coluna renomeada");
        setIsRenaming(false);
        onUpdate();
      }
    } catch {
      toast.error("Erro ao renomear");
    }
  };

  const handleDelete = async () => {
    if (tasks.length > 0 && !targetColumnId) {
      toast.error("Selecione uma coluna destino para as tarefas");
      return;
    }

    try {
      const resp = await fetch(`/api/kanban/columns/${id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetColumnId })
      });
      if (resp.ok) {
        toast.success("Coluna deletada");
        setIsDeleteDialogOpen(false);
        onUpdate();
      }
    } catch {
      toast.error("Erro ao deletar coluna");
    }
  };

  const handleAddTask = async () => {
    // ... mantendo o original
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
      {/* Column Header */}
      <div
        {...attributes}
        {...listeners}
        className="p-4 flex flex-col gap-3 group/header cursor-grab active:cursor-grabbing"
      >
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2 flex-1">
            {isRenaming ? (
              <div className="flex items-center gap-1 w-full">
                <input 
                  autoFocus
                  className="bg-background border rounded px-2 py-0.5 text-xs w-full focus:outline-primary"
                  value={newTitle}
                  onChange={e => setNewTitle(e.target.value)}
                  onBlur={handleRename}
                  onKeyDown={e => e.key === 'Enter' && handleRename()}
                />
              </div>
            ) : (
              <>
                <h3 className="font-bold text-sm tracking-tight text-foreground/90 uppercase truncate">{title}</h3>
                <Badge variant="secondary" className="bg-primary/10 text-primary border-none text-[10px] py-0 h-4 min-w-[18px] flex items-center justify-center font-bold">
                  {tasks.length}
                </Badge>
              </>
            )}
          </div>
          <div className="flex items-center gap-1 opacity-0 group-hover/header:opacity-100 transition-opacity">
            <button 
              className="p-1 hover:bg-muted rounded-md transition-colors text-muted-foreground hover:text-primary" 
              onClick={(e) => { e.stopPropagation(); handleCopyId(); }}
              title="Copiar ID para n8n"
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5"/>}
            </button>
            <button className="p-1 hover:bg-muted rounded-md transition-colors" onClick={(e) => { e.stopPropagation(); handleAddTask(); }}><Plus className="w-3.5 h-3.5"/></button>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="p-1 hover:bg-muted rounded-md transition-colors" onClick={e => e.stopPropagation()}>
                  <MoreVertical className="w-3.5 h-3.5"/>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setIsRenaming(true)}>
                  <Edit2 className="w-4 h-4 mr-2" /> Renomear
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  className="text-destructive focus:text-destructive" 
                  onClick={() => setIsDeleteDialogOpen(true)}
                >
                  <Trash2 className="w-4 h-4 mr-2" /> Deletar Coluna
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Column Stats & Progress */}
        <div className="space-y-1.5">
          <div className="flex justify-between items-center text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
            <span>Progresso</span>
            <span>{tasks.length > 0 ? (title === "Concluído" ? "100%" : "30%") : "0%"}</span>
          </div>
          <Progress value={tasks.length > 0 ? (title === "Concluído" ? 100 : 30) : 0} className="h-1 bg-muted/40" />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-4 no-scrollbar">
        <SortableContext items={tasks.map(t => t.id)} strategy={verticalListSortingStrategy}>
          {tasks.map((task) => (
            <TaskCard key={task.id} id={task.id} task={task} onClick={onEditTask} onUpdate={onUpdate} />
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

      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Deletar Coluna: {title}</DialogTitle>
            <DialogDescription>
              Esta coluna possui {tasks.length} tarefas/OS. Para onde deseja movê-las?
            </DialogDescription>
          </DialogHeader>

          {tasks.length > 0 && (
            <div className="py-4">
              <label className="text-sm font-medium mb-2 block">Coluna Destino</label>
              <Select value={targetColumnId} onValueChange={setTargetColumnId}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione uma coluna..." />
                </SelectTrigger>
                <SelectContent>
                  {allColumns
                    .filter(c => c.id !== id)
                    .map(c => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.nome}
                      </SelectItem>
                    ))
                  }
                </SelectContent>
              </Select>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>Cancelar</Button>
            <Button variant="destructive" onClick={handleDelete} disabled={tasks.length > 0 && !targetColumnId}>
              Confirmar Exclusão
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
