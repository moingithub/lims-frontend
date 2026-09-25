import { API_BASE_URL } from "../config/api";
import { authService } from "./authService";
import {
  extractDateFromDateTime,
  toIsoDateInputValue,
} from "../utils/dateUtils";
import { companyAreaService } from "./companyAreaService";
import {
  workOrdersService,
  WorkOrderHeader,
  WorkOrderLine,
} from "./workOrdersService";
import { analysisPricingService } from "./analysisPricingService";

/**
 * Update status in sample_checkin by work order number
 */
const updateStatusByWorkOrderNumber = async (
  workOrderNumber: string,
  payload: { status: string },
) => {
  const response = await fetch(
    `${API_BASE_URL}/sample_checkin/update_status_by_wo/${encodeURIComponent(workOrderNumber)}`,
    {
      method: "PUT",
      headers: buildAuthHeaders(),
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
  contact_name?: string;
  contact_email?: string;
  contact_phone?: string;
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
  authorized_by: string;
  sample_date: string | null;
  amb_temp: string;
  sample_time: string;
  sampled_by: string | null;
  pressure_base_factor?: number;
  pressure_measured?: string;
  analyzed_by?: string;
  base_condition?: string;
  physical_constant?: string;
  instrument?: string;
  last_instrument_verification?: string;
  heating_method?: string;
  hexanes_split?: string;
  sample_method?: string;
  effective_start_date?: string;
  effective_end_date?: string;
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
  date: string;
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
  authorized_by: string;
  sample_date: string | null;
  amb_temp: string;
  sample_time: string | null;
  sampled_by: string | null;
  checkin_type: string;
  invoice_ref_name: string;
  invoice_ref_value: string;
  remarks: string;
  scanned_tag_image: string | null;
  work_order_number?: string;
  status: string;
  h2_pop_fee?: number;
  pressure_base_factor: number;
  pressure_measured?: string;
  analyzed_by?: string;
  base_condition?: string;
  physical_constant?: string;
  instrument?: string;
  last_instrument_verification?: string;
  heating_method?: string;
  hexanes_split?: string;
  sample_method?: string;
  effective_start_date?: string;
  effective_end_date?: string;
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

export interface UpdateSampleCheckInPayload {
  status?: string;
  remarks?: string;
  pressure_base_factor?: number;
  pressure_measured?: string;
  amb_temp?: string;
  sample_time?: string;
  sample_date?: string | null;
  sampled_by?: string | null;
  analyzed_by?: string;
  base_condition?: string;
  physical_constant?: string;
  instrument?: string;
  last_instrument_verification?: string;
  heating_method?: string;
  hexanes_split?: string;
  sample_method?: string;
  effective_start_date?: string;
  effective_end_date?: string;
}

type ApiAnalysisTypeRelation = {
  id?: number;
  analysis_type?: string;
};

type ApiCompanyContactRelation = {
  id?: number;
  name?: string;
  phone?: string;
  email?: string;
};

type ApiCompanyAreaRelation = {
  id?: number;
  area?: string | null;
};

export type SampleCheckInApiRecord = {
  id: number;
  analysis_number?: string;
  work_order_number?: string;
  company_id?: number;
  company_name?: string;
  company_contact_id?: number;
  contact_id?: number;
  company_contact?: ApiCompanyContactRelation | null;
  Company_contact?: ApiCompanyContactRelation | null;
  analysis_type_id?: number | null;
  analysis_type?: string | ApiAnalysisTypeRelation | null;
  Analysis_type?: ApiAnalysisTypeRelation | null;
  analysis_pricing?: ApiAnalysisTypeRelation | null;
  analysis_position?: number | null;
  rushed?: boolean;
  date?: string;
  check_in_time?: string;
  created_at?: string;
  status?: string;
  created_by?: number;
  created_by_id?: number;
  cylinder_number?: string;
  producer?: string;
  well_name?: string;
  meter_number?: string;
  flow_rate?: string;
  pressure?: string;
  temperature?: string;
  field_h2s?: number | string | null;
  cost_code?: string;
  authorized_by?: string;
  sample_date?: string | null;
  sampled_date?: string | null;
  amb_temp?: string | null;
  sample_time?: string | null;
  pressure_measured?: string | null;
  sampled_by?: string | null;
  analyzed_by?: string;
  base_condition?: string;
  physical_constant?: string;
  instrument?: string;
  last_instrument_verification?: string;
  heating_method?: string;
  hexanes_split?: string;
  sample_method?: string;
  effective_start_date?: string;
  effective_end_date?: string;
  pressure_base_factor?: number;
  remarks?: string;
  checkin_type?: string;
  check_in_type?: string;
  sample_type?: string;
  customer_cylinder?: boolean;
  customer_owned_cylinder?: boolean;
  sampled_by_lab?: boolean;
  sampled_by_natty?: boolean;
  area?: string;
  area_id?: number | null;
  company_area?: ApiCompanyAreaRelation | string | null;
  Company_area?: ApiCompanyAreaRelation | null;
  invoice_ref_name?: string;
  invoice_ref_value?: string;
  billing_reference_type?: string;
  billing_reference_number?: string;
  scanned_tag_image?: string | null;
  tag_image?: string;
};

const parseApiNumber = (value: unknown, fallback = 0): number => {
  if (value == null || value === "") return fallback;
  const num = typeof value === "number" ? value : Number(value);
  return Number.isFinite(num) ? num : fallback;
};

const normalizeOcrFieldKey = (key: string): string =>
  key.toLowerCase().replace(/[^a-z0-9]/g, "");

const getOcrFieldValue = (
  ocrApiData: Record<string, unknown>,
  aliases: string[],
): string | undefined => {
  const normalizedAliases = new Set(
    aliases.map((alias) => normalizeOcrFieldKey(alias)),
  );

  for (const [key, value] of Object.entries(ocrApiData)) {
    if (value == null || String(value).trim() === "") continue;
    if (normalizedAliases.has(normalizeOcrFieldKey(key))) {
      return String(value).trim();
    }
  }

  return undefined;
};

const getOcrAmbTempValue = (
  ocrApiData: Record<string, unknown>,
): string | undefined => {
  const direct = getOcrFieldValue(ocrApiData, [
    "Amb_Temp",
    "Amb Temp",
    "Amb. Temp",
    "amb_temp",
    "Amb Temp Tag",
    "Amb. Temp Tag",
    "Amb_Temp_Tag",
  ]);
  if (direct) return formatAmbTempValue(direct);

  for (const [key, value] of Object.entries(ocrApiData)) {
    if (value == null || String(value).trim() === "") continue;
    const normalizedKey = normalizeOcrFieldKey(key);
    if (normalizedKey.includes("amb") && normalizedKey.includes("temp")) {
      return formatAmbTempValue(String(value));
    }
  }

  return undefined;
};

const normalizeOcrSampleTime = (value: string): string => {
  const trimmed = value.trim();
  const twelveHourMatch = trimmed.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (twelveHourMatch) {
    let hours = Number(twelveHourMatch[1]);
    const minutes = twelveHourMatch[2];
    const meridiem = twelveHourMatch[3].toUpperCase();
    if (meridiem === "PM" && hours < 12) hours += 12;
    if (meridiem === "AM" && hours === 12) hours = 0;
    return `${String(hours).padStart(2, "0")}:${minutes}`;
  }

  const compactTwelveHourMatch = trimmed.match(
    /^(\d{1,2}):(\d{2})\s*(am|pm)$/i,
  );
  if (compactTwelveHourMatch) {
    let hours = Number(compactTwelveHourMatch[1]);
    const minutes = compactTwelveHourMatch[2];
    const meridiem = compactTwelveHourMatch[3].toUpperCase();
    if (meridiem === "PM" && hours < 12) hours += 12;
    if (meridiem === "AM" && hours === 12) hours = 0;
    return `${String(hours).padStart(2, "0")}:${minutes}`;
  }

  const compactNoSpaceMatch = trimmed.match(/^(\d{1,2}):(\d{2})(am|pm)$/i);
  if (compactNoSpaceMatch) {
    let hours = Number(compactNoSpaceMatch[1]);
    const minutes = compactNoSpaceMatch[2];
    const meridiem = compactNoSpaceMatch[3].toUpperCase();
    if (meridiem === "PM" && hours < 12) hours += 12;
    if (meridiem === "AM" && hours === 12) hours = 0;
    return `${String(hours).padStart(2, "0")}:${minutes}`;
  }

  const colonMeridiemMatch = trimmed.match(/^(\d{1,2}):(\d{2}):(am|pm)$/i);
  if (colonMeridiemMatch) {
    let hours = Number(colonMeridiemMatch[1]);
    const minutes = colonMeridiemMatch[2];
    const meridiem = colonMeridiemMatch[3].toUpperCase();
    if (meridiem === "PM" && hours < 12) hours += 12;
    if (meridiem === "AM" && hours === 12) hours = 0;
    return `${String(hours).padStart(2, "0")}:${minutes}`;
  }

  const twentyFourHourMatch = trimmed.match(/^(\d{1,2}):(\d{2})/);
  if (twentyFourHourMatch) {
    return `${String(Number(twentyFourHourMatch[1])).padStart(2, "0")}:${twentyFourHourMatch[2]}`;
  }

  return trimmed;
};

const getOcrSampleTimeValue = (
  ocrApiData: Record<string, unknown>,
): string | undefined => {
  const direct = getOcrFieldValue(ocrApiData, [
    "Sample_Time",
    "Sample Time",
    "sample_time",
  ]);
  return direct ? normalizeOcrSampleTime(direct) : undefined;
};

const formatAmbTempValue = (value: string): string => {
  const trimmed = value.trim();
  if (!trimmed) return "";

  const inlineMatch = trimmed.match(/^(\d+(?:\.\d+)?)(?:\s*([FCfc°]))?/);
  if (inlineMatch) {
    const amount = inlineMatch[1];
    const unit = inlineMatch[2]?.toUpperCase() ?? "F";
    return `${amount} ${unit}`.trim();
  }

  return trimmed;
};

const extractAmbTempFromOcrText = (ocrText: string): string | undefined => {
  const patterns = [
    /Amb[\s.,]*Temp(?:erature)?(?:\s*Tag)?[\s:.-]+(\d+(?:\.\d+)?(?:\s*[FCfc°])?)/i,
    /Amb[\s.,]*Temp(?:erature)?(?:\s*Tag)?[^0-9\n]*(\d+(?:\.\d+)?)(?:\s*([FCfc°]))?/i,
    /Ambient[\s-]*Temp(?:erature)?[\s:.-]+(\d+(?:\.\d+)?(?:\s*[FCfc°])?)/i,
    /"Amb[\s.,]*Temp(?:erature)?(?:\s*Tag)?"\s*:\s*"([^"]+)"/i,
    /"label"\s*:\s*"Amb[\s.,]*Temp(?:erature)?(?:\s*Tag)?"[^}]*"value"\s*:\s*"([^"]+)"/i,
  ];

  for (const pattern of patterns) {
    const match = ocrText.match(pattern);
    if (match) {
      const rawValue = match[2] ? `${match[1]} ${match[2]}` : match[1];
      const formatted = formatAmbTempValue(rawValue);
      if (formatted) {
        return formatted;
      }
    }
  }

  return undefined;
};

