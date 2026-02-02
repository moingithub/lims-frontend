import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { FileDown } from "lucide-react";
import { toast } from "sonner";
import { pendingOrdersService, PendingOrder } from "../services/pendingOrdersService";
import { SearchBar } from "../components/shared/SearchBar";
import { PendingOrdersTable } from "../components/pendingOrders/PendingOrdersTable";
import { PendingOrdersFilters } from "../components/pendingOrders/PendingOrdersFilters";
import { WorkOrderReportDialog } from "../components/sampleCheckIn/WorkOrderReportDialog";

export function PendingOrders() {
  const [searchTerm, setSearchTerm] = useState("");
  const [customerFilter, setCustomerFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [isPrintDialogOpen, setIsPrintDialogOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<PendingOrder | null>(null);

  const pendingData = pendingOrdersService.getPendingOrders();
  const customers = pendingOrdersService.getUniqueCustomers(pendingData);
  const priorities = pendingOrdersService.getUniquePriorities(pendingData);

  // Apply filters
  let filteredData = pendingOrdersService.searchOrders(pendingData, searchTerm);
  filteredData = pendingOrdersService.filterByCustomer(filteredData, customerFilter);
  filteredData = pendingOrdersService.filterByPriority(filteredData, priorityFilter);

  const handleExport = () => {
    const csvContent = pendingOrdersService.exportToCSV(filteredData);
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `pending_orders_${new Date().toISOString().split("T")[0]}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Pending work orders exported successfully");
  };

  const handlePrintOrder = (order: PendingOrder) => {
    setSelectedOrder(order);
    setIsPrintDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="font-bold">Pending Work Orders</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4 mb-6">
            <div className="flex justify-between items-center">
              <SearchBar
                value={searchTerm}
                onChange={setSearchTerm}
                placeholder="Search orders..."
              />
              <Button onClick={handleExport}>
                <FileDown className="w-4 h-4 mr-2" />
                Export CSV
              </Button>
            </div>
            <PendingOrdersFilters
              priorityFilter={priorityFilter}
              customerFilter={customerFilter}
              priorities={priorities}
              customers={customers}
              onPriorityChange={setPriorityFilter}
              onCustomerChange={setCustomerFilter}
            />
          </div>

          <PendingOrdersTable orders={filteredData} onPrintOrder={handlePrintOrder} />

          <div className="mt-4 text-sm text-muted-foreground">
            Showing {filteredData.length} of {pendingData.length} pending work orders
          </div>
        </CardContent>
      </Card>

      {/* Print Work Order Dialog */}
      <WorkOrderReportDialog
        open={isPrintDialogOpen}
        onOpenChange={setIsPrintDialogOpen}
        order={selectedOrder ? {
          id: selectedOrder.work_order_id,
          customer: selectedOrder.customer,
          date: selectedOrder.date,
          well_name: "Sample Well",
          meter_number: "Sample Meter",
          cylinders: selectedOrder.cylinders,
        } : null}
        contactName="Contact Name"
        contactEmail="contact@example.com"
        contactPhone="(555) 123-4567"
      />
    </div>
  );
}