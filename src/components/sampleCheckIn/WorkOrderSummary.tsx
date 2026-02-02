import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { FileCheck } from "lucide-react";

interface WorkOrderSummaryProps {
  workOrderNumber: string;
  currentCustomer: string;
  totalMonthlyCount: number;
  monthlyCustomerCylinders: number;
  currentCylindersCount: number;
  onViewWorkOrder: () => void;
}

export function WorkOrderSummary({
  workOrderNumber,
  currentCustomer,
  totalMonthlyCount,
  monthlyCustomerCylinders,
  currentCylindersCount,
  onViewWorkOrder,
}: WorkOrderSummaryProps) {
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Work Order Summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {workOrderNumber && (
            <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-sm">Work Order Number</p>
              <p className="text-lg">{workOrderNumber}</p>
            </div>
          )}

          {/* Monthly Analysis Count for Current Customer */}
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-muted-foreground">
              Monthly Analyses ({currentCustomer})
            </p>
            <div className="flex items-baseline gap-2">
              <p className="text-xl">{totalMonthlyCount}</p>
              <p className="text-sm text-muted-foreground">
                ({monthlyCustomerCylinders} previous + {currentCylindersCount}{" "}
                current)
              </p>
            </div>
            {totalMonthlyCount >= 50 && (
              <div className="mt-2 flex items-center gap-2">
                <Badge className="bg-green-600">5% Discount Applied</Badge>
                <p className="text-xs text-muted-foreground">
                  50+ analyses this month
                </p>
              </div>
            )}
            {totalMonthlyCount < 50 && (
              <p className="text-xs text-muted-foreground mt-1">
                {50 - totalMonthlyCount} more for 5% discount
              </p>
            )}
          </div>

          <div>
            <p className="text-sm text-muted-foreground">Total Cylinders</p>
            <p className="text-2xl">{currentCylindersCount}</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <Button
            variant="outline"
            className="w-full justify-start"
            onClick={onViewWorkOrder}
            disabled={!workOrderNumber}
          >
            <FileCheck className="w-4 h-4 mr-2" />
            View Work Order
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
