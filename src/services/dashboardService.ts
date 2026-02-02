import { cylinderCheckOutService } from './cylinderCheckOutService';
import { sampleCheckInService } from './sampleCheckInService';
import { importMachineReportService } from './importMachineReportService';
import { workOrdersService } from './workOrdersService';
import { companyMasterService } from './companyMasterService';

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
   * - Samples Tested: Import Machine Report with status=Validated (importMachineReportService)
   */
  getStats: (filters?: DashboardFilters): DashboardStat[] => {
    // Get real data from services
    let checkOutRecords = cylinderCheckOutService.getCheckOutRecords();
    let checkedInSamples = sampleCheckInService.getCheckedInSamples();
    let importRecords = importMachineReportService.getImportRecords();

    // Apply date filters
    if (filters?.dateFrom || filters?.dateTo) {
      const fromDate = filters.dateFrom ? new Date(filters.dateFrom) : null;
      const toDate = filters.dateTo ? new Date(filters.dateTo) : null;
      
      if (fromDate || toDate) {
        checkOutRecords = checkOutRecords.filter(record => {
          if (!record.created_at) return false;
          const recordDate = new Date(record.created_at);
          if (fromDate && recordDate < fromDate) return false;
          if (toDate && recordDate > toDate) return false;
          return true;
        });

        checkedInSamples = checkedInSamples.filter(sample => {
          const sampleDate = new Date(sample.check_in_time);
          if (fromDate && sampleDate < fromDate) return false;
          if (toDate && sampleDate > toDate) return false;
          return true;
        });

        importRecords = importRecords.filter(record => {
          const recordDate = new Date(record.imported_at);
          if (fromDate && recordDate < fromDate) return false;
          if (toDate && recordDate > toDate) return false;
          return true;
        });
      }
    }

    // Apply analysis type filter
    if (filters?.analysisType && filters.analysisType !== "all") {
      checkedInSamples = checkedInSamples.filter(sample => sample.analysis_type === filters.analysisType);
    }

    // Calculate statistics
    const checkedOutCount = checkOutRecords.length;
    const checkedInCount = checkedInSamples.length;
    const rushedCount = checkedInSamples.filter(sample => sample.rushed).length;
    const testedCount = importRecords.filter(record => record.status === "Validated").length;

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
    let checkedInSamples = sampleCheckInService.getCheckedInSamples();
    
    // Apply date filters
    if (filters?.dateFrom || filters?.dateTo) {
      const fromDate = filters.dateFrom ? new Date(filters.dateFrom) : null;
      const toDate = filters.dateTo ? new Date(filters.dateTo) : null;
      
      if (fromDate || toDate) {
        checkedInSamples = checkedInSamples.filter(sample => {
          const sampleDate = new Date(sample.check_in_time);
          if (fromDate && sampleDate < fromDate) return false;
          if (toDate && sampleDate > toDate) return false;
          return true;
        });
      }
    }

    // Apply analysis type filter
    if (filters?.analysisType && filters.analysisType !== "all") {
      checkedInSamples = checkedInSamples.filter(sample => sample.analysis_type === filters.analysisType);
    }
    
    // Group by analysis type
    const analysisTypeMap = new Map<string, { count: number; revenue: number }>();
    
    checkedInSamples.forEach(sample => {
      const type = sample.analysis_type || "Unknown";
      const current = analysisTypeMap.get(type) || { count: 0, revenue: 0 };
      
      // Estimate revenue based on analysis type (these are standard rates)
      let rate = 150; // default rate
      if (type === "GPA 2261") rate = 150;
      else if (type === "GPA 2172") rate = 200;
      else if (type === "BTU Analysis") rate = 150;
      else if (type === "Extended Analysis") rate = 250;
      
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
    let checkedInSamples = sampleCheckInService.getCheckedInSamples();
    
    // Apply date filters
    if (filters?.dateFrom || filters?.dateTo) {
      const fromDate = filters.dateFrom ? new Date(filters.dateFrom) : null;
      const toDate = filters.dateTo ? new Date(filters.dateTo) : null;
      
      if (fromDate || toDate) {
        checkedInSamples = checkedInSamples.filter(sample => {
          const sampleDate = new Date(sample.check_in_time);
          if (fromDate && sampleDate < fromDate) return false;
          if (toDate && sampleDate > toDate) return false;
          return true;
        });
      }
    }

    // Apply analysis type filter
    if (filters?.analysisType && filters.analysisType !== "all") {
      checkedInSamples = checkedInSamples.filter(sample => sample.analysis_type === filters.analysisType);
    }
    
    // Group by month
    const monthlyMap = new Map<string, { samples: number; revenue: number }>();
    
    checkedInSamples.forEach(sample => {
      const date = new Date(sample.check_in_time);
      const monthKey = date.toLocaleString('en-US', { month: 'short' });
      const current = monthlyMap.get(monthKey) || { samples: 0, revenue: 0 };
      
      // Estimate revenue
      let rate = 150;
      if (sample.analysis_type === "GPA 2261") rate = 150;
      else if (sample.analysis_type === "GPA 2172") rate = 200;
      else if (sample.analysis_type === "BTU Analysis") rate = 150;
      else if (sample.analysis_type === "Extended Analysis") rate = 250;
      
      monthlyMap.set(monthKey, {
        samples: current.samples + 1,
        revenue: current.revenue + rate
      });
    });

    // Convert to array with last 6 months
    const months = ["Jun", "Jul", "Aug", "Sep", "Oct", "Nov"];
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
    // Get all work order headers with Pending or In Progress status
    let allHeaders = workOrdersService.getWorkOrderHeaders();
    
    // Apply date filters
    if (filters?.dateFrom || filters?.dateTo) {
      const fromDate = filters.dateFrom ? new Date(filters.dateFrom) : null;
      const toDate = filters.dateTo ? new Date(filters.dateTo) : null;
      
      if (fromDate || toDate) {
        allHeaders = allHeaders.filter(header => {
          const headerDate = new Date(header.date);
          if (fromDate && headerDate < fromDate) return false;
          if (toDate && headerDate > toDate) return false;
          return true;
        });
      }
    }
    
    const pendingHeaders = allHeaders.filter(
      header => header.status === "Pending" || header.status === "In Progress"
    );

    // Map to PendingWorkOrder format
    return pendingHeaders.map(header => {
      // Get work order lines for cylinder count and analysis type
      let lines = workOrdersService.getWorkOrderLinesByHeaderId(header.id);
      
      // Apply analysis type filter to lines
      if (filters?.analysisType && filters.analysisType !== "all") {
        lines = lines.filter(line => line.analysis_type === filters.analysisType);
      }
      const cylinderCount = lines.length;
      
      // Get analysis type from first line (or "Mixed" if multiple types)
      const analysisTypes = [...new Set(lines.map(line => line.analysis_type))];
      const analysisType = analysisTypes.length === 1 ? analysisTypes[0] : "Mixed";
      
      // Get customer name from company master
      const company = companyMasterService.getCompanyById(header.company_id);
      const customerName = company?.company_name || `Company ${header.company_id}`;
      
      // Calculate hours in queue
      const dateReceived = new Date(header.date);
      const now = new Date();
      const hoursInQueue = Math.floor((now.getTime() - dateReceived.getTime()) / (1000 * 60 * 60));
      
      return {
        id: header.id,
        work_order_number: header.work_order_number,
        customer: customerName,
        cylinders: cylinderCount,
        analysis_type: analysisType,
        date_received: header.date,
        hours_in_queue: hoursInQueue,
        created_by: header.created_by,
      };
    })
    .filter(order => order.cylinders > 0) // Remove work orders with no matching lines after filtering
    .sort((a, b) => b.hours_in_queue - a.hours_in_queue); // Sort by urgency (longest wait first)
  },

  /**
   * Get Top Customers Data
   * DATA SOURCE: Sample Check In (sampleCheckInService)
   * Ranks customers by sample count and revenue
   */
  getTopCustomersData: (filters?: DashboardFilters): CustomerData[] => {
    let checkedInSamples = sampleCheckInService.getCheckedInSamples();
    
    // Apply date filters
    if (filters?.dateFrom || filters?.dateTo) {
      const fromDate = filters.dateFrom ? new Date(filters.dateFrom) : null;
      const toDate = filters.dateTo ? new Date(filters.dateTo) : null;
      
      if (fromDate || toDate) {
        checkedInSamples = checkedInSamples.filter(sample => {
          const sampleDate = new Date(sample.check_in_time);
          if (fromDate && sampleDate < fromDate) return false;
          if (toDate && sampleDate > toDate) return false;
          return true;
        });
      }
    }

    // Apply analysis type filter
    if (filters?.analysisType && filters.analysisType !== "all") {
      checkedInSamples = checkedInSamples.filter(sample => sample.analysis_type === filters.analysisType);
    }
    
    // Group by company
    const companyMap = new Map<number, { name: string; samples: number; revenue: number; created_by: number }>();
    
    checkedInSamples.forEach(sample => {
      const current = companyMap.get(sample.company_id) || { 
        name: `Company ${sample.company_id}`, 
        samples: 0, 
        revenue: 0,
        created_by: sample.created_by
      };
      
      // Get company name from sample check-in service
      const customers = sampleCheckInService.getCustomers();
      const customer = customers.find(c => c.id === sample.company_id);
      if (customer) {
        current.name = customer.name;
      }
      
      // Estimate revenue
      let rate = 150;
      if (sample.analysis_type === "GPA 2261") rate = 150;
      else if (sample.analysis_type === "GPA 2172") rate = 200;
      else if (sample.analysis_type === "BTU Analysis") rate = 150;
      else if (sample.analysis_type === "Extended Analysis") rate = 250;
      
      companyMap.set(sample.company_id, {
        name: current.name,
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
    let checkOutRecords = cylinderCheckOutService.getCheckOutRecords();
    let checkedInSamples = sampleCheckInService.getCheckedInSamples();
    
    // Apply analysis type filter
    if (filters?.analysisType && filters.analysisType !== "all") {
      checkedInSamples = checkedInSamples.filter(sample => sample.analysis_type === filters.analysisType);
    }
    
    // Get data for last 7 days
    const today = new Date();
    const dailyData: DailyActivityData[] = [];
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dayNumber = date.getDate();
      
      // Count check-ins and check-outs for this day
      const checkInCount = checkedInSamples.filter(sample => {
        const sampleDate = new Date(sample.check_in_time);
        return sampleDate.toDateString() === date.toDateString();
      }).length;
      
      const checkOutCount = checkOutRecords.filter(record => {
        if (!record.created_at) return false;
        const recordDate = new Date(record.created_at);
        return recordDate.toDateString() === date.toDateString();
      }).length;
      
      dailyData.push({
        id: 7 - i,
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
};
