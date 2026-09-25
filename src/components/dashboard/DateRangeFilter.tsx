import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Calendar } from "lucide-react";
import {
  formatUsDateInputDisplay,
  normalizeUsDateInput,
  parseUsDateInputToIso,
} from "../../utils/dateUtils";

interface DateRangeFilterProps {
  dateFrom: string;
  dateTo: string;
  selectedAnalysisType: string;
  analysisTypeOptions: { value: string; label: string }[];
  onDateFromChange: (value: string) => void;
  onDateToChange: (value: string) => void;
  onAnalysisTypeChange: (value: string) => void;
}

export function DateRangeFilter({
  dateFrom,
  dateTo,
  selectedAnalysisType,
  analysisTypeOptions,
  onDateFromChange,
  onDateToChange,
  onAnalysisTypeChange,
}: DateRangeFilterProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="w-5 h-5" />
          Analytics Period
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
          <div className="space-y-2">
            <Label>Analysis Type</Label>
            <Select
              value={selectedAnalysisType}
              onValueChange={onAnalysisTypeChange}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                {analysisTypeOptions.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
