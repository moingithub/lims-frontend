import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { toast } from "sonner";
import { InvoicesFilters } from "../components/invoices/InvoicesFilters";
import { InvoicesTable } from "../components/invoices/InvoicesTable";
import { InvoiceDetailsDialog } from "../components/invoices/InvoiceDetailsDialog";
import { DeleteInvoiceDialog } from "../components/invoices/DeleteInvoiceDialog";
import { EditStatusDialog } from "../components/invoices/EditStatusDialog";
import {
  Invoice,
  LineItem,
  fetchInvoices,
  filterInvoices,
  getStatusBadgeClass,
  updateInvoicePaymentStatus,
  printInvoice,
  downloadInvoice,
} from "../services/invoicesService";

export function Invoices() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [invoiceToDelete, setInvoiceToDelete] = useState<Invoice | null>(null);
  const [lineItems] = useState<LineItem[]>([]);
  const [isEditStatusDialogOpen, setIsEditStatusDialogOpen] = useState(false);
  const [invoiceToEdit, setInvoiceToEdit] = useState<Invoice | null>(null);
  const [newPaymentStatus, setNewPaymentStatus] = useState("");
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchInvoices()
      .then(setInvoices)
      .catch(() => toast.error("Failed to load invoices"))
      .finally(() => setIsLoading(false));
  }, []);

  const filteredInvoices = filterInvoices(invoices, searchTerm, statusFilter);

  const handleViewInvoice = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setIsDialogOpen(true);
  };

  const handlePrintInvoice = async (invoice: Invoice) => {
    await printInvoice(invoice.invoice_number);
    toast.success(`Printing invoice ${invoice.invoice_number}...`);
  };

  const handleDownloadInvoice = async (invoice: Invoice) => {
    await downloadInvoice(invoice.invoice_number);
    toast.success(`Downloading invoice ${invoice.invoice_number}...`);
  };

  const handleDeleteInvoice = (invoice: Invoice) => {
    setInvoiceToDelete(invoice);
    setIsDeleteDialogOpen(true);
  };

  const confirmDeleteInvoice = async () => {
    if (invoiceToDelete) {
      setInvoices((prev) =>
        prev.filter((inv) => inv.id !== invoiceToDelete.id),
      );
      toast.success(
        `Invoice ${invoiceToDelete.invoice_number} deleted successfully`,
      );
      setIsDeleteDialogOpen(false);
      setInvoiceToDelete(null);
    }
  };

  const handleEditStatus = (invoice: Invoice) => {
    setInvoiceToEdit(invoice);
    setNewPaymentStatus(invoice.payment_status);
    setIsEditStatusDialogOpen(true);
  };

  const confirmEditStatus = async () => {
    if (invoiceToEdit) {
      try {
        await updateInvoicePaymentStatus(invoiceToEdit.id, newPaymentStatus);
        setInvoices((prev) =>
          prev.map((inv) =>
            inv.id === invoiceToEdit.id
              ? { ...inv, payment_status: newPaymentStatus }
              : inv,
          ),
        );
        toast.success(
          `Invoice ${invoiceToEdit.invoice_number} status updated to ${newPaymentStatus}`,
        );
        setIsEditStatusDialogOpen(false);
        setInvoiceToEdit(null);
      } catch (err) {
        toast.error(
          err instanceof Error
            ? err.message
            : "Failed to update invoice status",
        );
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Main Content */}
      <Card>
        <CardHeader>
          <CardTitle className="font-bold">Invoices</CardTitle>
        </CardHeader>
        <CardContent>
          <InvoicesFilters
            searchTerm={searchTerm}
            statusFilter={statusFilter}
            onSearchChange={setSearchTerm}
            onStatusChange={setStatusFilter}
          />

          {isLoading ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              Loading invoices...
            </p>
          ) : (
            <InvoicesTable
              invoices={filteredInvoices}
              onViewInvoice={handleViewInvoice}
              onEditStatus={handleEditStatus}
              onDeleteInvoice={handleDeleteInvoice}
              getStatusBadgeClass={getStatusBadgeClass}
            />
          )}

          <div className="mt-4 flex items-center justify-between text-sm text-muted-foreground">
            <p>
              Showing {filteredInvoices.length} of {invoices.length} invoices
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Invoice Details Dialog */}
      <InvoiceDetailsDialog
        open={isDialogOpen}
        invoice={selectedInvoice}
        lineItems={lineItems}
        onOpenChange={setIsDialogOpen}
        onPrint={handlePrintInvoice}
        onDownload={handleDownloadInvoice}
        getStatusBadgeClass={getStatusBadgeClass}
      />

      {/* Delete Invoice Dialog */}
      <DeleteInvoiceDialog
        open={isDeleteDialogOpen}
        invoice={invoiceToDelete}
        onOpenChange={setIsDeleteDialogOpen}
        onConfirm={confirmDeleteInvoice}
      />

      {/* Edit Status Dialog */}
      <EditStatusDialog
        open={isEditStatusDialogOpen}
        invoice={invoiceToEdit}
        newStatus={newPaymentStatus}
        onOpenChange={setIsEditStatusDialogOpen}
        onStatusChange={setNewPaymentStatus}
        onConfirm={confirmEditStatus}
      />
    </div>
  );
}
