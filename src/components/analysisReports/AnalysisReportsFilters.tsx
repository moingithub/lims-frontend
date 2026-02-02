import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Filter } from "lucide-react";

interface AnalysisReportsFiltersProps {
  statusFilter: string;
  customerFilter: string;
  statuses: string[];
  customers: string[];
  onStatusChange: (value: string) => void;
  onCustomerChange: (value: string) => void;
}

export function AnalysisReportsFilters({
  statusFilter,
  customerFilter,
  statuses,
  customers,
  onStatusChange,
  onCustomerChange,
}: AnalysisReportsFiltersProps) {
  return (
    <div className="flex gap-3 items-center">
      <Filter className="w-4 h-4 text-muted-foreground" />
      <Select value={customerFilter} onValueChange={onCustomerChange}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Filter by customer" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Customers</SelectItem>
          {customers.map((customer) => (
            <SelectItem key={customer} value={customer}>
              {customer}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Select value={statusFilter} onValueChange={onStatusChange}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Filter by status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Statuses</SelectItem>
          {statuses.map((status) => (
            <SelectItem key={status} value={status}>
              {status}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
