// Unified Cylinder Master Service - Handles CRUD operations, search, validation, inventory tracking, and helper methods
import { API_BASE_URL } from "../config/api";
import { parseApiError } from "../utils/parseApiError";
import { authService } from "./authService";

export const CYLINDER_STATUS_CLEAN = "Clean Cylinder";
export const CYLINDER_STATUS_CHECKED_OUT = "Checked Out";
export const CYLINDER_STATUS_CHECKED_IN = "Checked In";
export const CYLINDER_STATUS_UNKNOWN = "Unknown";

export const cylinderStatusOptions = [
  CYLINDER_STATUS_CLEAN,
  CYLINDER_STATUS_CHECKED_OUT,
  CYLINDER_STATUS_CHECKED_IN,
] as const;

export type CylinderStatus = (typeof cylinderStatusOptions)[number];

export interface Cylinder {
  id: number;
  cylinder_number: string;
  cylinder_type: string;
  track_inventory: string;
  status: string;
  active: boolean;
  created_by: number;
}

type ApiCylinder = {
  id: number;
  cylinder_number: string;
  cylinder_type: string;
  track_inventory: boolean;
  status?: string | null;
  /** @deprecated renamed to status */
  location?: string | null;
  active: boolean;
  created_by_id: number | null;
};

const normalizeCylinderStatus = (
  status: string | null | undefined,
): string => {
  const value = status?.trim();
  if (!value) return CYLINDER_STATUS_UNKNOWN;
  if ((cylinderStatusOptions as readonly string[]).includes(value)) {
    return value;
  }
  return CYLINDER_STATUS_UNKNOWN;
};

let cylindersCache: Cylinder[] = [];
let cylindersLoaded = false;

const mapApiCylinder = (cylinder: ApiCylinder): Cylinder => ({
  id: cylinder.id,
  cylinder_number: cylinder.cylinder_number,
  cylinder_type: cylinder.cylinder_type,
  track_inventory: cylinder.track_inventory ? "True" : "False",
  status: normalizeCylinderStatus(cylinder.status ?? cylinder.status),
  active: cylinder.active,
  created_by: cylinder.created_by_id ?? 0,
});

const buildAuthHeaders = (): HeadersInit => {
  const token = authService.getAuthState().token;
  if (!token) {
    throw new Error("Your session has expired. Please log in again.");
  }
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
};

export const cylinderTypes = ["Gas", "Liquid"];
export const trackInventoryOptions = ["True", "False"];
export const DEFAULT_CYLINDER_STATUS = CYLINDER_STATUS_CLEAN;
/** @deprecated use DEFAULT_CYLINDER_STATUS */
export const DEFAULT_CYLINDER_LOCATION = DEFAULT_CYLINDER_STATUS;
/** @deprecated use cylinderStatusOptions */
export const locationOptions = [...cylinderStatusOptions];

