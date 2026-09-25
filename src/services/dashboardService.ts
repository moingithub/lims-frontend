import { cylinderCheckOutService } from './cylinderCheckOutService';
import {
  sampleCheckInService,
  parseSampleCheckInAnalysisPosition,
  resolveSampleCheckInAnalysisType,
  SampleCheckInApiRecord,
} from './sampleCheckInService';
import { workOrdersService, WorkOrderWithId } from './workOrdersService';
import { companyMasterService } from './companyMasterService';
import { analysisPricingService } from './analysisPricingService';
import { mapAnalysisPositionService } from './mapAnalysisPositionService';

export interface DashboardSample {
  id: number;
  company_id: number;
  company_name: string;
  analysis_type: string;
  analysis_type_id: number | null;
  rushed: boolean;
  check_in_time: string;
  work_order_number: string;
  analysis_position: number | null;
  created_by: number;
}

const getSampleRevenueEstimate = (
  analysisType: string,
  rushed = false,
): number => {
  const pricing = analysisPricingService.getAnalysisPriceByCode(analysisType);
  if (!pricing) return 0;

  const baseRate = rushed ? pricing.rushed_rate : pricing.standard_rate;
  return baseRate + (pricing.sample_fee ?? 0);
};

let dashboardDataLoaded = false;
let dashboardSamples: DashboardSample[] = [];
let dashboardCheckOutTimestamps: string[] = [];
let dashboardWorkOrders: WorkOrderWithId[] = [];

const mapSampleCheckInForDashboard = (
  record: SampleCheckInApiRecord,
  analysisPositionBySampleId: Map<number, number>,
): DashboardSample => {
  const company =
    record.company_id != null
      ? companyMasterService.getCompanyById(record.company_id)
      : undefined;
  const analysisType = resolveSampleCheckInAnalysisType(record);
  const analysisPosition =
    parseSampleCheckInAnalysisPosition(record.analysis_position) ??
    (analysisPositionBySampleId.has(record.id)
      ? analysisPositionBySampleId.get(record.id) ?? null
      : null);

  return {
    id: record.id,
    company_id: record.company_id ?? 0,
    company_name: record.company_name ?? company?.company_name ?? "",
    analysis_type: analysisType.name,
    analysis_type_id: analysisType.id,
    rushed: Boolean(record.rushed),
    check_in_time:
      record.check_in_time ?? record.created_at ?? record.date ?? "",
    work_order_number: record.work_order_number ?? "",
    analysis_position: analysisPosition,
    created_by: record.created_by ?? record.created_by_id ?? 0,
  };
};

const matchesAnalysisTypeFilter = (
  sample: DashboardSample,
  filterType: string,
): boolean => {
  if (sample.analysis_type === filterType) return true;

  const pricing = analysisPricingService.getAnalysisPriceByCode(filterType);
  if (pricing && sample.analysis_type_id === pricing.id) return true;

  return false;
};

const parseFilterStartDate = (value?: string): Date | null => {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  date.setHours(0, 0, 0, 0);
  return date;
};

const parseFilterEndDate = (value?: string): Date | null => {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  date.setHours(23, 59, 59, 999);
  return date;
};

const isWithinDateRange = (
  value: string | undefined,
  fromDate: Date | null,
  toDate: Date | null,
): boolean => {
  if (!value) return false;
  const recordDate = new Date(value);
  if (Number.isNaN(recordDate.getTime())) return false;
  if (fromDate && recordDate < fromDate) return false;
  if (toDate && recordDate > toDate) return false;
  return true;
};

const filterSamples = (
  samples: DashboardSample[],
  filters?: DashboardFilters,
): DashboardSample[] => {
  const fromDate = parseFilterStartDate(filters?.dateFrom);
  const toDate = parseFilterEndDate(filters?.dateTo);

  return samples.filter((sample) => {
    if (!isWithinDateRange(sample.check_in_time, fromDate, toDate)) {
      return false;
    }
    if (
      filters?.analysisType &&
      filters.analysisType !== "all" &&
      !matchesAnalysisTypeFilter(sample, filters.analysisType)
    ) {
      return false;
    }
    return true;
  });
};

