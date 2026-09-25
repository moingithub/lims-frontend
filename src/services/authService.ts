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

type StoredAuthState = AuthState & {
  access_token?: string;
  accessToken?: string;
};

let memoryAuthState: AuthState | null = null;

const asTokenString = (value: unknown): string | undefined => {
  if (typeof value === "string") {
    const trimmed = value.trim();
    return trimmed || undefined;
  }
  if (value && typeof value === "object") {
    const nested = value as Record<string, unknown>;
    return (
      asTokenString(nested.token) ??
      asTokenString(nested.access_token) ??
      asTokenString(nested.accessToken) ??
      asTokenString(nested.jwt)
    );
  }
  return undefined;
};

const pickTokenFromPayload = (data: Record<string, unknown>): string | undefined => {
  return (
    asTokenString(data.token) ??
    asTokenString(data.access_token) ??
    asTokenString(data.accessToken) ??
    asTokenString(data.jwt) ??
    asTokenString(data.id_token) ??
    (data.data && typeof data.data === "object"
      ? pickTokenFromPayload(data.data as Record<string, unknown>)
      : undefined) ??
    (data.user && typeof data.user === "object"
      ? asTokenString((data.user as Record<string, unknown>).token)
      : undefined)
  );
};

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

      const data = (await response.json()) as Record<string, unknown>;
      const apiUser = data.user as Partial<AuthUser> | undefined;
      const apiRole = data.role as
        | { id?: number; name?: string }
        | undefined;

      if (!apiUser || !apiRole) {
        return { success: false, error: "Invalid server response" };
      }

      const headerAuth =
        response.headers.get("Authorization") ??
        response.headers.get("authorization");
      const headerToken = headerAuth?.replace(/^Bearer\s+/i, "").trim();
      const token = pickTokenFromPayload(data) ?? (headerToken || undefined);
      if (!token) {
        return {
          success: false,
          error: "Login response did not include a token",
        };
      }

      const authUser: AuthUser = {
        id: apiUser.id ?? 0,
        name: apiUser.name ?? "",
        email: apiUser.email ?? "",
        role_id: apiRole.id ?? 0,
        role_name: apiRole.name ?? "",
        company_id: apiUser.company_id ?? null,
        company_name: apiUser.company_name ?? null,
        active: Boolean(apiUser.active),
      };

      const permissions: RoleModule[] = Array.isArray(data.permissions)
        ? data.permissions.map((permission: any) => ({
            id: permission.id,
            role_id: permission.role_id,
            module_id: permission.module_id,
            access_level: permission.access_level || "Full",
            active: permission.active,
            created_by: permission.created_by_id ?? 0,
            module_name: permission.module?.name,
          }))
        : [];

      authService.setAuthState({
        isAuthenticated: true,
        user: authUser,
        permissions,
        token,
      });

      return { success: true, user: authUser };
    } catch (error) {
      return { success: false, error: "Unable to reach server" };
    }
  },

  // Logout user
  logout: (): void => {
    memoryAuthState = null;
    localStorage.removeItem(AUTH_STORAGE_KEY);
  },

  // Clear only localStorage so a full page load shows login,
  // without dropping an in-memory token from the current session (HMR remounts).
  clearPersistedSession: (): void => {
    localStorage.removeItem(AUTH_STORAGE_KEY);
  },

  getAccessToken: (): string | undefined => {
    return authService.getAuthState().token;
  },

  // ========== Session Management ==========

  // Get current auth state from memory, then localStorage
  getAuthState: (): AuthState => {
    if (memoryAuthState?.token) {
      return memoryAuthState;
    }

    const stored = localStorage.getItem(AUTH_STORAGE_KEY);
    if (stored) {
      try {
        const state = JSON.parse(stored) as StoredAuthState;
        const token =
          asTokenString(state.token) ??
          asTokenString(state.access_token) ??
          asTokenString(state.accessToken);
        const resolved = { ...state, token };
        if (token) {
          memoryAuthState = resolved;
        }
        return resolved;
      } catch (e) {
        return { isAuthenticated: false, user: null, permissions: [] };
      }
    }
    return memoryAuthState ?? { isAuthenticated: false, user: null, permissions: [] };
  },

  // Set auth state to memory and localStorage
  setAuthState: (state: AuthState): void => {
    const token = asTokenString(state.token);
    memoryAuthState = { ...state, token };
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(memoryAuthState));
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

  // Check if current user has access to a module by stable backend name
  hasModuleAccessByName: (moduleName: string): boolean => {
    const permissions = authService.getCurrentUserPermissions();

    // Normalize helper to match backend-style names, e.g. "cylinder_checkout"
    const normalize = (name: string | undefined | null) =>
      (name || "").toString().toLowerCase().replace(/-/g, "_").trim();

    const target = normalize(moduleName);
    if (!target) return false;

    // Prefer matching by module_name coming from backend
    const byName = permissions.some(
      (p) => p.active && normalize(p.module_name) === target,
    );
    if (byName) return true;

    // Fallback: in case some permissions don't yet include module_name,
    // compare using known name->ID mapping where available.
    const moduleMap: { [key: string]: number } = {
      dashboard: 1,
    };

    const moduleId = moduleMap[target];
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
