import { Evento } from "@/types/database";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { MapPin, Calendar, Trash2, Users } from "lucide-react";

interface EventCardProps {
  evento: Evento;
  onDelete?: (e: React.MouseEvent, id: string) => void;
}

export function EventCard({ evento, onDelete }: EventCardProps) {
  const statusColors: Record<string, string> = {
    planejamento: 'bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-950/50 dark:text-yellow-400',
    confirmado: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-400',
    em_andamento: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/50 dark:text-blue-400',
    finalizado: 'bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-900 dark:text-gray-400',
    cancelado: 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950/50 dark:text-red-400',
  };

  const tipoColors: Record<string, string> = {
    formatura: 'bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950/50 dark:text-indigo-300',
    corporativo: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/50 dark:text-blue-300',
    casamento: 'bg-green-50 text-green-700 border-green-200 dark:bg-green-950/50 dark:text-green-300',
    festa: 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/50 dark:text-rose-300',
    workshop: 'bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-950/50 dark:text-orange-300',
  };

  const iconsMap: Record<string, string> = {
    formatura: '🎓',
    corporativo: '🏢',
    casamento: '💍',
    festa: '🎉',
    workshop: '💡',
    conferencia: '🎙️',
    aniversario: '🎂',
    outro: '📌',
  };

  const ocupadas = evento.capacidade_maxima - evento.vagas_disponiveis;
  const pct = evento.capacidade_maxima > 0 ? Math.round((ocupadas / evento.capacidade_maxima) * 100) : 0;

  return (
    <Card className="hover:shadow-lg transition-all relative group bg-card/60 backdrop-blur-md border-white/5 hover:border-primary/40 overflow-hidden flex flex-col h-full">
      <CardHeader className="pb-3 flex-none border-b border-border/50">
        <div className="flex justify-between items-start mb-2">
          <Badge variant="outline" className={`capitalize font-semibold text-[10.5px] tracking-wide ${tipoColors[evento.tipo_evento] || 'bg-secondary'}`}>
            {iconsMap[evento.tipo_evento] || '📌'} {evento.tipo_evento}
          </Badge>
          {onDelete && (
            <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); onDelete(e, evento.id); }} className="text-muted-foreground hover:bg-destructive hover:text-white p-1.5 rounded-full transition-colors z-10">
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
        <CardTitle className="text-lg line-clamp-1 mb-1">{evento.nome}</CardTitle>
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <MapPin className="w-3.5 h-3.5 shrink-0"/> 
          <span className="line-clamp-1">{evento.local_nome} - {evento.cidade}</span>
        </div>
      </CardHeader>
      <CardContent className="pt-3 pb-3 flex-1 flex flex-col gap-2">
        <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground">
          <Calendar className="w-3.5 h-3.5 shrink-0"/> 
          <span>{format(new Date(evento.data_inicio), 'dd/MM/yyyy')} • {evento.horario_inicio} - {evento.horario_fim}</span>
        </div>
        <div className="mt-auto pt-2">
          <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
            <div className="flex items-center gap-1.5"><Users className="w-3.5 h-3.5"/> {ocupadas}/{evento.capacidade_maxima}</div>
          </div>
          <div className="h-1.5 w-full bg-secondary rounded-full overflow-hidden">
             <div className={`h-full rounded-full ${pct > 80 ? 'bg-emerald-500' : pct > 50 ? 'bg-blue-500' : 'bg-muted-foreground/50'}`} style={{ width: `${pct}%` }} />
          </div>
        </div>
      </CardContent>
      <CardFooter className="pt-0 pb-3 mt-auto">
        <Badge variant="outline" className={`relative pl-3 capitalize w-full justify-center ${statusColors[evento.status] || ''}`}>
          <span className="absolute left-3 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-current" />
          {evento.status.replace('_', ' ')}
        </Badge>
      </CardFooter>
    </Card>
  );
}
