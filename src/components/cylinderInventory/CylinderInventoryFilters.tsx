import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Filter } from "lucide-react";

interface CylinderInventoryFiltersProps {
  statusFilter: string;
  statuses: string[];
  onStatusChange: (value: string) => void;
}

export function CylinderInventoryFilters({
  statusFilter,
  statuses,
  onStatusChange,
}: CylinderInventoryFiltersProps) {
  return (
    <Select value={statusFilter} onValueChange={onStatusChange}>
      <SelectTrigger className="w-44">
        <Filter className="w-4 h-4 mr-2" />
        <SelectValue placeholder="Status" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">All Status</SelectItem>
        {statuses.map((status) => (
          <SelectItem key={status} value={status}>
            {status}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
