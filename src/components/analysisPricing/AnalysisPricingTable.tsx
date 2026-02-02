import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { Button } from "../ui/button";
import { Edit, Trash2 } from "lucide-react";
import { AnalysisPrice, analysisPricingService } from "../../services/analysisPricingService";

interface AnalysisPricingTableProps {
  analysisPrices: AnalysisPrice[];
  onEdit: (analysisPrice: AnalysisPrice) => void;
  onDelete: (analysisPrice: AnalysisPrice) => void;
}

export function AnalysisPricingTable({ analysisPrices, onEdit, onDelete }: AnalysisPricingTableProps) {
  return (
    <div className="border rounded-lg overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Analysis Type</TableHead>
            <TableHead>Description</TableHead>
            <TableHead className="text-right">Standard Rate</TableHead>
            <TableHead className="text-right">Rushed (50%)</TableHead>
            <TableHead className="text-right">Sample Fee</TableHead>
            <TableHead>Active</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {analysisPrices.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                No records found
              </TableCell>
            </TableRow>
          ) : (
            analysisPrices.map((price) => (
              <TableRow key={price.id}>
                <TableCell>{price.analysis_code}</TableCell>
                <TableCell>{price.description}</TableCell>
                <TableCell className="text-right">
                  {analysisPricingService.formatCurrency(price.standard_rate)}
                </TableCell>
                <TableCell className="text-right">
                  {analysisPricingService.formatCurrency(price.rushed_rate)}
                </TableCell>
                <TableCell className="text-right">
                  {price.sample_fee ? analysisPricingService.formatCurrency(price.sample_fee) : "-"}
                </TableCell>
                <TableCell>
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs ${
                      price.active
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {price.active ? "True" : "False"}
                  </span>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex gap-1 justify-end">
                    <Button variant="ghost" size="sm" onClick={() => onEdit(price)}>
                      <Edit className="w-4 h-4 text-green-600" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => onDelete(price)}>
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