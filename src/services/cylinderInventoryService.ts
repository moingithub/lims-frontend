import { API_BASE_URL } from "../config/api";
import { parseApiError } from "../utils/parseApiError";
import { authService } from "./authService";
import {
  CYLINDER_STATUS_CHECKED_IN,
  CYLINDER_STATUS_CHECKED_OUT,
  CYLINDER_STATUS_CLEAN,
  CYLINDER_STATUS_UNKNOWN,
} from "./cylinderMasterService";

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
  status: string;
  issued_to: string;
  since_days: number | string;
  email: string;
}

export type CylinderInventory = CylinderInventoryItem;

const cylinderInventoryService = {
  getInventory: async (): Promise<CylinderInventoryItem[]> => {
    const response = await fetch(`${API_BASE_URL}/cylinder_inventory`, {
      method: "GET",
      headers: buildAuthHeaders(),
    });
    if (!response.ok) {
      throw new Error(
        await parseApiError(response, "Failed to fetch cylinder inventory"),
      );
    }
    const data: CylinderInventoryItem[] = await response.json();
    return Array.isArray(data) ? data : [];
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

  getUniqueStatuses: (inventory?: CylinderInventoryItem[]): string[] => {
    const arr = Array.isArray(inventory) ? inventory : [];
    return Array.from(new Set(arr.map((item) => item.status))).sort();
  },

  getStatusBadgeVariant: (status: string): string => {
    switch (status) {
      case CYLINDER_STATUS_CLEAN:
        return "bg-green-100 text-green-800";
      case CYLINDER_STATUS_CHECKED_OUT:
        return "bg-blue-100 text-blue-800";
      case CYLINDER_STATUS_CHECKED_IN:
        return "bg-yellow-100 text-yellow-800";
      case CYLINDER_STATUS_UNKNOWN:
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  },
};

export { cylinderInventoryService };
