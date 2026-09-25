import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Filter } from "lucide-react";

interface AnalysisReportsFiltersProps {
  statusFilter: string;
  customerFilter: string;
  meterNumberFilter: string;
  wellNameFilter: string;
  analysisNumberFilter: string;
  statuses: string[];
  customers: string[];
  meterNumbers: string[];
  wellNames: string[];
  analysisNumbers: string[];
  onStatusChange: (value: string) => void;
  onCustomerChange: (value: string) => void;
  onMeterNumberChange: (value: string) => void;
  onWellNameChange: (value: string) => void;
  onAnalysisNumberChange: (value: string) => void;
}

export function AnalysisReportsFilters({
  statusFilter,
  customerFilter,
  meterNumberFilter,
  wellNameFilter,
  analysisNumberFilter,
  statuses,
  customers,
  meterNumbers,
  wellNames,
  analysisNumbers,
  onStatusChange,
  onCustomerChange,
  onMeterNumberChange,
  onWellNameChange,
  onAnalysisNumberChange,
}: AnalysisReportsFiltersProps) {
  return (
    <div className="flex flex-wrap gap-3 items-center">
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
      <Select value={wellNameFilter} onValueChange={onWellNameChange}>
        <SelectTrigger className="w-[220px]">
          <SelectValue placeholder="Filter by well name" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Well Names</SelectItem>
          {wellNames.map((wellName) => (
            <SelectItem key={wellName} value={wellName}>
              {wellName}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Select value={meterNumberFilter} onValueChange={onMeterNumberChange}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Filter by meter no" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Meter Nos</SelectItem>
          {meterNumbers.map((meterNumber) => (
            <SelectItem key={meterNumber} value={meterNumber}>
              {meterNumber}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Select
        value={analysisNumberFilter}
        onValueChange={onAnalysisNumberChange}
      >
        <SelectTrigger className="w-[200px]">
          <SelectValue placeholder="Filter by analysis #" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Analysis #s</SelectItem>
          {analysisNumbers.map((analysisNumber) => (
            <SelectItem key={analysisNumber} value={analysisNumber}>
              {analysisNumber}
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