const getLastSixMonthLabels = (): string[] => {
  const labels: string[] = [];
  const now = new Date();
  for (let i = 5; i >= 0; i -= 1) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    labels.push(date.toLocaleString("en-US", { month: "short" }));
  }
  return labels;
};

const buildAnalysisTypesByWorkOrder = (
  samples: DashboardSample[],
): Map<string, Set<string>> => {
  const map = new Map<string, Set<string>>();
  samples.forEach((sample) => {
    if (!sample.work_order_number) return;
    const current = map.get(sample.work_order_number) ?? new Set<string>();
    if (sample.analysis_type && sample.analysis_type !== "Unknown") {
      current.add(sample.analysis_type);
    }
    map.set(sample.work_order_number, current);
  });
  return map;
};

export interface DashboardStat {
  id: number;
  title: string;
  value: string;
  color: string;
}

export interface AnalysisTypeData {
  id: number;
  name: string;
  value: number;
  revenue: number;
  color: string;
}

export interface MonthlyTrendData {
  id: number;
  month: string;
  samples: number;
  revenue: number;
}

export interface PendingWorkOrder {
  id: number;
  work_order_number: string;
  customer: string;
  cylinders: number;
  analysis_type: string;
  date_received: string;
  hours_in_queue: number;
  created_by: number;
}

export interface CustomerData {
  id: number;
  customer: string;
  samples: number;
  revenue: number;
  created_by: number;
}

export interface DailyActivityData {
  id: number;
  day: string;
  check_in: number;
  check_out: number;
  created_by: number;
}

export interface DashboardFilters {
  dateFrom?: string;
  dateTo?: string;
  analysisType?: string;
}

