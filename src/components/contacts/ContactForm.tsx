import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { companyMasterService } from "../../services/companyMasterService";
import { ActiveSelect } from "../shared/ActiveSelect";

export interface ContactFormData {
  id: number;
  company_id: number;
  name: string;
  phone: string;
  email: string;
  active: boolean;
}

interface ContactFormProps {
  formData: ContactFormData;
  onChange: (data: ContactFormData) => void;
}

export function ContactForm({ formData, onChange }: ContactFormProps) {
  // Get active companies only from companyMasterService
  const companies = companyMasterService.getActiveCompanies();
  
  return (
    <div className="space-y-4 py-4">
      <div className="space-y-2">
        <Label>Company</Label>
        <Select
          value={formData.company_id.toString()}
          onValueChange={(val) => onChange({ ...formData, company_id: parseInt(val) })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select company" />
          </SelectTrigger>
          <SelectContent>
            {companies.map((company) => (
              <SelectItem key={company.id} value={company.id.toString()}>
                {company.company_name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label>Name</Label>
        <Input
          placeholder="Enter contact name"
          value={formData.name}
          onChange={(e) => onChange({ ...formData, name: e.target.value })}
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Phone</Label>
          <Input
            placeholder="Enter phone number"
            value={formData.phone}
            onChange={(e) => onChange({ ...formData, phone: e.target.value })}
          />
        </div>
        <div className="space-y-2">
          <Label>Email</Label>
          <Input
            type="email"
            placeholder="Enter email"
            value={formData.email}
            onChange={(e) => onChange({ ...formData, email: e.target.value })}
          />
        </div>
      </div>
      <ActiveSelect
        value={formData.active}
        onChange={(val) => onChange({ ...formData, active: val })}
      />
    </div>
  );
}