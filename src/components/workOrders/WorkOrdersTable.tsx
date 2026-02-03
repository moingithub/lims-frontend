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
  onCreateInvoice: (order: WorkOrderWithId) => void;
  onViewReport: (order: WorkOrderWithId) => void;
}

export function WorkOrdersTable({
  orders,
  onView,
  onEdit,
  onDelete,
  onCreateInvoice,
  onViewReport,
}: WorkOrdersTableProps) {
  return (
    <div className="border rounded-lg overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Work Order #</TableHead>
            <TableHead>Company</TableHead>
            <TableHead>Well Name</TableHead>
            <TableHead>Meter #</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Pending Since</TableHead>
            <TableHead>Cylinders</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {orders.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={10}
                className="text-center text-muted-foreground py-8"
              >
                No records found
              </TableCell>
            </TableRow>
          ) : (
            orders.map((order) => {
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
                  <TableCell>{order.well_name || "-"}</TableCell>
                  <TableCell>{order.meter_number || "-"}</TableCell>
                  <TableCell>{isoToUSDate(order.date)}</TableCell>
                  <TableCell>
                    <span className={`font-semibold ${pendingColor.text}`}>
                      {daysPending} days
                    </span>
                  </TableCell>
                  <TableCell>{order.cylinders ?? "-"}</TableCell>
                  <TableCell>${order.amount.toFixed(2)}</TableCell>
                  <TableCell>
                    <Badge
                      className={workOrdersService.getStatusColor(order.status)}
                      variant="outline"
                    >
                      {order.status}
                    </Badge>
                  </TableCell>
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
                          order.status === "Completed"
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
                        title="Create Invoice"
                        disabled={
                          order.status === "Invoiced" ||
                          order.status === "Completed"
                        }
                        onClick={() => onCreateInvoice(order)}
                      >
                        <FileText
                          className={`w-4 h-4 ${
                            order.status === "Invoiced" ||
                            order.status === "Completed"
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
