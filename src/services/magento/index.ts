// Enhanced Magento API service with full implementation
import { handleApiError, ServiceErrorHandler, validateRequired } from 'src/utils/service-error-handler';
import { supabase } from 'src/services/supabase';
import { useAuthStore } from 'src/stores/auth';
import type { 
  MagentoConfig, 
  MagentoOrder, 
  MagentoOrderItem, 
  MagentoProduct,
  MagentoSearchCriteria
} from '@/types/magento';

export interface MagentoOrder {
  id: number;
  increment_id: string;
  status: string;
  created_at: string;
  updated_at: string;
  grand_total: number;
  items: MagentoOrderItem[];
  billing_address?: MagentoAddress;
  shipping_address?: MagentoAddress;
  payment?: MagentoPayment;
}

export interface MagentoOrderItem {
  id: number;
  product_id: number;
  name: string;
  sku: string;
  qty_ordered: number;
  price: number;
  product_type: string;
}

export interface MagentoAddress {
  firstname: string;
  lastname: string;
  company?: string;
  street: string[];
  city: string;
  region: string;
  postcode: string;
  country_id: string;
  telephone?: string;
  email?: string;
}

export interface MagentoPayment {
  method: string;
  amount_ordered: number;
  currency_code: string;
  transaction_id?: string;
  additional_information?: string[];
}

export interface MagentoInvoice {
  id: number;
  order_id: number;
  increment_id: string;
  created_at: string;
  grand_total: number;
  state: number;
  items: MagentoInvoiceItem[];
}

export interface MagentoInvoiceItem {
  id: number;
  name: string;
  sku: string;
  qty: number;
  price: number;
}

export interface MagentoProduct {
  id: number;
  sku: string;
  name: string;
  price: number;
  status: number;
  type_id: string;
  weight?: number;
  attribute_set_id: number;
  custom_attributes?: MagentoCustomAttribute[];
}

export interface MagentoCustomAttribute {
  attribute_code: string;
  value: string | number | boolean;
}

export interface MagentoSearchCriteria {
  filterGroups?: MagentoFilterGroup[];
  sortOrders?: MagentoSortOrder[];
  pageSize?: number;
  currentPage?: number;
}

export interface MagentoFilterGroup {
  filters: MagentoFilter[];
}

export interface MagentoFilter {
  field: string;
  value: string | number;
  condition_type?: string;
}

export interface MagentoSortOrder {
  field: string;
  direction: 'ASC' | 'DESC';
}

class MagentoApiService {
  private config: MagentoConfig | null = null;
  private readonly DEFAULT_TIMEOUT = 30000;

  /**
   * Configure the Magento API service
   */
  configure(config: MagentoConfig): void {
    validateRequired({
      baseUrl: config.baseUrl,
      token: config.token,
    }, {
      service: 'MagentoApiService',
      operation: 'configure',
    });

    this.config = {
      ...config,
      timeout: config.timeout || this.DEFAULT_TIMEOUT,
      storeCode: config.storeCode || 'default',
    };
  }

  private async makeRequest(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<any> {
    if (!this.config) {
      throw new Error($t('index.magentoapiconfigurationis'));
    }

    const url = `${this.config.baseUrl}/rest/V1${endpoint}`;

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.config.timeout);

      const response = await fetch(url, {
        ...options,
        headers: {
          Authorization: `Bearer ${this.config.token}`,
          'Content-Type': 'application/json',
          'Store': this.config.storeCode || 'default',
          ...options.headers,
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorBody = await response.text();
        handleApiError(
          new Error($t('index.httpresponsestatusresponsestatuste')),
          {
            service: 'MagentoApiService',
            operation: 'makeRequest',
            metadata: { endpoint, method: options.method || 'GET', status: response.status },
          }
        );
      }

      return response.json();
    } catch (error) {
      if (error.name === 'AbortError') {
        handleApiError(
          new Error($t('index.requesttimeout')),
          {
            service: 'MagentoApiService',
            operation: 'makeRequest',
            metadata: { endpoint, timeout: this.config.timeout },
          }
        );
      }
      
      handleApiError(error, {
        service: 'MagentoApiService',
        operation: 'makeRequest',
        metadata: { endpoint, method: options.method || 'GET' },
      });
    }
  }

  /**
   * Test the connection to Magento API
   */
  async testConnection(): Promise<{ success: boolean; message: string }> {
    if (!this.isConfigured()) {
      return {
        success: false,
        message: 'API not configured',
      };
    }

    try {
      // Test with a simple API call
      await this.makeRequest('/store/storeConfigs');
      return {
        success: true,
        message: 'Connection successful',
      };
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Connection failed',
      };
    }
  }

