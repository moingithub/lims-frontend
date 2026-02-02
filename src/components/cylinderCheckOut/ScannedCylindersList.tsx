import { Button } from "../ui/button";
import { Label } from "../ui/label";
import { Printer, Trash2 } from "lucide-react";
import { Cylinder } from "../../services/cylinderCheckOutService";

interface ScannedCylindersListProps {
  cylinders: Cylinder[];
  onRemove: (index: number) => void;
  onPrint: (cylinder: Cylinder) => void;
}

export function ScannedCylindersList({ cylinders, onRemove, onPrint }: ScannedCylindersListProps) {
  return (
    <div className="space-y-2">
      <Label>Scanned Cylinders ({cylinders.length})</Label>
      <div className="border rounded-lg divide-y max-h-96 overflow-y-auto">
        {cylinders.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">
            No cylinders scanned yet
          </div>
        ) : (
          cylinders.map((cylinder, index) => (
            <div
              key={index}
              className="p-3 flex items-center justify-between hover:bg-muted/50"
            >
              <div className="flex-1">
                <p className="text-sm">{cylinder.barcode}</p>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onPrint(cylinder)}
                >
                  <Printer className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onRemove(index)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}