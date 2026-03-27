import { Evento } from "@/types/database";
import { format } from "date-fns";
import { MapPin, Calendar, Trash2, Users } from "lucide-react";

interface EventCardProps {
  evento: Evento;
  onDelete?: (e: React.MouseEvent, id: string) => void;
}

const statusConfig: Record<string, { label: string; dot: string; bg: string; text: string }> = {
  planejamento: { label: "Planejamento", dot: "bg-amber-400", bg: "bg-amber-50 dark:bg-amber-950/30", text: "text-amber-700 dark:text-amber-400" },
  confirmado:   { label: "Confirmado",   dot: "bg-emerald-400", bg: "bg-emerald-50 dark:bg-emerald-950/30", text: "text-emerald-700 dark:text-emerald-400" },
  em_andamento: { label: "Em andamento", dot: "bg-blue-400", bg: "bg-blue-50 dark:bg-blue-950/30", text: "text-blue-700 dark:text-blue-400" },
  finalizado:   { label: "Finalizado",   dot: "bg-gray-400", bg: "bg-gray-100 dark:bg-gray-800/50", text: "text-gray-600 dark:text-gray-400" },
  cancelado:    { label: "Cancelado",    dot: "bg-rose-400", bg: "bg-rose-50 dark:bg-rose-950/30", text: "text-rose-700 dark:text-rose-400" },
};

const tipoEmoji: Record<string, string> = {
  formatura: "🎓", corporativo: "🏢", casamento: "💍",
  festa: "🎉", workshop: "💡", conferencia: "🎙️",
  aniversario: "🎂", outro: "📌",
};

export function EventCard({ evento, onDelete }: EventCardProps) {
  const status = statusConfig[evento.status] || statusConfig.planejamento;
  const ocupadas = evento.capacidade_maxima - evento.vagas_disponiveis;
  const pct = evento.capacidade_maxima > 0 ? Math.round((ocupadas / evento.capacidade_maxima) * 100) : 0;

  return (
    <div className="card-premium group relative flex flex-col h-full rounded-xl border bg-card overflow-hidden transition-all hover:-translate-y-0.5 hover:shadow-lg"
      style={{ borderColor: "hsl(var(--border))" }}>
      {/* Faixa colorida no topo */}
      <div className="h-1 w-full gradient-brand shrink-0" />

      <div className="flex-1 flex flex-col p-4 gap-3">
        {/* Header */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="text-xl leading-none">{tipoEmoji[evento.tipo_evento] || "📌"}</span>
            <span className="text-xs font-semibold capitalize text-muted-foreground">{evento.tipo_evento}</span>
          </div>
          {onDelete && (
            <button
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); onDelete(e, evento.id); }}
              className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-all"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Nome */}
        <h3 className="font-bold text-foreground text-base leading-tight line-clamp-2">{evento.nome}</h3>

        {/* Localização */}
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <MapPin className="w-3.5 h-3.5 shrink-0 text-brown" />
          <span className="truncate">{evento.local_nome}{evento.cidade ? ` · ${evento.cidade}` : ""}</span>
        </div>

        {/* Data */}
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Calendar className="w-3.5 h-3.5 shrink-0" />
          <span>{format(new Date(evento.data_inicio), "dd/MM/yyyy")} · {evento.horario_inicio}{evento.horario_fim ? `–${evento.horario_fim}` : ""}</span>
        </div>

        {/* Ocupação */}
        <div className="mt-auto pt-1">
          <div className="flex items-center justify-between text-xs text-muted-foreground mb-1.5">
            <div className="flex items-center gap-1"><Users className="w-3.5 h-3.5" /> {ocupadas}/{evento.capacidade_maxima}</div>
            <span className="font-semibold">{pct}%</span>
          </div>
          <div className="h-1.5 w-full rounded-full overflow-hidden" style={{ background: "hsl(var(--muted))" }}>
            <div
              className="h-full rounded-full transition-all"
              style={{
                width: `${pct}%`,
                background: pct > 80
                  ? "hsl(152 58% 44%)"
                  : pct > 50
                  ? "hsl(var(--primary))"
                  : "hsl(var(--brown))",
              }}
            />
          </div>
        </div>

        {/* Status */}
        <div className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold ${status.bg} ${status.text}`}>
          <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${status.dot}`} />
          {status.label}
        </div>
      </div>
    </div>
  );
}
