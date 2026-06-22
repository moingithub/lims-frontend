import { API_BASE_URL } from "../config/api";
import { authService } from "./authService";

/**
 * Update status in sample_checkin by work order number
 */
const updateStatusByWorkOrderNumber = async (
  workOrderNumber: string,
  payload: { status: string },
) => {
  const token = authService.getAuthState().token;
  const response = await fetch(
    `${API_BASE_URL}/sample_checkin/update_status_by_wo/${encodeURIComponent(workOrderNumber)}`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    },
  );
  if (!response.ok) throw await response.json();
  return await response.json();
};

// ...existing code...

export interface CheckedInSample {
  id: number;
  company_id: number;
  company_contact_id?: number;
  analysis_type_id?: number;
  area_id?: number;
  customer_cylinder?: boolean;
  sampled_by_lab?: boolean;
  cylinder_id?: number | null;
  contact_id: number;
  analysis_type: string;
  area: string;
  customer_owned_cylinder: boolean;
  cylinder_number: string;
  analysis_number: string;
  date: string;
  producer: string;
  sampled_by_natty: boolean;
  well_name: string;
  meter_number: string;
  flow_rate: string;
  pressure: string;
  temperature: string;
  field_h2s: number;
  cost_code: string;
  remarks: string;
  check_in_type: "Cylinder" | "Bottle" | "CP Cylinder";
  checkin_type?: string;
  sample_type?: string;
  pressure_unit?: string;
  check_in_time: string;
  rushed: boolean;
  tag_image: string;
  billing_reference_type: string;
  billing_reference_number: string;
  invoice_ref_name?: string;
  invoice_ref_value?: string;
  scanned_tag_image?: string | null;
  work_order_number?: string;
  status?: string;
  created_by: number;
}

export interface Customer {
  id: number;
  code: string;
  name: string;
  contact: string;
  email: string;
  status: string;
}

export interface Contact {
  id: number;
  company_id: number;
  name: string;
  phone: string;
  email: string;
}

export interface SampleCheckInPayload {
  company_id: number;
  company_contact_id: number;
  analysis_type_id: number | null;
  area_id: number | null;
  customer_cylinder: boolean;
  rushed: boolean;
  sampled_by_lab: boolean;
  cylinder_id: number | null;
  cylinder_number: string;
  analysis_number: string;
  producer: string;
  well_name: string;
  meter_number: string;
  sample_type: string;
  flow_rate: string;
  pressure: string;
  pressure_unit: string;
  temperature: string;
  field_h2s: number;
  cost_code: string;
  checkin_type: string;
  invoice_ref_name: string;
  invoice_ref_value: string;
  remarks: string;
  scanned_tag_image: string | null;
  work_order_number?: string;
  status: string;
  h2_pop_fee?: number;
}

export interface UpdateWOLinePayload {
  analysis_type_id: number;
  rushed: boolean;
  standard_rate: number;
  applied_rate: number;
  sample_fee: number;
  h2_pop_fee: number;
  spot_composite_fee: number;
}

type SampleCheckInApiRecord = {
  id: number;
  analysis_number: string;
};

