import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Filter } from "lucide-react";

interface ReportFilesFiltersProps {
  statusFilter: string;
  companyFilter: string;
  meterNumberFilter: string;
  wellNameFilter: string;
  analysisNumberFilter: string;
  statuses: string[];
  companies: string[];
  meterNumbers: string[];
  wellNames: string[];
  analysisNumbers: string[];
  onStatusChange: (value: string) => void;
  onCompanyChange: (value: string) => void;
  onMeterNumberChange: (value: string) => void;
  onWellNameChange: (value: string) => void;
  onAnalysisNumberChange: (value: string) => void;
}

export function ReportFilesFilters({
  statusFilter,
  companyFilter,
  meterNumberFilter,
  wellNameFilter,
  analysisNumberFilter,
  statuses,
  companies,
  meterNumbers,
  wellNames,
  analysisNumbers,
  onStatusChange,
  onCompanyChange,
  onMeterNumberChange,
  onWellNameChange,
  onAnalysisNumberChange,
}: ReportFilesFiltersProps) {
  return (
    <div className="flex flex-wrap gap-3 items-center">
      <Filter className="w-4 h-4 text-muted-foreground" />
      <Select value={companyFilter} onValueChange={onCompanyChange}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Filter by company" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Companies</SelectItem>
          {companies.map((company) => (
            <SelectItem key={company} value={company}>
              {company}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Select value={wellNameFilter} onValueChange={onWellNameChange}>
        <SelectTrigger className="w-[220px]">
          <SelectValue placeholder="Filter by well/facility" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Well/Facility</SelectItem>
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
