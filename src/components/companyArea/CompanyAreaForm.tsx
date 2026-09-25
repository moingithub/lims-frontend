import { Input } from "../ui/input";
import { Label } from "../ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { companyMasterService } from "../../services/companyMasterService";
import { ActiveSelect } from "../shared/ActiveSelect";

export interface CompanyAreaFormData {
  id: number;
  company_id: number;
  area: string;
  description: string;
  gl_code: string;
  pay_key: string;
  po: string;
  authorized_by: string;
  cost_code: string;
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
          onValueChange={(value) =>
            onChange({ ...formData, company_id: parseInt(value) })
          }
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
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>GL Code</Label>
          <Input
            value={formData.gl_code}
            onChange={(e) => onChange({ ...formData, gl_code: e.target.value })}
            placeholder="Enter GL code"
          />
        </div>
        <div className="space-y-2">
          <Label>Pay Key</Label>
          <Input
            value={formData.pay_key}
            onChange={(e) => onChange({ ...formData, pay_key: e.target.value })}
            placeholder="Enter pay key"
          />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>PO</Label>
          <Input
            value={formData.po}
            onChange={(e) => onChange({ ...formData, po: e.target.value })}
            placeholder="Enter PO"
          />
        </div>
        <div className="space-y-2">
          <Label>Authorized By</Label>
          <Input
            value={formData.authorized_by}
            onChange={(e) =>
              onChange({ ...formData, authorized_by: e.target.value })
            }
            placeholder="Enter authorizer"
          />
        </div>
      </div>
      <div className="space-y-2">
        <Label>Cost Code</Label>
        <Input
          value={formData.cost_code}
          onChange={(e) => onChange({ ...formData, cost_code: e.target.value })}
          placeholder="Enter cost code"
        />
      </div>
      <div className="space-y-2">
        <Label>Description</Label>
        <Input
          value={formData.description}
          onChange={(e) =>
            onChange({ ...formData, description: e.target.value })
          }
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