  /**
   * Get connection status with detailed information
   */
  async getConnectionStatus(): Promise<{
    configured: boolean;
    connected: boolean;
    message: string;
    lastTested?: Date;
  }> {
    const configured = this.isConfigured();
    
    if (!configured) {
      return {
        configured: false,
        connected: false,
        message: 'Not configured',
      };
    }

    const connectionTest = await this.testConnection();
    
    return {
      configured: true,
      connected: connectionTest.success,
      message: connectionTest.message,
      lastTested: new Date(),
    };
  }

  /**
   * Create search criteria helper
   */
  createSearchCriteria(options: {
    filters?: Array<{ field: string; value: string | number; condition?: string }>;
    sortBy?: string;
    sortDirection?: 'ASC' | 'DESC';
    pageSize?: number;
    currentPage?: number;
  }): MagentoSearchCriteria {
    const criteria: MagentoSearchCriteria = {};

    if (options.filters && options.filters.length > 0) {
      criteria.filterGroups = [{
        filters: options.filters.map(filter => ({
          field: filter.field,
          value: filter.value,
          condition_type: filter.condition || 'eq',
        })),
      }];
    }

    if (options.sortBy) {
      criteria.sortOrders = [{
        field: options.sortBy,
        direction: options.sortDirection || 'ASC',
      }];
    }

    if (options.pageSize) {
      criteria.pageSize = options.pageSize;
    }

    if (options.currentPage) {
      criteria.currentPage = options.currentPage;
    }

    return criteria;
  }

  // Order management
  async getOrders(searchCriteria?: MagentoSearchCriteria): Promise<MagentoOrder[]> {
    const endpoint = '/orders';
    const params: string[] = [];
    if (searchCriteria) {
      if (searchCriteria.filterGroups && searchCriteria.filterGroups.length > 0) {
        params.push(`searchCriteria[filter_groups]=${JSON.stringify(searchCriteria.filterGroups)}`);
      }
      if (searchCriteria.sortOrders && searchCriteria.sortOrders.length > 0) {
        params.push(`searchCriteria[sort_orders]=${JSON.stringify(searchCriteria.sortOrders)}`);
      }
      if (searchCriteria.pageSize) {
        params.push(`searchCriteria[page_size]=${searchCriteria.pageSize}`);
      }
      if (searchCriteria.currentPage) {
        params.push(`searchCriteria[current_page]=${searchCriteria.currentPage}`);
      }
    }
    const queryString = params.length > 0 ? `?${params.join('&')}` : '';
    return this.makeRequest(`${endpoint}${queryString}`);
  }

  async getOrder(orderId: string): Promise<MagentoOrder | null> {
    return this.makeRequest(`/orders/${orderId}`);
  }

  async createOrder(orderData: MagentoOrder): Promise<MagentoOrder> {
    return this.makeRequest('/orders', {
      method: 'POST',
      body: JSON.stringify({ entity: orderData })
    });
  }

