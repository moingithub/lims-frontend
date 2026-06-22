import { API_BASE_URL } from "../config/api";
import { authService } from "./authService";

export interface AnalysisPositionRecord {
  sample_checkin_id: number;
  company_name: string;
  work_order_number: string;
  cylinder_number: string | null;
  analysis_number: string;
  status: string;
  analysis_position: number | null;
  import_machine_report_id: number | null;
  import_id: string | null;
}

export interface UpdateAnalysisPositionPayload {
  analysis_position: number | null;
  import_machine_report_id: number | null;
}

const buildAuthHeaders = (): HeadersInit => {
  const token = authService.getAuthState().token;
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
  return body?.error || body?.message || fallback;
}

export const mapAnalysisPositionService = {
  needsMapping: (record: AnalysisPositionRecord): boolean =>
    !record.import_machine_report_id ||
    record.analysis_position == null ||
    !record.import_id?.trim(),

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
    return (data as AnalysisPositionRecord | null) ?? {
      sample_checkin_id: sampleCheckinId,
      analysis_position: payload.analysis_position,
      import_machine_report_id: payload.import_machine_report_id,
    } as AnalysisPositionRecord;
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
      ].some((value) => value != null && String(value).toLowerCase().includes(term)),
    );
  },
};
