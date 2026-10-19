import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
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
import { Download, Loader2 } from "lucide-react";
import { AnalysisPositionRecord } from "../../services/mapAnalysisPositionService";

const REPORT_TEMPLATES = [
  {
    label: "GA 2261 EOG Report",
    fileName: "GA 2261 EOG Report.xlsx",
  },
  {
    label: "GA 2261 EOG C9+ Report",
    fileName: "GA 2261 EOG C9+ Report.xlsx",
  },
  {
    label: "GA 2261 BLM Report 1.0",
    fileName: "GA 2261 BLM Report 1.0.xlsx",
  },
  {
    label: "GA 2261 Report Release 2.0",
    fileName: "GA 2261 Report Release 2.0.xlsx",
  },
];

const DEFAULT_REPORT_TEMPLATE = "GA 2261 EOG Report.xlsx";

interface ReportTemplateDialogProps {
  open: boolean;
  record: AnalysisPositionRecord | null;
  isSaving: boolean;
  onOpenChange: (open: boolean) => void;
  onDownload: (
    sampleCheckinId: number,
    reportTemplateName: string,
    pressureMeasured: string,
  ) => void;
}

export function ReportTemplateDialog({
  open,
  record,
  isSaving,
  onOpenChange,
  onDownload,
}: ReportTemplateDialogProps) {
  const [pressureMeasured, setPressureMeasured] = useState("");
  const [selectedTemplate, setSelectedTemplate] = useState(
    DEFAULT_REPORT_TEMPLATE,
  );

  useEffect(() => {
    if (!open) return;
    setPressureMeasured(record?.pressure_measured ?? "");
    setSelectedTemplate(DEFAULT_REPORT_TEMPLATE);
  }, [open, record]);

  if (!record) return null;

  const handleDownload = () => {
    if (!selectedTemplate || !pressureMeasured.trim()) return;
    onDownload(
      record.sample_checkin_id,
      selectedTemplate,
      pressureMeasured.trim(),
    );
  };

  const isValid = !!selectedTemplate && pressureMeasured.trim().length > 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Download Report Template</DialogTitle>
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
            <Label>Select Report Template</Label>
            <Select
              value={selectedTemplate}
              onValueChange={setSelectedTemplate}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a report template" />
              </SelectTrigger>
              <SelectContent>
                {REPORT_TEMPLATES.map((template) => (
                  <SelectItem key={template.fileName} value={template.fileName}>
                    {template.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
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
          <Button onClick={handleDownload} disabled={!isValid || isSaving}>
            {isSaving ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Preparing…
              </>
            ) : (
              <>
                <Download className="w-4 h-4 mr-2" />
                Download Template
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
