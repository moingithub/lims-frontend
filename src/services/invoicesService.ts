import { API_BASE_URL } from "../config/api";
import { authService } from "./authService";

export interface Invoice {
  id: number;
  invoice_number: string;
  invoice_date: string;
  company_name: string;
  amount: string;
  payment_status: string;
}

export interface LineItem {
  id: number;
  item_id: string;
  cylinder_number: string;
  analysis_type: string;
  well_name: string;
  meter_number: string;
  rate: number;
  tax: number;
  amount: number;
  created_by: number;
}

// API
export async function fetchInvoices(): Promise<Invoice[]> {
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

// Business logic
export function filterInvoices(
  invoices: Invoice[],
  searchTerm: string,
  statusFilter: string,
): Invoice[] {
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

export function downloadInvoice(invoiceId: string): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, 500));
}
