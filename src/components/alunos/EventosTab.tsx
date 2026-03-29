"use client";
import React from "react";
import { useQuery } from "@tanstack/react-query";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Calendar, MapPin } from "lucide-react";

interface Evento {
  id: string;
  nome: string;
  instituicao: string | null;
  data_inicio: string;
  local_nome: string;
  status: string;
}

interface EventoAluno {
  id: string;
  evento_id: string;
  status_participacao: string;
  evento: Evento;
}

export function EventosTab({ alunoId }: { alunoId: string }) {
  const { data: vinculos, isLoading, error } = useQuery<EventoAluno[]>({
    queryKey: ["aluno-eventos", alunoId],
    queryFn: async () => {
      const res = await fetch(`/api/evento-alunos?aluno_id=${alunoId}`);
      if (!res.ok) throw new Error("Erro ao carregar eventos do aluno");
      return res.json();
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2].map((i) => (
          <Skeleton key={i} className="h-16 w-full" />
        ))}
      </div>
    );
  }

  if (error) {
    return <div className="p-4 text-center text-destructive text-sm font-medium">Erro ao carregar eventos.</div>;
  }

  if (!vinculos || vinculos.length === 0) {
    return (
      <div className="py-12 flex flex-col items-center justify-center text-muted-foreground bg-muted/20 rounded-lg border border-dashed">
        <Calendar className="h-8 w-8 mb-2 opacity-20" />
        <p className="text-sm">Nenhum evento vinculado a este aluno.</p>
      </div>
    );
  }

  const formatDate = (dateStr: string) => {
    try {
      return format(new Date(dateStr), "dd 'de' MMMM, yyyy", { locale: ptBR });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="rounded-md border bg-card">
      <Table>
        <TableHeader className="bg-muted/50">
          <TableRow>
            <TableHead className="w-[40%] font-bold text-xs">Evento</TableHead>
            <TableHead className="font-bold text-xs">Data e Local</TableHead>
            <TableHead className="font-bold text-xs">Participação</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {vinculos.map((v) => (
            <TableRow key={v.id} className="hover:bg-muted/30">
              <TableCell>
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold text-primary uppercase tracking-wider">{v.evento.instituicao || "Geral"}</span>
                  <span className="text-sm font-semibold text-foreground leading-tight">{v.evento.nome}</span>
                </div>
              </TableCell>
              <TableCell>
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Calendar className="h-3 w-3" />
                    <span>{formatDate(v.evento.data_inicio)}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <MapPin className="h-3 w-3" />
                    <span>{v.evento.local_nome}</span>
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <Badge 
                  variant="outline" 
                  className={`text-[10px] px-2 h-5 capitalize font-bold ${
                    v.status_participacao === "confirmado" 
                      ? "bg-emerald-50 text-emerald-700 border-emerald-200" 
                      : "bg-amber-50 text-amber-700 border-amber-200"
                  }`}
                >
                  {v.status_participacao}
                </Badge>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
