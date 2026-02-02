import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Download } from "lucide-react";
import { AnalysisReport, analysisReportsService } from "../../services/analysisReportsService";
import { isoToUSDate } from "../../utils/dateUtils";

interface AnalysisReportsTableProps {
  reports: AnalysisReport[];
  onDownload: (analysisNumber: string, customer: string) => void;
}

export function AnalysisReportsTable({ reports, onDownload }: AnalysisReportsTableProps) {
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
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {reports.length === 0 ? (
            <TableRow>
              <TableCell colSpan={10} className="text-center text-muted-foreground py-8">
                No records found
              </TableCell>
            </TableRow>
          ) : (
            reports.map((report) => (
              <TableRow key={report.id}>
                <TableCell>{report.work_order_number}</TableCell>
                <TableCell>{report.customer}</TableCell>
                <TableCell>{isoToUSDate(report.date)}</TableCell>
                <TableCell>{report.analysis_type}</TableCell>
                <TableCell>{report.analysis_number}</TableCell>
                <TableCell>{report.cylinder_number}</TableCell>
                <TableCell>{report.well_name}</TableCell>
                <TableCell>{report.meter_number}</TableCell>
                <TableCell>
                  <Badge className={analysisReportsService.getStatusBadgeVariant(report.status)} variant="outline">
                    {report.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onDownload(report.analysis_number, report.customer)}
                    title="Download Report"
                  >
                    <Download className="w-4 h-4 text-blue-600" />
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
