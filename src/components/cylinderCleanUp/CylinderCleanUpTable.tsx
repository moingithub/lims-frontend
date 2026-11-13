import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import { Button } from "../ui/button";
import { Trash2 } from "lucide-react";
import { CylinderCleanupLine } from "../../services/cylinderCleanupService";

interface CylinderCleanUpTableProps {
  lines: CylinderCleanupLine[];
  onRemove: (cylinderId: number) => void;
}

export function CylinderCleanUpTable({
  lines,
  onRemove,
}: CylinderCleanUpTableProps) {
  return (
    <div className="space-y-2">
      <p className="text-sm font-medium">Scanned Cylinders ({lines.length})</p>
      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Cylinder Number</TableHead>
              <TableHead>Cylinder Type</TableHead>
              <TableHead>Clean-Up Date</TableHead>
              <TableHead className="w-[100px] text-right">Delete</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {lines.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={4}
                  className="text-center text-muted-foreground py-10"
                >
                  No cylinders scanned yet
                </TableCell>
              </TableRow>
            ) : (
              lines.map((line) => (
                <TableRow key={line.cylinderId}>
                  <TableCell className="font-medium">
                    {line.cylinderNumber}
                  </TableCell>
                  <TableCell>{line.cylinderType}</TableCell>
                  <TableCell>{line.cleanupDate}</TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onRemove(line.cylinderId)}
                      aria-label={`Remove ${line.cylinderNumber}`}
                    >
                      <Trash2 className="w-4 h-4 text-red-600" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
