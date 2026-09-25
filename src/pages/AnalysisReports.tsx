import { useCallback, useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
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
import { TagImageDialog } from "../components/sampleCheckIn/TagImageDialog";
import { linkReportService } from "../services/linkReportService";

export function AnalysisReports() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [customerFilter, setCustomerFilter] = useState("all");
  const [meterNumberFilter, setMeterNumberFilter] = useState("all");
  const [wellNameFilter, setWellNameFilter] = useState("all");
  const [analysisNumberFilter, setAnalysisNumberFilter] = useState("all");
  const [analysisData, setAnalysisData] = useState<AnalysisReport[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedReport, setSelectedReport] =
    useState<GasAnalysisReport | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isReportLoading, setIsReportLoading] = useState(false);
  const [selectedTagImage, setSelectedTagImage] = useState<string | null>(null);
  const [selectedTagImageFilename, setSelectedTagImageFilename] = useState<
    string | null
  >(null);

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
  const getCascadeFilteredReports = (
    customer: string,
    wellName: string,
    meterNumber: string,
  ): AnalysisReport[] => {
    let source =
      customer === "all"
        ? analysisData
        : analysisReportsService.filterByCustomer(analysisData, customer);

    if (wellName !== "all") {
      source = analysisReportsService.filterByWellName(source, wellName);
    }
    if (meterNumber !== "all") {
      source = analysisReportsService.filterByMeterNumber(source, meterNumber);
    }

    return source;
  };

  const resetAnalysisNumberIfInvalid = (
    customer: string,
    wellName: string,
    meterNumber: string,
  ) => {
    const availableAnalysisNumbers =
      analysisReportsService.getUniqueAnalysisNumbers(
        getCascadeFilteredReports(customer, wellName, meterNumber),
      );

    if (
      analysisNumberFilter !== "all" &&
      !availableAnalysisNumbers.includes(analysisNumberFilter)
    ) {
      setAnalysisNumberFilter("all");
    }
  };

  const customerFilteredData = getCascadeFilteredReports(
    customerFilter,
    "all",
    "all",
  );
  const meterNumbers = analysisReportsService.getUniqueMeterNumbers(
    getCascadeFilteredReports(customerFilter, wellNameFilter, "all"),
  );
  const wellNames =
    analysisReportsService.getUniqueWellNames(customerFilteredData);
  const analysisNumbers = analysisReportsService.getUniqueAnalysisNumbers(
    getCascadeFilteredReports(
      customerFilter,
      wellNameFilter,
      meterNumberFilter,
    ),
  );

  const handleCustomerChange = (value: string) => {
    setCustomerFilter(value);

    const filteredByCustomer = getCascadeFilteredReports(value, "all", "all");
    const availableWells =
      analysisReportsService.getUniqueWellNames(filteredByCustomer);
    const nextWell =
      wellNameFilter !== "all" && !availableWells.includes(wellNameFilter)
        ? "all"
        : wellNameFilter;

    if (nextWell !== wellNameFilter) {
      setWellNameFilter("all");
    }

    const availableMeters = analysisReportsService.getUniqueMeterNumbers(
      getCascadeFilteredReports(value, nextWell, "all"),
    );
    const nextMeter =
      meterNumberFilter !== "all" &&
      !availableMeters.includes(meterNumberFilter)
        ? "all"
        : meterNumberFilter;

    if (nextMeter !== meterNumberFilter) {
      setMeterNumberFilter("all");
    }

    resetAnalysisNumberIfInvalid(value, nextWell, nextMeter);
  };

  const handleWellNameChange = (value: string) => {
    setWellNameFilter(value);

    const availableMeters = analysisReportsService.getUniqueMeterNumbers(
      getCascadeFilteredReports(customerFilter, value, "all"),
    );
    const nextMeter =
      meterNumberFilter !== "all" &&
      !availableMeters.includes(meterNumberFilter)
        ? "all"
        : meterNumberFilter;

    if (nextMeter !== meterNumberFilter) {
      setMeterNumberFilter("all");
    }

    resetAnalysisNumberIfInvalid(customerFilter, value, nextMeter);
  };

  const handleMeterNumberChange = (value: string) => {
    setMeterNumberFilter(value);
    resetAnalysisNumberIfInvalid(customerFilter, wellNameFilter, value);
  };

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
  filteredData = analysisReportsService.filterByMeterNumber(
    filteredData,
    meterNumberFilter,
  );
  filteredData = analysisReportsService.filterByWellName(
    filteredData,
    wellNameFilter,
  );
  filteredData = analysisReportsService.filterByAnalysisNumber(
    filteredData,
    analysisNumberFilter,
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

  const handleDownload = async (report: AnalysisReport) => {
    try {
      await linkReportService.downloadAnalysisReport(
        report.sample_checkin_id,
        `Analysis-${report.analysis_number}.xlsx`,
      );
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to download report",
      );
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
              meterNumberFilter={meterNumberFilter}
              wellNameFilter={wellNameFilter}
              analysisNumberFilter={analysisNumberFilter}
              statuses={statuses}
              customers={customers}
              meterNumbers={meterNumbers}
              wellNames={wellNames}
              analysisNumbers={analysisNumbers}
              onStatusChange={setStatusFilter}
              onCustomerChange={handleCustomerChange}
              onMeterNumberChange={handleMeterNumberChange}
              onWellNameChange={handleWellNameChange}
              onAnalysisNumberChange={setAnalysisNumberFilter}
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
              onDownload={handleDownload}
              onViewImage={(imageUrl, filename) => {
                setSelectedTagImage(imageUrl);
                setSelectedTagImageFilename(filename ?? null);
              }}
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

      <TagImageDialog
        open={Boolean(selectedTagImage)}
        imageUrl={selectedTagImage}
        filename={selectedTagImageFilename}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedTagImage(null);
            setSelectedTagImageFilename(null);
          }
        }}
      />
    </div>
  );
}
