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
import { Download, Eye, Image } from "lucide-react";
import {
  AnalysisReport,
  analysisReportsService,
} from "../../services/analysisReportsService";
import { resolveDisplayDate } from "../../utils/dateUtils";

interface AnalysisReportsTableProps {
  reports: AnalysisReport[];
  onViewReport: (report: AnalysisReport) => void;
  onDownload: (report: AnalysisReport) => void;
  onViewImage: (imageUrl: string, filename?: string) => void;
}

export function AnalysisReportsTable({
  reports,
  onViewReport,
  onDownload,
  onViewImage,
}: AnalysisReportsTableProps) {
  return (
    <div className="border rounded-lg overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Work Order #</TableHead>
            <TableHead>Customer</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Analysis Type</TableHead>
            <TableHead>Analysis #</TableHead>
            <TableHead>Cylinder #</TableHead>
            <TableHead>Well Name</TableHead>
            <TableHead>Meter #</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-center">Tag Image</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {reports.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={11}
                className="text-center text-muted-foreground py-8"
              >
                No records found
              </TableCell>
            </TableRow>
          ) : (
            reports.map((report) => (
              <TableRow key={report.id}>
                <TableCell>{report.work_order_number}</TableCell>
                <TableCell>{report.customer}</TableCell>
                <TableCell>
                  {resolveDisplayDate(report.date) || "N/A"}
                </TableCell>
                <TableCell>{report.analysis_type || "N/A"}</TableCell>
                <TableCell>{report.analysis_number}</TableCell>
                <TableCell>{report.cylinder_number}</TableCell>
                <TableCell>{report.well_name}</TableCell>
                <TableCell>{report.meter_number}</TableCell>
                <TableCell>
                  <Badge
                    className={analysisReportsService.getStatusBadgeVariant(
                      report.status,
                    )}
                    variant="outline"
                  >
                    {report.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-center">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                      onViewImage(
                        report.scanned_tag_image || report.tag_image,
                        report.tag_image,
                      )
                    }
                    disabled={!report.scanned_tag_image && !report.tag_image}
                    title="View tag image"
                  >
                    <Image className="w-4 h-4 text-blue-600" />
                  </Button>
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onDownload(report)}
                    disabled={!report.import_machine_report_id}
                    title="Download uploaded report"
                  >
                    <Download className="w-4 h-4 text-green-600" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onViewReport(report)}
                    title="View Report"
                  >
                    <Eye className="w-4 h-4 text-blue-600" />
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