export const dashboardService = {
  fetchDashboardSourceData: async (force = false): Promise<void> => {
    if (dashboardDataLoaded && !force) return;

    const [
      sampleResult,
      checkOutResult,
      workOrderResult,
      companyResult,
      pricingResult,
      positionsResult,
    ] = await Promise.allSettled([
      sampleCheckInService.fetchSampleCheckIns(force),
      cylinderCheckOutService.fetchCheckOutRecords(force),
      workOrdersService.fetchWorkOrders(),
      companyMasterService.fetchCompanies(force),
      analysisPricingService.fetchAnalysisPrices(force),
      mapAnalysisPositionService.fetchAnalysisPositions(),
    ]);

    const analysisPositionBySampleId = new Map<number, number>();

    if (positionsResult.status === "fulfilled") {
      positionsResult.value.forEach((record) => {
        const position = parseSampleCheckInAnalysisPosition(
          record.analysis_position,
        );
        if (position != null) {
          analysisPositionBySampleId.set(record.sample_checkin_id, position);
        }
      });
    }

    if (sampleResult.status === "fulfilled") {
      sampleResult.value.forEach((record) => {
        const position = parseSampleCheckInAnalysisPosition(
          record.analysis_position,
        );
        if (position != null) {
          analysisPositionBySampleId.set(record.id, position);
        }
      });
    }

    if (sampleResult.status === "fulfilled") {
      dashboardSamples = sampleResult.value.map((record) =>
        mapSampleCheckInForDashboard(record, analysisPositionBySampleId),
      );
    }

    if (checkOutResult.status === "fulfilled") {
      dashboardCheckOutTimestamps = checkOutResult.value.map(
        (record) => record.created_at,
      );
    } else {
      dashboardCheckOutTimestamps = cylinderCheckOutService
        .getCheckOutRecords()
        .map((record) => record.created_at)
        .filter((value): value is string => Boolean(value));
    }

    if (workOrderResult.status === "fulfilled") {
      dashboardWorkOrders = workOrderResult.value;
    }

    dashboardDataLoaded =
      sampleResult.status === "fulfilled" ||
      checkOutResult.status === "fulfilled" ||
      workOrderResult.status === "fulfilled" ||
      pricingResult.status === "fulfilled" ||
      companyResult.status === "fulfilled";
  },

  // Returns date in YYYY-MM-DD format (required for HTML5 date inputs)
  // Browser will display in user's locale (MM/DD/YYYY for US users)
  getFirstDayOfMonth: (): string => {
    const now = new Date();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const year = now.getFullYear();
    return `${year}-${month}-01`;
  },

  // Returns date in YYYY-MM-DD format (required for HTML5 date inputs)
  // Browser will display in user's locale (MM/DD/YYYY for US users)
  getCurrentDate: (): string => {
    const now = new Date();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    const year = now.getFullYear();
    return `${year}-${month}-${day}`;
  },

  /**
   * Get Dashboard Statistics
   * DATA SOURCES:
   * - Checked Out: Cylinder Check Out (cylinderCheckOutService)
   * - Checked In: Sample Check In (sampleCheckInService)
   * - Rushed Samples: Sample Check In with rushed=true (sampleCheckInService)
   * - Samples Tested: Sample Check In with analysis_position set (mapped samples)
   */
  getStats: (filters?: DashboardFilters): DashboardStat[] => {
    const fromDate = parseFilterStartDate(filters?.dateFrom);
    const toDate = parseFilterEndDate(filters?.dateTo);
    const checkedInSamples = filterSamples(dashboardSamples, filters);

    const checkedOutCount = dashboardCheckOutTimestamps.filter((createdAt) =>
      isWithinDateRange(createdAt, fromDate, toDate),
    ).length;
    const checkedInCount = checkedInSamples.length;
    const rushedCount = checkedInSamples.filter((sample) => sample.rushed).length;
    const testedCount = checkedInSamples.filter(
      (sample) => sample.analysis_position != null,
    ).length;

    return [
      { id: 1, title: "Checked Out", value: String(checkedOutCount), color: "orange" },
      { id: 2, title: "Checked In", value: String(checkedInCount), color: "green" },
      { id: 3, title: "Rushed Samples", value: String(rushedCount), color: "red" },
      { id: 4, title: "Samples Tested", value: String(testedCount), color: "blue" },
    ];
  },

  /**
   * Get Analysis Type Distribution
   * DATA SOURCE: Sample Check In (sampleCheckInService)
   * Groups checked-in samples by analysis type with revenue calculations
   */
  getAnalysisTypeData: (filters?: DashboardFilters): AnalysisTypeData[] => {
    const checkedInSamples = filterSamples(dashboardSamples, filters);
    
    const analysisTypeMap = new Map<string, { count: number; revenue: number }>();
    
    checkedInSamples.forEach(sample => {
      const type = sample.analysis_type || "Unknown";
      const current = analysisTypeMap.get(type) || { count: 0, revenue: 0 };
      const rate = getSampleRevenueEstimate(type, sample.rushed);
      
      analysisTypeMap.set(type, {
        count: current.count + 1,
        revenue: current.revenue + rate
      });
    });

    // Convert map to array with colors
    const colors = ["#3b82f6", "#10b981", "#f59e0b", "#8b5cf6", "#ec4899", "#14b8a6"];
    let colorIndex = 0;
    
    return Array.from(analysisTypeMap.entries()).map(([name, data], index) => ({
      id: index + 1,
      name,
      value: data.count,
      revenue: data.revenue,
      color: colors[colorIndex++ % colors.length]
    }));
  },

  /**
   * Get Monthly Trend Data
   * DATA SOURCE: Sample Check In (sampleCheckInService)
   * Aggregates samples and revenue by month
   */
  getMonthlyTrendData: (filters?: DashboardFilters): MonthlyTrendData[] => {
    const checkedInSamples = filterSamples(dashboardSamples, filters);
    
    const monthlyMap = new Map<string, { samples: number; revenue: number }>();
    
    checkedInSamples.forEach(sample => {
      const date = new Date(sample.check_in_time);
      if (Number.isNaN(date.getTime())) return;
      const monthKey = date.toLocaleString('en-US', { month: 'short' });
      const current = monthlyMap.get(monthKey) || { samples: 0, revenue: 0 };
      const rate = getSampleRevenueEstimate(sample.analysis_type, sample.rushed);
      
      monthlyMap.set(monthKey, {
        samples: current.samples + 1,
        revenue: current.revenue + rate
      });
    });

    const months = getLastSixMonthLabels();
    return months.map((month, index) => {
      const data = monthlyMap.get(month) || { samples: 0, revenue: 0 };
      return {
        id: index + 1,
        month,
        samples: data.samples,
        revenue: data.revenue
      };
    });
  },

  /**
   * Get Pending Work Orders
   * DATA SOURCE: Work Orders (workOrdersService)
   * Shows work orders with status "Pending" or "In Progress" awaiting processing
   */
  getPendingWorkOrders: (filters?: DashboardFilters): PendingWorkOrder[] => {
    const fromDate = parseFilterStartDate(filters?.dateFrom);
    const toDate = parseFilterEndDate(filters?.dateTo);
    const analysisTypesByWorkOrder = buildAnalysisTypesByWorkOrder(
      dashboardSamples,
    );

    let pendingOrders = dashboardWorkOrders.filter(
      (order) => order.status === "Pending" || order.status === "In Progress",
    );

    if (fromDate || toDate) {
      pendingOrders = pendingOrders.filter((order) =>
        isWithinDateRange(order.date, fromDate, toDate),
      );
    }

    return pendingOrders
      .map((order) => {
        const analysisTypes = analysisTypesByWorkOrder.get(order.id);
        let analysisType = "N/A";
        if (analysisTypes && analysisTypes.size === 1) {
          analysisType = [...analysisTypes][0];
        } else if (analysisTypes && analysisTypes.size > 1) {
          analysisType = "Mixed";
        }

        if (
          filters?.analysisType &&
          filters.analysisType !== "all" &&
          analysisType !== filters.analysisType &&
          analysisType !== "Mixed"
        ) {
          return null;
        }

        if (
          filters?.analysisType &&
          filters.analysisType !== "all" &&
          analysisType === "Mixed" &&
          !analysisTypes?.has(filters.analysisType)
        ) {
          return null;
        }

        const cylinders =
          typeof order.cylinders === "number"
            ? order.cylinders
            : typeof order.cylinders === "string" &&
                order.cylinders.trim() !== "" &&
                !Number.isNaN(Number(order.cylinders))
              ? Number(order.cylinders)
              : dashboardSamples.filter(
                  (sample) => sample.work_order_number === order.id,
                ).length;

        if (cylinders <= 0) return null;

        const hoursInQueue =
          order.pending_since != null
            ? order.pending_since * 24
            : (() => {
                const dateReceived = new Date(order.date);
                if (Number.isNaN(dateReceived.getTime())) return 0;
                return Math.floor(
                  (Date.now() - dateReceived.getTime()) / (1000 * 60 * 60),
                );
              })();

        return {
          id: order.api_id ?? 0,
          work_order_number: order.id,
          customer: order.customer,
          cylinders,
          analysis_type: analysisType,
          date_received: order.date,
          hours_in_queue: hoursInQueue,
          created_by: order.created_by,
        };
      })
      .filter((order): order is PendingWorkOrder => order !== null)
      .sort((a, b) => b.hours_in_queue - a.hours_in_queue);
  },

  /**
   * Get Top Customers Data
   * DATA SOURCE: Sample Check In (sampleCheckInService)
   * Ranks customers by sample count and revenue
   */
  getTopCustomersData: (filters?: DashboardFilters): CustomerData[] => {
    const checkedInSamples = filterSamples(dashboardSamples, filters);
    
    const companyMap = new Map<number, { name: string; samples: number; revenue: number; created_by: number }>();
    
    checkedInSamples.forEach(sample => {
      const current = companyMap.get(sample.company_id) || { 
        name: sample.company_name || `Company ${sample.company_id}`, 
        samples: 0, 
        revenue: 0,
        created_by: sample.created_by
      };
      
      const rate = getSampleRevenueEstimate(sample.analysis_type, sample.rushed);
      
      companyMap.set(sample.company_id, {
        name: current.name || sample.company_name || `Company ${sample.company_id}`,
        samples: current.samples + 1,
        revenue: current.revenue + rate,
        created_by: current.created_by
      });
    });

    // Convert to array and sort by samples
    const topCustomers = Array.from(companyMap.entries())
      .map(([id, data]) => ({
        id,
        customer: data.name,
        samples: data.samples,
        revenue: data.revenue,
        created_by: data.created_by
      }))
      .sort((a, b) => b.samples - a.samples)
      .slice(0, 5);

    return topCustomers;
  },

  /**
   * Get Daily Check-In/Out Activity
   * DATA SOURCE: Cylinder Check Out (cylinderCheckOutService) + Sample Check In (sampleCheckInService)
   * Tracks last 7 days of check-in and check-out activity
   */
  getDailyActivityData: (filters?: DashboardFilters): DailyActivityData[] => {
    const checkedInSamples = filterSamples(dashboardSamples, filters);
    const fromDate = parseFilterStartDate(filters?.dateFrom);
    const toDate = parseFilterEndDate(filters?.dateTo);
    const analysisTypeFiltered =
      Boolean(filters?.analysisType) && filters?.analysisType !== "all";
    
    const today = new Date();
    const dailyData: DailyActivityData[] = [];
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);
      const dayEnd = new Date(date);
      dayEnd.setHours(23, 59, 59, 999);

      if (fromDate && dayEnd < fromDate) continue;
      if (toDate && date > toDate) continue;

      const dayNumber = date.getDate();
      
      const checkInCount = checkedInSamples.filter(sample => {
        const sampleDate = new Date(sample.check_in_time);
        return sampleDate.toDateString() === date.toDateString();
      }).length;
      
      const checkOutCount = analysisTypeFiltered
        ? 0
        : dashboardCheckOutTimestamps.filter(createdAt => {
            const recordDate = new Date(createdAt);
            return recordDate.toDateString() === date.toDateString();
          }).length;
      
      dailyData.push({
        id: dailyData.length + 1,
        day: String(dayNumber),
        check_in: checkInCount,
        check_out: checkOutCount,
        created_by: 1
      });
    }
    
    return dailyData;
  },

  getPriorityColor: (hours: number): { bg: string; border: string; text: string; badge: string; label: string } => {
    if (hours < 24) return { bg: "bg-green-50", border: "border-green-200", text: "text-green-700", badge: "bg-green-100 text-green-800", label: "Normal" };
    if (hours < 48) return { bg: "bg-yellow-50", border: "border-yellow-200", text: "text-yellow-700", badge: "bg-yellow-100 text-yellow-800", label: "Attention" };
    return { bg: "bg-red-50", border: "border-red-200", text: "text-red-700", badge: "bg-red-100 text-red-800", label: "Urgent" };
  },

  formatQueueTime: (hours: number): string => {
    if (hours < 24) return `${hours}h`;
    const days = Math.floor(hours / 24);
    const remainingHours = hours % 24;
    return remainingHours > 0 ? `${days}d ${remainingHours}h` : `${days}d`;
  },

  getAnalysisTypeFilterOptions: (): { value: string; label: string }[] => {
    return analysisPricingService.getActiveAnalysisOptions();
  },
};