  // Invoice management
  async getInvoices(searchCriteria?: MagentoSearchCriteria): Promise<MagentoInvoice[]> {
    const endpoint = '/invoices';
    const params: string[] = [];
    if (searchCriteria) {
      if (searchCriteria.filterGroups && searchCriteria.filterGroups.length > 0) {
        params.push(`searchCriteria[filter_groups]=${JSON.stringify(searchCriteria.filterGroups)}`);
      }
      if (searchCriteria.sortOrders && searchCriteria.sortOrders.length > 0) {
        params.push(`searchCriteria[sort_orders]=${JSON.stringify(searchCriteria.sortOrders)}`);
      }
      if (searchCriteria.pageSize) {
        params.push(`searchCriteria[page_size]=${searchCriteria.pageSize}`);
      }
      if (searchCriteria.currentPage) {
        params.push(`searchCriteria[current_page]=${searchCriteria.currentPage}`);
      }
    }
    const queryString = params.length > 0 ? `?${params.join('&')}` : '';
    return this.makeRequest(`${endpoint}${queryString}`);
  }

  async getInvoice(invoiceId: string): Promise<MagentoInvoice | null> {
    return this.makeRequest(`/invoices/${invoiceId}`);
  }

  // Product management
  async getProducts(searchCriteria?: MagentoSearchCriteria): Promise<MagentoProduct[]> {
    // If Magento API is configured, try to use it first
    if (this.isConfigured()) {
      try {
        const endpoint = '/products';
        const params: string[] = [];
        if (searchCriteria) {
          if (searchCriteria.filterGroups && searchCriteria.filterGroups.length > 0) {
            params.push(`searchCriteria[filter_groups]=${JSON.stringify(searchCriteria.filterGroups)}`);
          }
          if (searchCriteria.sortOrders && searchCriteria.sortOrders.length > 0) {
            params.push(`searchCriteria[sort_orders]=${JSON.stringify(searchCriteria.sortOrders)}`);
          }
          if (searchCriteria.pageSize) {
            params.push(`searchCriteria[page_size]=${searchCriteria.pageSize}`);
          }
          if (searchCriteria.currentPage) {
            params.push(`searchCriteria[current_page]=${searchCriteria.currentPage}`);
          }
        }
        const queryString = params.length > 0 ? `?${params.join('&')}` : '';
        return this.makeRequest(`${endpoint}${queryString}`);
      } catch (error) {
        console.warn('Magento API failed, falling back to Supabase data:', error);
      }
    }
    
    // Fallback to Supabase data
    return magentoDataService.getProducts();
  }

  async getProduct(sku: string): Promise<MagentoProduct | null> {
    // Try Magento API first, fallback to Supabase
    if (this.isConfigured()) {
      try {
        return this.makeRequest(`/products/${encodeURIComponent(sku)}`);
      } catch (error) {
        console.warn('Magento API failed for single product, checking Supabase:', error);
      }
    }
    
    // Fallback: search in Supabase products
    const products = await magentoDataService.getProducts();
    return products.find(p => p.sku === sku) || null;
  }

  // Order management with Supabase fallback
  async getOrders(): Promise<MagentoOrder[]> {
    // If Magento API is configured, try to use it first
    if (this.isConfigured()) {
      try {
        return this.makeRequest('/orders');
      } catch (error) {
        console.warn('Magento API failed, falling back to Supabase data:', error);
      }
    }
    
    // Fallback to Supabase data
    return magentoDataService.getOrders();
  }

  // Invoice management with Supabase fallback
  async getInvoices(): Promise<MagentoInvoice[]> {
    // If Magento API is configured, try to use it first
    if (this.isConfigured()) {
      try {
        return this.makeRequest('/invoices');
      } catch (error) {
        console.warn('Magento API failed, falling back to Supabase data:', error);
      }
    }
    
    // Fallback to Supabase data
    return magentoDataService.getInvoices();
  }

  // Utility methods
  isConfigured(): boolean {
    return !!(this.config?.baseUrl && this.config?.token);
  }
}

// Export singleton instance
export const magentoApi = new MagentoApiService();

// Utility functions for Magento integration
export const magentoUtils = {
  formatOrderStatus(status: string): string {
    const statusMap: Record<string, string> = {
      pending: 'In behandeling',
      processing: 'Wordt verwerkt',
      shipped: 'Verzonden',
      complete: 'Voltooid',
      canceled: 'Geannuleerd',
      refunded: 'Terugbetaald',
    };

    return statusMap[status] || status;
  },

  formatPrice(price: number): string {
    return new Intl.NumberFormat('nl-NL', {
      style: 'currency',
      currency: 'EUR',
    }).format(price);
  },

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('nl-NL');
  },
};