const resolveAmbTempFromOcrPayload = (payload: unknown): string | undefined => {
  const candidates: string[] = [];

  const visit = (value: unknown, keyHint = ""): void => {
    if (value == null) return;

    if (typeof value === "string") {
      const trimmed = value.trim();
      if (!trimmed) return;

      const normalizedKey = normalizeOcrFieldKey(keyHint);
      if (
        normalizedKey.includes("amb") &&
        normalizedKey.includes("temp") &&
        /\d/.test(trimmed)
      ) {
        candidates.push(formatAmbTempValue(trimmed));
      }

      const fromText = extractAmbTempFromOcrText(trimmed);
      if (fromText) {
        candidates.push(fromText);
      }
      return;
    }

    if (typeof value === "number" && Number.isFinite(value)) {
      const normalizedKey = normalizeOcrFieldKey(keyHint);
      if (normalizedKey.includes("amb") && normalizedKey.includes("temp")) {
        candidates.push(formatAmbTempValue(String(value)));
      }
      return;
    }

    if (Array.isArray(value)) {
      value.forEach((item) => visit(item, keyHint));
      return;
    }

    if (typeof value === "object") {
      Object.entries(value as Record<string, unknown>).forEach(([key, child]) =>
        visit(child, key),
      );
    }
  };

  visit(payload);

  try {
    const serialized = JSON.stringify(payload);
    const fromSerialized = extractAmbTempFromOcrText(serialized);
    if (fromSerialized) {
      candidates.push(fromSerialized);
    }
  } catch {
    // ignore serialization issues
  }

  return candidates.find((value) => value.trim().length > 0);
};

