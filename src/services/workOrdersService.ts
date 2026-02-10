export interface WorkOrderWithId {
  id: string;
  customer: string;
  date: string;
  cylinders: string | number | null;
  amount: number;
  status: "Pending" | "In Progress" | "Completed" | "Invoiced";
  well_name?: string | null;
  meter_number?: string | null;
  created_by: number;
  pending_since?: number | null;
  api_id?: number;
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
  status: "Pending" | "In Progress" | "Completed" | "Invoiced"; // ✅ Added status field
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
  company: string;
  well_name: string | null;
  meter_number: string | null;
  date: string;
  pending_since: number | null;
  cylinders: string | number | null;
  amount: number;
  status: "Pending" | "In Progress" | "Completed" | "Invoiced" | string;
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
    standard_rate: toNumber(item.standard_rate ?? applied_rate),
    sample_fee: sampleFee,
    h2_pop_fee: h2PopFee,
    spot_composite_fee: spotCompositeFee,
    amount: toNumber(
      item.amount ?? applied_rate + sampleFee + h2PopFee + spotCompositeFee,
    ),
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
  {
    id: 1002,
    work_order_number: "WO-001235",
    date: "2025-11-28",
    mileage_fee: 0,
    miscellaneous_charges: 0,
    hourly_fee: 0,
    company_id: 2, // TechGas Inc
    contact_id: 2,
    status: "Completed",
    created_by: 1,
  },
  {
    id: 1003,
    work_order_number: "WO-001236",
    date: "2025-11-25",
    mileage_fee: 100.0,
    miscellaneous_charges: 50.0,
    hourly_fee: 0,
    company_id: 1, // ACME Corporation
    contact_id: 1,
    status: "Completed",
    created_by: 2,
  },
  {
    id: 1004,
    work_order_number: "WO-001237",
    date: "2025-10-30",
    mileage_fee: 0,
    miscellaneous_charges: 0,
    hourly_fee: 150.0,
    company_id: 3, // Industrial Co
    contact_id: 3,
    status: "Invoiced",
    created_by: 1,
  },
  {
    id: 1005,
    work_order_number: "WO-001238",
    date: "2025-12-02T14:35:00",
    mileage_fee: 0,
    miscellaneous_charges: 0,
    hourly_fee: 0,
    company_id: 2, // TechGas Inc
    contact_id: 3,
    status: "Pending",
    created_by: 2,
  },
  {
    id: 1006,
    work_order_number: "WO-001215",
    date: "2025-11-30T08:15:00",
    mileage_fee: 0,
    miscellaneous_charges: 0,
    hourly_fee: 0,
    company_id: 3, // Industrial Co
    contact_id: 4,
    status: "Pending",
    created_by: 3,
  },
  {
    id: 1007,
    work_order_number: "WO-001228",
    date: "2025-11-29T16:45:00",
    mileage_fee: 0,
    miscellaneous_charges: 0,
    hourly_fee: 0,
    company_id: 4, // Gas Solutions
    contact_id: 5,
    status: "In Progress",
    created_by: 4,
  },
  {
    id: 1008,
    work_order_number: "WO-001242",
    date: "2025-12-02T10:30:00",
    mileage_fee: 0,
    miscellaneous_charges: 0,
    hourly_fee: 0,
    company_id: 1, // ACME Corporation
    contact_id: 1,
    status: "Pending",
    created_by: 5,
  },
  {
    id: 1009,
    work_order_number: "WO-001220",
    date: "2025-11-28T13:20:00",
    mileage_fee: 0,
    miscellaneous_charges: 0,
    hourly_fee: 0,
    company_id: 1, // ACME Corporation
    contact_id: 2,
    status: "In Progress",
    created_by: 6,
  },
  {
    id: 1010,
    work_order_number: "WO-001245",
    date: "2025-12-02T11:50:00",
    mileage_fee: 0,
    miscellaneous_charges: 0,
    hourly_fee: 0,
    company_id: 2, // TechGas Inc
    contact_id: 3,
    status: "Pending",
    created_by: 7,
  },
  {
    id: 1011,
    work_order_number: "WO-001218",
    date: "2025-11-27T07:40:00",
    mileage_fee: 0,
    miscellaneous_charges: 0,
    hourly_fee: 0,
    company_id: 3, // Industrial Co
    contact_id: 4,
    status: "In Progress",
    created_by: 8,
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
  {
    id: 2003,
    work_order_id: 1001,
    analysis_number: "ACME-003-BTU-00003",
    date: "2025-12-01",
    producer: "Acme Production",
    sampled_by_natty: false,
    company: "Acme Corporation",
    area: "North Field",
    well_name: "Well A-3",
    meter_number: "MTR-003",
    flow_rate: "1800 MCFD",
    pressure: "875 PSI",
    temperature: "75 F",
    field_h2s: "0 PPM",
    cost_code: "CC-001",
    cylinder_number: "BTL-003", // ✅ Changed from bottle_number
    remarks: "",
    check_in_time: "2025-12-01T09:30:00Z",
    analysis_type: "BTU Analysis",
    check_in_type: "Field Sample",
    rushed: false,
    price: 145.0,
    tag_image: "",
    billing_reference_type: "PO",
    billing_reference_number: "PO-12345",
    created_by: 1,
  },
  {
    id: 2004,
    work_order_id: 1001,
    analysis_number: "ACME-004-GPA2261-00004",
    date: "2025-12-01",
    producer: "Acme Production",
    sampled_by_natty: false,
    company: "Acme Corporation",
    area: "North Field",
    well_name: "Well A-4",
    meter_number: "MTR-004",
    flow_rate: "1600 MCFD",
    pressure: "860 PSI",
    temperature: "74 F",
    field_h2s: "0 PPM",
    cost_code: "CC-001",
    cylinder_number: "BTL-004", // ✅ Changed from bottle_number
    remarks: "",
    check_in_time: "2025-12-01T10:00:00Z",
    analysis_type: "GPA 2261",
    check_in_type: "Field Sample",
    rushed: false,
    price: 145.0,
    tag_image: "",
    billing_reference_type: "PO",
    billing_reference_number: "PO-12345",
    created_by: 1,
  },
  {
    id: 2005,
    work_order_id: 1001,
    analysis_number: "ACME-005-EXT-00005",
    date: "2025-12-01",
    producer: "Acme Production",
    sampled_by_natty: false,
    company: "Acme Corporation",
    area: "North Field",
    well_name: "Well A-5",
    meter_number: "MTR-005",
    flow_rate: "1700 MCFD",
    pressure: "870 PSI",
    temperature: "75 F",
    field_h2s: "0 PPM",
    cost_code: "CC-001",
    cylinder_number: "BTL-005", // ✅ Changed from bottle_number
    remarks: "",
    check_in_time: "2025-12-01T10:30:00Z",
    analysis_type: "Extended Analysis",
    check_in_type: "Field Sample",
    rushed: false,
    price: 145.0,
    tag_image: "",
    billing_reference_type: "PO",
    billing_reference_number: "PO-12345",
    created_by: 1,
  },

  // Lines for WO-001235 (3 cylinders)
  {
    id: 2006,
    work_order_id: 1002,
    analysis_number: "TECH-001-GPA2261-00006",
    date: "2025-11-28",
    producer: "TechGas Production",
    sampled_by_natty: false,
    company: "TechGas Inc",
    area: "South Field",
    well_name: "Well T-1",
    meter_number: "MTR-101",
    flow_rate: "2500 MCFD",
    pressure: "920 PSI",
    temperature: "78 F",
    field_h2s: "0 PPM",
    cost_code: "CC-002",
    cylinder_number: "BTL-101", // ✅ Changed from bottle_number
    remarks: "",
    check_in_time: "2025-11-28T09:00:00Z",
    analysis_type: "GPA 2261",
    check_in_type: "Field Sample",
    rushed: false,
    price: 145.0,
    tag_image: "",
    billing_reference_type: "AFE",
    billing_reference_number: "AFE-67890",
    created_by: 1,
  },
  {
    id: 2007,
    work_order_id: 1002,
    analysis_number: "TECH-002-GPA2261-00007",
    date: "2025-11-28",
    producer: "TechGas Production",
    sampled_by_natty: false,
    company: "TechGas Inc",
    area: "South Field",
    well_name: "Well T-2",
    meter_number: "MTR-102",
    flow_rate: "2300 MCFD",
    pressure: "910 PSI",
    temperature: "77 F",
    field_h2s: "0 PPM",
    cost_code: "CC-002",
    cylinder_number: "BTL-102", // ✅ Changed from bottle_number
    remarks: "",
    check_in_time: "2025-11-28T09:30:00Z",
    analysis_type: "GPA 2261",
    check_in_type: "Field Sample",
    rushed: false,
    price: 145.0,
    tag_image: "",
    billing_reference_type: "AFE",
    billing_reference_number: "AFE-67890",
    created_by: 1,
  },
  {
    id: 2008,
    work_order_id: 1002,
    analysis_number: "TECH-003-BTU-00008",
    date: "2025-11-28",
    producer: "TechGas Production",
    sampled_by_natty: false,
    company: "TechGas Inc",
    area: "South Field",
    well_name: "Well T-3",
    meter_number: "MTR-103",
    flow_rate: "2400 MCFD",
    pressure: "915 PSI",
    temperature: "77 F",
    field_h2s: "0 PPM",
    cost_code: "CC-002",
    cylinder_number: "BTL-103", // ✅ Changed from bottle_number
    remarks: "Rushed",
    check_in_time: "2025-11-28T10:00:00Z",
    analysis_type: "BTU Analysis",
    check_in_type: "Field Sample",
    rushed: true,
    price: 217.5,
    tag_image: "",
    billing_reference_type: "AFE",
    billing_reference_number: "AFE-67890",
    created_by: 1,
  },

  // Lines for WO-001236 (4 cylinders)
  {
    id: 2009,
    work_order_id: 1003,
    analysis_number: "ACME-006-GPA2261-00009",
    date: "2025-11-25",
    producer: "Acme Production",
    sampled_by_natty: false,
    company: "Acme Corporation",
    area: "East Field",
    well_name: "Well B-1",
    meter_number: "MTR-201",
    flow_rate: "1900 MCFD",
    pressure: "880 PSI",
    temperature: "76 F",
    field_h2s: "0 PPM",
    cost_code: "CC-003",
    cylinder_number: "BTL-201", // ✅ Changed from bottle_number
    remarks: "",
    check_in_time: "2025-11-25T10:00:00Z",
    analysis_type: "GPA 2261",
    check_in_type: "Field Sample",
    rushed: false,
    price: 145.0,
    tag_image: "",
    billing_reference_type: "PO",
    billing_reference_number: "PO-54321",
    created_by: 2,
  },
  {
    id: 2010,
    work_order_id: 1003,
    analysis_number: "ACME-007-GPA2261-00010",
    date: "2025-11-25",
    producer: "Acme Production",
    sampled_by_natty: false,
    company: "Acme Corporation",
    area: "East Field",
    well_name: "Well B-2",
    meter_number: "MTR-202",
    flow_rate: "2000 MCFD",
    pressure: "890 PSI",
    temperature: "76 F",
    field_h2s: "0 PPM",
    cost_code: "CC-003",
    cylinder_number: "BTL-202", // ✅ Changed from bottle_number
    remarks: "",
    check_in_time: "2025-11-25T10:30:00Z",
    analysis_type: "GPA 2261",
    check_in_type: "Field Sample",
    rushed: false,
    price: 145.0,
    tag_image: "",
    billing_reference_type: "PO",
    billing_reference_number: "PO-54321",
    created_by: 2,
  },
  {
    id: 2011,
    work_order_id: 1003,
    analysis_number: "ACME-008-GPA2261-00011",
    date: "2025-11-25",
    producer: "Acme Production",
    sampled_by_natty: false,
    company: "Acme Corporation",
    area: "East Field",
    well_name: "Well B-3",
    meter_number: "MTR-203",
    flow_rate: "1850 MCFD",
    pressure: "885 PSI",
    temperature: "75 F",
    field_h2s: "0 PPM",
    cost_code: "CC-003",
    cylinder_number: "BTL-203", // ✅ Changed from bottle_number
    remarks: "",
    check_in_time: "2025-11-25T11:00:00Z",
    analysis_type: "GPA 2261",
    check_in_type: "Field Sample",
    rushed: false,
    price: 145.0,
    tag_image: "",
    billing_reference_type: "PO",
    billing_reference_number: "PO-54321",
    created_by: 2,
  },
  {
    id: 2012,
    work_order_id: 1003,
    analysis_number: "ACME-009-GPA2172-00012",
    date: "2025-11-25",
    producer: "Acme Production",
    sampled_by_natty: false,
    company: "Acme Corporation",
    area: "East Field",
    well_name: "Well B-4",
    meter_number: "MTR-204",
    flow_rate: "1950 MCFD",
    pressure: "895 PSI",
    temperature: "76 F",
    field_h2s: "0 PPM",
    cost_code: "CC-003",
    cylinder_number: "BTL-204", // ✅ Changed from bottle_number
    remarks: "",
    check_in_time: "2025-11-25T11:30:00Z",
    analysis_type: "GPA 2172",
    check_in_type: "Field Sample",
    rushed: false,
    price: 145.0,
    tag_image: "",
    billing_reference_type: "PO",
    billing_reference_number: "PO-54321",
    created_by: 2,
  },

  // Lines for WO-001237 (2 cylinders) - Already Invoiced
  {
    id: 2013,
    work_order_id: 1004,
    analysis_number: "IND-001-GPA2261-00013",
    date: "2025-10-30",
    producer: "Industrial Production",
    sampled_by_natty: false,
    company: "Industrial Co",
    area: "West Field",
    well_name: "Well I-1",
    meter_number: "MTR-301",
    flow_rate: "3000 MCFD",
    pressure: "950 PSI",
    temperature: "79 F",
    field_h2s: "0 PPM",
    cost_code: "CC-004",
    cylinder_number: "BTL-301", // ✅ Changed from bottle_number
    remarks: "",
    check_in_time: "2025-10-30T11:00:00Z",
    analysis_type: "GPA 2261",
    check_in_type: "Field Sample",
    rushed: false,
    price: 145.0,
    tag_image: "",
    billing_reference_type: "WO",
    billing_reference_number: "WO-99999",
    created_by: 1,
  },
  {
    id: 2014,
    work_order_id: 1004,
    analysis_number: "IND-002-GPA2261-00014",
    date: "2025-10-30",
    producer: "Industrial Production",
    sampled_by_natty: false,
    company: "Industrial Co",
    area: "West Field",
    well_name: "Well I-2",
    meter_number: "MTR-302",
    flow_rate: "2900 MCFD",
    pressure: "945 PSI",
    temperature: "79 F",
    field_h2s: "0 PPM",
    cost_code: "CC-004",
    cylinder_number: "BTL-302", // ✅ Changed from bottle_number
    remarks: "",
    check_in_time: "2025-10-30T11:30:00Z",
    analysis_type: "GPA 2261",
    check_in_type: "Field Sample",
    rushed: false,
    price: 145.0,
    tag_image: "",
    billing_reference_type: "WO",
    billing_reference_number: "WO-99999",
    created_by: 1,
  },

  // Lines for WO-001238 (3 cylinders) - Pending
  {
    id: 2015,
    work_order_id: 1005,
    analysis_number: "TECH-001-BTU-00015",
    date: "2025-12-02",
    producer: "TechGas Producer",
    sampled_by_natty: true,
    company: "TechGas Inc",
    area: "South Field",
    well_name: "Well T-1",
    meter_number: "MTR-401",
    flow_rate: "2200 MCFD",
    pressure: "920 PSI",
    temperature: "77 F",
    field_h2s: "5 PPM",
    cost_code: "CC-005",
    cylinder_number: "BTL-401",
    remarks: "Standard BTU",
    check_in_time: "2025-12-02T14:35:00Z",
    analysis_type: "BTU Analysis",
    check_in_type: "Field Sample",
    rushed: false,
    price: 150.0,
    tag_image: "",
    billing_reference_type: "PO",
    billing_reference_number: "PO-67890",
    created_by: 2,
  },
  {
    id: 2016,
    work_order_id: 1005,
    analysis_number: "TECH-002-BTU-00016",
    date: "2025-12-02",
    producer: "TechGas Producer",
    sampled_by_natty: true,
    company: "TechGas Inc",
    area: "South Field",
    well_name: "Well T-2",
    meter_number: "MTR-402",
    flow_rate: "2100 MCFD",
    pressure: "910 PSI",
    temperature: "76 F",
    field_h2s: "4 PPM",
    cost_code: "CC-005",
    cylinder_number: "BTL-402",
    remarks: "",
    check_in_time: "2025-12-02T14:40:00Z",
    analysis_type: "BTU Analysis",
    check_in_type: "Field Sample",
    rushed: false,
    price: 150.0,
    tag_image: "",
    billing_reference_type: "PO",
    billing_reference_number: "PO-67890",
    created_by: 2,
  },
  {
    id: 2017,
    work_order_id: 1005,
    analysis_number: "TECH-003-BTU-00017",
    date: "2025-12-02",
    producer: "TechGas Producer",
    sampled_by_natty: true,
    company: "TechGas Inc",
    area: "South Field",
    well_name: "Well T-3",
    meter_number: "MTR-403",
    flow_rate: "2300 MCFD",
    pressure: "930 PSI",
    temperature: "78 F",
    field_h2s: "6 PPM",
    cost_code: "CC-005",
    cylinder_number: "BTL-403",
    remarks: "",
    check_in_time: "2025-12-02T14:45:00Z",
    analysis_type: "BTU Analysis",
    check_in_type: "Field Sample",
    rushed: false,
    price: 150.0,
    tag_image: "",
    billing_reference_type: "PO",
    billing_reference_number: "PO-67890",
    created_by: 2,
  },

  // Lines for WO-001215 (8 cylinders) - Pending
  {
    id: 2018,
    work_order_id: 1006,
    analysis_number: "IND-002-GPA2172-00018",
    date: "2025-11-30",
    producer: "Industrial Production",
    sampled_by_natty: false,
    company: "Industrial Co",
    area: "West Field",
    well_name: "Well I-5",
    meter_number: "MTR-501",
    flow_rate: "2800 MCFD",
    pressure: "940 PSI",
    temperature: "78 F",
    field_h2s: "3 PPM",
    cost_code: "CC-006",
    cylinder_number: "BTL-501",
    remarks: "Priority analysis",
    check_in_time: "2025-11-30T08:15:00Z",
    analysis_type: "GPA 2172",
    check_in_type: "Field Sample",
    rushed: false,
    price: 200.0,
    tag_image: "",
    billing_reference_type: "PO",
    billing_reference_number: "PO-11111",
    created_by: 3,
  },
  {
    id: 2019,
    work_order_id: 1006,
    analysis_number: "IND-003-GPA2172-00019",
    date: "2025-11-30",
    producer: "Industrial Production",
    sampled_by_natty: false,
    company: "Industrial Co",
    area: "West Field",
    well_name: "Well I-6",
    meter_number: "MTR-502",
    flow_rate: "2900 MCFD",
    pressure: "950 PSI",
    temperature: "79 F",
    field_h2s: "4 PPM",
    cost_code: "CC-006",
    cylinder_number: "BTL-502",
    remarks: "",
    check_in_time: "2025-11-30T08:20:00Z",
    analysis_type: "GPA 2172",
    check_in_type: "Field Sample",
    rushed: false,
    price: 200.0,
    tag_image: "",
    billing_reference_type: "PO",
    billing_reference_number: "PO-11111",
    created_by: 3,
  },
  {
    id: 2020,
    work_order_id: 1006,
    analysis_number: "IND-004-GPA2172-00020",
    date: "2025-11-30",
    producer: "Industrial Production",
    sampled_by_natty: false,
    company: "Industrial Co",
    area: "West Field",
    well_name: "Well I-7",
    meter_number: "MTR-503",
    flow_rate: "3000 MCFD",
    pressure: "960 PSI",
    temperature: "80 F",
    field_h2s: "5 PPM",
    cost_code: "CC-006",
    cylinder_number: "BTL-503",
    remarks: "",
    check_in_time: "2025-11-30T08:25:00Z",
    analysis_type: "GPA 2172",
    check_in_type: "Field Sample",
    rushed: false,
    price: 200.0,
    tag_image: "",
    billing_reference_type: "PO",
    billing_reference_number: "PO-11111",
    created_by: 3,
  },
  {
    id: 2021,
    work_order_id: 1006,
    analysis_number: "IND-005-GPA2172-00021",
    date: "2025-11-30",
    producer: "Industrial Production",
    sampled_by_natty: false,
    company: "Industrial Co",
    area: "West Field",
    well_name: "Well I-8",
    meter_number: "MTR-504",
    flow_rate: "3100 MCFD",
    pressure: "970 PSI",
    temperature: "81 F",
    field_h2s: "6 PPM",
    cost_code: "CC-006",
    cylinder_number: "BTL-504",
    remarks: "",
    check_in_time: "2025-11-30T08:30:00Z",
    analysis_type: "GPA 2172",
    check_in_type: "Field Sample",
    rushed: false,
    price: 200.0,
    tag_image: "",
    billing_reference_type: "PO",
    billing_reference_number: "PO-11111",
    created_by: 3,
  },
  {
    id: 2022,
    work_order_id: 1006,
    analysis_number: "IND-006-GPA2172-00022",
    date: "2025-11-30",
    producer: "Industrial Production",
    sampled_by_natty: false,
    company: "Industrial Co",
    area: "West Field",
    well_name: "Well I-9",
    meter_number: "MTR-505",
    flow_rate: "3200 MCFD",
    pressure: "980 PSI",
    temperature: "82 F",
    field_h2s: "7 PPM",
    cost_code: "CC-006",
    cylinder_number: "BTL-505",
    remarks: "",
    check_in_time: "2025-11-30T08:35:00Z",
    analysis_type: "GPA 2172",
    check_in_type: "Field Sample",
    rushed: false,
    price: 200.0,
    tag_image: "",
    billing_reference_type: "PO",
    billing_reference_number: "PO-11111",
    created_by: 3,
  },
  {
    id: 2023,
    work_order_id: 1006,
    analysis_number: "IND-007-GPA2172-00023",
    date: "2025-11-30",
    producer: "Industrial Production",
    sampled_by_natty: false,
    company: "Industrial Co",
    area: "West Field",
    well_name: "Well I-10",
    meter_number: "MTR-506",
    flow_rate: "3300 MCFD",
    pressure: "990 PSI",
    temperature: "83 F",
    field_h2s: "8 PPM",
    cost_code: "CC-006",
    cylinder_number: "BTL-506",
    remarks: "",
    check_in_time: "2025-11-30T08:40:00Z",
    analysis_type: "GPA 2172",
    check_in_type: "Field Sample",
    rushed: false,
    price: 200.0,
    tag_image: "",
    billing_reference_type: "PO",
    billing_reference_number: "PO-11111",
    created_by: 3,
  },
  {
    id: 2024,
    work_order_id: 1006,
    analysis_number: "IND-008-GPA2172-00024",
    date: "2025-11-30",
    producer: "Industrial Production",
    sampled_by_natty: false,
    company: "Industrial Co",
    area: "West Field",
    well_name: "Well I-11",
    meter_number: "MTR-507",
    flow_rate: "3400 MCFD",
    pressure: "1000 PSI",
    temperature: "84 F",
    field_h2s: "9 PPM",
    cost_code: "CC-006",
    cylinder_number: "BTL-507",
    remarks: "",
    check_in_time: "2025-11-30T08:45:00Z",
    analysis_type: "GPA 2172",
    check_in_type: "Field Sample",
    rushed: false,
    price: 200.0,
    tag_image: "",
    billing_reference_type: "PO",
    billing_reference_number: "PO-11111",
    created_by: 3,
  },
  {
    id: 2025,
    work_order_id: 1006,
    analysis_number: "IND-009-GPA2172-00025",
    date: "2025-11-30",
    producer: "Industrial Production",
    sampled_by_natty: false,
    company: "Industrial Co",
    area: "West Field",
    well_name: "Well I-12",
    meter_number: "MTR-508",
    flow_rate: "3500 MCFD",
    pressure: "1010 PSI",
    temperature: "85 F",
    field_h2s: "10 PPM",
    cost_code: "CC-006",
    cylinder_number: "BTL-508",
    remarks: "",
    check_in_time: "2025-11-30T08:50:00Z",
    analysis_type: "GPA 2172",
    check_in_type: "Field Sample",
    rushed: false,
    price: 200.0,
    tag_image: "",
    billing_reference_type: "PO",
    billing_reference_number: "PO-11111",
    created_by: 3,
  },

  // Lines for WO-001228 (2 cylinders) - In Progress
  {
    id: 2026,
    work_order_id: 1007,
    analysis_number: "GAS-001-EXT-00026",
    date: "2025-11-29",
    producer: "Gas Solutions Producer",
    sampled_by_natty: true,
    company: "Gas Solutions",
    area: "Central Field",
    well_name: "Well G-1",
    meter_number: "MTR-601",
    flow_rate: "1600 MCFD",
    pressure: "860 PSI",
    temperature: "74 F",
    field_h2s: "2 PPM",
    cost_code: "CC-007",
    cylinder_number: "BTL-601",
    remarks: "Extended analysis required",
    check_in_time: "2025-11-29T16:45:00Z",
    analysis_type: "Extended Analysis",
    check_in_type: "Field Sample",
    rushed: false,
    price: 250.0,
    tag_image: "",
    billing_reference_type: "Invoice",
    billing_reference_number: "INV-22222",
    created_by: 4,
  },
  {
    id: 2027,
    work_order_id: 1007,
    analysis_number: "GAS-002-EXT-00027",
    date: "2025-11-29",
    producer: "Gas Solutions Producer",
    sampled_by_natty: true,
    company: "Gas Solutions",
    area: "Central Field",
    well_name: "Well G-2",
    meter_number: "MTR-602",
    flow_rate: "1700 MCFD",
    pressure: "870 PSI",
    temperature: "75 F",
    field_h2s: "3 PPM",
    cost_code: "CC-007",
    cylinder_number: "BTL-602",
    remarks: "",
    check_in_time: "2025-11-29T16:50:00Z",
    analysis_type: "Extended Analysis",
    check_in_type: "Field Sample",
    rushed: false,
    price: 250.0,
    tag_image: "",
    billing_reference_type: "Invoice",
    billing_reference_number: "INV-22222",
    created_by: 4,
  },

  // Lines for WO-001242 (4 cylinders) - Pending
  {
    id: 2028,
    work_order_id: 1008,
    analysis_number: "ACME-010-GPA2261-00028",
    date: "2025-12-02",
    producer: "Acme Production",
    sampled_by_natty: false,
    company: "Acme Corporation",
    area: "North Field",
    well_name: "Well A-10",
    meter_number: "MTR-701",
    flow_rate: "1800 MCFD",
    pressure: "880 PSI",
    temperature: "76 F",
    field_h2s: "4 PPM",
    cost_code: "CC-001",
    cylinder_number: "BTL-701",
    remarks: "Standard analysis",
    check_in_time: "2025-12-02T10:30:00Z",
    analysis_type: "GPA 2261",
    check_in_type: "Field Sample",
    rushed: false,
    price: 150.0,
    tag_image: "",
    billing_reference_type: "PO",
    billing_reference_number: "PO-33333",
    created_by: 5,
  },
  {
    id: 2029,
    work_order_id: 1008,
    analysis_number: "ACME-011-GPA2261-00029",
    date: "2025-12-02",
    producer: "Acme Production",
    sampled_by_natty: false,
    company: "Acme Corporation",
    area: "North Field",
    well_name: "Well A-11",
    meter_number: "MTR-702",
    flow_rate: "1900 MCFD",
    pressure: "890 PSI",
    temperature: "77 F",
    field_h2s: "5 PPM",
    cost_code: "CC-001",
    cylinder_number: "BTL-702",
    remarks: "",
    check_in_time: "2025-12-02T10:35:00Z",
    analysis_type: "GPA 2261",
    check_in_type: "Field Sample",
    rushed: false,
    price: 150.0,
    tag_image: "",
    billing_reference_type: "PO",
    billing_reference_number: "PO-33333",
    created_by: 5,
  },
  {
    id: 2030,
    work_order_id: 1008,
    analysis_number: "ACME-012-GPA2261-00030",
    date: "2025-12-02",
    producer: "Acme Production",
    sampled_by_natty: false,
    company: "Acme Corporation",
    area: "North Field",
    well_name: "Well A-12",
    meter_number: "MTR-703",
    flow_rate: "2000 MCFD",
    pressure: "900 PSI",
    temperature: "78 F",
    field_h2s: "6 PPM",
    cost_code: "CC-001",
    cylinder_number: "BTL-703",
    remarks: "",
    check_in_time: "2025-12-02T10:40:00Z",
    analysis_type: "GPA 2261",
    check_in_type: "Field Sample",
    rushed: false,
    price: 150.0,
    tag_image: "",
    billing_reference_type: "PO",
    billing_reference_number: "PO-33333",
    created_by: 5,
  },
  {
    id: 2031,
    work_order_id: 1008,
    analysis_number: "ACME-013-GPA2261-00031",
    date: "2025-12-02",
    producer: "Acme Production",
    sampled_by_natty: false,
    company: "Acme Corporation",
    area: "North Field",
    well_name: "Well A-13",
    meter_number: "MTR-704",
    flow_rate: "2100 MCFD",
    pressure: "910 PSI",
    temperature: "79 F",
    field_h2s: "7 PPM",
    cost_code: "CC-001",
    cylinder_number: "BTL-704",
    remarks: "",
    check_in_time: "2025-12-02T10:45:00Z",
    analysis_type: "GPA 2261",
    check_in_type: "Field Sample",
    rushed: false,
    price: 150.0,
    tag_image: "",
    billing_reference_type: "PO",
    billing_reference_number: "PO-33333",
    created_by: 5,
  },

  // Lines for WO-001220 (6 cylinders) - In Progress
  {
    id: 2032,
    work_order_id: 1009,
    analysis_number: "ACME-014-BTU-00032",
    date: "2025-11-28",
    producer: "Acme Production",
    sampled_by_natty: true,
    company: "Acme Corporation",
    area: "East Field",
    well_name: "Well A-14",
    meter_number: "MTR-801",
    flow_rate: "2200 MCFD",
    pressure: "920 PSI",
    temperature: "80 F",
    field_h2s: "8 PPM",
    cost_code: "CC-002",
    cylinder_number: "BTL-801",
    remarks: "BTU analysis in progress",
    check_in_time: "2025-11-28T13:20:00Z",
    analysis_type: "BTU Analysis",
    check_in_type: "Field Sample",
    rushed: false,
    price: 150.0,
    tag_image: "",
    billing_reference_type: "PO",
    billing_reference_number: "PO-44444",
    created_by: 6,
  },
  {
    id: 2033,
    work_order_id: 1009,
    analysis_number: "ACME-015-BTU-00033",
    date: "2025-11-28",
    producer: "Acme Production",
    sampled_by_natty: true,
    company: "Acme Corporation",
    area: "East Field",
    well_name: "Well A-15",
    meter_number: "MTR-802",
    flow_rate: "2300 MCFD",
    pressure: "930 PSI",
    temperature: "81 F",
    field_h2s: "9 PPM",
    cost_code: "CC-002",
    cylinder_number: "BTL-802",
    remarks: "",
    check_in_time: "2025-11-28T13:25:00Z",
    analysis_type: "BTU Analysis",
    check_in_type: "Field Sample",
    rushed: false,
    price: 150.0,
    tag_image: "",
    billing_reference_type: "PO",
    billing_reference_number: "PO-44444",
    created_by: 6,
  },
  {
    id: 2034,
    work_order_id: 1009,
    analysis_number: "ACME-016-BTU-00034",
    date: "2025-11-28",
    producer: "Acme Production",
    sampled_by_natty: true,
    company: "Acme Corporation",
    area: "East Field",
    well_name: "Well A-16",
    meter_number: "MTR-803",
    flow_rate: "2400 MCFD",
    pressure: "940 PSI",
    temperature: "82 F",
    field_h2s: "10 PPM",
    cost_code: "CC-002",
    cylinder_number: "BTL-803",
    remarks: "",
    check_in_time: "2025-11-28T13:30:00Z",
    analysis_type: "BTU Analysis",
    check_in_type: "Field Sample",
    rushed: false,
    price: 150.0,
    tag_image: "",
    billing_reference_type: "PO",
    billing_reference_number: "PO-44444",
    created_by: 6,
  },
  {
    id: 2035,
    work_order_id: 1009,
    analysis_number: "ACME-017-BTU-00035",
    date: "2025-11-28",
    producer: "Acme Production",
    sampled_by_natty: true,
    company: "Acme Corporation",
    area: "East Field",
    well_name: "Well A-17",
    meter_number: "MTR-804",
    flow_rate: "2500 MCFD",
    pressure: "950 PSI",
    temperature: "83 F",
    field_h2s: "11 PPM",
    cost_code: "CC-002",
    cylinder_number: "BTL-804",
    remarks: "",
    check_in_time: "2025-11-28T13:35:00Z",
    analysis_type: "BTU Analysis",
    check_in_type: "Field Sample",
    rushed: false,
    price: 150.0,
    tag_image: "",
    billing_reference_type: "PO",
    billing_reference_number: "PO-44444",
    created_by: 6,
  },
  {
    id: 2036,
    work_order_id: 1009,
    analysis_number: "ACME-018-BTU-00036",
    date: "2025-11-28",
    producer: "Acme Production",
    sampled_by_natty: true,
    company: "Acme Corporation",
    area: "East Field",
    well_name: "Well A-18",
    meter_number: "MTR-805",
    flow_rate: "2600 MCFD",
    pressure: "960 PSI",
    temperature: "84 F",
    field_h2s: "12 PPM",
    cost_code: "CC-002",
    cylinder_number: "BTL-805",
    remarks: "",
    check_in_time: "2025-11-28T13:40:00Z",
    analysis_type: "BTU Analysis",
    check_in_type: "Field Sample",
    rushed: false,
    price: 150.0,
    tag_image: "",
    billing_reference_type: "PO",
    billing_reference_number: "PO-44444",
    created_by: 6,
  },
  {
    id: 2037,
    work_order_id: 1009,
    analysis_number: "ACME-019-BTU-00037",
    date: "2025-11-28",
    producer: "Acme Production",
    sampled_by_natty: true,
    company: "Acme Corporation",
    area: "East Field",
    well_name: "Well A-19",
    meter_number: "MTR-806",
    flow_rate: "2700 MCFD",
    pressure: "970 PSI",
    temperature: "85 F",
    field_h2s: "13 PPM",
    cost_code: "CC-002",
    cylinder_number: "BTL-806",
    remarks: "",
    check_in_time: "2025-11-28T13:45:00Z",
    analysis_type: "BTU Analysis",
    check_in_type: "Field Sample",
    rushed: false,
    price: 150.0,
    tag_image: "",
    billing_reference_type: "PO",
    billing_reference_number: "PO-44444",
    created_by: 6,
  },

  // Lines for WO-001245 (3 cylinders) - Pending
  {
    id: 2038,
    work_order_id: 1010,
    analysis_number: "TECH-004-GPA2172-00038",
    date: "2025-12-02",
    producer: "TechGas Producer",
    sampled_by_natty: false,
    company: "TechGas Inc",
    area: "South Field",
    well_name: "Well T-10",
    meter_number: "MTR-901",
    flow_rate: "2800 MCFD",
    pressure: "980 PSI",
    temperature: "86 F",
    field_h2s: "14 PPM",
    cost_code: "CC-005",
    cylinder_number: "BTL-901",
    remarks: "Priority",
    check_in_time: "2025-12-02T11:50:00Z",
    analysis_type: "GPA 2172",
    check_in_type: "Field Sample",
    rushed: false,
    price: 200.0,
    tag_image: "",
    billing_reference_type: "PO",
    billing_reference_number: "PO-55555",
    created_by: 7,
  },
  {
    id: 2039,
    work_order_id: 1010,
    analysis_number: "TECH-005-GPA2172-00039",
    date: "2025-12-02",
    producer: "TechGas Producer",
    sampled_by_natty: false,
    company: "TechGas Inc",
    area: "South Field",
    well_name: "Well T-11",
    meter_number: "MTR-902",
    flow_rate: "2900 MCFD",
    pressure: "990 PSI",
    temperature: "87 F",
    field_h2s: "15 PPM",
    cost_code: "CC-005",
    cylinder_number: "BTL-902",
    remarks: "",
    check_in_time: "2025-12-02T11:55:00Z",
    analysis_type: "GPA 2172",
    check_in_type: "Field Sample",
    rushed: false,
    price: 200.0,
    tag_image: "",
    billing_reference_type: "PO",
    billing_reference_number: "PO-55555",
    created_by: 7,
  },
  {
    id: 2040,
    work_order_id: 1010,
    analysis_number: "TECH-006-GPA2172-00040",
    date: "2025-12-02",
    producer: "TechGas Producer",
    sampled_by_natty: false,
    company: "TechGas Inc",
    area: "South Field",
    well_name: "Well T-12",
    meter_number: "MTR-903",
    flow_rate: "3000 MCFD",
    pressure: "1000 PSI",
    temperature: "88 F",
    field_h2s: "16 PPM",
    cost_code: "CC-005",
    cylinder_number: "BTL-903",
    remarks: "",
    check_in_time: "2025-12-02T12:00:00Z",
    analysis_type: "GPA 2172",
    check_in_type: "Field Sample",
    rushed: false,
    price: 200.0,
    tag_image: "",
    billing_reference_type: "PO",
    billing_reference_number: "PO-55555",
    created_by: 7,
  },

  // Lines for WO-001218 (7 cylinders) - In Progress
  {
    id: 2041,
    work_order_id: 1011,
    analysis_number: "IND-010-EXT-00041",
    date: "2025-11-27",
    producer: "Industrial Production",
    sampled_by_natty: true,
    company: "Industrial Co",
    area: "North Field",
    well_name: "Well I-20",
    meter_number: "MTR-1001",
    flow_rate: "3100 MCFD",
    pressure: "1010 PSI",
    temperature: "89 F",
    field_h2s: "17 PPM",
    cost_code: "CC-006",
    cylinder_number: "BTL-1001",
    remarks: "Extended analysis in progress",
    check_in_time: "2025-11-27T07:40:00Z",
    analysis_type: "Extended Analysis",
    check_in_type: "Field Sample",
    rushed: false,
    price: 250.0,
    tag_image: "",
    billing_reference_type: "Invoice",
    billing_reference_number: "INV-66666",
    created_by: 8,
  },
  {
    id: 2042,
    work_order_id: 1011,
    analysis_number: "IND-011-EXT-00042",
    date: "2025-11-27",
    producer: "Industrial Production",
    sampled_by_natty: true,
    company: "Industrial Co",
    area: "North Field",
    well_name: "Well I-21",
    meter_number: "MTR-1002",
    flow_rate: "3200 MCFD",
    pressure: "1020 PSI",
    temperature: "90 F",
    field_h2s: "18 PPM",
    cost_code: "CC-006",
    cylinder_number: "BTL-1002",
    remarks: "",
    check_in_time: "2025-11-27T07:45:00Z",
    analysis_type: "Extended Analysis",
    check_in_type: "Field Sample",
    rushed: false,
    price: 250.0,
    tag_image: "",
    billing_reference_type: "Invoice",
    billing_reference_number: "INV-66666",
    created_by: 8,
  },
  {
    id: 2043,
    work_order_id: 1011,
    analysis_number: "IND-012-EXT-00043",
    date: "2025-11-27",
    producer: "Industrial Production",
    sampled_by_natty: true,
    company: "Industrial Co",
    area: "North Field",
    well_name: "Well I-22",
    meter_number: "MTR-1003",
    flow_rate: "3300 MCFD",
    pressure: "1030 PSI",
    temperature: "91 F",
    field_h2s: "19 PPM",
    cost_code: "CC-006",
    cylinder_number: "BTL-1003",
    remarks: "",
    check_in_time: "2025-11-27T07:50:00Z",
    analysis_type: "Extended Analysis",
    check_in_type: "Field Sample",
    rushed: false,
    price: 250.0,
    tag_image: "",
    billing_reference_type: "Invoice",
    billing_reference_number: "INV-66666",
    created_by: 8,
  },
  {
    id: 2044,
    work_order_id: 1011,
    analysis_number: "IND-013-EXT-00044",
    date: "2025-11-27",
    producer: "Industrial Production",
    sampled_by_natty: true,
    company: "Industrial Co",
    area: "North Field",
    well_name: "Well I-23",
    meter_number: "MTR-1004",
    flow_rate: "3400 MCFD",
    pressure: "1040 PSI",
    temperature: "92 F",
    field_h2s: "20 PPM",
    cost_code: "CC-006",
    cylinder_number: "BTL-1004",
    remarks: "",
    check_in_time: "2025-11-27T07:55:00Z",
    analysis_type: "Extended Analysis",
    check_in_type: "Field Sample",
    rushed: false,
    price: 250.0,
    tag_image: "",
    billing_reference_type: "Invoice",
    billing_reference_number: "INV-66666",
    created_by: 8,
  },
  {
    id: 2045,
    work_order_id: 1011,
    analysis_number: "IND-014-EXT-00045",
    date: "2025-11-27",
    producer: "Industrial Production",
    sampled_by_natty: true,
    company: "Industrial Co",
    area: "North Field",
    well_name: "Well I-24",
    meter_number: "MTR-1005",
    flow_rate: "3500 MCFD",
    pressure: "1050 PSI",
    temperature: "93 F",
    field_h2s: "21 PPM",
    cost_code: "CC-006",
    cylinder_number: "BTL-1005",
    remarks: "",
    check_in_time: "2025-11-27T08:00:00Z",
    analysis_type: "Extended Analysis",
    check_in_type: "Field Sample",
    rushed: false,
    price: 250.0,
    tag_image: "",
    billing_reference_type: "Invoice",
    billing_reference_number: "INV-66666",
    created_by: 8,
  },
  {
    id: 2046,
    work_order_id: 1011,
    analysis_number: "IND-015-EXT-00046",
    date: "2025-11-27",
    producer: "Industrial Production",
    sampled_by_natty: true,
    company: "Industrial Co",
    area: "North Field",
    well_name: "Well I-25",
    meter_number: "MTR-1006",
    flow_rate: "3600 MCFD",
    pressure: "1060 PSI",
    temperature: "94 F",
    field_h2s: "22 PPM",
    cost_code: "CC-006",
    cylinder_number: "BTL-1006",
    remarks: "",
    check_in_time: "2025-11-27T08:05:00Z",
    analysis_type: "Extended Analysis",
    check_in_type: "Field Sample",
    rushed: false,
    price: 250.0,
    tag_image: "",
    billing_reference_type: "Invoice",
    billing_reference_number: "INV-66666",
    created_by: 8,
  },
  {
    id: 2047,
    work_order_id: 1011,
    analysis_number: "IND-016-EXT-00047",
    date: "2025-11-27",
    producer: "Industrial Production",
    sampled_by_natty: true,
    company: "Industrial Co",
    area: "North Field",
    well_name: "Well I-26",
    meter_number: "MTR-1007",
    flow_rate: "3700 MCFD",
    pressure: "1070 PSI",
    temperature: "95 F",
    field_h2s: "23 PPM",
    cost_code: "CC-006",
    cylinder_number: "BTL-1007",
    remarks: "",
    check_in_time: "2025-11-27T08:10:00Z",
    analysis_type: "Extended Analysis",
    check_in_type: "Field Sample",
    rushed: false,
    price: 250.0,
    tag_image: "",
    billing_reference_type: "Invoice",
    billing_reference_number: "INV-66666",
    created_by: 8,
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

  calculateDaysSince: (
    dateString: string,
    currentDate: string = "2025-11-17",
  ): number => {
    const orderDate = new Date(dateString);
    const today = new Date(currentDate);
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

      // Only allow sample_fee to be changed by user input (field === 'sample_fee')
      let updatedItem: LineItem;
      if (field === "sample_fee") {
        updatedItem = { ...item, sample_fee: Number(value) };
        updatedItem.amount =
          item.applied_rate +
          updatedItem.sample_fee +
          item.h2_pop_fee +
          item.spot_composite_fee;
        return updatedItem;
      }

      // For all other fields, do NOT change sample_fee
      updatedItem = { ...item, [field]: value } as LineItem;

      if (field === "analysis_type") {
        const analysisPrice = analysisPricingService.getAnalysisPriceByCode(
          value as string,
        );
        if (analysisPrice) {
          updatedItem.standard_rate = analysisPrice.standard_rate || 0;
          updatedItem.applied_rate = item.rushed
            ? analysisPrice.rushed_rate
            : analysisPrice.standard_rate;
        } else {
          const newRate = workOrdersService.getRateByAnalysisType(
            value as string,
          );
          updatedItem.standard_rate = newRate;
          updatedItem.applied_rate = item.rushed ? newRate * 1.5 : newRate;
        }
        updatedItem.amount =
          updatedItem.applied_rate +
          item.sample_fee +
          item.h2_pop_fee +
          item.spot_composite_fee;
      }

      if (field === "rushed") {
        const isRushed = value as boolean;
        const analysisPrice = analysisPricingService.getAnalysisPriceByCode(
          item.analysis_type,
        );
        if (analysisPrice) {
          updatedItem.standard_rate = analysisPrice.standard_rate || 0;
          updatedItem.applied_rate = isRushed
            ? analysisPrice.rushed_rate
            : analysisPrice.standard_rate;
        } else {
          // item.standard_rate may be outdated if analysis_type changed, so recalc
          const newRate = workOrdersService.getRateByAnalysisType(
            item.analysis_type,
          );
          updatedItem.standard_rate = newRate;
          updatedItem.applied_rate = isRushed ? newRate * 1.5 : newRate;
        }
        updatedItem.amount =
          updatedItem.applied_rate +
          item.sample_fee +
          item.h2_pop_fee +
          item.spot_composite_fee;
      }

      // Removed 'rate' field update, replaced by 'applied_rate'.

      if (field === "h2_pop_fee") {
        updatedItem.amount =
          item.applied_rate +
          item.sample_fee +
          Number(value) +
          item.spot_composite_fee;
      }

      if (field === "spot_composite_fee") {
        updatedItem.amount =
          item.applied_rate + item.sample_fee + item.h2_pop_fee + Number(value);
      }

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
