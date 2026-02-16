import { API_BASE_URL } from "../config/api";
import { authService } from "./authService";

export interface WorkOrderHeaderPayload {
  work_order_number: string;
  mileage_fee: number;
  miscellaneous_charges: number;
  hourly_fee: number;
  created_by_id: number;
  status: string;
  cylinders: number;
}

export const workorderHeadersService = {
  async getByNumber(work_order_number: string) {
    const token = authService.getAuthState().token;
    const response = await fetch(
      `${API_BASE_URL}/workorder_headers/by-number/${encodeURIComponent(work_order_number)}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );
    if (!response.ok) return null;
    return await response.json();
  },

  async create(payload: WorkOrderHeaderPayload) {
    const token = authService.getAuthState().token;
    const response = await fetch(`${API_BASE_URL}/workorder_headers`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });
    if (!response.ok) throw await response.json();
    return await response.json();
  },

  async updateByNumber(
    work_order_number: string,
    payload: Partial<Omit<WorkOrderHeaderPayload, "work_order_number">>,
  ) {
    const token = authService.getAuthState().token;
    const response = await fetch(
      `${API_BASE_URL}/workorder_headers/by-number/${encodeURIComponent(work_order_number)}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      },
    );
    if (!response.ok) throw await response.json();
    return await response.json();
  },
};
