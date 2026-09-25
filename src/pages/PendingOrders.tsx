import { useCallback, useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { FileDown, Loader2 } from "lucide-react";
import { toast } from "sonner";
import {
  pendingOrdersService,
  PendingOrder,
} from "../services/pendingOrdersService";
import { SearchBar } from "../components/shared/SearchBar";
import { PendingOrdersTable } from "../components/pendingOrders/PendingOrdersTable";
import { PendingOrdersFilters } from "../components/pendingOrders/PendingOrdersFilters";
import { WorkOrderReportDialog } from "../components/sampleCheckIn/WorkOrderReportDialog";
import { workOrdersService } from "../services/workOrdersService";
import { workorderHeadersService } from "../services/workorderHeadersService";
import { analysisPricingService } from "../services/analysisPricingService";
import { companyMasterService } from "../services/companyMasterService";
import { contactsService } from "../services/contactsService";
import { CheckedInSample } from "../services/sampleCheckInService";
import { resolveWorkOrderReportContact } from "../utils/workOrderReportContact";
import { resolveDisplayDate } from "../utils/dateUtils";

export function PendingOrders() {
  const [searchTerm, setSearchTerm] = useState("");
  const [customerFilter, setCustomerFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [pendingData, setPendingData] = useState<PendingOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isPrintDialogOpen, setIsPrintDialogOpen] = useState(false);
  const [isReportLoading, setIsReportLoading] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<PendingOrder | null>(null);
  const [reportCylinders, setReportCylinders] = useState<CheckedInSample[]>([]);
  const [reportCustomerCode, setReportCustomerCode] = useState("");
  const [reportContactName, setReportContactName] = useState("");
  const [reportContactEmail, setReportContactEmail] = useState("");
  const [reportContactPhone, setReportContactPhone] = useState("");
  const [reportDate, setReportDate] = useState("");

  const loadPendingOrders = useCallback(async () => {
    try {
      setIsLoading(true);
      const orders = await pendingOrdersService.fetchPendingOrders();
      setPendingData(orders);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Failed to load pending work orders";
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPendingOrders();
  }, [loadPendingOrders]);

  const customers = pendingOrdersService.getUniqueCustomers(pendingData);
  const priorities = pendingOrdersService.getUniquePriorities(pendingData);

  let filteredData = pendingOrdersService.searchOrders(pendingData, searchTerm);
  filteredData = pendingOrdersService.filterByCustomer(
    filteredData,
    customerFilter,
  );
  filteredData = pendingOrdersService.filterByPriority(
    filteredData,
    priorityFilter,
  );

  const handleExport = () => {
    const csvContent = pendingOrdersService.exportToCSV(filteredData);
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `pending_orders_${new Date().toISOString().split("T")[0]}.csv`,
    );
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Pending work orders exported successfully");
  };

  const handlePrintOrder = async (order: PendingOrder) => {
    setSelectedOrder(order);
    setIsPrintDialogOpen(true);
    setIsReportLoading(true);
    setReportCylinders([]);
    setReportCustomerCode("");
    setReportContactName("");
    setReportContactEmail("");
    setReportContactPhone("");
    setReportDate("");

    try {
      await Promise.all([
        analysisPricingService.fetchAnalysisPrices(),
        companyMasterService.fetchCompanies(),
        contactsService.fetchContacts(),
      ]);

      const [samples, header] = await Promise.all([
        workOrdersService.fetchWorkOrderReportSamples(
          order.work_order_id,
          order.company_id ?? 0,
        ),
        workorderHeadersService.getByNumber(order.work_order_id),
      ]);

      const company = order.company_id
        ? companyMasterService.getCompanyById(order.company_id)
        : undefined;
      const contact = resolveWorkOrderReportContact(
        samples,
        header,
        (id) => contactsService.getContactById(id),
      );

      setReportCylinders(samples);
      setReportCustomerCode(company?.company_code ?? "");
      setReportContactName(contact.name);
      setReportContactEmail(contact.email);
      setReportContactPhone(contact.phone);
      setReportDate(
        resolveDisplayDate(
          order.date,
          typeof header?.date === "string" ? header.date : undefined,
          typeof header?.work_order_date === "string"
            ? header.work_order_date
            : undefined,
          samples[0]?.date,
          samples[0]?.check_in_time,
          samples[0]?.sample_date ?? samples[0]?.sampled_date,
        ),
      );
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Failed to load work order report";
      toast.error(message);
    } finally {
      setIsReportLoading(false);
    }
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
              <Button onClick={handleExport} disabled={isLoading}>
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

          {isLoading ? (
            <div className="flex min-h-[200px] items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <PendingOrdersTable
              orders={filteredData}
              onPrintOrder={handlePrintOrder}
            />
          )}

          <div className="mt-4 text-sm text-muted-foreground">
            Showing {filteredData.length} of {pendingData.length} pending work
            orders
          </div>
        </CardContent>
      </Card>

      <WorkOrderReportDialog
        open={isPrintDialogOpen}
        onOpenChange={setIsPrintDialogOpen}
        isLoading={isReportLoading}
        order={
          selectedOrder
            ? {
                id: selectedOrder.work_order_id,
                customer: selectedOrder.customer,
                date: selectedOrder.date,
                cylinders: selectedOrder.cylinders,
              }
            : null
        }
        cylinders={reportCylinders}
        customerCode={reportCustomerCode}
        contactName={reportContactName}
        contactEmail={reportContactEmail}
        contactPhone={reportContactPhone}
        reportDate={reportDate}
      />
    </div>
  );
}
