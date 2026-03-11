import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { type LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  description?: string;
  className?: string;
  trend?: {
    value: number;
    label: string;
    isPositive?: boolean;
  };
}

export function StatCard({ title, value, icon: Icon, description, className, trend }: StatCardProps) {
  return (
    <Card className={`bg-card/60 backdrop-blur-xl border-white/5 shadow-sm hover:border-primary/30 transition-colors ${className || ''}`}>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        <Icon className="w-4 h-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {trend ? (
          <div className="flex items-center gap-1 text-xs font-semibold mt-1">
            <span className={trend.isPositive !== false ? "text-emerald-500" : "text-rose-500"}>
              {trend.isPositive !== false ? "▲" : "▼"} {trend.value}%
            </span>
            <span className="text-muted-foreground font-normal">{trend.label}</span>
          </div>
        ) : description ? (
          <p className="text-xs text-muted-foreground mt-1">{description}</p>
        ) : null}
      </CardContent>
    </Card>
  );
}
