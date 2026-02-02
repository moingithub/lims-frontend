import { Label } from "../ui/label";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import { Trash2, Image } from "lucide-react";

interface CheckedInCylinder {
  analysis_number: string;
  cylinder_number: string;
  analysis_type: string;
  rushed: boolean;
  check_in_time: string;
  tag_image: string;
}

interface CheckedInCylindersTableProps {
  cylinders: CheckedInCylinder[];
  onRemove: (index: number) => void;
  onViewImage: (imageUrl: string) => void;
}

export function CheckedInCylindersTable({
  cylinders,
  onRemove,
  onViewImage,
}: CheckedInCylindersTableProps) {
  return (
    <div className="space-y-2">
      <Label>Checked-In Cylinders ({cylinders.length})</Label>
      <div className="border rounded-lg overflow-hidden">
        {cylinders.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">
            No cylinders checked in yet
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Analysis#</TableHead>
                  <TableHead>Cylinder #</TableHead>
                  <TableHead>Analysis Type</TableHead>
                  <TableHead>Rushed</TableHead>
                  <TableHead>Check-In Time</TableHead>
                  <TableHead className="text-center">Tag Image</TableHead>
                  <TableHead className="text-center">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {cylinders.map((cylinder, index) => (
                  <TableRow key={index}>
                    <TableCell>{cylinder.analysis_number}</TableCell>
                    <TableCell>{cylinder.cylinder_number}</TableCell>
                    <TableCell>{cylinder.analysis_type}</TableCell>
                    <TableCell>
                      {cylinder.rushed ? (
                        <Badge className="bg-red-100 text-red-800">
                          Rushed
                        </Badge>
                      ) : (
                        <Badge variant="outline">Standard</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-xs">
                      {cylinder.check_in_time}
                    </TableCell>
                    <TableCell className="text-center">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onViewImage(cylinder.tag_image)}
                      >
                        <Image className="w-4 h-4 text-blue-600" />
                      </Button>
                    </TableCell>
                    <TableCell className="text-center">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onRemove(index)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </div>
  );
}
