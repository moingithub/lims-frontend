import { Label } from "../ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";

interface ActiveSelectProps {
  value: boolean;
  onChange: (value: boolean) => void;
  label?: string;
}

export function ActiveSelect({ value, onChange, label = "Active" }: ActiveSelectProps) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <Select
        value={value ? "active" : "inactive"}
        onValueChange={(val) => onChange(val === "active")}
      >
        <SelectTrigger>
          <SelectValue>{value ? "True" : "False"}</SelectValue>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="active">True</SelectItem>
          <SelectItem value="inactive">False</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
