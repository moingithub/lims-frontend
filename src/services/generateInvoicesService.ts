import {
  WorkOrder,
  Customer,
  InvoiceFilters,
  InvoiceTotals,
} from "../types/generateInvoices";
import { API_BASE_URL } from "../config/api";
import { authService } from "./authService";
import { companyMasterService } from "./companyMasterService";
import { workorderHeadersService } from "./workorderHeadersService";
import { sampleCheckInService } from "./sampleCheckInService";

// Get customers from Company Master Service
export const getCustomers = (): Customer[] => {
  const companies = companyMasterService.getActiveCompanies();
  return companies.map((company) => ({
    id: company.id,
    code: company.company_code,
    name: company.company_name,
  }));
};

// Get work orders from API for invoice generation
export const getWorkOrders = async (): Promise<WorkOrder[]> => {
  const authState = authService.getAuthState();
  const token = authState?.token;
  const response = await fetch(
    `${API_BASE_URL}/workorder_headers/for_invoice`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    },
  );
  if (!response.ok) {
    const message =
      response.status === 401 ? "Unauthorized" : "Failed to load work orders";
    throw new Error(message);
  }
  const data = await response.json();
  // Map API response to ensure company_name is present on each WorkOrder
  return data.map((order: any) => ({
    ...order,
    company_name: order.company_name || undefined,
  }));
};

// Date utility functions
export const getFirstDayOfMonth = (): string => {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const year = now.getFullYear();
  return `${month}-01-${year}`;
};

export const getCurrentDate = (): string => {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  const year = now.getFullYear();
  return `${month}-${day}-${year}`;
};

// Convert MM-DD-YYYY to YYYY-MM-DD for date comparison
export const usDateToISO = (usDate: string): string => {
  if (!usDate) return "";
  const [month, day, year] = usDate.split("-");
  return `${year}-${month}-${day}`;
};

// Filter orders based on criteria
export const getFilteredOrders = (
  allOrders: WorkOrder[],
  filters: InvoiceFilters,
): WorkOrder[] => {
  return allOrders.filter((order) => {
    // First, exclude invoiced orders
    if (order.status === "Invoiced") return false;

    // Filter by company_id
    if (filters.company_id && order.company_id !== filters.company_id)
      return false;

    // If date range is selected, filter by date
    if (filters.date_from && filters.date_to) {
      const orderDate = new Date(order.date);
      const fromDate = new Date(usDateToISO(filters.date_from));
      const toDate = new Date(usDateToISO(filters.date_to));
      if (orderDate < fromDate || orderDate > toDate) return false;
    }

    return true;
  });
};

// Calculate invoice totals
export const calculateInvoiceTotals = (
  selectedOrders: WorkOrder[],
): InvoiceTotals => {
  const subtotal = selectedOrders.reduce((sum, order) => {
    // Sum of all line items
    const linesTotal = order.items.reduce((lineSum, item) => {
      const fieldSum =
        Number(item.applied_rate || 0) +
        Number(item.sample_fee || 0) +
        Number(item.h2_pop_fee || 0);
      return lineSum + (fieldSum > 0 ? fieldSum : Number(item.price || 0));
    }, 0);
    return sum + linesTotal;
  }, 0);

  const mileageFee = selectedOrders.reduce(
    (sum, order) => sum + Number(order.mileage_fee || 0),
    0,
  );
  const miscellaneousCharges = selectedOrders.reduce(
    (sum, order) => sum + Number(order.miscellaneous_charges || 0),
    0,
  );
  const hourlyFee = selectedOrders.reduce(
    (sum, order) => sum + Number(order.hourly_fee || 0),
    0,
  );
  const additionalFees = mileageFee + miscellaneousCharges + hourlyFee;
  const total = subtotal + additionalFees;

  return {
    subtotal,
    total,
    additionalFees,
    mileageFee,
    miscellaneousCharges,
    hourlyFee,
  };
};

// Generate invoice number
export const generateInvoiceNumber = (): string => {
  return `INV-${new Date().getFullYear()}-${String(
    Math.floor(Math.random() * 10000),
  ).padStart(4, "0")}`;
};

// Validate invoice generation
export const validateInvoiceGeneration = (
  selectedOrders: WorkOrder[],
): { valid: boolean; error?: string } => {
  if (selectedOrders.length === 0) {
    return { valid: false, error: "Please select at least one work order" };
  }

  // Check if all selected orders are for the same company
  const companyIds = [
    ...new Set(selectedOrders.map((order) => order.company_id)),
  ];

  if (companyIds.length > 1) {
    return {
      valid: false,
      error: `Cannot generate invoice for multiple companies. Please select work orders from a single company only.`,
    };
  }

  return { valid: true };
};

