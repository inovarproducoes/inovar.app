"use client";

import { useState } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { TaskCard } from "./TaskCard";
import { Plus, MoreVertical, Copy, Trash2, Edit2, Check, Layout } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  SortableContext,
  verticalListSortingStrategy
} from "@dnd-kit/sortable";
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

  /* Progress based on column title */
  const getProgress = () => {
    const t = title.toLowerCase();
    if (t.includes('concluido') || t.includes('finalizado') || t.includes('pronto')) return 100;
    if (t.includes('andamento') || t.includes('execução') || t.includes('fazendo')) return 50;
    if (t.includes('pausado') || t.includes('revisão')) return 80;
    return 10;
  };

  const progress = getProgress();

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`
        w-[320px] md:w-[360px] flex flex-col h-full 
        glass-card border-white/5 
        ${isDragging ? 'shadow-2xl scale-[1.02] rotate-1 z-30 ring-2 ring-primary bg-white/[0.08]' : 'bg-white/[0.03]'} 
        flex-shrink-0 transition-all duration-300
      `}
    >
      {/* Column Header */}
      <div
        className="p-5 flex flex-col gap-4 group/header"
        style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}
      >
        <div className="flex justify-between items-center">
          <div 
             {...attributes}
             {...listeners}
             className="flex items-center gap-3 flex-1 cursor-grab active:cursor-grabbing hover:translate-x-1 transition-transform"
          >
            {isRenaming ? (
              <input 
                autoFocus
                className="bg-white/5 border border-white/10 rounded-lg px-3 py-1 text-sm w-full focus:outline-primary font-syne font-bold text-white shadow-inner"
                value={newTitle}
                onChange={e => setNewTitle(e.target.value)}
                onBlur={handleRename}
                onKeyDown={e => e.key === 'Enter' && handleRename()}
              />
            ) : (
              <div className="flex items-center gap-2.5 min-w-0">
                <h3 className="font-syne font-extrabold text-[13px] tracking-[0.1em] text-white uppercase truncate">{title}</h3>
                <span className="bg-primary/20 text-primary px-2 py-0.5 rounded-full text-[10px] font-black font-mono border border-primary/20">
                  {tasks.length}
                </span>
              </div>
            )}
          </div>
          <div className="flex items-center gap-1 opacity-0 group-hover/header:opacity-100 transition-all duration-200">
            <button 
              className="w-8 h-8 flex items-center justify-center hover:bg-white/10 rounded-lg transition-colors text-white/40 hover:text-primary" 
              onClick={(e) => { e.stopPropagation(); handleCopyId(); }}
              title="Copiar ID da Coluna"
            >
              {copied ? <Check size={14} /> : <Copy size={14}/>}
            </button>
            <button 
                className="w-8 h-8 flex items-center justify-center hover:bg-white/10 rounded-lg transition-colors text-white/40 hover:text-white" 
                onClick={(e) => { e.stopPropagation(); handleAddTask(); }}
                title="Nova Tarefa"
            >
                <Plus size={16}/>
            </button>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="w-8 h-8 flex items-center justify-center hover:bg-white/10 rounded-lg transition-colors text-white/40 hover:text-white" onClick={e => e.stopPropagation()}>
                  <MoreVertical size={14}/>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-[#0d0f1e]/95 border-white/10 backdrop-blur-xl">
                <DropdownMenuItem onClick={() => setIsRenaming(true)} className="font-syne font-bold text-xs uppercase tracking-wider text-white/70">
                  <Edit2 className="w-3.5 h-3.5 mr-2" /> Renomear
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-white/5" />
                <DropdownMenuItem 
                  className="text-[#f76a80] focus:text-[#f76a80] focus:bg-[#f76a80]/10 font-syne font-bold text-xs uppercase tracking-wider" 
                  onClick={() => setIsDeleteDialogOpen(true)}
                >
                  <Trash2 className="w-3.5 h-3.5 mr-2" /> Deletar Coluna
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Custom Progress Bar Style */}
        <div className="space-y-2">
            <div className="flex justify-between items-center">
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/20 font-mono">Workflow Status</span>
                <span className="text-[10px] font-black text-primary font-mono">{progress}%</span>
            </div>
            <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                <div 
                    className="h-full bg-gradient-brand transition-all duration-1000 ease-out shadow-[0_0_8px_rgba(74,75,215,0.6)]" 
                    style={{ width: `${progress}%` }} 
                />
            </div>
        </div>
      </div>

      {/* Tasks Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar custom-scrollbar">
        <SortableContext items={tasks.map(t => t.id)} strategy={verticalListSortingStrategy}>
          {tasks.map((task) => (
            <TaskCard key={task.id} id={task.id} task={task} onClick={onEditTask} onUpdate={onUpdate} />
          ))}
        </SortableContext>
        
        {tasks.length === 0 && (
          <div className="py-24 text-center flex flex-col items-center justify-center">
            <div className="w-16 h-16 rounded-full bg-white/[0.02] flex items-center justify-center mb-4 border border-white/5 group-hover:border-primary/20 transition-all">
                <Layout className="w-6 h-6 text-white/10" />
            </div>
            <p className="text-[11px] font-bold uppercase tracking-[0.15em] text-white/20 font-mono italic">Esperando tarefas</p>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-4" style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}>
         <Button 
           variant="ghost" 
           className="w-full justify-center text-white/40 hover:text-white hover:bg-white/5 h-11 font-syne font-bold text-xs uppercase tracking-widest rounded-xl transition-all hover:scale-[0.98] active:scale-95"
           onClick={handleAddTask}
         >
           <Plus size={16} className="mr-2 text-primary"/> Nova Tarefa
         </Button>
      </div>

      {/* Dialogs kept standard but stylable via classNames if needed */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="bg-[#0d0f1e]/95 border-white/10 backdrop-blur-xl text-white">
          <DialogHeader>
            <DialogTitle className="font-syne font-extrabold text-xl">Deletar Coluna: {title}</DialogTitle>
            <DialogDescription className="text-white/50 font-dm">
              Esta coluna possui {tasks.length} tarefas. Para onde deseja movê-las?
            </DialogDescription>
          </DialogHeader>

          {tasks.length > 0 && (
            <div className="py-6">
              <label className="text-[11px] font-black uppercase tracking-wider text-muted-foreground font-mono mb-2 block">Coluna Destino</label>
              <Select value={targetColumnId} onValueChange={setTargetColumnId}>
                <SelectTrigger className="bg-white/5 border-white/10 text-white rounded-xl h-12">
                  <SelectValue placeholder="Selecione o destino..." />
                </SelectTrigger>
                <SelectContent className="bg-[#0d0f1e] border-white/10 text-white">
                  {allColumns
                    .filter(c => c.id !== id)
                    .map(c => (
                      <SelectItem key={c.id} value={c.id} className="font-dm">
                        {c.nome}
                      </SelectItem>
                    ))
                  }
                </SelectContent>
              </Select>
            </div>
          )}

          <DialogFooter className="gap-2">
            <Button variant="ghost" onClick={() => setIsDeleteDialogOpen(false)} className="rounded-xl font-syne font-bold uppercase tracking-wider text-xs">Cancelar</Button>
            <Button variant="destructive" onClick={handleDelete} disabled={tasks.length > 0 && !targetColumnId} className="bg-[#f76a80] hover:bg-[#ac3149] rounded-xl font-syne font-bold uppercase tracking-wider text-xs">
              Confirmar Exclusão
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
