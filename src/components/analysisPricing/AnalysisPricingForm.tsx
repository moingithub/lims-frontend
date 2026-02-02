import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { ActiveSelect } from "../shared/ActiveSelect";

export interface AnalysisPricingFormData {
  id: number;
  analysis_code: string;
  description: string;
  standard_rate: string;
  sample_fee: string;
  rushed_rate: string;
  active: boolean;
}

interface AnalysisPricingFormProps {
  formData: AnalysisPricingFormData;
  onChange: (data: AnalysisPricingFormData) => void;
}

export function AnalysisPricingForm({ formData, onChange }: AnalysisPricingFormProps) {
  return (
    <div className="space-y-4 py-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Analysis Type *</Label>
          <Input
            placeholder="e.g., GPA2261"
            value={formData.analysis_code}
            onChange={(e) => onChange({ ...formData, analysis_code: e.target.value })}
          />
        </div>
        <div className="space-y-2">
          <Label>Description *</Label>
          <Input
            placeholder="e.g., Natural Gas Analysis"
            value={formData.description}
            onChange={(e) => onChange({ ...formData, description: e.target.value })}
          />
        </div>
      </div>
      <div className="grid grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label>Standard Rate ($) *</Label>
          <Input
            type="number"
            step="0.01"
            placeholder="150.00"
            value={formData.standard_rate}
            onChange={(e) => onChange({ ...formData, standard_rate: e.target.value })}
          />
        </div>
        <div className="space-y-2">
          <Label>Sample Fee ($)</Label>
          <Input
            type="number"
            step="0.01"
            placeholder="50.00"
            value={formData.sample_fee}
            onChange={(e) => onChange({ ...formData, sample_fee: e.target.value })}
          />
        </div>
        <div className="space-y-2">
          <Label>Rushed Rate ($) *</Label>
          <Input
            type="number"
            step="0.01"
            placeholder="225.00"
            value={formData.rushed_rate}
            onChange={(e) => onChange({ ...formData, rushed_rate: e.target.value })}
          />
        </div>
      </div>
      <ActiveSelect
        value={formData.active}
        onChange={(val) => onChange({ ...formData, active: val })}
        label="Active"
      />
    </div>
  );
}