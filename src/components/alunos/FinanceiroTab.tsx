"use client";
import React from "react";
import { useQuery } from "@tanstack/react-query";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Receipt } from "lucide-react";

interface Parcela {
  id: string;
  numero_projeto: string;
  descricao_projeto: string;
  valor: number;
  valor_original: number;
  multa: number;
  juros: number;
  valor_pago: number;
  data_vencimento: string;
  data_pagamento: string | null;
  status: string;
  url_pix: string | null;
  url_boleto: string | null;
  linha_digitavel: string | null;
}

export function FinanceiroTab({ alunoId }: { alunoId: string }) {
  const { data: parcelas, isLoading, error } = useQuery<Parcela[]>({
    queryKey: ["aluno-financeiro", alunoId],
    queryFn: async () => {
      const res = await fetch(`/api/alunos/${alunoId}/financeiro`);
      if (!res.ok) throw new Error("Erro ao carregar dados financeiros");
      return res.json();
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-12 w-full" />
        ))}
      </div>
    );
  }

  if (error) {
    return <div className="p-4 text-center text-destructive">Erro ao carregar dados financeiros.</div>;
  }

  if (!parcelas || parcelas.length === 0) {
    return <div className="p-8 text-center text-muted-foreground">Nenhuma parcela financeira encontrada para este aluno.</div>;
  }

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(val);
  };

  const formatDate = (dateStr: string) => {
    try {
      return format(new Date(dateStr), "dd/MM/yyyy", { locale: ptBR });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Vencimento</TableHead>
            <TableHead>Descrição/Projeto</TableHead>
            <TableHead>Valor</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Links</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {parcelas.map((parcela) => (
            <TableRow key={parcela.id}>
              <TableCell className="font-medium text-xs">
                {formatDate(parcela.data_vencimento)}
              </TableCell>
              <TableCell>
                <div className="flex flex-col">
                  <span className="text-[11px] font-bold text-muted-foreground uppercase">{parcela.numero_projeto}</span>
                  <span className="text-xs truncate max-w-[200px]">{parcela.descricao_projeto}</span>
                </div>
              </TableCell>
              <TableCell>
                <div className="flex flex-col">
                  <span className="text-xs font-bold">{formatCurrency(parcela.valor)}</span>
                  {parcela.valor_pago > 0 && <span className="text-[10px] text-success">Pago: {formatCurrency(parcela.valor_pago)}</span>}
                </div>
              </TableCell>
              <TableCell>
                <Badge 
                  variant="outline" 
                  className={`text-[10px] px-1.5 h-5 capitalize ${
                    parcela.status === "pago" 
                      ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-400" 
                      : "bg-secondary text-muted-foreground"
                  }`}
                >
                  {parcela.status}
                </Badge>
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-1">
                  {parcela.url_pix && (
                    <a href={parcela.url_pix} target="_blank" rel="noreferrer" title="Ver PIX">
                      <Badge variant="outline" className="h-6 w-6 p-0 flex items-center justify-center hover:bg-muted truncate">
                         P
                      </Badge>
                    </a>
                  )}
                  {parcela.url_boleto && (
                    <a href={parcela.url_boleto} target="_blank" rel="noreferrer" title="Ver Boleto">
                      <Badge variant="outline" className="h-6 w-6 p-0 flex items-center justify-center hover:bg-muted">
                        <Receipt className="h-3 w-3 text-muted-foreground" />
                      </Badge>
                    </a>
                  )}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
