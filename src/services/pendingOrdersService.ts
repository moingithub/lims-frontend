import {
  workOrdersService,
  WorkOrderWithId,
} from "./workOrdersService";

export interface PendingOrder {
  id: number;
  work_order_id: string;
  customer: string;
  company_id?: number;
  cylinders: number;
  date: string;
  days_pending: number;
  priority: string;
  created_by: number;
}

const parseCylinderCount = (order: WorkOrderWithId): number => {
  if (typeof order.cylinders === "number") return order.cylinders;
  if (typeof order.cylinders === "string" && order.cylinders.trim() !== "") {
    const parsed = Number(order.cylinders);
    if (Number.isFinite(parsed)) return parsed;
  }
  return 0;
};

const getDaysPending = (order: WorkOrderWithId): number => {
  if (order.pending_since != null && Number.isFinite(order.pending_since)) {
    return Math.max(0, Math.floor(order.pending_since));
  }
  return workOrdersService.calculateDaysSince(order.date);
};

const getPriorityFromDays = (days: number): string => {
  if (days >= 5) return "High";
  if (days >= 2) return "Medium";
  return "Low";
};

const mapWorkOrderToPendingOrder = (order: WorkOrderWithId): PendingOrder | null => {
  const cylinders = parseCylinderCount(order);
  if (cylinders <= 0) return null;

  const days_pending = getDaysPending(order);

  return {
    id: order.api_id ?? 0,
    work_order_id: order.id,
    customer: order.customer,
    company_id: order.company_id,
    cylinders,
    date: order.date,
    days_pending,
    priority: getPriorityFromDays(days_pending),
    created_by: order.created_by,
  };
};

export const pendingOrdersService = {
  fetchPendingOrders: async (): Promise<PendingOrder[]> => {
    const orders = await workOrdersService.fetchWorkOrders();
    return orders
      .filter(
        (order) => order.status === "Pending" || order.status === "In Progress",
      )
      .map(mapWorkOrderToPendingOrder)
      .filter((order): order is PendingOrder => order != null)
      .sort((a, b) => b.days_pending - a.days_pending);
  },

  searchOrders: (orders: PendingOrder[], searchTerm: string): PendingOrder[] => {
    const normalized = searchTerm.trim().toLowerCase();
    if (!normalized) return orders;

    return orders.filter((order) =>
      [order.work_order_id, order.customer, order.priority, order.date]
        .some((value) => String(value).toLowerCase().includes(normalized)),
    );
  },

  filterByCustomer: (orders: PendingOrder[], customer: string): PendingOrder[] => {
    if (customer === "all") return orders;
    return orders.filter((order) => order.customer === customer);
  },

  filterByPriority: (orders: PendingOrder[], priority: string): PendingOrder[] => {
    if (priority === "all") return orders;
    return orders.filter((order) => order.priority === priority);
  },

  getUniqueCustomers: (orders: PendingOrder[]): string[] => {
    return Array.from(new Set(orders.map((order) => order.customer))).sort();
  },

  getUniquePriorities: (orders: PendingOrder[]): string[] => {
    return Array.from(new Set(orders.map((order) => order.priority))).sort();
  },

  getPriorityBadgeVariant: (priority: string): string => {
    switch (priority) {
      case "High":
        return "bg-red-100 text-red-800";
      case "Medium":
        return "bg-yellow-100 text-yellow-800";
      case "Low":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  },

  exportToCSV: (orders: PendingOrder[]): string => {
    const headers = [
      "Work Order ID",
      "Customer",
      "Cylinders",
      "Date",
      "Days Pending",
      "Priority",
    ];
    const rows = orders.map((order) => [
      order.work_order_id,
      order.customer,
      order.cylinders,
      order.date,
      order.days_pending,
      order.priority,
    ]);

    return [headers.join(","), ...rows.map((row) => row.join(","))].join("\n");
  },
};
