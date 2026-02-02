import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "../ui/dialog";
import { Button } from "../ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import { Printer } from "lucide-react";
import { getCurrentDateUS, isoToUSDate } from "../../utils/dateUtils";

interface CylinderDetails {
  id: number;
  company_id: number;
  contact_id: number;
  analysis_type: string;
  area: string;
  customer_owned_cylinder: boolean;
  cylinder_number: string;
  analysis_number: string;
  date: string;
  producer: string;
  sampled_by_natty: boolean;
  well_name: string;
  meter_number: string;
  flow_rate: string;
  pressure: string;
  temperature: string;
  field_h2s: string;
  cost_code: string;
  remarks: string;
  check_in_type: "Cylinder" | "Sample";
  check_in_time: string;
  rushed: boolean;
  tag_image: string;
  billing_reference_type: string;
  billing_reference_number: string;
  created_by: number;
}

interface WorkOrder {
  id: string;
  customer: string;
  date: string;
  well_name: string;
  meter_number: string;
  cylinders?: number;
}

interface WorkOrderReportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  workOrderNumber?: string;
  customerName?: string;
  customerCode?: string;
  cylinders?: CylinderDetails[];
  subtotal?: number;
  discountPercentage?: number;
  discountAmount?: number;
  totalAmount?: number;
  order?: WorkOrder | null;
  contactName?: string;
  contactEmail?: string;
  contactPhone?: string;
}

// Function to generate mock cylinders from work order
function generateMockCylinders(order: WorkOrder): CylinderDetails[] {
  const cylinderCount = order.cylinders || 3;
  const mockCylinders: CylinderDetails[] = [];

  for (let i = 0; i < cylinderCount; i++) {
    mockCylinders.push({
      id: i + 1,
      company_id: 1,
      contact_id: 1,
      analysis_type: "Gas Analysis",
      area: "North Field",
      customer_owned_cylinder: true,
      cylinder_number: `C${(i + 1).toString().padStart(3, "0")}`,
      analysis_number: `${order.id}-A${(i + 1).toString().padStart(3, "0")}`,
      date: isoToUSDate(order.date),
      producer: "Sample Producer",
      sampled_by_natty: true,
      well_name: order.well_name,
      meter_number: order.meter_number,
      flow_rate: "1000 MCFD",
      pressure: "1000 PSI",
      temperature: "60 F",
      field_h2s: "10 PPM",
      cost_code: "N/A",
      remarks: "N/A",
      check_in_type: "Cylinder",
      check_in_time: "10:00 AM",
      rushed: false,
      tag_image: "N/A",
      billing_reference_type: "N/A",
      billing_reference_number: "N/A",
      created_by: 1,
    });
  }

  return mockCylinders;
}

