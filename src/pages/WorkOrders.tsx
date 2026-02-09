import { useCallback, useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { toast } from "sonner";
import {
  WorkOrderWithId,
  LineItem,
  workOrdersService,
} from "../services/workOrdersService";
import { SearchBar } from "../components/workOrders/SearchBar";
import { WorkOrdersFilters } from "../components/workOrders/WorkOrdersFilters";
import { WorkOrdersTable } from "../components/workOrders/WorkOrdersTable";
import { EditLineItemsDialog } from "../components/workOrders/EditLineItemsDialog";
import { ViewWorkOrderDialog } from "../components/workOrders/ViewWorkOrderDialog";
import { DeleteWorkOrderDialog } from "../components/workOrders/DeleteWorkOrderDialog";
import { PendingLegend } from "../components/workOrders/PendingLegend";
import { Pagination } from "../components/workOrders/Pagination";
import { WorkOrderReportDialog } from "../components/sampleCheckIn/WorkOrderReportDialog";
import { useAuth } from "../contexts/AuthContext";
import { analysisPricingService } from "../services/analysisPricingService";

export function WorkOrders() {
  const { filterDataByAccess, hasOwnDataRestriction } = useAuth();
  const moduleId = 4;
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isReportDialogOpen, setIsReportDialogOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<WorkOrderWithId | null>(
    null,
  );
  const [orderToDelete, setOrderToDelete] = useState<WorkOrderWithId | null>(
    null,
  );
  const [lineItems, setLineItems] = useState<LineItem[]>([]);
  const [mileageFee, setMileageFee] = useState<number>(0);
  const [miscellaneousCharges, setMiscellaneousCharges] = useState<number>(0);
  const [hourlyFee, setHourlyFee] = useState<number>(0);

  const [orders, setOrders] = useState<WorkOrderWithId[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadOrders = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await workOrdersService.fetchWorkOrders();
      const uniqueOrders = Array.from(
        new Map(
          data.map((order) => [order.api_id ?? order.id, order]),
        ).values(),
      );

      let visibleOrders = uniqueOrders;
      const canFilterByAccess = uniqueOrders.some(
        (order) => order.created_by !== undefined && order.created_by !== 0,
      );

      if (hasOwnDataRestriction(moduleId) && canFilterByAccess) {
        visibleOrders = filterDataByAccess(uniqueOrders, moduleId);
      }

      setOrders(visibleOrders);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to load work orders";
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  }, [filterDataByAccess, hasOwnDataRestriction, moduleId]);

  useEffect(() => {
    let isMounted = true;
    const runLoad = async () => {
      if (!isMounted) return;
      await loadOrders();
    };

    runLoad();

    return () => {
      isMounted = false;
    };
  }, [loadOrders]);

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customer.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleEditOrder = async (order: WorkOrderWithId) => {
    setSelectedOrder(order);
    try {
      // Ensure analysis prices are loaded before opening dialog
      await analysisPricingService.fetchAnalysisPrices();
      const details = await workOrdersService.fetchWorkOrderDetailsByNumber(
        order.id,
      );
      setLineItems(details.lineItems);
      setMileageFee(details.mileageFee);
      setMiscellaneousCharges(details.miscCharges);
      setHourlyFee(details.hourlyFee);
      setIsEditDialogOpen(true);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Failed to load work order details";
      toast.error(message);
    }
  };

  const handleLineItemChange = (
    id: string,
    field: keyof LineItem,
    value: string | number | boolean,
  ) => {
    const updatedItems = workOrdersService.updateLineItem(
      lineItems,
      id,
      field,
      value,
    );
    setLineItems(updatedItems);
  };

  const handleSaveLineItems = () => {
    toast.success(
      `Work Order ${selectedOrder?.id} line items updated successfully`,
    );
    setIsEditDialogOpen(false);
  };

  const handleViewOrder = (order: WorkOrderWithId) => {
    setSelectedOrder(order);
    const mockLineItems = workOrdersService.getMockLineItemsForView(order.id);
    setLineItems(mockLineItems);
    setMileageFee(0);
    setMiscellaneousCharges(0);
    setHourlyFee(0);
    setIsViewDialogOpen(true);
  };

  const handleDeleteOrder = (order: WorkOrderWithId) => {
    setOrderToDelete(order);
    setIsDeleteDialogOpen(true);
  };

  const confirmDeleteOrder = async () => {
    if (!orderToDelete) return;

    if (!orderToDelete.api_id) {
      toast.error("Unable to delete this work order");
      return;
    }

    try {
      await workOrdersService.deleteWorkOrder(orderToDelete.api_id);
      await loadOrders();
      toast.success(`Work Order ${orderToDelete.id} deleted successfully`);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to delete work order";
      toast.error(message);
    } finally {
      setIsDeleteDialogOpen(false);
      setOrderToDelete(null);
    }
  };

  const handleCreateInvoice = (order: WorkOrderWithId) => {
    const invoiceNumber = workOrdersService.generateInvoiceNumber();
    toast.success(
      `Invoice ${invoiceNumber} generated successfully for ${order.customer} with 1 work order(s)`,
    );
  };

  const handleGenerateReport = (order: WorkOrderWithId) => {
    setSelectedOrder(order);
    setIsReportDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="font-bold">Work Orders</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <SearchBar searchTerm={searchTerm} onSearchChange={setSearchTerm} />
            <div className="flex gap-2">
              <WorkOrdersFilters
                statusFilter={statusFilter}
                onStatusChange={setStatusFilter}
              />
            </div>
          </div>

          <WorkOrdersTable
            orders={isLoading ? [] : filteredOrders}
            onView={handleViewOrder}
            onEdit={handleEditOrder}
            onDelete={handleDeleteOrder}
            onCreateInvoice={handleCreateInvoice}
            onViewReport={handleGenerateReport}
          />

          <div className="mt-4 flex items-center justify-between text-sm text-muted-foreground">
            <div className="flex items-center gap-6">
              <p>
                Showing {filteredOrders.length} of {orders.length} orders
              </p>
              <PendingLegend />
            </div>
            <Pagination
              currentPage={1}
              totalPages={1}
              onPageChange={() => {}}
            />
          </div>
        </CardContent>
      </Card>

      {/* Edit Line Items Dialog */}
      <EditLineItemsDialog
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        order={selectedOrder}
        lineItems={lineItems}
        mileageFee={mileageFee}
        miscellaneousCharges={miscellaneousCharges}
        hourlyFee={hourlyFee}
        onLineItemChange={handleLineItemChange}
        onMileageFeeChange={setMileageFee}
        onMiscellaneousChargesChange={setMiscellaneousCharges}
        onHourlyFeeChange={setHourlyFee}
        onSave={handleSaveLineItems}
      />

      {/* View Work Order Dialog - Printable Format */}
      <ViewWorkOrderDialog
        open={isViewDialogOpen}
        onOpenChange={setIsViewDialogOpen}
        order={selectedOrder}
        lineItems={lineItems}
        mileageFee={mileageFee}
        miscellaneousCharges={miscellaneousCharges}
        hourlyFee={hourlyFee}
      />

      {/* Delete Work Order Dialog */}
      <DeleteWorkOrderDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        orderId={orderToDelete?.id || null}
        onConfirm={confirmDeleteOrder}
      />

      {/* Work Order Report Dialog */}
      <WorkOrderReportDialog
        open={isReportDialogOpen}
        onOpenChange={setIsReportDialogOpen}
        order={selectedOrder}
        contactName="John Doe"
        contactEmail="john.doe@example.com"
        contactPhone="(555) 123-4567"
      />
    </div>
  );
}
