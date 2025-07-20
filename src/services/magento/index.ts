// Enhanced Magento API service with full implementation
import { handleApiError, ServiceErrorHandler, validateRequired } from 'src/utils/service-error-handler';

export interface MagentoConfig {
  baseUrl: string;
  token: string;
  storeCode?: string;
  timeout?: number;
}

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
  value: any;
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
      throw new Error('Magento API configuration is missing. Call configure() first.');
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
          new Error(`HTTP ${response.status}: ${response.statusText} - ${errorBody}`),
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
          new Error('Request timeout'),
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

  async createOrder(orderData: any): Promise<MagentoOrder> {
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
  }

  async getProduct(sku: string): Promise<MagentoProduct | null> {
    return this.makeRequest(`/products/${encodeURIComponent(sku)}`);
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

// Mock data for development and testing
export const mockMagentoData = {
  orders: [
    {
      id: 1,
      increment_id: '000000001',
      status: 'complete',
      created_at: '2024-01-15T10:30:00Z',
      updated_at: '2024-01-16T14:20:00Z',
      grand_total: 125.5,
      items: [
        {
          id: 1,
          product_id: 101,
          name: 'Disposable Gloves - Box of 100',
          sku: 'GLV-DISP-100',
          qty_ordered: 2,
          price: 45.0,
        },
        {
          id: 2,
          product_id: 102,
          name: 'Face Masks - Pack of 50',
          sku: 'MSK-FACE-50',
          qty_ordered: 1,
          price: 35.5,
        },
      ],
    },
  ] as MagentoOrder[],

  invoices: [
    {
      id: 1,
      order_id: 1,
      increment_id: 'INV-000000001',
      created_at: '2024-01-16T14:20:00Z',
      grand_total: 125.5,
    },
  ] as MagentoInvoice[],

  products: [
    {
      id: 101,
      sku: 'GLV-DISP-100',
      name: 'Disposable Gloves - Box of 100',
      price: 45.0,
      status: 1,
      type_id: 'simple',
    },
    {
      id: 102,
      sku: 'MSK-FACE-50',
      name: 'Face Masks - Pack of 50',
      price: 35.5,
      status: 1,
      type_id: 'simple',
    },
  ] as MagentoProduct[],
};
