// Unified Role Module Service - Handles CRUD operations, search, validation, and helper methods
import { API_BASE_URL } from "../config/api";
import { authService } from "./authService";

export interface RoleModule {
  id: number;
  role_id: number;
  module_id: number;
  access_level: string;
  active: boolean;
  created_by: number;
}

type ApiRoleModule = {
  id: number;
  role_id: number;
  module_id: number;
  active: boolean;
  created_by_id: number | null;
};

let permissionsCache: RoleModule[] = [];
let permissionsLoaded = false;

const mapApiPermission = (permission: ApiRoleModule): RoleModule => ({
  id: permission.id,
  role_id: permission.role_id,
  module_id: permission.module_id,
  active: permission.active,
  access_level: "Full",
  created_by: permission.created_by_id ?? 0,
});

const buildAuthHeaders = (): HeadersInit => {
  const token = authService.getAuthState().token;
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

export const accessLevels = [
  "Full",
  "Read-only",
  "Read-only (Own Data)",
  "Create & Edit",
  "View Only",
];

export const roleModuleService = {
  // ========== CRUD Operations ==========

  // Get all role-module permissions
  getPermissions: (): RoleModule[] => {
    return permissionsCache;
  },

  // Fetch permissions from API (cached)
  fetchPermissions: async (force = false): Promise<RoleModule[]> => {
    if (permissionsLoaded && !force) return permissionsCache;

    const response = await fetch(`${API_BASE_URL}/role_modules`, {
      method: "GET",
      headers: buildAuthHeaders(),
    });

    if (!response.ok) {
      const message =
        response.status === 401 ? "Unauthorized" : "Failed to load permissions";
      throw new Error(message);
    }

    const data: ApiRoleModule[] = await response.json();
    permissionsCache = Array.isArray(data) ? data.map(mapApiPermission) : [];
    permissionsLoaded = true;
    return permissionsCache;
  },

  // Replace cached permissions (local updates)
  setPermissions: (permissions: RoleModule[]): void => {
    permissionsCache = permissions;
    permissionsLoaded = true;
  },

  // Add a new role-module permission
  addPermission: async (
    permission: Omit<RoleModule, "id" | "created_by">,
  ): Promise<RoleModule> => {
    const response = await fetch(`${API_BASE_URL}/role_modules`, {
      method: "POST",
      headers: buildAuthHeaders(),
      body: JSON.stringify({
        role_id: permission.role_id,
        module_id: permission.module_id,
        active: permission.active,
        created_by: 1,
      }),
    });

    if (!response.ok) {
      const message =
        response.status === 401
          ? "Unauthorized"
          : "Failed to create permission";
      throw new Error(message);
    }

    const data: ApiRoleModule = await response.json();
    const createdPermission = mapApiPermission(data);
    permissionsCache = [...permissionsCache, createdPermission];
    permissionsLoaded = true;
    return createdPermission;
  },

  // Update an existing role-module permission
  updatePermission: async (
    id: number,
    updatedPermission: Omit<RoleModule, "created_by">,
  ): Promise<RoleModule> => {
    const response = await fetch(`${API_BASE_URL}/role_modules/${id}`, {
      method: "PUT",
      headers: buildAuthHeaders(),
      body: JSON.stringify({
        role_id: updatedPermission.role_id,
        module_id: updatedPermission.module_id,
        active: updatedPermission.active,
        created_by: 1,
      }),
    });

    if (!response.ok) {
      const message =
        response.status === 401
          ? "Unauthorized"
          : "Failed to update permission";
      throw new Error(message);
    }

    const data: ApiRoleModule = await response.json();
    const savedPermission = mapApiPermission(data);
    permissionsCache = permissionsCache.map((permission) =>
      permission.id === id ? savedPermission : permission,
    );
    permissionsLoaded = true;
    return savedPermission;
  },

  // Delete a role-module permission
  deletePermission: async (id: number): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/role_modules/${id}`, {
      method: "DELETE",
      headers: buildAuthHeaders(),
    });

    if (!response.ok) {
      const message =
        response.status === 401
          ? "Unauthorized"
          : "Failed to delete permission";
      throw new Error(message);
    }

    permissionsCache = permissionsCache.filter(
      (permission) => permission.id !== id,
    );
    permissionsLoaded = true;
  },

  // Search permissions by role ID, module ID, or access level
  searchPermissions: (
    permissions: RoleModule[],
    searchTerm: string,
  ): RoleModule[] => {
    return permissions.filter(
      (permission) =>
        permission.role_id.toString().includes(searchTerm) ||
        permission.module_id.toString().includes(searchTerm) ||
        permission.access_level
          .toLowerCase()
          .includes(searchTerm.toLowerCase()),
    );
  },

  // Validate permission data
  validatePermission: (
    permission: Partial<RoleModule>,
  ): { valid: boolean; error?: string } => {
    if (!permission.role_id) {
      return { valid: false, error: "Role is required" };
    }
    if (!permission.module_id) {
      return { valid: false, error: "Module is required" };
    }
    if (!permission.access_level || permission.access_level.trim() === "") {
      return { valid: false, error: "Access level is required" };
    }
    return { valid: true };
  },

  // ========== Helper Methods ==========

  // Get a single permission by ID
  getPermissionById: (id: number): RoleModule | undefined => {
    return permissionsCache.find((permission) => permission.id === id);
  },

  // Get all permissions for a specific role ID
  getPermissionsByRoleId: (roleId: number): RoleModule[] => {
    return permissionsCache.filter(
      (permission) => permission.role_id === roleId,
    );
  },

  // Get all permissions for a specific module ID
  getPermissionsByModuleId: (moduleId: number): RoleModule[] => {
    return permissionsCache.filter(
      (permission) => permission.module_id === moduleId,
    );
  },

  // Get permissions by access level
  getPermissionsByAccessLevel: (accessLevel: string): RoleModule[] => {
    return permissionsCache.filter(
      (permission) => permission.access_level === accessLevel,
    );
  },

  // Get active permissions only
  getActivePermissions: (): RoleModule[] => {
    return permissionsCache.filter((permission) => permission.active);
  },

  // Get inactive permissions only
  getInactivePermissions: (): RoleModule[] => {
    return permissionsCache.filter((permission) => !permission.active);
  },

  // Get active permissions for a specific role ID
  getActivePermissionsByRoleId: (roleId: number): RoleModule[] => {
    return permissionsCache.filter(
      (permission) => permission.role_id === roleId && permission.active,
    );
  },

  // Get active permissions for a specific module ID
  getActivePermissionsByModuleId: (moduleId: number): RoleModule[] => {
    return permissionsCache.filter(
      (permission) => permission.module_id === moduleId && permission.active,
    );
  },

  // Check if a role has access to a specific module
  hasAccess: (roleId: number, moduleId: number): boolean => {
    return permissionsCache.some(
      (permission) =>
        permission.role_id === roleId &&
        permission.module_id === moduleId &&
        permission.active,
    );
  },

  // Check if a specific permission combination exists
  permissionExists: (
    roleId: number,
    moduleId: number,
    excludeId?: number,
  ): boolean => {
    return permissionsCache.some(
      (permission) =>
        permission.role_id === roleId &&
        permission.module_id === moduleId &&
        permission.id !== excludeId,
    );
  },

  // Get access level for a specific role-module combination
  getAccessLevel: (roleId: number, moduleId: number): string | undefined => {
    const permission = permissionsCache.find(
      (p) => p.role_id === roleId && p.module_id === moduleId && p.active,
    );
    return permission?.access_level;
  },

  // Count permissions by role ID
  countPermissionsByRoleId: (roleId: number): number => {
    return permissionsCache.filter(
      (permission) => permission.role_id === roleId,
    ).length;
  },

  // Count active permissions by role ID
  countActivePermissionsByRoleId: (roleId: number): number => {
    return permissionsCache.filter(
      (permission) => permission.role_id === roleId && permission.active,
    ).length;
  },

  // Count permissions by module ID
  countPermissionsByModuleId: (moduleId: number): number => {
    return permissionsCache.filter(
      (permission) => permission.module_id === moduleId,
    ).length;
  },

  // Count active permissions by module ID
  countActivePermissionsByModuleId: (moduleId: number): number => {
    return permissionsCache.filter(
      (permission) => permission.module_id === moduleId && permission.active,
    ).length;
  },

  // Count active permissions
  countActivePermissions: (): number => {
    return permissionsCache.filter((permission) => permission.active).length;
  },

  // Count inactive permissions
  countInactivePermissions: (): number => {
    return permissionsCache.filter((permission) => !permission.active).length;
  },

  // Get unique role IDs from permissions
  getUniqueRoleIds: (): number[] => {
    const roleIds = permissionsCache.map((p) => p.role_id);
    return Array.from(new Set(roleIds));
  },

  // Get unique module IDs from permissions
  getUniqueModuleIds: (): number[] => {
    const moduleIds = permissionsCache.map((p) => p.module_id);
    return Array.from(new Set(moduleIds));
  },

  // Get permission statistics
  getPermissionStatistics: (): {
    total: number;
    active: number;
    inactive: number;
    byRoleId: { [roleId: number]: number };
    byModuleId: { [moduleId: number]: number };
    byAccessLevel: { [level: string]: number };
  } => {
    const stats = {
      total: permissionsCache.length,
      active: permissionsCache.filter((p) => p.active).length,
      inactive: permissionsCache.filter((p) => !p.active).length,
      byRoleId: {} as { [roleId: number]: number },
      byModuleId: {} as { [moduleId: number]: number },
      byAccessLevel: {} as { [level: string]: number },
    };

    permissionsCache.forEach((permission) => {
      stats.byRoleId[permission.role_id] =
        (stats.byRoleId[permission.role_id] || 0) + 1;
      stats.byModuleId[permission.module_id] =
        (stats.byModuleId[permission.module_id] || 0) + 1;
      stats.byAccessLevel[permission.access_level] =
        (stats.byAccessLevel[permission.access_level] || 0) + 1;
    });

    return stats;
  },

  // Get role summary (permissions per role)
  getRoleSummary: (): {
    role_id: number;
    total: number;
    active: number;
    inactive: number;
    modules: number[];
  }[] => {
    const roleIds = roleModuleService.getUniqueRoleIds();
    return roleIds.map((roleId) => {
      const permissions = roleModuleService.getPermissionsByRoleId(roleId);
      return {
        role_id: roleId,
        total: permissions.length,
        active: permissions.filter((p) => p.active).length,
        inactive: permissions.filter((p) => !p.active).length,
        modules: Array.from(new Set(permissions.map((p) => p.module_id))),
      };
    });
  },

  // Get module summary (permissions per module)
  getModuleSummary: (): {
    module_id: number;
    total: number;
    active: number;
    inactive: number;
    roles: number[];
  }[] => {
    const moduleIds = roleModuleService.getUniqueModuleIds();
    return moduleIds.map((moduleId) => {
      const permissions = roleModuleService.getPermissionsByModuleId(moduleId);
      return {
        module_id: moduleId,
        total: permissions.length,
        active: permissions.filter((p) => p.active).length,
        inactive: permissions.filter((p) => !p.active).length,
        roles: Array.from(new Set(permissions.map((p) => p.role_id))),
      };
    });
  },

  // ========== UI Helper Methods ==========

  // Get access level badge styling
  getAccessLevelBadge: (level: string): string => {
    switch (level) {
      case "Full":
        return "bg-green-100 text-green-800";
      case "Read-only":
        return "bg-blue-100 text-blue-800";
      case "Read-only (Own Data)":
        return "bg-yellow-100 text-yellow-800";
      case "Create & Edit":
        return "bg-purple-100 text-purple-800";
      case "View Only":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  },

  // Get access levels for dropdown
  getAccessLevels: (): string[] => {
    return accessLevels;
  },

  // Get access level options for select components
  getAccessLevelOptions: (): { value: string; label: string }[] => {
    return accessLevels.map((level) => ({
      value: level,
      label: level,
    }));
  },

  // Get status badge styling
  getStatusBadge: (active: boolean): string => {
    return active ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800";
  },
};
