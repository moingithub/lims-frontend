import { useCallback, useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Search } from "lucide-react";
import { toast } from "sonner";
import {
  AnalysisPositionRecord,
  mapAnalysisPositionService,
} from "../services/mapAnalysisPositionService";
import {
  ImportRecord,
  importMachineReportService,
} from "../services/importMachineReportService";
import { AnalysisPositionsTable } from "../components/mapAnalysisPosition/AnalysisPositionsTable";
import { EditAnalysisPositionDialog } from "../components/mapAnalysisPosition/EditAnalysisPositionDialog";

export function MapAnalysisPosition() {
  const [searchTerm, setSearchTerm] = useState("");
  const [records, setRecords] = useState<AnalysisPositionRecord[]>([]);
  const [importRecords, setImportRecords] = useState<ImportRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [selectedRecord, setSelectedRecord] =
    useState<AnalysisPositionRecord | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const loadRecords = useCallback(async () => {
    try {
      setIsLoading(true);
      const [positions, imports] = await Promise.all([
        mapAnalysisPositionService.fetchAnalysisPositions(),
        importMachineReportService.fetchImportRecords(),
      ]);
      setRecords(positions);
      setImportRecords(imports);
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to load analysis positions",
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

  const handleEdit = (record: AnalysisPositionRecord) => {
    setSelectedRecord(record);
    setIsDialogOpen(true);
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

  const handleSave = async (
    sampleCheckinId: number,
    analysisPosition: number,
    importMachineReportId: number,
  ) => {
    setIsSaving(true);
    try {
      const updated = await mapAnalysisPositionService.updateAnalysisPosition(
        sampleCheckinId,
        {
          analysis_position: analysisPosition,
          import_machine_report_id: importMachineReportId,
        },
      );

      const selectedImport = importRecords.find(
        (item) => item.id === importMachineReportId,
      );

      applyRecordUpdate(sampleCheckinId, {
        ...updated,
        import_id: updated.import_id ?? selectedImport?.import_id ?? "",
        import_machine_report_id: importMachineReportId,
        analysis_position: analysisPosition,
      });

      toast.success("Analysis position updated successfully");
      setIsDialogOpen(false);
      setSelectedRecord(null);
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to update analysis position",
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

      toast.success("Analysis position unmapped successfully");
      setIsDialogOpen(false);
      setSelectedRecord(null);
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to unmap analysis position",
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleUnmapFromTable = (record: AnalysisPositionRecord) => {
    if (
      !confirm(
        `Remove the import and analysis position mapping for ${record.analysis_number}?`,
      )
    ) {
      return;
    }
    handleUnmap(record.sample_checkin_id);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="font-bold">Map Analysis Position</CardTitle>
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
              Loading analysis positions...
            </p>
          ) : (
            <AnalysisPositionsTable
              records={filteredRecords}
              onEdit={handleEdit}
              onUnmap={handleUnmapFromTable}
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

      <EditAnalysisPositionDialog
        open={isDialogOpen}
        record={selectedRecord}
        importRecords={importRecords}
        isSaving={isSaving}
        onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) setSelectedRecord(null);
        }}
        onSave={handleSave}
        onUnmap={handleUnmap}
      />
    </div>
  );
}
