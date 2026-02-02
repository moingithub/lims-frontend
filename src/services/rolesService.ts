// Unified Role Service - Handles both CRUD operations and dropdown options
import { API_BASE_URL } from "../config/api";
import { authService } from "./authService";

export interface Role {
  id: number;
  role_name: string;
  description: string;
  active: boolean;
  created_by: number;
}

type ApiRole = {
  id: number;
  name: string;
  description: string;
  active: boolean;
  created_by_id: number | null;
};

let rolesCache: Role[] = [];
let rolesLoaded = false;

const mapApiRole = (role: ApiRole): Role => ({
  id: role.id,
  role_name: role.name,
  description: role.description,
  active: role.active,
  created_by: role.created_by_id ?? 0,
});

const buildAuthHeaders = (): HeadersInit => {
  const token = authService.getAuthState().token;
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

export const rolesService = {
  // ========== CRUD Operations ==========

  // Get all roles
  getRoles: (): Role[] => {
    return rolesCache;
  },

  // Fetch roles from API (cached)
  fetchRoles: async (force = false): Promise<Role[]> => {
    if (rolesLoaded && !force) return rolesCache;

    const response = await fetch(`${API_BASE_URL}/roles`, {
      method: "GET",
      headers: buildAuthHeaders(),
    });

    if (!response.ok) {
      const message =
        response.status === 401 ? "Unauthorized" : "Failed to load roles";
      throw new Error(message);
    }

    const data: ApiRole[] = await response.json();
    rolesCache = Array.isArray(data) ? data.map(mapApiRole) : [];
    rolesLoaded = true;
    return rolesCache;
  },

  // Replace cached roles (local updates)
  setRoles: (roles: Role[]): void => {
    rolesCache = roles;
    rolesLoaded = true;
  },

  // Add a new role
  addRole: async (role: Omit<Role, "id" | "created_by">): Promise<Role> => {
    const response = await fetch(`${API_BASE_URL}/roles`, {
      method: "POST",
      headers: buildAuthHeaders(),
      body: JSON.stringify({
        name: role.role_name,
        description: role.description,
        active: role.active,
      }),
    });

    if (!response.ok) {
      const message =
        response.status === 401 ? "Unauthorized" : "Failed to create role";
      throw new Error(message);
    }

    const data: ApiRole = await response.json();
    const createdRole = mapApiRole(data);
    rolesCache = [...rolesCache, createdRole];
    rolesLoaded = true;
    return createdRole;
  },

  // Update an existing role
  updateRole: async (
    id: number,
    updatedRole: Omit<Role, "created_by">,
  ): Promise<Role> => {
    const response = await fetch(`${API_BASE_URL}/roles/${id}`, {
      method: "PUT",
      headers: buildAuthHeaders(),
      body: JSON.stringify({
        name: updatedRole.role_name,
        description: updatedRole.description,
        active: updatedRole.active,
      }),
    });

    if (!response.ok) {
      const message =
        response.status === 401 ? "Unauthorized" : "Failed to update role";
      throw new Error(message);
    }

    const data: ApiRole = await response.json();
    const savedRole = mapApiRole(data);
    rolesCache = rolesCache.map((role) => (role.id === id ? savedRole : role));
    rolesLoaded = true;
    return savedRole;
  },

  // Delete a role
  deleteRole: async (id: number): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/roles/${id}`, {
      method: "DELETE",
      headers: buildAuthHeaders(),
    });

    if (!response.ok) {
      const message =
        response.status === 401 ? "Unauthorized" : "Failed to delete role";
      throw new Error(message);
    }

    rolesCache = rolesCache.filter((role) => role.id !== id);
    rolesLoaded = true;
  },

  // Search roles by any field
  searchRoles: (roles: Role[], searchTerm: string): Role[] => {
    return roles.filter((role) =>
      Object.values(role).some((value) =>
        String(value).toLowerCase().includes(searchTerm.toLowerCase()),
      ),
    );
  },

  // Validate role data
  validateRole: (role: Partial<Role>): { valid: boolean; error?: string } => {
    if (!role.role_name || role.role_name.trim() === "") {
      return { valid: false, error: "Role name is required" };
    }
    if (!role.description || role.description.trim() === "") {
      return { valid: false, error: "Description is required" };
    }
    return { valid: true };
  },

  // ========== Helper Methods for Dropdowns ==========

  // Get a single role by ID
  getRoleById: (id: number): Role | undefined => {
    return rolesCache.find((role) => role.id === id);
  },

  // Get a single role by name
  getRoleByName: (roleName: string): Role | undefined => {
    return rolesCache.find((role) => role.role_name === roleName);
  },

  // Get role names only (for simple dropdowns)
  getRoleNames: (): string[] => {
    return rolesCache.map((role) => role.role_name);
  },

  // Get role options for select components (by ID)
  getRoleOptions: (): { value: number; label: string }[] => {
    return rolesCache.map((role) => ({
      value: role.id,
      label: role.role_name,
    }));
  },

  // Get active role options
  getActiveRoleOptions: (): { value: number; label: string }[] => {
    return rolesCache
      .filter((role) => role.active)
      .map((role) => ({
        value: role.id,
        label: role.role_name,
      }));
  },

  // Check if a role exists by name
  roleExists: (roleName: string): boolean => {
    return rolesCache.some((role) => role.role_name === roleName);
  },

  // Check if a role exists by ID
  roleExistsById: (id: number): boolean => {
    return rolesCache.some((role) => role.id === id);
  },

  // Get active roles only
  getActiveRoles: (): Role[] => {
    return rolesCache.filter((role) => role.active);
  },

  // Get inactive roles only
  getInactiveRoles: (): Role[] => {
    return rolesCache.filter((role) => !role.active);
  },
};
