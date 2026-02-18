import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Filter, Calendar } from "lucide-react";
import { Customer } from "../../types/generateInvoices";

interface InvoiceFiltersProps {
  selectedCompanyId: number | null; // ✅ Changed from selectedCustomer (string)
  dateFrom: string;
  dateTo: string;
  customers: Customer[];
  onCompanyChange: (value: number | null) => void; // ✅ Changed from string to number
  onDateFromChange: (value: string) => void;
  onDateToChange: (value: string) => void;
  onSearch: () => void;
  onClear: () => void;
}

export function InvoiceFilters({
  selectedCompanyId,
  dateFrom,
  dateTo,
  customers,
  onCompanyChange,
  onDateFromChange,
  onDateToChange,
  onSearch,
  onClear,
}: InvoiceFiltersProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
      <div className="space-y-2">
        <Label>Company (Optional)</Label>
        <Select
          value={selectedCompanyId?.toString() || ""}
          onValueChange={(value: string) =>
            onCompanyChange(value ? parseInt(value) : null)
          }
        >
          <SelectTrigger>
            <SelectValue placeholder="All companies" />
          </SelectTrigger>
          <SelectContent>
            {customers.map((customer) => (
              <SelectItem key={customer.id} value={customer.id.toString()}>
                {customer.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Date From</Label>
        <div className="relative">
          <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            type="text"
            value={dateFrom}
            onChange={(e) => onDateFromChange(e.target.value)}
            placeholder="MM-DD-YYYY"
            className="pl-10"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label>Date To</Label>
        <div className="relative">
          <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            type="text"
            value={dateTo}
            onChange={(e) => onDateToChange(e.target.value)}
            placeholder="MM-DD-YYYY"
            className="pl-10"
          />
        </div>
      </div>

      <Button onClick={onSearch}>
        <Filter className="w-4 h-4 mr-2" />
        Apply Filters
      </Button>

      <Button variant="outline" onClick={onClear}>
        Clear Filters
      </Button>
    </div>
  );
}
