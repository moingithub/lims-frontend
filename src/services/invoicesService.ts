export interface Invoice {
  id: number;
  invoice_number: string;
  invoice_date: string;
  work_order_id: string;
  customer: string;
  well_name: string;
  total_amount: string;
  tax_amount: string;
  grand_total: string;
  payment_status: string;
  due_date: string;
  mileage_fee: string;
  miscellaneous_fee: string;
  hourly_fee: string;
  created_by: number;
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

// Mock data
export const mockInvoices: Invoice[] = [
  {
    id: 1,
    invoice_number: "INV-2025-001",
    invoice_date: "2025-11-01",
    work_order_id: "WO-2025-001",
    customer: "Acme Corporation",
    well_name: "Well A-1",
    total_amount: "$2,450.00",
    tax_amount: "$245.00",
    grand_total: "$2,695.00",
    payment_status: "Paid",
    due_date: "2025-11-15",
    mileage_fee: "$50.00",
    miscellaneous_fee: "$20.00",
    hourly_fee: "$100.00",
    created_by: 1,
  },
  {
    id: 2,
    invoice_number: "INV-2025-002",
    invoice_date: "2025-11-02",
    work_order_id: "WO-2025-002",
    customer: "Tech Industries Ltd",
    well_name: "Multiple Wells",
    total_amount: "$3,200.00",
    tax_amount: "$320.00",
    grand_total: "$3,520.00",
    payment_status: "Pending",
    due_date: "2025-11-16",
    mileage_fee: "$50.00",
    miscellaneous_fee: "$20.00",
    hourly_fee: "$100.00",
    created_by: 2,
  },
  {
    id: 3,
    invoice_number: "INV-2025-003",
    invoice_date: "2025-11-03",
    work_order_id: "WO-2025-003",
    customer: "Global Energy Solutions",
    well_name: "Well C-5",
    total_amount: "$1,850.00",
    tax_amount: "$185.00",
    grand_total: "$2,035.00",
    payment_status: "Pending",
    due_date: "2025-11-03",
    mileage_fee: "$50.00",
    miscellaneous_fee: "$20.00",
    hourly_fee: "$100.00",
    created_by: 3,
  },
  {
    id: 4,
    invoice_number: "INV-2025-004",
    invoice_date: "2025-11-04",
    work_order_id: "WO-2025-004",
    customer: "Industrial Gas Co",
    well_name: "Well D-7",
    total_amount: "$4,100.00",
    tax_amount: "$410.00",
    grand_total: "$4,510.00",
    payment_status: "Paid",
    due_date: "2025-11-18",
    mileage_fee: "$50.00",
    miscellaneous_fee: "$20.00",
    hourly_fee: "$100.00",
    created_by: 4,
  },
  {
    id: 5,
    invoice_number: "INV-2025-005",
    invoice_date: "2025-11-04",
    work_order_id: "WO-2025-005",
    customer: "Chemical Research Inc",
    well_name: "Multiple Wells",
    total_amount: "$2,900.00",
    tax_amount: "$290.00",
    grand_total: "$3,190.00",
    payment_status: "Pending",
    due_date: "2025-11-18",
    mileage_fee: "$50.00",
    miscellaneous_fee: "$20.00",
    hourly_fee: "$100.00",
    created_by: 5,
  },
];

export const mockLineItems: LineItem[] = [
  {
    id: 1,
    item_id: "1",
    cylinder_number: "BTL-001",
    analysis_type: "Gas Analysis",
    well_name: "Well A-1",
    meter_number: "MTR-101",
    rate: 150.0,
    tax: 15.0,
    amount: 165.0,
    created_by: 1,
  },
  {
    id: 2,
    item_id: "2",
    cylinder_number: "BTL-002",
    analysis_type: "BTU Analysis",
    well_name: "Well A-2",
    meter_number: "MTR-102",
    rate: 200.0,
    tax: 20.0,
    amount: 220.0,
    created_by: 2,
  },
  {
    id: 3,
    item_id: "3",
    cylinder_number: "BTL-003",
    analysis_type: "Gas Analysis",
    well_name: "Well A-3",
    meter_number: "MTR-103",
    rate: 150.0,
    tax: 15.0,
    amount: 165.0,
    created_by: 3,
  },
];

// Business logic
export function filterInvoices(
  invoices: Invoice[],
  searchTerm: string,
  statusFilter: string
): Invoice[] {
  return invoices.filter((invoice) => {
    const matchesSearch =
      invoice.invoice_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.work_order_id.toLowerCase().includes(searchTerm.toLowerCase());

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

export function calculateTotalAmount(invoices: Invoice[]): number {
  return invoices.reduce((sum, inv) => {
    return sum + parseFloat(inv.grand_total.replace(/[$,]/g, ""));
  }, 0);
}

export function calculatePaidAmount(invoices: Invoice[]): number {
  return invoices
    .filter((inv) => inv.payment_status === "Paid")
    .reduce((sum, inv) => {
      return sum + parseFloat(inv.grand_total.replace(/[$,]/g, ""));
    }, 0);
}

export function calculatePendingAmount(
  totalAmount: number,
  paidAmount: number
): number {
  return totalAmount - paidAmount;
}

export function getLineItemsForInvoice(invoiceId: string): LineItem[] {
  // In a real app, this would fetch from backend
  return mockLineItems;
}

export function deleteInvoice(invoiceId: string): Promise<void> {
  // In a real app, this would call the backend API
  return new Promise((resolve) => {
    setTimeout(() => {
      // Find and remove the invoice from the mock data
      const index = mockInvoices.findIndex(inv => inv.invoice_number === invoiceId);
      if (index !== -1) {
        mockInvoices.splice(index, 1);
      }
      resolve();
    }, 500);
  });
}

export function updateInvoiceStatus(
  invoiceId: string,
  newStatus: string
): Promise<void> {
  // In a real app, this would call the backend API
  return new Promise((resolve) => {
    setTimeout(() => {
      // Find and update the invoice in the mock data
      const invoice = mockInvoices.find(inv => inv.invoice_number === invoiceId);
      if (invoice) {
        invoice.payment_status = newStatus;
      }
      resolve();
    }, 500);
  });
}

export function printInvoice(invoiceId: string): Promise<void> {
  // In a real app, this would trigger the print dialog
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve();
    }, 500);
  });
}

export function downloadInvoice(invoiceId: string): Promise<void> {
  // In a real app, this would download the PDF
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve();
    }, 500);
  });
}