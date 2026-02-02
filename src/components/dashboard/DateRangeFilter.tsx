import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Calendar } from "lucide-react";

interface DateRangeFilterProps {
  dateFrom: string;
  dateTo: string;
  selectedAnalysisType: string;
  onDateFromChange: (value: string) => void;
  onDateToChange: (value: string) => void;
  onAnalysisTypeChange: (value: string) => void;
}

export function DateRangeFilter({
  dateFrom,
  dateTo,
  selectedAnalysisType,
  onDateFromChange,
  onDateToChange,
  onAnalysisTypeChange,
}: DateRangeFilterProps) {
  const analysisTypes = ["GPA 2261", "GPA 2172", "BTU Analysis", "Extended Analysis"];

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
              type="date"
              value={dateFrom}
              onChange={(e) => onDateFromChange(e.target.value)}
              className="cursor-pointer"
            />
          </div>
          <div className="space-y-2">
            <Label>Date To</Label>
            <Input
              type="date"
              value={dateTo}
              onChange={(e) => onDateToChange(e.target.value)}
              className="cursor-pointer"
            />
          </div>
          <div className="space-y-2">
            <Label>Analysis Type</Label>
            <Select value={selectedAnalysisType} onValueChange={onAnalysisTypeChange}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                {analysisTypes.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
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
