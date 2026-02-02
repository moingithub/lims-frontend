import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "../ui/dialog";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { Checkbox } from "../ui/checkbox";
import { Save } from "lucide-react";
import { LineItem, WorkOrderWithId } from "../../services/workOrdersService";
import { analysisPricingService } from "../../services/analysisPricingService";

interface EditLineItemsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  order: WorkOrderWithId | null;
  lineItems: LineItem[];
  mileageFee: number;
  miscellaneousCharges: number;
  hourlyFee: number;
  onLineItemChange: (
    id: string,
    field: keyof LineItem,
    value: string | number | boolean
  ) => void;
  onMileageFeeChange: (value: number) => void;
  onMiscellaneousChargesChange: (value: number) => void;
  onHourlyFeeChange: (value: number) => void;
  onSave: () => void;
}

export function EditLineItemsDialog({
  open,
  onOpenChange,
  order,
  lineItems,
  mileageFee,
  miscellaneousCharges,
  hourlyFee,
  onLineItemChange,
  onMileageFeeChange,
  onMiscellaneousChargesChange,
  onHourlyFeeChange,
  onSave,
}: EditLineItemsDialogProps) {
  if (!order) return null;

  // Load active analysis types from Analysis Pricing service
  const analysisOptions = analysisPricingService.getActiveAnalysisOptions();

  const subtotal = lineItems.reduce((sum, item) => sum + item.rate, 0);
  const totalOrderAmount = subtotal + mileageFee + miscellaneousCharges + hourlyFee;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-h-[90vh] overflow-y-auto p-4"
        style={{ width: "min(1400px, 96vw)", maxWidth: "96vw" }}
        aria-describedby={undefined}
      >
        <DialogHeader className="sr-only">
          <DialogTitle>Edit Work Order - {order.id}</DialogTitle>
          <DialogDescription>
            Edit work order details
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="grid grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
            <div>
              <Label className="text-sm text-muted-foreground">Work Order</Label>
              <p>{order.id}</p>
            </div>
            <div>
              <Label className="text-sm text-muted-foreground">Company</Label>
              <p>{order.customer}</p>
            </div>
            <div>
              <Label className="text-sm text-muted-foreground">Order Date</Label>
              <p>{order.date}</p>
            </div>
          </div>

          {/* horizontal scroll ONLY inside this container so dialog does not cause page scroll */}
          <div className="border rounded-lg w-full overflow-x-auto">
            <div className="min-w-[1100px]">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[150px]">Cylinder #</TableHead>
                    <TableHead className="w-[120px]">Analysis #</TableHead>
                    <TableHead className="w-[120px]">CC #</TableHead>
                    <TableHead className="w-[200px]">Analysis Type</TableHead>
                    <TableHead className="w-[100px]">Rushed</TableHead>
                    <TableHead className="w-[120px]">Standard Rate</TableHead>
                    <TableHead className="w-[120px]">Sample Fee</TableHead>
                    <TableHead className="w-[120px]">H2 Pop Fee</TableHead>
                    <TableHead className="w-[120px]">Spot Composite Fee</TableHead>
                    <TableHead className="w-[120px]">Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {lineItems.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>
                        <Input
                          value={item.cylinder_number}
                          onChange={(e) =>
                            onLineItemChange(item.id.toString(), "cylinder_number", e.target.value)
                          }
                          className="h-9"
                          readOnly
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          value={item.analysis_number}
                          onChange={(e) =>
                            onLineItemChange(item.id.toString(), "analysis_number", e.target.value)
                          }
                          className="h-9"
                          readOnly
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          value={item.cc_number}
                          onChange={(e) =>
                            onLineItemChange(item.id.toString(), "cc_number", e.target.value)
                          }
                          className="h-9"
                        />
                      </TableCell>
                      <TableCell>
                        <Select
                          value={item.analysis_type}
                          onValueChange={(value) =>
                            onLineItemChange(item.id.toString(), "analysis_type", value)
                          }
                        >
                          <SelectTrigger className="h-9">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {analysisOptions.map((option) => (
                              <SelectItem key={option.value} value={option.value}>
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center justify-center">
                          <Checkbox
                            checked={item.rushed}
                            onCheckedChange={(checked) =>
                              onLineItemChange(item.id.toString(), "rushed", checked === true)
                            }
                          />
                        </div>
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          value={item.rate || ""}
                          onChange={(e) =>
                            onLineItemChange(
                              item.id.toString(),
                              "rate",
                              parseFloat(e.target.value) || 0
                            )
                          }
                          className="h-9"
                          step="0.01"
                          placeholder="0.00"
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          value={item.sample_fee}
                          onChange={(e) =>
                            onLineItemChange(
                              item.id.toString(),
                              "sample_fee",
                              parseFloat(e.target.value) || 0
                            )
                          }
                          className="h-9"
                          step="0.01"
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          value={item.h2_pop_fee}
                          onChange={(e) =>
                            onLineItemChange(
                              item.id.toString(),
                              "h2_pop_fee",
                              parseFloat(e.target.value) || 0
                            )
                          }
                          className="h-9"
                          step="0.01"
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          value={item.spot_composite_fee}
                          onChange={(e) =>
                            onLineItemChange(
                              item.id.toString(),
                              "spot_composite_fee",
                              parseFloat(e.target.value) || 0
                            )
                          }
                          className="h-9"
                          step="0.01"
                        />
                      </TableCell>
                      <TableCell>
                        <div className="px-3 py-2 bg-gray-50 rounded">
                          ${item.amount.toFixed(2)}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t">
            <div className="space-y-2 min-w-64">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Subtotal:</span>
                <span>
                  ${subtotal.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <Label className="text-muted-foreground">Mileage Fee:</Label>
                <Input
                  type="number"
                  value={mileageFee}
                  onChange={(e) => onMileageFeeChange(parseFloat(e.target.value) || 0)}
                  className="w-32 h-9"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                />
              </div>
              <div className="flex justify-between items-center">
                <Label className="text-muted-foreground">Miscellaneous Charges:</Label>
                <Input
                  type="number"
                  value={miscellaneousCharges}
                  onChange={(e) =>
                    onMiscellaneousChargesChange(parseFloat(e.target.value) || 0)
                  }
                  className="w-32 h-9"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                />
              </div>
              <div className="flex justify-between items-center">
                <Label className="text-muted-foreground">Hourly Fee:</Label>
                <Input
                  type="number"
                  value={hourlyFee}
                  onChange={(e) => onHourlyFeeChange(parseFloat(e.target.value) || 0)}
                  className="w-32 h-9"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                />
              </div>
              <div className="flex justify-between items-center pt-2 border-t">
                <span className="font-semibold">Total Order Amount:</span>
                <span className="font-semibold text-lg">
                  ${totalOrderAmount.toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={onSave}>
            <Save className="w-4 h-4 mr-2" />
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}