import { type LucideIcon, TrendingUp, TrendingDown } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  description?: string;
  className?: string;
  accent?: "blue" | "purple" | "teal" | "red";
  trend?: {
    value: number;
    label: string;
    isPositive?: boolean;
  };
  sparkPath?: string;
  sparkColor?: string;
  sparkGradStart?: string;
}

const accentMap: Record<string, {
  cardClass: string;
  iconBg: string;
  iconColor: string;
  spark: string;
  sparkGrad: string;
}> = {
  blue: {
    cardClass: "card-brand",
    iconBg: "rgba(125,83,159,0.15)",
    iconColor: "#a886c5",
    spark: "#a886c5",
    sparkGrad: "rgba(125,83,159,0.3)",
  },
  purple: {
    cardClass: "card-purple",
    iconBg: "rgba(110,59,216,0.15)",
    iconColor: "#7D539F",
    spark: "#7D539F",
    sparkGrad: "rgba(110,59,216,0.3)",
  },
  teal: {
    cardClass: "card-teal",
    iconBg: "rgba(0,107,98,0.15)",
    iconColor: "#00b4a0",
    spark: "#00b4a0",
    sparkGrad: "rgba(0,107,98,0.3)",
  },
  red: {
    cardClass: "card-red",
    iconBg: "rgba(172,49,73,0.15)",
    iconColor: "#f76a80",
    spark: "#f76a80",
    sparkGrad: "rgba(172,49,73,0.3)",
  },
};

/* Default sparkline paths per accent */
const defaultPaths: Record<string, string> = {
  blue:   "M0,28 Q10,8 20,22 T40,18 T60,28 T80,12 T100,16",
  purple: "M0,18 Q20,28 40,12 T60,22 T80,8 T100,12",
  teal:   "M0,8 Q20,18 40,8 T60,18 T80,28 T100,22",
  red:    "M0,12 Q10,28 30,18 T50,22 T70,12 T100,32",
};

const defaultAreaPaths: Record<string, string> = {
  blue:   "M0,28 Q10,8 20,22 T40,18 T60,28 T80,12 T100,16 L100,36 L0,36 Z",
  purple: "M0,18 Q20,28 40,12 T60,22 T80,8 T100,12 L100,36 L0,36 Z",
  teal:   "M0,8 Q20,18 40,8 T60,18 T80,28 T100,22 L100,36 L0,36 Z",
  red:    "M0,12 Q10,28 30,18 T50,22 T70,12 T100,32 L100,36 L0,36 Z",
};

let _uid = 0;

export function StatCard({
  title, value, icon: Icon, description, className, accent = "blue", trend,
}: StatCardProps) {
  const a = accentMap[accent] ?? accentMap.blue;
  const id = `sg-${accent}-${_uid++}`;

  return (
    <div
      className={`kpi-card ${a.cardClass} fade-up ${className ?? ""}`}
      onMouseMove={(e) => {
        const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        (e.currentTarget as HTMLElement).style.background =
          `radial-gradient(circle at ${x}px ${y}px, rgba(125,83,159,0.07), rgba(13,15,30,0.85) 65%)`;
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLElement).style.background = "";
      }}
    >
      {/* Header row */}
      <div className="flex items-start justify-between mb-4 relative z-10">
        {/* Icon */}
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-transform duration-300 group-hover:scale-110"
          style={{
            background: a.iconBg,
            border: `1px solid ${a.iconColor}33`,
          }}
        >
          <Icon className="w-5 h-5 transition-all duration-300" style={{ color: a.iconColor, filter: `drop-shadow(0 0 5px ${a.iconColor}88)` }} />
        </div>

        {/* Badge */}
        {trend && (
          <span
            className="flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold font-mono"
            style={trend.isPositive !== false
              ? { background: "rgba(0,107,98,0.2)", color: "#00b4a0", border: "1px solid rgba(0,180,160,0.2)" }
              : { background: "rgba(172,49,73,0.2)", color: "#f76a80", border: "1px solid rgba(247,106,128,0.2)" }
            }
          >
            {trend.isPositive !== false
              ? <TrendingUp className="w-3 h-3" />
              : <TrendingDown className="w-3 h-3" />
            }
            {trend.value > 0 ? "+" : ""}{trend.value}%
          </span>
        )}
      </div>

      {/* Label + Value */}
      <div className="relative z-10">
        <p
          className="text-[11px] mb-1 uppercase tracking-wider"
          style={{ color: "rgba(144,144,176,0.8)" }}
        >
          {title}
        </p>
        <p
          className="font-dm font-black leading-none"
          style={{ fontSize: 26, color: "var(--text-primary)", letterSpacing: "-1px" }}
        >
          {value}
        </p>
        {description && (
          <p className="text-xs mt-1.5" style={{ color: "rgba(144,144,176,0.6)" }}>
            {description}
          </p>
        )}
        {trend && (
          <p className="text-xs mt-1" style={{ color: "rgba(144,144,176,0.55)" }}>
            {trend.label}
          </p>
        )}
      </div>

      {/* Sparkline */}
      <div className="mt-3 relative z-10">
        <svg viewBox="0 0 100 36" style={{ width: "100%", height: 36, overflow: "visible" }}>
          <defs>
            <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%"   stopColor={a.sparkGrad} stopOpacity="1" />
              <stop offset="100%" stopColor={a.sparkGrad} stopOpacity="0" />
            </linearGradient>
          </defs>
          <path d={defaultAreaPaths[accent]} fill={`url(#${id})`} />
          <path
            className="spark-path"
            d={defaultPaths[accent]}
            fill="none"
            stroke={a.spark}
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
      </div>
    </div>
  );
}
