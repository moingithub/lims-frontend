import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import { Button } from "../ui/button";
import { Download, Image, Upload } from "lucide-react";
import {
  AnalysisPositionRecord,
  mapAnalysisPositionService,
} from "../../services/mapAnalysisPositionService";

interface LinkReportTableProps {
  records: AnalysisPositionRecord[];
  onImport: (record: AnalysisPositionRecord) => void;
  onDownload: (record: AnalysisPositionRecord) => void;
  onViewImage: (imageUrl: string, filename?: string) => void;
}

function displayValue(value: string | number | null | undefined): string {
  if (value == null || value === "") return "—";
  return String(value);
}

export function LinkReportTable({
  records,
  onImport,
  onDownload,
  onViewImage,
}: LinkReportTableProps) {
  return (
    <div className="border rounded-lg overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Company</TableHead>
            <TableHead>Work Order #</TableHead>
            <TableHead>Analysis #</TableHead>
            <TableHead className="text-center">Tag Image</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {records.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={5}
                className="text-center text-muted-foreground py-8"
              >
                No records found
              </TableCell>
            </TableRow>
          ) : (
            records.map((record) => {
              const unmapped = mapAnalysisPositionService.needsMapping(record);
              return (
                <TableRow key={record.sample_checkin_id}>
                  <TableCell>{record.company_name}</TableCell>
                  <TableCell>
                    {displayValue(record.work_order_number)}
                  </TableCell>
                  <TableCell>{record.analysis_number}</TableCell>
                  <TableCell className="text-center">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        onViewImage(
                          record.scanned_tag_image || record.tag_image,
                          record.tag_image,
                        )
                      }
                      disabled={!record.scanned_tag_image && !record.tag_image}
                      title="View tag image"
                    >
                      <Image className="w-4 h-4 text-blue-600" />
                    </Button>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex gap-1 justify-end">
                      <Button
                        variant="ghost"
                        size="sm"
                        title="Import and link report"
                        onClick={() => onImport(record)}
                      >
                        <Upload
                          className={`w-4 h-4 ${unmapped ? "text-amber-600" : "text-blue-600"}`}
                        />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        title="Download analysis report"
                        onClick={() => onDownload(record)}
                      >
                        <Download className="w-4 h-4 text-green-600" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>
    </div>
  );
}