// Real data service for Magento-compatible queries
export const magentoDataService = {
  /**
   * Get orders from Supabase in Magento-compatible format
   */
  async getOrders(practiceId?: string): Promise<MagentoOrder[]> {
    const authStore = useAuthStore();
    const currentPracticeId = practiceId || authStore.clinicId;
    
    if (!currentPracticeId) {
      throw new Error($t('index.nopracticeidavailable'));
    }

    try {
      const { data: orders, error } = await supabase
        .from('orders')
        .select(`
          *,
          order_items (
            *,
            products (*)
          )
        `)
        .eq('practice_id', currentPracticeId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return orders?.map(order => ({
        id: parseInt(order.id) || 0,
        increment_id: order.order_number || `ORD-${order.id}`,
        status: this.mapOrderStatus(order.status),
        created_at: order.created_at,
        updated_at: order.updated_at,
        grand_total: order.order_items?.reduce((sum, item) => 
          sum + (item.total_price || 0), 0
        ) || 0,
        items: order.order_items?.map(item => ({
          id: parseInt(item.id) || 0,
          product_id: parseInt(item.product_id) || 0,
          name: item.products?.name || '',
          sku: item.products?.sku || '',
          qty_ordered: item.quantity,
          price: item.unit_price || 0,
          product_type: 'simple'
        })) || []
      })) || [];
    } catch (error) {
      console.error('Error fetching orders for Magento:', error);
      return [];
    }
  },

  /**
   * Get products from Supabase in Magento-compatible format
   */
  async getProducts(practiceId?: string): Promise<MagentoProduct[]> {
    const authStore = useAuthStore();
    const currentPracticeId = practiceId || authStore.clinicId;
    
    if (!currentPracticeId) {
      throw new Error($t('index.nopracticeidavailable'));
    }

    try {
      const { data: products, error } = await supabase
        .from('products')
        .select('*')
        .eq('is_active', true)
        .order('name');

      if (error) throw error;

      return products?.map(product => ({
        id: parseInt(product.id) || 0,
        sku: product.sku || '',
        name: product.name || '',
        price: parseFloat(product.price || '0'),
        status: product.is_active ? 1 : 0,
        type_id: 'simple'
      })) || [];
    } catch (error) {
      console.error('Error fetching products for Magento:', error);
      return [];
    }
  },

  /**
   * Get invoices from order_items joined with orders in Magento-compatible format
   */
  async getInvoices(practiceId?: string): Promise<MagentoInvoice[]> {
    const authStore = useAuthStore();
    const currentPracticeId = practiceId || authStore.clinicId;
    
    if (!currentPracticeId) {
      throw new Error($t('index.nopracticeidavailable'));
    }

    try {
      const { data: orders, error } = await supabase
        .from('orders')
        .select(`
          *,
          order_items (
            *
          )
        `)
        .eq('practice_id', currentPracticeId)
        .in('status', ['completed', 'delivered', 'invoiced'])
        .order('created_at', { ascending: false });

      if (error) throw error;

      return orders?.map(order => ({
        id: parseInt(order.id) || 0,
        order_id: parseInt(order.id) || 0,
        increment_id: `INV-${order.order_number || order.id}`,
        created_at: order.updated_at || order.created_at,
        grand_total: order.order_items?.reduce((sum, item) => 
          sum + (item.total_price || 0), 0
        ) || 0
      })) || [];
    } catch (error) {
      console.error('Error fetching invoices for Magento:', error);
      return [];
    }
  },

  /**
   * Map internal order status to Magento-compatible status
   */
  mapOrderStatus(status: string): string {
    const statusMap: Record<string, string> = {
      'draft': 'pending',
      'submitted': 'processing',
      'confirmed': 'processing',
      'shipped': 'shipped',
      'delivered': 'complete',
      'completed': 'complete',
      'cancelled': 'canceled',
      'refunded': 'refunded'
    };
    return statusMap[status] || 'pending';
  }
};
