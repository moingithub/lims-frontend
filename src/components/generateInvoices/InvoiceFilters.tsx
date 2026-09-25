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
import { Filter } from "lucide-react";
import { Customer } from "../../types/generateInvoices";
import {
  formatUsDateInputDisplay,
  normalizeUsDateInput,
  parseUsDateInputToIso,
} from "../../utils/dateUtils";

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
        <Input
          type="text"
          inputMode="numeric"
          placeholder="MM/DD/YYYY"
          value={formatUsDateInputDisplay(dateFrom)}
          onChange={(e) =>
            onDateFromChange(
              parseUsDateInputToIso(normalizeUsDateInput(e.target.value)),
            )
          }
          className="cursor-pointer"
        />
      </div>

      <div className="space-y-2">
        <Label>Date To</Label>
        <Input
          type="text"
          inputMode="numeric"
          placeholder="MM/DD/YYYY"
          value={formatUsDateInputDisplay(dateTo)}
          onChange={(e) =>
            onDateToChange(
              parseUsDateInputToIso(normalizeUsDateInput(e.target.value)),
            )
          }
          className="cursor-pointer"
        />
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
