// Unified Cylinder Master Service - Handles CRUD operations, search, validation, inventory tracking, and helper methods
import { API_BASE_URL } from "../config/api";
import { authService } from "./authService";

export interface Cylinder {
  id: number;
  cylinder_number: string;
  cylinder_type: string;
  track_inventory: string;
  location: string;
  active: boolean;
  created_by: number;
}

type ApiCylinder = {
  id: number;
  cylinder_number: string;
  cylinder_type: string;
  track_inventory: boolean;
  location: string;
  active: boolean;
  created_by_id: number | null;
};

let cylindersCache: Cylinder[] = [];
let cylindersLoaded = false;

const mapApiCylinder = (cylinder: ApiCylinder): Cylinder => ({
  id: cylinder.id,
  cylinder_number: cylinder.cylinder_number,
  cylinder_type: cylinder.cylinder_type,
  track_inventory: cylinder.track_inventory ? "True" : "False",
  location: cylinder.location,
  active: cylinder.active,
  created_by: cylinder.created_by_id ?? 0,
});

const buildAuthHeaders = (): HeadersInit => {
  const token = authService.getAuthState().token;
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

export const cylinderTypes = ["Gas", "Liquid"];
export const trackInventoryOptions = ["True", "False"];
export const locationOptions = ["Clean Cylinder", "Checked Out", "Checked In"];

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
      const message =
        response.status === 401 ? "Unauthorized" : "Failed to load cylinders";
      throw new Error(message);
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
        location: cylinder.location,
        active: cylinder.active,
      }),
    });

    if (!response.ok) {
      let message = "Failed to create cylinder";
      try {
        const errorData = await response.json();
        // Try to extract error from common structures
        if (errorData) {
          if (typeof errorData.message === "string") {
            message = errorData.message;
          } else if (typeof errorData.error === "string") {
            message = errorData.error;
          } else if (errorData.errors && typeof errorData.errors === "object") {
            // Look for cylinder_number errors
            if (Array.isArray(errorData.errors.cylinder_number)) {
              message = errorData.errors.cylinder_number.join(" ");
            } else {
              // Fallback: join all error messages
              message = Object.values(errorData.errors).flat().join(" ");
            }
          } else if (typeof errorData === "string") {
            message = errorData;
          }
        }
        // Refine known error
        if (message.includes("cylinder_number must be unique")) {
          message =
            "Cylinder number already exists. Please use a unique cylinder number.";
        }
      } catch (e) {
        // fallback to status text if JSON parse fails
        if (response.status === 401) {
          message = "Unauthorized";
        } else if (response.statusText) {
          message = response.statusText;
        }
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
        location: updatedCylinder.location,
        active: updatedCylinder.active,
      }),
    });

    if (!response.ok) {
      const message =
        response.status === 401 ? "Unauthorized" : "Failed to update cylinder";
      throw new Error(message);
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
      const message =
        response.status === 401 ? "Unauthorized" : "Failed to delete cylinder";
      throw new Error(message);
    }

    cylindersCache = cylindersCache.filter((cylinder) => cylinder.id !== id);
    cylindersLoaded = true;
  },

  // Search cylinders by cylinder number, type, or location
  searchCylinders: (cylinders: Cylinder[], searchTerm: string): Cylinder[] => {
    return cylinders.filter(
      (cylinder) =>
        cylinder.cylinder_number
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        cylinder.cylinder_type
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        cylinder.location.toLowerCase().includes(searchTerm.toLowerCase()),
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
    if (!cylinder.location || cylinder.location.trim() === "") {
      return { valid: false, error: "Location is required" };
    }
    return { valid: true };
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

  // Get cylinders by location
  getCylindersByLocation: (location: string): Cylinder[] => {
    return cylindersCache.filter((cylinder) => cylinder.location === location);
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
      (cylinder) => cylinder.location === "Checked Out",
    );
  },

  // Get cylinders that are checked in
  getCheckedInCylinders: (): Cylinder[] => {
    return cylindersCache.filter(
      (cylinder) => cylinder.location === "Checked In",
    );
  },

  // Get clean cylinders (available)
  getCleanCylinders: (): Cylinder[] => {
    return cylindersCache.filter(
      (cylinder) => cylinder.location === "Clean Cylinder",
    );
  },

  // Get available cylinders (clean and active)
  getAvailableCylinders: (): Cylinder[] => {
    return cylindersCache.filter(
      (cylinder) => cylinder.location === "Clean Cylinder" && cylinder.active,
    );
  },

  // Get cylinders by type and location
  getCylindersByTypeAndLocation: (
    cylinderType: string,
    location: string,
  ): Cylinder[] => {
    return cylindersCache.filter(
      (cylinder) =>
        cylinder.cylinder_type === cylinderType &&
        cylinder.location === location,
    );
  },

  // Get active cylinders by type
  getActiveCylindersByType: (cylinderType: string): Cylinder[] => {
    return cylindersCache.filter(
      (cylinder) => cylinder.cylinder_type === cylinderType && cylinder.active,
    );
  },

  // Get tracked cylinders by location
  getTrackedCylindersByLocation: (location: string): Cylinder[] => {
    return cylindersCache.filter(
      (cylinder) =>
        cylinder.location === location && cylinder.track_inventory === "True",
    );
  },

  // Count cylinders by type
  countCylindersByType: (cylinderType: string): number => {
    return cylindersCache.filter(
      (cylinder) => cylinder.cylinder_type === cylinderType,
    ).length;
  },

  // Count cylinders by location
  countCylindersByLocation: (location: string): number => {
    return cylindersCache.filter((cylinder) => cylinder.location === location)
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
      (cylinder) => cylinder.location === "Clean Cylinder" && cylinder.active,
    ).length;
  },

  // Get unique cylinder types
  getUniqueCylinderTypes: (): string[] => {
    const types = cylindersCache.map((c) => c.cylinder_type);
    return Array.from(new Set(types));
  },

  // Get unique locations
  getUniqueLocations: (): string[] => {
    const locations = cylindersCache.map((c) => c.location);
    return Array.from(new Set(locations));
  },

  // ========== Inventory Management Methods ==========

  // Check if cylinder is available for checkout
  isAvailableForCheckout: (serialNumber: string): boolean => {
    const cylinder = cylindersCache.find(
      (c) => c.cylinder_number === serialNumber,
    );
    return cylinder
      ? cylinder.location === "Clean Cylinder" && cylinder.active
      : false;
  },

  // Check if cylinder is currently checked out
  isCheckedOut: (serialNumber: string): boolean => {
    const cylinder = cylindersCache.find(
      (c) => c.cylinder_number === serialNumber,
    );
    return cylinder ? cylinder.location === "Checked Out" : false;
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
    return cylinder.location;
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
    byLocation: { [location: string]: number };
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
        (c) => c.location === "Clean Cylinder" && c.active,
      ).length,
      checkedOut: cylindersCache.filter((c) => c.location === "Checked Out")
        .length,
      checkedIn: cylindersCache.filter((c) => c.location === "Checked In")
        .length,
      byType: {} as { [type: string]: number },
      byLocation: {} as { [location: string]: number },
    };

    cylindersCache.forEach((cylinder) => {
      stats.byType[cylinder.cylinder_type] =
        (stats.byType[cylinder.cylinder_type] || 0) + 1;
      stats.byLocation[cylinder.location] =
        (stats.byLocation[cylinder.location] || 0) + 1;
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
          c.location === "Clean Cylinder" &&
          c.active,
      ).length,
      checkedOut: cylindersCache.filter(
        (c) => c.cylinder_type === type && c.location === "Checked Out",
      ).length,
      checkedIn: cylindersCache.filter(
        (c) => c.cylinder_type === type && c.location === "Checked In",
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
          c.location === "Clean Cylinder" &&
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
        (cylinder) => cylinder.location === "Clean Cylinder" && cylinder.active,
      )
      .map((cylinder) => cylinder.cylinder_number);
  },

  // Get cylinder options for select components
  getCylinderOptions: (): { value: string; label: string }[] => {
    return cylindersCache.map((cylinder) => ({
      value: cylinder.cylinder_number,
      label: `${cylinder.cylinder_number} (${cylinder.cylinder_type} - ${cylinder.location})`,
    }));
  },

  // Get available cylinder options for select components
  getAvailableCylinderOptions: (): { value: string; label: string }[] => {
    return cylindersCache
      .filter(
        (cylinder) => cylinder.location === "Clean Cylinder" && cylinder.active,
      )
      .map((cylinder) => ({
        value: cylinder.cylinder_number,
        label: `${cylinder.cylinder_number} (${cylinder.cylinder_type})`,
      }));
  },

  // Get location badge styling
  getLocationBadge: (location: string): string => {
    switch (location) {
      case "Clean Cylinder":
        return "bg-green-100 text-green-800";
      case "Checked Out":
        return "bg-blue-100 text-blue-800";
      case "Checked In":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  },

  // Format cylinder display
  formatCylinderDisplay: (serialNumber: string): string => {
    const cylinder = cylindersCache.find(
      (c) => c.cylinder_number === serialNumber,
    );
    return cylinder
      ? `${cylinder.cylinder_number} (${cylinder.cylinder_type} - ${cylinder.location})`
      : serialNumber;
  },

  // Get cylinder type options
  getCylinderTypeOptions: (): string[] => {
    return cylinderTypes;
  },

  // Get location options
  getLocationOptions: (): string[] => {
    return locationOptions;
  },

  // Get track inventory options
  getTrackInventoryOptions: (): string[] => {
    return trackInventoryOptions;
  },
};
