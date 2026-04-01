"use client";

import { useState } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { TaskCard } from "./TaskCard";
import { Plus, MoreVertical, Copy, Trash2, Edit2, Check, Layout } from "lucide-react";
import { Button } from "@/components/ui/button";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { 
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { useQuery } from "@tanstack/react-query";
import { clientesService } from "@/services/clientesService";
import type { ITask, IColumn } from "@/types/kanban";
import { Search, UserPlus } from "lucide-react";

interface ColumnContainerProps {
  id: string;
  title: string;
  tasks: ITask[];
  boardId: string;
  allColumns: IColumn[]; 
  onUpdate: () => void;
  onEditTask: (task: ITask) => void;
  isOSBoard?: boolean;
}

export function ColumnContainer({ id, title, tasks, boardId, allColumns, onUpdate, onEditTask, isOSBoard = false }: ColumnContainerProps) {
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

  const [isNewTaskOpen, setIsNewTaskOpen] = useState(false);
  const [isClientSelectorOpen, setIsClientSelectorOpen] = useState(false);
  const [newTaskData, setNewTaskData] = useState({ 
    titulo: "", 
    instituicao: "", 
    projeto_nome: "",
    cliente_nome: "",
    cliente_id: "",
    cliente_telefone: "",
    responsavel_nome: "",
    aluno_nome: "",
    aluno_cpf: ""
  });

  const { data: globalClients = [] } = useQuery({
    queryKey: ['global-clients'],
    queryFn: () => clientesService.buscarClientes(),
    staleTime: 1000 * 60 * 5,
    enabled: isNewTaskOpen
  });

  const confirmAddTask = async () => {
    if (!newTaskData.titulo) {
      toast.error("O título é obrigatório");
      return;
    }
    
    try {
      const resp = await fetch('/api/kanban/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          titulo: newTaskData.titulo,
          descricao: newTaskData.cliente_telefone ? `Contato: ${newTaskData.cliente_telefone}` : undefined,
          instituicao: newTaskData.instituicao,
          projeto_nome: newTaskData.projeto_nome,
          responsavel_nome: newTaskData.responsavel_nome || newTaskData.cliente_nome,
          aluno_nome: newTaskData.aluno_nome,
          aluno_cpf: newTaskData.aluno_cpf,
          coluna_id: id,
          quadro_id: boardId,
          prioridade: 'media',
          isOS: isOSBoard
        })
      });
      if (resp.ok) {
        toast.success(isOSBoard ? "OS criada com sucesso!" : "Tarefa criada");
        setIsNewTaskOpen(false);
        setNewTaskData({ titulo: "", instituicao: "", projeto_nome: "", cliente_nome: "", cliente_id: "", cliente_telefone: "", responsavel_nome: "", aluno_nome: "", aluno_cpf: "" });
        onUpdate();
      }
    } catch {
      toast.error("Erro ao criar tarefa");
    }
  };

  const handleAddTask = () => {
    setIsNewTaskOpen(true);
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
        glass-card border-border/10
        ${isDragging ? 'shadow-2xl scale-[1.02] rotate-1 z-30 ring-2 ring-primary bg-muted/40' : 'bg-muted/10'} 
        flex-shrink-0 transition-all duration-300 rounded-2xl overflow-hidden
      `}
    >
      {/* Column Header */}
      <div
        className="p-5 flex flex-col gap-4 group/header border-b border-border/10"
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
                <h3 className="font-dm font-bold text-sm text-foreground/90 truncate">{title}</h3>
                <span className="bg-muted text-muted-foreground px-2 py-0.5 rounded-md text-[10px] font-bold font-mono">
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
                className="w-8 h-8 flex items-center justify-center hover:bg-muted rounded-lg transition-colors text-muted-foreground hover:text-foreground" 
                onClick={(e) => { e.stopPropagation(); handleAddTask(); }}
                title="Nova OS"
            >
                <Plus size={16}/>
            </button>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="w-8 h-8 flex items-center justify-center hover:bg-muted rounded-lg transition-colors text-muted-foreground hover:text-foreground" onClick={e => e.stopPropagation()}>
                  <MoreVertical size={14}/>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-card border-border backdrop-blur-xl">
                <DropdownMenuItem onClick={() => setIsRenaming(true)} className="font-syne font-bold text-xs uppercase tracking-wider text-foreground/70">
                  <Edit2 className="w-3.5 h-3.5 mr-2" /> Renomear
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-border/50" />
                <DropdownMenuItem 
                  className="text-red-500 focus:text-red-500 focus:bg-red-500/10 font-syne font-bold text-xs uppercase tracking-wider" 
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
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/30 font-mono">Workflow Status</span>
                <span className="text-[10px] font-black text-primary font-mono">{progress}%</span>
            </div>
            <div className="h-1 bg-muted rounded-full overflow-hidden">
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
            <div className="w-16 h-16 rounded-full bg-muted/20 flex items-center justify-center mb-4 border border-border group-hover:border-primary/20 transition-all">
                <Layout className="w-6 h-6 text-muted-foreground/20" />
            </div>
            <p className="text-[11px] font-bold uppercase tracking-[0.15em] text-muted-foreground/40 font-mono italic">Esperando tarefas</p>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-border/10">
         <Button 
           variant="ghost" 
           className="w-full justify-center text-muted-foreground/60 hover:text-foreground hover:bg-muted h-11 font-syne font-bold text-xs uppercase tracking-widest rounded-xl transition-all hover:scale-[0.98] active:scale-95"
           onClick={handleAddTask}
         >
           <Plus size={16} className="mr-2 text-primary"/> Nova OS
         </Button>
      </div>

      {/* Dialogs */}
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

      <Dialog open={isNewTaskOpen} onOpenChange={setIsNewTaskOpen}>
        <DialogContent className="bg-background/95 border-border/40 backdrop-blur-xl text-foreground sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="font-syne font-extrabold text-xl">Criar Nova OS</DialogTitle>
            <DialogDescription className="font-dm text-muted-foreground">
              Preencha os dados da Ordem de Serviço para acompanhar no pipeline.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4 font-dm">
            <div className="grid gap-2">
              <Label htmlFor="qc-title" className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Título / Descrição da OS</Label>
              <Input 
                id="qc-title" 
                placeholder="Ex: Entrega de becas..." 
                value={newTaskData.titulo} 
                onChange={(e) => setNewTaskData({ ...newTaskData, titulo: e.target.value })}
                className="bg-muted/30 border-none rounded-xl h-11"
              />
            </div>
            
            <div className="grid gap-2">
              <Label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Responsável (Contato/Cliente)</Label>
              <Popover open={isClientSelectorOpen} onOpenChange={setIsClientSelectorOpen}>
                <PopoverTrigger asChild>
                   <Button variant="outline" className="w-full h-11 justify-start font-dm text-xs bg-muted/30 border-none rounded-xl hover:bg-muted/50">
                      <Search className="w-3.5 h-3.5 mr-2 opacity-50" />
                      {newTaskData.cliente_nome ? (
                        <span className="flex items-center gap-2">
                          <span className="font-bold">{newTaskData.cliente_nome}</span>
                          {newTaskData.cliente_telefone && <span className="text-muted-foreground font-mono text-[10px]">{newTaskData.cliente_telefone}</span>}
                        </span>
                      ) : "Pesquisar ou selecionar contato..."}
                   </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[375px] p-0 rounded-2xl shadow-2xl border-primary/10">
                   <Command className="bg-background">
                      <CommandInput placeholder="Digite o nome do contato..." className="h-10 text-xs" />
                      <CommandList>
                         <CommandEmpty className="p-4 flex flex-col items-center gap-2">
                            <p className="text-[11px] text-muted-foreground">Contato não encontrado.</p>
                            <Button 
                              variant="secondary" 
                              size="sm" 
                              className="h-8 rounded-lg text-[10px] gap-2"
                              onClick={() => { setIsClientSelectorOpen(false); toast.info("Cadastre o cliente no módulo de Clientes!"); }}
                            >
                               <UserPlus className="w-3 h-3" /> CADASTRAR NO CRM
                            </Button>
                         </CommandEmpty>
                         <CommandGroup heading="Contatos Recentes">
                            {globalClients.map((client) => (
                               <CommandItem
                                 key={client.id}
                                 onSelect={() => {
                                   setNewTaskData(prev => ({
                                     ...prev, 
                                     cliente_nome: client.nome, 
                                     cliente_id: client.id,
                                     cliente_telefone: client.telefone || "",
                                     responsavel_nome: client.nome
                                   }));
                                   setIsClientSelectorOpen(false);
                                 }}
                                 className="flex items-center justify-between p-3 cursor-pointer"
                               >
                                  <div className="flex flex-col">
                                     <span className="font-dm font-bold text-xs">{client.nome}</span>
                                     <span className="text-[10px] text-muted-foreground font-mono opacity-60">{client.telefone}</span>
                                  </div>
                                  {newTaskData.cliente_id === client.id && <Check className="w-4 h-4 text-primary" />}
                               </CommandItem>
                            ))}
                         </CommandGroup>
                      </CommandList>
                   </Command>
                </PopoverContent>
              </Popover>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="qc-aluno" className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Nome do Aluno</Label>
                <Input 
                  id="qc-aluno" 
                  placeholder="Ex: Maria Clara..." 
                  value={newTaskData.aluno_nome} 
                  onChange={(e) => setNewTaskData({ ...newTaskData, aluno_nome: e.target.value })}
                  className="bg-muted/30 border-none rounded-xl h-11"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="qc-cpf" className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">CPF do Aluno</Label>
                <Input 
                  id="qc-cpf" 
                  placeholder="000.000.000-00" 
                  value={newTaskData.aluno_cpf} 
                  onChange={(e) => setNewTaskData({ ...newTaskData, aluno_cpf: e.target.value })}
                  className="bg-muted/30 border-none rounded-xl h-11"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="qc-inst" className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Instituição</Label>
                <Input 
                  id="qc-inst" 
                  placeholder="Escola..." 
                  value={newTaskData.instituicao} 
                  onChange={(e) => setNewTaskData({ ...newTaskData, instituicao: e.target.value })}
                  className="bg-muted/30 border-none rounded-xl h-11"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="qc-proj" className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Projeto</Label>
                <Input 
                  id="qc-proj" 
                  placeholder="Formatura..." 
                  value={newTaskData.projeto_nome} 
                  onChange={(e) => setNewTaskData({ ...newTaskData, projeto_nome: e.target.value })}
                  className="bg-muted/30 border-none rounded-xl h-11"
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="ghost" onClick={() => setIsNewTaskOpen(false)} className="rounded-xl font-syne font-bold uppercase tracking-wider text-[10px]">Cancelar</Button>
            <Button onClick={confirmAddTask} className="bg-primary text-white rounded-xl font-syne font-bold uppercase tracking-wider text-[10px] px-8 h-12 shadow-lg shadow-primary/20">
              Criar OS
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
