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
import { Loader2, Upload } from "lucide-react";
import { AnalysisPositionRecord } from "../../services/mapAnalysisPositionService";

interface LinkReportImportDialogProps {
  open: boolean;
  record: AnalysisPositionRecord | null;
  isSaving: boolean;
  onOpenChange: (open: boolean) => void;
  onImport: (
    sampleCheckinId: number,
    file: File,
    pressureMeasured: string,
  ) => void;
}

export function LinkReportImportDialog({
  open,
  record,
  isSaving,
  onOpenChange,
  onImport,
}: LinkReportImportDialogProps) {
  const [pressureMeasured, setPressureMeasured] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  useEffect(() => {
    if (!open) return;
    setPressureMeasured("");
    setSelectedFile(null);
    const fileInput = document.getElementById(
      "link-report-file-upload",
    ) as HTMLInputElement;
    if (fileInput) fileInput.value = "";
  }, [open, record]);

  if (!record) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedFile(e.target.files?.[0] ?? null);
  };

  const handleImport = () => {
    if (!selectedFile || !pressureMeasured.trim()) return;
    onImport(
      record.sample_checkin_id,
      selectedFile,
      pressureMeasured.trim(),
    );
  };

  const isValid = !!selectedFile && pressureMeasured.trim().length > 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Link Report</DialogTitle>
          <DialogDescription>
            Upload a machine report and link it to{" "}
            <strong>{record.analysis_number}</strong> ({record.company_name}).
            Analysis position will be set to 1.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label>Pressure Measured</Label>
            <Input
              value={pressureMeasured}
              onChange={(e) => setPressureMeasured(e.target.value)}
              placeholder="Enter pressure measured"
            />
          </div>

          <div className="space-y-2">
            <Label>Report File</Label>
            <Input
              id="link-report-file-upload"
              type="file"
              accept=".xlsx,.xls,.csv,.json,.fusion-data"
              onChange={handleFileChange}
              className="cursor-pointer"
            />
            {selectedFile && (
              <p className="text-sm text-muted-foreground">
                Selected: {selectedFile.name}
              </p>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSaving}
          >
            Cancel
          </Button>
          <Button onClick={handleImport} disabled={!isValid || isSaving}>
            {isSaving ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Uploading…
              </>
            ) : (
              <>
                <Upload className="w-4 h-4 mr-2" />
                Upload &amp; Link
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
