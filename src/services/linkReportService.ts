import {
  AnalysisPositionRecord,
  mapAnalysisPositionService,
} from "./mapAnalysisPositionService";
import { API_BASE_URL } from "../config/api";
import { authService } from "./authService";
import { importMachineReportService } from "./importMachineReportService";
import { sampleCheckInService } from "./sampleCheckInService";

const ANALYSIS_POSITION = 1;
const DEFAULT_SOURCE_MACHINE = "Inficon GC";

const buildAuthHeaders = (): HeadersInit => {
  const token =
    authService.getAccessToken?.() ?? authService.getAuthState().token;
  return token ? { Authorization: `Bearer ${token}` } : {};
};

async function parseApiError(
  response: Response,
  fallback: string,
): Promise<string> {
  const body = await response.json().catch(() => ({}));
  const detail =
    typeof body?.detail === "string" ? body.detail : undefined;
  return body?.error || body?.message || detail || fallback;
}

export const linkReportService = {
  downloadAnalysisReport: async (
    sampleCheckinId: number,
    fallbackFileName: string,
  ): Promise<void> => {
    const response = await fetch(
      `${API_BASE_URL}/sample_checkin/${sampleCheckinId}/analysis-report/download`,
      {
        method: "GET",
        headers: buildAuthHeaders(),
      },
    );

    if (!response.ok) {
      throw new Error(
        await parseApiError(response, "Failed to download analysis report"),
      );
    }

    const blob = await response.blob();
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
  },

  linkReport: async (
    sampleCheckinId: number,
    file: File,
    companyId: number,
    pressureMeasured: string,
  ): Promise<{
    record: AnalysisPositionRecord;
    importId: string;
    fileName: string;
  }> => {
    const sample =
      await sampleCheckInService.fetchSampleCheckInById(sampleCheckinId);
    if (!sample) {
      throw new Error("Sample check-in could not be found");
    }

    const resolvedCompanyId = sample.company_id || companyId;
    if (!resolvedCompanyId) {
      throw new Error("Could not resolve company for this analysis");
    }

    const imported = await importMachineReportService.uploadFile(
      file,
      DEFAULT_SOURCE_MACHINE,
      resolvedCompanyId,
      {
        sample_checkin_id: sampleCheckinId,
        instrument: sample.instrument,
        last_instrument_verification: sample.last_instrument_verification,
        heating_method: sample.heating_method,
        hexanes_split: sample.hexanes_split,
        sample_method: sample.sample_method,
        effective_start_date: sample.effective_start_date,
        effective_end_date: sample.effective_end_date,
      },
    );

    const record = await mapAnalysisPositionService.updateAnalysisPosition(
      sampleCheckinId,
      {
        analysis_position: ANALYSIS_POSITION,
        import_machine_report_id: imported.id,
        pressure_measured: pressureMeasured.trim(),
      },
    );

    return {
      record: {
        ...record,
        pressure_base_factor: sample.pressure_base_factor,
        pressure_measured: pressureMeasured.trim(),
        amb_temp: sample.amb_temp,
        sample_time: sample.sample_time,
        sample_date: sample.sample_date ?? sample.sampled_date,
        sampled_by: sample.sampled_by,
        analyzed_by: sample.analyzed_by,
        base_condition: sample.base_condition,
        physical_constant: sample.physical_constant,
        instrument: sample.instrument,
        last_instrument_verification: sample.last_instrument_verification,
        heating_method: sample.heating_method,
        hexanes_split: sample.hexanes_split,
        sample_method: sample.sample_method,
        effective_start_date: sample.effective_start_date,
        effective_end_date: sample.effective_end_date,
        import_id: record.import_id ?? imported.import_id,
        import_machine_report_id: imported.id,
        analysis_position: ANALYSIS_POSITION,
      },
      importId: imported.import_id,
      fileName: imported.file_name,
    };
  },
};
