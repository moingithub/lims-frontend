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
            <span>${Number(totals.subtotal || 0).toFixed(2)}</span>
          </div>
          {Number(totals.mileageFee) > 0 && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Mileage Fee:</span>
              <span>${Number(totals.mileageFee || 0).toFixed(2)}</span>
            </div>
          )}
          {Number(totals.miscellaneousCharges) > 0 && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">
                Miscellaneous Charges:
              </span>
              <span>
                ${Number(totals.miscellaneousCharges || 0).toFixed(2)}
              </span>
            </div>
          )}
          {Number(totals.hourlyFee) > 0 && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Hourly Fee:</span>
              <span>${Number(totals.hourlyFee || 0).toFixed(2)}</span>
            </div>
          )}
          <Separator />
          <div className="flex justify-between font-medium">
            <span>Total Amount:</span>
            <span className="text-blue-600">
              ${Number(totals.total || 0).toFixed(2)}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
