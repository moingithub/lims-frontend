import { workOrdersService, WorkOrderLine } from './workOrdersService';
import { companyMasterService } from './companyMasterService';

export interface AnalysisReport {
  id: number;
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

export const analysisReportsService = {
  getReports: (): AnalysisReport[] => {
    // Get all work order headers and lines
    const headers = workOrdersService.getWorkOrderHeaders();
    const allReports: AnalysisReport[] = [];
    
    // For each work order header, get its lines and create analysis reports
    headers.forEach(header => {
      const lines = workOrdersService.getWorkOrderLinesByHeaderId(header.id);
      
      // Get company name from company_id
      const company = companyMasterService.getCompanyById(header.company_id);
      const companyName = company?.company_name || "Unknown Company";
      
      // Convert each line to an analysis report
      lines.forEach(line => {
        allReports.push({
          id: line.id,
          work_order_number: header.work_order_number,
          customer: companyName,
          date: line.date,
          analysis_type: line.analysis_type,
          analysis_number: line.analysis_number,
          cylinder_number: line.cylinder_number,
          well_name: line.well_name,
          meter_number: line.meter_number,
          status: header.status,
          created_by: line.created_by,
        });
      });
    });
    
    return allReports;
  },

  searchReports: (reports: AnalysisReport[], searchTerm: string): AnalysisReport[] => {
    if (!searchTerm) return reports;
    
    const lowerSearch = searchTerm.toLowerCase();
    return reports.filter(report =>
      report.work_order_number.toLowerCase().includes(lowerSearch) ||
      report.customer.toLowerCase().includes(lowerSearch) ||
      report.analysis_type.toLowerCase().includes(lowerSearch) ||
      report.analysis_number.toLowerCase().includes(lowerSearch) ||
      report.cylinder_number.toLowerCase().includes(lowerSearch) ||
      report.well_name.toLowerCase().includes(lowerSearch) ||
      report.meter_number.toLowerCase().includes(lowerSearch) ||
      report.status.toLowerCase().includes(lowerSearch)
    );
  },

  filterByStatus: (reports: AnalysisReport[], status: string): AnalysisReport[] => {
    if (status === "all") return reports;
    return reports.filter(report => report.status === status);
  },

  filterByCustomer: (reports: AnalysisReport[], customer: string): AnalysisReport[] => {
    if (customer === "all") return reports;
    return reports.filter(report => report.customer === customer);
  },

  getUniqueStatuses: (reports: AnalysisReport[]): string[] => {
    return Array.from(new Set(reports.map(report => report.status))).sort();
  },

  getUniqueCustomers: (reports: AnalysisReport[]): string[] => {
    return Array.from(new Set(reports.map(report => report.customer))).sort();
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

  downloadReport: (analysisNumber: string, customer: string): void => {
    // Mock implementation - in real app would generate PDF
    console.log(`Downloading report ${analysisNumber} for ${customer}`);
  },

  exportToCSV: (reports: AnalysisReport[]): string => {
    const headers = ["Work Order #", "Customer", "Date", "Analysis Type", "Analysis #", "Cylinder #", "Well Name", "Meter #", "Status"];
    const rows = reports.map(report => [
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
      ...rows.map(row => row.join(",")),
    ].join("\n");
    
    return csvContent;
  },
};
