import { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface StatsWidgetProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  trend?: string;
  trendUp?: boolean;
  gradient?: string;
  className?: string;
}

export function StatsWidget({
  label,
  value,
  icon: Icon,
  trend,
  trendUp,
  gradient = "from-[#8B1538] to-[#A61D3F]",
  className,
}: StatsWidgetProps) {
  return (
    <Card className={cn("group relative overflow-hidden border-0 shadow-sm transition-all hover:shadow-md", className)}>
      <div className={cn("absolute inset-0 bg-gradient-to-br opacity-5 group-hover:opacity-10 transition-opacity", gradient)} />
      <CardContent className="relative p-5">
        <div className="flex items-start justify-between">
          <div className={cn("rounded-xl bg-gradient-to-br p-2.5 text-white shadow-sm", gradient)}>
            <Icon className="h-5 w-5" />
          </div>
          {trend && (
            <div className={cn(
              "text-xs font-medium",
              trendUp ? "text-emerald-600" : "text-muted-foreground"
            )}>
              {trend}
            </div>
          )}
        </div>
        <div className="mt-4">
          <div className="text-2xl font-bold">{value}</div>
          <div className="text-xs font-medium text-muted-foreground">{label}</div>
        </div>
      </CardContent>
    </Card>
  );
}
