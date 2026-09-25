import { useCallback, useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Search } from "lucide-react";
import { toast } from "sonner";
import {
  AnalysisPositionRecord,
  mapAnalysisPositionService,
} from "../services/mapAnalysisPositionService";
import {
  companyMasterService,
  Company,
} from "../services/companyMasterService";
import { linkReportService } from "../services/linkReportService";
import { LinkReportTable } from "../components/linkReport/LinkReportTable";
import { LinkReportImportDialog } from "../components/linkReport/LinkReportImportDialog";
import { TagImageDialog } from "../components/sampleCheckIn/TagImageDialog";
import { sampleCheckInService } from "../services/sampleCheckInService";

export function LinkReport() {
  const [searchTerm, setSearchTerm] = useState("");
  const [records, setRecords] = useState<AnalysisPositionRecord[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [selectedRecord, setSelectedRecord] =
    useState<AnalysisPositionRecord | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedTagImage, setSelectedTagImage] = useState<string | null>(null);
  const [selectedTagImageFilename, setSelectedTagImageFilename] = useState<
    string | null
  >(null);

  const loadRecords = useCallback(async () => {
    try {
      setIsLoading(true);
      const [positions, , sampleCheckIns] = await Promise.all([
        mapAnalysisPositionService.fetchAnalysisPositions(),
        companyMasterService.fetchCompanies(),
        sampleCheckInService.fetchSampleCheckIns(true),
      ]);
      const imagesById = new Map(
        sampleCheckIns.map((sample) => [sample.id, sample]),
      );
      setRecords(
        positions.map((record) => {
          const sample = imagesById.get(record.sample_checkin_id);
          return {
            ...record,
            pressure_base_factor: sample?.pressure_base_factor,
            pressure_measured: sample?.pressure_measured,
            amb_temp: sample?.amb_temp,
            sample_time: sample?.sample_time,
            sample_date: sample?.sample_date ?? sample?.sampled_date,
            sampled_by: sample?.sampled_by,
            analyzed_by: sample?.analyzed_by,
            base_condition: sample?.base_condition,
            physical_constant: sample?.physical_constant,
            instrument: sample?.instrument,
            last_instrument_verification: sample?.last_instrument_verification,
            heating_method: sample?.heating_method,
            hexanes_split: sample?.hexanes_split,
            sample_method: sample?.sample_method,
            effective_start_date: sample?.effective_start_date,
            effective_end_date: sample?.effective_end_date,
            tag_image: sample?.tag_image ?? "",
            scanned_tag_image:
              sample?.scanned_tag_image ?? sample?.tag_image ?? null,
          };
        }),
      );
      setCompanies(companyMasterService.getActiveCompanies());
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to load analyses",
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadRecords();
  }, [loadRecords]);

  const filteredRecords = mapAnalysisPositionService.searchRecords(
    records,
    searchTerm,
  );

  const unmappedCount = records.filter((record) =>
    mapAnalysisPositionService.needsMapping(record),
  ).length;

  const resolveCompanyId = (record: AnalysisPositionRecord): number | null => {
    if (record.company_id != null) return record.company_id;
    const match = companies.find(
      (company) =>
        company.company_name.toLowerCase() ===
        record.company_name.toLowerCase(),
    );
    return match?.id ?? null;
  };

  const applyRecordUpdate = (
    sampleCheckinId: number,
    updates: Partial<AnalysisPositionRecord>,
  ) => {
    setRecords((prev) =>
      prev.map((record) =>
        record.sample_checkin_id === sampleCheckinId
          ? { ...record, ...updates }
          : record,
      ),
    );
  };

  const handleImportClick = (record: AnalysisPositionRecord) => {
    setSelectedRecord(record);
    setIsDialogOpen(true);
  };

  const handleImport = async (
    sampleCheckinId: number,
    file: File,
    pressureMeasured: string,
  ) => {
    const record = records.find(
      (item) => item.sample_checkin_id === sampleCheckinId,
    );
    if (!record) return;

    const companyId =
      record.company_id ??
      resolveCompanyId(record) ??
      (await sampleCheckInService.fetchSampleCheckInById(sampleCheckinId))
        ?.company_id ??
      null;
    if (companyId == null) {
      toast.error("Could not resolve company for this analysis");
      return;
    }

    setIsSaving(true);
    try {
      const result = await linkReportService.linkReport(
        sampleCheckinId,
        file,
        companyId,
        pressureMeasured,
      );

      applyRecordUpdate(sampleCheckinId, result.record);
      toast.success(
        `Report linked to ${record.analysis_number} (${result.importId})`,
      );
      setIsDialogOpen(false);
      setSelectedRecord(null);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to link report",
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleUnmap = async (sampleCheckinId: number) => {
    setIsSaving(true);
    try {
      await mapAnalysisPositionService.unmapAnalysisPosition(sampleCheckinId);

      applyRecordUpdate(sampleCheckinId, {
        import_id: null,
        import_machine_report_id: null,
        analysis_position: null,
      });

      toast.success("Report unlinked successfully");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to unlink report",
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleDownload = async (record: AnalysisPositionRecord) => {
    try {
      await linkReportService.downloadAnalysisReport(
        record.sample_checkin_id,
        `Analysis-${record.analysis_number}.xlsx`,
      );
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to download analysis report",
      );
    }
  };

  const handleUnmapFromTable = (record: AnalysisPositionRecord) => {
    if (!confirm(`Remove the linked report for ${record.analysis_number}?`)) {
      return;
    }
    handleUnmap(record.sample_checkin_id);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="font-bold">Link Report</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {isLoading ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              Loading analyses...
            </p>
          ) : (
            <LinkReportTable
              records={filteredRecords}
              onImport={handleImportClick}
              onDownload={handleDownload}
              onUnmap={handleUnmapFromTable}
              onViewImage={(imageUrl, filename) => {
                setSelectedTagImage(imageUrl);
                setSelectedTagImageFilename(filename ?? null);
              }}
            />
          )}

          <div className="mt-4 flex items-center justify-between text-sm text-muted-foreground">
            <p>
              Showing {filteredRecords.length} of {records.length} records
              {unmappedCount > 0 ? ` · ${unmappedCount} unmapped` : ""}
            </p>
          </div>
        </CardContent>
      </Card>

      <LinkReportImportDialog
        open={isDialogOpen}
        record={selectedRecord}
        isSaving={isSaving}
        onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) setSelectedRecord(null);
        }}
        onImport={handleImport}
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