const extractSampleDateFromOcrText = (ocrText: string): string | undefined => {
  const labeledMatch = ocrText.match(/Date(?:\/Time)?[:\s]+([^\n]+)/i);
  if (labeledMatch) {
    const dateValue = labeledMatch[1].trim();
    const splitDateTime = dateValue.match(/^(\d{1,2}\/\d{1,2}\/\d{2,4})/);
    return splitDateTime?.[1] ?? dateValue;
  }

  const looseMatch = ocrText.match(
    /(?:^|[\s\n])(\d{1,2}\/\d{1,2}\/\d{2,4})(?:\s+\d{1,2}(?::\d{2})?\s*(?:am|pm))?/i,
  );
  return looseMatch?.[1];
};

const splitCombinedSampleDateTime = (
  value: string,
): { date?: string; time?: string } => {
  const trimmed = value.trim();
  if (!trimmed) return {};

  const slashFormat = trimmed.match(
    /^(\d{1,2}\/\d{1,2}\/\d{2,4})(?:\s+(\d{1,2}(?::\d{2})?\s*(?:am|pm)?))?/i,
  );
  if (slashFormat) {
    return {
      date: slashFormat[1],
      time: slashFormat[2]
        ? normalizeOcrSampleTime(slashFormat[2].trim())
        : undefined,
    };
  }

  if (/^\d{4}-\d{2}-\d{2}T/.test(trimmed)) {
    const [datePart, timePart = ""] = trimmed.split("T");
    const normalizedTime = timePart
      ? normalizeOcrSampleTime(timePart.slice(0, 5))
      : undefined;
    return {
      date: datePart,
      time: normalizedTime,
    };
  }

  return { date: trimmed };
};

