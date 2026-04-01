import { CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Area, AreaChart, ResponsiveContainer, XAxis, Tooltip, CartesianGrid } from "recharts";

interface OsPorMesChartProps {
  data: { name: string; ordens: number }[];
}

export function OsPorMesChart({ data }: OsPorMesChartProps) {
  return (
    <div className="glass-card col-span-1 lg:col-span-2 p-6 fade-up-4">
      <CardHeader className="flex flex-row items-center justify-between p-0 mb-8 select-none">
        <div className="flex flex-col space-y-1">
          <CardTitle className="font-syne text-lg font-bold text-foreground">Ordens de Serviço por Mês</CardTitle>
          <CardDescription className="text-xs text-muted-foreground">Distribuição de aberturas ao longo do ano</CardDescription>
        </div>
        <div className="flex gap-4 items-center">
             <div className="hidden sm:flex gap-4 items-center mr-4">
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-primary shadow-[0_0_6px_rgba(125,83,159,0.6)]" />
                    <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-widest font-mono">Ordens</span>
                </div>
            </div>
            <Select defaultValue={new Date().getFullYear().toString()}>
            <SelectTrigger className="w-[100px] h-9 text-xs bg-white/5 border-white/10 font-syne font-semibold rounded-lg focus:ring-primary/20 text-foreground">
                <SelectValue placeholder="Ano" />
            </SelectTrigger>
            <SelectContent className="bg-white dark:bg-zinc-950 border-border text-foreground font-dm">
                <SelectItem value="2026">2026</SelectItem>
                <SelectItem value="2025">2025</SelectItem>
            </SelectContent>
            </Select>
        </div>
      </CardHeader>
      
      <div className="h-[240px] w-full mt-4">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#7D539F" stopOpacity={0.25} />
                <stop offset="100%" stopColor="#7D539F" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} stroke="rgba(255,255,255,0.03)" strokeDasharray="3 3" />
            <XAxis 
              dataKey="name" 
              stroke="rgba(144, 144, 176, 0.4)" 
              fontSize={10} 
              tickLine={false} 
              axisLine={false} 
              dy={15}
              fontFamily="JetBrains Mono, monospace"
              letterSpacing="0.05em"
            />
            <Tooltip 
              cursor={{ stroke: 'rgba(125, 83, 159, 0.3)', strokeWidth: 1 }}
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  return (
                    <div className="bg-white/95 dark:bg-zinc-950/95 border border-primary/30 rounded-lg p-3 shadow-2xl backdrop-blur-md">
                      <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-mono mb-1">{payload[0].payload.name}</p>
                      <p className="text-base font-syne font-bold text-foreground">
                        {payload[0].value} <span className="text-[11px] font-normal text-primary/70 ml-1">Ordens</span>
                      </p>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Area 
              type="monotone" 
              dataKey="ordens" 
              stroke="#a886c5" 
              strokeWidth={2.5}
              fill="url(#areaGrad)"
              className="chart-line-draw"
              animationDuration={2000}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
