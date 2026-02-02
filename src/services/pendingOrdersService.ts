export interface PendingOrder {
  id: number;
  work_order_id: string;
  customer: string;
  cylinders: number;
  date: string;
  days_pending: number;
  priority: string;
  created_by: number;
}

const initialPendingOrders: PendingOrder[] = [
  { 
    id: 1, 
    work_order_id: "WO-001236", 
    customer: "Industrial Co", 
    cylinders: 5, 
    date: "2025-11-03", 
    days_pending: 3,
    priority: "High",
    created_by: 1,
  },
  { 
    id: 2, 
    work_order_id: "WO-001237", 
    customer: "Gas Solutions", 
    cylinders: 3, 
    date: "2025-11-03", 
    days_pending: 2,
    priority: "Medium",
    created_by: 1,
  },
  { 
    id: 3, 
    work_order_id: "WO-001240", 
    customer: "TechGas Inc", 
    cylinders: 4, 
    date: "2025-10-30", 
    days_pending: 5,
    priority: "High",
    created_by: 1,
  },
];

export const pendingOrdersService = {
  getPendingOrders: (): PendingOrder[] => {
    return initialPendingOrders;
  },

  searchOrders: (orders: PendingOrder[], searchTerm: string): PendingOrder[] => {
    return orders.filter(order =>
      Object.values(order).some(value =>
        String(value).toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
  },

  filterByCustomer: (orders: PendingOrder[], customer: string): PendingOrder[] => {
    if (customer === "all") return orders;
    return orders.filter(order => order.customer === customer);
  },

  filterByPriority: (orders: PendingOrder[], priority: string): PendingOrder[] => {
    if (priority === "all") return orders;
    return orders.filter(order => order.priority === priority);
  },

  getUniqueCustomers: (orders: PendingOrder[]): string[] => {
    return Array.from(new Set(orders.map(order => order.customer))).sort();
  },

  getUniquePriorities: (orders: PendingOrder[]): string[] => {
    return Array.from(new Set(orders.map(order => order.priority))).sort();
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
    const headers = ["Work Order ID", "Customer", "Cylinders", "Date", "Days Pending", "Priority"];
    const rows = orders.map(order => [
      order.work_order_id,
      order.customer,
      order.cylinders,
      order.date,
      order.days_pending,
      order.priority,
    ]);
    
    const csvContent = [
      headers.join(","),
      ...rows.map(row => row.join(",")),
    ].join("\n");
    
    return csvContent;
  },
};