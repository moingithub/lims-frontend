import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Archive, Trash2, FileUp } from "lucide-react";
import { ImportRecord, importMachineReportService } from "../../services/importMachineReportService";

interface ImportRecordsTableProps {
  records: ImportRecord[];
  onArchive: (record: ImportRecord) => void;
  onDelete: (record: ImportRecord) => void;
  onImportToSystem: (record: ImportRecord) => void;
}

export function ImportRecordsTable({ 
  records, 
  onArchive, 
  onDelete, 
  onImportToSystem 
}: ImportRecordsTableProps) {
  return (
    <div className="border rounded-lg overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Import ID</TableHead>
            <TableHead>Source Machine</TableHead>
            <TableHead>File Name</TableHead>
            <TableHead>Uploaded By</TableHead>
            <TableHead>Imported Date/Time</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {records.map((record) => (
            <TableRow key={record.import_id}>
              <TableCell>{record.import_id}</TableCell>
              <TableCell>{record.source_machine}</TableCell>
              <TableCell>{record.file_name}</TableCell>
              <TableCell>{record.uploaded_by}</TableCell>
              <TableCell>
                {importMachineReportService.formatDateTime(record.imported_date_time)}
              </TableCell>
              <TableCell>
                <Badge
                  className={importMachineReportService.getStatusBadgeVariant(record.status)}
                  variant="outline"
                >
                  {record.status}
                </Badge>
              </TableCell>
              <TableCell className="text-right">
                <div className="flex gap-1 justify-end">
                  {record.status !== "Archived" && (
                    <Button
                      variant="ghost"
                      size="sm"
                      title="Archive"
                      onClick={() => onArchive(record)}
                    >
                      <Archive className="w-4 h-4 text-orange-600" />
                    </Button>
                  )}
                  {record.status === "Validated" && (
                    <Button
                      variant="ghost"
                      size="sm"
                      title="Import to System"
                      onClick={() => onImportToSystem(record)}
                    >
                      <FileUp className="w-4 h-4 text-purple-600" />
                    </Button>
                  )}
                  {record.status !== "Imported" &&
                    record.status !== "Archived" && (
                      <Button
                        variant="ghost"
                        size="sm"
                        title="Delete"
                        onClick={() => onDelete(record)}
                      >
                        <Trash2 className="w-4 h-4 text-red-600" />
                      </Button>
                    )}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