export function WorkOrderReportDialog({
  open,
  onOpenChange,
  workOrderNumber,
  customerName,
  customerCode,
  cylinders,
  order,
  contactName,
  contactEmail,
  contactPhone,
}: WorkOrderReportDialogProps) {
  // Use order data if provided, otherwise use individual props
  const resolvedWorkOrderNumber = order ? order.id : workOrderNumber || "";
  const customer = order ? order.customer : customerName || "N/A";
  const code = order ? "" : customerCode || "";
  const cylinderData = order ? generateMockCylinders(order) : cylinders || [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[98vw] max-w-[98vw] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Work Order Report</DialogTitle>
          <DialogDescription>
            Report details for the selected work order
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
              <p className="text-xl">{resolvedWorkOrderNumber}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Date</p>
              <p className="text-xl">{getCurrentDateUS()}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Customer</p>
              <p className="text-xl">{customer}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Customer Code</p>
              <p className="text-xl">{code}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Contact Name</p>
              <p className="text-xl">{contactName || "N/A"}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Contact Email</p>
              <p className="text-xl">{contactEmail || "N/A"}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Contact Phone</p>
              <p className="text-xl">{contactPhone || "N/A"}</p>
            </div>
          </div>

          {/* Samples Table */}
          <div className="mb-6">
            <h2 className="text-xl mb-3">Sample Details</h2>
            <div className="border rounded-lg overflow-x-hidden">
              <Table className="w-full table-fixed">
                <TableHeader>
                  <TableRow className="bg-gray-100">
                    <TableHead className="w-12">#</TableHead>
                    <TableHead className="w-40">Analysis #</TableHead>
                    <TableHead className="w-28">Cylinder #</TableHead>
                    <TableHead className="w-40">Type</TableHead>
                    <TableHead className="w-40">Producer</TableHead>
                    <TableHead>Well</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {cylinderData.map((cylinder, index) => (
                    <TableRow key={index}>
                      <TableCell className="text-sm">{index + 1}</TableCell>
                      <TableCell className="text-sm break-words">
                        {cylinder.analysis_number}
                      </TableCell>
                      <TableCell className="text-sm break-words">
                        {cylinder.cylinder_number}
                      </TableCell>
                      <TableCell className="text-sm break-words">
                        {cylinder.analysis_type}
                      </TableCell>
                      <TableCell className="text-sm break-words">
                        {cylinder.producer}
                      </TableCell>
                      <TableCell className="text-sm break-words">
                        {cylinder.well_name}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>

          {/* Additional Sample Information */}
          <div className="mb-6">
            <h2 className="text-xl mb-3">Detailed Sample Information</h2>
            {cylinderData.map((cylinder, index) => (
              <div key={index} className="mb-4 p-4 border rounded-lg">
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <p className="text-xs text-muted-foreground">Analysis #</p>
                    <p className="text-sm">{cylinder.analysis_number}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Cylinder #</p>
                    <p className="text-sm">{cylinder.cylinder_number}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Date</p>
                    <p className="text-sm">{cylinder.date}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">
                      Analysis Type
                    </p>
                    <p className="text-sm">{cylinder.analysis_type}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">
                      Check-In Type
                    </p>
                    <p className="text-sm">{cylinder.check_in_type}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">
                      Check-In Time
                    </p>
                    <p className="text-sm">{cylinder.check_in_time}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Rushed</p>
                    <p className="text-sm">{cylinder.rushed ? "Yes" : "No"}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Producer</p>
                    <p className="text-sm">{cylinder.producer || "N/A"}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Company</p>
                    <p className="text-sm">{customer}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">
                      Sampled by Natty
                    </p>
                    <p className="text-sm">
                      {cylinder.sampled_by_natty ? "Yes" : "No"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Area</p>
                    <p className="text-sm">{cylinder.area}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Well Name</p>
                    <p className="text-sm">{cylinder.well_name || "N/A"}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Meter #</p>
                    <p className="text-sm">{cylinder.meter_number || "N/A"}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">
                      Cylinder Owner
                    </p>
                    <p className="text-sm">
                      {cylinder.customer_owned_cylinder
                        ? "Customer"
                        : "Natty Gas Lab"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Flow Rate</p>
                    <p className="text-sm">
                      {cylinder.flow_rate
                        ? `${cylinder.flow_rate} MCFD`
                        : "N/A"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Pressure</p>
                    <p className="text-sm">
                      {cylinder.pressure ? `${cylinder.pressure} PSI` : "N/A"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Temperature</p>
                    <p className="text-sm">
                      {cylinder.temperature
                        ? `${cylinder.temperature} F`
                        : "N/A"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Field H2S</p>
                    <p className="text-sm">
                      {cylinder.field_h2s ? `${cylinder.field_h2s} PPM` : "N/A"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Cost Code</p>
                    <p className="text-sm">{cylinder.cost_code || "N/A"}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">
                      Billing Ref Type
                    </p>
                    <p className="text-sm">
                      {cylinder.billing_reference_type || "N/A"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">
                      Billing Ref #
                    </p>
                    <p className="text-sm">
                      {cylinder.billing_reference_number || "N/A"}
                    </p>
                  </div>
                  {cylinder.remarks && (
                    <div className="col-span-3">
                      <p className="text-xs text-muted-foreground">Remarks</p>
                      <p className="text-sm">{cylinder.remarks}</p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-end gap-2 mt-4 print:hidden">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
          <Button onClick={() => window.print()}>
            <Printer className="w-4 h-4 mr-2" />
            Print
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
