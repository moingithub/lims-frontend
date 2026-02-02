import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
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

export function WorkOrders() {
  const { filterDataByAccess, hasOwnDataRestriction } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isReportDialogOpen, setIsReportDialogOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<WorkOrderWithId | null>(null);
  const [orderToDelete, setOrderToDelete] = useState<WorkOrderWithId | null>(null);
  const [lineItems, setLineItems] = useState<LineItem[]>([]);
  const [mileageFee, setMileageFee] = useState<number>(0);
  const [miscellaneousCharges, setMiscellaneousCharges] = useState<number>(0);
  const [hourlyFee, setHourlyFee] = useState<number>(0);

  // Initialize orders with string IDs
  const [allOrders] = useState<WorkOrderWithId[]>([
    {
      id: "WO-001239",
      customer: "ChemLab Ltd",
      date: "2025-10-28",
      cylinders: 6,
      amount: 990.0,
      status: "Invoiced",
      well_name: "Well F-6",
      meter_number: "MTR-606",
      created_by: 1,
    },
    {
      id: "WO-001240",
      customer: "EnergyFlow Inc",
      date: "2025-11-05",
      cylinders: 3,
      amount: 495.0,
      status: "Invoiced",
      well_name: "Well G-2",
      meter_number: "MTR-707",
      created_by: 1,
    },
    {
      id: "WO-001241",
      customer: "Acme Corporation",
      date: "2025-11-09",
      cylinders: 5,
      amount: 825.0,
      status: "Invoiced",
      well_name: "Well H-8",
      meter_number: "MTR-101",
      created_by: 1,
    },
    {
      id: "WO-001242",
      customer: "TechGas Inc",
      date: "2025-11-11",
      cylinders: 4,
      amount: 660.0,
      status: "Invoiced",
      well_name: "Well I-3",
      meter_number: "MTR-808",
      created_by: 1,
    },
    {
      id: "WO-001243",
      customer: "Westfield Resources",
      date: "2025-11-13",
      cylinders: 7,
      amount: 1155.0,
      status: "Pending",
      well_name: "Well J-5",
      meter_number: "MTR-909",
      created_by: 1,
    },
    {
      id: "WO-001244",
      customer: "Acme Corporation",
      date: "2025-11-15",
      cylinders: 2,
      amount: 330.0,
      status: "Pending",
      well_name: "Well K-1",
      meter_number: "MTR-202",
      created_by: 1,
    },
    {
      id: "WO-001245",
      customer: "TechGas Inc",
      date: "2025-11-16",
      cylinders: 8,
      amount: 1320.0,
      status: "Pending",
      well_name: "Well L-9",
      meter_number: "MTR-303",
      created_by: 1,
    },
    {
      id: "WO-001246",
      customer: "Industrial Co",
      date: "2025-11-16",
      cylinders: 3,
      amount: 495.0,
      status: "Pending",
      well_name: "Well M-4",
      meter_number: "MTR-404",
      created_by: 1,
    },
    {
      id: "WO-001247",
      customer: "Acme Corporation",
      date: "2025-11-17",
      cylinders: 6,
      amount: 990.0,
      status: "Pending",
      well_name: "Well N-7",
      meter_number: "MTR-505",
      created_by: 1,
    },
  ]);

  const [orders, setOrders] = useState<WorkOrderWithId[]>(allOrders);

  useEffect(() => {
    if (hasOwnDataRestriction) {
      setOrders(filterDataByAccess(allOrders));
    } else {
      setOrders(allOrders);
    }
  }, [hasOwnDataRestriction, filterDataByAccess]);

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customer.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleEditOrder = (order: WorkOrderWithId) => {
    setSelectedOrder(order);
    const mockLineItems = workOrdersService.getMockLineItems(order.id);
    setLineItems(mockLineItems);
    setMileageFee(0);
    setMiscellaneousCharges(0);
    setHourlyFee(0);
    setIsEditDialogOpen(true);
  };

  const handleLineItemChange = (
    id: string,
    field: keyof LineItem,
    value: string | number | boolean
  ) => {
    const updatedItems = workOrdersService.updateLineItem(lineItems, id, field, value);
    setLineItems(updatedItems);
  };

  const handleSaveLineItems = () => {
    toast.success(`Work Order ${selectedOrder?.id} line items updated successfully`);
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

  const confirmDeleteOrder = () => {
    if (orderToDelete) {
      toast.success(`Work Order ${orderToDelete.id} deleted successfully`);
      setIsDeleteDialogOpen(false);
      setOrderToDelete(null);
    }
  };

  const handleCreateInvoice = (order: WorkOrderWithId) => {
    const invoiceNumber = workOrdersService.generateInvoiceNumber();
    toast.success(
      `Invoice ${invoiceNumber} generated successfully for ${order.customer} with 1 work order(s)`
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
            orders={filteredOrders}
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
            <Pagination currentPage={1} totalPages={1} onPageChange={() => {}} />
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