import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import { Button } from "../ui/button";
import { FileDown, Image } from "lucide-react";
import { ReportFileRecord } from "../../services/reportFilesService";
import { formatDateUS } from "../../utils/dateUtils";

interface LinkReportTableProps {
  records: ReportFileRecord[];
  onDownloadTemplate: (record: ReportFileRecord) => void;
  onViewImage: (imageUrl: string, filename?: string) => void;
}

function displayValue(value: string | number | null | undefined): string {
  if (value == null || value === "") return "—";
  return String(value);
}

function formatSampleDate(value: string | null | undefined): string {
  if (!value?.trim()) return "—";
  try {
    return formatDateUS(value);
  } catch {
    return displayValue(value);
  }
}

export function LinkReportTable({
  records,
  onDownloadTemplate,
  onViewImage,
}: LinkReportTableProps) {
  const columnCount = 10;

  return (
    <div className="border rounded-lg overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Company</TableHead>
            <TableHead>Analysis Type</TableHead>
            <TableHead>Cylinder #</TableHead>
            <TableHead>Analysis #</TableHead>
            <TableHead>Well/Facility</TableHead>
            <TableHead>Meter #</TableHead>
            <TableHead>Sample Date</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-center">Tag Image</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {records.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={columnCount}
                className="text-center text-muted-foreground py-8"
              >
                No records found
              </TableCell>
            </TableRow>
          ) : (
            records.map((record) => (
              <TableRow key={record.sample_checkin_id}>
                <TableCell>{displayValue(record.company_name)}</TableCell>
                <TableCell>{displayValue(record.analysis_type)}</TableCell>
                <TableCell>{displayValue(record.cylinder_number)}</TableCell>
                <TableCell>{displayValue(record.analysis_number)}</TableCell>
                <TableCell>{displayValue(record.well_name)}</TableCell>
                <TableCell>{displayValue(record.meter_number)}</TableCell>
                <TableCell>{formatSampleDate(record.sample_date)}</TableCell>
                <TableCell>{displayValue(record.status)}</TableCell>
                <TableCell className="text-center">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                      onViewImage(record.tag_image, record.tag_image)
                    }
                    disabled={!record.tag_image}
                    title="View tag image"
                  >
                    <Image className="w-4 h-4 text-blue-600" />
                  </Button>
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="ghost"
                    size="sm"
                    title="Download Report Template"
                    onClick={() => onDownloadTemplate(record)}
                  >
                    <FileDown className="w-4 h-4 text-purple-600" />
                  </Button>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
