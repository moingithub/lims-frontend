import { API_BASE_URL } from "../config/api";
import { authService } from "./authService";
import { ImportRecord } from "./importMachineReportService";

export interface AnalysisPositionRecord {
  sample_checkin_id: number;
  company_id?: number | null;
  company_name: string;
  work_order_number: string;
  cylinder_number: string | null;
  analysis_number: string;
  status: string;
  analysis_position: number | null;
  import_machine_report_id: number | null;
  import_id: string | null;
  tag_image: string;
  scanned_tag_image?: string | null;
  pressure_base_factor?: number;
  pressure_measured?: string | null;
  amb_temp?: string | null;
  sample_time?: string | null;
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

export interface UpdateAnalysisPositionPayload {
  analysis_position: number | null;
  import_machine_report_id: number | null;
  pressure_measured?: string;
}

const buildAuthHeaders = (): HeadersInit => {
  const token =
    authService.getAccessToken?.() ?? authService.getAuthState().token;
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

async function parseApiError(
  response: Response,
  fallback: string,
): Promise<string> {
  const body = await response.json().catch(() => ({}));
  return (
    body?.error ||
    body?.message ||
    (typeof body?.detail === "string" ? body.detail : undefined) ||
    fallback
  );
}

export const mapAnalysisPositionService = {
  needsMapping: (record: AnalysisPositionRecord): boolean =>
    !record.import_machine_report_id ||
    record.analysis_position == null ||
    !record.import_id?.trim(),

  getAvailableImportRecords: (
    importRecords: ImportRecord[],
    records: AnalysisPositionRecord[],
    currentRecord?: AnalysisPositionRecord | null,
  ): ImportRecord[] => {
    const mappedImportIds = new Set(
      records
        .map((record) => record.import_machine_report_id)
        .filter((id): id is number => id != null),
    );
    const currentImportId = currentRecord?.import_machine_report_id ?? null;

    return importRecords.filter(
      (importRecord) =>
        !mappedImportIds.has(importRecord.id) ||
        importRecord.id === currentImportId,
    );
  },

  fetchAnalysisPositions: async (): Promise<AnalysisPositionRecord[]> => {
    const response = await fetch(
      `${API_BASE_URL}/sample_checkin/analysis_positions`,
      {
        method: "GET",
        headers: buildAuthHeaders(),
      },
    );

    if (!response.ok) {
      throw new Error(
        await parseApiError(response, "Failed to load analysis positions"),
      );
    }

    const data = (await response.json()) as AnalysisPositionRecord[];
    return Array.isArray(data) ? data : [];
  },

  updateAnalysisPosition: async (
    sampleCheckinId: number,
    payload: UpdateAnalysisPositionPayload,
  ): Promise<AnalysisPositionRecord> => {
    const response = await fetch(
      `${API_BASE_URL}/sample_checkin/update_analysis_position/${sampleCheckinId}`,
      {
        method: "PUT",
        headers: buildAuthHeaders(),
        body: JSON.stringify(payload),
      },
    );

    if (!response.ok) {
      throw new Error(
        await parseApiError(response, "Failed to update analysis position"),
      );
    }

    const data = await response.json().catch(() => null);
    return (
      (data as AnalysisPositionRecord | null) ??
      ({
        sample_checkin_id: sampleCheckinId,
        analysis_position: payload.analysis_position,
        import_machine_report_id: payload.import_machine_report_id,
      } as AnalysisPositionRecord)
    );
  },

  unmapAnalysisPosition: async (
    sampleCheckinId: number,
  ): Promise<AnalysisPositionRecord> => {
    return mapAnalysisPositionService.updateAnalysisPosition(sampleCheckinId, {
      analysis_position: null,
      import_machine_report_id: null,
    });
  },

  searchRecords: (
    records: AnalysisPositionRecord[],
    searchTerm: string,
  ): AnalysisPositionRecord[] => {
    if (!searchTerm.trim()) return records;

    const term = searchTerm.toLowerCase();
    return records.filter((record) =>
      [
        record.company_name,
        record.analysis_number,
        record.import_id,
        record.analysis_position,
        record.work_order_number,
        record.cylinder_number,
        record.status,
      ].some(
        (value) => value != null && String(value).toLowerCase().includes(term),
      ),
    );
  },
};
