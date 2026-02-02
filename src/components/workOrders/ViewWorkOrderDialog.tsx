import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "../ui/dialog";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Separator } from "../ui/separator";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { Printer } from "lucide-react";
import { WorkOrderWithId, LineItem, workOrdersService } from "../../services/workOrdersService";
import { analysisPricingService } from "../../services/analysisPricingService";
import { isoToUSDate } from "../../utils/dateUtils";

interface ViewWorkOrderDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  order: WorkOrderWithId | null;
  lineItems: LineItem[];
  mileageFee: number;
  miscellaneousCharges: number;
  hourlyFee: number;
}

export function ViewWorkOrderDialog({
  open,
  onOpenChange,
  order,
  lineItems,
  mileageFee,
  miscellaneousCharges,
  hourlyFee,
}: ViewWorkOrderDialogProps) {
  if (!order) return null;

  const subtotal = lineItems.reduce((sum, item) => sum + item.rate, 0);
  const totalAmount = subtotal + mileageFee + miscellaneousCharges + hourlyFee;

  // Helper function to get full analysis description
  const getAnalysisDescription = (analysisCode: string): string => {
    const analysis = analysisPricingService.getAnalysisPriceByCode(analysisCode);
    return analysis ? `${analysis.analysis_code} - ${analysis.description}` : analysisCode;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-h-[90vh] overflow-y-auto p-4"
        style={{ width: "min(1400px, 96vw)", maxWidth: "96vw" }}
        aria-describedby={undefined}
      >
        <DialogHeader className="sr-only">
          <DialogTitle>Work Order Report</DialogTitle>
          <DialogDescription>
            View and print the complete work order report
          </DialogDescription>
        </DialogHeader>
        
        <div className="print:p-8" id="work-order-report">
          {/* Header */}
          <div className="text-center mb-6 pb-4 border-b-2 border-gray-800">
            <h1 className="text-3xl mb-2">Natty Gas Lab</h1>
          </div>

          {/* Work Order Info */}
          <div className="grid grid-cols-2 gap-4 mb-6 pb-4 border-b">
            <div>
              <p className="text-sm text-muted-foreground">Work Order Number</p>
              <p className="text-xl">{order.id}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Date</p>
              <p className="text-xl">{isoToUSDate(order.date)}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Customer</p>
              <p className="text-xl">{order.customer || "N/A"}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Status</p>
              <p className="text-xl">
                <Badge
                  className={workOrdersService.getStatusColor(order.status || "Pending")}
                  variant="outline"
                >
                  {order.status}
                </Badge>
              </p>
            </div>
          </div>

          {/* Samples Table */}
          <div className="mb-6">
            <h2 className="text-xl mb-3">Sample Details</h2>
            <div className="border rounded-lg w-full overflow-x-auto">
              <div className="min-w-[1100px]">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-100">
                      <TableHead>#</TableHead>
                      <TableHead>Bottle #</TableHead>
                      <TableHead>Analysis #</TableHead>
                      <TableHead>CC #</TableHead>
                      <TableHead>Analysis Type</TableHead>
                      <TableHead>Priority</TableHead>
                      <TableHead>Well Name</TableHead>
                      <TableHead>Meter #</TableHead>
                      <TableHead className="text-right">Rate</TableHead>
                      <TableHead className="text-right">Sample Fee</TableHead>
                      <TableHead className="text-right">H2 Pop Fee</TableHead>
                      <TableHead className="text-right">Spot Composite Fee</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {lineItems.map((item, index) => (
                      <TableRow key={item.id}>
                        <TableCell>{index + 1}</TableCell>
                        <TableCell className="text-sm">{item.bottle_number}</TableCell>
                        <TableCell className="text-sm">{item.analysis_number}</TableCell>
                        <TableCell className="text-sm">{item.cc_number}</TableCell>
                        <TableCell className="text-sm">{getAnalysisDescription(item.analysis_type)}</TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={
                              item.rushed
                                ? "bg-red-100 text-red-800"
                                : "bg-blue-100 text-blue-800"
                            }
                          >
                            {item.rushed ? "High" : "Normal"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm">{item.well_name}</TableCell>
                        <TableCell className="text-sm">{item.meter_number}</TableCell>
                        <TableCell className="text-right text-sm">
                          ${item.rate.toFixed(2)}
                        </TableCell>
                        <TableCell className="text-right text-sm">
                          ${item.sample_fee.toFixed(2)}
                        </TableCell>
                        <TableCell className="text-right text-sm">
                          ${item.h2_pop_fee.toFixed(2)}
                        </TableCell>
                        <TableCell className="text-right text-sm">
                          ${item.spot_composite_fee.toFixed(2)}
                        </TableCell>
                        <TableCell className="text-right text-sm">
                          ${item.amount.toFixed(2)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          </div>

          {/* Financial Summary */}
          <div className="border-t-2 border-gray-800 pt-4">
            <h2 className="text-xl mb-3">Financial Summary</h2>
            <div className="space-y-2 max-w-md ml-auto">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total Samples:</span>
                <span>{lineItems.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal:</span>
                <span>
                  ${subtotal.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Mileage Fee:</span>
                <span>${mileageFee.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Miscellaneous Charges:</span>
                <span>${miscellaneousCharges.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Hourly Fee:</span>
                <span>${hourlyFee.toFixed(2)}</span>
              </div>
              <Separator />
              <div className="flex justify-between text-lg">
                <span>Total Amount:</span>
                <span>
                  ${totalAmount.toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="print:hidden">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
          <Button onClick={() => window.print()}>
            <Printer className="w-4 h-4 mr-2" />
            Print
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}