export const resolveOcrSampleDateAndTime = (
  sampleDate?: string | null,
  sampleTime?: string | null,
): { sampleDate: string; sampleTime: string } => {
  let dateValue = sampleDate?.trim() ?? "";
  let timeValue = sampleTime?.trim() ?? "";

  if (dateValue) {
    const split = splitCombinedSampleDateTime(dateValue);
    dateValue = split.date ?? dateValue;
    if (!timeValue && split.time) {
      timeValue = split.time;
    }
  }

  return {
    sampleDate: dateValue,
    sampleTime: timeValue ? normalizeOcrSampleTime(timeValue) : "",
  };
};

const extractSampleTempFromOcrText = (ocrText: string): string | undefined => {
  const pattern =
    /Temp(?:erature)?(?:\s*\([^)]*\))?[:\s]+(\d+(?:\.\d+)?(?:\s*[FCfc°])?)/gi;

  let match: RegExpExecArray | null = null;
  while ((match = pattern.exec(ocrText)) !== null) {
    const prefix = ocrText.slice(Math.max(0, match.index - 8), match.index);
    if (/Amb\.?\s*$/i.test(prefix)) {
      continue;
    }
    return match[1].trim();
  }

  return undefined;
};

const extractSampleTimeFromOcrText = (ocrText: string): string | undefined => {
  const labeledMatch = ocrText.match(/Sample\s*Time[:\s]+([^\n]+)/i);
  if (labeledMatch) {
    return normalizeOcrSampleTime(labeledMatch[1].trim());
  }

  const dateTimeMatch = ocrText.match(
    /Date(?:\/Time)?[:\s]+(\d{1,2}\/\d{1,2}\/\d{2,4})\s+(\d{1,2}(?::\d{2})?\s*(?:am|pm)?)/i,
  );
  if (dateTimeMatch) {
    return normalizeOcrSampleTime(dateTimeMatch[2].trim());
  }

  const looseDateTimeMatch = ocrText.match(
    /(?:^|[\s\n])(\d{1,2}\/\d{1,2}\/\d{2,4})\s+(\d{1,2}(?::\d{2})?(?:am|pm)?)/i,
  );
  if (looseDateTimeMatch) {
    return normalizeOcrSampleTime(looseDateTimeMatch[2].trim());
  }

  return undefined;
};

const mergeOcrResults = (
  structured: Partial<CheckedInSample>,
  textParsed: Partial<CheckedInSample>,
): Partial<CheckedInSample> => {
  const merged: Partial<CheckedInSample> = { ...textParsed, ...structured };

  const fillIfMissing = <K extends keyof CheckedInSample>(key: K) => {
    const value = merged[key];
    if (
      (value == null || value === "") &&
      textParsed[key] != null &&
      textParsed[key] !== ""
    ) {
      merged[key] = textParsed[key];
    }
  };

  fillIfMissing("amb_temp");
  fillIfMissing("sample_time");
  fillIfMissing("temperature");
  fillIfMissing("sample_date");
  fillIfMissing("sampled_by");
  fillIfMissing("pressure");
  fillIfMissing("pressure_unit");
  fillIfMissing("field_h2s");
  fillIfMissing("flow_rate");
  fillIfMissing("cylinder_number");
  fillIfMissing("cost_code");
  fillIfMissing("remarks");
  fillIfMissing("producer");
  fillIfMissing("well_name");
  fillIfMissing("meter_number");
  fillIfMissing("sample_type");

  return merged;
};

const normalizeCheckInType = (
  value?: string | null,
): CheckedInSample["check_in_type"] => {
  const normalized = (value ?? "").trim().toLowerCase();
  if (normalized.includes("bottle")) return "Bottle";
  if (normalized.includes("cp")) return "CP Cylinder";
  return "Cylinder";
};

const resolveNestedContact = (
  record: SampleCheckInApiRecord,
): ApiCompanyContactRelation | null => {
  const nested = record.company_contact ?? record.Company_contact;
  return nested && typeof nested === "object" ? nested : null;
};

const resolveNestedCompanyArea = (
  record: SampleCheckInApiRecord,
): ApiCompanyAreaRelation | null => {
  const nested = record.company_area ?? record.Company_area;
  return nested && typeof nested === "object" ? nested : null;
};

const resolveSampleCheckInArea = (record: SampleCheckInApiRecord): string => {
  if (record.area?.trim()) return record.area.trim();

  const nestedArea = resolveNestedCompanyArea(record);
  if (nestedArea?.area?.trim()) return nestedArea.area.trim();

  if (typeof record.company_area === "string" && record.company_area.trim()) {
    return record.company_area.trim();
  }

  return "";
};

