// Unified Company Area Service - Handles CRUD operations, search, validation, geographic management, and helper methods
import { API_BASE_URL } from "../config/api";
import { authService } from "./authService";

export interface CompanyArea {
  id: number;
  company_id: number;
  area: string;
  region: string;
  description: string;
  active: boolean;
  created_by: number;
}

type ApiCompanyArea = {
  id: number;
  company_id: number;
  area: string;
  region: string;
  description: string;
  active: boolean;
  created_by_id: number | null;
};

let companyAreasCache: CompanyArea[] = [];
let companyAreasLoaded = false;

const mapApiCompanyArea = (area: ApiCompanyArea): CompanyArea => ({
  id: area.id,
  company_id: area.company_id,
  area: area.area,
  region: area.region,
  description: area.description,
  active: area.active,
  created_by: area.created_by_id ?? 0,
});

const buildAuthHeaders = (): HeadersInit => {
  const token = authService.getAuthState().token;
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

export const companyAreaService = {
  // ========== CRUD Operations ==========

  // Get all company areas
  getCompanyAreas: (): CompanyArea[] => {
    return companyAreasCache;
  },

  // Fetch company areas from API (cached)
  fetchCompanyAreas: async (force = false): Promise<CompanyArea[]> => {
    if (companyAreasLoaded && !force) return companyAreasCache;

    const response = await fetch(`${API_BASE_URL}/company_areas`, {
      method: "GET",
      headers: buildAuthHeaders(),
    });

    if (!response.ok) {
      const message =
        response.status === 401
          ? "Unauthorized"
          : "Failed to load company areas";
      throw new Error(message);
    }

    const data: ApiCompanyArea[] = await response.json();
    companyAreasCache = Array.isArray(data) ? data.map(mapApiCompanyArea) : [];
    companyAreasLoaded = true;
    return companyAreasCache;
  },

  // Replace cached company areas (local updates)
  setCompanyAreas: (areas: CompanyArea[]): void => {
    companyAreasCache = areas;
    companyAreasLoaded = true;
  },

  // Add a new company area
  addCompanyArea: async (
    companyArea: Omit<CompanyArea, "id" | "created_by">,
  ): Promise<CompanyArea> => {
    const response = await fetch(`${API_BASE_URL}/company_areas`, {
      method: "POST",
      headers: buildAuthHeaders(),
      body: JSON.stringify({
        company_id: companyArea.company_id,
        area: companyArea.area,
        region: companyArea.region,
        description: companyArea.description,
        active: companyArea.active,
      }),
    });

    if (!response.ok) {
      const message =
        response.status === 401
          ? "Unauthorized"
          : "Failed to create company area";
      throw new Error(message);
    }

    const data: ApiCompanyArea = await response.json();
    const createdArea = mapApiCompanyArea(data);
    companyAreasCache = [...companyAreasCache, createdArea];
    companyAreasLoaded = true;
    return createdArea;
  },

  // Update an existing company area
  updateCompanyArea: async (
    id: number,
    updatedCompanyArea: Omit<CompanyArea, "created_by">,
  ): Promise<CompanyArea> => {
    const response = await fetch(`${API_BASE_URL}/company_areas/${id}`, {
      method: "PUT",
      headers: buildAuthHeaders(),
      body: JSON.stringify({
        area: updatedCompanyArea.area,
        region: updatedCompanyArea.region,
        description: updatedCompanyArea.description,
        active: updatedCompanyArea.active,
      }),
    });

    if (!response.ok) {
      const message =
        response.status === 401
          ? "Unauthorized"
          : "Failed to update company area";
      throw new Error(message);
    }

    const data: ApiCompanyArea = await response.json();
    const savedArea = mapApiCompanyArea(data);
    companyAreasCache = companyAreasCache.map((area) =>
      area.id === id ? savedArea : area,
    );
    companyAreasLoaded = true;
    return savedArea;
  },

  // Delete a company area
  deleteCompanyArea: async (id: number): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/company_areas/${id}`, {
      method: "DELETE",
      headers: buildAuthHeaders(),
    });

    if (!response.ok) {
      const message =
        response.status === 401
          ? "Unauthorized"
          : "Failed to delete company area";
      throw new Error(message);
    }

    companyAreasCache = companyAreasCache.filter((area) => area.id !== id);
    companyAreasLoaded = true;
  },

  // Search company areas by multiple fields
  searchCompanyAreas: (
    companyAreas: CompanyArea[],
    searchTerm: string,
  ): CompanyArea[] => {
    return companyAreas.filter(
      (area) =>
        area.company_id.toString().includes(searchTerm) ||
        area.area.toLowerCase().includes(searchTerm.toLowerCase()) ||
        area.region.toLowerCase().includes(searchTerm.toLowerCase()) ||
        area.description.toLowerCase().includes(searchTerm.toLowerCase()),
    );
  },

  // Validate company area data
  validateCompanyArea: (
    companyArea: Partial<CompanyArea>,
  ): { valid: boolean; error?: string } => {
    if (!companyArea.company_id) {
      return { valid: false, error: "Company is required" };
    }
    if (!companyArea.area || companyArea.area.trim() === "") {
      return { valid: false, error: "Area is required" };
    }
    if (!companyArea.region || companyArea.region.trim() === "") {
      return { valid: false, error: "Region is required" };
    }
    return { valid: true };
  },

  // ========== Helper Methods ==========

  // Get a single company area by ID
  getCompanyAreaById: (id: number): CompanyArea | undefined => {
    return companyAreasCache.find((area) => area.id === id);
  },

  // Get company areas by company ID
  getAreasByCompanyId: (companyId: number): CompanyArea[] => {
    return companyAreasCache.filter((area) => area.company_id === companyId);
  },

  // Get active company areas by company ID
  getActiveAreasByCompanyId: (companyId: number): CompanyArea[] => {
    return companyAreasCache.filter(
      (area) => area.company_id === companyId && area.active,
    );
  },

  // Get company area by area name
  getAreaByName: (areaName: string): CompanyArea | undefined => {
    return companyAreasCache.find(
      (area) => area.area.toLowerCase() === areaName.toLowerCase(),
    );
  },

  // Get company areas by region
  getAreasByRegion: (region: string): CompanyArea[] => {
    return companyAreasCache.filter((area) =>
      area.region.toLowerCase().includes(region.toLowerCase()),
    );
  },

  // Check if area exists for company
  areaExistsForCompany: (
    companyId: number,
    areaName: string,
    excludeId?: number,
  ): boolean => {
    return companyAreasCache.some(
      (area) =>
        area.company_id === companyId &&
        area.area === areaName &&
        area.id !== excludeId,
    );
  },

  // Check if region exists
  regionExists: (region: string): boolean => {
    return companyAreasCache.some(
      (area) => area.region.toLowerCase() === region.toLowerCase(),
    );
  },

  // Get active company areas only
  getActiveCompanyAreas: (): CompanyArea[] => {
    return companyAreasCache.filter((area) => area.active);
  },

  // Get inactive company areas only
  getInactiveCompanyAreas: (): CompanyArea[] => {
    return companyAreasCache.filter((area) => !area.active);
  },

  // Get primary area for company (first active area)
  getPrimaryAreaForCompany: (companyId: number): CompanyArea | undefined => {
    return companyAreasCache.find(
      (area) => area.company_id === companyId && area.active,
    );
  },

  // Get all areas for company sorted by area name
  getAllAreasForCompany: (companyId: number): CompanyArea[] => {
    return companyAreasCache
      .filter((area) => area.company_id === companyId)
      .sort((a, b) => a.area.localeCompare(b.area));
  },

  // Count active areas
  countActiveAreas: (): number => {
    return companyAreasCache.filter((area) => area.active).length;
  },

  // Count inactive areas
  countInactiveAreas: (): number => {
    return companyAreasCache.filter((area) => !area.active).length;
  },

  // Count areas by company ID
  countAreasByCompanyId: (companyId: number): number => {
    return companyAreasCache.filter((area) => area.company_id === companyId)
      .length;
  },

  // Count active areas by company ID
  countActiveAreasByCompanyId: (companyId: number): number => {
    return companyAreasCache.filter(
      (area) => area.company_id === companyId && area.active,
    ).length;
  },

  // Get unique company IDs from areas
  getUniqueCompanyIds: (): number[] => {
    const ids = companyAreasCache.map((a) => a.company_id);
    return Array.from(new Set(ids));
  },

  // Get unique regions
  getUniqueRegions: (): string[] => {
    const regions = companyAreasCache.map((a) => a.region);
    return Array.from(new Set(regions));
  },

  // Get unique areas
  getUniqueAreas: (): string[] => {
    const areas = companyAreasCache.map((a) => a.area);
    return Array.from(new Set(areas));
  },

  // ========== Company-Related Methods ==========

  // Get companies with areas
  getCompaniesWithAreas: (): { company_id: number; areaCount: number }[] => {
    const companyIds = companyAreaService.getUniqueCompanyIds();
    return companyIds.map((id) => ({
      company_id: id,
      areaCount: companyAreaService.countAreasByCompanyId(id),
    }));
  },

  // Check if company has areas
  hasAreasForCompany: (companyId: number): boolean => {
    return companyAreasCache.some((area) => area.company_id === companyId);
  },

  // Check if company has active areas
  hasActiveAreasForCompany: (companyId: number): boolean => {
    return companyAreasCache.some(
      (area) => area.company_id === companyId && area.active,
    );
  },

  // ========== Geographic Methods ==========

  // Group areas by region
  getAreasGroupedByRegion: (): { [region: string]: CompanyArea[] } => {
    const grouped: { [region: string]: CompanyArea[] } = {};
    companyAreasCache.forEach((area) => {
      if (!grouped[area.region]) {
        grouped[area.region] = [];
      }
      grouped[area.region].push(area);
    });
    return grouped;
  },

  // Group areas by company ID
  getAreasGroupedByCompanyId: (): { [companyId: number]: CompanyArea[] } => {
    const grouped: { [companyId: number]: CompanyArea[] } = {};
    companyAreasCache.forEach((area) => {
      if (!grouped[area.company_id]) {
        grouped[area.company_id] = [];
      }
      grouped[area.company_id].push(area);
    });
    return grouped;
  },

  // Get region summary
  getRegionSummary: (): {
    region: string;
    totalAreas: number;
    activeAreas: number;
    companyIds: number[];
  }[] => {
    const regions = companyAreaService.getUniqueRegions();
    return regions.map((region) => {
      const areasInRegion = companyAreaService.getAreasByRegion(region);
      return {
        region,
        totalAreas: areasInRegion.length,
        activeAreas: areasInRegion.filter((a) => a.active).length,
        companyIds: Array.from(new Set(areasInRegion.map((a) => a.company_id))),
      };
    });
  },

  // Check if region has multiple companies
  isMultiCompanyRegion: (region: string): boolean => {
    const areasInRegion = companyAreaService.getAreasByRegion(region);
    const companies = new Set(areasInRegion.map((a) => a.company_id));
    return companies.size > 1;
  },

  // Get overlapping regions (multiple companies in same region)
  getOverlappingRegions: (): string[] => {
    const regions = companyAreaService.getUniqueRegions();
    return regions.filter((region) =>
      companyAreaService.isMultiCompanyRegion(region),
    );
  },

  // ========== Statistics & Reporting Methods ==========

  // Get company area statistics
  getCompanyAreaStatistics: (): {
    total: number;
    active: number;
    inactive: number;
    byCompanyId: { [companyId: number]: number };
    byRegion: { [region: string]: number };
  } => {
    const stats = {
      total: companyAreasCache.length,
      active: companyAreasCache.filter((a) => a.active).length,
      inactive: companyAreasCache.filter((a) => !a.active).length,
      byCompanyId: {} as { [companyId: number]: number },
      byRegion: {} as { [region: string]: number },
    };

    companyAreasCache.forEach((area) => {
      stats.byCompanyId[area.company_id] =
        (stats.byCompanyId[area.company_id] || 0) + 1;
      stats.byRegion[area.region] = (stats.byRegion[area.region] || 0) + 1;
    });

    return stats;
  },

  // Get company area summary
  getCompanyAreaSummary: (): {
    company_id: number;
    total: number;
    active: number;
    inactive: number;
    primaryArea: string;
    regions: string[];
  }[] => {
    const companyIds = companyAreaService.getUniqueCompanyIds();
    return companyIds.map((id) => {
      const areas = companyAreaService.getAreasByCompanyId(id);
      const primaryArea = companyAreaService.getPrimaryAreaForCompany(id);
      return {
        company_id: id,
        total: areas.length,
        active: areas.filter((a) => a.active).length,
        inactive: areas.filter((a) => !a.active).length,
        primaryArea: primaryArea ? primaryArea.area : "N/A",
        regions: Array.from(new Set(areas.map((a) => a.region))),
      };
    });
  },

  // Get coverage analysis (areas per company)
  getCoverageAnalysis: (): {
    averageAreasPerCompany: number;
    maxAreasCompanyId: number;
    maxAreasCount: number;
    minAreasCompanyId: number;
    minAreasCount: number;
  } => {
    const companyIds = companyAreaService.getUniqueCompanyIds();
    const areaCounts = companyIds.map((id) => ({
      company_id: id,
      count: companyAreaService.countAreasByCompanyId(id),
    }));

    const total = areaCounts.reduce((sum, item) => sum + item.count, 0);
    const max = areaCounts.reduce((prev, curr) =>
      curr.count > prev.count ? curr : prev,
    );
    const min = areaCounts.reduce((prev, curr) =>
      curr.count < prev.count ? curr : prev,
    );

    return {
      averageAreasPerCompany: total / companyIds.length,
      maxAreasCompanyId: max.company_id,
      maxAreasCount: max.count,
      minAreasCompanyId: min.company_id,
      minAreasCount: min.count,
    };
  },

  // ========== UI Helper Methods ==========

  // Get area names for dropdown
  getAreaNames: (): string[] => {
    return companyAreasCache.map((area) => area.area);
  },

  // Get active area names for dropdown
  getActiveAreaNames: (): string[] => {
    return companyAreasCache
      .filter((area) => area.active)
      .map((area) => area.area);
  },

  // Get area names by company for dropdown
  getAreaNamesByCompanyId: (companyId: number): string[] => {
    return companyAreasCache
      .filter((area) => area.company_id === companyId && area.active)
      .map((area) => area.area);
  },

  // Get region names for dropdown
  getRegionNames: (): string[] => {
    return companyAreaService.getUniqueRegions();
  },

  // Get company area options for select components
  getCompanyAreaOptions: (): { value: number; label: string }[] => {
    return companyAreasCache.map((area) => ({
      value: area.id,
      label: `${area.area} (${area.region})`,
    }));
  },

  // Get active company area options for select components
  getActiveCompanyAreaOptions: (): { value: number; label: string }[] => {
    return companyAreasCache
      .filter((area) => area.active)
      .map((area) => ({
        value: area.id,
        label: `${area.area} (${area.region})`,
      }));
  },

  // Get area options by company ID
  getAreaOptionsByCompanyId: (
    companyId: number,
  ): { value: number; label: string }[] => {
    return companyAreasCache
      .filter((area) => area.company_id === companyId && area.active)
      .map((area) => ({
        value: area.id,
        label: `${area.area} (${area.region})`,
      }));
  },

  // Get company area options with full details
  getCompanyAreaOptionsDetailed: (): {
    value: number;
    label: string;
    company_id: number;
    region: string;
    description: string;
  }[] => {
    return companyAreasCache.map((area) => ({
      value: area.id,
      label: area.area,
      company_id: area.company_id,
      region: area.region,
      description: area.description,
    }));
  },

  // Format company area display
  formatCompanyAreaDisplay: (areaId: number): string => {
    const area = companyAreasCache.find((a) => a.id === areaId);
    return area ? area.area : `Area ${areaId}`;
  },

  // Format company area display with region
  formatCompanyAreaDisplayWithRegion: (areaId: number): string => {
    const area = companyAreasCache.find((a) => a.id === areaId);
    return area ? `${area.area} (${area.region})` : `Area ${areaId}`;
  },

  // Get status badge styling
  getStatusBadge: (active: boolean): string => {
    return active ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800";
  },

  // Format area description (truncate if too long)
  formatAreaDescription: (
    description: string,
    maxLength: number = 50,
  ): string => {
    if (description.length <= maxLength) return description;
    return description.substring(0, maxLength) + "...";
  },
};
