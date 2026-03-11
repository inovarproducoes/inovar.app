import { Evento } from "@/types/database";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { MapPin, Calendar, Clock, Trash2 } from "lucide-react";

interface EventCardProps {
  evento: Evento;
  onDelete?: (e: React.MouseEvent, id: string) => void;
}

export function EventCard({ evento, onDelete }: EventCardProps) {
  const statusColors: Record<string, string> = {
    planejamento: "bg-blue-500",
    confirmado: "bg-success",
    em_andamento: "bg-warning",
    finalizado: "bg-gray-500",
    cancelado: "bg-destructive",
  };

  return (
    <Card className="hover:shadow-lg transition-all relative group bg-card/60 backdrop-blur-md border-white/5 hover:border-primary/40 overflow-hidden">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg line-clamp-1">{evento.nome}</CardTitle>
          <Badge className={`${statusColors[evento.status]} text-white`}>{evento.status}</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-2 text-sm text-muted-foreground">
        <div className="flex items-center gap-2"><MapPin className="w-4 h-4"/> <span className="line-clamp-1">{evento.local_nome}</span></div>
        <div className="flex items-center gap-2"><Calendar className="w-4 h-4"/> <span>{format(new Date(evento.data_inicio), 'dd/MM/yyyy')}</span></div>
        <div className="flex items-center gap-2"><Clock className="w-4 h-4"/> <span>{evento.horario_inicio}</span></div>
      </CardContent>
      {onDelete && (
        <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); onDelete(e, evento.id); }} className="absolute top-4 right-4 bg-destructive text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity z-10">
          <Trash2 className="w-4 h-4" />
        </button>
      )}
    </Card>
  );
}
