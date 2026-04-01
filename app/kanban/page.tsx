"use client";

import { MainLayout } from "@/components/layout/MainLayout";
import { useState, useEffect } from "react";
import { 
  DndContext, 
  closestCenter, 
  PointerSensor, 
  useSensor, 
  useSensors,
  DragEndEvent,
  DragOverEvent,
  DragOverlay,
  DragStartEvent,
} from "@dnd-kit/core";
import { 
  SortableContext, 
  horizontalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Layout, Search, ChevronDown, Check, Star, Archive } from "lucide-react";
import { ColumnContainer } from "@/components/kanban/ColumnContainer";
import { TaskCard } from "@/components/kanban/TaskCard";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import { TaskEditSheet } from "@/components/kanban/TaskEditSheet";
import type { IBoard, IColumn, ITask } from "@/types/kanban";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { cn } from "@/lib/utils";

export default function KanbanPage() {
  const [loading, setLoading] = useState(true);
  const [boards, setBoards] = useState<IBoard[]>([]);
  const [activeBoard, setActiveBoard] = useState<IBoard | null>(null);
  const [busca, setBusca] = useState("");
  const [selectedTask, setSelectedTask] = useState<ITask | null>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [activeTask, setActiveTask] = useState<ITask | null>(null);
  const [activeColumn, setActiveColumn] = useState<IColumn | null>(null);
  const [mounted, setMounted] = useState(false);
  const [isBoardSelectorOpen, setIsBoardSelectorOpen] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  useEffect(() => {
    setMounted(true);
    fetchBoards();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchBoards = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/kanban/boards');
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          const sanitizedBoards = data.map((b: IBoard) => ({
            ...b,
            colunas: b.colunas.map((col: IColumn) => ({
              ...col,
              tarefas: col.tarefas.map((t: ITask) => ({
                ...t,
                etiquetas: Array.isArray(t.etiquetas) ? t.etiquetas : []
              }))
            }))
          }));
          setBoards(sanitizedBoards);
          
          // Prioridade: 1. Board já selecionado em estado | 2. Board marcado como 'ativo' no banco | 3. Primeiro da lista
          if (activeBoard) {
            const found = sanitizedBoards.find((b: IBoard) => b.id === activeBoard.id);
            if (found) {
              setActiveBoard(found);
              return;
            }
          }

          const dbActive = sanitizedBoards.find((b: IBoard) => b.ativo);
          if (dbActive) {
            setActiveBoard(dbActive);
          } else {
            setActiveBoard(sanitizedBoards[0]);
          }
        }
      }
    } catch {
      toast.error("Erro ao carregar quadros");
    } finally {
      setLoading(false);
    }
  };

  const handleSetActive = async (id: string) => {
    try {
      const res = await fetch('/api/kanban/boards', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, ativo: true })
      });
      if (res.ok) {
        toast.success("Definido como padrão!");
        fetchBoards();
      }
    } catch {
      toast.error("Erro ao definir padrão");
    }
  };

  const handleArchiveBoard = async (id: string) => {
    if (!confirm("Arquivar este pipeline irá arquivar todas as tarefas dentro dele. Continuar?")) return;
    try {
      const res = await fetch('/api/kanban/boards', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, arquivado: true })
      });
      if (res.ok) {
        toast.success("Pipeline arquivado!");
        setActiveBoard(null);
        fetchBoards();
      }
    } catch {
      toast.error("Erro ao arquivar pipeline");
    }
  };

  const handleCreateBoard = async (isOS = false) => {
    try {
      const nome = isOS ? "Fluxo Operacional OS" : "Novo Quadro";
      const res = await fetch('/api/kanban/boards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nome,
          descricao: isOS ? "Gestão inteligente de Ordens de Serviço" : "Quadro de acompanhamento",
          isServiceOrderPipeline: isOS
        })
      });
      if (res.ok) {
        toast.success("Pipeline criado!");
        fetchBoards();
      }
    } catch {
      toast.error("Erro ao criar quadro");
    }
  };

  const handleAddColumn = async () => {
    if (!activeBoard) return;
    try {
       const res = await fetch('/api/kanban/columns', {
         method: 'POST',
         headers: { 'Content-Type': 'application/json' },
         body: JSON.stringify({
           nome: "Nova Etapa",
           quadro_id: activeBoard.id
         })
       });
       if (res.ok) {
         toast.success("Etapa adicionada");
         fetchBoards();
       }
    } catch {
      toast.error("Erro ao adicionar coluna");
    }
  };

  const handleEditTask = (task: ITask) => {
    setSelectedTask(task);
    setIsEditOpen(true);
  };

  const onDragStart = (event: DragStartEvent) => {
     if (event.active.data.current?.type === "Column") {
       setActiveColumn(event.active.data.current.column);
       return;
     }
     if (event.active.data.current?.type === "Task") {
       setActiveTask(event.active.data.current.task);
       return;
     }
  };

  const onDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over || !activeBoard) return;
    const activeId = active.id;
    const overId = over.id;
    if (activeId === overId) return;

    const isActiveATask = active.data.current?.type === "Task";
    const isOverATask = over.data.current?.type === "Task";

    if (isActiveATask && isOverATask) {
      setActiveBoard((board: IBoard | null) => {
        if (!board) return board;
        
        const activeCol = board.colunas.find((c: IColumn) => c.tarefas.some(t => t.id === activeId));
        const overCol = board.colunas.find((c: IColumn) => c.tarefas.some(t => t.id === overId));
        
        if (!activeCol || !overCol) return board;

        if (activeCol.id !== overCol.id) {
          const activeIndex = activeCol.tarefas.findIndex(t => t.id === activeId);
          const overIndex = overCol.tarefas.findIndex(t => t.id === overId);
          
          const taskToMove = { ...activeCol.tarefas[activeIndex], coluna_id: overCol.id };
          
          const newActiveTasks = activeCol.tarefas.filter(t => t.id !== activeId);
          const newOverTasks = [...overCol.tarefas];
          newOverTasks.splice(overIndex, 0, taskToMove);
          
          return {
            ...board,
            colunas: board.colunas.map(c => {
                   if (c.id === activeCol.id) return { ...c, tarefas: newActiveTasks };
                   if (c.id === overCol.id) return { ...c, tarefas: newOverTasks };
                   return c;
            })
          };
        } else {
          // Mesmo coluna - Reordenar verticalmente
          const activeIndex = activeCol.tarefas.findIndex(t => t.id === activeId);
          const overIndex = activeCol.tarefas.findIndex(t => t.id === overId);
          
          if (activeIndex === overIndex) return board;
          
          const newTasks = arrayMove(activeCol.tarefas, activeIndex, overIndex);
          
          return {
            ...board,
            colunas: board.colunas.map(c => {
               if (c.id === activeCol.id) return { ...c, tarefas: newTasks };
               return c;
            })
          };
        }
      });
    }

    const isOverAColumn = over.data.current?.type === "Column";
    if (isActiveATask && isOverAColumn) {
      setActiveBoard((board: IBoard | null) => {
        if (!board) return board;
        const activeCol = board.colunas.find(c => c.tarefas.some(t => t.id === activeId));
        const overCol = board.colunas.find(c => c.id === overId);
        
        if (!activeCol || !overCol || activeCol.id === overCol.id) return board;
        
        const activeIndex = activeCol.tarefas.findIndex(t => t.id === activeId);
        const taskToMove = { ...activeCol.tarefas[activeIndex], coluna_id: overCol.id };
        
        const newActiveTasks = activeCol.tarefas.filter(t => t.id !== activeId);
        const newOverTasks = [...overCol.tarefas, taskToMove];
        
        return {
           ...board,
           colunas: board.colunas.map(c => {
             if (c.id === activeCol.id) return { ...c, tarefas: newActiveTasks };
             if (c.id === overCol.id) return { ...c, tarefas: newOverTasks };
             return c;
           })
        };
      });
    }
  };

  const onDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) return;
    if (active.id === over.id) return;

    // Acessar o estado mais recente através do setActiveBoard callback
    // Isso previne o bug de stale closure onde o Kanban enviava a coluna_id antiga para a API
    setActiveBoard((currentBoard) => {
      if (!currentBoard) return currentBoard;

      const currentTasks = currentBoard.colunas.flatMap(c => c.tarefas);
      const task = currentTasks.find(t => t.id === active.id);
      
      if (task) {
         const column = currentBoard.colunas.find(c => c.id === task.coluna_id);
         const newOrder = column?.tarefas.findIndex(t => t.id === task.id) || 0;

         fetch(`/api/kanban/tasks`, {
           method: 'PUT',
           headers: { 'Content-Type': 'application/json' },
           body: JSON.stringify({ 
             id: task.id,
             coluna_id: task.coluna_id, 
             ordem: newOrder 
           })
         })
         .then(async (res) => {
           if (res.ok) {
              toast.success("Sincronizado com sucesso!");
              fetchBoards();
           } else {
              toast.error("Erro ao persistir posição.");
              fetchBoards(); // Rollback
           }
         })
         .catch((err) => { 
           console.error(err);
           toast.error("Erro de conexão");
           fetchBoards(); 
         });
      }
      return currentBoard; // Não mutamos o estado aqui, apenas lemos
    });

    setActiveTask(null);
    setActiveColumn(null);
  };

  if (!mounted || loading) return (
    <MainLayout title="Carregando Kanban..." subtitle="Sincronizando fluxo operacional">
      <div className="p-8 space-y-6">
        <Skeleton className="h-14 w-full rounded-2xl opacity-10"/>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 h-[600px]">
          <Skeleton className="h-full rounded-2xl opacity-5"/><Skeleton className="h-full rounded-2xl opacity-5"/><Skeleton className="h-full rounded-2xl opacity-5"/><Skeleton className="h-full rounded-2xl opacity-5"/>
        </div>
      </div>
    </MainLayout>
  );

  return (
    <MainLayout title="Gestão de Fluxo" subtitle="Acompanhamento em tempo real das Ordens de Serviço">
      <div className="flex flex-col h-[calc(100vh-170px)] -mx-6 -my-6">
        <div className="bg-background/80 backdrop-blur-xl border-b px-6 py-4 flex flex-col md:flex-row justify-between items-start md:items-center sticky top-0 z-30 gap-4">
          <div className="flex items-center gap-3 w-full md:w-auto">
             <Popover open={isBoardSelectorOpen} onOpenChange={setIsBoardSelectorOpen}>
                <PopoverTrigger asChild>
                   <Button variant="ghost" className="h-10 hover:bg-muted/50 gap-2 px-3 border border-border/40 rounded-xl max-w-full overflow-hidden text-foreground">
                      <Layout className="w-4 h-4 text-primary shrink-0"/>
                      <span className="font-dm font-bold text-base truncate">{activeBoard?.nome || "Selecione um Quadro"}</span>
                      <ChevronDown className="w-4 h-4 opacity-50 shrink-0" />
                   </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[280px] p-0 rounded-2xl shadow-2xl border-primary/10 overflow-hidden text-foreground" align="start">
                   <Command>
                      <CommandInput placeholder="Pesquisar quadros..." className="font-dm" />
                      <CommandList className="max-h-[300px]">
                          <CommandEmpty>Nenhum quadro encontrado.</CommandEmpty>
                          <CommandGroup heading="Ações de Quadros">
                             {boards.map((b) => (
                                <CommandItem 
                                  key={b.id} 
                                  onSelect={() => { setActiveBoard(b); setIsBoardSelectorOpen(false); }}
                                  className="flex items-center justify-between p-3 cursor-pointer group"
                                >
                                   <div className="flex items-center gap-3">
                                       <div className={cn("w-2 h-2 rounded-full", activeBoard?.id === b.id ? "bg-primary" : "bg-muted")} />
                                       <span className="font-dm text-sm font-medium">{b.nome}</span>
                                       {b.ativo && <Star className="w-3 h-3 text-primary fill-primary" />}
                                   </div>
                                   <div className="flex items-center gap-1">
                                      {!b.ativo && (
                                        <Button 
                                          variant="ghost" 
                                          size="icon" 
                                          className="h-7 w-7 opacity-0 group-hover:opacity-100 hover:text-primary" 
                                          onClick={(e) => { e.stopPropagation(); handleSetActive(b.id); }}
                                          title="Definir como padrão"
                                        >
                                          <Star className="w-3.5 h-3.5" />
                                        </Button>
                                      )}
                                      <Button 
                                        variant="ghost" 
                                        size="icon" 
                                        className="h-7 w-7 opacity-0 group-hover:opacity-100 hover:text-destructive" 
                                        onClick={(e) => { e.stopPropagation(); handleArchiveBoard(b.id); }}
                                        title="Arquivar pipeline"
                                      >
                                        <Archive className="w-3.5 h-3.5" />
                                      </Button>
                                      {activeBoard?.id === b.id && <Check className="w-4 h-4 text-primary ml-2" />}
                                   </div>
                                </CommandItem>
                             ))}
                          </CommandGroup>
                       </CommandList>
                   </Command>
                </PopoverContent>
             </Popover>
          </div>
          
          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="relative flex-1 md:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/50"/>
              <Input placeholder="Filtrar OS..." className="pl-9 h-10 w-full bg-muted/40 border-none rounded-xl text-xs font-dm text-foreground" value={busca} onChange={e => setBusca(e.target.value)}/>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-x-auto overflow-y-hidden p-6 custom-scrollbar text-foreground">
          <DndContext 
            sensors={sensors} 
            collisionDetection={closestCenter} 
            onDragStart={onDragStart}
            onDragOver={onDragOver}
            onDragEnd={onDragEnd}
          >
            <div className="flex gap-4 md:gap-6 h-full min-h-[500px] w-max pb-4">
              <SortableContext items={activeBoard?.colunas?.map(c => c.id) || []} strategy={horizontalListSortingStrategy}>
                {activeBoard?.colunas?.map((col) => (
                  <ColumnContainer 
                    key={col.id} 
                    id={col.id}
                    title={col.nome} 
                    tasks={col.tarefas.filter(t => t.titulo.toLowerCase().includes(busca.toLowerCase()))}
                    boardId={activeBoard?.id || ""}
                    allColumns={activeBoard.colunas}
                    onUpdate={fetchBoards}
                    onEditTask={handleEditTask}
                    isOSBoard={activeBoard?.nome?.toLowerCase().includes("os") || false}
                  />
                ))}
              </SortableContext>
              
              <button 
                className="w-[280px] md:w-[350px] h-[120px] shrink-0 border-2 border-dashed border-primary/20 rounded-2xl flex flex-col items-center justify-center text-primary/60 hover:text-primary hover:bg-primary/5 hover:border-primary/40 transition-all group"
                onClick={handleAddColumn}
              >
                <div className="p-3 bg-primary/5 rounded-full mb-2 group-hover:scale-110 transition-transform">
                  <Plus className="w-5 h-5"/>
                </div>
                <span className="text-xs font-bold uppercase tracking-widest text-foreground">Adicionar Etapa</span>
              </button>
            </div>

            <DragOverlay>
                {activeColumn && (
                  <div className="opacity-80 scale-95 origin-top-left">
                      <ColumnContainer 
                         id={activeColumn.id}
                         title={activeColumn.nome}
                         tasks={activeBoard?.colunas.find(c => c.id === activeColumn.id)?.tarefas || []}
                         boardId={activeBoard?.id || ""}
                         allColumns={activeBoard?.colunas || []}
                         onUpdate={() => {}}
                         onEditTask={() => {}}
                         isOSBoard={activeBoard?.nome?.toLowerCase().includes("os") || false}
                      />
                  </div>
                )}
               {activeTask && (
                 <div className="opacity-90 rotate-2">
                    <TaskCard task={activeTask} />
                 </div>
               )}
            </DragOverlay>
          </DndContext>
        </div>

        <TaskEditSheet 
          task={selectedTask}
          isOpen={isEditOpen}
          onClose={() => setIsEditOpen(false)}
          onUpdate={fetchBoards}
        />
      </div>
    </MainLayout>
  );
}
