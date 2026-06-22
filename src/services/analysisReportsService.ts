import { API_BASE_URL } from "../config/api";
import { authService } from "./authService";
import { companyMasterService } from "./companyMasterService";

export interface AnalysisReport {
  id: number;
  sample_checkin_id: number;
  work_order_number: string;
  customer: string;
  date: string;
  analysis_type: string;
  analysis_number: string;
  cylinder_number: string;
  well_name: string;
  meter_number: string;
  status: string;
  created_by: number;
}

export interface GasAnalysisComponentRow {
  component: string;
  mole_pct: string;
  wt_pct: string;
  gpm: string;
}

export interface GasAnalysisConditionValues {
  dry_ideal: string;
  dry_real: string;
  wet_ideal: string;
  wet_real: string;
}

export interface GasAnalysisReport {
  sample_checkin_id: number;
  customer: string;
  customer_contact_person?: string;
  customer_email?: string;
  customer_phone?: string;
  method: string;
  analysis_number: string;
  cylinder_number: string;
  analyzed_on: string;
  analyzed_by: string;
  producer: string;
  well_lease: string;
  meter_number: string;
  sample_type: string;
  remarks: string;
  sampled_by: string;
  sample_date: string;
  sample_pressure: string;
  sample_temperature: string;
  sample_method: string;
  field_h2s: string;
  flow_rate: string;
  base_condition: string;
  physical_constant: string;
  components: GasAnalysisComponentRow[];
  gross_heating_value: GasAnalysisConditionValues;
  specific_gravity: GasAnalysisConditionValues;
  compressibility_factor: GasAnalysisConditionValues;
  gpm_totals: GasAnalysisConditionValues;
  gpm_c2_plus: string;
  gpm_c3_plus: string;
}

type ApiDryWetValues = {
  dry?: { ideal?: string | number | null; real?: string | number | null };
  wet?: { ideal?: string | number | null; real?: string | number | null };
};

type ApiAnalysisReportResponse = {
  sample_checkin_id: number;
  customer_information?: {
    company_name?: string;
    phone?: string;
    email?: string;
    contact_person?: string;
  };
  report_information?: {
    method?: string;
    analysis_number?: string;
    cylinder_number?: string;
    analyzed_on?: string;
    analyzed_by?: string;
  };
  sample_information?: {
    producer?: string;
    well_lease?: string;
    meter_number?: string;
    sample_type?: string;
    remarks?: string;
    sampled_by?: string;
    sample_date?: string;
    sample_pressure?: string;
    sample_temperature?: string;
    sample_method?: string;
    field_h2s?: number | string | null;
    flow_rate?: string | number | null;
  };
  base_conditions?: {
    base_condition?: string;
    physical_constant?: string;
  };
  component_table?: Array<{
    component?: string;
    mole_pct?: string | number | null;
    wt_pct?: string | number | null;
    gpm?: string | number | null;
  }>;
  analysis_results?: {
    gross_heating_value?: ApiDryWetValues;
    specific_gravity?: ApiDryWetValues;
    compressibility_factor?: ApiDryWetValues;
    gpm?: ApiDryWetValues;
  };
  gpm_summary?: {
    c2_plus?: string | number | null;
    c3_plus?: string | number | null;
  };
};

type ApiSampleCheckInListItem = {
  id: number;
  work_order_number?: string;
  analysis_number?: string;
  analysis_type?: string;
  cylinder_number?: string;
  well_name?: string;
  meter_number?: string;
  date?: string;
  status?: string;
  company_id?: number;
  company_name?: string;
  created_by?: number;
};

