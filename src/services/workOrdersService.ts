export interface WorkOrderWithId {
  id: string;
  customer: string;
  date: string;
  cylinders: string | number | null;
  amount: number;
  status: "Pending" | "In Progress" | "Completed" | "Invoiced" | "Submitted";
  well_name?: string | null;
  meter_number?: string | null;
  created_by: number;
  pending_since?: number | null;
  api_id?: number;
  company_id?: number; // <-- Added
}

// New interface for Work Order Header table
export interface WorkOrderHeader {
  id: number;
  work_order_number: string;
  date: string;
  mileage_fee: number;
  miscellaneous_charges: number;
  hourly_fee: number;
  company_id: number;
  contact_id: number;
  status: "Pending" | "In Progress" | "Completed" | "Invoiced" | "Submitted"; // ✅ Added status field
  created_by: number;
}

// New interface for Work Order Lines table
export interface WorkOrderLine {
  id: number;
  work_order_id: number;
  analysis_number: string;
  date: string;
  producer: string;
  sampled_by_natty: boolean;
  company: string;
  area: string;
  well_name: string;
  meter_number: string;
  flow_rate: string;
  pressure: string;
  temperature: string;
  field_h2s: string;
  cost_code: string;
  cylinder_number: string; // ✅ Changed from bottle_number
  remarks: string;
  check_in_time: string;
  analysis_type: string;
  check_in_type: string;
  rushed: boolean;
  price: number; // ✅ Calculated price based on analysis type + pricing rules
  tag_image: string;
  billing_reference_type: string;
  billing_reference_number: string;
  created_by: number;
}

export interface LineItem {
  id: number;
  cylinder_number: string;
  analysis_number: string;
  cc_number: string;
  analysis_type: string;
  rushed: boolean;
  well_name: string;
  meter_number: string;
  applied_rate: number;
  standard_rate: number; // Base rate before rushed multiplier
  sample_fee: number;
  h2_pop_fee: number;
  spot_composite_fee: number;
  amount: number;
}

// Import analysisPricingService for price calculations
import { analysisPricingService } from "./analysisPricingService";
import { API_BASE_URL } from "../config/api";
import { authService } from "./authService";

type ApiWorkOrder = {
  id: number;
  work_order_number: string;
  company_id: number;
  company: string;
  well_name: string | null;
  meter_number: string | null;
  date: string;
  pending_since: number | null;
  cylinders: string | number | null;
  amount: number;
  status:
    | "Pending"
    | "In Progress"
    | "Completed"
    | "Invoiced"
    | "Submitted"
    | string;
};

type ApiWorkOrderLineItem = {
  id?: number;
  cylinder_number?: string;
  analysis_number?: string;
  cc_number?: string;
  analysis_type?: string;
  rushed?: boolean;
  well_name?: string;
  meter_number?: string;
  applied_rate?: number | string | null;
  standard_rate?: number | string | null;
  sample_fee?: number | string | null;
  h2_pop_fee?: number | string | null;
  spot_composite_fee?: number | string | null;
  amount?: number | string | null;
};

type ApiWorkOrderDetails = {
  work_order_number?: string;
  work_order?: {
    work_order_number?: string;
    mileage_fee?: number | string | null;
    miscellaneous_charges?: number | string | null;
    misc_fee?: number | string | null;
    hourly_fee?: number | string | null;
  };
  line_items?: ApiWorkOrderLineItem[];
  mileage_fee?: number | string | null;
  miscellaneous_charges?: number | string | null;
  misc_fee?: number | string | null;
  hourly_fee?: number | string | null;
};