export const cylinderMasterService = {
  // ========== CRUD Operations ==========

  // Get all cylinders
  getCylinders: (): Cylinder[] => {
    return cylindersCache;
  },

  // Fetch cylinders from API (cached)
  fetchCylinders: async (force = false): Promise<Cylinder[]> => {
    if (cylindersLoaded && !force) return cylindersCache;

    const response = await fetch(`${API_BASE_URL}/cylinders`, {
      method: "GET",
      headers: buildAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error(
        await parseApiError(response, "Failed to load cylinders"),
      );
    }

    const data: ApiCylinder[] = await response.json();
    cylindersCache = Array.isArray(data) ? data.map(mapApiCylinder) : [];
    cylindersLoaded = true;
    return cylindersCache;
  },

  // Replace cached cylinders (local updates)
  setCylinders: (cylinders: Cylinder[]): void => {
    cylindersCache = cylinders;
    cylindersLoaded = true;
  },

  // Add a new cylinder
  addCylinder: async (
    cylinder: Omit<Cylinder, "id" | "created_by">,
  ): Promise<Cylinder> => {
    const response = await fetch(`${API_BASE_URL}/cylinders`, {
      method: "POST",
      headers: buildAuthHeaders(),
      body: JSON.stringify({
        cylinder_number: cylinder.cylinder_number,
        cylinder_type: cylinder.cylinder_type,
        track_inventory: cylinder.track_inventory === "True",
        status: cylinder.status || DEFAULT_CYLINDER_STATUS,
        active: cylinder.active,
      }),
    });

    if (!response.ok) {
      let message = await parseApiError(response, "Failed to create cylinder");
      if (message.includes("cylinder_number must be unique")) {
        message =
          "Cylinder number already exists. Please use a unique cylinder number.";
      }
      throw new Error(message);
    }

    const data: ApiCylinder = await response.json();
    const created = mapApiCylinder(data);
    cylindersCache = [...cylindersCache, created];
    cylindersLoaded = true;
    return created;
  },

  // Update an existing cylinder
  updateCylinder: async (
    id: number,
    updatedCylinder: Omit<Cylinder, "created_by">,
  ): Promise<Cylinder> => {
    const response = await fetch(`${API_BASE_URL}/cylinders/${id}`, {
      method: "PUT",
      headers: buildAuthHeaders(),
      body: JSON.stringify({
        cylinder_number: updatedCylinder.cylinder_number,
        cylinder_type: updatedCylinder.cylinder_type,
        track_inventory: updatedCylinder.track_inventory === "True",
        status: updatedCylinder.status,
        active: updatedCylinder.active,
      }),
    });

    if (!response.ok) {
      throw new Error(
        await parseApiError(response, "Failed to update cylinder"),
      );
    }

    const data: ApiCylinder = await response.json();
    const saved = mapApiCylinder(data);
    cylindersCache = cylindersCache.map((cylinder) =>
      cylinder.id === id ? saved : cylinder,
    );
    cylindersLoaded = true;
    return saved;
  },

  // Delete a cylinder
  deleteCylinder: async (id: number): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/cylinders/${id}`, {
      method: "DELETE",
      headers: buildAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error(
        await parseApiError(response, "Failed to delete cylinder"),
      );
    }

    cylindersCache = cylindersCache.filter((cylinder) => cylinder.id !== id);
    cylindersLoaded = true;
  },

  // Search cylinders by cylinder number, type, or status
  searchCylinders: (cylinders: Cylinder[], searchTerm: string): Cylinder[] => {
    return cylinders.filter(
      (cylinder) =>
        cylinder.cylinder_number
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        cylinder.cylinder_type
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        cylinder.status.toLowerCase().includes(searchTerm.toLowerCase()),
    );
  },

  // Validate cylinder data
  validateCylinder: (
    cylinder: Partial<Cylinder>,
  ): { valid: boolean; error?: string } => {
    if (!cylinder.cylinder_number || cylinder.cylinder_number.trim() === "") {
      return { valid: false, error: "Cylinder number is required" };
    }
    if (!cylinder.cylinder_type || cylinder.cylinder_type.trim() === "") {
      return { valid: false, error: "Cylinder type is required" };
    }
    if (!cylinder.track_inventory) {
      return { valid: false, error: "Track inventory is required" };
    }
    if (!cylinder.status || cylinder.status.trim() === "") {
      return { valid: false, error: "Status is required" };
    }
    return { valid: true };
  },

  setCylinderStatus: async (
    cylinderId: number,
    status: string,
  ): Promise<Cylinder> => {
    const existing = cylindersCache.find((c) => c.id === cylinderId);
    if (!existing) {
      throw new Error(`Cylinder id ${cylinderId} not found`);
    }
    return cylinderMasterService.updateCylinder(cylinderId, {
      id: cylinderId,
      cylinder_number: existing.cylinder_number,
      cylinder_type: existing.cylinder_type,
      track_inventory: existing.track_inventory,
      status,
      active: existing.active,
    });
  },

  // ========== Helper Methods ==========

  // Get a single cylinder by ID
  getCylinderById: (id: number): Cylinder | undefined => {
    return cylindersCache.find((cylinder) => cylinder.id === id);
  },

  // Get a single cylinder by cylinder number (case-insensitive)
  getCylinderByCylinderNumber: (
    cylinderNumber: string,
  ): Cylinder | undefined => {
    return cylindersCache.find(
      (cylinder) =>
        cylinder.cylinder_number.toUpperCase() === cylinderNumber.toUpperCase(),
    );
  },

  // Check if a serial number exists (case-insensitive)
  serialNumberExists: (serialNumber: string, excludeId?: number): boolean => {
    return cylindersCache.some(
      (cylinder) =>
        cylinder.cylinder_number.toUpperCase() === serialNumber.toUpperCase() &&
        cylinder.id !== excludeId,
    );
  },

  // Get cylinders by type
  getCylindersByType: (cylinderType: string): Cylinder[] => {
    return cylindersCache.filter(
      (cylinder) => cylinder.cylinder_type === cylinderType,
    );
  },

  // Get cylinders by status
  getCylindersByStatus: (status: string): Cylinder[] => {
    return cylindersCache.filter((cylinder) => cylinder.status === status);
  },

  /** @deprecated use getCylindersByStatus */
  getCylindersByLocation: (status: string): Cylinder[] => {
    return cylinderMasterService.getCylindersByStatus(status);
  },

  // Get active cylinders only
  getActiveCylinders: (): Cylinder[] => {
    return cylindersCache.filter((cylinder) => cylinder.active);
  },

  // Get inactive cylinders only
  getInactiveCylinders: (): Cylinder[] => {
    return cylindersCache.filter((cylinder) => !cylinder.active);
  },

  // Get tracked cylinders (track_inventory = "True")
  getTrackedCylinders: (): Cylinder[] => {
    return cylindersCache.filter(
      (cylinder) => cylinder.track_inventory === "True",
    );
  },

  // Get untracked cylinders (track_inventory = "False")
  getUntrackedCylinders: (): Cylinder[] => {
    return cylindersCache.filter(
      (cylinder) => cylinder.track_inventory === "False",
    );
  },

  // Get cylinders that are checked out
  getCheckedOutCylinders: (): Cylinder[] => {
    return cylindersCache.filter(
      (cylinder) => cylinder.status === "Checked Out",
    );
  },

  // Get cylinders that are checked in
  getCheckedInCylinders: (): Cylinder[] => {
    return cylindersCache.filter(
      (cylinder) => cylinder.status === "Checked In",
    );
  },

  // Get clean cylinders (available)
  getCleanCylinders: (): Cylinder[] => {
    return cylindersCache.filter(
      (cylinder) => cylinder.status === "Clean Cylinder",
    );
  },

  // Get available cylinders (clean and active)
  getAvailableCylinders: (): Cylinder[] => {
    return cylindersCache.filter(
      (cylinder) => cylinder.status === "Clean Cylinder" && cylinder.active,
    );
  },

  // Get cylinders by type and status
  getCylindersByTypeAndStatus: (
    cylinderType: string,
    status: string,
  ): Cylinder[] => {
    return cylindersCache.filter(
      (cylinder) =>
        cylinder.cylinder_type === cylinderType && cylinder.status === status,
    );
  },

  // Get active cylinders by type
  getActiveCylindersByType: (cylinderType: string): Cylinder[] => {
    return cylindersCache.filter(
      (cylinder) => cylinder.cylinder_type === cylinderType && cylinder.active,
    );
  },

  // Get tracked cylinders by status
  getTrackedCylindersByStatus: (status: string): Cylinder[] => {
    return cylindersCache.filter(
      (cylinder) =>
        cylinder.status === status && cylinder.track_inventory === "True",
    );
  },

  // Count cylinders by type
  countCylindersByType: (cylinderType: string): number => {
    return cylindersCache.filter(
      (cylinder) => cylinder.cylinder_type === cylinderType,
    ).length;
  },

  // Count cylinders by status
  countCylindersByStatus: (status: string): number => {
    return cylindersCache.filter((cylinder) => cylinder.status === status)
      .length;
  },

  // Count active cylinders
  countActiveCylinders: (): number => {
    return cylindersCache.filter((cylinder) => cylinder.active).length;
  },

  // Count inactive cylinders
  countInactiveCylinders: (): number => {
    return cylindersCache.filter((cylinder) => !cylinder.active).length;
  },

  // Count tracked cylinders
  countTrackedCylinders: (): number => {
    return cylindersCache.filter(
      (cylinder) => cylinder.track_inventory === "True",
    ).length;
  },

  // Count available cylinders
  countAvailableCylinders: (): number => {
    return cylindersCache.filter(
      (cylinder) => cylinder.status === "Clean Cylinder" && cylinder.active,
    ).length;
  },

  // Get unique cylinder types
  getUniqueCylinderTypes: (): string[] => {
    const types = cylindersCache.map((c) => c.cylinder_type);
    return Array.from(new Set(types));
  },

  // Get unique statuses
  getUniqueStatuses: (): string[] => {
    const statuses = cylindersCache.map((c) => c.status);
    return Array.from(new Set(statuses));
  },

  // ========== Inventory Management Methods ==========

  // Check if cylinder is available for checkout
  isAvailableForCheckout: (serialNumber: string): boolean => {
    const cylinder = cylindersCache.find(
      (c) => c.cylinder_number === serialNumber,
    );
    return cylinder
      ? cylinder.status === "Clean Cylinder" && cylinder.active
      : false;
  },

  // Check if cylinder is currently checked out
  isCheckedOut: (serialNumber: string): boolean => {
    const cylinder = cylindersCache.find(
      (c) => c.cylinder_number === serialNumber,
    );
    return cylinder ? cylinder.status === "Checked Out" : false;
  },

  // Check if cylinder needs tracking
  needsTracking: (serialNumber: string): boolean => {
    const cylinder = cylindersCache.find(
      (c) => c.cylinder_number === serialNumber,
    );
    return cylinder ? cylinder.track_inventory === "True" : false;
  },

  // Get cylinder status (for display)
  getCylinderStatus: (serialNumber: string): string => {
    const cylinder = cylindersCache.find(
      (c) => c.cylinder_number === serialNumber,
    );
    if (!cylinder) return "Unknown";
    if (!cylinder.active) return "Inactive";
    return cylinder.status;
  },

  // ========== Statistics & Reporting Methods ==========

  // Get cylinder inventory statistics
  getCylinderStatistics: (): {
    total: number;
    active: number;
    inactive: number;
    tracked: number;
    untracked: number;
    available: number;
    checkedOut: number;
    checkedIn: number;
    byType: { [type: string]: number };
    byStatus: { [status: string]: number };
  } => {
    const stats = {
      total: cylindersCache.length,
      active: cylindersCache.filter((c) => c.active).length,
      inactive: cylindersCache.filter((c) => !c.active).length,
      tracked: cylindersCache.filter((c) => c.track_inventory === "True")
        .length,
      untracked: cylindersCache.filter((c) => c.track_inventory === "False")
        .length,
      available: cylindersCache.filter(
        (c) => c.status === "Clean Cylinder" && c.active,
      ).length,
      checkedOut: cylindersCache.filter((c) => c.status === "Checked Out")
        .length,
      checkedIn: cylindersCache.filter((c) => c.status === "Checked In")
        .length,
      byType: {} as { [type: string]: number },
      byStatus: {} as { [status: string]: number },
    };

    cylindersCache.forEach((cylinder) => {
      stats.byType[cylinder.cylinder_type] =
        (stats.byType[cylinder.cylinder_type] || 0) + 1;
      stats.byStatus[cylinder.status] =
        (stats.byStatus[cylinder.status] || 0) + 1;
    });

    return stats;
  },

  // Get inventory summary by type
  getInventorySummaryByType: (): {
    type: string;
    total: number;
    available: number;
    checkedOut: number;
    checkedIn: number;
  }[] => {
    const types = cylinderMasterService.getUniqueCylinderTypes();
    return types.map((type) => ({
      type,
      total: cylinderMasterService.countCylindersByType(type),
      available: cylindersCache.filter(
        (c) =>
          c.cylinder_type === type &&
          c.status === "Clean Cylinder" &&
          c.active,
      ).length,
      checkedOut: cylindersCache.filter(
        (c) => c.cylinder_type === type && c.status === "Checked Out",
      ).length,
      checkedIn: cylindersCache.filter(
        (c) => c.cylinder_type === type && c.status === "Checked In",
      ).length,
    }));
  },

  // Get low inventory alerts (less than threshold available)
  getLowInventoryAlerts: (
    threshold: number = 2,
  ): {
    type: string;
    available: number;
    threshold: number;
  }[] => {
    const types = cylinderMasterService.getUniqueCylinderTypes();
    const alerts: { type: string; available: number; threshold: number }[] = [];

    types.forEach((type) => {
      const available = cylindersCache.filter(
        (c) =>
          c.cylinder_type === type &&
          c.status === "Clean Cylinder" &&
          c.active,
      ).length;

      if (available < threshold) {
        alerts.push({ type, available, threshold });
      }
    });

    return alerts;
  },

  // ========== UI Helper Methods ==========

  // Get serial numbers for dropdown
  getSerialNumbers: (): string[] => {
    return cylindersCache.map((cylinder) => cylinder.cylinder_number);
  },

  // Get active serial numbers for dropdown
  getActiveSerialNumbers: (): string[] => {
    return cylindersCache
      .filter((cylinder) => cylinder.active)
      .map((cylinder) => cylinder.cylinder_number);
  },

  // Get available serial numbers for checkout
  getAvailableSerialNumbers: (): string[] => {
    return cylindersCache
      .filter(
        (cylinder) => cylinder.status === "Clean Cylinder" && cylinder.active,
      )
      .map((cylinder) => cylinder.cylinder_number);
  },

  // Get cylinder options for select components
  getCylinderOptions: (): { value: string; label: string }[] => {
    return cylindersCache.map((cylinder) => ({
      value: cylinder.cylinder_number,
      label: `${cylinder.cylinder_number} (${cylinder.cylinder_type} - ${cylinder.status})`,
    }));
  },

  // Get available cylinder options for select components
  getAvailableCylinderOptions: (): { value: string; label: string }[] => {
    return cylindersCache
      .filter(
        (cylinder) => cylinder.status === "Clean Cylinder" && cylinder.active,
      )
      .map((cylinder) => ({
        value: cylinder.cylinder_number,
        label: `${cylinder.cylinder_number} (${cylinder.cylinder_type})`,
      }));
  },

  // Get status badge styling
  getStatusBadge: (status: string): string => {
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

  /** @deprecated use getStatusBadge */
  getLocationBadge: (status: string): string => {
    return cylinderMasterService.getStatusBadge(status);
  },

  // Format cylinder display
  formatCylinderDisplay: (serialNumber: string): string => {
    const cylinder = cylindersCache.find(
      (c) => c.cylinder_number === serialNumber,
    );
    return cylinder
      ? `${cylinder.cylinder_number} (${cylinder.cylinder_type} - ${cylinder.status})`
      : serialNumber;
  },

  // Get cylinder type options
  getCylinderTypeOptions: (): string[] => {
    return cylinderTypes;
  },

  // Get status options
  getStatusOptions: (): string[] => {
    return [...cylinderStatusOptions];
  },

  /** @deprecated use getStatusOptions */
  getLocationOptions: (): string[] => {
    return cylinderMasterService.getStatusOptions();
  },

  // Get track inventory options
  getTrackInventoryOptions: (): string[] => {
    return trackInventoryOptions;
  },
};
