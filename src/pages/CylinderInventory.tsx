import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { cylinderInventoryService } from "../services/cylinderInventoryService";
import { SearchBar } from "../components/shared/SearchBar";
import { CylinderInventoryTable } from "../components/cylinderInventory/CylinderInventoryTable";
import { CylinderInventoryFilters } from "../components/cylinderInventory/CylinderInventoryFilters";

export function CylinderInventory() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [locationFilter, setLocationFilter] = useState("all");

  const inventoryData = cylinderInventoryService.getInventory();
  const statuses = cylinderInventoryService.getUniqueStatuses(inventoryData);
  const locations = cylinderInventoryService.getUniqueLocations(inventoryData);

  // Apply filters
  let filteredData = cylinderInventoryService.searchInventory(inventoryData, searchTerm);
  filteredData = cylinderInventoryService.filterByStatus(filteredData, statusFilter);
  filteredData = cylinderInventoryService.filterByLocation(filteredData, locationFilter);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="font-bold">Cylinder Inventory</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1">
              <SearchBar
                value={searchTerm}
                onChange={setSearchTerm}
                placeholder="Search..."
              />
            </div>
            <div className="flex gap-2">
              <CylinderInventoryFilters
                statusFilter={statusFilter}
                locationFilter={locationFilter}
                statuses={statuses}
                locations={locations}
                onStatusChange={setStatusFilter}
                onLocationChange={setLocationFilter}
              />
            </div>
          </div>

          <CylinderInventoryTable inventory={filteredData} />

          <div className="mt-4 flex items-center justify-between text-sm text-muted-foreground">
            <p>Showing {filteredData.length} of {inventoryData.length} records</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
