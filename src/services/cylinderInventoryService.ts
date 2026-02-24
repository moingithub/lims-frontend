import { API_BASE_URL } from "../config/api";
import { authService } from "./authService";

const buildAuthHeaders = (): HeadersInit => {
  const token = authService.getAuthState().token;
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

export interface CylinderInventoryItem {
  id: number;
  cylinder_number: string;
  cylinder_type: string;
  location: string;
  status: string;
  issued_to: string;
  since_days: number | string;
  email: string;
}

// Type alias for backwards compatibility
export type CylinderInventory = CylinderInventoryItem;

const cylinderInventoryService = {
  // New implementation: fetch inventory from /cylinder-inventory endpoint using API_BASE_URL and auth headers
  getInventory: async (): Promise<CylinderInventoryItem[]> => {
    const response = await fetch(`${API_BASE_URL}/cylinder-inventory`, {
      method: "GET",
      headers: buildAuthHeaders(),
    });
    if (!response.ok) {
      throw new Error("Failed to fetch cylinder inventory");
    }
    return response.json();
  },

  searchInventory: (
    inventory: CylinderInventoryItem[],
    searchTerm: string,
  ): CylinderInventoryItem[] => {
    if (!searchTerm) return inventory;

    const lowerSearch = searchTerm.toLowerCase();
    return inventory.filter(
      (item) =>
        item.cylinder_number.toLowerCase().includes(lowerSearch) ||
        item.cylinder_type.toLowerCase().includes(lowerSearch) ||
        item.location.toLowerCase().includes(lowerSearch) ||
        item.status.toLowerCase().includes(lowerSearch) ||
        item.issued_to.toLowerCase().includes(lowerSearch) ||
        item.email.toLowerCase().includes(lowerSearch),
    );
  },

  filterByStatus: (
    inventory: CylinderInventoryItem[],
    status: string,
  ): CylinderInventoryItem[] => {
    if (status === "all") return inventory;
    return inventory.filter((item) => item.status === status);
  },

  filterByLocation: (
    inventory: CylinderInventoryItem[],
    location: string,
  ): CylinderInventoryItem[] => {
    if (location === "all") return inventory;
    return inventory.filter((item) => item.location === location);
  },

  getUniqueStatuses: (inventory?: CylinderInventoryItem[]): string[] => {
    const arr = Array.isArray(inventory) ? inventory : [];
    return Array.from(new Set(arr.map((item) => item.status))).sort();
  },

  getUniqueLocations: (inventory?: CylinderInventoryItem[]): string[] => {
    const arr = Array.isArray(inventory) ? inventory : [];
    return Array.from(new Set(arr.map((item) => item.location))).sort();
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

  // exportToCSV: (inventory: CylinderInventoryItem[]): string => {
  //   ...existing code...
  // },
};

export { cylinderInventoryService };
