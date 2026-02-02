import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Filter } from "lucide-react";

interface WorkOrdersFiltersProps {
  statusFilter: string;
  onStatusChange: (value: string) => void;
}

export function WorkOrdersFilters({ statusFilter, onStatusChange }: WorkOrdersFiltersProps) {
  return (
    <Select value={statusFilter} onValueChange={onStatusChange}>
      <SelectTrigger className="w-40">
        <Filter className="w-4 h-4 mr-2" />
        <SelectValue placeholder="Status" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">All Status</SelectItem>
        <SelectItem value="Pending">Pending</SelectItem>
        <SelectItem value="In Progress">In Progress</SelectItem>
        <SelectItem value="Completed">Completed</SelectItem>
        <SelectItem value="Invoiced">Invoiced</SelectItem>
      </SelectContent>
    </Select>
  );
}
