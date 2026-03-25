"use client";
import { MainLayout } from "@/components/layout/MainLayout";
import { useEvento, useUpdateEvento, useDeleteEvento } from "@/hooks/useEventos";
import { useParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
import { format } from "date-fns";
import { Fornecedor } from "@/types/database";
import { MapPin, Calendar, Users, Clock, UsersIcon, ShieldCheck, ArrowLeft, Edit2, Trash2, Building, Mail, Phone } from "lucide-react";
import Link from "next/link";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useRouter } from "next/navigation";

export default function EventoDetalhesPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const { data: evento, isLoading } = useEvento(id);
  const { mutate: updateEvento } = useUpdateEvento();
  const { mutate: deleteEvento } = useDeleteEvento();

  if (isLoading || !evento) return <MainLayout title="Detalhes do Evento"><div className="flex justify-center items-center h-full">Carregando...</div></MainLayout>;

  const handleChecklistToggle = (idx: number) => {
    if (!evento.checklist) return;
    const newList = [...evento.checklist];
    newList[idx].feito = !newList[idx].feito;
    updateEvento({ id, checklist: newList });
  };

  const percentOcupado = evento.capacidade_maxima > 0 ? ((evento.capacidade_maxima - evento.vagas_disponiveis) / evento.capacidade_maxima) * 100 : 0;

  let fornecedores: Fornecedor[] = [];
  try {
    const raw = evento.fornecedores;
    const parsed: Array<Fornecedor | string> = raw
      ? (typeof raw === 'string' ? JSON.parse(raw) : raw)
      : [];
    fornecedores = parsed.filter((f): f is Fornecedor => typeof f === 'object' && f !== null);
  } catch {
    fornecedores = [];
  }

  const handleDelete = () => {
    deleteEvento(id, {
      onSuccess: () => router.push("/eventos")
    });
  };

  return (
    <MainLayout title={evento.nome} subtitle={`Cadastrado em ${format(new Date(evento.created_at), 'dd/MM/yyyy')}`}>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <Button variant="outline" asChild className="gap-2">
          <Link href="/eventos"><ArrowLeft className="w-4 h-4" /> Voltar</Link>
        </Button>
        <div className="flex gap-2">
          <Badge variant="outline" className="text-sm px-4 capitalize tracking-wide">{evento.status.replace("_", " ")}</Badge>
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="secondary" className="gap-2"><Edit2 className="w-4 h-4" /> Editar</Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader><DialogTitle>Editar {evento.nome}</DialogTitle></DialogHeader>
              <div className="py-8 text-center text-muted-foreground border-dashed border-2 rounded-lg mt-4">
                Formulário de Edição completo aqui (react-hook-form + zod simulado)
              </div>
            </DialogContent>
          </Dialog>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" className="gap-2"><Trash2 className="w-4 h-4" /> Excluir</Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Excluir evento?</AlertDialogTitle>
                <AlertDialogDescription>Esta ação não pode ser desfeita.</AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">Excluir</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
           <Card>
             <CardHeader className="flex flex-row justify-between items-center">
                <CardTitle className="text-xl">Visão Geral</CardTitle>
                <Badge>{evento.status}</Badge>
             </CardHeader>
             <CardContent className="grid sm:grid-cols-2 gap-4">
               <div className="flex items-center gap-3">
                 <Calendar className="w-5 h-5 text-muted-foreground" />
                 <div>
                   <p className="text-sm text-muted-foreground">Data</p>
                   <p className="font-medium">{format(new Date(evento.data_inicio), 'dd/MM/yyyy')}</p>
                 </div>
               </div>
               <div className="flex items-center gap-3">
                 <Clock className="w-5 h-5 text-muted-foreground" />
                 <div>
                   <p className="text-sm text-muted-foreground">Horário</p>
                   <p className="font-medium">{evento.horario_inicio} - {evento.horario_fim}</p>
                 </div>
               </div>
               <div className="flex items-center gap-3">
                 <MapPin className="w-5 h-5 text-muted-foreground" />
                 <div>
                   <p className="text-sm text-muted-foreground">Local</p>
                   {evento.link_maps ? (
                     <a href={evento.link_maps} target="_blank" rel="noreferrer" className="text-primary hover:underline">{evento.local_nome}</a>
                   ) : <p className="font-medium">{evento.local_nome}</p>}
                 </div>
               </div>
               <div className="flex items-center gap-3">
                 <UsersIcon className="w-5 h-5 text-muted-foreground" />
                 <div>
                   <p className="text-sm text-muted-foreground">Ocupação</p>
                   <p className="font-medium">{evento.capacidade_maxima - evento.vagas_disponiveis} / {evento.capacidade_maxima}</p>
                 </div>
               </div>
             </CardContent>
           </Card>

           <Card>
             <CardHeader>
                <CardTitle>Checklist</CardTitle>
             </CardHeader>
             <CardContent className="space-y-3">
               {evento.checklist && evento.checklist.length > 0 ? evento.checklist.map((item, idx) => (
                 <div key={idx} className="flex items-center space-x-2">
                   <Checkbox id={`check-${idx}`} checked={item.feito} onCheckedChange={() => handleChecklistToggle(idx)} />
                   <label htmlFor={`check-${idx}`} className={`text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 ${item.feito ? 'line-through text-muted-foreground' : ''}`}>
                     {item.item}
                   </label>
                 </div>
               )) : <p className="text-muted-foreground text-sm">Nenhum item adicionado.</p>}
             </CardContent>
           </Card>

           {evento.tipo_evento === 'formatura' && (
             <Card>
               <CardHeader><CardTitle>Alunos Vinculados</CardTitle></CardHeader>
               <CardContent>
                 <p className="text-sm text-muted-foreground">Componente AlunosEventoSection renderizado aqui.</p>
               </CardContent>
             </Card>
           )}

           <Card>
             <CardHeader className="flex flex-row items-center justify-between">
               <CardTitle>Participantes</CardTitle>
               <Button variant="outline" size="sm">Gerenciar</Button>
             </CardHeader>
             <CardContent>
               <div className="border rounded-md">
                 <table className="w-full text-sm">
                   <thead className="bg-muted">
                     <tr><th className="text-left p-3">Nome</th><th className="text-left p-3">Email</th><th className="text-left p-3">Status</th></tr>
                   </thead>
                   <tbody>
                     <tr><td className="p-4 text-center text-muted-foreground" colSpan={3}>Nenhum participante vinculado</td></tr>
                   </tbody>
                 </table>
               </div>
             </CardContent>
           </Card>
        </div>

        <div className="space-y-6">
           <Card>
              <CardHeader><CardTitle>Capacidade</CardTitle></CardHeader>
              <CardContent>
                <div className="mb-2 flex justify-between text-sm">
                  <span>{percentOcupado.toFixed(1)}% Ocupado</span>
                </div>
                <Progress value={percentOcupado} className="h-2" />
                <p className="text-xs text-muted-foreground mt-3">{evento.vagas_disponiveis} vagas restantes</p>
              </CardContent>
           </Card>
           
           <Card>
              <CardHeader><CardTitle>Financeiro</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                 <div className="flex justify-between items-center p-3 bg-muted rounded">
                   <span className="text-sm font-medium">Valor Total</span>
                   <span className="font-bold">R$ {evento.valor_total.toFixed(2)}</span>
                 </div>
                 <div className="flex justify-between items-center p-3 bg-success/10 text-success rounded">
                   <span className="text-sm font-medium">Entrada Paga</span>
                   <span className="font-bold">R$ {evento.valor_entrada.toFixed(2)}</span>
                 </div>
                 <div className="flex justify-between items-center p-3 bg-destructive/10 text-destructive rounded">
                   <span className="text-sm font-medium">Pendente</span>
                   <span className="font-bold">R$ {evento.valor_pendente.toFixed(2)}</span>
                 </div>
              </CardContent>
           </Card>

           <Card>
              <CardHeader><CardTitle>Responsável / Cliente</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                 <div className="space-y-1 text-sm bg-muted/50 p-3 rounded-lg border">
                   <p className="font-semibold text-foreground flex items-center gap-2"><Building className="w-4 h-4 text-primary" /> Empresa Contratante</p>
                   {evento.cliente_nome ? (
                     <>
                       <div className="flex items-center gap-2 mt-2"><Users className="w-4 h-4 text-muted-foreground" /> <span>{evento.cliente_nome}</span></div>
                       {evento.cliente_email && <div className="flex items-center gap-2"><Mail className="w-4 h-4 text-muted-foreground" /> <span>{evento.cliente_email}</span></div>}
                       {evento.cliente_telefone && <div className="flex items-center gap-2"><Phone className="w-4 h-4 text-muted-foreground" /> <span>{evento.cliente_telefone}</span></div>}
                     </>
                   ) : <p className="text-muted-foreground mt-2">Nenhum cliente vinculado.</p>}
                 </div>

                 <div className="space-y-1 text-sm pt-2">
                   <p className="font-semibold text-foreground mb-2">Responsável Legal</p>
                   <div className="flex items-center gap-2"><Users className="w-4 h-4 text-muted-foreground" /> <span>{evento.responsavel_nome || 'Não definido'}</span></div>
                   {evento.responsavel_cpf && <div className="flex items-center gap-2"><ShieldCheck className="w-4 h-4 text-muted-foreground" /> <span>{evento.responsavel_cpf}</span></div>}
                 </div>
              </CardContent>
           </Card>

           <Card>
              <CardHeader><CardTitle>Fornecedores</CardTitle></CardHeader>
              <CardContent>
                {fornecedores.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {fornecedores.map((f: Fornecedor, i: number) => (
                      <Badge key={i} variant="secondary" className="px-3 py-1 font-normal">
                        <span className="font-semibold mr-1">{f.nome}:</span> {f.contato}
                      </Badge>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">Nenhum fornecedor cadastrado.</p>
                )}
              </CardContent>
           </Card>
        </div>
      </div>
    </MainLayout>
  );
}
