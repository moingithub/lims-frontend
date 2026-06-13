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
  check_in_type: "Cylinder" | "Bottle" | "CP Cylinder";
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

  const handlePrint = () => {
    const reportEl = document.getElementById("work-order-report");
    if (!reportEl) {
      window.print();
      return;
    }

    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      window.print();
      return;
    }

    const printStyles = `
      @page { size: A4 portrait; margin: 12mm 14mm; }
      * { box-sizing: border-box; }
      body {
        margin: 0;
        padding: 0;
        font-family: Arial, Helvetica, sans-serif;
        font-size: 9pt;
        line-height: 1.4;
        color: #1a1a1a;
      }
      h1 { margin: 0 0 4px; font-size: 18pt; color: #2563eb; }
      h2 { margin: 0 0 8px; font-size: 11pt; color: #2563eb; }
      p { margin: 0; }
      .mb-6 { margin-bottom: 14px; }
      .mb-4 { margin-bottom: 10px; }
      .mb-3 { margin-bottom: 8px; }
      .mb-2 { margin-bottom: 6px; }
      .mb-1 { margin-bottom: 4px; }
      .p-5 { padding: 12px; }
      .p-4 { padding: 10px; }
      .px-6 { padding-left: 12px; padding-right: 12px; }
      .py-5 { padding-top: 12px; padding-bottom: 12px; }
      .px-3 { padding-left: 8px; padding-right: 8px; }
      .py-2 { padding-top: 6px; padding-bottom: 6px; }
      .text-center { text-align: center; }
      .text-3xl { font-size: 18pt; }
      .text-lg { font-size: 10pt; }
      .text-sm { font-size: 8.5pt; }
      .text-xs { font-size: 7.5pt; }
      .font-semibold { font-weight: 600; }
      .uppercase { text-transform: uppercase; }
      .tracking-wide { letter-spacing: 0.05em; }
      .text-blue-600 { color: #2563eb; }
      .text-muted-foreground { color: #666; }
      .bg-blue-50 { background: #eff6ff; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
      .bg-blue-100 { background: #dbeafe; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
      .bg-white { background: #fff; }
      .border { border: 1px solid #e5e7eb; }
      .rounded-lg { border-radius: 4px; }
      .rounded-md { border-radius: 3px; }
      .shadow-sm { box-shadow: none; }
      .grid { display: grid; gap: 8px; }
      .grid-cols-1 { grid-template-columns: 1fr; }
      .grid-cols-3 { grid-template-columns: repeat(3, 1fr); }
      .gap-3 { gap: 6px; }
      .gap-4 { gap: 8px; }
      .break-all { word-break: break-all; }
      .break-words { word-break: break-word; }
      .col-span-3 { grid-column: 1 / -1; }
      table { width: 100%; border-collapse: collapse; font-size: 8pt; table-layout: fixed; }
      th, td { border: 1px solid #d1d5db; padding: 4px 6px; vertical-align: top; word-break: break-word; }
      thead tr { background: #dbeafe; }
      th { color: #2563eb; font-weight: 700; }
      .overflow-x-auto { overflow: visible; }
      .sample-card { break-inside: avoid; page-break-inside: avoid; margin-bottom: 10px; }
    `;

    printWindow.document.open();
    printWindow.document.write(`<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8" />
    <title>Work Order Report - ${resolvedWorkOrderNumber}</title>
    <style>${printStyles}</style>
  </head>
  <body>${reportEl.innerHTML}</body>
</html>`);
    printWindow.document.close();

    const runPrint = () => {
      printWindow.focus();
      printWindow.print();
      printWindow.onafterprint = () => printWindow.close();
    };

    if (printWindow.document.readyState === "complete") {
      runPrint();
    } else {
      printWindow.onload = runPrint;
    }
  };

  return (
    <>
      <style>{`
        @media print {
          @page {
            size: A4 portrait;
            margin: 12mm 14mm;
          }
          html,
          body {
            height: auto !important;
            overflow: visible !important;
            background: #fff !important;
          }
          body * {
            visibility: hidden;
          }
          [role="dialog"],
          [role="dialog"] *,
          #work-order-report,
          #work-order-report * {
            visibility: visible;
          }
          [data-radix-dialog-overlay],
          .print\\:hidden {
            display: none !important;
            visibility: hidden !important;
          }
          [role="dialog"] {
            position: static !important;
            transform: none !important;
            overflow: visible !important;
            max-height: none !important;
            height: auto !important;
            width: 100% !important;
            max-width: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
            border: none !important;
            box-shadow: none !important;
            background: #fff !important;
            display: block !important;
          }
          [role="dialog"] > button {
            display: none !important;
            visibility: hidden !important;
          }
          [role="dialog"] .overflow-y-auto,
          [role="dialog"] .overflow-x-hidden,
          [role="dialog"] .overflow-hidden {
            overflow: visible !important;
            max-height: none !important;
            height: auto !important;
            flex: none !important;
          }
          #work-order-report {
            position: absolute;
            left: 0;
            top: 0;
            overflow: visible !important;
            width: 100% !important;
            max-width: 100% !important;
            padding: 0 !important;
            font-family: Arial, Helvetica, sans-serif;
            font-size: 9pt;
            line-height: 1.4;
            color: #1a1a1a;
          }
          #work-order-report .overflow-x-auto {
            overflow: visible !important;
          }
          #work-order-report table {
            width: 100% !important;
            min-width: 0 !important;
            table-layout: fixed;
            border-collapse: collapse;
            font-size: 8pt;
          }
          #work-order-report th,
          #work-order-report td {
            border: 1px solid #d1d5db;
            padding: 4px 6px;
            word-break: break-word;
          }
          #work-order-report .shadow-sm {
            box-shadow: none !important;
          }
          #work-order-report .mb-4.rounded-lg {
            break-inside: avoid;
            page-break-inside: avoid;
          }
          #work-order-report h1 {
            font-size: 18pt;
          }
          #work-order-report h2 {
            font-size: 11pt;
          }
          #work-order-report .text-lg {
            font-size: 10pt;
          }
          #work-order-report .text-3xl {
            font-size: 18pt;
          }
          #work-order-report .bg-blue-50,
          #work-order-report .bg-blue-100 {
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
        }
      `}</style>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent
          className="flex max-h-[90vh] flex-col gap-0 overflow-hidden p-0 sm:max-w-[96vw]"
          style={{ width: "min(1200px, 96vw)", maxWidth: "96vw" }}
        >
          <div className="shrink-0 border-b bg-blue-50 px-6 py-4 print:hidden">
          <DialogHeader className="text-left">
            <DialogTitle className="text-blue-600">
              Work Order Report
            </DialogTitle>
            <DialogDescription>
              Report details for the selected work order
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden px-6 py-4">
          <div className="print:p-8" id="work-order-report">
            {/* Header */}
            <div className="mb-6 rounded-lg border bg-white px-6 py-5 text-center shadow-sm">
              <h1 className="mb-1 text-3xl font-semibold text-blue-600">
                Natty Gas Lab
              </h1>
              <p className="text-sm text-muted-foreground">
                Laboratory Sample Work Order Report
              </p>
            </div>

            {/* Work Order Info */}
            <div className="mb-6 rounded-lg border bg-blue-50 p-5 shadow-sm">
              <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-blue-600">
                Work Order Information
              </h2>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <div className="rounded-md border bg-white px-3 py-2">
                  <p className="text-xs font-medium text-muted-foreground">
                    Work Order Number
                  </p>
                  <p className="text-lg font-semibold text-blue-600">
                    {resolvedWorkOrderNumber}
                  </p>
                </div>
                <div className="rounded-md border bg-white px-3 py-2">
                  <p className="text-xs font-medium text-muted-foreground">
                    Date
                  </p>
                  <p className="text-lg font-semibold">{getCurrentDateUS()}</p>
                </div>
                <div className="rounded-md border bg-white px-3 py-2">
                  <p className="text-xs font-medium text-muted-foreground">
                    Customer
                  </p>
                  <p className="text-lg font-semibold">{customer}</p>
                </div>
                <div className="rounded-md border bg-white px-3 py-2">
                  <p className="text-xs font-medium text-muted-foreground">
                    Customer Code
                  </p>
                  <p className="text-lg font-semibold">{code || "N/A"}</p>
                </div>
                <div className="rounded-md border bg-white px-3 py-2">
                  <p className="text-xs font-medium text-muted-foreground">
                    Contact Name
                  </p>
                  <p className="text-lg font-semibold">
                    {contactName || "N/A"}
                  </p>
                </div>
                <div className="rounded-md border bg-white px-3 py-2">
                  <p className="text-xs font-medium text-muted-foreground">
                    Contact Email
                  </p>
                  <p className="text-lg font-semibold break-all">
                    {contactEmail || "N/A"}
                  </p>
                </div>
                <div className="rounded-md border bg-white px-3 py-2 sm:col-span-2 lg:col-span-1">
                  <p className="text-xs font-medium text-muted-foreground">
                    Contact Phone
                  </p>
                  <p className="text-lg font-semibold">
                    {contactPhone || "N/A"}
                  </p>
                </div>
              </div>
            </div>

            {/* Samples Table */}
            <div className="mb-6">
              <h2 className="mb-3 text-lg font-semibold text-blue-600">
                Sample Details
              </h2>
              <div className="overflow-x-auto rounded-lg border shadow-sm">
                <Table className="w-full min-w-[640px]">
                  <TableHeader>
                    <TableRow className="bg-blue-100">
                      <TableHead className="w-12 text-blue-600">#</TableHead>
                      <TableHead className="text-blue-600">
                        Analysis #
                      </TableHead>
                      <TableHead className="text-blue-600">
                        Cylinder #
                      </TableHead>
                      <TableHead className="text-blue-600">Type</TableHead>
                      <TableHead className="text-blue-600">
                        Producer
                      </TableHead>
                      <TableHead className="text-blue-600">Well</TableHead>
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
            <div className="mb-2">
              <h2 className="mb-3 text-lg font-semibold text-blue-600">
                Detailed Sample Information
              </h2>
              {cylinderData.map((cylinder, index) => (
                <div
                  key={index}
                  className={`sample-card mb-4 rounded-lg border p-4 shadow-sm ${
                    index % 2 === 0 ? "bg-white" : "bg-blue-50"
                  }`}
                >
                  <p className="mb-3 text-sm font-semibold text-blue-600">
                    Sample {index + 1}
                  </p>
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <p className="text-xs text-muted-foreground">
                        Analysis #
                      </p>
                      <p className="text-sm">{cylinder.analysis_number}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">
                        Cylinder #
                      </p>
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
                      <p className="text-sm">
                        {cylinder.rushed ? "Yes" : "No"}
                      </p>
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
                      <p className="text-sm">
                        {cylinder.meter_number || "N/A"}
                      </p>
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
                      <p className="text-xs text-muted-foreground">
                        Temperature
                      </p>
                      <p className="text-sm">
                        {cylinder.temperature
                          ? `${cylinder.temperature} F`
                          : "N/A"}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Field H2S</p>
                      <p className="text-sm">
                        {cylinder.field_h2s
                          ? `${cylinder.field_h2s} PPM`
                          : "N/A"}
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
        </div>

        <div className="flex shrink-0 justify-end gap-2 border-t bg-muted/30 px-6 py-4 print:hidden">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
          <Button onClick={handlePrint}>
            <Printer className="w-4 h-4 mr-2" />
            Print
          </Button>
        </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
