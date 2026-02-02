// Authentication Service - Manages user login, logout, and session state
import { RoleModule } from "./roleModuleService";
import { API_BASE_URL } from "../config/api";

export interface AuthUser {
  id: number;
  name: string;
  email: string;
  role_id: number;
  role_name: string;
  company_id?: number | null;
  company_name?: string | null;
  active: boolean;
}

export interface AuthState {
  isAuthenticated: boolean;
  user: AuthUser | null;
  permissions: RoleModule[];
  token?: string;
}

const AUTH_STORAGE_KEY = "natty_gas_auth";

export const authService = {
  // ========== Authentication ==========

  // Login user with email and password
  login: async (
    email: string,
    password: string,
  ): Promise<{ success: boolean; error?: string; user?: AuthUser }> => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const message =
          response.status === 401 ? "Invalid credentials" : "Login failed";
        return { success: false, error: message };
      }

      const data = await response.json();

      if (!data?.user || !data?.role) {
        return { success: false, error: "Invalid server response" };
      }

      const authUser: AuthUser = {
        id: data.user.id,
        name: data.user.name,
        email: data.user.email,
        role_id: data.role.id,
        role_name: data.role.name,
        company_id: data.user.company_id ?? null,
        company_name: data.user.company_name ?? null,
        active: data.user.active,
      };

      const permissions: RoleModule[] = Array.isArray(data.permissions)
        ? data.permissions.map((permission: any) => ({
            id: permission.id,
            role_id: permission.role_id,
            module_id: permission.module_id,
            access_level: permission.access_level || "Full",
            active: permission.active,
            created_by: permission.created_by_id ?? 0,
          }))
        : [];

      authService.setAuthState({
        isAuthenticated: true,
        user: authUser,
        permissions,
        token: data.token,
      });

      return { success: true, user: authUser };
    } catch (error) {
      return { success: false, error: "Unable to reach server" };
    }
  },

  // Logout user
  logout: (): void => {
    localStorage.removeItem(AUTH_STORAGE_KEY);
  },

  // ========== Session Management ==========

  // Get current auth state from localStorage
  getAuthState: (): AuthState => {
    const stored = localStorage.getItem(AUTH_STORAGE_KEY);
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch (e) {
        return { isAuthenticated: false, user: null, permissions: [] };
      }
    }
    return { isAuthenticated: false, user: null, permissions: [] };
  },

  // Set auth state to localStorage
  setAuthState: (state: AuthState): void => {
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(state));
  },

  // Check if user is authenticated
  isAuthenticated: (): boolean => {
    const state = authService.getAuthState();
    return state.isAuthenticated && state.user !== null;
  },

  // Get current user
  getCurrentUser: (): AuthUser | null => {
    const state = authService.getAuthState();
    return state.user;
  },

  // Get current user's permissions
  getCurrentUserPermissions: (): RoleModule[] => {
    const state = authService.getAuthState();
    return state.permissions || [];
  },

  // ========== Permission Checks ==========

  // Check if current user has access to a module
  hasModuleAccess: (moduleId: number): boolean => {
    const permissions = authService.getCurrentUserPermissions();
    return permissions.some((p) => p.module_id === moduleId && p.active);
  },

  // Check if current user has access to a module by name
  hasModuleAccessByName: (moduleName: string): boolean => {
    const permissions = authService.getCurrentUserPermissions();
    // This would need to be enhanced to map module names to IDs
    // For now, we'll use a simple mapping
    const moduleMap: { [key: string]: number } = {
      Dashboard: 1,
      "Cylinder Check-Out": 2,
      "Sample Check-In": 3,
      "Work Orders": 4,
      "Generate Invoice": 5,
      Invoices: 6,
      "Analysis Pricing": 7,
      "Cylinder Master": 8,
      "Company Master": 9,
      Contacts: 10,
      "Company Areas": 11,
      "Import Machine Report": 12,
      "Cylinder Inventory": 13,
      "Analysis Reports": 14,
      "Pending Work Orders": 15,
      Roles: 16,
      Users: 17,
      Modules: 18,
      "Role Module": 19,
    };

    const moduleId = moduleMap[moduleName];
    if (!moduleId) return false;

    return permissions.some((p) => p.module_id === moduleId && p.active);
  },

  // Get access level for a module
  getModuleAccessLevel: (moduleId: number): string | null => {
    const permissions = authService.getCurrentUserPermissions();
    const permission = permissions.find(
      (p) => p.module_id === moduleId && p.active,
    );
    return permission?.access_level || null;
  },

  // Check if user has "Own Data" restriction
  hasOwnDataRestriction: (moduleId: number): boolean => {
    const accessLevel = authService.getModuleAccessLevel(moduleId);
    return accessLevel === "Read-only (Own Data)";
  },

  // Check if user is administrator
  isAdministrator: (): boolean => {
    const user = authService.getCurrentUser();
    return user?.role_id === 1; // Role ID 1 is Administrator
  },

  // Check if user is employee
  isEmployee: (): boolean => {
    const user = authService.getCurrentUser();
    return user?.role_id === 2; // Role ID 2 is Employee
  },

  // Check if user is customer
  isCustomer: (): boolean => {
    const user = authService.getCurrentUser();
    return user?.role_id === 3; // Role ID 3 is Customer
  },

  // Get accessible module IDs for current user
  getAccessibleModuleIds: (): number[] => {
    const permissions = authService.getCurrentUserPermissions();
    return permissions.filter((p) => p.active).map((p) => p.module_id);
  },

  // ========== Data Filtering Helpers ==========

  // Filter data based on user's access level
  filterDataByAccess: <T extends { company_id?: number; created_by?: number }>(
    data: T[],
    moduleId: number,
  ): T[] => {
    const user = authService.getCurrentUser();
    if (!user) return [];

    // Administrator sees all data
    if (authService.isAdministrator()) {
      return data;
    }

    // Check if user has "Own Data" restriction
    if (authService.hasOwnDataRestriction(moduleId)) {
      // Customer sees only data they created
      return data.filter((item) => item.created_by === user.id);
    }

    // Employee with full access sees all data
    return data;
  },

  // Check if user can view a specific record
  canViewRecord: (
    record: { company_id?: number; created_by?: number },
    moduleId: number,
  ): boolean => {
    const user = authService.getCurrentUser();
    if (!user) return false;

    // Administrator can view all
    if (authService.isAdministrator()) return true;

    // Check access level
    if (authService.hasOwnDataRestriction(moduleId)) {
      // Customer can only view their own data
      return record.created_by === user.id;
    }

    // Full access users can view all
    return true;
  },

  // ========== UI Helpers ==========

  // Get user display name
  getUserDisplayName: (): string => {
    const user = authService.getCurrentUser();
    return user?.name || "Guest";
  },

  // Get user role display name
  getUserRoleDisplayName: (): string => {
    const user = authService.getCurrentUser();
    return user?.role_name || "Unknown";
  },
};
