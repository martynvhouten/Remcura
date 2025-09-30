export interface LowStockItemDTO {
  productId: string;
  productName: string;
  currentQuantity: number;
  minimumQuantity: number;
  locationId?: string;
  locationName?: string;
  availableQuantity?: number;
  reservedQuantity?: number;
  preferredSupplierId?: string | null;
  lastMovementAt?: string | null;
  productSku?: string | null;
  unitPrice?: number | null;
}

export interface StockTurnoverRateDTO {
  productId: string;
  productName: string;
  totalUsed: number;
  averageStock: number;
  turnoverRate: number;
}

export interface TopUsedProductDTO {
  productId: string;
  productName: string;
  totalUsed: number;
  usageCount: number;
}
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
    productName: string;
    totalQuantity: number;
    orderCount: number;
    productId: string;
  }>;
  orderTrends: Record<string, number>;
}

export interface ProductMetrics {
  totalUpdates: number;
  productsScanned: number;
  lowStockAlerts: number;
  stockEntryTrends: Record<string, number>;
  mostUpdatedProducts: Array<{
    productName: string;
    updateCount: number;
    productId: string;
  }>;
}

export interface UserActivityMetrics {
  activeUsers: number;
  totalSessions: number;
  averageSessionDuration: number;
  usersByRole: Record<string, number>;
  mostActiveUsers: Array<{
    userId: string;
    sessionCount: number;
    totalDuration: number;
    practiceName?: string;
  }>;
  userList?: Array<{
    userId: string;
    activityCount: number;
    lastActivity: string;
    totalEvents: number;
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

export interface UsageAnalytics {
  id: string;
  practiceId: string;
  userId: string | null;
  locationId: string | null;
  eventType: string;
  eventData: Record<string, unknown> | null;
  sessionId: string | null;
  userAgent: string | null;
  ipAddress: string | null;
  createdAt: string;
}

export interface AnalyticsStockLevelDTO {
  productId: string;
  locationId: string;
  currentQuantity: number;
  minimumQuantity: number;
  reservedQuantity: number;
  availableQuantity: number;
  productName?: string;
  locationName?: string;
  preferredSupplierId?: string | null;
  updatedAt?: string | null;
}

export interface OrderListStatusDTO {
  id: string;
  practiceId: string;
  supplierId: string | null;
  status: string | null;
  totalItems: number;
  totalCost: number;
  updatedAt: string | null;
}
