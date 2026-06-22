import { useCallback, useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { FileDown } from "lucide-react";
import { toast } from "sonner@2.0.3";
import {
  analysisReportsService,
  AnalysisReport,
  GasAnalysisReport,
} from "../services/analysisReportsService";
import { SearchBar } from "../components/shared/SearchBar";
import { AnalysisReportsTable } from "../components/analysisReports/AnalysisReportsTable";
import { AnalysisReportsFilters } from "../components/analysisReports/AnalysisReportsFilters";
import { GasAnalysisReportDialog } from "../components/analysisReports/GasAnalysisReportDialog";
import { companyMasterService } from "../services/companyMasterService";

export function AnalysisReports() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [customerFilter, setCustomerFilter] = useState("all");
  const [analysisData, setAnalysisData] = useState<AnalysisReport[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedReport, setSelectedReport] = useState<GasAnalysisReport | null>(
    null,
  );
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isReportLoading, setIsReportLoading] = useState(false);

  const loadReports = useCallback(async () => {
    try {
      setIsLoading(true);
      await companyMasterService.fetchCompanies();
      const data = await analysisReportsService.fetchReports();
      setAnalysisData(data);
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to load analysis reports",
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadReports();
  }, [loadReports]);

  const statuses = analysisReportsService.getUniqueStatuses(analysisData);
  const customers = analysisReportsService.getUniqueCustomers(analysisData);

  let filteredData = analysisReportsService.searchReports(
    analysisData,
    searchTerm,
  );
  filteredData = analysisReportsService.filterByCustomer(
    filteredData,
    customerFilter,
  );
  filteredData = analysisReportsService.filterByStatus(
    filteredData,
    statusFilter,
  );

  const handleViewReport = async (report: AnalysisReport) => {
    setIsDialogOpen(true);
    setSelectedReport(null);
    setIsReportLoading(true);

    try {
      const data = await analysisReportsService.fetchGasAnalysisReport(
        report.sample_checkin_id,
      );
      setSelectedReport(data);
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to load gas analysis report",
      );
      setIsDialogOpen(false);
    } finally {
      setIsReportLoading(false);
    }
  };

  const handleExportAll = () => {
    const csvContent = analysisReportsService.exportToCSV(filteredData);
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `analysis_reports_${new Date().toISOString().split("T")[0]}.csv`,
    );
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Reports exported successfully");
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="font-bold">Analysis Reports</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4 mb-6">
            <div className="flex justify-between items-center">
              <SearchBar
                value={searchTerm}
                onChange={setSearchTerm}
                placeholder="Search reports..."
              />
              <Button onClick={handleExportAll} disabled={isLoading}>
                <FileDown className="w-4 h-4 mr-2" />
                Export All
              </Button>
            </div>
            <AnalysisReportsFilters
              statusFilter={statusFilter}
              customerFilter={customerFilter}
              statuses={statuses}
              customers={customers}
              onStatusChange={setStatusFilter}
              onCustomerChange={setCustomerFilter}
            />
          </div>

          {isLoading ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              Loading analysis reports...
            </p>
          ) : (
            <AnalysisReportsTable
              reports={filteredData}
              onViewReport={handleViewReport}
            />
          )}

          <div className="mt-4 text-sm text-muted-foreground">
            Showing {filteredData.length} of {analysisData.length} reports
          </div>
        </CardContent>
      </Card>

      <GasAnalysisReportDialog
        open={isDialogOpen}
        report={selectedReport}
        isLoading={isReportLoading}
        onOpenChange={setIsDialogOpen}
      />
    </div>
  );
}
