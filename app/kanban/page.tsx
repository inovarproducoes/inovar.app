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
  arrayMove, 
  SortableContext, 
  horizontalListSortingStrategy,
} from "@dnd-kit/sortable";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Plus, Layout, Settings, Search, Filter, ChevronDown, Check } from "lucide-react";
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
          const sanitizedBoards = data.map((b: any) => ({
            ...b,
            colunas: b.colunas.map((col: IColumn) => ({
              ...col,
              tarefas: col.tarefas.map((t: any) => ({
                ...t,
                etiquetas: Array.isArray(t.etiquetas) ? t.etiquetas : []
              }))
            }))
          }));
          setBoards(sanitizedBoards);
          // Manter o board atual se ele ainda existir, senão pegar o primeiro
          if (!activeBoard || !sanitizedBoards.find((b: IBoard) => b.id === activeBoard.id)) {
            setActiveBoard(sanitizedBoards[0]);
          } else {
            setActiveBoard(sanitizedBoards.find((b: IBoard) => b.id === activeBoard.id));
          }
        }
      }
    } catch {
      toast.error("Erro ao carregar quadros");
    } finally {
      setLoading(false);
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
          const newActiveTasks = [...activeCol.tarefas];
          newActiveTasks.splice(activeIndex, 1);
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
        }
        return board;
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
        const newActiveTasks = [...activeCol.tarefas];
        newActiveTasks.splice(activeIndex, 1);
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
    if (!over || !activeBoard) return;
    if (active.id === over.id) return;

    // Persistência simples da posição
    const task = activeBoard.colunas.flatMap(c => c.tarefas).find(t => t.id === active.id);
    if (task) {
       try {
         await fetch(`/api/kanban/tasks/${task.id}`, {
           method: 'PATCH',
           headers: { 'Content-Type': 'application/json' },
           body: JSON.stringify({ coluna_id: task.coluna_id, ordem: 0 })
         });
       } catch (err) { console.error(err); }
    }
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
        
        {/* Header Responsivo */}
        <div className="bg-background/80 backdrop-blur-xl border-b px-6 py-4 flex flex-col md:flex-row justify-between items-start md:items-center sticky top-0 z-30 gap-4">
          <div className="flex items-center gap-3 w-full md:w-auto">
             <Popover open={isBoardSelectorOpen} onOpenChange={setIsBoardSelectorOpen}>
                <PopoverTrigger asChild>
                   <Button variant="ghost" className="h-10 hover:bg-muted/50 gap-2 px-3 border border-border/40 rounded-xl max-w-full overflow-hidden">
                      <Layout className="w-4 h-4 text-primary shrink-0"/>
                      <span className="font-dm font-bold text-base truncate">{activeBoard?.nome || "Selecione um Quadro"}</span>
                      <ChevronDown className="w-4 h-4 opacity-50 shrink-0" />
                   </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[280px] p-0 rounded-2xl shadow-2xl border-primary/10 overflow-hidden" align="start">
                   <Command>
                      <CommandInput placeholder="Pesquisar quadros..." className="font-dm" />
                      <CommandList className="max-h-[300px]">
                         <CommandEmpty>Nenhum quadro encontrado.</CommandEmpty>
                         <CommandGroup heading="Quadros Ativos">
                            {boards.map((b) => (
                               <CommandItem 
                                 key={b.id} 
                                 onSelect={() => { setActiveBoard(b); setIsBoardSelectorOpen(false); }}
                                 className="flex items-center justify-between p-3 cursor-pointer"
                               >
                                  <div className="flex items-center gap-3">
                                      <div className={cn("w-2 h-2 rounded-full", activeBoard?.id === b.id ? "bg-primary" : "bg-muted")} />
                                      <span className="font-dm text-sm font-medium">{b.nome}</span>
                                  </div>
                                  {activeBoard?.id === b.id && <Check className="w-4 h-4 text-primary" />}
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
              <Input placeholder="Filtrar tarefas..." className="pl-9 h-10 w-full bg-muted/40 border-none rounded-xl text-xs font-dm" value={busca} onChange={e => setBusca(e.target.value)}/>
            </div>
            <Button className="gap-2 h-10 bg-primary text-white rounded-xl px-4 font-dm-bold text-[10px] uppercase tracking-wider shadow-lg shadow-primary/20" onClick={() => handleCreateBoard(true)}>
              <Plus className="w-4 h-4"/> <span className="hidden sm:inline">NOVO PIPELINE</span>
            </Button>
          </div>
        </div>

        {/* Kanban Board Container */}
        <div className="flex-1 overflow-x-auto overflow-y-hidden p-6 custom-scrollbar">
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
                <span className="text-xs font-bold uppercase tracking-widest">Adicionar Etapa</span>
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
