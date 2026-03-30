import { OS } from "@prisma/client";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Badge } from "@/components/ui/badge";

export function RecentOsTable({ ordens }: { ordens: OS[] }) {
  if (ordens.length === 0) return <div className="text-center py-6 text-muted-foreground">Nenhuma Ordem de Serviço recente</div>;

  const statusColors: Record<string, string> = {
    pendente: 'bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-950/50 dark:text-yellow-400',
    aberto: 'bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-950/50 dark:text-yellow-400',
    aberta: 'bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-950/50 dark:text-yellow-400',
    abertas: 'bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-950/50 dark:text-yellow-400',
    nova: 'bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-950/50 dark:text-yellow-400',
    em_andamento: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/50 dark:text-blue-400',
    'em andamento': 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/50 dark:text-blue-400',
    atendimento: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/50 dark:text-blue-400',
    'em atendimento': 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/50 dark:text-blue-400',
    execucao: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/50 dark:text-blue-400',
    concluido: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-400',
    concluida: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-400',
    finalizado: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-400',
    finalizada: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-400',
    finalizadas: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-400',
    fechado: 'bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-900 dark:text-gray-400',
  };

  return (
    <div className="overflow-x-auto rounded-lg border border-border bg-card shadow-sm">
      <table className="w-full text-sm text-left">
        <thead className="bg-muted/50 text-muted-foreground uppercase text-[11.5px] tracking-wider">
          <tr>
            <th className="px-5 py-3 font-semibold">OS / Ticket</th>
            <th className="px-5 py-3 font-semibold">Número</th>
            <th className="px-5 py-3 font-semibold">Criado em</th>
            <th className="px-5 py-3 font-semibold">Responsável</th>
            <th className="px-5 py-3 font-semibold">Status</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {ordens.map((os) => (
            <tr key={os.id} className="bg-card hover:bg-muted/30 transition-colors">
              <td className="px-5 py-3">
                <div className="font-bold text-[13.5px] leading-tight">{os.nome}</div>
                <div className="text-[11.5px] text-muted-foreground mt-0.5 truncate max-w-[200px]">{os.descricao || 'Sem descrição'}</div>
              </td>
              <td className="px-5 py-3">
                <Badge variant="outline" className="font-mono text-[10.5px] tracking-wide bg-secondary">
                  {os.numero || 'S/N'}
                </Badge>
              </td>
              <td className="px-5 py-3 whitespace-nowrap text-[13.5px]">
                {format(new Date(os.created_at), "dd MMM yyyy", { locale: ptBR })}
              </td>
              <td className="px-5 py-3 text-[13.5px] truncate max-w-[150px]">
                {os.responsavel_nome || <span className="text-muted-foreground italic">Não atribuído</span>}
              </td>
              <td className="px-5 py-3 text-[13.5px]">
                <Badge variant="outline" className={`relative pl-3 capitalize ${statusColors[os.status.toLowerCase()] || 'bg-secondary'}`}>
                  <span className="absolute left-1.5 top-1/2 -translate-y-1/2 w-1 h-1 rounded-full bg-current" />
                  {os.status.replace(/_/g, ' ')}
                </Badge>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
