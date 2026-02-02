import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import { Eye, Trash2, Edit } from "lucide-react";
import { isoToUSDate } from "../../utils/dateUtils";
import { Invoice } from "../../services/invoicesService";

interface InvoicesTableProps {
  invoices: Invoice[];
  onViewInvoice: (invoice: Invoice) => void;
  onEditStatus: (invoice: Invoice) => void;
  onDeleteInvoice: (invoice: Invoice) => void;
  getStatusBadgeClass: (status: string) => string;
}

export function InvoicesTable({
  invoices,
  onViewInvoice,
  onEditStatus,
  onDeleteInvoice,
  getStatusBadgeClass,
}: InvoicesTableProps) {
  return (
    <div className="border rounded-lg overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead>Company</TableHead>
            <TableHead>Work Order #</TableHead>
            <TableHead>Invoice #</TableHead>
            <TableHead>Well/Facility Name</TableHead>
            <TableHead className="text-right">Amount</TableHead>
            <TableHead>Payment Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {invoices.map((invoice) => (
            <TableRow key={invoice.invoice_number}>
              <TableCell>{isoToUSDate(invoice.invoice_date)}</TableCell>
              <TableCell>{invoice.customer}</TableCell>
              <TableCell>{invoice.work_order_id}</TableCell>
              <TableCell>{invoice.invoice_number}</TableCell>
              <TableCell>{invoice.well_name}</TableCell>
              <TableCell className="text-right">
                {invoice.total_amount}
              </TableCell>
              <TableCell>
                <Badge
                  className={getStatusBadgeClass(invoice.payment_status)}
                  variant="outline"
                >
                  {invoice.payment_status}
                </Badge>
              </TableCell>
              <TableCell className="text-right">
                <div className="flex gap-1 justify-end">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onViewInvoice(invoice)}
                  >
                    <Eye className="w-4 h-4 text-blue-600" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onEditStatus(invoice)}
                  >
                    <Edit className="w-4 h-4 text-green-600" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onDeleteInvoice(invoice)}
                    disabled={invoice.payment_status === "Paid"}
                  >
                    <Trash2
                      className={`w-4 h-4 ${
                        invoice.payment_status === "Paid"
                          ? "text-gray-400"
                          : "text-red-600"
                      }`}
                    />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}