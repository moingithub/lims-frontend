// Unified Contacts Service - Handles CRUD operations, search, validation, contact management, and helper methods
import { API_BASE_URL } from "../config/api";
import { authService } from "./authService";

export interface Contact {
  id: number;
  company_id: number;
  name: string;
  phone: string;
  email: string;
  active: boolean;
  created_by: number;
}

type ApiContact = {
  id: number;
  company_id: number;
  name: string;
  phone: string;
  email: string;
  active: boolean;
  created_by_id: number | null;
};

let contactsCache: Contact[] = [];
let contactsLoaded = false;

const mapApiContact = (contact: ApiContact): Contact => ({
  id: contact.id,
  company_id: contact.company_id,
  name: contact.name,
  phone: contact.phone,
  email: contact.email,
  active: contact.active,
  created_by: contact.created_by_id ?? 0,
});

const buildAuthHeaders = (): HeadersInit => {
  const token = authService.getAuthState().token;
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

export const contactsService = {
  // ========== CRUD Operations ==========

  // Get all contacts
  getContacts: (): Contact[] => {
    return contactsCache;
  },

  // Fetch contacts from API (cached)
  fetchContacts: async (force = false): Promise<Contact[]> => {
    if (contactsLoaded && !force) return contactsCache;

    const response = await fetch(`${API_BASE_URL}/company_contacts`, {
      method: "GET",
      headers: buildAuthHeaders(),
    });

    if (!response.ok) {
      const message =
        response.status === 401 ? "Unauthorized" : "Failed to load contacts";
      throw new Error(message);
    }

    const data: ApiContact[] = await response.json();
    contactsCache = Array.isArray(data) ? data.map(mapApiContact) : [];
    contactsLoaded = true;
    return contactsCache;
  },

  // Replace cached contacts (local updates)
  setContacts: (contacts: Contact[]): void => {
    contactsCache = contacts;
    contactsLoaded = true;
  },

  // Add a new contact
  addContact: async (
    contact: Omit<Contact, "id" | "created_by">,
  ): Promise<Contact> => {
    const response = await fetch(`${API_BASE_URL}/company_contacts`, {
      method: "POST",
      headers: buildAuthHeaders(),
      body: JSON.stringify({
        company_id: contact.company_id,
        name: contact.name,
        phone: contact.phone,
        email: contact.email,
        active: contact.active,
      }),
    });

    if (!response.ok) {
      const message =
        response.status === 401 ? "Unauthorized" : "Failed to create contact";
      throw new Error(message);
    }

    const data: ApiContact = await response.json();
    const createdContact = mapApiContact(data);
    contactsCache = [...contactsCache, createdContact];
    contactsLoaded = true;
    return createdContact;
  },

  // Update an existing contact
  updateContact: async (
    id: number,
    updatedContact: Omit<Contact, "created_by">,
  ): Promise<Contact> => {
    const response = await fetch(`${API_BASE_URL}/company_contacts/${id}`, {
      method: "PUT",
      headers: buildAuthHeaders(),
      body: JSON.stringify({
        company_id: updatedContact.company_id,
        name: updatedContact.name,
        phone: updatedContact.phone,
        email: updatedContact.email,
        active: updatedContact.active,
      }),
    });

    if (!response.ok) {
      const message =
        response.status === 401 ? "Unauthorized" : "Failed to update contact";
      throw new Error(message);
    }

    const data: ApiContact = await response.json();
    const savedContact = mapApiContact(data);
    contactsCache = contactsCache.map((contact) =>
      contact.id === id ? savedContact : contact,
    );
    contactsLoaded = true;
    return savedContact;
  },

  // Delete a contact
  deleteContact: async (id: number): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/company_contacts/${id}`, {
      method: "DELETE",
      headers: buildAuthHeaders(),
    });

    if (!response.ok) {
      const message =
        response.status === 401 ? "Unauthorized" : "Failed to delete contact";
      throw new Error(message);
    }

    contactsCache = contactsCache.filter((contact) => contact.id !== id);
    contactsLoaded = true;
  },

  // Search contacts by multiple fields
  searchContacts: (contacts: Contact[], searchTerm: string): Contact[] => {
    return contacts.filter(
      (contact) =>
        contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        contact.phone.toLowerCase().includes(searchTerm.toLowerCase()) ||
        contact.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        contact.company_id.toString().includes(searchTerm),
    );
  },

  // Validate contact data
  validateContact: (
    contact: Partial<Contact>,
  ): { valid: boolean; error?: string } => {
    if (!contact.company_id) {
      return { valid: false, error: "Company is required" };
    }
    if (!contact.name || contact.name.trim() === "") {
      return { valid: false, error: "Name is required" };
    }
    if (!contact.phone || contact.phone.trim() === "") {
      return { valid: false, error: "Phone is required" };
    }
    if (!contact.email || contact.email.trim() === "") {
      return { valid: false, error: "Email is required" };
    }
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(contact.email)) {
      return { valid: false, error: "Invalid email format" };
    }
    return { valid: true };
  },

  // ========== Helper Methods ==========

  // Get a single contact by ID
  getContactById: (id: number): Contact | undefined => {
    return contactsCache.find((contact) => contact.id === id);
  },

  // Get a single contact by name
  getContactByName: (name: string): Contact | undefined => {
    return contactsCache.find((contact) => contact.name === name);
  },

  // Get a single contact by email
  getContactByEmail: (email: string): Contact | undefined => {
    return contactsCache.find((contact) => contact.email === email);
  },

  // Check if a name exists
  nameExists: (name: string, excludeId?: number): boolean => {
    return contactsCache.some(
      (contact) => contact.name === name && contact.id !== excludeId,
    );
  },

  // Check if an email exists
  emailExists: (email: string, excludeId?: number): boolean => {
    return contactsCache.some(
      (contact) => contact.email === email && contact.id !== excludeId,
    );
  },

  // Get active contacts only
  getActiveContacts: (): Contact[] => {
    return contactsCache.filter((contact) => contact.active);
  },

  // Get inactive contacts only
  getInactiveContacts: (): Contact[] => {
    return contactsCache.filter((contact) => !contact.active);
  },

  // Get contacts by company ID
  getContactsByCompanyId: (companyId: number): Contact[] => {
    return contactsCache.filter((contact) => contact.company_id === companyId);
  },

  // Get active contacts by company ID
  getActiveContactsByCompanyId: (companyId: number): Contact[] => {
    return contactsCache.filter(
      (contact) => contact.company_id === companyId && contact.active,
    );
  },

  // Get contacts by email domain
  getContactsByEmailDomain: (domain: string): Contact[] => {
    return contactsCache.filter((contact) => contact.email.endsWith(domain));
  },

  // Get contacts by name (partial match)
  getContactsByName: (nameSearch: string): Contact[] => {
    return contactsCache.filter((contact) =>
      contact.name.toLowerCase().includes(nameSearch.toLowerCase()),
    );
  },

  // Get contacts by phone area code
  getContactsByAreaCode: (areaCode: string): Contact[] => {
    return contactsCache.filter((contact) => contact.phone.includes(areaCode));
  },

  // Get primary contact for a company (first active contact)
  getPrimaryContactForCompany: (companyId: number): Contact | undefined => {
    return contactsCache.find(
      (contact) => contact.company_id === companyId && contact.active,
    );
  },

  // Get all contacts for a company (sorted by name)
  getAllContactsForCompany: (companyId: number): Contact[] => {
    return contactsCache
      .filter((contact) => contact.company_id === companyId)
      .sort((a, b) => a.name.localeCompare(b.name));
  },

  // Count active contacts
  countActiveContacts: (): number => {
    return contactsCache.filter((contact) => contact.active).length;
  },

  // Count inactive contacts
  countInactiveContacts: (): number => {
    return contactsCache.filter((contact) => !contact.active).length;
  },

  // Count contacts by company ID
  countContactsByCompanyId: (companyId: number): number => {
    return contactsCache.filter((contact) => contact.company_id === companyId)
      .length;
  },

  // Count active contacts by company ID
  countActiveContactsByCompanyId: (companyId: number): number => {
    return contactsCache.filter(
      (contact) => contact.company_id === companyId && contact.active,
    ).length;
  },

  // Get unique company IDs from contacts
  getUniqueCompanyIds: (): number[] => {
    const companyIds = contactsCache.map((c) => c.company_id);
    return Array.from(new Set(companyIds));
  },

  // Get unique email domains
  getUniqueEmailDomains: (): string[] => {
    const domains = contactsCache.map((c) => c.email.split("@")[1]);
    return Array.from(new Set(domains));
  },

  // ========== Contact Information Methods ==========

  // Get contact's full information by ID
  getContactInfo: (
    contactId: number,
  ): {
    name: string;
    phone: string;
    email: string;
    company_id: number;
  } | null => {
    const contact = contactsCache.find((c) => c.id === contactId);
    if (!contact) return null;
    return {
      name: contact.name,
      phone: contact.phone,
      email: contact.email,
      company_id: contact.company_id,
    };
  },

  // Get contact's phone by ID
  getContactPhone: (contactId: number): string | null => {
    const contact = contactsCache.find((c) => c.id === contactId);
    return contact ? contact.phone : null;
  },

  // Get contact's email by ID
  getContactEmail: (contactId: number): string | null => {
    const contact = contactsCache.find((c) => c.id === contactId);
    return contact ? contact.email : null;
  },

  // Get contact's company ID by contact ID
  getContactCompanyId: (contactId: number): number | null => {
    const contact = contactsCache.find((c) => c.id === contactId);
    return contact ? contact.company_id : null;
  },

  // Check if contact is active by ID
  isContactActive: (contactId: number): boolean => {
    const contact = contactsCache.find((c) => c.id === contactId);
    return contact ? contact.active : false;
  },

  // Validate email format
  isValidEmail: (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },

  // Validate phone format (international format)
  isValidPhone: (phone: string): boolean => {
    // Accept formats like: +1-555-0101, +44-20-7123-4567, etc.
    const phoneRegex = /^\+?\d{1,3}[-.\s]?\d{1,4}[-.\s]?\d{1,4}[-.\s]?\d{1,9}$/;
    return phoneRegex.test(phone);
  },

  // Parse name into first and last
  parseName: (fullName: string): { firstName: string; lastName: string } => {
    const parts = fullName.trim().split(/\s+/);
    if (parts.length === 1) {
      return { firstName: parts[0], lastName: "" };
    }
    const firstName = parts[0];
    const lastName = parts.slice(1).join(" ");
    return { firstName, lastName };
  },

  // Get contact initials
  getContactInitials: (name: string): string => {
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) {
      return parts[0].charAt(0).toUpperCase();
    }
    return (
      parts[0].charAt(0).toUpperCase() +
      parts[parts.length - 1].charAt(0).toUpperCase()
    );
  },

  // ========== Company-Related Methods ==========

  // Get all contacts grouped by company ID
  getContactsGroupedByCompanyId: (): { [companyId: number]: Contact[] } => {
    const grouped: { [companyId: number]: Contact[] } = {};
    contactsCache.forEach((contact) => {
      if (!grouped[contact.company_id]) {
        grouped[contact.company_id] = [];
      }
      grouped[contact.company_id].push(contact);
    });
    return grouped;
  },

  // Get companies with contact counts
  getCompaniesWithContactCounts: (): {
    company_id: number;
    total: number;
    active: number;
  }[] => {
    const companyIds = contactsService.getUniqueCompanyIds();
    return companyIds.map((companyId) => ({
      company_id: companyId,
      total: contactsService.countContactsByCompanyId(companyId),
      active: contactsService.countActiveContactsByCompanyId(companyId),
    }));
  },

  // Check if company has any contacts
  hasContactsForCompany: (companyId: number): boolean => {
    return contactsCache.some((contact) => contact.company_id === companyId);
  },

  // Check if company has active contacts
  hasActiveContactsForCompany: (companyId: number): boolean => {
    return contactsCache.some(
      (contact) => contact.company_id === companyId && contact.active,
    );
  },

  // ========== Statistics & Reporting Methods ==========

  // Get contact statistics
  getContactStatistics: (): {
    total: number;
    active: number;
    inactive: number;
    byCompanyId: { [companyId: number]: number };
    byEmailDomain: { [domain: string]: number };
  } => {
    const stats = {
      total: contactsCache.length,
      active: contactsCache.filter((c) => c.active).length,
      inactive: contactsCache.filter((c) => !c.active).length,
      byCompanyId: {} as { [companyId: number]: number },
      byEmailDomain: {} as { [domain: string]: number },
    };

    contactsCache.forEach((contact) => {
      stats.byCompanyId[contact.company_id] =
        (stats.byCompanyId[contact.company_id] || 0) + 1;
      const domain = contact.email.split("@")[1];
      stats.byEmailDomain[domain] = (stats.byEmailDomain[domain] || 0) + 1;
    });

    return stats;
  },

  // Get company contact summary
  getCompanyContactSummary: (): {
    company_id: number;
    total: number;
    active: number;
    inactive: number;
    primaryContact: string;
  }[] => {
    const companyIds = contactsService.getUniqueCompanyIds();
    return companyIds.map((companyId) => {
      const primaryContact =
        contactsService.getPrimaryContactForCompany(companyId);
      return {
        company_id: companyId,
        total: contactsService.countContactsByCompanyId(companyId),
        active: contactsService.countActiveContactsByCompanyId(companyId),
        inactive:
          contactsService.countContactsByCompanyId(companyId) -
          contactsService.countActiveContactsByCompanyId(companyId),
        primaryContact: primaryContact ? primaryContact.name : "N/A",
      };
    });
  },

  // ========== UI Helper Methods ==========

  // Get contact names for dropdown
  getContactNames: (): string[] => {
    return contactsCache.map((contact) => contact.name);
  },

  // Get active contact names for dropdown
  getActiveContactNames: (): string[] => {
    return contactsCache
      .filter((contact) => contact.active)
      .map((contact) => contact.name);
  },

  // Get contact IDs for dropdown
  getContactIds: (): number[] => {
    return contactsCache.map((contact) => contact.id);
  },

  // Get active contact IDs for dropdown
  getActiveContactIds: (): number[] => {
    return contactsCache
      .filter((contact) => contact.active)
      .map((contact) => contact.id);
  },

  // Get contact options for select components (by ID)
  getContactOptions: (): { value: number; label: string }[] => {
    return contactsCache.map((contact) => ({
      value: contact.id,
      label: contact.name,
    }));
  },

  // Get active contact options for select components
  getActiveContactOptions: (): { value: number; label: string }[] => {
    return contactsCache
      .filter((contact) => contact.active)
      .map((contact) => ({
        value: contact.id,
        label: contact.name,
      }));
  },

  // Get contact options by company ID
  getContactOptionsByCompanyId: (
    companyId: number,
  ): { value: number; label: string }[] => {
    return contactsCache
      .filter((contact) => contact.company_id === companyId && contact.active)
      .map((contact) => ({
        value: contact.id,
        label: contact.name,
      }));
  },

  // Get contact options with full details
  getContactOptionsDetailed: (): {
    value: number;
    label: string;
    email: string;
    phone: string;
    company_id: number;
  }[] => {
    return contactsCache.map((contact) => ({
      value: contact.id,
      label: contact.name,
      email: contact.email,
      phone: contact.phone,
      company_id: contact.company_id,
    }));
  },

  // Format contact display by ID
  formatContactDisplay: (contactId: number): string => {
    const contact = contactsCache.find((c) => c.id === contactId);
    return contact ? contact.name : `Contact #${contactId}`;
  },

  // Format contact display with email
  formatContactDisplayWithEmail: (contactId: number): string => {
    const contact = contactsCache.find((c) => c.id === contactId);
    return contact
      ? `${contact.name} - ${contact.email}`
      : `Contact #${contactId}`;
  },

  // Format phone number for display
  formatPhoneDisplay: (phone: string): string => {
    // Remove all non-digits
    const cleaned = phone.replace(/\D/g, "");

    // Format as +X-XXX-XXXX for 10+ digits
    if (cleaned.length >= 10) {
      if (cleaned.length === 10) {
        return `+1-${cleaned.slice(0, 3)}-${cleaned.slice(3, 7)}-${cleaned.slice(7)}`;
      } else if (cleaned.length === 11 && cleaned.startsWith("1")) {
        return `+1-${cleaned.slice(1, 4)}-${cleaned.slice(4, 8)}-${cleaned.slice(8)}`;
      }
    }
    return phone;
  },

  // Get status badge styling
  getStatusBadge: (active: boolean): string => {
    return active ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800";
  },
};