const buildAuthHeaders = (): HeadersInit => {
  const token = authService.getAuthState().token;
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

const mapApiWorkOrder = (order: ApiWorkOrder): WorkOrderWithId => ({
  id: order.work_order_number,
  customer: order.company,
  date: order.date,
  cylinders: order.cylinders ?? null,
  amount: typeof order.amount === "number" ? order.amount : 0,
  status: (order.status || "Pending") as WorkOrderWithId["status"],
  well_name: order.well_name ?? null,
  meter_number: order.meter_number ?? null,
  created_by: 0,
  pending_since: order.pending_since ?? null,
  api_id: order.id,
  company_id: order.company_id, // <-- Added
});

const toNumber = (value: unknown, fallback = 0): number => {
  const num = typeof value === "number" ? value : Number(value);
  return Number.isFinite(num) ? num : fallback;
};

const normalizeLineItem = (
  item: ApiWorkOrderLineItem,
  index: number,
): LineItem => {
  // const rate = toNumber(item.rate);
  const applied_rate = toNumber(item.applied_rate);
  const sampleFee = toNumber(item.sample_fee);
  const h2PopFee = toNumber(item.h2_pop_fee);
  const spotCompositeFee = toNumber(item.spot_composite_fee);

  // Always get the correct standard_rate from analysisPricingService if possible
  const analysisPrice = analysisPricingService.getAnalysisPriceByCode(
    item.analysis_type ?? "",
  );
  const standard_rate =
    analysisPrice?.standard_rate ??
    toNumber(item.standard_rate ?? applied_rate);
  return {
    id: item.id ?? index + 1,
    cylinder_number: item.cylinder_number ?? "",
    analysis_number: item.analysis_number ?? "",
    cc_number: item.cc_number ?? "",
    analysis_type: item.analysis_type ?? "",
    rushed: Boolean(item.rushed),
    well_name: item.well_name ?? "",
    meter_number: item.meter_number ?? "",
    applied_rate,
    standard_rate,
    sample_fee: sampleFee,
    h2_pop_fee: h2PopFee,
    spot_composite_fee: spotCompositeFee,
    amount: applied_rate + sampleFee + h2PopFee + spotCompositeFee,
  };
};

// In-memory storage for Work Order Headers and Lines with initial mock data
let workOrderHeaders: WorkOrderHeader[] = [
  {
    id: 1001,
    work_order_number: "WO-001234",
    date: "2025-12-01",
    mileage_fee: 50.0,
    miscellaneous_charges: 25.0,
    hourly_fee: 75.0,
    company_id: 1, // ACME Corporation
    contact_id: 1,
    status: "Completed",
    created_by: 1,
  },
];

let workOrderLines: WorkOrderLine[] = [
  // Lines for WO-001234 (5 cylinders)
  {
    id: 2001,
    work_order_id: 1001,
    analysis_number: "ACME-001-GPA2261-00001",
    date: "2025-12-01",
    producer: "Acme Production",
    sampled_by_natty: false,
    company: "Acme Corporation",
    area: "North Field",
    well_name: "Well A-1",
    meter_number: "MTR-001",
    flow_rate: "1500 MCFD",
    pressure: "850 PSI",
    temperature: "75 F",
    field_h2s: "0 PPM",
    cost_code: "CC-001",
    cylinder_number: "BTL-001", // ✅ Changed from bottle_number
    remarks: "Normal sample",
    check_in_time: "2025-12-01T08:30:00Z",
    analysis_type: "GPA 2261",
    check_in_type: "Field Sample",
    rushed: false,
    price: 150.0,
    tag_image: "",
    billing_reference_type: "PO",
    billing_reference_number: "PO-12345",
    created_by: 1,
  },
  {
    id: 2002,
    work_order_id: 1001,
    analysis_number: "ACME-002-GPA2172-00002",
    date: "2025-12-01",
    producer: "Acme Production",
    sampled_by_natty: false,
    company: "Acme Corporation",
    area: "North Field",
    well_name: "Well A-2",
    meter_number: "MTR-002",
    flow_rate: "2000 MCFD",
    pressure: "900 PSI",
    temperature: "76 F",
    field_h2s: "0 PPM",
    cost_code: "CC-001",
    cylinder_number: "BTL-002", // ✅ Changed from bottle_number
    remarks: "Rushed analysis",
    check_in_time: "2025-12-01T09:00:00Z",
    analysis_type: "GPA 2172",
    check_in_type: "Field Sample",
    rushed: true,
    price: 225.0,
    tag_image: "",
    billing_reference_type: "PO",
    billing_reference_number: "PO-12345",
    created_by: 1,
  },
];

export const workOrdersService = {
  fetchWorkOrders: async (): Promise<WorkOrderWithId[]> => {
    const response = await fetch(`${API_BASE_URL}/sample_checkin/workorders`, {
      method: "GET",
      headers: buildAuthHeaders(),
    });

    if (!response.ok) {
      const message =
        response.status === 401 ? "Unauthorized" : "Failed to load work orders";
      throw new Error(message);
    }

    const data: ApiWorkOrder[] = await response.json();
    return Array.isArray(data) ? data.map(mapApiWorkOrder) : [];
  },
  fetchWorkOrderDetailsByNumber: async (
    workOrderNumber: string,
  ): Promise<{
    workOrderNumber: string;
    lineItems: LineItem[];
    mileageFee: number;
    miscCharges: number;
    hourlyFee: number;
  }> => {
    const response = await fetch(
      `${API_BASE_URL}/sample_checkin/workorders/by-number/${encodeURIComponent(
        workOrderNumber,
      )}`,
      {
        method: "GET",
        headers: buildAuthHeaders(),
      },
    );

    if (!response.ok) {
      const message =
        response.status === 401
          ? "Unauthorized"
          : "Failed to load work order details";
      throw new Error(message);
    }

    const data: ApiWorkOrderDetails = await response.json();

    const resolvedNumber =
      data.work_order_number ||
      data.work_order?.work_order_number ||
      workOrderNumber;

    const lineItems = Array.isArray(data.line_items)
      ? data.line_items.map(normalizeLineItem)
      : [];

    const mileageFee = toNumber(
      data.mileage_fee ?? data.work_order?.mileage_fee,
    );
    const miscCharges = toNumber(
      data.miscellaneous_charges ??
        data.misc_fee ??
        data.work_order?.miscellaneous_charges ??
        data.work_order?.misc_fee,
    );
    const hourlyFee = toNumber(data.hourly_fee ?? data.work_order?.hourly_fee);

    return {
      workOrderNumber: resolvedNumber,
      lineItems,
      mileageFee,
      miscCharges,
      hourlyFee,
    };
  },
  deleteWorkOrder: async (id: number): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/sample_checkin/${id}`, {
      method: "DELETE",
      headers: buildAuthHeaders(),
    });

    if (!response.ok) {
      const message =
        response.status === 401
          ? "Unauthorized"
          : "Failed to delete work order";
      throw new Error(message);
    }
  },

  calculateOrderTotal: (
    lineItems: LineItem[],
    mileageFee: number = 0,
    miscCharges: number = 0,
    hourlyFee: number = 0,
  ): number => {
    const lineItemsTotal = lineItems.reduce(
      (sum, item) => sum + item.amount,
      0,
    );
    return lineItemsTotal + mileageFee + miscCharges + hourlyFee;
  },

  calculateLineItemAmount: (item: Partial<LineItem>): number => {
    return (
      (item.applied_rate || 0) +
      (item.sample_fee || 0) +
      (item.h2_pop_fee || 0) +
      (item.spot_composite_fee || 0)
    );
  },

  formatCurrency: (amount: number): string => {
    return `$${amount.toFixed(2)}`;
  },

  calculateDaysSince: (dateString: string, currentDate?: string): number => {
    const orderDate = new Date(dateString);
    const today = currentDate ? new Date(currentDate) : new Date();
    const diffTime = Math.abs(today.getTime() - orderDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  },

  getPendingColor: (days: number) => {
    if (days < 2) {
      return {
        bg: "bg-green-50",
        text: "text-green-700",
        border: "border-l-green-500",
      };
    }
    if (days < 7) {
      return {
        bg: "bg-yellow-50",
        text: "text-yellow-700",
        border: "border-l-yellow-500",
      };
    }
    return {
      bg: "bg-red-50",
      text: "text-red-700",
      border: "border-l-red-500",
    };
  },
  getStatusColor: (status: string): string => {
    switch (status) {
      case "Completed":
        return "bg-green-100 text-green-800";
      case "Invoiced":
        return "bg-blue-100 text-blue-800";
      case "In Progress":
        return "bg-yellow-100 text-yellow-800";
      case "Pending":
        return "bg-gray-100 text-gray-800";
      case "Submitted":
        return "bg-purple-100 text-purple-800";
      case "Price Verified":
        return "bg-green-200 text-green-900";
      default:
        return "bg-gray-100 text-gray-800";
    }
  },

  getRateByAnalysisType: (analysisType: string): number => {
    switch (analysisType) {
      case "Gas Analysis":
        return 45.0;
      case "BTU Analysis":
        return 55.0;
      case "Composite":
        return 65.0;
      case "GPA2261":
        return 150.0;
      case "D1945":
        return 125.0;
      case "D1070":
        return 100.0;
      case "H2S":
        return 50.0;
      default:
        return 0;
    }
  },

  updateLineItem: (
    items: LineItem[],
    id: string,
    field: keyof LineItem,
    value: string | number | boolean,
  ): LineItem[] => {
    return items.map((item) => {
      if (item.id.toString() !== id) return item;

      let updatedItem: LineItem;
      if (field === "sample_fee") {
        updatedItem = { ...item, sample_fee: Number(value) };
      } else {
        updatedItem = { ...item, [field]: value } as LineItem;
      }

      // If analysis_type or rushed changed, recalculate rates
      if (field === "analysis_type") {
        const analysisPrice = analysisPricingService.getAnalysisPriceByCode(
          value as string,
        );
        if (analysisPrice) {
          updatedItem.standard_rate = Number(analysisPrice.standard_rate) || 0;
          updatedItem.applied_rate = item.rushed
            ? Number(analysisPrice.rushed_rate)
            : Number(analysisPrice.standard_rate);
        } else {
          const newRate = workOrdersService.getRateByAnalysisType(
            value as string,
          );
          updatedItem.standard_rate = Number(newRate);
          updatedItem.applied_rate = item.rushed
            ? Number(newRate) * 1.5
            : Number(newRate);
        }
      }

      if (field === "rushed") {
        const isRushed = value as boolean;
        const analysisPrice = analysisPricingService.getAnalysisPriceByCode(
          item.analysis_type,
        );
        if (analysisPrice) {
          updatedItem.standard_rate = Number(analysisPrice.standard_rate) || 0;
          updatedItem.applied_rate = isRushed
            ? Number(analysisPrice.rushed_rate)
            : Number(analysisPrice.standard_rate);
        } else {
          const newRate = workOrdersService.getRateByAnalysisType(
            item.analysis_type,
          );
          updatedItem.standard_rate = Number(newRate);
          updatedItem.applied_rate = isRushed
            ? Number(newRate) * 1.5
            : Number(newRate);
        }
      }

      // Always recalculate amount using all four fields from updatedItem only
      updatedItem.amount =
        (updatedItem.applied_rate ?? 0) +
        (updatedItem.sample_fee ?? 0) +
        (updatedItem.h2_pop_fee ?? 0) +
        (updatedItem.spot_composite_fee ?? 0);

      return updatedItem;
    });
  },

  getMockLineItemsForView: (orderId: string): LineItem[] => {
    return [
      {
        id: 1,
        cylinder_number: "BTL-001",
        analysis_number: "AN-001",
        cc_number: "CC-001",
        analysis_type: "GPA2261",
        rushed: true,
        well_name: "Well A",
        meter_number: "MTR-001",
        applied_rate: 45.0,
        standard_rate: 45.0,
        sample_fee: 80.0,
        h2_pop_fee: 5.0,
        spot_composite_fee: 0.0,
        amount: 130.0,
      },
      {
        id: 2,
        cylinder_number: "BTL-002",
        analysis_number: "AN-002",
        cc_number: "CC-002",
        analysis_type: "D1945",
        rushed: false,
        well_name: "Well B",
        meter_number: "MTR-002",
        applied_rate: 55.0,
        standard_rate: 55.0,
        sample_fee: 65.0,
        h2_pop_fee: 5.0,
        spot_composite_fee: 0.0,
        amount: 125.0,
      },
      {
        id: 3,
        cylinder_number: "BTL-003",
        analysis_number: "AN-003",
        cc_number: "CC-003",
        analysis_type: "GPA2261",
        rushed: false,
        well_name: "Well C",
        meter_number: "MTR-003",
        applied_rate: 45.0,
        standard_rate: 45.0,
        sample_fee: 90.0,
        h2_pop_fee: 5.0,
        spot_composite_fee: 0.0,
        amount: 140.0,
      },
      {
        id: 4,
        cylinder_number: "BTL-004",
        analysis_number: "AN-004",
        cc_number: "CC-004",
        analysis_type: "D1070",
        rushed: false,
        well_name: "Well D",
        meter_number: "MTR-004",
        applied_rate: 65.0,
        standard_rate: 65.0,
        sample_fee: 85.0,
        h2_pop_fee: 5.0,
        spot_composite_fee: 20.0,
        amount: 175.0,
      },
      {
        id: 5,
        cylinder_number: "BTL-005",
        analysis_number: "AN-005",
        cc_number: "CC-005",
        analysis_type: "H2S",
        rushed: true,
        well_name: "Well E",
        meter_number: "MTR-005",
        applied_rate: 75.0,
        standard_rate: 75.0,
        sample_fee: 55.0,
        h2_pop_fee: 5.0,
        spot_composite_fee: 0.0,
        amount: 135.0,
      },
    ];
  },

  generateInvoiceNumber: (): string => {
    return `INV-2025-${Math.floor(1000 + Math.random() * 9000)}`;
  },

  // New methods for Work Order Header and Lines
  generateWorkOrderNumber: (): string => {
    const timestamp = Date.now().toString().slice(-6);
    return `WO-${timestamp}`;
  },

  createWorkOrder: (
    companyId: number,
    contactId: number,
    cylinders: any[],
    userId: number,
  ): { header: WorkOrderHeader; lines: WorkOrderLine[] } => {
    const workOrderNumber = workOrdersService.generateWorkOrderNumber();
    const now = new Date().toISOString();
    const today = new Date().toISOString().split("T")[0];

    // Create Work Order Header
    const header: WorkOrderHeader = {
      id: Date.now(),
      work_order_number: workOrderNumber,
      date: today,
      mileage_fee: 0,
      miscellaneous_charges: 0,
      hourly_fee: 0,
      company_id: companyId,
      contact_id: contactId,
      status: "Pending", // ✅ Set initial status
      created_by: userId,
    };

    // Store header
    workOrderHeaders.push(header);

    // Create Work Order Lines for each cylinder
    const lines: WorkOrderLine[] = cylinders.map((cylinder, index) => {
      // ✅ Calculate price based on analysis type and pricing rules
      const analysisPrice = analysisPricingService.getAnalysisPriceByCode(
        cylinder.analysis_type,
      );
      const basePrice = analysisPrice?.price || 150.0; // Default to $150 if not found

      let calculatedPrice = basePrice;

      // Apply rushed pricing (1.5x) if rushed
      if (cylinder.rushed) {
        calculatedPrice = basePrice * 1.5;
      }

      const line: WorkOrderLine = {
        id: Date.now() + index,
        work_order_id: header.id,
        analysis_number: cylinder.analysis_number,
        date: cylinder.date || today,
        producer: cylinder.producer || "",
        sampled_by_natty: cylinder.sampled_by_natty || false,
        company: cylinder.company || "",
        area: cylinder.area || "",
        well_name: cylinder.well_name || "",
        meter_number: cylinder.meter_number || "",
        flow_rate: cylinder.flow_rate || "",
        pressure: cylinder.pressure || "",
        temperature: cylinder.temperature || "",
        field_h2s: cylinder.field_h2s || "",
        cost_code: cylinder.cost_code || "",
        cylinder_number: cylinder.cylinder_number, // ✅ Now reads cylinder_number
        remarks: cylinder.remarks || "",
        check_in_time: cylinder.check_in_time,
        analysis_type: cylinder.analysis_type,
        check_in_type: cylinder.check_in_type,
        rushed: cylinder.rushed,
        price: calculatedPrice, // ✅ Use calculated price from Analysis Pricing Master
        tag_image: cylinder.tag_image || "",
        billing_reference_type: cylinder.billing_reference_type || "",
        billing_reference_number: cylinder.billing_reference_number || "",
        created_by: userId,
      };
      return line;
    });

    // Store lines
    workOrderLines.push(...lines);

    console.log("Work Order Created:", {
      header,
      linesCount: lines.length,
      workOrderNumber,
    });

    return { header, lines };
  },

  getWorkOrderHeaders: (): WorkOrderHeader[] => {
    return workOrderHeaders;
  },

  getWorkOrderHeaderById: (id: number): WorkOrderHeader | undefined => {
    return workOrderHeaders.find((header) => header.id === id);
  },

  getWorkOrderHeaderByNumber: (
    workOrderNumber: string,
  ): WorkOrderHeader | undefined => {
    return workOrderHeaders.find(
      (header) => header.work_order_number === workOrderNumber,
    );
  },

  getWorkOrderLinesByHeaderId: (headerId: number): WorkOrderLine[] => {
    return workOrderLines.filter((line) => line.work_order_id === headerId);
  },

  getWorkOrderLinesByWorkOrderNumber: (
    workOrderNumber: string,
  ): WorkOrderLine[] => {
    const header =
      workOrdersService.getWorkOrderHeaderByNumber(workOrderNumber);
    if (!header) return [];
    return workOrdersService.getWorkOrderLinesByHeaderId(header.id);
  },
};
