import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";

export interface ModuleFormData {
  id: number;
  module_name: string;
  description: string;
  active: boolean;
  created_by: number;
}

interface ModuleFormProps {
  formData: ModuleFormData;
  onChange: (data: ModuleFormData) => void;
}

export function ModuleForm({ formData, onChange }: ModuleFormProps) {
  return (
    <div className="grid gap-4 py-4">
      <div className="space-y-2">
        <Label>Module Name</Label>
        <Input
          placeholder="Enter module name"
          value={formData.module_name}
          onChange={(e) => onChange({ ...formData, module_name: e.target.value })}
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