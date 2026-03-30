import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Bar, BarChart, ResponsiveContainer, XAxis, Tooltip } from "recharts";

interface OsPorMesChartProps {
  data: { name: string; ordens: number }[];
}

export function OsPorMesChart({ data }: OsPorMesChartProps) {
  return (
    <Card className="col-span-1 lg:col-span-2 shadow-sm border-white/5 bg-card/60 backdrop-blur-xl">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div className="flex flex-col space-y-1">
          <CardTitle className="text-base font-bold">Ordens de Serviço por Mês</CardTitle>
          <CardDescription className="text-xs">Distribuição de aberturas ao longo do ano</CardDescription>
        </div>
        <Select defaultValue={new Date().getFullYear().toString()}>
          <SelectTrigger className="w-[100px] h-8 text-xs">
            <SelectValue placeholder="Ano" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="2026">2026</SelectItem>
            <SelectItem value="2025">2025</SelectItem>
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent>
        <div className="h-[200px] mt-4">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
              <Tooltip 
                cursor={{ fill: 'rgba(255, 255, 255, 0.05)' }} 
                contentStyle={{ backgroundColor: 'var(--card)', borderRadius: '8px', border: '1px solid var(--border)', fontSize: '12px' }}
              />
              <XAxis 
                dataKey="name" 
                stroke="#888888" 
                fontSize={11} 
                tickLine={false} 
                axisLine={false} 
                dy={10}
              />
              <Bar 
                dataKey="ordens" 
                fill="hsl(var(--primary))" 
                radius={[4, 4, 0, 0]} 
                className="fill-primary/80 hover:fill-primary transition-all duration-300"
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
