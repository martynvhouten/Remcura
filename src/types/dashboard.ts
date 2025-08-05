// Dashboard types
export interface DashboardWidget {
  id: string;
  title: string;
  type: 'metric' | 'chart' | 'table' | 'list';
  size: 'small' | 'medium' | 'large';
  order: number;
  data?: any;
  loading?: boolean;
  error?: string;
  visible: boolean;
}

export interface DashboardData {
  totalUsers: number;
  totalPractices: number;
  totalOrders: number;
  totalProducts: number;
  topPractices: Array<{
    practice_id: string;
    practice_name: string;
    user_count: number;
    order_count: number;
    last_activity: string;
  }>;
  recentActivity: Array<{
    practice_name: string;
    user_email: string;
    action: string;
    timestamp: string;
  }>;
  systemMetrics: {
    activeUsers: number;
    databaseSize: string;
    apiCalls: number;
    errorRate: number;
  };
}

export interface RoleDashboardConfig {
  owner: DashboardWidget[];
  manager: DashboardWidget[];
  assistant: DashboardWidget[];
  logistics: DashboardWidget[];
  member: DashboardWidget[];
}

// Practice-specific dashboard types
export interface PracticeWidget {
  id: string;
  title: string;
  type: 'metric' | 'chart' | 'table' | 'list';
  size: 'small' | 'medium' | 'large';
  order: number;
  data?: any;
  loading?: boolean;
  error?: string;
  visible: boolean;
}

export interface PracticeDashboardData {
  totalProducts: number;
  totalOrders: number;
  totalUsers: number;
  lowStockCount: number;
  recentOrders: Array<{
    id: string;
    product_name: string;
    quantity: number;
    status: string;
    created_at: string;
  }>;
  topProducts: Array<{
    product_id: string;
    product_name: string;
    order_count: number;
    total_quantity: number;
  }>;
}

export type PracticeRole = 'assistant' | 'manager' | 'owner';

// Platform dashboard types
export interface PlatformWidget {
  id: string;
  title: string;
  type: 'metric' | 'chart' | 'table' | 'list';
  size: 'small' | 'medium' | 'large';
  order: number;
  data?: any;
  loading?: boolean;
  error?: string;
  visible: boolean;
}

export interface PlatformDashboardData {
  totalPractices: number;
  totalUsers: number;
  totalOrders: number;
  totalRevenue: number;
  practiceGrowth: Array<{
    date: string;
    count: number;
  }>;
  userGrowth: Array<{
    date: string;
    count: number;
  }>;
  revenueGrowth: Array<{
    date: string;
    amount: number;
  }>;
  topPractices: Array<{
    practice_id: string;
    practice_name: string;
    user_count: number;
    order_count: number;
    revenue: number;
  }>;
}