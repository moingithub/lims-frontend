import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { Clock } from "lucide-react";
import { PendingWorkOrder, dashboardService } from "../../services/dashboardService";
import { formatDateTimeUS } from "../../utils/dateUtils";

interface PendingWorkOrdersCardProps {
  orders: PendingWorkOrder[];
}

export function PendingWorkOrdersCard({ orders }: PendingWorkOrdersCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="w-5 h-5" />
          Pending Work Orders - Priority Queue
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {orders.sort((a, b) => b.hours_in_queue - a.hours_in_queue).map((order) => {
            const priority = dashboardService.getPriorityColor(order.hours_in_queue);
            return (
              <div
                key={order.id}
                className={`flex items-center justify-between p-4 border rounded-lg ${priority.bg} ${priority.border} transition-all hover:shadow-md`}
              >
                <div className="flex-1 grid grid-cols-1 md:grid-cols-5 gap-4 items-center">
                  <div>
                    <p className="text-sm font-medium">{order.work_order_number}</p>
                    <p className="text-xs text-muted-foreground">{order.customer}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-muted-foreground">Analysis Type</p>
                    <p className="text-sm">{order.analysis_type}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-muted-foreground">Cylinders</p>
                    <p className="text-sm font-medium">{order.cylinders}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-muted-foreground">Received</p>
                    <p className="text-sm">{formatDateTimeUS(order.date_received)}</p>
                  </div>
                  <div className="flex items-center justify-end gap-3">
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground">Time in Queue</p>
                      <p className={`text-sm font-semibold ${priority.text}`}>
                        {dashboardService.formatQueueTime(order.hours_in_queue)}
                      </p>
                    </div>
                    <Badge className={priority.badge} variant="outline">
                      {priority.label}
                    </Badge>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        
        <div className="mt-6 pt-4 border-t">
          <div className="flex items-center justify-between">
            <div className="flex gap-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-green-500" />
                <span className="text-sm text-muted-foreground">Normal {"(<"} 24h)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-yellow-500" />
                <span className="text-sm text-muted-foreground">Attention (24-48h)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500" />
                <span className="text-sm text-muted-foreground">Urgent {"(>"} 48h)</span>
              </div>
            </div>
            <p className="text-sm font-medium">
              Total Pending: {orders.length} work orders
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}