import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { Button } from "../ui/button";
import { Edit, Trash2 } from "lucide-react";
import { Cylinder } from "../../services/cylinderMasterService";
import { ActiveBadge } from "../shared/ActiveBadge";

interface CylinderMasterTableProps {
  cylinders: Cylinder[];
  onEdit: (cylinder: Cylinder) => void;
  onDelete: (cylinder: Cylinder) => void;
}

export function CylinderMasterTable({ cylinders, onEdit, onDelete }: CylinderMasterTableProps) {
  return (
    <div className="border rounded-lg overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Cylinder Number</TableHead>
            <TableHead>Cylinder Type</TableHead>
            <TableHead>Track Inventory</TableHead>
            <TableHead>Location</TableHead>
            <TableHead>Active</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {cylinders.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                No records found
              </TableCell>
            </TableRow>
          ) : (
            cylinders.map((cylinder) => (
              <TableRow key={cylinder.cylinder_number}>
                <TableCell>{cylinder.cylinder_number}</TableCell>
                <TableCell>{cylinder.cylinder_type}</TableCell>
                <TableCell>{cylinder.track_inventory}</TableCell>
                <TableCell>{cylinder.location}</TableCell>
                <TableCell>
                  <ActiveBadge active={cylinder.active} />
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex gap-1 justify-end">
                    <Button variant="ghost" size="sm" onClick={() => onEdit(cylinder)}>
                      <Edit className="w-4 h-4 text-green-600" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => onDelete(cylinder)}>
                      <Trash2 className="w-4 h-4 text-red-600" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}