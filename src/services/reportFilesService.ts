import { API_BASE_URL } from "../config/api";
import { formatDateUS, toIsoDateInputValue } from "../utils/dateUtils";
import { authService } from "./authService";
import { sampleCheckInService } from "./sampleCheckInService";

export interface ReportFileRecord {
  company_id: number;
  sample_checkin_id: number;
  company_name: string;
  analysis_type: string;
  cylinder_number: string;
  analysis_number: string;
  well_name: string;
  meter_number: string;
  sample_date: string;
  status: string;
  work_order_number: string;
  sample_pressure: string;
  pressure_measured: string | null;
  pressure_unit: string;
  tag_image: string;
  instrument?: string | null;
  analyzed_on?: string | null;
  analyzed_by?: string | null;
  effective_start_date?: string | null;
  effective_end_date?: string | null;
}

function coercePressureField(
  value: string | number | null | undefined,
): string | null {
  if (value == null) return null;
  const trimmed = String(value).trim();
  return trimmed === "" ? null : trimmed;
}

export function normalizeReportFileRecord(
  raw: ReportFileRecord,
): ReportFileRecord {
  return {
    ...raw,
    sample_pressure: String(raw.sample_pressure ?? "").trim(),
    pressure_measured: coercePressureField(raw.pressure_measured),
  };
}

const buildAuthHeaders = (jsonBody = false): HeadersInit => {
  const token = authService.getAccessToken();
  if (!token) {
    throw new Error("Your session has expired. Please log in again.");
  }
  return {
    Authorization: `Bearer ${token}`,
    ...(jsonBody ? { "Content-Type": "application/json" } : {}),
  };
};

async function parseApiError(
  response: Response,
  fallback: string,
): Promise<string> {
  const contentType = response.headers.get("Content-Type") ?? "";
  try {
    if (contentType.includes("application/json")) {
      const body = await response.json();
      const detail =
        typeof body?.detail === "string" ? body.detail : undefined;
      return (
        body?.error || body?.message || detail || `${fallback} (${response.status})`
      );
    }
    const text = (await response.text()).trim();
    if (text) return text;
  } catch {
    // ignore parse errors
  }
  return `${fallback} (${response.status})`;
}

