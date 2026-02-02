import { cylinderMasterService } from './cylinderMasterService';
import { cylinderCheckOutService } from './cylinderCheckOutService';
import { companyMasterService } from './companyMasterService';

export interface CylinderInventoryItem {
  id: number;
  cylinder_number: string;
  cylinder_type: string;
  location: string;
  status: string;
  issued_to: string;
  since_days: number | string;
  email: string;
  created_by: number;
}

// Type alias for backwards compatibility
export type CylinderInventory = CylinderInventoryItem;

// Calculate days since a date
const calculateDaysSince = (dateString: string): number => {
  if (!dateString) return 0;
  const checkoutDate = new Date(dateString);
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - checkoutDate.getTime());
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
};

// Get status from location
const getStatusFromLocation = (location: string): string => {
  switch (location) {
    case "Clean Cylinder":
      return "Available";
    case "Checked Out":
      return "In Use";
    case "Checked In":
      return "In Use";
    default:
      return "Unknown";
  }
};

export const cylinderInventoryService = {
  getInventory: (): CylinderInventoryItem[] => {
    // Get all cylinders from Cylinder Master
    const cylinders = cylinderMasterService.getCylinders();
    
    // Get all checkout records
    const checkoutRecords = cylinderCheckOutService.getCheckOutRecords();
    
    // Build inventory by merging cylinder master data with checkout records
    return cylinders.map(cylinder => {
      // Find the most recent checkout record for this cylinder (by record ID)
      const checkoutRecord = checkoutRecords
        .filter(record => record.barcode === cylinder.cylinder_number)
        .sort((a, b) => b.id - a.id)[0]; // Sort by ID descending (most recent first)
      
      let issued_to = "";
      let since_days: number | string = "";
      let email = "";
      
      // If cylinder is checked out and has a checkout record
      if (cylinder.location === "Checked Out" && checkoutRecord) {
        // Get company name from company_id
        const company = companyMasterService.getCompanyById(checkoutRecord.company_id);
        issued_to = company?.company_name || "";
        email = company?.email || "";
        // Calculate days since checkout if created_at exists
        if (checkoutRecord.created_at) {
          since_days = calculateDaysSince(checkoutRecord.created_at);
        } else {
          since_days = "";
        }
      }
      
      return {
        id: cylinder.id,
        cylinder_number: cylinder.cylinder_number,
        cylinder_type: cylinder.cylinder_type,
        location: cylinder.location,
        status: getStatusFromLocation(cylinder.location),
        issued_to,
        since_days,
        email,
        created_by: cylinder.created_by,
      };
    });
  },

  searchInventory: (inventory: CylinderInventoryItem[], searchTerm: string): CylinderInventoryItem[] => {
    if (!searchTerm) return inventory;
    
    const lowerSearch = searchTerm.toLowerCase();
    return inventory.filter(item =>
      item.cylinder_number.toLowerCase().includes(lowerSearch) ||
      item.cylinder_type.toLowerCase().includes(lowerSearch) ||
      item.location.toLowerCase().includes(lowerSearch) ||
      item.status.toLowerCase().includes(lowerSearch) ||
      item.issued_to.toLowerCase().includes(lowerSearch) ||
      item.email.toLowerCase().includes(lowerSearch)
    );
  },

  filterByStatus: (inventory: CylinderInventoryItem[], status: string): CylinderInventoryItem[] => {
    if (status === "all") return inventory;
    return inventory.filter(item => item.status === status);
  },

  filterByLocation: (inventory: CylinderInventoryItem[], location: string): CylinderInventoryItem[] => {
    if (location === "all") return inventory;
    return inventory.filter(item => item.location === location);
  },

  getUniqueStatuses: (inventory: CylinderInventoryItem[]): string[] => {
    return Array.from(new Set(inventory.map(item => item.status))).sort();
  },

  getUniqueLocations: (inventory: CylinderInventoryItem[]): string[] => {
    return Array.from(new Set(inventory.map(item => item.location))).sort();
  },

  getStatusBadgeVariant: (status: string): string => {
    switch (status) {
      case "Available":
        return "bg-green-100 text-green-800";
      case "In Use":
        return "bg-blue-100 text-blue-800";
      case "Maintenance":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  },

  exportToCSV: (inventory: CylinderInventoryItem[]): string => {
    const headers = ["Cylinder Number", "Cylinder Type", "Location", "Status", "Issued To", "Since Days", "Email"];
    const rows = inventory.map(item => [
      item.cylinder_number,
      item.cylinder_type,
      item.location,
      item.status,
      item.issued_to,
      item.since_days.toString(),
      item.email,
    ]);
    
    const csvContent = [
      headers.join(","),
      ...rows.map(row => row.join(",")),
    ].join("\n");
    
    return csvContent;
  },
};