import { Card, CardContent } from "../ui/card";
import { Separator } from "../ui/separator";
import { InvoiceTotals } from "../../types/generateInvoices";

interface InvoiceSummaryProps {
  selectedOrdersCount: number;
  totals: InvoiceTotals;
}

export function InvoiceSummary({
  selectedOrdersCount,
  totals,
}: InvoiceSummaryProps) {
  if (selectedOrdersCount === 0) {
    return null;
  }

  return (
    <Card className="bg-blue-50">
      <CardContent className="pt-6">
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Selected Orders:</span>
            <span>{selectedOrdersCount}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Lines Subtotal:</span>
            <span>${totals.subtotal.toFixed(2)}</span>
          </div>
          {totals.additionalFees && totals.additionalFees > 0 && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Additional Fees:</span>
              <span>${totals.additionalFees.toFixed(2)}</span>
            </div>
          )}
          <Separator />
          <div className="flex justify-between font-medium">
            <span>Total Amount:</span>
            <span className="text-blue-600">${totals.total.toFixed(2)}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}