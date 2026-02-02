import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "../ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import { Separator } from "../ui/separator";
import { Printer, Download } from "lucide-react";
import { isoToUSDate } from "../../utils/dateUtils";
import { Invoice, LineItem } from "../../services/invoicesService";

interface InvoiceDetailsDialogProps {
  open: boolean;
  invoice: Invoice | null;
  lineItems: LineItem[];
  onOpenChange: (open: boolean) => void;
  onPrint: (invoice: Invoice) => void;
  onDownload: (invoice: Invoice) => void;
  getStatusBadgeClass: (status: string) => string;
}

export function InvoiceDetailsDialog({
  open,
  invoice,
  lineItems,
  onOpenChange,
  onPrint,
  onDownload,
  getStatusBadgeClass,
}: InvoiceDetailsDialogProps) {
  if (!invoice) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Invoice Details</DialogTitle>
          <DialogDescription>
            View complete invoice information including line items and financial
            summary.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-6 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Invoice #</p>
              <p className="font-medium">{invoice.invoice_number}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Invoice Date</p>
              <p className="font-medium">{isoToUSDate(invoice.invoice_date)}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Work Order #</p>
              <p className="font-medium">{invoice.work_order_id}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Company</p>
              <p className="font-medium">{invoice.customer}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Well/Facility Name</p>
              <p className="font-medium">{invoice.well_name}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Payment Status</p>
              <Badge
                className={getStatusBadgeClass(invoice.payment_status)}
                variant="outline"
              >
                {invoice.payment_status}
              </Badge>
            </div>
          </div>

          <Separator />

          {/* Line Items Section */}
          <div>
            <h3 className="mb-3">Line Items</h3>
            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50">
                    <TableHead>#</TableHead>
                    <TableHead>Bottle #</TableHead>
                    <TableHead>Analysis Type</TableHead>
                    <TableHead>Well Name</TableHead>
                    <TableHead>Meter #</TableHead>
                    <TableHead className="text-right">Rate</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {lineItems.map((item, index) => (
                    <TableRow key={item.item_id}>
                      <TableCell>{index + 1}</TableCell>
                      <TableCell>{item.cylinder_number}</TableCell>
                      <TableCell>{item.analysis_type}</TableCell>
                      <TableCell>{item.well_name}</TableCell>
                      <TableCell>{item.meter_number}</TableCell>
                      <TableCell className="text-right">
                        ${item.rate.toFixed(2)}
                      </TableCell>
                      <TableCell className="text-right">
                        ${item.amount.toFixed(2)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>

          <Separator />

          {/* Financial Summary */}
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Subtotal</span>
              <span>{invoice.total_amount}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Mileage Fee</span>
              <span>{invoice.mileage_fee}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Miscellaneous Fee</span>
              <span>{invoice.miscellaneous_fee}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Hourly Fee</span>
              <span>{invoice.hourly_fee}</span>
            </div>
            <Separator />
            <div className="flex justify-between">
              <span>Grand Total</span>
              <span>{invoice.grand_total}</span>
            </div>
          </div>

          <div className="flex gap-2 justify-end pt-4">
            <Button variant="outline" onClick={() => onPrint(invoice)}>
              <Printer className="w-4 h-4 mr-2" />
              Print
            </Button>
            <Button onClick={() => onDownload(invoice)}>
              <Download className="w-4 h-4 mr-2" />
              Download PDF
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}