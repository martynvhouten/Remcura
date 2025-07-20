// Placeholder Magento API service
// This will be implemented when Magento integration is ready

export interface MagentoOrder {
  id: number;
  increment_id: string;
  status: string;
  created_at: string;
  updated_at: string;
  grand_total: number;
  items: MagentoOrderItem[];
}

export interface MagentoOrderItem {
  id: number;
  product_id: number;
  name: string;
  sku: string;
  qty_ordered: number;
  price: number;
}

export interface MagentoInvoice {
  id: number;
  order_id: number;
  increment_id: string;
  created_at: string;
  grand_total: number;
}

export interface MagentoProduct {
  id: number;
  sku: string;
  name: string;
  price: number;
  status: number;
  type_id: string;
}

class MagentoApiService {
  private baseUrl: string;
  private token: string;

  constructor() {
    // These will be set from environment variables
    this.baseUrl = process.env.MAGENTO_API_URL || '';
    this.token = process.env.MAGENTO_API_TOKEN || '';
  }

  private async makeRequest(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<any> {
    if (!this.baseUrl || !this.token) {
      throw new Error('Magento API configuration is missing');
    }

    const url = `${this.baseUrl}/rest/V1${endpoint}`;

    const response = await fetch(url, {
      ...options,
      headers: {
        Authorization: `Bearer ${this.token}`,
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      throw new Error(
        `Magento API error: ${response.status} ${response.statusText}`
      );
    }

    return response.json();
  }

  // Order management
  async getOrders(_customerId?: number): Promise<MagentoOrder[]> {
    // Placeholder implementation - API integration pending
    // const endpoint = customerId ? `/orders?searchCriteria[filter_groups][0][filters][0][field]=customer_id&searchCriteria[filter_groups][0][filters][0][value]=${customerId}` : '/orders'
    // return this.makeRequest(endpoint)

    return [];
  }

  async getOrder(_orderId: string): Promise<MagentoOrder | null> {
    // Placeholder implementation - API integration pending
    // return this.makeRequest(`/orders/${orderId}`)

    return null;
  }

  async createOrder(_orderData: any): Promise<MagentoOrder> {
    // Placeholder implementation - API integration pending
    // return this.makeRequest('/orders', {
    //   method: 'POST',
    //   body: JSON.stringify({ entity: orderData })
    // })

    throw new Error('Order creation not yet implemented');
  }

  // Invoice management
  async getInvoices(_orderId?: number): Promise<MagentoInvoice[]> {
    // Placeholder implementation - API integration pending
    // const endpoint = orderId ? `/invoices?searchCriteria[filter_groups][0][filters][0][field]=order_id&searchCriteria[filter_groups][0][filters][0][value]=${orderId}` : '/invoices'
    // return this.makeRequest(endpoint)

    return [];
  }

  async getInvoice(_invoiceId: string): Promise<MagentoInvoice | null> {
    // Placeholder implementation - API integration pending
    // return this.makeRequest(`/invoices/${invoiceId}`)

    return null;
  }

  // Product management
  async getProducts(): Promise<MagentoProduct[]> {
    // Placeholder implementation - API integration pending
    // return this.makeRequest('/products?searchCriteria[currentPage]=1&searchCriteria[pageSize]=100')

    return [];
  }

  async getProduct(_sku: string): Promise<MagentoProduct | null> {
    // Placeholder implementation - API integration pending
    // return this.makeRequest(`/products/${encodeURIComponent(sku)}`)

    return null;
  }

  // Utility methods
  isConfigured(): boolean {
    return !!(this.baseUrl && this.token);
  }

  getConnectionStatus(): string {
    if (!this.isConfigured()) {
      return 'Not configured';
    }

    // Connection test implementation pending
    return 'Ready (not tested)';
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
