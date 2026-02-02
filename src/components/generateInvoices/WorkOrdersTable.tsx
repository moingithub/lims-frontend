import { Label } from "../ui/label";
import { Checkbox } from "../ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import { WorkOrder } from "../../types/generateInvoices";
import { isoToUSDate } from "../../utils/dateUtils";
import { getCompanyNameById } from "../../services/generateInvoicesService";

interface WorkOrdersTableProps {
  orders: WorkOrder[];
  selectedOrders: number[];
  onOrderSelection: (orderId: number) => void;
  onSelectAll: () => void;
}

export function WorkOrdersTable({
  orders,
  selectedOrders,
  onOrderSelection,
  onSelectAll,
}: WorkOrdersTableProps) {
  if (orders.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label className="text-base">Uninvoiced Work Orders</Label>
        <div className="flex items-center gap-2">
          <Checkbox
            id="select-all"
            checked={selectedOrders.length === orders.length}
            onCheckedChange={onSelectAll}
          />
          <label htmlFor="select-all" className="text-sm cursor-pointer">
            Select All
          </label>
        </div>
      </div>

      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">Select</TableHead>
              <TableHead>Work Order #</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Company</TableHead>
              <TableHead className="text-right">Cylinders</TableHead>
              <TableHead className="text-right">Lines Total</TableHead>
              <TableHead className="text-right">Mileage</TableHead>
              <TableHead className="text-right">Misc</TableHead>
              <TableHead className="text-right">Hourly</TableHead>
              <TableHead className="text-right">Amount</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.map((order) => {
              const linesTotal = order.items.reduce(
                (sum, item) => sum + item.price,
                0
              );
              return (
                <TableRow key={order.id}>
                  <TableCell>
                    <Checkbox
                      checked={selectedOrders.includes(order.id)}
                      onCheckedChange={() => onOrderSelection(order.id)}
                    />
                  </TableCell>
                  <TableCell>{order.work_order_number}</TableCell>
                  <TableCell>{isoToUSDate(order.date)}</TableCell>
                  <TableCell>{getCompanyNameById(order.company_id)}</TableCell>
                  <TableCell className="text-right">
                    {order.cylinders}
                  </TableCell>
                  <TableCell className="text-right">
                    ${linesTotal.toFixed(2)}
                  </TableCell>
                  <TableCell className="text-right">
                    ${order.mileage_fee.toFixed(2)}
                  </TableCell>
                  <TableCell className="text-right">
                    ${order.miscellaneous_charges.toFixed(2)}
                  </TableCell>
                  <TableCell className="text-right">
                    ${order.hourly_fee.toFixed(2)}
                  </TableCell>
                  <TableCell className="text-right">
                    ${order.amount.toFixed(2)}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}