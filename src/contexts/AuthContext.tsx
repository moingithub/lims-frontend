// Auth Context - Provides authentication state and methods to the entire app
import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { authService, AuthUser } from "../services/authService";
import { RoleModule } from "../services/roleModuleService";

interface AuthContextType {
  isAuthenticated: boolean;
  user: AuthUser | null;
  permissions: RoleModule[];
  login: (
    email: string,
    password: string,
  ) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  hasModuleAccess: (moduleId: number) => boolean;
  hasModuleAccessByName: (moduleName: string) => boolean;
  getModuleAccessLevel: (moduleId: number) => string | null;
  hasOwnDataRestriction: (moduleId: number) => boolean;
  isAdministrator: () => boolean;
  isEmployee: () => boolean;
  isCustomer: () => boolean;
  filterDataByAccess: <T extends { company_id?: number; created_by?: number }>(
    data: T[],
    moduleId: number,
  ) => T[];
  canViewRecord: (
    record: { company_id?: number; created_by?: number },
    moduleId: number,
  ) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [authState, setAuthState] = useState({
    isAuthenticated: false,
    user: null,
    permissions: [],
  });

  // Always start logged out so the login screen is shown on load
  useEffect(() => {
    authService.logout();
  }, []);

  const login = async (email: string, password: string) => {
    const result = await authService.login(email, password);
    if (result.success) {
      const newState = authService.getAuthState();
      setAuthState(newState);
    }
    return result;
  };

  const logout = () => {
    authService.logout();
    setAuthState({ isAuthenticated: false, user: null, permissions: [] });
  };

  const hasModuleAccess = (moduleId: number) => {
    return authState.permissions.some(
      (p) => p.module_id === moduleId && p.active,
    );
  };

  const hasModuleAccessByName = (moduleName: string) => {
    return authService.hasModuleAccessByName(moduleName);
  };

  const getModuleAccessLevel = (moduleId: number) => {
    const permission = authState.permissions.find(
      (p) => p.module_id === moduleId && p.active,
    );
    return permission?.access_level || null;
  };

  const hasOwnDataRestriction = (moduleId: number) => {
    const accessLevel = getModuleAccessLevel(moduleId);
    return accessLevel === "Read-only (Own Data)";
  };

  const isAdministrator = () => {
    return authState.user?.role_id === 1;
  };

  const isEmployee = () => {
    return authState.user?.role_id === 2;
  };

  const isCustomer = () => {
    return authState.user?.role_id === 3;
  };

  const filterDataByAccess = <
    T extends { company_id?: number; created_by?: number },
  >(
    data: T[],
    moduleId: number,
  ): T[] => {
    if (!authState.user) return [];

    // Administrator sees all data
    if (isAdministrator()) {
      return data;
    }

    // Check if user has "Own Data" restriction
    if (hasOwnDataRestriction(moduleId)) {
      // Customer sees only their company's data
      return data.filter((item) => {
        if (authState.user!.company_id && item.company_id) {
          return item.company_id === authState.user!.company_id;
        }
        // Fallback to created_by if company_id not available
        return item.created_by === authState.user!.id;
      });
    }

    // Employee with full access sees all data
    return data;
  };

  const canViewRecord = (
    record: { company_id?: number; created_by?: number },
    moduleId: number,
  ): boolean => {
    if (!authState.user) return false;

    // Administrator can view all
    if (isAdministrator()) return true;

    // Check access level
    if (hasOwnDataRestriction(moduleId)) {
      // Customer can only view their company's data
      if (authState.user.company_id && record.company_id) {
        return record.company_id === authState.user.company_id;
      }
      // Fallback to created_by
      return record.created_by === authState.user.id;
    }

    // Full access users can view all
    return true;
  };

  const value: AuthContextType = {
    isAuthenticated: authState.isAuthenticated,
    user: authState.user,
    permissions: authState.permissions,
    login,
    logout,
    hasModuleAccess,
    hasModuleAccessByName,
    getModuleAccessLevel,
    hasOwnDataRestriction,
    isAdministrator,
    isEmployee,
    isCustomer,
    filterDataByAccess,
    canViewRecord,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