const buildAuthHeaders = (): HeadersInit => {
  const token = authService.getAuthState().token;
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

const toDisplayString = (value: unknown): string => {
  if (value == null || value === "") return "";
  return String(value);
};

const mapConditionValues = (
  values?: ApiDryWetValues,
): GasAnalysisConditionValues => ({
  dry_ideal: toDisplayString(values?.dry?.ideal),
  dry_real: toDisplayString(values?.dry?.real),
  wet_ideal: toDisplayString(values?.wet?.ideal),
  wet_real: toDisplayString(values?.wet?.real),
});

const mapApiGasAnalysisReport = (
  data: ApiAnalysisReportResponse,
): GasAnalysisReport => {
  const customer = data.customer_information ?? {};
  const report = data.report_information ?? {};
  const sample = data.sample_information ?? {};
  const base = data.base_conditions ?? {};
  const results = data.analysis_results ?? {};
  const gpmSummary = data.gpm_summary ?? {};

  return {
    sample_checkin_id: data.sample_checkin_id,
    customer: customer.company_name ?? "",
    customer_contact_person: customer.contact_person ?? "",
    customer_email: customer.email ?? "",
    customer_phone: customer.phone ?? "",
    method: report.method ?? "",
    analysis_number: report.analysis_number ?? "",
    cylinder_number: report.cylinder_number ?? "",
    analyzed_on: report.analyzed_on ?? "",
    analyzed_by: report.analyzed_by ?? "",
    producer: sample.producer ?? "",
    well_lease: sample.well_lease ?? "",
    meter_number: sample.meter_number ?? "",
    sample_type: sample.sample_type ?? "",
    remarks: sample.remarks ?? "",
    sampled_by: sample.sampled_by ?? "",
    sample_date: sample.sample_date ?? "",
    sample_pressure: toDisplayString(sample.sample_pressure),
    sample_temperature: toDisplayString(sample.sample_temperature),
    sample_method: sample.sample_method ?? "",
    field_h2s: toDisplayString(sample.field_h2s),
    flow_rate: toDisplayString(sample.flow_rate),
    base_condition: base.base_condition ?? "",
    physical_constant: base.physical_constant ?? "",
    components: (data.component_table ?? []).map((row) => ({
      component: row.component ?? "",
      mole_pct: toDisplayString(row.mole_pct),
      wt_pct: toDisplayString(row.wt_pct),
      gpm: toDisplayString(row.gpm),
    })),
    gross_heating_value: mapConditionValues(results.gross_heating_value),
    specific_gravity: mapConditionValues(results.specific_gravity),
    compressibility_factor: mapConditionValues(results.compressibility_factor),
    gpm_totals: mapConditionValues(results.gpm),
    gpm_c2_plus: toDisplayString(gpmSummary.c2_plus),
    gpm_c3_plus: toDisplayString(gpmSummary.c3_plus),
  };
};

const mapSampleCheckInToReport = (
  record: ApiSampleCheckInListItem,
): AnalysisReport => {
  const company =
    record.company_id != null
      ? companyMasterService.getCompanyById(record.company_id)
      : undefined;

  return {
    id: record.id,
    sample_checkin_id: record.id,
    work_order_number: record.work_order_number ?? "",
    customer: record.company_name ?? company?.company_name ?? "",
    date: record.date ?? "",
    analysis_type: record.analysis_type ?? "",
    analysis_number: record.analysis_number ?? "",
    cylinder_number: record.cylinder_number ?? "",
    well_name: record.well_name ?? "",
    meter_number: record.meter_number ?? "",
    status: record.status ?? "",
    created_by: record.created_by ?? 0,
  };
};

export const analysisReportsService = {
  fetchReports: async (): Promise<AnalysisReport[]> => {
    const response = await fetch(`${API_BASE_URL}/sample_checkin`, {
      method: "GET",
      headers: buildAuthHeaders(),
    });

    if (!response.ok) {
      const message =
        response.status === 401
          ? "Unauthorized"
          : "Failed to load analysis reports";
      throw new Error(message);
    }

    const data = (await response.json()) as ApiSampleCheckInListItem[];
    return Array.isArray(data) ? data.map(mapSampleCheckInToReport) : [];
  },

  fetchGasAnalysisReport: async (
    sampleCheckinId: number,
  ): Promise<GasAnalysisReport> => {
    const response = await fetch(
      `${API_BASE_URL}/analysis_reports/${sampleCheckinId}`,
      {
        method: "GET",
        headers: buildAuthHeaders(),
      },
    );

    if (!response.ok) {
      const message =
        response.status === 401
          ? "Unauthorized"
          : "Failed to load gas analysis report";
      throw new Error(message);
    }

    const data = (await response.json()) as ApiAnalysisReportResponse;
    return mapApiGasAnalysisReport(data);
  },

  searchReports: (
    reports: AnalysisReport[],
    searchTerm: string,
  ): AnalysisReport[] => {
    if (!searchTerm) return reports;

    const lowerSearch = searchTerm.toLowerCase();
    return reports.filter(
      (report) =>
        report.work_order_number.toLowerCase().includes(lowerSearch) ||
        report.customer.toLowerCase().includes(lowerSearch) ||
        report.analysis_type.toLowerCase().includes(lowerSearch) ||
        report.analysis_number.toLowerCase().includes(lowerSearch) ||
        report.cylinder_number.toLowerCase().includes(lowerSearch) ||
        report.well_name.toLowerCase().includes(lowerSearch) ||
        report.meter_number.toLowerCase().includes(lowerSearch) ||
        report.status.toLowerCase().includes(lowerSearch),
    );
  },

  filterByStatus: (
    reports: AnalysisReport[],
    status: string,
  ): AnalysisReport[] => {
    if (status === "all") return reports;
    return reports.filter((report) => report.status === status);
  },

  filterByCustomer: (
    reports: AnalysisReport[],
    customer: string,
  ): AnalysisReport[] => {
    if (customer === "all") return reports;
    return reports.filter((report) => report.customer === customer);
  },

  getUniqueStatuses: (reports: AnalysisReport[]): string[] => {
    return Array.from(new Set(reports.map((report) => report.status))).sort();
  },

  getUniqueCustomers: (reports: AnalysisReport[]): string[] => {
    return Array.from(new Set(reports.map((report) => report.customer))).sort();
  },

  getStatusBadgeVariant: (status: string): string => {
    switch (status) {
      case "Completed":
        return "bg-green-100 text-green-800";
      case "In Progress":
        return "bg-yellow-100 text-yellow-800";
      case "Pending":
        return "bg-gray-100 text-gray-800";
      case "Invoiced":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  },

  exportToCSV: (reports: AnalysisReport[]): string => {
    const headers = [
      "Work Order #",
      "Customer",
      "Date",
      "Analysis Type",
      "Analysis #",
      "Cylinder #",
      "Well Name",
      "Meter #",
      "Status",
    ];
    const rows = reports.map((report) => [
      report.work_order_number,
      report.customer,
      report.date,
      report.analysis_type,
      report.analysis_number,
      report.cylinder_number,
      report.well_name,
      report.meter_number,
      report.status,
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map((row) => row.join(",")),
    ].join("\n");

    return csvContent;
  },
};
