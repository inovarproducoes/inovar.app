import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

interface DistribuicaoPorTipoProps {
  data: { tipo: string; percentual: number; count: number }[];
}

export function DistribuicaoPorTipo({ data }: DistribuicaoPorTipoProps) {
  // Let's create a visual mapping for event types (similar to the HTML)
  const colorsMap: Record<string, string> = {
    formatura: 'bg-indigo-500',
    corporativo: 'bg-blue-600',
    casamento: 'bg-green-600',
    festa: 'bg-rose-500',
    workshop: 'bg-orange-500',
    conferencia: 'bg-cyan-500',
    aniversario: 'bg-fuchsia-500',
    outro: 'bg-yellow-500',
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

  const labelsMap: Record<string, string> = {
    formatura: 'Formatura',
    corporativo: 'Corporativo',
    casamento: 'Casamento',
    festa: 'Festa',
    workshop: 'Workshop',
    conferencia: 'Conferência',
    aniversario: 'Aniversário',
    outro: 'Outros',
  };

  return (
    <Card className="col-span-1 shadow-sm border-white/5 bg-card/60 backdrop-blur-xl">
      <CardHeader className="flex flex-col space-y-1 pb-4">
        <CardTitle className="text-base font-bold">Por Tipo</CardTitle>
        <CardDescription className="text-xs">Distribuição geral</CardDescription>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <div className="text-sm text-muted-foreground text-center py-8">
            Nenhum evento registrado.
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {data.slice(0, 4).map((item, idx) => (
              <div key={idx} className="flex flex-col space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-semibold">{iconsMap[item.tipo] || '📌'} {labelsMap[item.tipo] || item.tipo}</span>
                  <span className="text-muted-foreground">{item.percentual}%</span>
                </div>
                {/* Custom progress bar so we can easily inject Tailwind specific colors */}
                <div className="h-1.5 w-full bg-secondary rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full ${colorsMap[item.tipo] || 'bg-primary'}`} 
                    style={{ width: `${item.percentual}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
