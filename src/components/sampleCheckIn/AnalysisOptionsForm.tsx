import { Label } from "../ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Checkbox } from "../ui/checkbox";
import { analysisPricingService } from "../../services/analysisPricingService";
import { CompanyArea } from "../../services/companyAreaService";

interface AnalysisOptionsFormProps {
  analysisType: string;
  area: string;
  customerCylinder: boolean;
  rushed: boolean;
  sampledByNatty: boolean;
  companyAreas: CompanyArea[];
  customerName: string;
  selectedCompanyId: number | null;
  onAnalysisTypeChange: (value: string) => void;
  onAreaChange: (value: string) => void;
  onCustomerCylinderChange: (checked: boolean) => void;
  onRushedChange: (checked: boolean) => void;
  onSampledByNattyChange: (checked: boolean) => void;
}

export function AnalysisOptionsForm({
  analysisType,
  area,
  customerCylinder,
  rushed,
  sampledByNatty,
  companyAreas,
  customerName,
  selectedCompanyId,
  onAnalysisTypeChange,
  onAreaChange,
  onCustomerCylinderChange,
  onRushedChange,
  onSampledByNattyChange,
}: AnalysisOptionsFormProps) {
  // Get active analysis types from pricing service
  const activeAnalysisTypes = analysisPricingService.getActiveAnalysisPrices();

  // Filter company areas by selected company ID
  const filteredAreas = selectedCompanyId
    ? companyAreas.filter((ca) => ca.company_id === selectedCompanyId)
    : [];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Analysis Type</Label>
          <Select value={analysisType} onValueChange={onAnalysisTypeChange}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {activeAnalysisTypes.map((analysis) => (
                <SelectItem key={analysis.id} value={analysis.analysis_code}>
                  {analysis.analysis_code} - {analysis.description}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Area</Label>
          <Select value={area} onValueChange={onAreaChange}>
            <SelectTrigger>
              <SelectValue placeholder={selectedCompanyId ? "Select area" : "Select company first"} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="NA">NA</SelectItem>
              {filteredAreas.map((ca) => (
                <SelectItem key={ca.id} value={ca.area}>
                  {ca.area} ({ca.region})
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
            onCheckedChange={(checked) => onCustomerCylinderChange(checked as boolean)}
          />
          <Label htmlFor="customer-cylinder-main" className="font-normal cursor-pointer">
            This is a customer-owned cylinder
          </Label>
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox
            id="rushed-main"
            checked={rushed}
            onCheckedChange={(checked) => onRushedChange(checked as boolean)}
          />
          <Label htmlFor="rushed-main" className="font-normal cursor-pointer">
            Rushed
          </Label>
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox
            id="sampled-by-natty"
            checked={sampledByNatty}
            onCheckedChange={(checked) => onSampledByNattyChange(checked as boolean)}
          />
          <Label htmlFor="sampled-by-natty" className="font-normal cursor-pointer">
            Sampled By Natty
          </Label>
        </div>
      </div>
    </div>
  );
}