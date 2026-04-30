import { API_BASE_URL } from "../config/api";
import { authService } from "./authService";
import { downloadInvoicePdf } from "../components/invoices/Invoice";

export interface InvoiceListItem {
  id: number;
  invoice_number: string;
  invoice_date: string;
  company_name: string;
  amount: string;
  payment_status: string;
}

export interface Invoice {
  id: number;
  company_id: number;
  invoice_number: string;
  invoice_date: string;
  service_start_date: string;
  service_end_date: string;
  po_number: string;
  location: string;
  miles: string;
  rate_per_mile: string;
  mileage_fee: string;
  miscellaneous_charges: string;
  hourly_fee: string;
  subtotal: string;
  tax_amount: string;
  total_amount: string;
  status: string;
  payment_status: string;
  authorized_by: string | null;
  created_at: string;
  company: {
    id: number;
    name: string;
  };
  invoiceLines: InvoiceLine[];
}

export interface InvoiceLine {
  id: number;
  invoice_id: number;
  sample_checkin_id: number;
  analysis_number: string;
  description: string;
  service_date: string;
  report_number: string | null;
  analysis_method: string;
  quantity: string;
  unit_price: string;
  amount: string;
}

// API
export async function fetchInvoices(): Promise<InvoiceListItem[]> {
  const token = authService.getAuthState().token;
  const response = await fetch(`${API_BASE_URL}/invoices/list`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  if (!response.ok) {
    throw new Error("Failed to fetch invoices");
  }
  return response.json();
}

export async function fetchInvoiceById(id: number): Promise<Invoice> {
  const token = authService.getAuthState().token;
  const response = await fetch(`${API_BASE_URL}/invoices/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  if (!response.ok) {
    throw new Error("Failed to fetch invoice");
  }
  return response.json();
}

// Business logic
export function filterInvoices(
  invoices: InvoiceListItem[],
  searchTerm: string,
  statusFilter: string,
): InvoiceListItem[] {
  return invoices.filter((invoice) => {
    const matchesSearch =
      invoice.invoice_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.company_name.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "all" ||
      invoice.payment_status.toLowerCase() === statusFilter.toLowerCase();

    return matchesSearch && matchesStatus;
  });
}

export function getStatusBadgeClass(status: string): string {
  switch (status.toLowerCase()) {
    case "paid":
      return "bg-green-100 text-green-800";
    case "pending":
      return "bg-yellow-100 text-yellow-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
}

export async function updateInvoicePaymentStatus(
  id: number,
  paymentStatus: string,
): Promise<void> {
  const token = authService.getAuthState().token;
  const response = await fetch(
    `${API_BASE_URL}/invoices/${id}/payment-status`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ payment_status: paymentStatus }),
    },
  );
  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}));
    throw new Error(errorBody?.message || `Server error: ${response.status}`);
  }
}

export function printInvoice(invoiceId: string): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, 500));
}

export async function downloadInvoice(invoice: Invoice): Promise<void> {
  try {
    await downloadInvoicePdf(invoice);
  } catch (error) {
    console.error("Failed to generate PDF:", error);
    throw error;
  }
}
