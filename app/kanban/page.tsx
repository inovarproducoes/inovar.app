"use client";

import { MainLayout } from "@/components/layout/MainLayout";
import { useState, useEffect } from "react";
import { 
  DndContext, 
  closestCenter, 
  KeyboardSensor, 
  PointerSensor, 
  useSensor, 
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import { 
  arrayMove, 
  SortableContext, 
  sortableKeyboardCoordinates, 
  horizontalListSortingStrategy,
} from "@dnd-kit/sortable";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Plus, Layout, Settings, Search, Filter } from "lucide-react";
import { ColumnContainer } from "@/components/kanban/ColumnContainer";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import type { IBoard, IColumn } from "@/types/kanban";

export default function KanbanPage() {
  const [loading, setLoading] = useState(true);
  const [activeBoard, setActiveBoard] = useState<IBoard | null>(null);
  const [busca, setBusca] = useState("");

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  useEffect(() => {
    fetchBoards();
  }, []);

  const fetchBoards = async () => {
    try {
      const res = await fetch('/api/kanban/boards');
      const data = await res.json();
      if (data.length > 0) {
        setActiveBoard(data[0]);
      }
    } catch {
      toast.error("Erro ao carregar quadros");
    } finally {
      setLoading(false);
    }
  };

  const onDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || !activeBoard) return;

    if (active.id !== over.id) {
      const oldIndex = activeBoard.colunas.findIndex((c: IColumn) => c.id === active.id);
      const newIndex = activeBoard.colunas.findIndex((c: IColumn) => c.id === over.id);
      
      const newCols = arrayMove(activeBoard.colunas, oldIndex, newIndex);
      setActiveBoard({ ...activeBoard, colunas: newCols });
    }
  };

  if (loading) return (
    <MainLayout title="Kanban OS text-foreground">
      <div className="p-8 space-y-4">
        <Skeleton className="h-10 w-64"/>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Skeleton className="h-[600px]"/><Skeleton className="h-[600px]"/><Skeleton className="h-[600px]"/><Skeleton className="h-[600px]"/>
        </div>
      </div>
    </MainLayout>
  );

  return (
    <MainLayout title="Kanban de Gestão" subtitle="Organize e monitore o fluxo de trabalho dos eventos">
      <div className="flex flex-col h-full -mx-6 -my-6 bg-muted/30">
        <div className="bg-background border-b px-6 py-4 flex flex-col md:flex-row justify-between items-start md:items-center sticky top-0 z-20 gap-4">
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

        <div className="flex-1 overflow-x-auto p-6 scrollbar-thin">
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
            <div className="flex gap-6 h-full min-h-[500px]">
              <SortableContext items={activeBoard?.colunas?.map((c: IColumn) => c.id) || []} strategy={horizontalListSortingStrategy}>
                {activeBoard?.colunas?.map((col: IColumn) => (
                  <ColumnContainer 
                    key={col.id} 
                    id={col.id}
                    title={col.nome} 
                    tasks={col.tarefas.filter((t) => t.titulo.toLowerCase().includes(busca.toLowerCase()))}
                    boardId={activeBoard.id}
                    onUpdate={fetchBoards}
                  />
                ))}
              </SortableContext>
              
              <button 
                className="w-80 h-[100px] flex-shrink-0 border-2 border-dashed border-muted-foreground/20 rounded-xl flex items-center justify-center text-muted-foreground hover:bg-muted/50 transition-all group"
                onClick={() => toast.info("Adicionar coluna disponível em breve")}
              >
                <Plus className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform"/> Adicionar Coluna
              </button>
            </div>
          </DndContext>
        </div>
      </div>
    </MainLayout>
  );
}
