import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Mail } from "lucide-react";
import { CylinderInventoryItem, cylinderInventoryService } from "../../services/cylinderInventoryService";

interface CylinderInventoryTableProps {
  inventory: CylinderInventoryItem[];
}

export function CylinderInventoryTable({ inventory }: CylinderInventoryTableProps) {
  return (
    <div className="border rounded-lg overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Cylinder Number</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Location</TableHead>
            <TableHead>Issued To</TableHead>
            <TableHead>Since Days</TableHead>
            <TableHead>Email</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {inventory.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                No records found
              </TableCell>
            </TableRow>
          ) : (
            inventory.map((item, index) => (
              <TableRow key={index}>
                <TableCell>{item.cylinder_number}</TableCell>
                <TableCell>
                  <Badge className={cylinderInventoryService.getStatusBadgeVariant(item.status)} variant="outline">
                    {item.status}
                  </Badge>
                </TableCell>
                <TableCell>{item.location}</TableCell>
                <TableCell>{item.issued_to}</TableCell>
                <TableCell>{item.since_days}</TableCell>
                <TableCell>
                  <Button
                    variant="ghost"
                    size="sm"
                    title={item.email}
                    onClick={() => window.location.href = `mailto:${item.email}`}
                    disabled={!item.issued_to}
                  >
                    <Mail className="w-4 h-4 text-blue-600" />
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