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
import { workorderHeadersService } from "../services/workorderHeadersService";
import { sampleCheckInService } from "../services/sampleCheckInService";

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

  const handleSaveLineItems = async () => {
    if (!selectedOrder) return;
    let allSucceeded = true;
    let errorMessages: string[] = [];
    try {
      // Save header (fees)
      const header = await workorderHeadersService.getByNumber(
        selectedOrder.id,
      );
      const payload = {
        company_id: selectedOrder.company_id,
        work_order_date: selectedOrder.date,
        work_order_number: selectedOrder.id,
        mileage_fee: mileageFee,
        miscellaneous_charges: miscellaneousCharges,
        hourly_fee: hourlyFee,
        created_by_id: selectedOrder.created_by || 1,
        status: "Pending",
      };
      if (!header) {
        await workorderHeadersService.create(payload);
      } else {
        await workorderHeadersService.updateByNumber(selectedOrder.id, {
          mileage_fee: mileageFee,
          miscellaneous_charges: miscellaneousCharges,
          hourly_fee: hourlyFee,
          created_by_id: selectedOrder.created_by || 1,
          status: "Pending",
        });
      }

      // Save each line item using sampleCheckInApi.updateWOLine
      const { sampleCheckInService } =
        await import("../services/sampleCheckInService");
      const { analysisPricingService } =
        await import("../services/analysisPricingService");
      // Ensure analysis prices are loaded
      await analysisPricingService.fetchAnalysisPrices();

      for (const item of lineItems) {
        try {
          // Find analysis type id
          const analysis = analysisPricingService
            .getAnalysisPrices()
            .find((a) => a.analysis_code === item.analysis_type);
          const analysis_type_id = analysis ? analysis.id : null;
          if (!analysis_type_id) {
            allSucceeded = false;
            errorMessages.push(
              `Line item ${item.analysis_number}: Invalid analysis type.`,
            );
            continue;
          }
          // Pass standard_rate as in textbox (item.standard_rate)
          await sampleCheckInService.updateWOLine(item.id, {
            analysis_type_id,
            rushed: item.rushed,
            standard_rate: item.standard_rate,
            applied_rate: item.applied_rate,
            sample_fee: item.sample_fee,
            h2_pop_fee: item.h2_pop_fee,
            spot_composite_fee: item.spot_composite_fee,
          });
        } catch (err: any) {
          allSucceeded = false;
          errorMessages.push(
            `Line item ${item.analysis_number}: ${err?.detail || err?.error || "Failed to update line item"}`,
          );
        }
      }

      if (allSucceeded) {
        toast.success(
          `Work Order ${selectedOrder.id} line items updated successfully`,
        );
        setIsEditDialogOpen(false);
      } else {
        toast.error(
          `Some line items failed to update:\n${errorMessages.join("\n")}`,
        );
      }
    } catch (error: any) {
      toast.error(
        error?.detail ||
          error?.error ||
          "Failed to save work order header or line items",
      );
    }
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

  const handleSubmitOrder = async (order: WorkOrderWithId) => {
    try {
      await workorderHeadersService.updateByNumber(order.id, {
        status: "Submitted",
      });
      // Also update status in sample_checkin
      await sampleCheckInService.updateStatusByWorkOrderNumber(order.id, {
        status: "Submitted",
      });
      toast.success(`Work Order ${order.id} submitted successfully.`);
      await loadOrders();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to submit work order";
      toast.error(message);
    }
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
            onSubmitOrder={handleSubmitOrder}
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
        order={
          selectedOrder
            ? { ...selectedOrder, well_name: selectedOrder.well_name || "" }
            : null
        }
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
        order={
          selectedOrder
            ? { ...selectedOrder, well_name: selectedOrder.well_name || "" }
            : null
        }
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
        order={
          selectedOrder
            ? {
                ...selectedOrder,
                well_name: selectedOrder.well_name || "",
                meter_number: selectedOrder.meter_number || "",
                cylinders:
                  typeof selectedOrder.cylinders === "number"
                    ? selectedOrder.cylinders
                    : typeof selectedOrder.cylinders === "string" &&
                        !isNaN(Number(selectedOrder.cylinders))
                      ? Number(selectedOrder.cylinders)
                      : undefined,
              }
            : null
        }
        contactName="John Doe"
        contactEmail="john.doe@example.com"
        contactPhone="(555) 123-4567"
      />
    </div>
  );
}
