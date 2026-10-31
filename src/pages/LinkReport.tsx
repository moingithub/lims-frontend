import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Button } from "../components/ui/button";
import { FileDown } from "lucide-react";
import { toast } from "sonner";
import {
  REJECTED_LOW_PRESSURE_STATUS,
  ReportFileRecord,
  ReportTemplateDownloadFields,
  reportFilesService,
} from "../services/reportFilesService";
import { SearchBar } from "../components/shared/SearchBar";
import { LinkReportTable } from "../components/linkReport/LinkReportTable";
import { ReportFilesFilters } from "../components/linkReport/ReportFilesFilters";
import { ReportTemplateDialog } from "../components/linkReport/ReportTemplateDialog";
import { TagImageDialog } from "../components/sampleCheckIn/TagImageDialog";

export function LinkReport() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [companyFilter, setCompanyFilter] = useState("all");
  const [meterNumberFilter, setMeterNumberFilter] = useState("all");
  const [wellNameFilter, setWellNameFilter] = useState("all");
  const [analysisNumberFilter, setAnalysisNumberFilter] = useState("all");
  const [records, setRecords] = useState<ReportFileRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDownloadingTemplate, setIsDownloadingTemplate] = useState(false);
  const [isTemplateDialogOpen, setIsTemplateDialogOpen] = useState(false);
  const [selectedTemplateId, setSelectedTemplateId] = useState<number | null>(
    null,
  );
  const [selectedTagImage, setSelectedTagImage] = useState<string | null>(null);
  const [selectedTagImageFilename, setSelectedTagImageFilename] = useState<
    string | null
  >(null);

  const loadRecords = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await reportFilesService.fetchReportFiles();
      setRecords(data);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to load report files",
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadRecords();
  }, [loadRecords]);

  const statuses = reportFilesService.getUniqueStatuses(records);

  const getCascadeFilteredRecords = (
    company: string,
    wellName: string,
    meterNumber: string,
  ): ReportFileRecord[] => {
    let source =
      company === "all"
        ? records
        : reportFilesService.filterByCompany(records, company);

    if (wellName !== "all") {
      source = reportFilesService.filterByWellName(source, wellName);
    }
    if (meterNumber !== "all") {
      source = reportFilesService.filterByMeterNumber(source, meterNumber);
    }

    return source;
  };

  const resetAnalysisNumberIfInvalid = (
    company: string,
    wellName: string,
    meterNumber: string,
  ) => {
    const availableAnalysisNumbers =
      reportFilesService.getUniqueAnalysisNumbers(
        getCascadeFilteredRecords(company, wellName, meterNumber),
      );

    if (
      analysisNumberFilter !== "all" &&
      !availableAnalysisNumbers.includes(analysisNumberFilter)
    ) {
      setAnalysisNumberFilter("all");
    }
  };

  const companyFilteredData = getCascadeFilteredRecords(
    companyFilter,
    "all",
    "all",
  );
  const companies = reportFilesService.getUniqueCompanies(records);
  const meterNumbers = reportFilesService.getUniqueMeterNumbers(
    getCascadeFilteredRecords(companyFilter, wellNameFilter, "all"),
  );
  const wellNames =
    reportFilesService.getUniqueWellNames(companyFilteredData);
  const analysisNumbers = reportFilesService.getUniqueAnalysisNumbers(
    getCascadeFilteredRecords(
      companyFilter,
      wellNameFilter,
      meterNumberFilter,
    ),
  );

  const handleCompanyChange = (value: string) => {
    setCompanyFilter(value);

    const filteredByCompany = getCascadeFilteredRecords(value, "all", "all");
    const availableWells =
      reportFilesService.getUniqueWellNames(filteredByCompany);
    const nextWell =
      wellNameFilter !== "all" && !availableWells.includes(wellNameFilter)
        ? "all"
        : wellNameFilter;

    if (nextWell !== wellNameFilter) {
      setWellNameFilter("all");
    }

    const availableMeters = reportFilesService.getUniqueMeterNumbers(
      getCascadeFilteredRecords(value, nextWell, "all"),
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

    const availableMeters = reportFilesService.getUniqueMeterNumbers(
      getCascadeFilteredRecords(companyFilter, value, "all"),
    );
    const nextMeter =
      meterNumberFilter !== "all" &&
      !availableMeters.includes(meterNumberFilter)
        ? "all"
        : meterNumberFilter;

    if (nextMeter !== meterNumberFilter) {
      setMeterNumberFilter("all");
    }

    resetAnalysisNumberIfInvalid(companyFilter, value, nextMeter);
  };

  const handleMeterNumberChange = (value: string) => {
    setMeterNumberFilter(value);
    resetAnalysisNumberIfInvalid(companyFilter, wellNameFilter, value);
  };

  let filteredRecords = reportFilesService.searchRecords(records, searchTerm);
  filteredRecords = reportFilesService.filterByCompany(
    filteredRecords,
    companyFilter,
  );
  filteredRecords = reportFilesService.filterByStatus(
    filteredRecords,
    statusFilter,
  );
  filteredRecords = reportFilesService.filterByMeterNumber(
    filteredRecords,
    meterNumberFilter,
  );
  filteredRecords = reportFilesService.filterByWellName(
    filteredRecords,
    wellNameFilter,
  );
  filteredRecords = reportFilesService.filterByAnalysisNumber(
    filteredRecords,
    analysisNumberFilter,
  );

  const selectedTemplateRecord = useMemo(() => {
    if (selectedTemplateId == null) return null;
    return (
      records.find(
        (record) => record.sample_checkin_id === selectedTemplateId,
      ) ?? null
    );
  }, [records, selectedTemplateId]);

  const handleDownloadTemplateClick = (record: ReportFileRecord) => {
    setSelectedTemplateId(record.sample_checkin_id);
    setIsTemplateDialogOpen(true);
  };

  const handleDownloadTemplate = async (
    sampleCheckinId: number,
    reportTemplateName: string,
    pressureMeasured: string,
    templateFields: ReportTemplateDownloadFields,
  ) => {
    setIsDownloadingTemplate(true);
    try {
      const currentRecord = records.find(
        (row) => row.sample_checkin_id === sampleCheckinId,
      );
      const updated =
        await reportFilesService.updatePressureAndDownloadTemplate(
          sampleCheckinId,
          reportTemplateName,
          pressureMeasured,
          currentRecord,
          templateFields,
        );
      setRecords((prev) =>
        prev.map((record) =>
          record.sample_checkin_id === sampleCheckinId
            ? { ...record, ...updated, pressure_measured: pressureMeasured.trim() }
            : record,
        ),
      );
      if (updated.status === REJECTED_LOW_PRESSURE_STATUS) {
        toast.warning(
          "Measured pressure is 75% or more below sample pressure. Status set to Rejected – Low Pressure.",
        );
      } else {
        toast.success("Report template downloaded");
      }
      setIsTemplateDialogOpen(false);
      setSelectedTemplateId(null);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Request failed";
      toast.error(message);
    } finally {
      setIsDownloadingTemplate(false);
    }
  };

  const handleExportAll = () => {
    const csvContent = reportFilesService.exportToCSV(filteredRecords);
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `report_files_${new Date().toISOString().split("T")[0]}.csv`,
    );
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success("Report files exported successfully");
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="font-bold">Report Files</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4 mb-6">
            <div className="flex justify-between items-center gap-4">
              <SearchBar
                value={searchTerm}
                onChange={setSearchTerm}
                placeholder="Search report files..."
              />
              <Button onClick={handleExportAll} disabled={isLoading}>
                <FileDown className="w-4 h-4 mr-2" />
                Export All
              </Button>
            </div>
            <ReportFilesFilters
              statusFilter={statusFilter}
              companyFilter={companyFilter}
              meterNumberFilter={meterNumberFilter}
              wellNameFilter={wellNameFilter}
              analysisNumberFilter={analysisNumberFilter}
              statuses={statuses}
              companies={companies}
              meterNumbers={meterNumbers}
              wellNames={wellNames}
              analysisNumbers={analysisNumbers}
              onStatusChange={setStatusFilter}
              onCompanyChange={handleCompanyChange}
              onMeterNumberChange={handleMeterNumberChange}
              onWellNameChange={handleWellNameChange}
              onAnalysisNumberChange={setAnalysisNumberFilter}
            />
          </div>

          {isLoading ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              Loading report files...
            </p>
          ) : (
            <LinkReportTable
              records={filteredRecords}
              onDownloadTemplate={handleDownloadTemplateClick}
              onViewImage={(imageUrl, filename) => {
                setSelectedTagImage(imageUrl);
                setSelectedTagImageFilename(filename ?? null);
              }}
            />
          )}

          <div className="mt-4 text-sm text-muted-foreground">
            Showing {filteredRecords.length} of {records.length} records
          </div>
        </CardContent>
      </Card>

      <ReportTemplateDialog
        open={isTemplateDialogOpen}
        record={selectedTemplateRecord}
        isSaving={isDownloadingTemplate}
        onOpenChange={(open) => {
          setIsTemplateDialogOpen(open);
          if (!open) setSelectedTemplateId(null);
        }}
        onDownload={handleDownloadTemplate}
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
