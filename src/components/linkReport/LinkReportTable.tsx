import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Download, Image, Upload, Unlink } from "lucide-react";
import {
  AnalysisPositionRecord,
  mapAnalysisPositionService,
} from "../../services/mapAnalysisPositionService";

interface LinkReportTableProps {
  records: AnalysisPositionRecord[];
  onImport: (record: AnalysisPositionRecord) => void;
  onDownload: (record: AnalysisPositionRecord) => void;
  onUnmap: (record: AnalysisPositionRecord) => void;
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
  onUnmap,
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
            <TableHead>Import ID</TableHead>
            <TableHead>Analysis Position</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-center">Tag Image</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {records.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={8}
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
                  <TableCell>{displayValue(record.import_id)}</TableCell>
                  <TableCell>
                    {displayValue(record.analysis_position)}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={
                        unmapped
                          ? "bg-amber-100 text-amber-800"
                          : "bg-green-100 text-green-800"
                      }
                    >
                      {unmapped ? "Unmapped" : "Mapped"}
                    </Badge>
                  </TableCell>
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
                      {!unmapped && (
                        <Button
                          variant="ghost"
                          size="sm"
                          title="Unmap"
                          onClick={() => onUnmap(record)}
                          disabled
                        >
                          <Unlink className="w-4 h-4 text-red-600" />
                        </Button>
                      )}
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
