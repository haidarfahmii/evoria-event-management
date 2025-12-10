import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { IconType } from "react-icons";

interface StatCardProps {
  title: string;
  value: string;
  description: string;
  icon: IconType;
  trend?: string; // e.g., "+12% from last month"
}

export function StatCard({
  title,
  value,
  description,
  icon: Icon,
  trend,
}: StatCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-slate-600">
          {title}
        </CardTitle>
        <Icon className="h-4 w-4 text-slate-400" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-slate-800">{value}</div>
        <p className="text-xs text-slate-500 mt-1">
          {trend && (
            <span className="text-green-500 font-medium mr-1">{trend}</span>
          )}
          {description}
        </p>
      </CardContent>
    </Card>
  );
}
