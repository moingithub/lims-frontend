// Unified User Service - Handles CRUD operations, search, validation, and helper methods
import { API_BASE_URL } from "../config/api";
import { authService } from "./authService";

export interface User {
  id: number;
  name: string;
  email: string;
  password: string;
  role_id: number;
  company_id?: number | null;
  active: boolean;
  created_by: number;
}

type ApiUser = {
  id: number;
  name: string;
  email: string;
  role_id: number;
  company_id: number | null;
  active: boolean;
  created_by_id: number | null;
};

let usersCache: User[] = [];
let usersLoaded = false;

const mapApiUser = (user: ApiUser): User => ({
  id: user.id,
  name: user.name,
  email: user.email,
  password: "",
  role_id: user.role_id,
  company_id: user.company_id ?? null,
  active: user.active,
  created_by: user.created_by_id ?? 0,
});

const buildAuthHeaders = (): HeadersInit => {
  const token = authService.getAuthState().token;
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

export const usersService = {
  // ========== CRUD Operations ==========

  // Get all users
  getUsers: (): User[] => {
    return usersCache;
  },

  // Fetch users from API (cached)
  fetchUsers: async (force = false): Promise<User[]> => {
    if (usersLoaded && !force) return usersCache;

    const response = await fetch(`${API_BASE_URL}/Users`, {
      method: "GET",
      headers: buildAuthHeaders(),
    });

    if (!response.ok) {
      const message =
        response.status === 401 ? "Unauthorized" : "Failed to load users";
      throw new Error(message);
    }

    const data: ApiUser[] = await response.json();
    usersCache = Array.isArray(data) ? data.map(mapApiUser) : [];
    usersLoaded = true;
    return usersCache;
  },

  // Replace cached users (local updates)
  setUsers: (users: User[]): void => {
    usersCache = users;
    usersLoaded = true;
  },

  // Add a new user
  addUser: async (
    user: Omit<User, "id" | "created_by" | "company_id">,
  ): Promise<User> => {
    const response = await fetch(`${API_BASE_URL}/Users`, {
      method: "POST",
      headers: buildAuthHeaders(),
      body: JSON.stringify({
        name: user.name,
        email: user.email,
        password: user.password,
        role_id: user.role_id,
        active: user.active,
      }),
    });

    if (!response.ok) {
      const message =
        response.status === 401 ? "Unauthorized" : "Failed to create user";
      throw new Error(message);
    }

    const data: ApiUser = await response.json();
    const createdUser = mapApiUser(data);
    usersCache = [...usersCache, createdUser];
    usersLoaded = true;
    return createdUser;
  },

  // Update an existing user
  updateUser: async (
    id: number,
    updatedUser: Omit<User, "created_by" | "company_id">,
  ): Promise<User> => {
    const payload: {
      name: string;
      email: string;
      role_id: number;
      active: boolean;
      password?: string;
    } = {
      name: updatedUser.name,
      email: updatedUser.email,
      role_id: updatedUser.role_id,
      active: updatedUser.active,
    };

    const trimmedPassword = updatedUser.password?.trim();
    if (trimmedPassword) {
      payload.password = trimmedPassword;
    }

    const response = await fetch(`${API_BASE_URL}/Users/${id}`, {
      method: "PUT",
      headers: buildAuthHeaders(),
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const message =
        response.status === 401 ? "Unauthorized" : "Failed to update user";
      throw new Error(message);
    }

    const data: ApiUser = await response.json();
    const savedUser = mapApiUser(data);
    usersCache = usersCache.map((user) => (user.id === id ? savedUser : user));
    usersLoaded = true;
    return savedUser;
  },

  // Delete a user
  deleteUser: async (id: number): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/Users/${id}`, {
      method: "DELETE",
      headers: buildAuthHeaders(),
    });

    if (!response.ok) {
      const message =
        response.status === 401 ? "Unauthorized" : "Failed to delete user";
      throw new Error(message);
    }

    usersCache = usersCache.filter((user) => user.id !== id);
    usersLoaded = true;
  },

  // Reset a user's password (admin only)
  resetUserPassword: async (
    id: number,
    newPassword: string,
  ): Promise<string> => {
    const response = await fetch(`${API_BASE_URL}/users/${id}/reset-password`, {
      method: "POST",
      headers: buildAuthHeaders(),
      body: JSON.stringify({ new_password: newPassword }),
    });

    if (!response.ok) {
      const message =
        response.status === 401 ? "Unauthorized" : "Failed to reset password";
      throw new Error(message);
    }

    const data: { message?: string } = await response.json();
    return data.message || "Password reset";
  },

  // Change own password (self-service)
  changeOwnPassword: async (
    id: number,
    currentPassword: string,
    newPassword: string,
  ): Promise<string> => {
    const response = await fetch(
      `${API_BASE_URL}/users/${id}/change-password`,
      {
        method: "POST",
        headers: buildAuthHeaders(),
        body: JSON.stringify({
          current_password: currentPassword,
          new_password: newPassword,
        }),
      },
    );

    if (!response.ok) {
      const message =
        response.status === 401 ? "Unauthorized" : "Failed to change password";
      throw new Error(message);
    }

    const data: { message?: string } = await response.json();
    return data.message || "Password changed";
  },

  // Search users by any field
  searchUsers: (users: User[], searchTerm: string): User[] => {
    return users.filter(
      (user) =>
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.id.toString().includes(searchTerm) ||
        user.role_id.toString().includes(searchTerm),
    );
  },

  // Validate user data
  validateUser: (
    user: Partial<User>,
    options?: { requirePassword?: boolean },
  ): { valid: boolean; error?: string } => {
    const requirePassword = options?.requirePassword ?? true;
    if (!user.name || user.name.trim() === "") {
      return { valid: false, error: "Name is required" };
    }
    if (!user.email || user.email.trim() === "") {
      return { valid: false, error: "Email is required" };
    }
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(user.email)) {
      return { valid: false, error: "Invalid email format" };
    }
    if (requirePassword && (!user.password || user.password.trim() === "")) {
      return { valid: false, error: "Password is required" };
    }
    if (
      user.password &&
      user.password.trim() !== "" &&
      user.password.length < 6
    ) {
      return { valid: false, error: "Password must be at least 6 characters" };
    }
    if (!user.role_id) {
      return { valid: false, error: "Role is required" };
    }
    return { valid: true };
  },

  // ========== Helper Methods ==========

  // Get a single user by ID
  getUserById: (id: number): User | undefined => {
    return usersCache.find((user) => user.id === id);
  },

  // Get a single user by email
  getUserByEmail: (email: string): User | undefined => {
    return usersCache.find(
      (user) => user.email.toLowerCase() === email.toLowerCase(),
    );
  },

  // Get a single user by name
  getUserByName: (name: string): User | undefined => {
    return usersCache.find((user) => user.name === name);
  },

  // Check if a user exists by email (excluding specific ID for updates)
  userExistsByEmail: (email: string, excludeId?: number): boolean => {
    return usersCache.some(
      (user) =>
        user.email.toLowerCase() === email.toLowerCase() &&
        user.id !== excludeId,
    );
  },

  // Check if a user exists by name (excluding specific ID for updates)
  userExistsByName: (name: string, excludeId?: number): boolean => {
    return usersCache.some(
      (user) => user.name === name && user.id !== excludeId,
    );
  },

  // Get users by role ID
  getUsersByRoleId: (roleId: number): User[] => {
    return usersCache.filter((user) => user.role_id === roleId);
  },

  // Get active users only
  getActiveUsers: (): User[] => {
    return usersCache.filter((user) => user.active);
  },

  // Get inactive users only
  getInactiveUsers: (): User[] => {
    return usersCache.filter((user) => !user.active);
  },

  // Get active users by role ID
  getActiveUsersByRoleId: (roleId: number): User[] => {
    return usersCache.filter((user) => user.role_id === roleId && user.active);
  },

  // Count users by role ID
  countUsersByRoleId: (roleId: number): number => {
    return usersCache.filter((user) => user.role_id === roleId).length;
  },

  // Count active users by role ID
  countActiveUsersByRoleId: (roleId: number): number => {
    return usersCache.filter((user) => user.role_id === roleId && user.active)
      .length;
  },

  // Count total active users
  countActiveUsers: (): number => {
    return usersCache.filter((user) => user.active).length;
  },

  // Count total inactive users
  countInactiveUsers: (): number => {
    return usersCache.filter((user) => !user.active).length;
  },

  // Get unique role IDs from users
  getUniqueRoleIds: (): number[] => {
    const roleIds = usersCache.map((u) => u.role_id);
    return Array.from(new Set(roleIds));
  },

  // Get user statistics
  getUserStatistics: (): {
    total: number;
    active: number;
    inactive: number;
    byRoleId: { [roleId: number]: number };
  } => {
    const stats = {
      total: usersCache.length,
      active: usersCache.filter((u) => u.active).length,
      inactive: usersCache.filter((u) => !u.active).length,
      byRoleId: {} as { [roleId: number]: number },
    };

    usersCache.forEach((user) => {
      stats.byRoleId[user.role_id] = (stats.byRoleId[user.role_id] || 0) + 1;
    });

    return stats;
  },

  // Get user options for select components
  getUserOptions: (): { value: number; label: string }[] => {
    return usersCache.map((user) => ({
      value: user.id,
      label: user.name,
    }));
  },

  // Get active user options for select components
  getActiveUserOptions: (): { value: number; label: string }[] => {
    return usersCache
      .filter((user) => user.active)
      .map((user) => ({
        value: user.id,
        label: user.name,
      }));
  },

  // Get user options with role info
  getUserOptionsWithRole: (): {
    value: number;
    label: string;
    email: string;
    role_id: number;
  }[] => {
    return usersCache.map((user) => ({
      value: user.id,
      label: user.name,
      email: user.email,
      role_id: user.role_id,
    }));
  },

  // Format user display
  formatUserDisplay: (userId: number): string => {
    const user = usersCache.find((u) => u.id === userId);
    return user ? `${user.name} (${user.email})` : `User #${userId}`;
  },

  // Get status badge styling
  getStatusBadge: (active: boolean): string => {
    return active ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800";
  },

  // ========== Authentication Methods ==========

  // Validate user credentials for login
  validateUserCredentials: (
    email: string,
    password: string,
  ): { valid: boolean; error?: string; user?: User } => {
    // Find user by email
    const user = usersCache.find(
      (u) => u.email.toLowerCase() === email.toLowerCase(),
    );

    if (!user) {
      return { valid: false, error: "Invalid email or password" };
    }

    // Check password
    if (user.password !== password) {
      return { valid: false, error: "Invalid email or password" };
    }

    // Check if user is active
    if (!user.active) {
      return { valid: false, error: "User account is inactive" };
    }

    return { valid: true, user };
  },

  // Get user's role information
  getUserRole: (
    userId: number,
  ): { id: number; role_name: string; description: string } | null => {
    const user = usersCache.find((u) => u.id === userId);
    if (!user) return null;

    // Import roles data (this would normally come from rolesService)
    const roles = [
      { id: 1, role_name: "Administrator", description: "Full system access" },
      {
        id: 2,
        role_name: "Employee",
        description: "Lab operations and sales access",
      },
      {
        id: 3,
        role_name: "Customer",
        description: "Access to their own data only",
      },
    ];

    return roles.find((r) => r.id === user.role_id) || null;
  },
};
