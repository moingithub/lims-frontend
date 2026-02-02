import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Filter } from "lucide-react";

interface PendingOrdersFiltersProps {
  priorityFilter: string;
  customerFilter: string;
  priorities: string[];
  customers: string[];
  onPriorityChange: (value: string) => void;
  onCustomerChange: (value: string) => void;
}

export function PendingOrdersFilters({
  priorityFilter,
  customerFilter,
  priorities,
  customers,
  onPriorityChange,
  onCustomerChange,
}: PendingOrdersFiltersProps) {
  return (
    <div className="flex gap-3 items-center">
      <Filter className="w-4 h-4 text-muted-foreground" />
      <Select value={priorityFilter} onValueChange={onPriorityChange}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Filter by priority" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Priorities</SelectItem>
          {priorities.map((priority) => (
            <SelectItem key={priority} value={priority}>
              {priority}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
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
    </div>
  );
}
