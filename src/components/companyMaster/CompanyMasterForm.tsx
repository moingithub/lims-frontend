import { Input } from "../ui/input";
import { Label } from "../ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { billingReferenceTypes } from "../../services/companyMasterService";
import { Checkbox } from "../ui/checkbox";

export interface CompanyMasterFormData {
  id: number;
  company_code: string;
  company_name: string;
  phone: string;
  email: string;
  billing_reference_type: string;
  billing_reference_number: string;
  billing_address: string;
  charge_h2_pop_fee: boolean;
  h2_pop_fee_rate: number;
  active: boolean;
}

interface CompanyMasterFormProps {
  formData: CompanyMasterFormData;
  onChange: (data: CompanyMasterFormData) => void;
}

export function CompanyMasterForm({
  formData,
  onChange,
}: CompanyMasterFormProps) {
  return (
    <div className="space-y-4 py-4">
      <div className="space-y-2">
        <Label>
          Company Code
          <span style={{ color: "red", marginLeft: 2 }}>*</span>
        </Label>
        <Input
          placeholder="Enter company code"
          value={formData.company_code}
          onChange={(e) =>
            onChange({ ...formData, company_code: e.target.value })
          }
        />
      </div>
      <div className="space-y-2">
        <Label>
          Company Name
          <span style={{ color: "red", marginLeft: 2 }}>*</span>
        </Label>
        <Input
          placeholder="Enter company name"
          value={formData.company_name}
          onChange={(e) =>
            onChange({ ...formData, company_name: e.target.value })
          }
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Phone#</Label>
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
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Billing Ref</Label>
          <Select
            value={formData.billing_reference_type}
            onValueChange={(value: string) =>
              onChange({ ...formData, billing_reference_type: value })
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {billingReferenceTypes.map((type) => (
                <SelectItem key={type} value={type}>
                  {type}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Billing Ref No</Label>
          <Input
            placeholder="Enter billing ref number"
            value={formData.billing_reference_number}
            onChange={(e) =>
              onChange({
                ...formData,
                billing_reference_number: e.target.value,
              })
            }
          />
        </div>
      </div>
      <div className="space-y-2">
        <Label>Billing Address</Label>
        <Input
          placeholder="Enter billing address"
          value={formData.billing_address}
          onChange={(e) =>
            onChange({ ...formData, billing_address: e.target.value })
          }
        />
      </div>
      <div className="space-y-2">
        <Label>H2 Pop Fee</Label>
        <div className="flex items-center gap-4">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="charge-h2-pop-fee"
              checked={formData.charge_h2_pop_fee}
              onCheckedChange={(checked: boolean | "indeterminate") =>
                onChange({
                  ...formData,
                  charge_h2_pop_fee: checked === true,
                })
              }
            />
            <Label htmlFor="charge-h2-pop-fee" className="font-normal">
              Charge H2 Pop Fee
            </Label>
          </div>
          <Input
            type="number"
            className="w-32"
            placeholder="Rate"
            value={formData.h2_pop_fee_rate}
            onChange={(e) =>
              onChange({
                ...formData,
                h2_pop_fee_rate: parseFloat(e.target.value) || 0,
              })
            }
            disabled={!formData.charge_h2_pop_fee}
          />
        </div>
      </div>
      <div className="space-y-2">
        <Label>Active</Label>
        <Select
          value={formData.active ? "active" : "inactive"}
          onValueChange={(value: string) =>
            onChange({ ...formData, active: value === "active" })
          }
        >
          <SelectTrigger>
            <SelectValue>{formData.active ? "True" : "False"}</SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="active">True</SelectItem>
            <SelectItem value="inactive">False</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