const buildAuthHeaders = (): HeadersInit => {
  const token = authService.getAuthState().token;
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

let sampleCheckInApiCache: SampleCheckInApiRecord[] = [];
let sampleCheckInApiCacheLoaded = false;

// Import workOrdersService for work order creation
import {
  workOrdersService,
  WorkOrderHeader,
  WorkOrderLine,
} from "./workOrdersService";

const initialCustomers: Customer[] = [
  {
    id: 1,
    code: "ACME",
    name: "Acme Corporation",
    contact: "John Doe",
    email: "john@acme.com",
    status: "Active",
  },
  {
    id: 2,
    code: "TECH",
    name: "TechGas Inc",
    contact: "Jane Smith",
    email: "jane@techgas.com",
    status: "Active",
  },
  {
    id: 3,
    code: "IND",
    name: "Industrial Co",
    contact: "Bob Johnson",
    email: "bob@industrial.com",
    status: "Active",
  },
  {
    id: 4,
    code: "GAS",
    name: "Gas Solutions",
    contact: "Alice Brown",
    email: "alice@gassolutions.com",
    status: "Active",
  },
];

const initialContacts: Contact[] = [
  {
    id: 1,
    company_id: 1,
    name: "John Doe",
    phone: "+1-555-0101",
    email: "john@acme.com",
  },
  {
    id: 2,
    company_id: 1,
    name: "Sarah Lee",
    phone: "+1-555-0102",
    email: "sarah@acme.com",
  },
  {
    id: 3,
    company_id: 2,
    name: "Jane Smith",
    phone: "+1-555-0201",
    email: "jane@techgas.com",
  },
  {
    id: 4,
    company_id: 3,
    name: "Bob Johnson",
    phone: "+1-555-0301",
    email: "bob@industrial.com",
  },
  {
    id: 5,
    company_id: 4,
    name: "Alice Brown",
    phone: "+1-555-0401",
    email: "alice@gassolutions.com",
  },
];

// In-memory storage for checked-in samples with sample data
let checkedInSamples: CheckedInSample[] = [
  {
    id: 1,
    company_id: 1,
    contact_id: 1,
    analysis_type: "GPA 2261",
    area: "North Field",
    customer_owned_cylinder: false,
    cylinder_number: "CYL-001",
    analysis_number: "GPA-ACME-001",
    date: "2025-11-15",
    producer: "Acme Gas",
    sampled_by_natty: true,
    well_name: "Well A-1",
    meter_number: "M-001",
    flow_rate: "1500",
    pressure: "850",
    temperature: "72",
    field_h2s: 5,
    cost_code: "CC-001",
    remarks: "Standard sample",
    check_in_type: "Cylinder",
    check_in_time: "2025-11-15T10:30:00",
    rushed: false,
    tag_image: "",
    billing_reference_type: "PO",
    billing_reference_number: "PO-2025-001",
    created_by: 1,
  },
  {
    id: 2,
    company_id: 2,
    contact_id: 3,
    analysis_type: "GPA 2172",
    area: "South Field",
    customer_owned_cylinder: true,
    cylinder_number: "CYL-002",
    analysis_number: "GPA-TECH-002",
    date: "2025-11-20",
    producer: "TechGas Producer",
    sampled_by_natty: false,
    well_name: "Well B-2",
    meter_number: "M-002",
    flow_rate: "2000",
    pressure: "900",
    temperature: "75",
    field_h2s: 10,
    cost_code: "CC-002",
    remarks: "Rushed analysis required",
    check_in_type: "Cylinder",
    check_in_time: "2025-11-20T14:20:00",
    rushed: true,
    tag_image: "",
    billing_reference_type: "Invoice",
    billing_reference_number: "INV-2025-002",
    created_by: 2,
  },
  {
    id: 3,
    company_id: 3,
    contact_id: 4,
    analysis_type: "BTU Analysis",
    area: "East Field",
    customer_owned_cylinder: false,
    cylinder_number: "CYL-003",
    analysis_number: "BTU-IND-003",
    date: "2025-11-25",
    producer: "Industrial Producer",
    sampled_by_natty: true,
    well_name: "Well C-3",
    meter_number: "M-003",
    flow_rate: "1800",
    pressure: "875",
    temperature: "70",
    field_h2s: 8,
    cost_code: "CC-003",
    remarks: "Monthly analysis",
    check_in_type: "Cylinder",
    check_in_time: "2025-11-25T09:15:00",
    rushed: false,
    tag_image: "",
    billing_reference_type: "PO",
    billing_reference_number: "PO-2025-003",
    created_by: 3,
  },
  {
    id: 4,
    company_id: 1,
    contact_id: 1,
    analysis_type: "Extended Analysis",
    area: "North Field",
    customer_owned_cylinder: false,
    cylinder_number: "CYL-004",
    analysis_number: "EXT-ACME-004",
    date: "2025-11-28",
    producer: "Acme Gas",
    sampled_by_natty: true,
    well_name: "Well A-2",
    meter_number: "M-004",
    flow_rate: "1600",
    pressure: "860",
    temperature: "73",
    field_h2s: 6,
    cost_code: "CC-004",
    remarks: "Extended analysis for compliance",
    check_in_type: "Cylinder",
    check_in_time: "2025-11-28T11:45:00",
    rushed: true,
    tag_image: "",
    billing_reference_type: "PO",
    billing_reference_number: "PO-2025-004",
    created_by: 1,
  },
  {
    id: 5,
    company_id: 4,
    contact_id: 5,
    analysis_type: "GPA 2261",
    area: "West Field",
    customer_owned_cylinder: true,
    cylinder_number: "CYL-005",
    analysis_number: "GPA-GAS-005",
    date: "2025-11-30",
    producer: "Gas Solutions Producer",
    sampled_by_natty: false,
    well_name: "Well D-4",
    meter_number: "M-005",
    flow_rate: "1700",
    pressure: "880",
    temperature: "74",
    field_h2s: 7,
    cost_code: "CC-005",
    remarks: "Routine sample",
    check_in_type: "Cylinder",
    check_in_time: "2025-11-30T08:30:00",
    rushed: false,
    tag_image: "",
    billing_reference_type: "Invoice",
    billing_reference_number: "INV-2025-005",
    created_by: 4,
  },
];

export const sampleCheckInService = {
  getCustomers: (): Customer[] => {
    return initialCustomers;
  },

  getContacts: (): Contact[] => {
    return initialContacts;
  },

  getContactsByCustomer: (companyId: number): Contact[] => {
    return initialContacts.filter(
      (contact) => contact.company_id === companyId,
    );
  },

  getCustomerById: (id: number): Customer | undefined => {
    return initialCustomers.find((customer) => customer.id === id);
  },

  getContactById: (id: number): Contact | undefined => {
    return initialContacts.find((contact) => contact.id === id);
  },

  parseOCRTag: (tagData: string): Partial<CheckedInSample> => {
    // Mock OCR parsing - in real app would use actual OCR
    return {
      analysis_number: `AN-${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
      date: new Date().toISOString().split("T")[0],
      producer: "Sample Producer",
      area: "Sample Area",
      well_name: "Well-" + Math.floor(Math.random() * 100),
      meter_number: "MTR-" + Math.floor(Math.random() * 1000),
    };
  },

  /**
   * Parse OCR text extracted from sample tag image
   * Extracts structured data from the OCR text response
   */
  parseOCRText: (ocrText: string): Partial<CheckedInSample> => {
    const extracted: Partial<CheckedInSample> = {};

    // Producer: "Producer: ABC Energy" or "Producer. ABC Energy"
    const producerMatch = ocrText.match(/Producer[:.]\s*([^\n]*)/i);
    if (producerMatch) {
      extracted.producer = producerMatch[1].trim();
    }

    // Sampled By: "Sampled By: John Smith"
    const sampledByMatch = ocrText.match(/Sampled By[:\s]+([^\n]*)/i);
    if (sampledByMatch) {
      // Can be stored in remarks or as additional metadata
      // extracted.sampled_by = sampledByMatch[1].trim();
    }

    // Company: "Company: Acme Corporation"
    const companyMatch = ocrText.match(/Company[:\s]+([^\n]*)/i);
    if (companyMatch) {
      // Company info could be used to lookup company_id
      // extracted.company = companyMatch[1].trim();
    }

    // Area: "Area: Area1" or "Area! Area1"
    const areaMatch = ocrText.match(/Area[!:\s]+([^\n]*)/i);
    if (areaMatch) {
      extracted.area = areaMatch[1].trim();
    }

    // Well/Facility Name: "WellFaciity Name: Well 123" or "Well Facility Name: Well 123"
    const wellMatch = ocrText.match(/Well[.\s]*Fac[^:]*Name[:\s]+([^\n]*)/i);
    if (wellMatch) {
      extracted.well_name = wellMatch[1].trim();
    }

    // Meter Number: "Meter # MTR 456" or "Meter #: MTR 456"
    const meterMatch = ocrText.match(/Meter\s*#[:\s]*([^\n]*)/i);
    if (meterMatch) {
      extracted.meter_number = meterMatch[1].trim();
    }

    // Sample Type: "Sample Type: Spot" or "Sample Type: Composite"
    const sampleTypeMatch = ocrText.match(/Sample Type[:\s]+([^\n]*)/i);
    if (sampleTypeMatch) {
      extracted.sample_type = sampleTypeMatch[1].trim();
    }

    // Flow Rate: "Flow Rate: 1500 MCFD"
    const flowRateMatch = ocrText.match(/Flow Rate[:\s]+([^\n]*)/i);
    if (flowRateMatch) {
      extracted.flow_rate = flowRateMatch[1].trim();
    }

    // Pressure: "Pressure: 250 PSI"
    const pressureMatch = ocrText.match(/Pressure[:\s]+([^\n]*)/i);
    if (pressureMatch) {
      extracted.pressure = pressureMatch[1].trim();
    }

    // Pressure Unit: "PSIA" or "PSIG"
    const pressureUnitMatch = ocrText.match(
      /Pressure[:\s]+[^(]*\(?([Pp][Ss][Ii][AaGg])/,
    );
    if (pressureUnitMatch) {
      const unit = pressureUnitMatch[1].toUpperCase();
      extracted.pressure_unit =
        unit === "PSIA" || unit === "PSI-A" ? "PSIA" : "PSIG";
    }

    // Temperature: "Temp: 75 F" or "Temperature: 75 F"
    const tempMatch = ocrText.match(/Temp(?:erature)?[:\s]+([^\n]*)/i);
    if (tempMatch) {
      extracted.temperature = tempMatch[1].trim();
    }

    // Field H2S: "Field H25: 10 PPM" or "Field H2S: 10 PPM"
    const h2sMatch = ocrText.match(/Field H2[S5][:\s]+([^\n]*)/i);
    if (h2sMatch) {
      const parsed = parseFloat(h2sMatch[1].trim());
      if (!Number.isNaN(parsed)) {
        extracted.field_h2s = parsed;
      }
    }

    // Bottle/Cylinder Number: "Botte: TAG7604" or "Bottle: TAG7604" or "Bottle #: TAG7604"
    const bottleMatch = ocrText.match(/Bott(?:le)?[#:\s]*([^\n]*)/i);
    if (bottleMatch) {
      extracted.cylinder_number = bottleMatch[1].trim();
    }

    // Date: "Date: 041032026"
    const dateMatch = ocrText.match(/Date[:\s]+([^\n]*)/i);
    if (dateMatch) {
      extracted.date = dateMatch[1].trim();
    }

    return extracted;
  },

  mapOCRDataToFormFields: (
    ocrApiData: Record<string, unknown>,
  ): Partial<CheckedInSample> => {
    const mapped: Partial<CheckedInSample> = {};

    // Map fields according to API response structure
    if (ocrApiData.Date) {
      mapped.date = String(ocrApiData.Date);
    }
    if (ocrApiData.Producer) {
      mapped.producer = String(ocrApiData.Producer);
    }
    if (ocrApiData.Area) {
      mapped.area = String(ocrApiData.Area);
    }
    if (ocrApiData.Well_Lease) {
      mapped.well_name = String(ocrApiData.Well_Lease);
    }
    if (ocrApiData.Meter_Number) {
      mapped.meter_number = String(ocrApiData.Meter_Number);
    }
    if (ocrApiData.Sample_Type) {
      const sampleType = String(ocrApiData.Sample_Type).toLowerCase();
      // Default to 'spot' if not explicitly 'composite'
      mapped.sample_type = sampleType === "composite" ? "composite" : "spot";
    } else {
      mapped.sample_type = "spot"; // Default to spot
    }
    if (ocrApiData.Pressure) {
      mapped.pressure = String(ocrApiData.Pressure);
    }
    if (ocrApiData.Pressure_Unit) {
      const unit = String(ocrApiData.Pressure_Unit).toUpperCase();
      mapped.pressure_unit =
        unit === "PSIA" || unit === "PSI-A" ? "PSIA" : "PSIG";
    }
    if (ocrApiData.Temperature) {
      mapped.temperature = String(ocrApiData.Temperature);
    }
    if (ocrApiData.Flow_Rate) {
      mapped.flow_rate = String(ocrApiData.Flow_Rate);
    }
    if (ocrApiData.Field_H2S != null && ocrApiData.Field_H2S !== "") {
      const parsed = Number(ocrApiData.Field_H2S);
      if (!Number.isNaN(parsed)) {
        mapped.field_h2s = parsed;
      }
    }
    if (ocrApiData.Cylinder_Number) {
      mapped.cylinder_number = String(ocrApiData.Cylinder_Number);
    }
    if (ocrApiData.Remarks) {
      mapped.remarks = String(ocrApiData.Remarks);
    }
    if (ocrApiData.Cost_Code) {
      mapped.cost_code = String(ocrApiData.Cost_Code);
    }

    return mapped;
  },

  uploadTagImage: async (
    file: File,
  ): Promise<{
    path: string;
    filename: string;
    ocrData: Partial<CheckedInSample>;
  }> => {
    if (!file.type.startsWith("image/")) {
      throw new Error("Only image files are supported for tag upload");
    }

    let token = authService.getAuthState().token;

    // Fallback to localStorage parse if auth state token is missing
    if (!token) {
      const stored = localStorage.getItem("natty_gas_auth");
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          token = parsed?.token || parsed?.accessToken || "";
        } catch {
          // ignore
        }
      }
    }

    if (!token) {
      throw new Error(
        "Missing Authorization token. Please log in before uploading OCR images.",
      );
    }

    const formData = new FormData();
    formData.append("file", file);

    // const response = await fetch(`${API_BASE_URL}/sample_checkin/ocr`, {
    //   method: "POST",
    //   headers: {
    //     Authorization: `Bearer ${token}`,
    //   },
    //   body: formData,
    // });

    const response = await fetch(`${API_BASE_URL}/sample_checkin/ocr_ai`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const responseBody = await response.text();
      throw new Error(
        `OCR upload failed: ${response.status} ${response.statusText} - ${responseBody}`,
      );
    }

    const result = await response.json();
    if (!result) {
      throw new Error(
        `OCR upload failed: invalid response from server: ${JSON.stringify(result)}`,
      );
    }

    const path = result.path ?? "";

    const filename = result.filename ?? result.originalName ?? "";

    if (!path) {
      throw new Error(
        `OCR upload failed: missing path in server response: ${JSON.stringify(result)}`,
      );
    }

    // Map OCR data from the API response
    // Try new structured format first (data object), fall back to parsing ocrText
    let ocrData: Partial<CheckedInSample>;
    if (result.data && typeof result.data === "object") {
      ocrData = sampleCheckInService.mapOCRDataToFormFields(result.data);
    } else {
      // Fallback to text parsing for backward compatibility
      const ocrText = result.ocrText ?? "";
      ocrData = sampleCheckInService.parseOCRText(ocrText);
    }

    return {
      path,
      filename,
      ocrData,
    };
  },

  calculatePrice: (
    analysisType: string,
    rushed: boolean,
    monthlyCount: number,
  ): number => {
    const baseRates: { [key: string]: number } = {
      "GPA 2261": 150.0,
      "GPA 2172": 175.0,
      "GPA 2286": 200.0,
      BTU: 125.0,
      Custom: 250.0,
    };

    let price = baseRates[analysisType] || 150.0;

    // Apply rushed multiplier (1.5x)
    if (rushed) {
      price = price * 1.5;
    }

    // Apply volume discount if customer has 50+ analyses this month
    if (!rushed && monthlyCount >= 50) {
      price = price - 5.0; // $5 discount
    }

    return price;
  },

  validateCheckIn: (
    sample: Partial<CheckedInSample>,
  ): { valid: boolean; error?: string } => {
    if (!sample.analysis_number || sample.analysis_number.trim() === "") {
      return { valid: false, error: "Analysis number is required" };
    }
    if (!sample.analysis_type) {
      return { valid: false, error: "Analysis type is required" };
    }
    return { valid: true };
  },

  /**
   * Generate Work Order with Header and Lines
   * Creates work order in two tables: Work Order Header and Work Order Lines
   * @param companyId - Company ID from Company Master
   * @param contactId - Contact ID from Contacts
   * @param samples - Array of checked-in samples/cylinders
   * @param userId - User ID who is creating the work order
   * @returns Object containing work order header, lines, and work order number
   */
  generateWorkOrder: (
    companyId: number,
    contactId: number,
    samples: CheckedInSample[],
    userId: number,
  ): {
    header: WorkOrderHeader;
    lines: WorkOrderLine[];
    workOrderNumber: string;
  } => {
    // Validate inputs
    if (!companyId || !contactId) {
      throw new Error("Company ID and Contact ID are required");
    }
    if (!samples || samples.length === 0) {
      throw new Error("At least one sample is required to generate work order");
    }

    // Create work order using workOrdersService
    const { header, lines } = workOrdersService.createWorkOrder(
      companyId,
      contactId,
      samples,
      userId,
    );

    console.log(
      `Generated work order ${header.work_order_number} with ${lines.length} line items`,
    );

    return {
      header,
      lines,
      workOrderNumber: header.work_order_number,
    };
  },

  generateReceipt: (samples: CheckedInSample[]): void => {
    console.log("Generating receipt for samples:", samples);
  },

  addCustomer: (customer: Customer): Customer => {
    return customer;
  },

  addContact: (contact: Contact): Contact => {
    return contact;
  },

  generateAnalysisNumber: (sequence: number, year?: number): string => {
    const resolvedYear = year ?? new Date().getFullYear();
    const sequenceStr = sequence.toString().padStart(5, "0");
    return `${resolvedYear}-${sequenceStr}`;
  },

  fetchSampleCheckIns: async (
    forceRefresh = false,
  ): Promise<SampleCheckInApiRecord[]> => {
    if (sampleCheckInApiCacheLoaded && !forceRefresh) {
      return sampleCheckInApiCache;
    }

    const response = await fetch(`${API_BASE_URL}/sample_checkin`, {
      method: "GET",
      headers: buildAuthHeaders(),
    });

    if (!response.ok) {
      const message =
        response.status === 401 ? "Unauthorized" : "Failed to load check-ins";
      throw new Error(message);
    }

    const data = (await response.json()) as SampleCheckInApiRecord[];
    sampleCheckInApiCache = Array.isArray(data) ? data : [];
    sampleCheckInApiCacheLoaded = true;
    return sampleCheckInApiCache;
  },

  getNextAnalysisSequence: async (year?: number): Promise<number> => {
    const resolvedYear = year ?? new Date().getFullYear();
    const records = await sampleCheckInService.fetchSampleCheckIns();
    const regex = new RegExp(`^${resolvedYear}-(\\d{5})$`);
    let maxSequence = 0;

    records.forEach((record) => {
      const match = record.analysis_number?.match(regex);
      if (match && match[1]) {
        const value = Number.parseInt(match[1], 10);
        if (!Number.isNaN(value) && value > maxSequence) {
          maxSequence = value;
        }
      }
    });

    return maxSequence + 1;
  },

  generateMockSampleTag: (tagNumber: string, currentDate: string): string => {
    // Generate a mock sample tag image as SVG data URL
    // In a real implementation, this would be the actual scanned image
    const svg = `<svg width="500" height="300" xmlns="http://www.w3.org/2000/svg">
  <rect width="500" height="300" fill="white" stroke="black" stroke-width="4"/>
  <text x="250" y="40" font-family="Arial" font-size="24" font-weight="bold" text-anchor="middle" fill="black">Natty Gas Lab</text>
  <line x1="20" y1="50" x2="480" y2="50" stroke="black" stroke-width="2"/>
  <text x="30" y="80" font-family="Arial" font-size="14" fill="black">Date: ${currentDate}</text>
  <text x="280" y="80" font-family="Arial" font-size="14" fill="black">Producer: ABC Energy</text>
  <text x="30" y="110" font-family="Arial" font-size="14" fill="black">Sampled By: John Smith</text>
  <text x="280" y="110" font-family="Arial" font-size="14" fill="black">Company: Acme Corporation</text>
  <text x="30" y="140" font-family="Arial" font-size="14" fill="black">Area: Area-1</text>
  <text x="280" y="140" font-family="Arial" font-size="14" fill="black">Well/Facility Name: Well-123</text>
  <text x="30" y="170" font-family="Arial" font-size="14" fill="black">Meter #: MTR-456</text>
  <text x="30" y="200" font-family="Arial" font-size="14" fill="black">Sample Type:</text>
  <rect x="155" y="188" width="14" height="14" fill="none" stroke="black" stroke-width="1.5"/>
  <line x1="157" y1="195" x2="161" y2="199" stroke="black" stroke-width="2"/>
  <line x1="161" y1="199" x2="167" y2="190" stroke="black" stroke-width="2"/>
  <text x="175" y="200" font-family="Arial" font-size="14" fill="black">Spot</text>
  <rect x="225" y="188" width="14" height="14" fill="none" stroke="black" stroke-width="1.5"/>
  <text x="245" y="200" font-family="Arial" font-size="14" fill="black">Composite</text>
  <text x="30" y="230" font-family="Arial" font-size="14" fill="black">Flow Rate: 1500 MCFD</text>
  <text x="280" y="230" font-family="Arial" font-size="14" fill="black">Pressure: 250 PSI</text>
  <text x="30" y="260" font-family="Arial" font-size="14" fill="black">Temp: 75 F</text>
  <text x="280" y="260" font-family="Arial" font-size="14" fill="black">Field H2S: 10 PPM</text>
  <text x="30" y="290" font-family="Arial" font-size="14" font-weight="bold" fill="black">Bottle#: ${tagNumber}</text>
  <text x="30" y="315" font-family="Arial" font-size="12" fill="gray">Remarks: Sample collected from field</text>
</svg>`;
    return "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svg);
  },

  getCompanyAreas: () => {
    return [
      { company: "Acme Corporation", area: "North Texas" },
      { company: "Acme Corporation", area: "East Texas" },
      { company: "TechGas Inc", area: "Permian Basin" },
      { company: "Industrial Co", area: "Gulf Coast" },
      { company: "Gas Solutions", area: "Panhandle" },
    ];
  },

  // Save individual sample check-in record
  saveCheckIn: (
    company_id: number,
    contact_id: number,
    sample: Partial<CheckedInSample>,
    created_by: number,
  ): CheckedInSample => {
    const now = new Date().toISOString();
    const newRecord: CheckedInSample = {
      id: Date.now(),
      company_id,
      company_contact_id: sample.company_contact_id ?? contact_id,
      analysis_type_id: sample.analysis_type_id,
      area_id: sample.area_id,
      customer_cylinder:
        sample.customer_cylinder ?? sample.customer_owned_cylinder ?? false,
      sampled_by_lab: sample.sampled_by_lab ?? sample.sampled_by_natty ?? false,
      cylinder_id: sample.cylinder_id ?? null,
      contact_id,
      created_by,
      analysis_type: sample.analysis_type || "",
      area: sample.area || "",
      customer_owned_cylinder: sample.customer_owned_cylinder || false,
      cylinder_number: sample.cylinder_number || "",
      analysis_number: sample.analysis_number || "",
      date: sample.date || "",
      producer: sample.producer || "",
      sampled_by_natty: sample.sampled_by_natty || false,
      well_name: sample.well_name || "",
      meter_number: sample.meter_number || "",
      flow_rate: sample.flow_rate || "",
      pressure: sample.pressure || "",
      temperature: sample.temperature || "",
      field_h2s: sample.field_h2s ?? 0,
      cost_code: sample.cost_code || "",
      remarks: sample.remarks || "",
      check_in_type: sample.check_in_type || "Cylinder",
      checkin_type: sample.checkin_type ?? sample.check_in_type,
      sample_type: sample.sample_type || "",
      pressure_unit: sample.pressure_unit || "",
      check_in_time: sample.check_in_time || now,
      rushed: sample.rushed || false,
      tag_image: sample.tag_image || "",
      billing_reference_type: sample.billing_reference_type || "",
      billing_reference_number: sample.billing_reference_number || "",
      invoice_ref_name:
        sample.invoice_ref_name ?? sample.billing_reference_type,
      invoice_ref_value:
        sample.invoice_ref_value ?? sample.billing_reference_number,
      scanned_tag_image: sample.scanned_tag_image ?? sample.tag_image ?? null,
      work_order_number: sample.work_order_number || "",
      status: sample.status || "Pending",
    };

    checkedInSamples.push(newRecord);
    return newRecord;
  },

  serializeCheckInForPost: (sample: CheckedInSample): SampleCheckInPayload => {
    return {
      company_id: sample.company_id,
      company_contact_id: sample.company_contact_id ?? sample.contact_id,
      analysis_type_id: sample.analysis_type_id ?? null,
      area_id: sample.area_id ?? null,
      customer_cylinder:
        sample.customer_cylinder ?? sample.customer_owned_cylinder ?? false,
      rushed: sample.rushed,
      sampled_by_lab: sample.sampled_by_lab ?? sample.sampled_by_natty ?? false,
      cylinder_id: sample.cylinder_id ?? null,
      cylinder_number: sample.cylinder_number,
      analysis_number: sample.analysis_number,
      producer: sample.producer,
      well_name: sample.well_name,
      meter_number: sample.meter_number,
      sample_type: sample.sample_type ?? "",
      flow_rate: sample.flow_rate,
      pressure: sample.pressure,
      pressure_unit: sample.pressure_unit ?? "",
      temperature: sample.temperature,
      field_h2s: sample.field_h2s ?? 0,
      cost_code: sample.cost_code,
      checkin_type: sample.checkin_type ?? sample.check_in_type,
      invoice_ref_name:
        sample.invoice_ref_name ?? sample.billing_reference_type,
      invoice_ref_value:
        sample.invoice_ref_value ?? sample.billing_reference_number,
      remarks: sample.remarks,
      scanned_tag_image: sample.scanned_tag_image ?? sample.tag_image ?? null,
      status: sample.status ?? "Pending",
    };
  },

  postSampleCheckIn: async (payload: SampleCheckInPayload): Promise<any> => {
    const response = await fetch(`${API_BASE_URL}/sample_checkin`, {
      method: "POST",
      headers: buildAuthHeaders(),
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const message =
        response.status === 401
          ? "Unauthorized"
          : "Failed to create sample check-in";
      throw new Error(message);
    }

    const responseData = await response.json();
    sampleCheckInApiCacheLoaded = false;
    return responseData;
  },

  /**
   * Creates sample check-ins sequentially so all rows share one work order.
   * The first POST omits work_order_number (API generates it); subsequent POSTs
   * reuse the work_order_number from the first response.
   */
  postSampleCheckIns: async (
    payloads: SampleCheckInPayload[],
  ): Promise<any[]> => {
    const createdRecords: Awaited<
      ReturnType<typeof sampleCheckInService.postSampleCheckIn>
    >[] = [];
    let workOrderNumber: string | undefined;

    for (const payload of payloads) {
      // Never send a stale/local work_order_number on the first POST — only the API
      // should assign WO-YYYY-####. Billing ref values (e.g. PO "P00001") must not
      // be used as work_order_number.
      const { work_order_number: _ignored, ...payloadBase } = payload;

      const toPost: SampleCheckInPayload = workOrderNumber
        ? {
            ...payloadBase,
            work_order_number: workOrderNumber,
            invoice_ref_name: "WO",
            invoice_ref_value: workOrderNumber,
          }
        : payloadBase;

      const created = await sampleCheckInService.postSampleCheckIn(toPost);
      createdRecords.push(created);

      if (!workOrderNumber && created?.work_order_number) {
        workOrderNumber = String(created.work_order_number).trim();
      }
    }

    return createdRecords;
  },

  getCheckedInSamples: (): CheckedInSample[] => {
    return checkedInSamples;
  },

  getCheckedInSampleById: (id: number): CheckedInSample | undefined => {
    return checkedInSamples.find((sample) => sample.id === id);
  },

  getCheckedInSamplesByCompany: (company_id: number): CheckedInSample[] => {
    return checkedInSamples.filter(
      (sample) => sample.company_id === company_id,
    );
  },

  getCheckedInSamplesByContact: (contact_id: number): CheckedInSample[] => {
    return checkedInSamples.filter(
      (sample) => sample.contact_id === contact_id,
    );
  },

  getCheckedInSampleByAnalysisNumber: (
    analysis_number: string,
  ): CheckedInSample | undefined => {
    return checkedInSamples.find(
      (sample) => sample.analysis_number === analysis_number,
    );
  },

  /**
   * Delete a checked-in sample by ID
   */
  deleteCheckedInSample: (id: number): boolean => {
    const index = checkedInSamples.findIndex((sample) => sample.id === id);
    if (index !== -1) {
      checkedInSamples.splice(index, 1);
      return true;
    }
    return false;
  },

  /**
   * Update a checked-in sample
   */
  updateCheckedInSample: (
    id: number,
    updates: Partial<CheckedInSample>,
  ): CheckedInSample | undefined => {
    const index = checkedInSamples.findIndex((sample) => sample.id === id);
    if (index !== -1) {
      checkedInSamples[index] = {
        ...checkedInSamples[index],
        ...updates,
      };
      return checkedInSamples[index];
    }
    return undefined;
  },

  /**
   * Get check-in statistics for a company
   */
  getCompanyCheckInStats: (company_id: number) => {
    const companySamples = checkedInSamples.filter(
      (sample) => sample.company_id === company_id,
    );
    const totalSamples = companySamples.length;
    const rushedSamples = companySamples.filter(
      (sample) => sample.rushed,
    ).length;

    return {
      totalSamples,
      rushedSamples,
      normalSamples: totalSamples - rushedSamples,
    };
  },

  /**
   * Get monthly check-in count for a company
   */
  getMonthlyCheckInCount: (
    company_id: number,
    year: number,
    month: number,
  ): number => {
    return checkedInSamples.filter((sample) => {
      if (sample.company_id !== company_id) return false;
      const sampleDate = new Date(sample.check_in_time);
      return (
        sampleDate.getFullYear() === year && sampleDate.getMonth() === month - 1
      );
    }).length;
  },

  /**
   * Check if a cylinder/bottle number already exists
   */
  isDuplicateCylinderNumber: (cylinder_number: string): boolean => {
    return checkedInSamples.some(
      (sample) => sample.cylinder_number === cylinder_number,
    );
  },

  /**
   * Get recent check-ins (last N records)
   */
  getRecentCheckIns: (limit: number = 10): CheckedInSample[] => {
    return [...checkedInSamples]
      .sort(
        (a, b) =>
          new Date(b.check_in_time).getTime() -
          new Date(a.check_in_time).getTime(),
      )
      .slice(0, limit);
  },

  /**
   * Get check-ins by date range
   */
  getCheckInsByDateRange: (
    startDate: string,
    endDate: string,
  ): CheckedInSample[] => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    return checkedInSamples.filter((sample) => {
      const sampleDate = new Date(sample.check_in_time);
      return sampleDate >= start && sampleDate <= end;
    });
  },

  /**
   * Clear all checked-in samples (for testing purposes)
   */
  clearAllCheckIns: (): void => {
    checkedInSamples = [];
  },

  /**
   * Get total count of checked-in samples
   */
  getTotalCheckInCount: (): number => {
    return checkedInSamples.length;
  },

  /**
   * Update a Work Order Line
   */
  updateWOLine: async (id: number, payload: UpdateWOLinePayload) => {
    const token = authService.getAuthState().token;
    const response = await fetch(
      `${API_BASE_URL}/sample_checkin/update_wo_lines/${id}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      },
    );
    if (!response.ok) throw await response.json();
    return await response.json();
  },

  /**
   * Update status in sample_checkin by work order number
   */
  updateStatusByWorkOrderNumber: updateStatusByWorkOrderNumber as (
    workOrderNumber: string,
    payload: { status: string },
  ) => Promise<any>,
};
