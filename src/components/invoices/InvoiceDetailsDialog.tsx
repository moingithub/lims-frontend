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
import { Invoice } from "../../services/invoicesService";

interface InvoiceDetailsDialogProps {
  open: boolean;
  invoice: Invoice | null;
  onOpenChange: (open: boolean) => void;
  onPrint: (invoice: Invoice) => void;
  onDownload: (invoice: Invoice) => void;
  getStatusBadgeClass: (status: string) => string;
}

export function InvoiceDetailsDialog({
  open,
  invoice,
  onOpenChange,
  onPrint,
  onDownload,
  getStatusBadgeClass,
}: InvoiceDetailsDialogProps) {
  if (!invoice) return null;

  const printInvoice = () => {
    window.print();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto print-invoice">
        <DialogHeader className="no-print">
          <DialogTitle>Invoice Details</DialogTitle>
          <DialogDescription>
            View complete invoice information including line items and financial
            summary.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Invoice Header */}
          <div className="print-header">
            <h1 className="text-3xl font-bold">INVOICE</h1>
            <p className="text-lg">{invoice.invoice_number}</p>
          </div>

          {/* Company and Invoice Info */}
          <div className="print-company-info print-invoice-details">
            <div>
              <h2 className="text-xl font-semibold mb-2">Bill To:</h2>
              <p className="font-medium">{invoice.company.name}</p>
              {invoice.location && <p>{invoice.location}</p>}
            </div>
            <div className="text-right">
              <div className="mb-2">
                <p className="text-sm text-muted-foreground">Invoice Date:</p>
                <p className="font-medium">
                  {isoToUSDate(invoice.invoice_date)}
                </p>
              </div>
              <div className="mb-2">
                <p className="text-sm text-muted-foreground">Service Period:</p>
                <p className="font-medium">
                  {isoToUSDate(invoice.service_start_date)} -{" "}
                  {isoToUSDate(invoice.service_end_date)}
                </p>
              </div>
              {invoice.po_number && (
                <div className="mb-2">
                  <p className="text-sm text-muted-foreground">PO Number:</p>
                  <p className="font-medium">{invoice.po_number}</p>
                </div>
              )}
              <div className="mb-2">
                <p className="text-sm text-muted-foreground">Status:</p>
                <Badge
                  className={`${getStatusBadgeClass(invoice.payment_status)} no-print`}
                  variant="outline"
                >
                  {invoice.payment_status}
                </Badge>
                <span className="print-only hidden">
                  {invoice.payment_status}
                </span>
              </div>
            </div>
          </div>

          <Separator />

          {/* Line Items */}
          <div>
            <h3 className="mb-3 text-lg font-semibold">Services</h3>
            <div className="border rounded-lg overflow-hidden">
              <Table className="print-table">
                <TableHeader>
                  <TableRow className="bg-gray-50">
                    <TableHead>Analysis #</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Service Date</TableHead>
                    <TableHead>Method</TableHead>
                    <TableHead className="text-right">Qty</TableHead>
                    <TableHead className="text-right">Unit Price</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {invoice.invoiceLines.map((line) => (
                    <TableRow key={line.id}>
                      <TableCell>{line.analysis_number}</TableCell>
                      <TableCell>{line.description}</TableCell>
                      <TableCell>{isoToUSDate(line.service_date)}</TableCell>
                      <TableCell>{line.analysis_method}</TableCell>
                      <TableCell className="text-right">
                        {line.quantity}
                      </TableCell>
                      <TableCell className="text-right">
                        ${parseFloat(line.unit_price).toFixed(2)}
                      </TableCell>
                      <TableCell className="text-right">
                        ${parseFloat(line.amount).toFixed(2)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>

          <Separator />

          {/* Financial Summary */}
          <div className="print-totals">
            <div className="space-y-2 max-w-xs ml-auto">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span>${parseFloat(invoice.subtotal).toFixed(2)}</span>
              </div>
              {parseFloat(invoice.hourly_fee) > 0 && (
                <div className="flex justify-between">
                  <span>Hourly Fee:</span>
                  <span>${parseFloat(invoice.hourly_fee).toFixed(2)}</span>
                </div>
              )}
              {parseFloat(invoice.mileage_fee) > 0 && (
                <div className="flex justify-between">
                  <span>
                    Mileage Fee ({invoice.miles} miles @ $
                    {invoice.rate_per_mile}/mile):
                  </span>
                  <span>${parseFloat(invoice.mileage_fee).toFixed(2)}</span>
                </div>
              )}
              {parseFloat(invoice.miscellaneous_charges) > 0 && (
                <div className="flex justify-between">
                  <span>Miscellaneous Charges:</span>
                  <span>
                    ${parseFloat(invoice.miscellaneous_charges).toFixed(2)}
                  </span>
                </div>
              )}
              {parseFloat(invoice.tax_amount) > 0 && (
                <div className="flex justify-between">
                  <span>Tax:</span>
                  <span>${parseFloat(invoice.tax_amount).toFixed(2)}</span>
                </div>
              )}
              <Separator />
              <div className="flex justify-between font-bold text-lg">
                <span>Total Amount:</span>
                <span>${parseFloat(invoice.total_amount).toFixed(2)}</span>
              </div>
            </div>
          </div>

          <div className="flex gap-2 justify-end pt-4 no-print">
            <Button variant="outline" onClick={printInvoice}>
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
