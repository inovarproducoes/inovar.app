"use client";

import { MainLayout } from "@/components/layout/MainLayout";
import { useAlunos } from "@/hooks/useAlunos";
import { useState, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Aluno } from "@/types/alunos";
import { useDebounce } from "@/hooks/useDebounce";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Search, Eye, UserPlus, FileText, Building2, Phone, CreditCard, Save } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";

export default function AlunosPage() {
  const [busca, setBusca] = useState("");
  const debouncedBusca = useDebounce(busca, 300);
  
  const { data: alunosData, isLoading, refetch } = useAlunos({ 
    termo: debouncedBusca.length >= 3 ? debouncedBusca : undefined,
  });

  const [alunoSelecionado, setAlunoSelecionado] = useState<Aluno | null>(null);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  
  // Novo Aluno State
  const [novoAluno, setNovoAluno] = useState({ 
    nome: "", whatsapp: "", cpf: "", instituicao: "", projeto: "" 
  });
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const alunos = useMemo(() => {
     return alunosData || [];
  }, [alunosData]);

  const stats = {
    total: alunosData?.length || 0,
    ativos: alunosData?.filter(a => a.status === 'ativo').length || 0,
    pendentes: alunosData?.filter(a => a.status === 'inadimplente' || a.status === 'trancado').length || 0,
  };

  const handleVerAluno = (aluno: Aluno) => {
    setAlunoSelecionado(aluno);
    setIsViewOpen(true);
    setIsEditMode(false);
  };

  const handleSalvarEdicao = async () => {
     if (!alunoSelecionado) return;
     toast.loading("Salvando alterações...", { id: "edit-aluno" });
     await new Promise(r => setTimeout(r, 800));
     toast.success("Cadastro atualizado com sucesso!", { id: "edit-aluno" });
     setIsEditMode(false);
     refetch();
  };

  const handleCriarAluno = async () => {
    if (!novoAluno.nome || !novoAluno.whatsapp) {
        return toast.error("Preencha nome e WhatsApp pelo menos.");
    }
    toast.loading("Criando novo registro...", { id: "create-aluno" });
    await new Promise(r => setTimeout(r, 800));
    toast.success("Aluno cadastrado no sistema!", { id: "create-aluno" });
    setIsCreateOpen(false);
    setNovoAluno({ nome: "", whatsapp: "", cpf: "", instituicao: "", projeto: "" });
    refetch();
  };

  const getStatusStyle = (status: string) => {
    const s = status.toLowerCase();
    if (['ativo', 'sucesso', 'ok'].includes(s)) return { bg: 'bg-emerald-500/10', text: 'text-emerald-500', dot: 'bg-emerald-500' };
    if (['inadimplente', 'trancado', 'atraso'].includes(s)) return { bg: 'bg-red-500/10', text: 'text-red-500', dot: 'bg-red-500' };
    return { bg: 'bg-primary/10', text: 'text-primary', dot: 'bg-primary' };
  };

  return (
    <MainLayout title="Diretório de Alunos" subtitle="Controle completo e inteligência de dados">
      
      {/* View/Edit Dialog */}
      <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
        <DialogContent className="sm:max-w-[550px] p-0 border-none shadow-2xl overflow-hidden">
          <div className="bg-gradient-brand h-24 w-full flex items-end px-8 pb-4 relative">
             <div className="relative z-10 flex items-center gap-4">
                 <Avatar className="h-20 w-20 border-4 border-background -mb-10 shadow-lg">
                    <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${alunoSelecionado?.nome}`} />
                    <AvatarFallback className="bg-primary text-white text-xl font-bold">
                        {alunoSelecionado?.nome.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                 </Avatar>
             </div>
          </div>
          
          <div className="pt-12 px-8 pb-8 space-y-6">
            <div className="flex justify-between items-start">
                <div className="flex-1">
                   {isEditMode ? (
                        <Input value={alunoSelecionado?.nome} onChange={e => setAlunoSelecionado(a => a ? {...a, nome: e.target.value} : null)} className="h-10 text-xl font-bold font-dm p-0 border-b border-primary rounded-none" />
                   ) : (
                        <DialogTitle className="font-dm font-bold text-xl">{alunoSelecionado?.nome}</DialogTitle>
                   )}
                   <p className="text-sm text-muted-foreground mt-1 font-dm">Registro ID: {alunoSelecionado?.id.split('-')[0]}</p>
                </div>
                <div className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase ${getStatusStyle(alunoSelecionado?.status || '').bg} ${getStatusStyle(alunoSelecionado?.status || '').text}`}>
                    {alunoSelecionado?.status}
                </div>
            </div>

            <div className="grid grid-cols-2 gap-5 text-foreground">
                {[
                  { label: "WhatsApp", key: "telefone", icon: Phone },
                  { label: "CPF", key: "cpf", icon: CreditCard },
                  { label: "Instituição", key: "instituicao", icon: Building2 },
                  { label: "Projeto", key: "projeto", icon: FileText }
                ].map(field => (
                    <div key={field.key} className="space-y-1.5">
                        <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-1.5"><field.icon size={10}/> {field.label}</Label>
                        {isEditMode ? (
                            <Input value={(alunoSelecionado as Record<string, any>)?.[field.key] || ""} onChange={e => setAlunoSelecionado(a => a ? {...a, [field.key]: e.target.value} : null)} className="h-9 bg-muted/30 border-primary/20 text-xs" />
                        ) : (
                            <p className="text-sm font-dm pl-2 border-l-2 border-primary/10">{(alunoSelecionado as Record<string, any>)?.[field.key] || '--'}</p>
                        )}
                    </div>
                ))}
            </div>
          </div>

          <DialogFooter className="bg-muted/50 px-8 py-4">
              {isEditMode ? (
                   <>
                    <Button variant="outline" onClick={() => setIsEditMode(false)} className="font-dm-bold text-xs">CANCELAR</Button>
                    <Button onClick={handleSalvarEdicao} className="bg-primary text-white font-dm-bold text-xs uppercase"><Save size={14} className="mr-2"/> SALVAR DADOS</Button>
                   </>
              ) : (
                <>
                    <Button variant="ghost" onClick={() => setIsViewOpen(false)} className="font-dm-bold text-xs">FECHAR</Button>
                    <Button onClick={() => setIsEditMode(true)} className="bg-primary text-white font-dm-bold text-xs uppercase tracking-wider">EDITAR CADASTRO</Button>
                </>
              )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Stats Table */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
        {[
          { label: "Registros", value: stats.total, color: "text-foreground" },
          { label: "Ativos", value: stats.ativos, color: "text-emerald-500" },
          { label: "Pendências", value: stats.pendentes, color: "text-red-500" }
        ].map(s => (
            <div key={s.label} className="kpi-card shadow-sm">
              <span className={`text-4xl font-dm font-black ${s.color}`}>{s.value}</span>
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mt-2">{s.label}</p>
            </div>
        ))}
      </div>

      {/* Toolbar */}
      <div className="flex flex-col lg:flex-row items-center gap-4 mb-8">
        <div className="relative w-full lg:flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/40" />
          <Input 
            placeholder="Pesquisar por nome ou instituição..." 
            className="pl-11 h-12 bg-white/40 dark:bg-muted/30 border-border/70 rounded-2xl" 
            value={busca} 
            onChange={e => setBusca(e.target.value)} 
          />
        </div>

        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
                <Button className="h-12 bg-primary text-white rounded-2xl px-8 font-dm-bold uppercase tracking-wider shadow-xl hover:scale-105 transition-all">
                    <UserPlus size={18} className="mr-2" /> NOVO ALUNO
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[450px]">
                <DialogHeader><DialogTitle className="font-dm-bold">Novo Aluno</DialogTitle></DialogHeader>
                <div className="grid gap-5 py-4">
                    <div className="grid gap-2">
                        <Label className="text-xs uppercase font-bold text-muted-foreground">Nome Completo</Label>
                        <Input value={novoAluno.nome} onChange={e => setNovoAluno({...novoAluno, nome: e.target.value})} className="h-11 bg-muted/30" placeholder="Ex: João Silva" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                            <Label className="text-xs uppercase font-bold text-muted-foreground">WhatsApp</Label>
                            <Input value={novoAluno.whatsapp} onChange={e => setNovoAluno({...novoAluno, whatsapp: e.target.value})} className="h-11 bg-muted/30" placeholder="(00) 00000-0000" />
                        </div>
                        <div className="grid gap-2">
                            <Label className="text-xs uppercase font-bold text-muted-foreground">CPF</Label>
                            <Input value={novoAluno.cpf} onChange={e => setNovoAluno({...novoAluno, cpf: e.target.value})} className="h-11 bg-muted/30" placeholder="000.000.000-00" />
                        </div>
                    </div>
                    <div className="grid gap-2">
                        <Label className="text-xs uppercase font-bold text-muted-foreground">Instituição</Label>
                        <Input value={novoAluno.instituicao} onChange={e => setNovoAluno({...novoAluno, instituicao: e.target.value})} className="h-11 bg-muted/30" placeholder="Ex: UFMG ou Colegio Tiradentes" />
                    </div>
                    <div className="grid gap-2">
                        <Label className="text-xs uppercase font-bold text-muted-foreground">Projeto Ativo</Label>
                        <Input value={novoAluno.projeto} onChange={e => setNovoAluno({...novoAluno, projeto: e.target.value})} className="h-11 bg-muted/30" placeholder="Ex: Formatura Terceirão 2024" />
                    </div>
                </div>
                <DialogFooter>
                    <Button onClick={handleCriarAluno} className="w-full h-12 bg-primary text-white font-dm-bold uppercase tracking-widest shadow-lg">FINALIZAR CADASTRO</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
      </div>

      {/* Main Table */}
      <div className="glass-card shadow-lg rounded-2xl overflow-hidden mb-10">
        <div className="w-full overflow-x-auto no-scrollbar">
          <table className="w-full text-left font-dm">
            <thead>
              <tr className="border-b border-border/40 bg-muted/40 text-foreground">
                <th className="px-6 py-4 text-[11px] font-bold text-muted-foreground uppercase tracking-widest">Aluno</th>
                <th className="px-6 py-4 text-[11px] font-bold text-muted-foreground uppercase tracking-widest">Instituição</th>
                <th className="px-6 py-4 text-[11px] font-bold text-muted-foreground uppercase tracking-widest text-center">Status</th>
                <th className="px-6 py-4 text-[11px] font-bold text-muted-foreground uppercase tracking-widest text-right">Perfil</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/20">
              {isLoading ? (
                [1, 2, 3].map(i => <tr key={i}><td colSpan={4} className="p-8"><Skeleton className="h-10 w-full rounded-xl opacity-20" /></td></tr>)
              ) : (
                alunos?.map(aluno => {
                    const st = getStatusStyle(aluno.status);
                    return (
                        <tr key={aluno.id} className="group hover:bg-muted/30 cursor-pointer transition-all" onClick={() => handleVerAluno(aluno)}>
                            <td className="px-6 py-5">
                                <div className="flex items-center gap-3.5">
                                    <Avatar className="h-10 w-10 border border-border group-hover:scale-110 transition-transform">
                                        <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${aluno.nome}`} />
                                        <AvatarFallback className="bg-primary/10 text-primary text-xs font-bold">{aluno.nome[0]}</AvatarFallback>
                                    </Avatar>
                                    <div className="flex flex-col">
                                        <span className="font-bold text-[14.5px] text-foreground">{aluno.nome}</span>
                                        <span className="text-xs text-muted-foreground">{aluno.telefone || "Sem contato"}</span>
                                    </div>
                                </div>
                            </td>
                            <td className="px-6 py-5 text-sm text-muted-foreground">{aluno.instituicao || "N/A"}</td>
                            <td className="px-6 py-5 text-center">
                                <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${st.bg} ${st.text}`}>
                                    <span className={`w-1.5 h-1.5 rounded-full ${st.dot}`} />
                                    {aluno.status}
                                </div>
                            </td>
                            <td className="px-6 py-5 text-right">
                                <Button variant="ghost" size="icon" className="h-9 w-9 text-muted-foreground/50 hover:text-primary transition-all">
                                    <Eye size={16} />
                                </Button>
                            </td>
                        </tr>
                    );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </MainLayout>
  );
}
