import { API_BASE_URL } from "../config/api";
import { parseApiError } from "../utils/parseApiError";
import { authService } from "./authService";

export interface OpenCheckout {
  id: number;
  company_name: string;
  cylinder_type: string;
  cylinder_number: string;
  contact_name: string;
  phone: string;
  email: string;
  checkout_date: string;
}

const buildAuthHeaders = (): HeadersInit => {
  const token = authService.getAuthState().token;
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

export const openCheckoutsService = {
  fetchOpenCheckouts: async (): Promise<OpenCheckout[]> => {
    const response = await fetch(`${API_BASE_URL}/cylinder_checkout/open`, {
      method: "GET",
      headers: buildAuthHeaders(),
    });
    if (!response.ok) {
      throw new Error(
        await parseApiError(response, "Failed to load open checkouts"),
      );
    }
    return await response.json();
  },
};
