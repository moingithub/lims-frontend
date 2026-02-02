import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Printer } from "lucide-react";
import { PendingOrder, pendingOrdersService } from "../../services/pendingOrdersService";
import { isoToUSDate } from "../../utils/dateUtils";

interface PendingOrdersTableProps {
  orders: PendingOrder[];
  onPrintOrder?: (order: PendingOrder) => void;
}

export function PendingOrdersTable({ orders, onPrintOrder }: PendingOrdersTableProps) {
  return (
    <div className="border rounded-lg overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Work Order #</TableHead>
            <TableHead>Company</TableHead>
            <TableHead>Cylinders</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Days Pending</TableHead>
            <TableHead>Priority</TableHead>
            <TableHead className="text-center">Print</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {orders.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                No records found
              </TableCell>
            </TableRow>
          ) : (
            orders.map((order) => (
              <TableRow key={order.work_order_id}>
                <TableCell>{order.work_order_id}</TableCell>
                <TableCell>{order.customer}</TableCell>
                <TableCell>{order.cylinders}</TableCell>
                <TableCell>{isoToUSDate(order.date)}</TableCell>
                <TableCell>{order.days_pending}</TableCell>
                <TableCell>
                  <Badge className={pendingOrdersService.getPriorityBadgeVariant(order.priority)}>
                    {order.priority}
                  </Badge>
                </TableCell>
                <TableCell className="text-center">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onPrintOrder?.(order)}
                  >
                    <Printer className="w-4 h-4 text-blue-600" />
                  </Button>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}