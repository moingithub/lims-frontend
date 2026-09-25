import { API_BASE_URL } from "../config/api";
import { authService } from "./authService";
import { companyMasterService } from "./companyMasterService";
import { analysisPricingService } from "./analysisPricingService";
import {
  resolveSampleCheckInAnalysisType,
  sampleCheckInService,
  SampleCheckInApiRecord,
} from "./sampleCheckInService";
import { extractDateFromDateTime } from "../utils/dateUtils";
import { mapAnalysisPositionService } from "./mapAnalysisPositionService";

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
  tag_image: string;
  scanned_tag_image?: string | null;
  import_machine_report_id?: number | null;
  import_id?: string | null;
}

export interface GasAnalysisComponentRow {
  component: string;
  mole_pct: string;
  wt_pct: string;
  gpm: string;
}

export interface GasAnalysisComponentTotals {
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
  sample_time: string;
  amb_temp: string;
  pressure_measured: string;
  pressure_base_factor: string;
  sample_pressure: string;
  sample_temperature: string;
  sample_method: string;
  instrument: string;
  last_instrument_verification: string;
  heating_method: string;
  hexanes_split: string;
  effective_start_date: string;
  effective_end_date: string;
  field_h2s: string;
  flow_rate: string;
  base_condition: string;
  physical_constant: string;
  components: GasAnalysisComponentRow[];
  component_totals: GasAnalysisComponentTotals;
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
    sample_time?: string;
    amb_temp?: string | null;
    pressure_measured?: string | null;
    pressure_base_factor?: number | string | null;
    sample_pressure?: string;
    sample_temperature?: string;
    sample_method?: string;
    instrument?: string | null;
    last_instrument_verification?: string | null;
    heating_method?: string | null;
    hexanes_split?: string | null;
    effective_start_date?: string | null;
    effective_end_date?: string | null;
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
  component_totals?: {
    mole_pct?: string | number | null;
    wt_pct?: string | number | null;
    gpm?: string | number | null;
  };
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

type ApiSampleCheckInListItem = SampleCheckInApiRecord;

const resolveReportDate = (record: SampleCheckInApiRecord): string =>
  record.date?.trim() ||
  extractDateFromDateTime(record.check_in_time) ||
  extractDateFromDateTime(record.created_at) ||
  "";

const mapSampleCheckInToReport = (
  record: ApiSampleCheckInListItem,
  analysisPosition?: {
    import_machine_report_id: number | null;
    import_id: string | null;
  },
): AnalysisReport => {
  const company =
    record.company_id != null
      ? companyMasterService.getCompanyById(record.company_id)
      : undefined;
  const analysisType = resolveSampleCheckInAnalysisType(record);

  return {
    id: record.id,
    sample_checkin_id: record.id,
    work_order_number: record.work_order_number ?? "",
    customer: record.company_name ?? company?.company_name ?? "",
    date: resolveReportDate(record),
    analysis_type: analysisType.name === "Unknown" ? "" : analysisType.name,
    analysis_number: record.analysis_number ?? "",
    cylinder_number: record.cylinder_number ?? "",
    well_name: record.well_name ?? "",
    meter_number: record.meter_number ?? "",
    status: record.status ?? "",
    created_by: record.created_by ?? record.created_by_id ?? 0,
    tag_image: record.tag_image ?? "",
    scanned_tag_image: record.scanned_tag_image ?? record.tag_image ?? null,
    import_machine_report_id:
      analysisPosition?.import_machine_report_id ?? null,
    import_id: analysisPosition?.import_id ?? null,
  };
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
    sample_time: toDisplayString(sample.sample_time),
    amb_temp: toDisplayString(sample.amb_temp),
    pressure_measured: toDisplayString(sample.pressure_measured),
    pressure_base_factor: toDisplayString(sample.pressure_base_factor),
    sample_pressure: toDisplayString(sample.sample_pressure),
    sample_temperature: toDisplayString(sample.sample_temperature),
    sample_method: sample.sample_method ?? "",
    instrument: toDisplayString(sample.instrument),
    last_instrument_verification: toDisplayString(
      sample.last_instrument_verification,
    ),
    heating_method: toDisplayString(sample.heating_method),
    hexanes_split: toDisplayString(sample.hexanes_split),
    effective_start_date: toDisplayString(sample.effective_start_date),
    effective_end_date: toDisplayString(sample.effective_end_date),
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
    component_totals: {
      mole_pct: toDisplayString(data.component_totals?.mole_pct),
      wt_pct: toDisplayString(data.component_totals?.wt_pct),
      gpm: toDisplayString(data.component_totals?.gpm),
    },
    gross_heating_value: mapConditionValues(results.gross_heating_value),
    specific_gravity: mapConditionValues(results.specific_gravity),
    compressibility_factor: mapConditionValues(results.compressibility_factor),
    gpm_totals: mapConditionValues(results.gpm),
    gpm_c2_plus: toDisplayString(gpmSummary.c2_plus),
    gpm_c3_plus: toDisplayString(gpmSummary.c3_plus),
  };
};