export const mapApiRecordToCheckedInSample = (
  record: SampleCheckInApiRecord,
): CheckedInSample => {
  const analysisType = resolveSampleCheckInAnalysisType(record);
  const nestedContact = resolveNestedContact(record);
  const nestedArea = resolveNestedCompanyArea(record);

  return {
    id: record.id,
    company_id: record.company_id ?? 0,
    company_contact_id:
      record.company_contact_id ?? nestedContact?.id ?? undefined,
    contact_name: nestedContact?.name?.trim() || undefined,
    contact_email: nestedContact?.email?.trim() || undefined,
    contact_phone: nestedContact?.phone?.trim() || undefined,
    contact_id:
      record.contact_id ?? record.company_contact_id ?? nestedContact?.id ?? 0,
    analysis_type_id: analysisType.id ?? undefined,
    area_id: record.area_id ?? nestedArea?.id ?? undefined,
    analysis_type: analysisType.name,
    area: resolveSampleCheckInArea(record),
    customer_owned_cylinder: Boolean(
      record.customer_cylinder ?? record.customer_owned_cylinder,
    ),
    cylinder_number: record.cylinder_number?.trim() ?? "",
    analysis_number: record.analysis_number?.trim() ?? "",
    date:
      record.date?.trim() ||
      extractDateFromDateTime(record.check_in_time) ||
      extractDateFromDateTime(record.created_at) ||
      "",
    producer: record.producer?.trim() ?? "",
    sampled_by_natty: Boolean(record.sampled_by_lab ?? record.sampled_by_natty),
    well_name: record.well_name?.trim() ?? "",
    meter_number: record.meter_number?.trim() ?? "",
    flow_rate: record.flow_rate?.trim() ?? "",
    pressure: record.pressure?.trim() ?? "",
    temperature: record.temperature?.trim() ?? "",
    field_h2s: parseApiNumber(record.field_h2s),
    cost_code: record.cost_code?.trim() ?? "",
    authorized_by: record.authorized_by?.trim() ?? "",
    sample_date: record.sample_date ?? record.sampled_date ?? null,
    amb_temp: record.amb_temp?.trim() ?? "",
    sample_time: record.sample_time?.trim() ?? "",
    sampled_by: record.sampled_by ?? null,
    remarks: record.remarks?.trim() ?? "",
    check_in_type: normalizeCheckInType(
      record.checkin_type ?? record.check_in_type,
    ),
    sample_type: record.sample_type?.trim(),
    check_in_time: record.check_in_time ?? record.created_at ?? "",
    rushed: Boolean(record.rushed),
    tag_image: record.scanned_tag_image ?? record.tag_image ?? "",
    billing_reference_type:
      record.invoice_ref_name?.trim() ??
      record.billing_reference_type?.trim() ??
      "",
    billing_reference_number:
      record.invoice_ref_value?.trim() ??
      record.billing_reference_number?.trim() ??
      "",
    work_order_number: record.work_order_number?.trim(),
    status: record.status,
    created_by: record.created_by ?? record.created_by_id ?? 0,
  };
};

export const parseSampleCheckInAnalysisPosition = (
  value: unknown,
): number | null => {
  if (value == null || value === "") return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
};

export const resolveSampleCheckInAnalysisType = (
  record: SampleCheckInApiRecord,
): { id: number | null; name: string } => {
  const relation =
    (record.Analysis_type && typeof record.Analysis_type === "object"
      ? record.Analysis_type
      : null) ??
    (record.analysis_pricing && typeof record.analysis_pricing === "object"
      ? record.analysis_pricing
      : null) ??
    (record.analysis_type && typeof record.analysis_type === "object"
      ? record.analysis_type
      : null);

  const relationName = relation?.analysis_type?.trim();
  if (relationName) {
    return {
      id: record.analysis_type_id ?? relation.id ?? null,
      name: relationName,
    };
  }

  if (typeof record.analysis_type === "string" && record.analysis_type.trim()) {
    return {
      id: record.analysis_type_id ?? null,
      name: record.analysis_type.trim(),
    };
  }

  if (record.analysis_type_id != null) {
    const pricing = analysisPricingService.getAnalysisPriceById(
      record.analysis_type_id,
    );
    if (pricing?.analysis_code) {
      return {
        id: record.analysis_type_id,
        name: pricing.analysis_code,
      };
    }
  }

  return { id: record.analysis_type_id ?? null, name: "Unknown" };
};

const buildAuthHeaders = (): HeadersInit => {
  const token = authService.getAccessToken();
  if (!token) {
    throw new Error("Your session has expired. Please log in again.");
  }
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
};

async function parseApiError(
  response: Response,
  fallback: string,
): Promise<string> {
  const rawBody = await response.text().catch(() => "");
  let body: any = {};
  try {
    body = rawBody ? JSON.parse(rawBody) : {};
  } catch {
    body = {};
  }
  if (typeof body?.detail === "string") return body.detail;
  if (Array.isArray(body?.detail)) {
    return body.detail
      .map((item: { msg?: string; loc?: string[] }) =>
        item.loc?.length
          ? `${item.loc.join(".")}: ${item.msg ?? "Invalid value"}`
          : (item.msg ?? "Invalid value"),
      )
      .join("; ");
  }
  if (
    body?.detail &&
    typeof body.detail === "object" &&
    !Array.isArray(body.detail)
  ) {
    return (
      body.detail.message ||
      body.detail.error ||
      JSON.stringify(body.detail)
    );
  }
  return (
    body?.error ||
    body?.message ||
    rawBody ||
    `${fallback} (${response.status})`
  );
}

