import { Label } from "../ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Checkbox } from "../ui/checkbox";
import { Button } from "../ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "../ui/popover";
import { ChevronDown } from "lucide-react";
import { analysisPricingService } from "../../services/analysisPricingService";
import { CompanyArea } from "../../services/companyAreaService";

interface AnalysisOptionsFormProps {
  selectedAnalysisTypes: string[];
  area: string;
  customerCylinder: boolean;
  rushed: boolean;
  sampledByNatty: boolean;
  companyAreas: CompanyArea[];
  customerName: string;
  selectedCompanyId: number | null;
  onSelectedAnalysisTypesChange: (values: string[]) => void;
  onAreaChange: (value: string) => void;
  onCustomerCylinderChange: (checked: boolean) => void;
  onRushedChange: (checked: boolean) => void;
  onSampledByNattyChange: (checked: boolean) => void;
}

function formatAnalysisTypeSelection(
  selectedCodes: string[],
  activeAnalysisTypes: ReturnType<
    typeof analysisPricingService.getActiveAnalysisPrices
  >,
): string {
  if (selectedCodes.length === 0) {
    return "Select analysis types";
  }
  if (selectedCodes.length === 1) {
    const match = activeAnalysisTypes.find(
      (analysis) => analysis.analysis_code === selectedCodes[0],
    );
    return match
      ? `${match.analysis_code} — ${match.description}`
      : selectedCodes[0];
  }
  return `${selectedCodes.length} analysis types selected`;
}

export function AnalysisOptionsForm({
  selectedAnalysisTypes,
  area,
  customerCylinder,
  rushed,
  sampledByNatty,
  companyAreas,
  customerName,
  selectedCompanyId,
  onSelectedAnalysisTypesChange,
  onAreaChange,
  onCustomerCylinderChange,
  onRushedChange,
  onSampledByNattyChange,
}: AnalysisOptionsFormProps) {
  const activeAnalysisTypes = analysisPricingService.getActiveAnalysisPrices();

  const filteredAreas = selectedCompanyId
    ? companyAreas.filter((ca) => ca.company_id === selectedCompanyId)
    : [];

  const toggleAnalysisType = (code: string, checked: boolean) => {
    if (checked) {
      if (selectedAnalysisTypes.includes(code)) return;
      onSelectedAnalysisTypesChange([...selectedAnalysisTypes, code]);
      return;
    }
    onSelectedAnalysisTypesChange(
      selectedAnalysisTypes.filter((value) => value !== code),
    );
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Analysis Type</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                type="button"
                variant="outline"
                className="h-10 w-full justify-between font-normal"
              >
                <span className="truncate text-left">
                  {formatAnalysisTypeSelection(
                    selectedAnalysisTypes,
                    activeAnalysisTypes,
                  )}
                </span>
                <ChevronDown className="h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent
              className="w-[var(--radix-popover-trigger-width)] p-2"
              align="start"
            >
              <div className="max-h-60 space-y-1 overflow-y-auto">
                {activeAnalysisTypes.map((analysis) => {
                  const code = analysis.analysis_code;
                  const checkboxId = `analysis-type-${analysis.id}`;
                  const checked = selectedAnalysisTypes.includes(code);
                  return (
                    <div
                      key={analysis.id}
                      className="flex items-start gap-2 rounded-sm px-2 py-1.5 hover:bg-muted/60"
                    >
                      <Checkbox
                        id={checkboxId}
                        checked={checked}
                        onCheckedChange={(value) =>
                          toggleAnalysisType(code, value === true)
                        }
                        className="mt-0.5"
                      />
                      <Label
                        htmlFor={checkboxId}
                        className="cursor-pointer font-normal leading-snug"
                      >
                        <span className="font-medium">{code}</span>
                        <span className="text-muted-foreground">
                          {" "}
                          — {analysis.description}
                        </span>
                      </Label>
                    </div>
                  );
                })}
              </div>
            </PopoverContent>
          </Popover>
        </div>

        <div className="space-y-2">
          <Label>Area</Label>
          <Select value={area} onValueChange={onAreaChange}>
            <SelectTrigger>
              <SelectValue
                placeholder={
                  selectedCompanyId ? "Select area" : "Select company first"
                }
              />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="NA">NA</SelectItem>
              {filteredAreas.map((ca) => (
                <SelectItem key={ca.id} value={ca.area}>
                  {ca.area}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex items-center gap-6">
        <div className="flex items-center space-x-2">
          <Checkbox
            id="customer-cylinder-main"
            checked={customerCylinder}
            onCheckedChange={(checked: boolean) =>
              onCustomerCylinderChange(checked)
            }
          />
          <Label
            htmlFor="customer-cylinder-main"
            className="font-normal cursor-pointer"
          >
            This is a customer-owned cylinder
          </Label>
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox
            id="rushed-main"
            checked={rushed}
            onCheckedChange={(checked: boolean) => onRushedChange(checked)}
          />
          <Label htmlFor="rushed-main" className="font-normal cursor-pointer">
            Rushed
          </Label>
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox
            id="sampled-by-natty"
            checked={sampledByNatty}
            onCheckedChange={(checked: boolean) =>
              onSampledByNattyChange(checked)
            }
          />
          <Label
            htmlFor="sampled-by-natty"
            className="font-normal cursor-pointer"
          >
            Sampled By Natty
          </Label>
        </div>
      </div>
    </div>
  );
}