async function downloadFileFromResponse(
  response: Response,
  fallbackFileName: string,
): Promise<void> {
  const contentType = response.headers.get("Content-Type") ?? "";
  if (contentType.includes("application/json")) {
    throw new Error(
      await parseApiError(response, "Failed to download report template"),
    );
  }

  const blob = await response.blob();
  if (blob.size === 0) {
    throw new Error("Downloaded report template is empty");
  }

  const contentDisposition = response.headers.get("Content-Disposition");
  const fileNameMatch = contentDisposition?.match(
    /filename\*?=(?:UTF-8'')?["']?([^;"']+)["']?/i,
  );
  const fileName = fileNameMatch?.[1]
    ? decodeURIComponent(fileNameMatch[1])
    : fallbackFileName;
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

export function getDisplayPressure(record: ReportFileRecord): string {
  const measured = coercePressureField(record.pressure_measured);
  if (measured) return measured;
  return String(record.sample_pressure ?? "").trim();
}

/** Sample check-in status when measured pressure is at or below 25% of sample pressure. */
export const REJECTED_LOW_PRESSURE_STATUS = "Rejected – Low Pressure";

export const PENDING_PRESSURE_STATUS = "Pending";

export const REPORT_TEMPLATE_INSTRUMENTS = [
  "Inficon_1",
  "Scion GC_1",
  "Scion GC_2",
  "Scion GC_3",
  "Scion GC_4",
  "Inficon_2",
] as const;

export const REPORT_TEMPLATE_ANALYZED_BY = [
  "Johannes Xie",
  "Jarrett Lee",
  "Stefan Carrasco",
  "Jared Goldsmith",
] as const;

/** Fields accepted by PATCH /report_files/:sample_checkin_id */
export type ReportFilePatchPayload = {
  pressure_measured?: string | null;
  status?: string;
  instrument?: string | null;
  analyzed_on?: string | null;
  analyzed_by?: string | null;
  effective_start_date?: string | null;
  effective_end_date?: string | null;
};

export type ReportTemplateDownloadFields = {
  instrument: string;
  analyzedOn: string;
  analyzedBy: string;
  effectiveStartDate: string;
  effectiveEndDate: string;
};

/** HTML date input (YYYY-MM-DD) → backend effective_* (DD-MM-YYYY). */
export function isoDateInputToEffectiveApiDate(isoDate: string): string {
  const [year, month, day] = isoDate.trim().split("-");
  if (!year || !month || !day) return isoDate;
  return `${day.padStart(2, "0")}-${month.padStart(2, "0")}-${year}`;
}

/** HTML date input → ISO datetime for analyzed_on. */
export function isoDateInputToAnalyzedOnIso(isoDate: string): string {
  const trimmed = isoDate.trim();
  if (!trimmed) return "";
  return `${trimmed}T12:00:00.000Z`;
}

export function buildReportTemplatePatchPayload(
  pressureMeasured: string,
  samplePressure: string | null | undefined,
  fields: ReportTemplateDownloadFields,
): ReportFilePatchPayload {
  const pressurePatch = buildPressurePatchPayload(
    pressureMeasured,
    samplePressure,
  );
  return {
    ...pressurePatch,
    instrument: fields.instrument.trim(),
    analyzed_on: fields.analyzedOn.trim()
      ? isoDateInputToAnalyzedOnIso(fields.analyzedOn)
      : null,
    analyzed_by: fields.analyzedBy.trim(),
    effective_start_date: fields.effectiveStartDate.trim()
      ? isoDateInputToEffectiveApiDate(fields.effectiveStartDate)
      : null,
    effective_end_date: fields.effectiveEndDate.trim()
      ? isoDateInputToEffectiveApiDate(fields.effectiveEndDate)
      : null,
  };
}

function todayIsoDateInputValue(): string {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${now.getFullYear()}-${month}-${day}`;
}

function firstNonEmpty(...values: (string | null | undefined)[]): string {
  for (const value of values) {
    const trimmed = value?.trim();
    if (trimmed) return trimmed;
  }
  return "";
}

function dateToIsoInput(value: string | null | undefined): string {
  if (!value?.trim()) return "";
  return toIsoDateInputValue(String(value)) || "";
}

/** Prefill Download Report Template from report list row and/or sample check-in. */
export async function loadReportTemplateDownloadFields(
  record: ReportFileRecord,
): Promise<ReportTemplateDownloadFields> {
  const sample = await sampleCheckInService.fetchSampleCheckInById(
    record.sample_checkin_id,
  );

  const instrument = firstNonEmpty(record.instrument, sample?.instrument);
  const analyzedBy = firstNonEmpty(record.analyzed_by, sample?.analyzed_by);
  const analyzedOn =
    dateToIsoInput(record.analyzed_on) ||
    dateToIsoInput(sample?.analyzed_on) ||
    todayIsoDateInputValue();
  const effectiveStartDate =
    dateToIsoInput(record.effective_start_date) ||
    dateToIsoInput(sample?.effective_start_date);
  const effectiveEndDate =
    dateToIsoInput(record.effective_end_date) ||
    dateToIsoInput(sample?.effective_end_date);

  return {
    instrument: instrument || REPORT_TEMPLATE_INSTRUMENTS[0],
    analyzedBy: analyzedBy || REPORT_TEMPLATE_ANALYZED_BY[0],
    analyzedOn,
    effectiveStartDate,
    effectiveEndDate,
  };
}

export function instrumentOptionsForSelect(
  currentValue: string,
): readonly string[] {
  const trimmed = currentValue.trim();
  if (
    trimmed &&
    !(REPORT_TEMPLATE_INSTRUMENTS as readonly string[]).includes(trimmed)
  ) {
    return [trimmed, ...REPORT_TEMPLATE_INSTRUMENTS];
  }
  return REPORT_TEMPLATE_INSTRUMENTS;
}

export function analyzedByOptionsForSelect(
  currentValue: string,
): readonly string[] {
  const trimmed = currentValue.trim();
  if (
    trimmed &&
    !(REPORT_TEMPLATE_ANALYZED_BY as readonly string[]).includes(trimmed)
  ) {
    return [trimmed, ...REPORT_TEMPLATE_ANALYZED_BY];
  }
  return REPORT_TEMPLATE_ANALYZED_BY;
}

export function isLowPressureRejection(
  pressureMeasured: string,
  samplePressure: string | null | undefined,
): boolean {
  const measured = Number.parseFloat(pressureMeasured.trim());
  const sample = Number.parseFloat(String(samplePressure ?? "").trim());
  if (!Number.isFinite(measured) || !Number.isFinite(sample) || sample <= 0) {
    return false;
  }
  return measured <= sample * 0.25;
}

export function buildPressurePatchPayload(
  pressureMeasured: string,
  samplePressure?: string | null,
): Pick<ReportFilePatchPayload, "pressure_measured" | "status"> {
  const trimmed = pressureMeasured.trim();
  const status = isLowPressureRejection(trimmed, samplePressure)
    ? REJECTED_LOW_PRESSURE_STATUS
    : PENDING_PRESSURE_STATUS;
  return {
    pressure_measured: trimmed,
    status,
  };
}

export const reportFilesService = {
  loadReportTemplateDownloadFields,

  fetchReportFiles: async (): Promise<ReportFileRecord[]> => {
    const response = await fetch(`${API_BASE_URL}/report_files`, {
      method: "GET",
      headers: buildAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error(
        await parseApiError(response, "Failed to load report files"),
      );
    }

    const data = (await response.json()) as ReportFileRecord[];
    return Array.isArray(data)
      ? data.map((row) => normalizeReportFileRecord(row))
      : [];
  },

  patchReportFile: async (
    sampleCheckinId: number,
    patch: ReportFilePatchPayload,
  ): Promise<ReportFileRecord> => {
    const response = await fetch(
      `${API_BASE_URL}/report_files/${sampleCheckinId}`,
      {
        method: "PATCH",
        headers: buildAuthHeaders(true),
        body: JSON.stringify(patch),
      },
    );

    if (!response.ok) {
      throw new Error(
        await parseApiError(response, "Failed to update report file"),
      );
    }

    const raw = await response.json().catch(() => null);
    if (raw && typeof raw === "object" && "sample_checkin_id" in raw) {
      return normalizeReportFileRecord(raw as ReportFileRecord);
    }

    return {
      sample_checkin_id: sampleCheckinId,
      ...patch,
    } as ReportFileRecord;
  },

  updatePressureMeasured: async (
    sampleCheckinId: number,
    pressureMeasured: string,
    currentRecord?: ReportFileRecord | null,
  ): Promise<ReportFileRecord> => {
    const patchBody = buildPressurePatchPayload(
      pressureMeasured,
      currentRecord?.sample_pressure,
    );
    return reportFilesService.patchReportFile(sampleCheckinId, patchBody);
  },

  downloadReportTemplate: async (
    sampleCheckinId: number,
    reportTemplateName: string,
  ): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/report_files`, {
      method: "POST",
      headers: buildAuthHeaders(true),
      body: JSON.stringify({
        sample_checkin: sampleCheckinId,
        report_template_name: reportTemplateName,
      }),
    });

    if (!response.ok) {
      throw new Error(
        await parseApiError(response, "Failed to download report template"),
      );
    }

    const fallbackFileName = reportTemplateName.endsWith(".xlsx")
      ? reportTemplateName
      : `${reportTemplateName}.xlsx`;
    await downloadFileFromResponse(response, fallbackFileName);
  },

  /** PATCH report fields, then POST download (workbook uses saved check-in data). */
  updatePressureAndDownloadTemplate: async (
    sampleCheckinId: number,
    reportTemplateName: string,
    pressureMeasured: string,
    currentRecord: ReportFileRecord | null | undefined,
    templateFields: ReportTemplateDownloadFields,
  ): Promise<ReportFileRecord> => {
    const trimmed = pressureMeasured.trim();
    const updated = await reportFilesService.patchReportFile(
      sampleCheckinId,
      buildReportTemplatePatchPayload(
        trimmed,
        currentRecord?.sample_pressure,
        templateFields,
      ),
    );

    await reportFilesService.downloadReportTemplate(
      sampleCheckinId,
      reportTemplateName,
    );
    return updated;
  },

  searchRecords: (
    records: ReportFileRecord[],
    searchTerm: string,
  ): ReportFileRecord[] => {
    if (!searchTerm.trim()) return records;

    const term = searchTerm.toLowerCase();
    return records.filter((record) =>
      [
        record.company_name,
        record.analysis_number,
        record.work_order_number,
        record.cylinder_number,
        record.status,
        record.analysis_type,
        record.well_name,
        record.meter_number,
      ].some(
        (value) => value != null && String(value).toLowerCase().includes(term),
      ),
    );
  },

  filterByCompany: (
    records: ReportFileRecord[],
    company: string,
  ): ReportFileRecord[] => {
    if (company === "all") return records;
    return records.filter((record) => record.company_name === company);
  },

  filterByStatus: (
    records: ReportFileRecord[],
    status: string,
  ): ReportFileRecord[] => {
    if (status === "all") return records;
    return records.filter((record) => record.status === status);
  },

  filterByMeterNumber: (
    records: ReportFileRecord[],
    meterNumber: string,
  ): ReportFileRecord[] => {
    if (meterNumber === "all") return records;
    return records.filter((record) => record.meter_number === meterNumber);
  },

  filterByWellName: (
    records: ReportFileRecord[],
    wellName: string,
  ): ReportFileRecord[] => {
    if (wellName === "all") return records;
    return records.filter((record) => record.well_name === wellName);
  },

  filterByAnalysisNumber: (
    records: ReportFileRecord[],
    analysisNumber: string,
  ): ReportFileRecord[] => {
    if (analysisNumber === "all") return records;
    return records.filter(
      (record) => record.analysis_number === analysisNumber,
    );
  },

  getUniqueStatuses: (records: ReportFileRecord[]): string[] => {
    return Array.from(new Set(records.map((record) => record.status))).sort();
  },

  getUniqueCompanies: (records: ReportFileRecord[]): string[] => {
    return Array.from(
      new Set(records.map((record) => record.company_name)),
    ).sort();
  },

  getUniqueMeterNumbers: (records: ReportFileRecord[]): string[] => {
    return Array.from(
      new Set(
        records
          .map((record) => record.meter_number.trim())
          .filter((value) => value.length > 0),
      ),
    ).sort();
  },

  getUniqueWellNames: (records: ReportFileRecord[]): string[] => {
    return Array.from(
      new Set(
        records
          .map((record) => record.well_name.trim())
          .filter((value) => value.length > 0),
      ),
    ).sort();
  },

  getUniqueAnalysisNumbers: (records: ReportFileRecord[]): string[] => {
    return Array.from(
      new Set(
        records
          .map((record) => record.analysis_number.trim())
          .filter((value) => value.length > 0),
      ),
    ).sort();
  },

  exportToCSV: (records: ReportFileRecord[]): string => {
    const headers = [
      "Work Order #",
      "Company",
      "Analysis Type",
      "Cylinder #",
      "Analysis #",
      "Well Name",
      "Meter #",
      "Sample Date",
      "Status",
    ];

    const formatSampleDateForExport = (value: string): string => {
      if (!value?.trim()) return "";
      try {
        return formatDateUS(value);
      } catch {
        return value;
      }
    };

    const rows = records.map((record) => [
      record.work_order_number,
      record.company_name,
      record.analysis_type,
      record.cylinder_number,
      record.analysis_number,
      record.well_name,
      record.meter_number,
      formatSampleDateForExport(record.sample_date),
      record.status,
    ]);

    return [headers.join(","), ...rows.map((row) => row.join(","))].join("\n");
  },
};
