import { Evento } from "@/types/database";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";

export function RecentEventsTable({ eventos }: { eventos: Evento[] }) {
  const router = useRouter();
  if (eventos.length === 0) return <div className="text-center py-6 text-muted-foreground">Nenhum evento recente</div>;

  const tipoColors: Record<string, string> = {
    formatura: 'bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950/50 dark:text-indigo-300',
    corporativo: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/50 dark:text-blue-300',
    casamento: 'bg-green-50 text-green-700 border-green-200 dark:bg-green-950/50 dark:text-green-300',
    festa: 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/50 dark:text-rose-300',
    workshop: 'bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-950/50 dark:text-orange-300',
  };

  const statusColors: Record<string, string> = {
    planejamento: 'bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-950/50 dark:text-yellow-400',
    confirmado: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-400',
    em_andamento: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/50 dark:text-blue-400',
    finalizado: 'bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-900 dark:text-gray-400',
    cancelado: 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950/50 dark:text-red-400',
  };

  return (
    <div className="overflow-x-auto rounded-lg border border-border bg-card shadow-sm">
      <table className="w-full text-sm text-left">
        <thead className="bg-muted/50 text-muted-foreground uppercase text-[11.5px] tracking-wider">
          <tr>
            <th className="px-5 py-3 font-semibold">Evento</th>
            <th className="px-5 py-3 font-semibold">Tipo</th>
            <th className="px-5 py-3 font-semibold">Data</th>
            <th className="px-5 py-3 font-semibold">Local</th>
            <th className="px-5 py-3 font-semibold">Participantes</th>
            <th className="px-5 py-3 font-semibold">Status</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {eventos.map(ev => {
            const ocupadas = ev.capacidade_maxima - ev.vagas_disponiveis;
            const pct = ev.capacidade_maxima > 0 ? Math.round((ocupadas / ev.capacidade_maxima) * 100) : 0;
            return (
              <tr key={ev.id} onClick={() => router.push(`/eventos/${ev.id}`)} className="bg-card hover:bg-muted/30 cursor-pointer transition-colors">
                <td className="px-5 py-3">
                  <div className="font-bold text-[13.5px] leading-tight">{ev.nome}</div>
                  <div className="text-[11.5px] text-muted-foreground mt-0.5">{ev.cliente_nome || 'Cliente não informado'}</div>
                </td>
                <td className="px-5 py-3">
                  <Badge variant="outline" className={`capitalize font-semibold text-[10.5px] tracking-wide ${tipoColors[ev.tipo_evento] || 'bg-secondary'}`}>
                    {ev.tipo_evento}
                  </Badge>
                </td>
                <td className="px-5 py-3 whitespace-nowrap text-[13.5px]">
                  {format(new Date(ev.data_inicio), "dd MMM yyyy", { locale: ptBR })}
                </td>
                <td className="px-5 py-3 text-[13.5px] truncate max-w-[180px]">
                  {ev.local_nome}
                </td>
                <td className="px-5 py-3">
                  <div className="flex items-center gap-2">
                    <div className="w-[60px] h-1.5 bg-secondary rounded-full overflow-hidden shrink-0">
                      <div className={`h-full rounded-full ${pct > 80 ? 'bg-emerald-500' : pct > 50 ? 'bg-blue-500' : 'bg-muted-foreground/50'}`} style={{ width: `${pct}%` }} />
                    </div>
                    <span className="text-xs text-muted-foreground whitespace-nowrap">{ocupadas}/{ev.capacidade_maxima}</span>
                  </div>
                </td>
                <td className="px-5 py-3 text-[13.5px]">
                  <Badge variant="outline" className={`relative pl-3 capitalize ${statusColors[ev.status] || ''}`}>
                    <span className="absolute left-1.5 top-1/2 -translate-y-1/2 w-1 h-1 rounded-full bg-current" />
                    {ev.status.replace('_', ' ')}
                  </Badge>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
