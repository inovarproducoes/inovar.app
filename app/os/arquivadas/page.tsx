"use client";

import { useEffect, useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Archive, Search, FileText, Calendar, User, Building2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface ArchivedOS {
  id: string;
  numero: string | number;
  nome: string;
  descricao: string | null;
  status: string;
  aluno_nome: string | null;
  projeto_nome: string | null;
  instituicao: string | null;
  updated_at: string;
}

export default function ArchivedOSPage() {
  const [osList, setOsList] = useState<ArchivedOS[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const fetchArchivedOS = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/os/arquivadas");
      if (res.ok) {
        const data = await res.json();
        setOsList(data);
      }
    } catch (error) {
      console.error("Erro ao buscar OS arquivadas", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchArchivedOS();
  }, []);

  const filteredOS = osList.filter(os => 
    os.nome.toLowerCase().includes(search.toLowerCase()) || 
    (os.aluno_nome?.toLowerCase().includes(search.toLowerCase())) ||
    os.numero.toString().includes(search)
  );

  return (
    <MainLayout 
      title="Histórico de OS Arquivadas" 
      subtitle="Visualize todas as ordens de serviço que foram arquivadas do fluxo principal."
    >
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input 
              placeholder="Buscar por cliente, aluno ou número..." 
              className="pl-9 bg-muted/30 border-none" 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Archive className="w-4 h-4" />
            <span>{filteredOS.length} Ordens Arquivadas</span>
          </div>
        </div>

        <div className="bg-card border rounded-xl overflow-hidden shadow-sm">
          <Table>
            <TableHeader className="bg-muted/50">
              <TableRow>
                <TableHead className="w-[100px]">Número</TableHead>
                <TableHead>Cliente / Responsável</TableHead>
                <TableHead>Aluno / Projeto</TableHead>
                <TableHead>Instituição</TableHead>
                <TableHead>Arquivado em</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    {Array.from({ length: 6 }).map((_, j) => (
                      <TableCell key={j}><Skeleton className="h-6 w-full" /></TableCell>
                    ))}
                  </TableRow>
                ))
              ) : filteredOS.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-64 text-center">
                    <div className="flex flex-col items-center justify-center text-muted-foreground opacity-40">
                      <Archive className="w-12 h-12 mb-4" />
                      <p className="text-lg font-medium">Nenhuma OS arquivada encontrada</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredOS.map((os) => (
                  <TableRow key={os.id} className="hover:bg-muted/30 transition-colors">
                    <TableCell className="font-mono font-bold text-primary">
                      #{os.numero}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-bold text-foreground">{os.nome}</span>
                        <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">Cliente</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-1.5 text-sm">
                          <User className="w-3.5 h-3.5 text-muted-foreground" />
                          <span>{os.aluno_nome || "N/A"}</span>
                        </div>
                        {os.projeto_nome && (
                          <div className="flex items-center gap-1.5 text-xs text-muted-foreground italic">
                            <FileText className="w-3 h-3" />
                            <span>{os.projeto_nome}</span>
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Building2 className="w-4 h-4 text-muted-foreground/60" />
                        <span className="text-sm">{os.instituicao || "N/A"}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="w-3.5 h-3.5" />
                        {format(new Date(os.updated_at), "dd 'de' MMM, yyyy", { locale: ptBR })}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                       <Badge variant="secondary" className="px-3 py-1 bg-amber-500/10 text-amber-600 border-none">
                          Arquivado
                       </Badge>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </MainLayout>
  );
}
