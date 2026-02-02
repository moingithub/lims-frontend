// Unified Company Master Service - Handles CRUD operations, search, validation, billing management, and helper methods
import { API_BASE_URL } from "../config/api";
import { authService } from "./authService";

export interface Company {
  id: number;
  company_code: string;
  company_name: string;
  phone: string;
  email: string;
  billing_reference_type: string;
  billing_reference_number: string;
  billing_address: string;
  active: boolean;
  created_by: number;
}

type ApiCompany = {
  id: number;
  code: string;
  name: string;
  phone: string;
  email: string;
  billing_ref: string | null;
  billing_ref_no: string | null;
  billing_address: string;
  active: boolean;
  created_by_id: number | null;
};

let companiesCache: Company[] = [];
let companiesLoaded = false;

const mapApiCompany = (company: ApiCompany): Company => ({
  id: company.id,
  company_code: company.code,
  company_name: company.name,
  phone: company.phone,
  email: company.email,
  billing_reference_type: company.billing_ref ?? "",
  billing_reference_number: company.billing_ref_no ?? "",
  billing_address: company.billing_address,
  active: company.active,
  created_by: company.created_by_id ?? 0,
});

const buildAuthHeaders = (): HeadersInit => {
  const token = authService.getAuthState().token;
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

export const billingReferenceTypes = ["GL Code", "PO", "AFE#"];

export const companyMasterService = {
  // ========== CRUD Operations ==========

  // Get all companies
  getCompanies: (): Company[] => {
    return companiesCache;
  },

  // Fetch companies from API (cached)
  fetchCompanies: async (force = false): Promise<Company[]> => {
    if (companiesLoaded && !force) return companiesCache;

    const response = await fetch(`${API_BASE_URL}/companies`, {
      method: "GET",
      headers: buildAuthHeaders(),
    });

    if (!response.ok) {
      const message =
        response.status === 401 ? "Unauthorized" : "Failed to load companies";
      throw new Error(message);
    }

    const data: ApiCompany[] = await response.json();
    companiesCache = Array.isArray(data) ? data.map(mapApiCompany) : [];
    companiesLoaded = true;
    return companiesCache;
  },

  // Replace cached companies (local updates)
  setCompanies: (companies: Company[]): void => {
    companiesCache = companies;
    companiesLoaded = true;
  },

  // Add a new company
  addCompany: async (
    company: Omit<Company, "id" | "created_by">,
  ): Promise<Company> => {
    const response = await fetch(`${API_BASE_URL}/companies`, {
      method: "POST",
      headers: buildAuthHeaders(),
      body: JSON.stringify({
        code: company.company_code,
        name: company.company_name,
        phone: company.phone,
        email: company.email,
        billing_ref: company.billing_reference_type,
        billing_ref_no: company.billing_reference_number,
        billing_address: company.billing_address,
        active: company.active,
      }),
    });

    if (!response.ok) {
      const message =
        response.status === 401 ? "Unauthorized" : "Failed to create company";
      throw new Error(message);
    }

    const data: ApiCompany = await response.json();
    const createdCompany = mapApiCompany(data);
    companiesCache = [...companiesCache, createdCompany];
    companiesLoaded = true;
    return createdCompany;
  },

  // Update an existing company
  updateCompany: async (
    id: number,
    updatedCompany: Omit<Company, "created_by">,
  ): Promise<Company> => {
    const response = await fetch(`${API_BASE_URL}/companies/${id}`, {
      method: "PUT",
      headers: buildAuthHeaders(),
      body: JSON.stringify({
        code: updatedCompany.company_code,
        name: updatedCompany.company_name,
        phone: updatedCompany.phone,
        email: updatedCompany.email,
        billing_ref: updatedCompany.billing_reference_type,
        billing_ref_no: updatedCompany.billing_reference_number,
        billing_address: updatedCompany.billing_address,
        active: updatedCompany.active,
      }),
    });

    if (!response.ok) {
      const message =
        response.status === 401 ? "Unauthorized" : "Failed to update company";
      throw new Error(message);
    }

    const data: ApiCompany = await response.json();
    const savedCompany = mapApiCompany(data);
    companiesCache = companiesCache.map((company) =>
      company.id === id ? savedCompany : company,
    );
    companiesLoaded = true;
    return savedCompany;
  },

  // Delete a company
  deleteCompany: async (id: number): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/companies/${id}`, {
      method: "DELETE",
      headers: buildAuthHeaders(),
    });

    if (!response.ok) {
      const message =
        response.status === 401 ? "Unauthorized" : "Failed to delete company";
      throw new Error(message);
    }

    companiesCache = companiesCache.filter((company) => company.id !== id);
    companiesLoaded = true;
  },

  // Search companies by any field
  searchCompanies: (companies: Company[], searchTerm: string): Company[] => {
    return companies.filter((company) =>
      Object.values(company).some((value) =>
        String(value).toLowerCase().includes(searchTerm.toLowerCase()),
      ),
    );
  },

  // Validate company data
  validateCompany: (
    company: Partial<Company>,
  ): { valid: boolean; error?: string } => {
    if (!company.company_code || company.company_code.trim() === "") {
      return { valid: false, error: "Company code is required" };
    }
    if (!company.company_name || company.company_name.trim() === "") {
      return { valid: false, error: "Company name is required" };
    }
    if (!company.phone || company.phone.trim() === "") {
      return { valid: false, error: "Phone is required" };
    }
    if (!company.email || company.email.trim() === "") {
      return { valid: false, error: "Email is required" };
    }
    if (
      !company.billing_reference_type ||
      company.billing_reference_type.trim() === ""
    ) {
      return { valid: false, error: "Billing reference type is required" };
    }
    if (
      !company.billing_reference_number ||
      company.billing_reference_number.trim() === ""
    ) {
      return { valid: false, error: "Billing reference number is required" };
    }
    if (!company.billing_address || company.billing_address.trim() === "") {
      return { valid: false, error: "Billing address is required" };
    }
    return { valid: true };
  },

  // ========== Helper Methods ==========

  // Get a single company by ID
  getCompanyById: (id: number): Company | undefined => {
    return companiesCache.find((company) => company.id === id);
  },

  // Get a single company by code
  getCompanyByCode: (companyCode: string): Company | undefined => {
    return companiesCache.find(
      (company) => company.company_code === companyCode,
    );
  },

  // Get a single company by name
  getCompanyByName: (companyName: string): Company | undefined => {
    return companiesCache.find(
      (company) => company.company_name === companyName,
    );
  },

  // Check if a company code exists
  companyCodeExists: (companyCode: string, excludeId?: number): boolean => {
    return companiesCache.some(
      (company) =>
        company.company_code === companyCode && company.id !== excludeId,
    );
  },

  // Check if a company name exists
  companyNameExists: (companyName: string, excludeId?: number): boolean => {
    return companiesCache.some(
      (company) =>
        company.company_name === companyName && company.id !== excludeId,
    );
  },

  // Get active companies only
  getActiveCompanies: (): Company[] => {
    return companiesCache.filter((company) => company.active);
  },

  // Get inactive companies only
  getInactiveCompanies: (): Company[] => {
    return companiesCache.filter((company) => !company.active);
  },

  // Get companies by billing reference type
  getCompaniesByBillingType: (billingType: string): Company[] => {
    return companiesCache.filter(
      (company) => company.billing_reference_type === billingType,
    );
  },

  // Get active companies by billing type
  getActiveCompaniesByBillingType: (billingType: string): Company[] => {
    return companiesCache.filter(
      (company) =>
        company.billing_reference_type === billingType && company.active,
    );
  },

  // Search companies by email domain
  getCompaniesByEmailDomain: (domain: string): Company[] => {
    return companiesCache.filter((company) => company.email.endsWith(domain));
  },

  // Search companies by phone area code
  getCompaniesByAreaCode: (areaCode: string): Company[] => {
    return companiesCache.filter((company) =>
      company.phone.startsWith(areaCode),
    );
  },

  // Get companies by city (from billing address)
  getCompaniesByCity: (city: string): Company[] => {
    return companiesCache.filter((company) =>
      company.billing_address.toLowerCase().includes(city.toLowerCase()),
    );
  },

  // Count active companies
  countActiveCompanies: (): number => {
    return companiesCache.filter((company) => company.active).length;
  },

  // Count inactive companies
  countInactiveCompanies: (): number => {
    return companiesCache.filter((company) => !company.active).length;
  },

  // Count companies by billing type
  countCompaniesByBillingType: (billingType: string): number => {
    return companiesCache.filter(
      (company) => company.billing_reference_type === billingType,
    ).length;
  },

  // Get unique billing reference types
  getUniqueBillingTypes: (): string[] => {
    const types = companiesCache.map((c) => c.billing_reference_type);
    return Array.from(new Set(types));
  },

  // Get unique email domains
  getUniqueEmailDomains: (): string[] => {
    const domains = companiesCache.map((c) => c.email.split("@")[1]);
    return Array.from(new Set(domains));
  },

  // ========== Billing Management Methods ==========

  // Get billing reference for a company
  getBillingReference: (
    companyId: number,
  ): { type: string; number: string } | null => {
    const company = companiesCache.find((c) => c.id === companyId);
    if (!company) return null;
    return {
      type: company.billing_reference_type,
      number: company.billing_reference_number,
    };
  },

  // Get billing reference by company code
  getBillingReferenceByCode: (
    companyCode: string,
  ): { type: string; number: string } | null => {
    const company = companiesCache.find((c) => c.company_code === companyCode);
    if (!company) return null;
    return {
      type: company.billing_reference_type,
      number: company.billing_reference_number,
    };
  },

  // Get full billing information
  getBillingInfo: (
    companyId: number,
  ): {
    type: string;
    number: string;
    address: string;
    companyName: string;
  } | null => {
    const company = companiesCache.find((c) => c.id === companyId);
    if (!company) return null;
    return {
      type: company.billing_reference_type,
      number: company.billing_reference_number,
      address: company.billing_address,
      companyName: company.company_name,
    };
  },

  // Check if company has GL Code billing
  usesGLCode: (companyId: number): boolean => {
    const company = companiesCache.find((c) => c.id === companyId);
    return company ? company.billing_reference_type === "GL Code" : false;
  },

  // Check if company has PO billing
  usesPO: (companyId: number): boolean => {
    const company = companiesCache.find((c) => c.id === companyId);
    return company ? company.billing_reference_type === "PO" : false;
  },

  // Check if company has AFE# billing
  usesAFE: (companyId: number): boolean => {
    const company = companiesCache.find((c) => c.id === companyId);
    return company ? company.billing_reference_type === "AFE#" : false;
  },

  // ========== Contact Methods ==========

  // Get contact email for a company
  getContactEmail: (companyId: number): string | null => {
    const company = companiesCache.find((c) => c.id === companyId);
    return company ? company.email : null;
  },

  // Get contact phone for a company
  getContactPhone: (companyId: number): string | null => {
    const company = companiesCache.find((c) => c.id === companyId);
    return company ? company.phone : null;
  },

  // Get contact information
  getContactInfo: (
    companyId: number,
  ): { phone: string; email: string } | null => {
    const company = companiesCache.find((c) => c.id === companyId);
    if (!company) return null;
    return {
      phone: company.phone,
      email: company.email,
    };
  },

  // Validate email format
  isValidEmail: (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },

  // Validate phone format (basic check)
  isValidPhone: (phone: string): boolean => {
    // Accept formats like: 123-456-7890, (123) 456-7890, 123.456.7890, 1234567890
    const phoneRegex = /^[\d\s\-().]+$/;
    return phoneRegex.test(phone) && phone.replace(/\D/g, "").length >= 10;
  },

  // ========== Statistics & Reporting Methods ==========

  // Get company statistics
  getCompanyStatistics: (): {
    total: number;
    active: number;
    inactive: number;
    byBillingType: { [type: string]: number };
  } => {
    const stats = {
      total: initialCompanies.length,
      active: initialCompanies.filter((c) => c.active).length,
      inactive: initialCompanies.filter((c) => !c.active).length,
      byBillingType: {} as { [type: string]: number },
    };

    initialCompanies.forEach((company) => {
      stats.byBillingType[company.billing_reference_type] =
        (stats.byBillingType[company.billing_reference_type] || 0) + 1;
    });

    return stats;
  },

  // Get billing type summary
  getBillingTypeSummary: (): {
    type: string;
    total: number;
    active: number;
    inactive: number;
  }[] => {
    const types = companyMasterService.getUniqueBillingTypes();
    return types.map((type) => ({
      type,
      total: companyMasterService.countCompaniesByBillingType(type),
      active: initialCompanies.filter(
        (c) => c.billing_reference_type === type && c.active,
      ).length,
      inactive: initialCompanies.filter(
        (c) => c.billing_reference_type === type && !c.active,
      ).length,
    }));
  },

  // ========== UI Helper Methods ==========

  // Get company names for dropdown (legacy method maintained for compatibility)
  getCompanyNames: (companies: Company[]): string[] => {
    return companies.map((company) => company.company_name);
  },

  // Get active company names for dropdown
  getActiveCompanyNames: (): string[] => {
    return initialCompanies
      .filter((company) => company.active)
      .map((company) => company.company_name);
  },

  // Get company codes for dropdown
  getCompanyCodes: (): string[] => {
    return initialCompanies.map((company) => company.company_code);
  },

  // Get active company codes for dropdown
  getActiveCompanyCodes: (): string[] => {
    return initialCompanies
      .filter((company) => company.active)
      .map((company) => company.company_code);
  },

  // Get company options for select components
  getCompanyOptions: (): { value: string; label: string }[] => {
    return initialCompanies.map((company) => ({
      value: company.company_code,
      label: `${company.company_code} - ${company.company_name}`,
    }));
  },

  // Get active company options for select components
  getActiveCompanyOptions: (): { value: string; label: string }[] => {
    return initialCompanies
      .filter((company) => company.active)
      .map((company) => ({
        value: company.company_code,
        label: `${company.company_code} - ${company.company_name}`,
      }));
  },

  // Get company options with full details
  getCompanyOptionsDetailed: (): {
    value: string;
    label: string;
    email: string;
    phone: string;
  }[] => {
    return initialCompanies.map((company) => ({
      value: company.company_code,
      label: `${company.company_code} - ${company.company_name}`,
      email: company.email,
      phone: company.phone,
    }));
  },

  // Format company display
  formatCompanyDisplay: (companyCode: string): string => {
    const company = initialCompanies.find(
      (c) => c.company_code === companyCode,
    );
    return company
      ? `${company.company_code} - ${company.company_name}`
      : companyCode;
  },

  // Format billing reference display
  formatBillingReferenceDisplay: (companyCode: string): string => {
    const company = initialCompanies.find(
      (c) => c.company_code === companyCode,
    );
    return company
      ? `${company.billing_reference_type}: ${company.billing_reference_number}`
      : "N/A";
  },

  // Get billing reference type options
  getBillingReferenceTypeOptions: (): string[] => {
    return billingReferenceTypes;
  },

  // Get billing type badge styling
  getBillingTypeBadge: (billingType: string): string => {
    switch (billingType) {
      case "GL Code":
        return "bg-blue-100 text-blue-800";
      case "PO":
        return "bg-green-100 text-green-800";
      case "AFE#":
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  },

  // Format phone number for display
  formatPhoneDisplay: (phone: string): string => {
    // Remove all non-digits
    const cleaned = phone.replace(/\D/g, "");
    // Format as (XXX) XXX-XXXX if 10 digits
    if (cleaned.length === 10) {
      return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
    }
    return phone;
  },

  // Extract city from billing address
  extractCityFromAddress: (address: string): string => {
    // Assumes format: "Street, City, State ZIP"
    const parts = address.split(",");
    return parts.length >= 2 ? parts[1].trim() : "";
  },

  // Extract state from billing address
  extractStateFromAddress: (address: string): string => {
    // Assumes format: "Street, City, State ZIP"
    const parts = address.split(",");
    if (parts.length >= 3) {
      const stateZip = parts[2].trim().split(" ");
      return stateZip[0] || "";
    }
    return "";
  },
};
