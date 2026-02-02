import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { companyMasterService } from "../../services/companyMasterService";
import { ActiveSelect } from "../shared/ActiveSelect";

export interface CompanyAreaFormData {
  id: number;
  company_id: number;
  area: string;
  region: string;
  description: string;
  active: boolean;
}

interface CompanyAreaFormProps {
  formData: CompanyAreaFormData;
  onChange: (data: CompanyAreaFormData) => void;
}

export function CompanyAreaForm({ formData, onChange }: CompanyAreaFormProps) {
  // Get active companies only from companyMasterService
  const companies = companyMasterService.getActiveCompanies();

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Company *</Label>
        <Select
          value={formData.company_id.toString()}
          onValueChange={(value) => onChange({ ...formData, company_id: parseInt(value) })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select company" />
          </SelectTrigger>
          <SelectContent>
            {companies.map((company) => (
              <SelectItem key={company.id} value={company.id.toString()}>
                {company.company_name} ({company.company_code})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label>Area *</Label>
        <Input
          value={formData.area}
          onChange={(e) => onChange({ ...formData, area: e.target.value })}
          placeholder="Enter area name"
        />
      </div>
      <div className="space-y-2">
        <Label>Region *</Label>
        <Input
          value={formData.region}
          onChange={(e) => onChange({ ...formData, region: e.target.value })}
          placeholder="Enter region"
        />
      </div>
      <div className="space-y-2">
        <Label>Description</Label>
        <Input
          value={formData.description}
          onChange={(e) => onChange({ ...formData, description: e.target.value })}
          placeholder="Enter description"
        />
      </div>
      <ActiveSelect
        value={formData.active}
        onChange={(val) => onChange({ ...formData, active: val })}
        label="Active *"
      />
    </div>
  );
}