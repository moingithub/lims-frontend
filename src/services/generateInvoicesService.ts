import { WorkOrder, Customer, InvoiceFilters, InvoiceTotals } from "../types/generateInvoices";
import { workOrdersService, WorkOrderHeader, WorkOrderLine } from "./workOrdersService";
import { companyMasterService } from "./companyMasterService";

// Get customers from Company Master Service
export const getCustomers = (): Customer[] => {
  const companies = companyMasterService.getActiveCompanies();
  return companies.map(company => ({
    id: company.id,
    code: company.company_code,
    name: company.company_name,
  }));
};

// Get work orders from Work Orders Service (convert to invoice format)
export const getWorkOrders = (): WorkOrder[] => {
  const headers = workOrdersService.getWorkOrderHeaders();
  
  return headers.map(header => {
    const lines = workOrdersService.getWorkOrderLinesByHeaderId(header.id);
    
    // Get billing reference from first line (all lines should have same reference for a work order)
    const firstLine = lines[0];
    const billing_reference_type = firstLine?.billing_reference_type || "NA";
    const billing_reference_number = firstLine?.billing_reference_number || "";
    
    // Calculate total amount from lines
    const linesTotal = lines.reduce((sum, line) => sum + line.price, 0);
    const totalAmount = linesTotal + header.mileage_fee + header.miscellaneous_charges + header.hourly_fee;
    
    // Convert lines to OrderItems
    const items = lines.map(line => ({
      id: line.id,
      cylinder_number: line.cylinder_number, // ✅ Changed from bottle_number
      analysis_number: line.analysis_number,
      analysis_type: line.analysis_type,
      meter_number: line.meter_number,
      well_name: line.well_name,
      rushed: line.rushed,
      price: line.price,
      created_by: line.created_by,
    }));
    
    return {
      id: header.id,
      work_order_number: header.work_order_number,
      company_id: header.company_id,
      date: header.date,
      cylinders: lines.length,
      amount: totalAmount,
      status: header.status,
      items: items,
      mileage_fee: header.mileage_fee,
      miscellaneous_charges: header.miscellaneous_charges,
      hourly_fee: header.hourly_fee,
      billing_reference_type: billing_reference_type,
      billing_reference_number: billing_reference_number,
      created_by: header.created_by,
    };
  });
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
  filters: InvoiceFilters
): WorkOrder[] => {
  return allOrders.filter((order) => {
    // First, exclude invoiced orders
    if (order.status === "Invoiced") return false;

    // Filter by company_id
    if (filters.company_id && order.company_id !== filters.company_id) return false;

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
  selectedOrders: WorkOrder[]
): InvoiceTotals => {
  const subtotal = selectedOrders.reduce((sum, order) => {
    // Sum of all line items
    const linesTotal = order.items.reduce((lineSum, item) => lineSum + item.price, 0);
    return sum + linesTotal;
  }, 0);
  
  const additionalFees = selectedOrders.reduce((sum, order) => {
    return sum + order.mileage_fee + order.miscellaneous_charges + order.hourly_fee;
  }, 0);
  
  const total = subtotal + additionalFees;

  return { 
    subtotal, 
    total,
    additionalFees 
  };
};

// Generate invoice number
export const generateInvoiceNumber = (): string => {
  return `INV-${new Date().getFullYear()}-${String(
    Math.floor(Math.random() * 10000)
  ).padStart(4, "0")}`;
};

// Validate invoice generation
export const validateInvoiceGeneration = (
  selectedOrders: WorkOrder[]
): { valid: boolean; error?: string } => {
  if (selectedOrders.length === 0) {
    return { valid: false, error: "Please select at least one work order" };
  }

  // Check if all selected orders are for the same company
  const companyIds = [...new Set(selectedOrders.map((order) => order.company_id))];

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
  console.log('Marking work orders as invoiced:', orderIds);
};

// Get company name by ID
export const getCompanyNameById = (companyId: number): string => {
  const company = companyMasterService.getCompanyById(companyId);
  return company?.company_name || "Unknown Company";
};

// Get company email by ID
export const getCompanyEmailById = (companyId: number): string => {
  const company = companyMasterService.getCompanyById(companyId);
  return company?.email || "";
};