export const analysisReportsService = {
  fetchReports: async (): Promise<AnalysisReport[]> => {
    await analysisPricingService.fetchAnalysisPrices();
    const [data, analysisPositions] = await Promise.all([
      sampleCheckInService.fetchSampleCheckIns(true),
      mapAnalysisPositionService.fetchAnalysisPositions(),
    ]);
    const positionsBySampleId = new Map(
      analysisPositions.map((position) => [
        position.sample_checkin_id,
        position,
      ]),
    );

    return data.map((record) =>
      mapSampleCheckInToReport(record, positionsBySampleId.get(record.id)),
    );
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
    const report = mapApiGasAnalysisReport(data);

    const needsSampleFallback =
      !report.sampled_by.trim() ||
      !report.analyzed_by.trim() ||
      !report.base_condition.trim() ||
      !report.instrument.trim() ||
      !report.effective_start_date.trim();

    if (!needsSampleFallback) return report;

    const sample =
      await sampleCheckInService.fetchSampleCheckInById(sampleCheckinId);
    if (!sample) return report;

    return {
      ...report,
      sampled_by: report.sampled_by || sample.sampled_by?.trim() || "",
      analyzed_by: report.analyzed_by || sample.analyzed_by?.trim() || "",
      base_condition:
        report.base_condition || sample.base_condition?.trim() || "",
      physical_constant:
        report.physical_constant || sample.physical_constant?.trim() || "",
      pressure_measured:
        report.pressure_measured || sample.pressure_measured?.trim() || "",
      pressure_base_factor:
        report.pressure_base_factor ||
        toDisplayString(sample.pressure_base_factor),
      instrument: report.instrument || sample.instrument?.trim() || "",
      last_instrument_verification:
        report.last_instrument_verification ||
        sample.last_instrument_verification?.trim() ||
        "",
      heating_method:
        report.heating_method || sample.heating_method?.trim() || "",
      hexanes_split: report.hexanes_split || sample.hexanes_split?.trim() || "",
      effective_start_date:
        report.effective_start_date ||
        sample.effective_start_date?.trim() ||
        "",
      effective_end_date:
        report.effective_end_date || sample.effective_end_date?.trim() || "",
    };
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

  filterByMeterNumber: (
    reports: AnalysisReport[],
    meterNumber: string,
  ): AnalysisReport[] => {
    if (meterNumber === "all") return reports;
    return reports.filter((report) => report.meter_number === meterNumber);
  },

  filterByWellName: (
    reports: AnalysisReport[],
    wellName: string,
  ): AnalysisReport[] => {
    if (wellName === "all") return reports;
    return reports.filter((report) => report.well_name === wellName);
  },

  filterByAnalysisNumber: (
    reports: AnalysisReport[],
    analysisNumber: string,
  ): AnalysisReport[] => {
    if (analysisNumber === "all") return reports;
    return reports.filter(
      (report) => report.analysis_number === analysisNumber,
    );
  },

  getUniqueStatuses: (reports: AnalysisReport[]): string[] => {
    return Array.from(new Set(reports.map((report) => report.status))).sort();
  },

  getUniqueCustomers: (reports: AnalysisReport[]): string[] => {
    return Array.from(new Set(reports.map((report) => report.customer))).sort();
  },

  getUniqueMeterNumbers: (reports: AnalysisReport[]): string[] => {
    return Array.from(
      new Set(
        reports
          .map((report) => report.meter_number.trim())
          .filter((value) => value.length > 0),
      ),
    ).sort();
  },

  getUniqueWellNames: (reports: AnalysisReport[]): string[] => {
    return Array.from(
      new Set(
        reports
          .map((report) => report.well_name.trim())
          .filter((value) => value.length > 0),
      ),
    ).sort();
  },

  getUniqueAnalysisNumbers: (reports: AnalysisReport[]): string[] => {
    return Array.from(
      new Set(
        reports
          .map((report) => report.analysis_number.trim())
          .filter((value) => value.length > 0),
      ),
    ).sort();
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
