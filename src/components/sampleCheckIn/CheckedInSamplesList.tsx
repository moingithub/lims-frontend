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
import { Trash2 } from "lucide-react";
import { CheckedInSample } from "../../services/sampleCheckInService";

interface CheckedInSamplesListProps {
  samples: CheckedInSample[];
  onRemove: (index: number) => void;
}

export function CheckedInSamplesList({
  samples,
  onRemove,
}: CheckedInSamplesListProps) {
  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <h3 className="font-semibold">Checked-In Samples ({samples.length})</h3>
      </div>

      {samples.length === 0 ? (
        <div className="border rounded-lg p-8 text-center text-muted-foreground">
          No samples checked in yet
        </div>
      ) : (
        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Analysis #</TableHead>
                <TableHead>Well Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Rushed</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {samples.map((sample, index) => (
                <TableRow key={index}>
                  <TableCell>
                    <Badge variant="outline">{sample.analysis_number}</Badge>
                  </TableCell>
                  <TableCell>{sample.well_name}</TableCell>
                  <TableCell>{sample.analysis_type}</TableCell>
                  <TableCell>
                    {sample.rushed ? (
                      <Badge className="bg-orange-100 text-orange-800">
                        Rushed
                      </Badge>
                    ) : (
                      <Badge className="bg-gray-100 text-gray-800">
                        Standard
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onRemove(index)}
                      title="Remove"
                    >
                      <Trash2 className="w-4 h-4 text-red-600" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
