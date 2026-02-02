import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { PackageCheck, PackageMinus, Sparkles, FlaskConical } from "lucide-react";
import { DashboardStat } from "../../services/dashboardService";

interface StatsCardsProps {
  stats: DashboardStat[];
}

export function StatsCards({ stats }: StatsCardsProps) {
  const getIcon = (color: string) => {
    const iconClass = "w-5 h-5";
    switch (color) {
      case "orange":
        return <PackageMinus className={`${iconClass} text-orange-600`} />;
      case "green":
        return <PackageCheck className={`${iconClass} text-green-600`} />;
      case "red":
        return <Sparkles className={`${iconClass} text-red-600`} />;
      case "blue":
        return <FlaskConical className={`${iconClass} text-blue-600`} />;
      default:
        return <FlaskConical className={iconClass} />;
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, index) => (
        <Card key={index} className="relative overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between pb-1 space-y-0">
            <CardTitle className="text-sm">{stat.title}</CardTitle>
            {getIcon(stat.color)}
          </CardHeader>
          <CardContent className="pb-3">
            <div className="text-2xl">{stat.value}</div>
          </CardContent>
          <div className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-${stat.color}-400 to-${stat.color}-600`} />
        </Card>
      ))}
    </div>
  );
}
