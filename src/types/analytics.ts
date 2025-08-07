// Analytics and metrics types
export interface AnalyticsDateRange {
  startDate: string;
  endDate: string;
}

export interface AnalyticsSummary {
  totalEvents: number;
  activeUsers: number;
  totalOrders: number;
  productUpdates: number;
  topEvents: [string, number][];
  userActivity: Record<string, { count: number; lastActivity: string }>;
  dailyActivity: Record<string, number>;
}

export interface OrderMetrics {
  totalOrders: number;
  totalOrderValue: number;
  averageOrderSize: number;
  ordersByStatus: Record<string, number>;
  frequentlyOrderedItems: Array<{
    product_name: string;
    total_quantity: number;
    order_count: number;
    product_id: string;
  }>;
  orderTrends: Record<string, number>;
}

export interface ProductMetrics {
  totalUpdates: number;
  productsScanned: number;
  lowStockAlerts: number;
  stockEntryTrends: Record<string, number>;
  mostUpdatedProducts: Array<{
    product_name: string;
    update_count: number;
    product_id: string;
  }>;
}

export interface UserActivityMetrics {
  activeUsers: number;
  totalSessions: number;
  averageSessionDuration: number;
  usersByRole: Record<string, number>;
  mostActiveUsers: Array<{
    user_id: string;
    session_count: number;
    total_duration: number;
    practice_name?: string;
  }>;
}

export interface AuditLogEntry {
  id: string;
  practice_id: string;
  user_id?: string;
  user_email?: string;
  action: string;
  resource_type: string;
  resource_id?: string;
  old_values?: Record<string, any>;
  new_values?: Record<string, any>;
  ip_address?: string;
  user_agent?: string;
  timestamp: string;
  success: boolean;
  error_message?: string;
}
