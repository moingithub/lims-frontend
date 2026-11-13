import {
  CYLINDER_STATUS_CHECKED_IN,
  CYLINDER_STATUS_CHECKED_OUT,
  CYLINDER_STATUS_CLEAN,
  Cylinder,
  cylinderMasterService,
} from "./cylinderMasterService";
import { getCurrentDateUS } from "../utils/dateUtils";

/** Cylinders in this status are ready to be cleaned (returned from check-in). */
export const RETURNED_FOR_CLEANING_STATUS = CYLINDER_STATUS_CHECKED_IN;

export const CLEAN_CYLINDER_STATUS = CYLINDER_STATUS_CLEAN;

export interface CylinderCleanupLine {
  cylinderId: number;
  cylinderNumber: string;
  cylinderType: string;
  cleanupDate: string;
}

function rejectCleanupByStatus(
  cylinderNumber: string,
  status: string,
): { valid: false; error: string } {
  if (status === CYLINDER_STATUS_CHECKED_OUT) {
    return {
      valid: false,
      error: `Cylinder "${cylinderNumber}" is checked out and cannot be cleaned up. Check it in first, then add it here when status is "${CYLINDER_STATUS_CHECKED_IN}".`,
    };
  }

  if (status === CYLINDER_STATUS_CLEAN) {
    return {
      valid: false,
      error: `Cylinder "${cylinderNumber}" is already clean (${CYLINDER_STATUS_CLEAN}). Only "${CYLINDER_STATUS_CHECKED_IN}" cylinders can be cleaned up.`,
    };
  }

  if (status !== CYLINDER_STATUS_CHECKED_IN) {
    return {
      valid: false,
      error: `Cylinder "${cylinderNumber}" cannot be cleaned up. Current status is "${status}". Only "${CYLINDER_STATUS_CHECKED_IN}" cylinders are allowed.`,
    };
  }

  return {
    valid: false,
    error: `Cylinder "${cylinderNumber}" cannot be cleaned up.`,
  };
}

export const cylinderCleanupService = {
  normalizeCylinderNumber: (value: string): string => value.trim().toUpperCase(),

  validateCylinderForCleanup: (
    rawNumber: string,
    queued: CylinderCleanupLine[],
    cylinders?: Cylinder[],
  ): { valid: boolean; error?: string; cylinder?: Cylinder } => {
    const normalized = cylinderCleanupService.normalizeCylinderNumber(rawNumber);
    if (!normalized) {
      return { valid: false, error: "Enter a cylinder number" };
    }

    const cylinder =
      cylinders?.find(
        (row) => row.cylinder_number.toUpperCase() === normalized,
      ) ?? cylinderMasterService.getCylinderByCylinderNumber(normalized);

    if (!cylinder) {
      return {
        valid: false,
        error: `Cylinder number "${normalized}" was not found in Cylinder Master.`,
      };
    }

    if (!cylinder.active) {
      return {
        valid: false,
        error: `Cylinder "${normalized}" is inactive and cannot be cleaned up.`,
      };
    }

    if (cylinder.status !== RETURNED_FOR_CLEANING_STATUS) {
      return rejectCleanupByStatus(normalized, cylinder.status);
    }

    if (queued.some((row) => row.cylinderId === cylinder.id)) {
      return {
        valid: false,
        error: `Cylinder "${normalized}" is already in the list.`,
      };
    }

    return { valid: true, cylinder };
  },

  buildCleanupLine: (cylinder: Cylinder): CylinderCleanupLine => ({
    cylinderId: cylinder.id,
    cylinderNumber: cylinder.cylinder_number,
    cylinderType: cylinder.cylinder_type,
    cleanupDate: getCurrentDateUS(),
  }),

  confirmCleanUp: async (lines: CylinderCleanupLine[]): Promise<void> => {
    if (lines.length === 0) {
      throw new Error("Add at least one cylinder before confirming.");
    }

    await cylinderMasterService.fetchCylinders(true);

    for (const line of lines) {
      const cylinder = cylinderMasterService.getCylinderById(line.cylinderId);
      if (!cylinder) {
        throw new Error(
          `Cylinder "${line.cylinderNumber}" was not found. Refresh and try again.`,
        );
      }
      if (!cylinder.active) {
        throw new Error(
          `Cylinder "${line.cylinderNumber}" is inactive and cannot be cleaned up.`,
        );
      }
      if (cylinder.status !== CYLINDER_STATUS_CHECKED_IN) {
        const rejection = rejectCleanupByStatus(
          line.cylinderNumber,
          cylinder.status,
        );
        throw new Error(rejection.error);
      }
    }

    await Promise.all(
      lines.map((line) =>
        cylinderMasterService.setCylinderStatus(
          line.cylinderId,
          CLEAN_CYLINDER_STATUS,
        ),
      ),
    );
  },
};
