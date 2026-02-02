export interface WorkOrder {
  id: number;
  work_order_number: string;
  company_id: number; // ✅ Changed from customer (string) to company_id (number)
  date: string;
  cylinders: number;
  amount: number;
  status: "Pending" | "In Progress" | "Completed" | "Invoiced";
  items: OrderItem[];
  mileage_fee: number; // ✅ Added additional fees
  miscellaneous_charges: number; // ✅ Added additional fees
  hourly_fee: number; // ✅ Added additional fees
  billing_reference_type: string; // ✅ Added billing reference
  billing_reference_number: string; // ✅ Added billing reference
  created_by: number;
}

export interface OrderItem {
  id: number;
  cylinder_number: string; // ✅ Changed from bottle_number
  analysis_number: string;
  analysis_type: string;
  meter_number: string;
  well_name: string;
  rushed: boolean;
  price: number; // ✅ Changed from rate/tax/total to simple price
  created_by: number;
}

export interface Customer {
  id: number;
  code: string;
  name: string;
}

export interface InvoiceFilters {
  company_id: number | null; // ✅ Changed from customer (string) to company_id (number)
  date_from: string;
  date_to: string;
}

export interface InvoiceTotals {
  subtotal: number;
  total: number;
  additionalFees?: number; // ✅ Added for mileage, misc, hourly fees
}