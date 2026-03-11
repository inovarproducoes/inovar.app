import { Evento } from "@/types/database";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export function RecentEventsTable({ eventos }: { eventos: Evento[] }) {
  if (eventos.length === 0) return <div className="text-center py-6 text-muted-foreground">Nenhum evento recente</div>;

  return (
    <div className="overflow-x-auto rounded-lg border border-border">
      <table className="w-full text-sm text-left">
        <thead className="bg-muted text-muted-foreground uppercase">
          <tr>
            <th className="px-6 py-3">Nome</th>
            <th className="px-6 py-3">Data</th>
            <th className="px-6 py-3">Local</th>
            <th className="px-6 py-3">Status</th>
          </tr>
        </thead>
        <tbody>
          {eventos.map(ev => (
            <tr key={ev.id} className="bg-card border-b hover:bg-muted/50">
              <td className="px-6 py-4 font-medium">{ev.nome}</td>
              <td className="px-6 py-4">{format(new Date(ev.data_inicio), "dd 'de' MMMM", { locale: ptBR })}</td>
              <td className="px-6 py-4 truncate max-w-[200px]">{ev.local_nome}</td>
              <td className="px-6 py-4">
                <span className={`px-2 py-1 rounded-full text-xs font-semibold
                  ${ev.status === 'planejamento' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300' : ''}
                  ${ev.status === 'confirmado' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' : ''}
                  ${ev.status === 'em_andamento' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300' : ''}
                  ${ev.status === 'finalizado' ? 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300' : ''}
                  ${ev.status === 'cancelado' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300' : ''}
                `}>
                  {ev.status}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
