import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Loader2 } from "lucide-react";
import {
  AnalysisPositionRecord,
  mapAnalysisPositionService,
} from "../../services/mapAnalysisPositionService";
import { ImportRecord } from "../../services/importMachineReportService";

interface EditAnalysisPositionDialogProps {
  open: boolean;
  record: AnalysisPositionRecord | null;
  importRecords: ImportRecord[];
  isSaving: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (
    sampleCheckinId: number,
    analysisPosition: number,
    importMachineReportId: number,
  ) => void;
  onUnmap: (sampleCheckinId: number) => void;
}

export function EditAnalysisPositionDialog({
  open,
  record,
  importRecords,
  isSaving,
  onOpenChange,
  onSave,
  onUnmap,
}: EditAnalysisPositionDialogProps) {
  const [importMachineReportId, setImportMachineReportId] = useState("");
  const [analysisPosition, setAnalysisPosition] = useState("");

  useEffect(() => {
    if (!record) return;
    setImportMachineReportId(
      record.import_machine_report_id
        ? String(record.import_machine_report_id)
        : "",
    );
    setAnalysisPosition(
      record.analysis_position != null ? String(record.analysis_position) : "",
    );
  }, [record]);

  if (!record) return null;

  const isMapped = !mapAnalysisPositionService.needsMapping(record);

  const handleSave = () => {
    const position = parseInt(analysisPosition, 10);
    const importId = parseInt(importMachineReportId, 10);

    if (!importMachineReportId || Number.isNaN(importId)) {
      return;
    }
    if (!analysisPosition.trim() || Number.isNaN(position) || position < 1) {
      return;
    }

    onSave(record.sample_checkin_id, position, importId);
  };

  const handleUnmap = () => {
    if (
      !confirm(
        `Remove the import and analysis position mapping for ${record.analysis_number}?`,
      )
    ) {
      return;
    }
    onUnmap(record.sample_checkin_id);
  };

  const isValid =
    importMachineReportId &&
    analysisPosition.trim() &&
    !Number.isNaN(parseInt(analysisPosition, 10)) &&
    parseInt(analysisPosition, 10) >= 1;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {isMapped ? "Edit Analysis Position" : "Map Analysis Position"}
          </DialogTitle>
          <DialogDescription>
            {isMapped
              ? "Update or remove the import and analysis position for "
              : "Assign an import file and analysis position for "}
            <strong>{record.analysis_number}</strong> ({record.company_name}).
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label>Import ID</Label>
            <Select
              value={importMachineReportId}
              onValueChange={setImportMachineReportId}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select import file" />
              </SelectTrigger>
              <SelectContent>
                {importRecords.map((importRecord) => (
                  <SelectItem
                    key={importRecord.id}
                    value={String(importRecord.id)}
                  >
                    {importRecord.import_id} — {importRecord.file_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Analysis Position</Label>
            <Input
              inputMode="numeric"
              value={analysisPosition}
              onChange={(e) => {
                const value = e.target.value;
                if (value === "" || /^\d+$/.test(value)) {
                  setAnalysisPosition(value);
                }
              }}
              placeholder="Enter position number"
            />
          </div>
        </div>

        <DialogFooter className="flex-col-reverse gap-2 sm:flex-row sm:justify-between">
          <div>
            {isMapped && (
              <Button
                variant="destructive"
                onClick={handleUnmap}
                disabled={isSaving}
              >
                {isSaving ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Removing…
                  </>
                ) : (
                  "Unmap"
                )}
              </Button>
            )}
          </div>
          <div className="flex gap-2 justify-end">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSaving}
            >
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={!isValid || isSaving}>
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving…
                </>
              ) : (
                "Save"
              )}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
