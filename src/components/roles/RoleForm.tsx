import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";

export interface RoleFormData {
  id: number;
  role_name: string;
  description: string;
  active: boolean;
  created_by: number;
}

interface RoleFormProps {
  formData: RoleFormData;
  onChange: (data: RoleFormData) => void;
}

export function RoleForm({ formData, onChange }: RoleFormProps) {
  return (
    <div className="space-y-4 py-4">
      <div className="space-y-2">
        <Label>Role Name</Label>
        <Input
          placeholder="Enter role name"
          value={formData.role_name}
          onChange={(e) => onChange({ ...formData, role_name: e.target.value })}
        />
      </div>
      <div className="space-y-2">
        <Label>Description</Label>
        <Input
          placeholder="Enter description"
          value={formData.description}
          onChange={(e) => onChange({ ...formData, description: e.target.value })}
        />
      </div>
      <div className="space-y-2">
        <Label>Active</Label>
        <Select
          value={formData.active ? "active" : "inactive"}
          onValueChange={(val) => onChange({ ...formData, active: val === "active" })}
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