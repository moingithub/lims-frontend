// Unified Module Service - Handles CRUD operations, search, validation, and helper methods
import { API_BASE_URL } from "../config/api";
import { authService } from "./authService";

export interface Module {
  id: number;
  module_name: string;
  description: string;
  active: boolean;
  created_by: number;
}

type ApiModule = {
  id: number;
  name: string;
  description: string;
  active: boolean;
  created_by_id: number | null;
};

let modulesCache: Module[] = [];
let modulesLoaded = false;

const mapApiModule = (module: ApiModule): Module => ({
  id: module.id,
  module_name: module.name,
  description: module.description,
  active: module.active,
  created_by: module.created_by_id ?? 0,
});

const buildAuthHeaders = (): HeadersInit => {
  const token = authService.getAuthState().token;
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

export const modulesService = {
  // ========== CRUD Operations ==========

  // Get all modules
  getModules: (): Module[] => {
    return modulesCache;
  },

  // Fetch modules from API (cached)
  fetchModules: async (force = false): Promise<Module[]> => {
    if (modulesLoaded && !force) return modulesCache;

    const response = await fetch(`${API_BASE_URL}/modules`, {
      method: "GET",
      headers: buildAuthHeaders(),
    });

    if (!response.ok) {
      const message =
        response.status === 401 ? "Unauthorized" : "Failed to load modules";
      throw new Error(message);
    }

    const data: ApiModule[] = await response.json();
    modulesCache = Array.isArray(data) ? data.map(mapApiModule) : [];
    modulesLoaded = true;
    return modulesCache;
  },

  // Replace cached modules (local updates)
  setModules: (modules: Module[]): void => {
    modulesCache = modules;
    modulesLoaded = true;
  },

  // Add a new module
  addModule: async (
    module: Omit<Module, "id" | "created_by">,
  ): Promise<Module> => {
    const response = await fetch(`${API_BASE_URL}/modules`, {
      method: "POST",
      headers: buildAuthHeaders(),
      body: JSON.stringify({
        module_name: module.module_name,
        description: module.description,
        active: module.active,
      }),
    });

    if (!response.ok) {
      const message =
        response.status === 401 ? "Unauthorized" : "Failed to create module";
      throw new Error(message);
    }

    const data: ApiModule = await response.json();
    const createdModule = mapApiModule(data);
    modulesCache = [...modulesCache, createdModule];
    modulesLoaded = true;
    return createdModule;
  },

  // Update an existing module
  updateModule: async (
    id: number,
    updatedModule: Omit<Module, "created_by">,
  ): Promise<Module> => {
    const response = await fetch(`${API_BASE_URL}/modules/${id}`, {
      method: "PUT",
      headers: buildAuthHeaders(),
      body: JSON.stringify({
        module_name: updatedModule.module_name,
        description: updatedModule.description,
        active: updatedModule.active,
      }),
    });

    if (!response.ok) {
      const message =
        response.status === 401 ? "Unauthorized" : "Failed to update module";
      throw new Error(message);
    }

    const data: ApiModule = await response.json();
    const savedModule = mapApiModule(data);
    modulesCache = modulesCache.map((module) =>
      module.id === id ? savedModule : module,
    );
    modulesLoaded = true;
    return savedModule;
  },

  // Delete a module
  deleteModule: async (id: number): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/modules/${id}`, {
      method: "DELETE",
      headers: buildAuthHeaders(),
    });

    if (!response.ok) {
      const message =
        response.status === 401 ? "Unauthorized" : "Failed to delete module";
      throw new Error(message);
    }

    modulesCache = modulesCache.filter((module) => module.id !== id);
    modulesLoaded = true;
  },

  // Search modules by any field
  searchModules: (modules: Module[], searchTerm: string): Module[] => {
    return modules.filter((module) =>
      Object.values(module).some((value) =>
        String(value).toLowerCase().includes(searchTerm.toLowerCase()),
      ),
    );
  },

  // Validate module data
  validateModule: (
    module: Partial<Module>,
  ): { valid: boolean; error?: string } => {
    if (!module.module_name || module.module_name.trim() === "") {
      return { valid: false, error: "Module name is required" };
    }
    if (!module.description || module.description.trim() === "") {
      return { valid: false, error: "Description is required" };
    }
    return { valid: true };
  },

  // ========== Helper Methods ==========

  // Get a single module by ID
  getModuleById: (id: number): Module | undefined => {
    return modulesCache.find((module) => module.id === id);
  },

  // Get a single module by name
  getModuleByName: (moduleName: string): Module | undefined => {
    return modulesCache.find((module) => module.module_name === moduleName);
  },

  // Check if a module exists by name
  moduleExists: (moduleName: string): boolean => {
    return modulesCache.some((module) => module.module_name === moduleName);
  },

  // Get active modules only
  getActiveModules: (): Module[] => {
    return modulesCache.filter((module) => module.active);
  },

  // Get inactive modules only
  getInactiveModules: (): Module[] => {
    return modulesCache.filter((module) => !module.active);
  },

  // Count total active modules
  countActiveModules: (): number => {
    return modulesCache.filter((module) => module.active).length;
  },

  // Count total inactive modules
  countInactiveModules: (): number => {
    return modulesCache.filter((module) => !module.active).length;
  },

  // Get module names only (for dropdowns)
  getModuleNames: (): string[] => {
    return modulesCache.map((module) => module.module_name);
  },

  // Get active module names only (for dropdowns)
  getActiveModuleNames: (): string[] => {
    return modulesCache
      .filter((module) => module.active)
      .map((module) => module.module_name);
  },

  // Get module options for select components
  getModuleOptions: (): { value: number; label: string }[] => {
    return modulesCache.map((module) => ({
      value: module.id,
      label: module.module_name,
    }));
  },

  // Get active module options for select components
  getActiveModuleOptions: (): { value: number; label: string }[] => {
    return initialModules
      .filter((module) => module.active)
      .map((module) => ({
        value: module.id,
        label: module.module_name,
      }));
  },

  // Get module statistics
  getModuleStatistics: (): {
    total: number;
    active: number;
    inactive: number;
  } => {
    return {
      total: initialModules.length,
      active: initialModules.filter((m) => m.active).length,
      inactive: initialModules.filter((m) => !m.active).length,
    };
  },
};
