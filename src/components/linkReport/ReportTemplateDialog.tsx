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
import {
  analyzedByOptionsForSelect,
  getDisplayPressure,
  instrumentOptionsForSelect,
  ReportFileRecord,
  ReportTemplateDownloadFields,
  reportFilesService,
} from "../../services/reportFilesService";

const REPORT_TEMPLATES = [
  {
    label: "GA 2261 Report Release 2.1",
    fileName: "GA 2261 Report Release 2.1.xlsx",
  },
  {
    label: "GA 2261 EOG Report Release 1.0",
    fileName: "GA 2261 EOG Report Release 1.0.xlsx",
  },
  {
    label: "GA 2261 EOG C9+ Report Release 1.0",
    fileName: "GA 2261 EOG C9+ Report Release 1.0.xlsx",
  },
];

const DEFAULT_REPORT_TEMPLATE = REPORT_TEMPLATES[0].fileName;
const PRESSURE_INPUT_PATTERN = /^\d*\.?\d*$/;

function isValidPressureValue(value: string): boolean {
  const trimmed = value.trim();
  if (!trimmed || trimmed === ".") return false;
  const parsed = Number.parseFloat(trimmed);
  return Number.isFinite(parsed);
}

interface ReportTemplateDialogProps {
  open: boolean;
  record: ReportFileRecord | null;
  isSaving: boolean;
  onOpenChange: (open: boolean) => void;
  onDownload: (
    sampleCheckinId: number,
    reportTemplateName: string,
    pressureMeasured: string,
    templateFields: ReportTemplateDownloadFields,
  ) => void | Promise<void>;
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
  const [instrument, setInstrument] = useState("");
  const [analyzedOn, setAnalyzedOn] = useState("");
  const [analyzedBy, setAnalyzedBy] = useState("");
  const [effectiveStartDate, setEffectiveStartDate] = useState("");
  const [effectiveEndDate, setEffectiveEndDate] = useState("");
  const [isLoadingFields, setIsLoadingFields] = useState(false);

  useEffect(() => {
    if (!open || !record) return;

    let cancelled = false;
    setIsLoadingFields(true);
    setSelectedTemplate(DEFAULT_REPORT_TEMPLATE);
    setPressureMeasured(getDisplayPressure(record));

    void reportFilesService
      .loadReportTemplateDownloadFields(record)
      .then((fields) => {
        if (cancelled) return;
        setInstrument(fields.instrument);
        setAnalyzedOn(fields.analyzedOn);
        setAnalyzedBy(fields.analyzedBy);
        setEffectiveStartDate(fields.effectiveStartDate);
        setEffectiveEndDate(fields.effectiveEndDate);
      })
      .catch(() => {
        if (cancelled) return;
      })
      .finally(() => {
        if (!cancelled) setIsLoadingFields(false);
      });

    return () => {
      cancelled = true;
    };
  }, [open, record?.sample_checkin_id]);

  if (!record) return null;

  const instrumentOptions = instrumentOptionsForSelect(instrument);
  const analyzedByOptions = analyzedByOptionsForSelect(analyzedBy);
  const fieldsDisabled = isSaving || isLoadingFields;

  const handlePressureChange = (raw: string) => {
    if (raw !== "" && !PRESSURE_INPUT_PATTERN.test(raw)) return;
    setPressureMeasured(raw);
  };

  const handleDownload = () => {
    if (!selectedTemplate || !isValidPressureValue(pressureMeasured)) return;
    if (!instrument || !analyzedOn.trim() || !analyzedBy) return;

    void onDownload(
      record.sample_checkin_id,
      selectedTemplate,
      pressureMeasured.trim(),
      {
        instrument,
        analyzedOn: analyzedOn.trim(),
        analyzedBy,
        effectiveStartDate: effectiveStartDate.trim(),
        effectiveEndDate: effectiveEndDate.trim(),
      },
    );
  };

  const isValid =
    !isLoadingFields &&
    !!selectedTemplate &&
    isValidPressureValue(pressureMeasured) &&
    !!instrument &&
    !!analyzedOn.trim() &&
    !!analyzedBy;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Download Report Template</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label>Pressure Measured</Label>
            <div className="flex gap-2">
              <Input
                type="text"
                inputMode="decimal"
                value={pressureMeasured}
                onChange={(e) => handlePressureChange(e.target.value)}
                onBlur={() => {
                  const trimmed = pressureMeasured.trim();
                  if (trimmed.endsWith(".")) {
                    setPressureMeasured(trimmed.slice(0, -1));
                  }
                }}
                placeholder="Enter pressure measured"
                disabled={fieldsDisabled}
                className="flex-1"
              />
              {record.pressure_unit ? (
                <span className="flex items-center text-sm text-muted-foreground px-1">
                  {record.pressure_unit}
                </span>
              ) : null}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Instrument</Label>
            <Select value={instrument} onValueChange={setInstrument}>
              <SelectTrigger disabled={fieldsDisabled}>
                <SelectValue placeholder="Select instrument" />
              </SelectTrigger>
              <SelectContent>
                {instrumentOptions.map((value) => (
                  <SelectItem key={value} value={value}>
                    {value}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="report-analyzed-on">Analyzed On</Label>
            <Input
              id="report-analyzed-on"
              type="datetime-local"
              step={60}
              value={analyzedOn}
              onChange={(e) => setAnalyzedOn(e.target.value)}
              disabled={fieldsDisabled}
            />
          </div>

          <div className="space-y-2">
            <Label>Analyzed By</Label>
            <Select value={analyzedBy} onValueChange={setAnalyzedBy}>
              <SelectTrigger disabled={fieldsDisabled}>
                <SelectValue placeholder="Select analyst" />
              </SelectTrigger>
              <SelectContent>
                {analyzedByOptions.map((name) => (
                  <SelectItem key={name} value={name}>
                    {name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="report-effective-start">Effective Start Date</Label>
              <Input
                id="report-effective-start"
                type="date"
                value={effectiveStartDate}
                onChange={(e) => setEffectiveStartDate(e.target.value)}
                disabled={fieldsDisabled}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="report-effective-end">Effective End Date</Label>
              <Input
                id="report-effective-end"
                type="date"
                value={effectiveEndDate}
                onChange={(e) => setEffectiveEndDate(e.target.value)}
                disabled={fieldsDisabled}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Select Report Template</Label>
            <Select
              value={selectedTemplate}
              onValueChange={setSelectedTemplate}
            >
              <SelectTrigger disabled={fieldsDisabled}>
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
            ) : isLoadingFields ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Loading…
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