// Mark work orders as invoiced
export const markOrdersAsInvoiced = (orderIds: number[]): void => {
  // This would update the status in the actual work orders service
  // For now, we'll just log it
  console.log("Marking work orders as invoiced:", orderIds);
};

// Get company name by ID
// Accepts fallbackName for cases where company is not in cache
export const getCompanyNameById = (
  companyId: number,
  fallbackName?: string,
): string => {
  const company = companyMasterService.getCompanyById(companyId);
  return company?.company_name || fallbackName || "Unknown Company";
};

// Get company email by ID
export const getCompanyEmailById = (companyId: number): string => {
  const company = companyMasterService.getCompanyById(companyId);
  return company?.email || "";
};

// Build invoice payload from selected work orders
const buildInvoicePayload = (selectedOrders: WorkOrder[]) => {
  const companyId = selectedOrders[0].company_id;
  const today = new Date().toISOString().split("T")[0];

  // Service date range: min/max of order dates
  const dates = selectedOrders.map((o) => o.date).sort();
  const serviceStartDate = dates[0];
  const serviceEndDate = dates[dates.length - 1];

  // PO number from first order that has a PO reference
  const poOrder = selectedOrders.find((o) => o.billing_reference_type === "PO");
  const poNumber = poOrder?.billing_reference_number || "";

  const location = selectedOrders[0].location || "";

  // Miles: sum across orders
  const miles = selectedOrders.reduce(
    (sum, o) => sum + Number(o.miles || 0),
    0,
  );

  // Fee totals
  const mileageFee = selectedOrders.reduce(
    (sum, o) => sum + Number(o.mileage_fee || 0),
    0,
  );
  const ratePerMile = miles > 0 ? mileageFee / miles : 0;
  const miscellaneousCharges = selectedOrders.reduce(
    (sum, o) => sum + Number(o.miscellaneous_charges || 0),
    0,
  );
  const hourlyFee = selectedOrders.reduce(
    (sum, o) => sum + Number(o.hourly_fee || 0),
    0,
  );

  // Subtotal: sum of all line item prices
  const subtotal = selectedOrders.reduce(
    (sum, o) =>
      sum +
      o.items.reduce((lineSum, item) => lineSum + Number(item.price || 0), 0),
    0,
  );
  const totalAmount = subtotal + mileageFee + miscellaneousCharges + hourlyFee;

  // Invoice lines from all selected order items
  const invoiceLines = selectedOrders.flatMap((order) =>
    order.items.map((item) => ({
      sample_checkin_id: item.sample_checkin_id ?? item.id,
      analysis_number: item.analysis_number,
      description: item.analysis_type,
      service_date: order.date,
      analysis_method: item.analysis_method || item.analysis_type,
      quantity: 1,
      unit_price: Number(item.price || 0),
      amount: Number(item.price || 0),
    })),
  );

  return {
    company_id: companyId,
    invoice_date: today,
    service_start_date: serviceStartDate,
    service_end_date: serviceEndDate,
    po_number: poNumber,
    location,
    miles,
    rate_per_mile: ratePerMile,
    mileage_fee: mileageFee,
    miscellaneous_charges: miscellaneousCharges,
    hourly_fee: hourlyFee,
    subtotal,
    tax_amount: 0,
    total_amount: totalAmount,
    invoiceLines,
  };
};

// Create invoice via POST /invoices
export const createInvoice = async (
  selectedOrders: WorkOrder[],
): Promise<any> => {
  const authState = authService.getAuthState();
  const token = authState?.token;
  const payload = buildInvoicePayload(selectedOrders);

  const response = await fetch(`${API_BASE_URL}/invoices`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorData = await response
      .json()
      .catch(() => ({ message: "Failed to create invoice" }));
    throw new Error(errorData.message || "Failed to create invoice");
  }

  const result = await response.json();

  // Mark all selected work orders as "Invoiced" in both tables
  await Promise.all(
    selectedOrders.flatMap((order) => [
      workorderHeadersService.updateByNumber(order.work_order_number, {
        status: "Invoiced",
      }),
      sampleCheckInService.updateStatusByWorkOrderNumber(
        order.work_order_number,
        {
          status: "Invoiced",
        },
      ),
    ]),
  );

  return result;
};
