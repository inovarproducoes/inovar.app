import { type LucideIcon, TrendingUp, TrendingDown } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  description?: string;
  className?: string;
  accent?: "purple" | "brown" | "green" | "blue";
  trend?: {
    value: number;
    label: string;
    isPositive?: boolean;
  };
}

const accentStyles: Record<string, { icon: string; border: string; glow: string }> = {
  purple: {
    icon: "background: linear-gradient(135deg, hsl(var(--primary)), hsl(267 72% 45%)); color: white;",
    border: "border-color: hsl(var(--primary) / 0.3);",
    glow: "box-shadow: 0 4px 24px -4px hsl(var(--primary) / 0.15);",
  },
  brown: {
    icon: "background: linear-gradient(135deg, hsl(var(--brown)), hsl(24 60% 32%)); color: white;",
    border: "border-color: hsl(var(--brown) / 0.3);",
    glow: "box-shadow: 0 4px 24px -4px hsl(var(--brown) / 0.15);",
  },
  green: {
    icon: "background: linear-gradient(135deg, hsl(152 58% 40%), hsl(152 58% 30%)); color: white;",
    border: "border-color: hsl(152 58% 40% / 0.3);",
    glow: "box-shadow: 0 4px 24px -4px hsl(152 58% 40% / 0.15);",
  },
  blue: {
    icon: "background: linear-gradient(135deg, hsl(217 88% 58%), hsl(217 88% 45%)); color: white;",
    border: "border-color: hsl(217 88% 58% / 0.3);",
    glow: "box-shadow: 0 4px 24px -4px hsl(217 88% 58% / 0.15);",
  },
};

export function StatCard({ title, value, icon: Icon, description, className, accent = "purple", trend }: StatCardProps) {
  const styles = accentStyles[accent];

  return (
    <div
      className={`card-premium relative rounded-xl border bg-card p-5 transition-all hover:-translate-y-0.5 ${className || ""}`}
      style={{ ...(styles.border && { borderColor: styles.border.replace("border-color: ", "").replace(";", "") }), ...({ boxShadow: styles.glow.replace("box-shadow: ", "").replace(";", "") }) }}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">
            {title}
          </p>
          <p className="text-3xl font-black text-foreground leading-none">
            {value}
          </p>
          {trend ? (
            <div className="flex items-center gap-1.5 mt-2">
              {trend.isPositive !== false ? (
                <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
              ) : (
                <TrendingDown className="w-3.5 h-3.5 text-rose-500" />
              )}
              <span className={`text-xs font-bold ${trend.isPositive !== false ? "text-emerald-500" : "text-rose-500"}`}>
                {trend.value}%
              </span>
              <span className="text-xs text-muted-foreground">{trend.label}</span>
            </div>
          ) : description ? (
            <p className="text-xs text-muted-foreground mt-2">{description}</p>
          ) : null}
        </div>
        <div
          className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
          style={{ backgroundImage: styles.icon.split("background: ")[1]?.split(";")[0] }}
        >
          <Icon className="w-5 h-5 text-white" />
        </div>
      </div>
    </div>
  );
}
