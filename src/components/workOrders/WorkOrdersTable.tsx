import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Eye, Pencil, Trash2, FileText, ClipboardCheck } from "lucide-react";
import {
  WorkOrderWithId,
  workOrdersService,
} from "../../services/workOrdersService";
import { isoToUSDate } from "../../utils/dateUtils";

interface WorkOrdersTableProps {
  orders: WorkOrderWithId[];
  onView: (order: WorkOrderWithId) => void;
  onEdit: (order: WorkOrderWithId) => void;
  onDelete: (order: WorkOrderWithId) => void;
  onSubmitOrder: (order: WorkOrderWithId) => void;
  onViewReport: (order: WorkOrderWithId) => void;
}

export function WorkOrdersTable({
  orders,
  onView,
  onEdit,
  onDelete,
  onSubmitOrder,
  onViewReport,
}: WorkOrdersTableProps) {
  // Group orders by work order id and count records for cylinders
  const groupedOrders = Object.values(
    orders.reduce(
      (acc, order) => {
        if (!acc[order.id]) {
          acc[order.id] = {
            ...order,
            cylinders: 1,
          };
        } else {
          acc[order.id].cylinders += 1;
        }
        return acc;
      },
      {} as Record<string, WorkOrderWithId & { cylinders: number }>,
    ),
  );

  return (
    <div className="border rounded-lg overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Work Order #</TableHead>
            <TableHead>Company</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Pending Since</TableHead>
            <TableHead>Cylinders</TableHead>
            <TableHead>Status</TableHead>
            <TableHead style={{ display: "none" }}>Company ID</TableHead>{" "}
            {/* Hidden column */}
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {groupedOrders.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={10}
                className="text-center text-muted-foreground py-8"
              >
                No records found
              </TableCell>
            </TableRow>
          ) : (
            groupedOrders.map((order) => {
              const daysPending =
                order.pending_since ??
                workOrdersService.calculateDaysSince(order.date);
              const pendingColor =
                workOrdersService.getPendingColor(daysPending);
              return (
                <TableRow
                  key={order.id}
                  className={`${pendingColor.bg} border-l-4 ${pendingColor.border}`}
                >
                  <TableCell>{order.id}</TableCell>
                  <TableCell>{order.customer}</TableCell>
                  <TableCell>{isoToUSDate(order.date)}</TableCell>
                  <TableCell>
                    <span className={`font-semibold ${pendingColor.text}`}>
                      {daysPending} days
                    </span>
                  </TableCell>
                  <TableCell>{order.cylinders ?? "-"}</TableCell>
                  <TableCell>
                    <Badge
                      className={workOrdersService.getStatusColor(order.status)}
                      variant="outline"
                    >
                      {order.status}
                    </Badge>
                  </TableCell>
                  <TableCell style={{ display: "none" }}>
                    {order.company_id}
                  </TableCell>{" "}
                  {/* Hidden column */}
                  <TableCell className="text-right">
                    <div className="flex gap-1 justify-end">
                      {/* View button hidden for now */}
                      {/* <Button
                        variant="ghost"
                        size="sm"
                        title="View"
                        onClick={() => onView(order)}
                      >
                        <Eye className="w-4 h-4 text-blue-600" />
                      </Button> */}
                      <Button
                        variant="ghost"
                        size="sm"
                        title="Edit Line Items"
                        onClick={() => onEdit(order)}
                        disabled={
                          order.status === "Invoiced" ||
                          order.status === "Completed" ||
                          order.status === "Submitted"
                        }
                      >
                        <Pencil
                          className={`w-4 h-4 ${
                            order.status === "Invoiced" ||
                            order.status === "Completed"
                              ? "text-gray-400"
                              : "text-purple-600"
                          }`}
                        />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        title="Delete"
                        onClick={() => onDelete(order)}
                        disabled={order.status !== "Pending"}
                      >
                        <Trash2
                          className={`w-4 h-4 ${
                            order.status !== "Pending"
                              ? "text-gray-400"
                              : "text-red-600"
                          }`}
                        />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        title="View Report"
                        onClick={() => onViewReport(order)}
                      >
                        <ClipboardCheck className="w-4 h-4 text-green-600" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        title="Submit"
                        disabled={
                          order.status === "Invoiced" ||
                          order.status === "Completed" ||
                          order.status === "Submitted"
                        }
                        onClick={() => onSubmitOrder(order)}
                      >
                        <FileText
                          className={`w-4 h-4 ${
                            order.status === "Invoiced" ||
                            order.status === "Completed" ||
                            order.status === "Submitted"
                              ? "text-gray-400"
                              : "text-emerald-600"
                          }`}
                        />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>
    </div>
  );
}
