import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { FileSpreadsheet } from "lucide-react";
import { toast } from "sonner@2.0.3";
import { Separator } from "../components/ui/separator";
import { InvoiceFilters } from "../components/generateInvoices/InvoiceFilters";
import { WorkOrdersTable } from "../components/generateInvoices/WorkOrdersTable";
import { SelectedOrdersDetails } from "../components/generateInvoices/SelectedOrdersDetails";
import { InvoiceSummary } from "../components/generateInvoices/InvoiceSummary";
import {
  getCustomers,
  getWorkOrders,
  getFilteredOrders,
  calculateInvoiceTotals,
  generateInvoiceNumber,
  validateInvoiceGeneration,
  getFirstDayOfMonth,
  getCurrentDate,
  getCompanyNameById,
  getCompanyEmailById,
} from "../services/generateInvoicesService";

export function GenerateInvoices() {
  const [selectedCompanyId, setSelectedCompanyId] = useState<number | null>(null);
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [selectedOrders, setSelectedOrders] = useState<number[]>([]);

  // Get data from service
  const customers = getCustomers();
  const allWorkOrders = getWorkOrders();

  // Filter orders based on current filters
  const filteredOrders = getFilteredOrders(allWorkOrders, {
    company_id: selectedCompanyId,
    date_from: dateFrom,
    date_to: dateTo,
  });

  const handleSearch = () => {
    if (filteredOrders.length === 0) {
      toast.info("No uninvoiced work orders found for the selected criteria");
    } else {
      toast.success(`Found ${filteredOrders.length} uninvoiced work order(s)`);
    }
    setSelectedOrders([]); // Clear previous selections
  };

  const handleClearFilters = () => {
    setSelectedOrders([]);
    setSelectedCompanyId(null);
    setDateFrom(getFirstDayOfMonth());
    setDateTo(getCurrentDate());
  };

  const handleOrderSelection = (orderId: number) => {
    setSelectedOrders((prev) =>
      prev.includes(orderId)
        ? prev.filter((id) => id !== orderId)
        : [...prev, orderId]
    );
  };

  const handleSelectAll = () => {
    if (selectedOrders.length === filteredOrders.length) {
      setSelectedOrders([]);
    } else {
      setSelectedOrders(filteredOrders.map((order) => order.id));
    }
  };

  const handleGenerateInvoice = () => {
    console.log("Generate Invoice clicked");
    console.log("Selected orders:", selectedOrders);
    
    // Get selected orders data
    const selectedOrdersData = filteredOrders.filter((order) =>
      selectedOrders.includes(order.id)
    );

    console.log("Selected orders data:", selectedOrdersData);

    // Validate
    const validation = validateInvoiceGeneration(selectedOrdersData);
    console.log("Validation result:", validation);
    
    if (!validation.valid) {
      toast.error(validation.error);
      return;
    }

    // Generate invoice
    const invoiceNumber = generateInvoiceNumber();
    const companyId = selectedOrdersData[0].company_id;
    const companyName = getCompanyNameById(companyId);
    const companyEmail = getCompanyEmailById(companyId);

    console.log("Invoice details:", { invoiceNumber, companyId, companyName, companyEmail });

    toast.success(
      `Invoice ${invoiceNumber} generated successfully for ${companyName} (${companyEmail}) with ${selectedOrders.length} work order(s)!`
    );

    // Reset the form
    setSelectedOrders([]);
    setSelectedCompanyId(null);
    setDateFrom("");
    setDateTo("");
  };

  // Get selected orders and calculate totals
  const selectedOrdersData = filteredOrders.filter((order) =>
    selectedOrders.includes(order.id)
  );
  const totals = calculateInvoiceTotals(selectedOrdersData);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="font-bold">Generate Invoice</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Filter Section */}
          <InvoiceFilters
            selectedCompanyId={selectedCompanyId}
            dateFrom={dateFrom}
            dateTo={dateTo}
            customers={customers}
            onCompanyChange={setSelectedCompanyId}
            onDateFromChange={setDateFrom}
            onDateToChange={setDateTo}
            onSearch={handleSearch}
            onClear={handleClearFilters}
          />

          <Separator />

          {/* Sales Orders Table */}
          <WorkOrdersTable
            orders={filteredOrders}
            selectedOrders={selectedOrders}
            onOrderSelection={handleOrderSelection}
            onSelectAll={handleSelectAll}
          />

          {/* Selected Orders Details */}
          {selectedOrders.length > 0 && (
            <>
              <SelectedOrdersDetails orders={selectedOrdersData} />

              {/* Invoice Summary */}
              <InvoiceSummary
                selectedOrdersCount={selectedOrders.length}
                totals={totals}
              />

              {/* Generate Invoice Button */}
              <Button
                onClick={handleGenerateInvoice}
                disabled={selectedOrders.length === 0}
                size="lg"
                className="w-full md:w-auto"
              >
                <FileSpreadsheet className="w-4 h-4 mr-2" />
                Generate Invoice
              </Button>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}