let sampleCheckInApiCache: SampleCheckInApiRecord[] = [];
let sampleCheckInApiCacheLoaded = false;

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

const pickSampleCheckInUpdateFields = (
  record: SampleCheckInApiRecord,
): UpdateSampleCheckInPayload => ({
  status: record.status,
  remarks: record.remarks,
  pressure_base_factor: record.pressure_base_factor ?? 0,
  pressure_measured: record.pressure_measured ?? undefined,
  amb_temp: record.amb_temp ?? undefined,
  sample_time: record.sample_time ?? undefined,
  sample_date: record.sample_date ?? record.sampled_date ?? null,
  sampled_by: record.sampled_by ?? null,
  analyzed_by: record.analyzed_by,
  base_condition: record.base_condition,
  physical_constant: record.physical_constant,
  instrument: record.instrument,
  last_instrument_verification: record.last_instrument_verification,
  heating_method: record.heating_method,
  hexanes_split: record.hexanes_split,
  sample_method: record.sample_method,
  effective_start_date: record.effective_start_date,
  effective_end_date: record.effective_end_date,
});

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
      extracted.sampled_by = sampledByMatch[1].trim();
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

    // Amb Temp: inline on tag row — "Amb. Temp: 95 F"
    const ambTemp = extractAmbTempFromOcrText(ocrText);
    if (ambTemp) {
      extracted.amb_temp = ambTemp;
    }

    // Sample Temp: inline — "Temp: 81 F" but not "Amb. Temp"
    const sampleTemp = extractSampleTempFromOcrText(ocrText);
    if (sampleTemp) {
      extracted.temperature = sampleTemp;
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

    // Date: labeled or unlabeled — "12/10/26 2:30pm"
    const sampleDate = extractSampleDateFromOcrText(ocrText);
    if (sampleDate) {
      extracted.sample_date = sampleDate;
    }

    const sampleTime = extractSampleTimeFromOcrText(ocrText);
    if (sampleTime) {
      extracted.sample_time = sampleTime;
    }

    return extracted;
  },

  mapOCRDataToFormFields: (
    ocrApiData: Record<string, unknown>,
  ): Partial<CheckedInSample> => {
    const mapped: Partial<CheckedInSample> = {};

    const sampleDate = getOcrFieldValue(ocrApiData, [
      "sample_date",
      "Sample_date",
      "Sample_Date",
      "Date",
    ]);
    if (sampleDate) {
      mapped.sample_date = sampleDate;
    } else if (
      ocrApiData.sample_date != null &&
      ocrApiData.sample_date !== ""
    ) {
      mapped.sample_date = String(ocrApiData.sample_date);
    } else if (ocrApiData.Date) {
      mapped.sample_date = String(ocrApiData.Date);
    } else if (ocrApiData.Sample_Date) {
      mapped.sample_date = String(ocrApiData.Sample_Date);
    }

    if (mapped.sample_date) {
      const split = splitCombinedSampleDateTime(mapped.sample_date);
      mapped.sample_date = split.date ?? mapped.sample_date;
      if (split.time && !getOcrSampleTimeValue(ocrApiData)) {
        mapped.sample_time = split.time;
      }
    }

    const ambTemp = getOcrAmbTempValue(ocrApiData);
    if (ambTemp) {
      mapped.amb_temp = ambTemp;
    }

    const sampleTime = getOcrSampleTimeValue(ocrApiData);
    if (sampleTime) {
      mapped.sample_time = sampleTime;
    } else if (
      ocrApiData.sample_time != null &&
      ocrApiData.sample_time !== ""
    ) {
      mapped.sample_time = normalizeOcrSampleTime(
        String(ocrApiData.sample_time),
      );
    }
    if (ocrApiData.Sampled_By) {
      mapped.sampled_by = String(ocrApiData.Sampled_By);
    } else if (ocrApiData["Sampled By"]) {
      mapped.sampled_by = String(ocrApiData["Sampled By"]);
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
    } else if (ocrApiData.Temp) {
      mapped.temperature = String(ocrApiData.Temp);
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

    if (!mapped.amb_temp) {
      const scannedAmbTemp = resolveAmbTempFromOcrPayload(ocrApiData);
      if (scannedAmbTemp) {
        mapped.amb_temp = scannedAmbTemp;
      }
    }

    return mapped;
  },

  uploadTagImage: async (
    file: File,
    options?: { signal?: AbortSignal },
  ): Promise<{
    path: string;
    filename: string;
    ocrData: Partial<CheckedInSample>;
  }> => {
    if (!file.type.startsWith("image/")) {
      throw new Error("Only image files are supported for tag upload");
    }

    const token = authService.getAccessToken();
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
      signal: options?.signal,
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

    // Map OCR data from structured response, raw text, or both.
    const structuredSource =
      result.data && typeof result.data === "object"
        ? (result.data as Record<string, unknown>)
        : (result as Record<string, unknown>);
    const ocrTextParts = [
      result.ocrText,
      result.ocr_text,
      result.text,
      result.rawText,
      structuredSource.ocrText,
      structuredSource.ocr_text,
      structuredSource.text,
      structuredSource.rawText,
      structuredSource.raw_text,
    ].filter(
      (part): part is string =>
        typeof part === "string" && part.trim().length > 0,
    );
    const ocrText = ocrTextParts.join("\n");
    const structured =
      sampleCheckInService.mapOCRDataToFormFields(structuredSource);
    const textParsed = sampleCheckInService.parseOCRText(ocrText);
    let ocrData = mergeOcrResults(structured, textParsed);

    const dataRecord = structuredSource as Record<string, unknown>;
    if (!ocrData.sample_date?.trim()) {
      const sampleDate = getOcrFieldValue(dataRecord, [
        "Sample_date",
        "sample_date",
        "Sample_Date",
        "Date",
      ]);
      if (sampleDate) {
        ocrData = {
          ...ocrData,
          sample_date:
            splitCombinedSampleDateTime(sampleDate).date ?? sampleDate,
        };
      }
    }

    if (!ocrData.sample_time?.trim()) {
      const sampleTime = getOcrSampleTimeValue(dataRecord);
      if (sampleTime) {
        ocrData = { ...ocrData, sample_time: sampleTime };
      }
    }

    if (!ocrData.amb_temp?.trim()) {
      const ambTemp =
        getOcrAmbTempValue(dataRecord) ??
        resolveAmbTempFromOcrPayload(result) ??
        resolveAmbTempFromOcrPayload(structuredSource) ??
        resolveAmbTempFromOcrPayload(ocrText);
      if (ambTemp) {
        ocrData = { ...ocrData, amb_temp: ambTemp };
      }
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

  fetchSampleCheckInById: async (
    id: number,
  ): Promise<SampleCheckInApiRecord | null> => {
    const response = await fetch(`${API_BASE_URL}/sample_checkin/${id}`, {
      method: "GET",
      headers: buildAuthHeaders(),
    });

    if (!response.ok) return null;
    return (await response.json()) as SampleCheckInApiRecord;
  },

  fetchSamplesByWorkOrderNumber: async (
    workOrderNumber: string,
  ): Promise<CheckedInSample[]> => {
    const normalizedNumber = workOrderNumber.trim();
    const records = await sampleCheckInService.fetchSampleCheckIns(true);
    let samples = records
      .filter(
        (record) =>
          (record.work_order_number ?? "").trim() === normalizedNumber,
      )
      .map(mapApiRecordToCheckedInSample);

    const needsDetailEnrichment = samples.some((sample) => {
      const hasContact =
        sample.contact_name?.trim() ||
        sample.contact_email?.trim() ||
        sample.contact_phone?.trim() ||
        (sample.company_contact_id != null && sample.company_contact_id > 0) ||
        sample.contact_id > 0;
      const hasArea = Boolean(sample.area?.trim());
      return !hasContact || !hasArea;
    });

    if (needsDetailEnrichment && samples.length > 0) {
      const enrichedSamples = [...samples];
      for (let index = 0; index < enrichedSamples.length; index += 1) {
        const sample = enrichedSamples[index];
        const hasContact =
          sample.contact_name?.trim() ||
          sample.contact_email?.trim() ||
          sample.contact_phone?.trim() ||
          (sample.company_contact_id != null &&
            sample.company_contact_id > 0) ||
          sample.contact_id > 0;
        const hasArea = Boolean(sample.area?.trim());
        if (hasContact && hasArea) continue;

        const detail = await sampleCheckInService.fetchSampleCheckInById(
          sample.id,
        );
        if (detail) {
          enrichedSamples[index] = mapApiRecordToCheckedInSample(detail);
        }
      }
      samples = enrichedSamples;
    }

    const needsAreaLookup = samples.some(
      (sample) =>
        !sample.area?.trim() && sample.area_id != null && sample.area_id > 0,
    );
    if (needsAreaLookup) {
      await companyAreaService.fetchCompanyAreas();
      samples = samples.map((sample) => {
        if (sample.area?.trim()) return sample;
        if (sample.area_id != null && sample.area_id > 0) {
          const area = companyAreaService.getCompanyAreaById(sample.area_id);
          if (area?.area) return { ...sample, area: area.area };
        }
        return sample;
      });
    }

    return samples;
  },

  getMonthlyCheckInCountForCompany: async (
    companyId: number,
    referenceDate = new Date(),
  ): Promise<number> => {
    const records = await sampleCheckInService.fetchSampleCheckIns();
    const year = referenceDate.getFullYear();
    const month = referenceDate.getMonth();

    return records.filter((record) => {
      if (record.company_id !== companyId) return false;
      const rawDate =
        record.check_in_time ?? record.created_at ?? record.date ?? "";
      if (!rawDate) return false;
      const parsed = new Date(rawDate);
      if (Number.isNaN(parsed.getTime())) return false;
      return parsed.getFullYear() === year && parsed.getMonth() === month;
    }).length;
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
      authorized_by: sample.authorized_by || "",
      sample_date: sample.sample_date?.trim() || null,
      amb_temp: sample.amb_temp?.trim() || "",
      sample_time: sample.sample_time?.trim() || "",
      sampled_by: sample.sampled_by?.trim() || null,
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
    const isoDate =
      toIsoDateInputValue(sample.date) ||
      new Date().toISOString().slice(0, 10);
    const isoSampleDate = sample.sample_date?.trim()
      ? toIsoDateInputValue(sample.sample_date) || null
      : null;
    const sampleTime = sample.sample_time?.trim()
      ? normalizeOcrSampleTime(sample.sample_time)
      : null;
    const isoEffectiveStart = sample.effective_start_date?.trim()
      ? toIsoDateInputValue(sample.effective_start_date) || null
      : undefined;
    const isoEffectiveEnd = sample.effective_end_date?.trim()
      ? toIsoDateInputValue(sample.effective_end_date) || null
      : undefined;
    const fieldH2s = Number(sample.field_h2s);
    const pressureBaseFactor = Number(sample.pressure_base_factor);

    return {
      company_id: sample.company_id,
      company_contact_id: sample.company_contact_id ?? sample.contact_id,
      analysis_type_id: sample.analysis_type_id ?? null,
      area_id: sample.area_id ?? null,
      customer_cylinder:
        sample.customer_cylinder ?? sample.customer_owned_cylinder ?? false,
      rushed: Boolean(sample.rushed),
      sampled_by_lab: sample.sampled_by_lab ?? sample.sampled_by_natty ?? false,
      cylinder_id: sample.cylinder_id ?? null,
      cylinder_number: sample.cylinder_number,
      analysis_number: sample.analysis_number,
      date: isoDate,
      producer: sample.producer,
      well_name: sample.well_name,
      meter_number: sample.meter_number,
      sample_type: sample.sample_type ?? "",
      flow_rate: sample.flow_rate,
      pressure: sample.pressure,
      pressure_unit: sample.pressure_unit ?? "",
      temperature: sample.temperature,
      field_h2s: Number.isFinite(fieldH2s) ? fieldH2s : 0,
      cost_code: sample.cost_code,
      authorized_by: sample.authorized_by,
      sample_date: isoSampleDate,
      amb_temp: sample.amb_temp?.trim() ?? "",
      sample_time: sampleTime,
      sampled_by: sample.sampled_by?.trim() ? sample.sampled_by.trim() : null,
      checkin_type: sample.checkin_type ?? sample.check_in_type,
      invoice_ref_name:
        sample.invoice_ref_name ?? sample.billing_reference_type,
      invoice_ref_value:
        sample.invoice_ref_value ?? sample.billing_reference_number,
      remarks: sample.remarks,
      scanned_tag_image: sample.scanned_tag_image ?? sample.tag_image ?? null,
      status: sample.status ?? "Pending",
      pressure_base_factor: Number.isFinite(pressureBaseFactor)
        ? pressureBaseFactor
        : 0,
      pressure_measured: sample.pressure_measured,
      analyzed_by: sample.analyzed_by,
      base_condition: sample.base_condition,
      physical_constant: sample.physical_constant,
      instrument: sample.instrument,
      last_instrument_verification: sample.last_instrument_verification,
      heating_method: sample.heating_method,
      hexanes_split: sample.hexanes_split,
      sample_method: sample.sample_method,
      effective_start_date: isoEffectiveStart,
      effective_end_date: isoEffectiveEnd,
    };
  },

  postSampleCheckIn: async (payload: SampleCheckInPayload): Promise<any> => {
    const response = await fetch(`${API_BASE_URL}/sample_checkin`, {
      method: "POST",
      headers: buildAuthHeaders(),
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(
        await parseApiError(response, "Failed to create sample check-in"),
      );
    }

    const responseData = await response.json();
    sampleCheckInApiCacheLoaded = false;
    return responseData;
  },

  updateSampleCheckIn: async (
    id: number,
    payload: UpdateSampleCheckInPayload,
  ): Promise<SampleCheckInApiRecord> => {
    const existing = await sampleCheckInService.fetchSampleCheckInById(id);
    const body: UpdateSampleCheckInPayload = existing
      ? { ...pickSampleCheckInUpdateFields(existing), ...payload }
      : payload;

    const response = await fetch(`${API_BASE_URL}/sample_checkin/${id}`, {
      method: "PUT",
      headers: buildAuthHeaders(),
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      throw new Error(
        await parseApiError(response, "Failed to update sample check-in"),
      );
    }

    const responseData = (await response.json()) as SampleCheckInApiRecord;
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
    const response = await fetch(
      `${API_BASE_URL}/sample_checkin/update_wo_lines/${id}`,
      {
        method: "PUT",
        headers: buildAuthHeaders(),
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
