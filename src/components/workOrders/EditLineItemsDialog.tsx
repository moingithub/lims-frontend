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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import { Checkbox } from "../ui/checkbox";
import { Save } from "lucide-react";
import { LineItem, WorkOrderWithId } from "../../services/workOrdersService";
import { analysisPricingService } from "../../services/analysisPricingService";
import { DecimalInput } from "./DecimalInput";
import { isoToUSDate } from "../../utils/dateUtils";

interface EditLineItemsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  order: WorkOrderWithId | null;
  lineItems: LineItem[];
  miles: number;
  ratePerMile: number;
  mileageFee: number;
  miscellaneousCharges: number;
  hourlyFee: number;
  onLineItemChange: (
    id: string,
    field: keyof LineItem,
    value: string | number | boolean,
  ) => void;
  onMilesChange: (value: number) => void;
  onRatePerMileChange: (value: number) => void;
  onMiscellaneousChargesChange: (value: number) => void;
  onHourlyFeeChange: (value: number) => void;
  onSave: () => void;
}

export function EditLineItemsDialog({
  open,
  onOpenChange,
  order,
  lineItems,
  miles,
  ratePerMile,
  mileageFee,
  miscellaneousCharges,
  hourlyFee,
  onLineItemChange,
  onMilesChange,
  onRatePerMileChange,
  onMiscellaneousChargesChange,
  onHourlyFeeChange,
  onSave,
}: EditLineItemsDialogProps) {
  if (!order) return null;

  // Load active analysis types from Analysis Pricing service
  const analysisOptions = analysisPricingService.getActiveAnalysisOptions();

  const subtotal = lineItems.reduce((sum, item) => sum + (item.amount || 0), 0);
  const totalOrderAmount =
    subtotal + mileageFee + miscellaneousCharges + hourlyFee;

  const formatOrderDate = (date: string): string => {
    if (!date?.trim()) return "N/A";
    const trimmed = date.trim();
    if (/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(trimmed)) {
      return trimmed;
    }
    return isoToUSDate(trimmed) || trimmed;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-h-[90vh] overflow-y-auto p-4"
        style={{ width: "min(1400px, 96vw)", maxWidth: "96vw" }}
        aria-describedby={undefined}
      >
        <DialogHeader className="sr-only">
          <DialogTitle>Edit Work Order - {order.id}</DialogTitle>
          <DialogDescription>Edit work order details</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="grid grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
            <div>
              <Label className="text-sm text-muted-foreground">
                Work Order
              </Label>
              <p>{order.id}</p>
            </div>
            <div>
              <Label className="text-sm text-muted-foreground">Company</Label>
              <p>{order.customer}</p>
            </div>
            <div>
              <Label className="text-sm text-muted-foreground">
                Order Date
              </Label>
              <p>{formatOrderDate(order.date)}</p>
            </div>
          </div>

          {/* horizontal scroll ONLY inside this container so dialog does not cause page scroll */}
          <div className="border rounded-lg w-full overflow-x-auto">
            <div className="min-w-[980px]">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[150px]">Area</TableHead>
                    <TableHead className="w-[120px]">Analysis #</TableHead>
                    <TableHead className="w-[200px]">Analysis Type</TableHead>
                    <TableHead className="w-[120px] text-right">
                      Standard Rate
                    </TableHead>
                    <TableHead className="w-[100px]">Rushed</TableHead>
                    <TableHead className="w-[120px] text-right">
                      Applied Rate
                    </TableHead>
                    <TableHead className="w-[120px] text-right">
                      Sample Fee
                    </TableHead>
                    <TableHead className="w-[120px] text-right">
                      H2 Pop Fee
                    </TableHead>
                    <TableHead className="w-[120px] text-right">
                      Composite Fee
                    </TableHead>
                    <TableHead className="w-[120px] text-right">
                      Amount
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {lineItems.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>
                        <Input
                          value={
                            item.area && item.area.trim() !== ""
                              ? item.area
                              : "—"
                          }
                          className="h-9"
                          readOnly
                          disabled
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          value={item.analysis_number}
                          className="h-9"
                          readOnly
                          disabled
                        />
                      </TableCell>
                      <TableCell>
                        <Select
                          value={item.analysis_type}
                          onValueChange={(value: string) =>
                            onLineItemChange(
                              item.id.toString(),
                              "analysis_type",
                              value,
                            )
                          }
                        >
                          <SelectTrigger className="h-9">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {analysisOptions.map((option) => (
                              <SelectItem
                                key={option.value}
                                value={option.value}
                              >
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </TableCell>
                      {/* Standard Rate column (display only, fetched from analysisPricingService) */}
                      <TableCell className="text-right">
                        <Input
                          type="number"
                          value={
                            analysisPricingService.getAnalysisPriceByCode(
                              item.analysis_type,
                            )?.standard_rate ?? 0
                          }
                          readOnly
                          disabled
                          className="h-9 text-right"
                          step="0.01"
                          placeholder="0.00"
                        />
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center justify-center">
                          <Checkbox
                            checked={item.rushed}
                            onCheckedChange={(
                              checked: boolean | "indeterminate",
                            ) =>
                              onLineItemChange(
                                item.id.toString(),
                                "rushed",
                                checked === true,
                              )
                            }
                          />
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <DecimalInput
                          value={item.applied_rate}
                          onChange={(value) =>
                            onLineItemChange(
                              item.id.toString(),
                              "applied_rate",
                              value,
                            )
                          }
                          className="h-9 text-right"
                          placeholder="0.00"
                        />
                      </TableCell>
                      <TableCell className="text-right">
                        <DecimalInput
                          value={item.sample_fee}
                          onChange={(value) =>
                            onLineItemChange(
                              item.id.toString(),
                              "sample_fee",
                              value,
                            )
                          }
                          className="h-9 text-right"
                          placeholder="0.00"
                        />
                      </TableCell>
                      <TableCell className="text-right">
                        <DecimalInput
                          value={item.h2_pop_fee}
                          onChange={(value) =>
                            onLineItemChange(
                              item.id.toString(),
                              "h2_pop_fee",
                              value,
                            )
                          }
                          className="h-9 text-right"
                          placeholder="0.00"
                        />
                      </TableCell>
                      <TableCell className="text-right">
                        <DecimalInput
                          value={item.spot_composite_fee}
                          disabled={
                            (item.sample_type || "").toLowerCase() === "spot" ||
                            item.customer_cylinder === true
                          }
                          onChange={(value) =>
                            onLineItemChange(
                              item.id.toString(),
                              "spot_composite_fee",
                              value,
                            )
                          }
                          className="h-9 text-right"
                          placeholder="0.00"
                        />
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="px-3 py-2 bg-gray-50 rounded inline-block">
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
                <span className="text-muted-foreground font-bold">
                  Subtotal:
                </span>
                <span className="font-bold text-right w-32 block">
                  ${subtotal.toFixed(2)}
                </span>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <Label className="text-muted-foreground whitespace-nowrap">
                  Miles:
                </Label>
                <DecimalInput
                  value={miles}
                  onChange={onMilesChange}
                  className="w-20 h-9 text-right"
                  placeholder="0"
                  integer
                />
                <Label className="text-muted-foreground whitespace-nowrap">
                  Rate/Mile:
                </Label>
                <DecimalInput
                  value={ratePerMile}
                  onChange={onRatePerMileChange}
                  className="w-20 h-9 text-right"
                  placeholder="0.00"
                />
                <Label className="text-muted-foreground whitespace-nowrap">
                  Mileage Fee:
                </Label>
                <Input
                  type="number"
                  value={mileageFee.toFixed(2)}
                  readOnly
                  disabled
                  className="w-24 h-9 text-right bg-gray-50"
                  placeholder="0.00"
                />
              </div>
              <div className="flex justify-between items-center">
                <Label className="text-muted-foreground">
                  Miscellaneous Charges:
                </Label>
                <DecimalInput
                  value={miscellaneousCharges}
                  onChange={onMiscellaneousChargesChange}
                  className="w-32 h-9 text-right"
                  placeholder="0.00"
                />
              </div>
              <div className="flex justify-between items-center">
                <Label className="text-muted-foreground">Hourly Fee:</Label>
                <DecimalInput
                  value={hourlyFee}
                  onChange={onHourlyFeeChange}
                  className="w-32 h-9 text-right"
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
