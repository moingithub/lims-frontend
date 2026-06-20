import { API_BASE_URL } from "../config/api";
import { authService } from "./authService";

export interface ImportRecord {
  id: number;
  import_id: string;
  source_machine: string;
  status: "Imported" | "Validated" | "Error" | "Archived";
  file_name: string;
  uploaded_by: string;
  imported_date_time: string;
  created_by: number;
}

let importRecordsCache: ImportRecord[] = [];

const buildAuthHeaders = (includeJson = false): HeadersInit => {
  const token = authService.getAuthState().token;
  return {
    ...(includeJson ? { "Content-Type": "application/json" } : {}),
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

export const importMachineReportService = {
  getImportRecords: (): ImportRecord[] => importRecordsCache,

  setImportRecords: (records: ImportRecord[]): void => {
    importRecordsCache = records;
  },

  fetchImportRecords: async (): Promise<ImportRecord[]> => {
    const response = await fetch(`${API_BASE_URL}/import_machine_reports`, {
      headers: buildAuthHeaders(),
    });
    if (!response.ok) {
      throw new Error(await parseApiError(response, "Failed to load import records"));
    }
    const records: ImportRecord[] = await response.json();
    importRecordsCache = records;
    return records;
  },

  searchRecords: (records: ImportRecord[], searchTerm: string): ImportRecord[] => {
    if (!searchTerm.trim()) return records;
    const term = searchTerm.toLowerCase();
    return records.filter((record) =>
      Object.values(record).some((value) =>
        String(value).toLowerCase().includes(term),
      ),
    );
  },

  getStatusBadgeVariant: (status: string): string => {
    switch (status) {
      case "Validated":
        return "bg-green-100 text-green-800";
      case "Imported":
        return "bg-blue-100 text-blue-800";
      case "Error":
        return "bg-red-100 text-red-800";
      case "Archived":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  },

  formatDateTime: (dateString: string): string => {
    const date = new Date(dateString);
    if (Number.isNaN(date.getTime())) return "";
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    const hours = date.getHours() % 12 || 12;
    const minutes = String(date.getMinutes()).padStart(2, "0");
    const ampm = date.getHours() >= 12 ? "PM" : "AM";
    return `${day}/${month}/${year} ${hours}:${minutes} ${ampm}`;
  },

  validateFile: (file: File): { valid: boolean; error?: string } => {
    if (!file) {
      return { valid: false, error: "No file selected" };
    }

    const validTypes = [
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "application/vnd.ms-excel",
      "text/csv",
      "application/csv",
      "application/json",
      "text/json",
      "application/octet-stream",
    ];
    const validExtensions = [".xlsx", ".xls", ".csv", ".json", ".fusion-data"];
    const lowerName = file.name.toLowerCase();
    const extension = file.name.includes(".")
      ? file.name.slice(file.name.lastIndexOf(".")).toLowerCase()
      : "";

    if (
      !validTypes.includes(file.type) &&
      !validExtensions.includes(extension) &&
      !lowerName.endsWith(".fusion-data")
    ) {
      return {
        valid: false,
        error:
          "Invalid file type. Please upload Excel, CSV, JSON, or FUSION-DATA (.fusion-data) files only.",
      };
    }

    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      return { valid: false, error: "File size exceeds 10MB limit." };
    }

    return { valid: true };
  },

  uploadFile: async (
    file: File,
    sourceMachine: string,
  ): Promise<ImportRecord> => {
    const validation = importMachineReportService.validateFile(file);
    if (!validation.valid) {
      throw new Error(validation.error || "Invalid file");
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("source_machine", sourceMachine);

    const response = await fetch(`${API_BASE_URL}/import_machine_reports`, {
      method: "POST",
      headers: buildAuthHeaders(),
      body: formData,
    });

    if (!response.ok) {
      throw new Error(await parseApiError(response, "Failed to upload file"));
    }

    const created: ImportRecord = await response.json();
    importRecordsCache = [created, ...importRecordsCache];
    return created;
  },

  updateStatus: async (
    id: number,
    status: ImportRecord["status"],
  ): Promise<ImportRecord> => {
    const response = await fetch(
      `${API_BASE_URL}/import_machine_reports/${id}/status`,
      {
        method: "PUT",
        headers: buildAuthHeaders(true),
        body: JSON.stringify({ status }),
      },
    );

    if (!response.ok) {
      throw new Error(
        await parseApiError(response, "Failed to update import record"),
      );
    }

    const updated: ImportRecord = await response.json();
    importRecordsCache = importRecordsCache.map((record) =>
      record.id === id ? updated : record,
    );
    return updated;
  },

  deleteRecord: async (id: number): Promise<void> => {
    const response = await fetch(
      `${API_BASE_URL}/import_machine_reports/${id}`,
      {
        method: "DELETE",
        headers: buildAuthHeaders(),
      },
    );

    if (!response.ok) {
      throw new Error(
        await parseApiError(response, "Failed to delete import record"),
      );
    }

    importRecordsCache = importRecordsCache.filter((record) => record.id !== id);
  },
};
