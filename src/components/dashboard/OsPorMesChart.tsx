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
                    <div className="w-2 h-2 rounded-full bg-[#8083ff] shadow-[0_0_6px_rgba(128,131,255,0.6)]" />
                    <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-widest font-mono">Ordens</span>
                </div>
            </div>
            <Select defaultValue={new Date().getFullYear().toString()}>
            <SelectTrigger className="w-[100px] h-9 text-xs bg-white/5 border-white/10 font-syne font-semibold rounded-lg focus:ring-primary/20">
                <SelectValue placeholder="Ano" />
            </SelectTrigger>
            <SelectContent className="bg-[#0d0f1e] border-white/10 text-white font-dm">
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
                <stop offset="0%" stopColor="#4a4bd7" stopOpacity={0.25} />
                <stop offset="100%" stopColor="#4a4bd7" stopOpacity={0} />
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
              cursor={{ stroke: 'rgba(74, 75, 215, 0.3)', strokeWidth: 1 }}
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  return (
                    <div className="bg-[#111328]/95 border border-primary/30 rounded-lg p-3 shadow-2xl backdrop-blur-md">
                      <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-mono mb-1">{payload[0].payload.name}</p>
                      <p className="text-base font-syne font-bold text-white">
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
              stroke="#8083ff" 
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
