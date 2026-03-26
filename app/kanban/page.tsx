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
import { Plus, Layout, Settings, Search, Filter } from "lucide-react";
import { ColumnContainer } from "@/components/kanban/ColumnContainer";
import { TaskCard } from "@/components/kanban/TaskCard";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import { TaskEditSheet } from "@/components/kanban/TaskEditSheet";
import type { IBoard, IColumn, ITask } from "@/types/kanban";

export default function KanbanPage() {
  const [loading, setLoading] = useState(true);
  const [activeBoard, setActiveBoard] = useState<IBoard | null>(null);
  const [busca, setBusca] = useState("");
  const [selectedTask, setSelectedTask] = useState<ITask | null>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [activeTask, setActiveTask] = useState<ITask | null>(null);
  const [activeColumn, setActiveColumn] = useState<IColumn | null>(null);
  const [mounted, setMounted] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  const SAMPLE_BOARD: IBoard = {
    id: "sample-id",
    nome: "Quadro de Atividades (Amostra)",
    descricao: "Controle seus eventos",
    colunas: [
      {
        id: "col-1",
        nome: "Backlog",
        ordem: 0,
        quadro_id: "sample-id",
        tarefas: [
          { id: "task-1", titulo: "Definir Buffet do Casamento", descricao: "Escolher o cardápio principal", prioridade: "urgente", responsavel_nome: "Maria", coluna_id: "col-1", quadro_id: "sample-id", ordem: 0, etiquetas: ["Buffet", "Importante"], anexos: 2 },
          { id: "task-2", titulo: "Contratar DJ", descricao: "Verificar referências e som", prioridade: "alta", responsavel_nome: "Pedro", coluna_id: "col-1", quadro_id: "sample-id", ordem: 1, etiquetas: ["Som", "DJ"] }
        ]
      },
      {
        id: "col-2",
        nome: "Em Andamento",
        ordem: 1,
        quadro_id: "sample-id",
        tarefas: [
          { id: "task-3", titulo: "Envio dos Convites", descricao: "Mandar via WhatsApp e e-mail", prioridade: "media", responsavel_nome: "Ana", coluna_id: "col-2", quadro_id: "sample-id", ordem: 0, etiquetas: ["Convite"] }
        ]
      },
      {
        id: "col-3",
        nome: "Concluído",
        ordem: 2,
        quadro_id: "sample-id",
        tarefas: [
          { id: "task-4", titulo: "Reunião de Alinhamento", descricao: "Concluído com sucesso", prioridade: "baixa", responsavel_nome: "Diretoria", coluna_id: "col-3", quadro_id: "sample-id", ordem: 0, etiquetas: ["OK"] }
        ]
      }
    ]
  };

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
          // Sanitizar dados do banco
          const sanitizedBoard = {
            ...data[0],
            colunas: data[0].colunas.map((col: IColumn) => ({
              ...col,
              tarefas: col.tarefas.map((t: ITask) => ({
                ...t,
                etiquetas: Array.isArray(t.etiquetas) ? t.etiquetas : []
              }))
            }))
          };
          setActiveBoard(sanitizedBoard);
        } else {
          setActiveBoard(SAMPLE_BOARD);
        }
      } else {
        setActiveBoard(SAMPLE_BOARD);
      }
    } catch {
      setActiveBoard(SAMPLE_BOARD);
      toast.error("Exibindo quadro de amostra");
    } finally {
      setLoading(false);
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

    if (!isActiveATask) return;

    // Movendo tarefa sobre outra tarefa
    if (isActiveATask && isOverATask) {
      setActiveBoard((board: IBoard | null) => {
        if (!board) return board;
        const activeColumn = board.colunas.find((col: IColumn) => 
          col.tarefas.some((t: ITask) => t.id === activeId)
        );
        const overColumn = board.colunas.find((col: IColumn) => 
          col.tarefas.some((t: ITask) => t.id === overId)
        );

        if (!activeColumn || !overColumn) return board;

        if (activeColumn.id !== overColumn.id) {
          const activeIndex = activeColumn.tarefas.findIndex((t: ITask) => t.id === activeId);
          const overIndex = overColumn.tarefas.findIndex((t: ITask) => t.id === overId);

          const taskToMove = { ...activeColumn.tarefas[activeIndex], coluna_id: overColumn.id };

          const newActiveTasks = [...activeColumn.tarefas];
          newActiveTasks.splice(activeIndex, 1);

          const newOverTasks = [...overColumn.tarefas];
          newOverTasks.splice(overIndex, 0, taskToMove);

          return {
            ...board,
            colunas: board.colunas.map((c: IColumn) => {
              if (c.id === activeColumn.id) return { ...c, tarefas: newActiveTasks };
              if (c.id === overColumn.id) return { ...c, tarefas: newOverTasks };
              return c;
            })
          };
        }
        return board;
      });
    }

    const isOverAColumn = over.data.current?.type === "Column";

    // Movendo tarefa sobre uma coluna
    if (isActiveATask && isOverAColumn) {
      setActiveBoard((board: IBoard | null) => {
        if (!board) return board;
        const activeColumn = board.colunas.find((col: IColumn) => 
          col.tarefas.some((t: ITask) => t.id === activeId)
        );
        const overColumn = board.colunas.find((col: IColumn) => col.id === overId);

        if (!activeColumn || !overColumn || activeColumn.id === overColumn.id) return board;

        const activeIndex = activeColumn.tarefas.findIndex((t: ITask) => t.id === activeId);
        const taskToMove = { ...activeColumn.tarefas[activeIndex], coluna_id: overColumn.id };

        const newActiveTasks = [...activeColumn.tarefas];
        newActiveTasks.splice(activeIndex, 1);

        const newOverTasks = [...overColumn.tarefas, taskToMove];

        return {
          ...board,
          colunas: board.colunas.map((c: IColumn) => {
            if (c.id === activeColumn.id) return { ...c, tarefas: newActiveTasks };
            if (c.id === overColumn.id) return { ...c, tarefas: newOverTasks };
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

    const isActiveAColumn = active.data.current?.type === "Column";

    // Reordenar colunas
    if (isActiveAColumn) {
      const oldIndex = activeBoard.colunas.findIndex((c: IColumn) => c.id === active.id);
      const newIndex = activeBoard.colunas.findIndex((c: IColumn) => c.id === over.id);
      
      const newCols = arrayMove(activeBoard.colunas, oldIndex, newIndex);
      setActiveBoard({ ...activeBoard, colunas: newCols });
      // Aqui faríamos o sync com o banco via API mais tarde
      return;
    }

    // Reordenar tarefas na mesma coluna ou persistir movimentação
    const activeId = active.id;
    const overId = over.id;

    const activeColumn = activeBoard.colunas.find((col: IColumn) => 
      col.tarefas.some((t: ITask) => t.id === activeId)
    );
    const overColumn = activeBoard.colunas.find((col: IColumn) => 
      col.tarefas.some((t: ITask) => t.id === overId) || col.id === overId
    );

    if (!activeColumn || !overColumn) return;

    if (activeColumn.id === overColumn.id) {
      const oldIndex = activeColumn.tarefas.findIndex((t: ITask) => t.id === activeId);
      const newIndex = activeColumn.tarefas.findIndex((t: ITask) => t.id === overId);
      
      if (oldIndex !== newIndex) {
        const newTasks = arrayMove(activeColumn.tarefas, oldIndex, newIndex);
        setActiveBoard({
          ...activeBoard,
          colunas: activeBoard.colunas.map((c: IColumn) => c.id === activeColumn.id ? { ...c, tarefas: newTasks } : c)
        });
      }
    }

    // Persistência...
    setActiveTask(null);
    setActiveColumn(null);

    const task = activeBoard.colunas.flatMap(c => c.tarefas).find(t => t.id === activeId);
    
    if (task) {
      try {
        await fetch(`/api/kanban/tasks/${task.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            coluna_id: task.coluna_id,
            ordem: task.ordem
          })
        });
      } catch (err) {
        console.error("Erro ao sincronizar tarefa", err);
      }
    }
  };

  if (!mounted || loading) return (
    <MainLayout title="Carregando Kanban..." subtitle="Organize e monitore o fluxo de trabalho dos eventos">
      <div className="p-8 space-y-4">
        <Skeleton className="h-10 w-64"/>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 h-[500px]">
          <Skeleton className="h-full"/><Skeleton className="h-full"/><Skeleton className="h-full"/><Skeleton className="h-full"/>
        </div>
      </div>
    </MainLayout>
  );

  if (!activeBoard) {
    return (
      <MainLayout title="Kanban de Gestão" subtitle="Organize e monitore o fluxo de trabalho dos eventos">
        <div className="flex flex-col items-center justify-center h-[calc(100vh-250px)] text-muted-foreground p-8">
          <div className="bg-muted/30 p-8 rounded-full mb-6">
            <Layout className="w-20 h-20 opacity-20" />
          </div>
          <h3 className="text-2xl font-bold text-foreground mb-2">Nenhum Quadro Encontrado</h3>
          <p className="max-w-md text-center mb-8 opacity-70">
            Parece que o seu banco de dados de produção ainda não tem quadros de Kanban configurados. 
            Rode o Seed no terminal ou crie um novo quadro.
          </p>
          <div className="flex gap-4">
            <Button size="lg" className="gap-2" onClick={fetchBoards}>
              <Search className="w-4 h-4" /> Tentar Carregar
            </Button>
            <Button size="lg" variant="outline" className="gap-2" onClick={() => toast.info("Funcionalidade em desenvolvimento")}>
              <Plus className="w-4 h-4" /> Criar Primeiro Quadro
            </Button>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout title="Kanban de Gestão" subtitle="Organize e monitore o fluxo de trabalho dos eventos">
      <div className="flex flex-col h-[calc(100vh-180px)] md:h-[calc(100vh-140px)] -mx-6 -my-6 bg-slate-50/50 dark:bg-transparent">
        <div className="bg-background/80 backdrop-blur-md border-b px-6 py-4 flex flex-col md:flex-row justify-between items-start md:items-center sticky top-0 z-20 gap-4 shadow-sm">
          <div className="flex items-center gap-4">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <Layout className="w-5 h-5 text-primary"/> {activeBoard?.nome || "Sem Quadros"}
            </h2>
            <div className="h-6 w-px bg-border hidden md:block"/>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-[10px] py-0">{activeBoard?.colunas?.length || 0} Colunas</Badge>
            </div>
          </div>
          
          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="relative flex-1 md:flex-initial">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground"/>
              <Input placeholder="Buscar tarefas..." className="pl-9 h-9 w-full md:w-64 bg-muted/50 border-none" value={busca} onChange={e => setBusca(e.target.value)}/>
            </div>
            <Button variant="outline" size="icon" className="h-9 w-9"><Filter className="w-4 h-4"/></Button>
            <Button className="gap-2 h-9" onClick={() => toast.info("Criar quadro disponível em breve")}>
              <Plus className="w-4 h-4"/> Novo Quadro
            </Button>
            <Button variant="ghost" size="icon" className="h-9 w-9"><Settings className="w-4 h-4"/></Button>
          </div>
        </div>

        <div className="flex-1 overflow-x-auto overflow-y-hidden p-6 scrollbar-thin scrollbar-thumb-primary/10 hover:scrollbar-thumb-primary/20 transition-all">
          <DndContext 
            sensors={sensors} 
            collisionDetection={closestCenter} 
            onDragStart={onDragStart}
            onDragOver={onDragOver}
            onDragEnd={onDragEnd}
          >
            <div className="flex gap-6 h-full min-h-[500px] w-max">
              <SortableContext items={activeBoard?.colunas?.map((c: IColumn) => c.id) || []} strategy={horizontalListSortingStrategy}>
                {activeBoard?.colunas?.map((col: IColumn) => (
                  <ColumnContainer 
                    key={col.id} 
                    id={col.id}
                    title={col.nome} 
                    tasks={col.tarefas.filter((t) => t.titulo.toLowerCase().includes(busca.toLowerCase()))}
                    boardId={activeBoard?.id || ""}
                    onUpdate={fetchBoards}
                    onEditTask={handleEditTask}
                  />
                ))}
              </SortableContext>
              
              <button 
                className="w-80 md:w-96 h-[120px] flex-shrink-0 border-2 border-dashed border-primary/20 rounded-2xl flex flex-col items-center justify-center text-primary/60 hover:text-primary hover:bg-primary/5 hover:border-primary/40 transition-all group"
                onClick={() => toast.info("Adicionar coluna disponível em breve")}
              >
                <div className="p-3 bg-primary/5 rounded-full mb-2 group-hover:scale-110 transition-transform">
                  <Plus className="w-5 h-5"/>
                </div>
                <span className="text-sm font-bold">Nova Coluna</span>
              </button>
            </div>

            <DragOverlay>
               {activeColumn && (
                 <ColumnContainer 
                    id={activeColumn.id}
                    title={activeColumn.nome}
                    tasks={activeBoard?.colunas.find(c => c.id === activeColumn.id)?.tarefas || []}
                    boardId={activeBoard?.id || ""}
                    onUpdate={() => {}}
                    onEditTask={() => {}}
                 />
               )}
               {activeTask && (
                 <TaskCard id={activeTask.id} task={activeTask} />
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
