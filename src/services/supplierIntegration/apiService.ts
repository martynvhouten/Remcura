import { supabase } from '@/boot/supabase';
import { orderLogger } from '@/utils/logger';
import type { SupplierOrder, OrderSendingResult } from '@/stores/orderLists/orderLists-supplier-splitting';

export interface APIConfig {
  api_endpoint: string;
  api_key?: string;
  api_username?: string;
  api_password?: string;
  api_token?: string;
  api_format?: 'json' | 'xml' | 'form-data';
  api_auth_type?: 'bearer' | 'basic' | 'api-key' | 'oauth2';
  oauth2_config?: {
    client_id?: string;
    client_secret?: string;
    token_endpoint?: string;
    scope?: string;
  };
  webhook_url?: string;
  test_mode?: boolean;
  timeout_seconds?: number;
  custom_headers?: Record<string, string>;
}

export interface APIOrderPayload {
  order_reference: string;
  order_date: string;
  requested_delivery_date?: string;
  customer: {
    id?: string;
    name: string;
    address: {
      street: string;
      city: string;
      postal_code: string;
      country: string;
    };
    contact?: {
      email?: string;
      phone?: string;
    };
  };
  items: Array<{
    sku: string;
    name?: string;
    quantity: number;
    unit_price: number;
    line_total: number;
  }>;
  totals: {
    subtotal: number;
    tax?: number;
    shipping?: number;
    total: number;
    currency: string;
  };
  notes?: string;
  metadata?: Record<string, any>;
}

export class APIService {
  private cache = new Map<string, { token: string; expires_at: number }>();

  /**
   * Send order via API
   */
  async sendOrderViaAPI(order: SupplierOrder, orderReference: string): Promise<OrderSendingResult> {
    try {
      orderLogger.info(`Sending order ${orderReference} via API to supplier ${order.supplier_name}`);

      // Get supplier API configuration
      const { data: supplier, error: supplierError } = await supabase
        .from('suppliers')
        .select('integration_config, name, code')
        .eq('id', order.supplier_id)
        .single();

      if (supplierError || !supplier) {
        throw new Error('Supplier not found');
      }

      const apiConfig = supplier.integration_config as APIConfig;
      if (!apiConfig?.api_endpoint) {
        throw new Error('API endpoint not configured');
      }

      // Get practice details
      const { data: practice, error: practiceError } = await supabase
        .from('practices')
        .select('name, address, city, postal_code, country, contact_email, contact_phone')
        .eq('id', order.practice_id)
        .single();

      if (practiceError || !practice) {
        throw new Error('Practice details not found');
      }

      // Build API payload
      const apiPayload = this.buildAPIPayload(order, orderReference, practice);

      // Get authentication token if needed
      const authHeaders = await this.getAuthHeaders(apiConfig);

      // Send order to API
      const response = await this.sendToAPI(apiConfig, apiPayload, authHeaders);

      // Record the order
      await this.recordSupplierOrder(order, orderReference, 'api', response);

      return {
        supplier_id: order.supplier_id,
        supplier_name: order.supplier_name,
        status: response.success ? 'sent' : 'failed',
        method_used: 'api',
        order_reference: orderReference,
        sent_at: new Date().toISOString(),
        error_message: response.success ? undefined : response.error,
        delivery_expected: order.estimated_delivery_date,
      };

    } catch (error: any) {
      orderLogger.error(`API order sending failed for ${orderReference}:`, error);
      
      return {
        supplier_id: order.supplier_id,
        supplier_name: order.supplier_name,
        status: 'failed',
        method_used: 'api',
        order_reference: orderReference,
        sent_at: new Date().toISOString(),
        error_message: error.message,
      };
    }
  }

  /**
   * Build API payload from order data
   */
  private buildAPIPayload(order: SupplierOrder, orderReference: string, practice: any): APIOrderPayload {
    return {
      order_reference: orderReference,
      order_date: new Date().toISOString(),
      requested_delivery_date: order.estimated_delivery_date,
      customer: {
        id: order.practice_id,
        name: practice.name,
        address: {
          street: practice.address || '',
          city: practice.city || '',
          postal_code: practice.postal_code || '',
          country: practice.country || 'NL',
        },
        contact: {
          email: practice.contact_email,
          phone: practice.contact_phone,
        },
      },
      items: order.items.map(item => ({
        sku: item.supplier_sku || item.sku,
        name: item.name,
        quantity: item.quantity,
        unit_price: item.unit_price,
        line_total: item.quantity * item.unit_price,
      })),
      totals: {
        subtotal: order.total_value,
        total: order.total_value + (order.shipping_cost || 0),
        currency: 'EUR',
        shipping: order.shipping_cost,
      },
      notes: `Automated order from Remcura for ${practice.name}`,
      metadata: {
        source: 'remcura',
        practice_id: order.practice_id,
        supplier_id: order.supplier_id,
        created_at: new Date().toISOString(),
      },
    };
  }

  /**
   * Get authentication headers based on config
   */
  private async getAuthHeaders(config: APIConfig): Promise<Record<string, string>> {
    const headers: Record<string, string> = {};

    // Add custom headers
    if (config.custom_headers) {
      Object.assign(headers, config.custom_headers);
    }

    switch (config.api_auth_type) {
      case 'bearer':
        if (config.api_token) {
          headers['Authorization'] = `Bearer ${config.api_token}`;
        } else if (config.oauth2_config) {
          const token = await this.getOAuth2Token(config);
          headers['Authorization'] = `Bearer ${token}`;
        }
        break;

      case 'basic':
        if (config.api_username && config.api_password) {
          const auth = btoa(`${config.api_username}:${config.api_password}`);
          headers['Authorization'] = `Basic ${auth}`;
        }
        break;

      case 'api-key':
        if (config.api_key) {
          headers['X-API-Key'] = config.api_key;
          // Some APIs use different header names
          headers['Authorization'] = `ApiKey ${config.api_key}`;
        }
        break;

      case 'oauth2': {
        const token = await this.getOAuth2Token(config);
        headers['Authorization'] = `Bearer ${token}`;
        break;
      }
    }

    return headers;
  }

  /**
   * Get OAuth2 token (cached)
   */
  private async getOAuth2Token(config: APIConfig): Promise<string> {
    if (!config.oauth2_config?.client_id || !config.oauth2_config?.client_secret) {
      throw new Error('OAuth2 configuration incomplete');
    }

    const cacheKey = `${config.oauth2_config.client_id}_${config.oauth2_config.token_endpoint}`;
    const cached = this.cache.get(cacheKey);

    // Return cached token if still valid
    if (cached && cached.expires_at > Date.now() + 60000) { // 1 minute buffer
      return cached.token;
    }

    try {
      const tokenEndpoint = config.oauth2_config.token_endpoint || `${config.api_endpoint}/oauth/token`;
      
      const tokenResponse = await fetch(tokenEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          grant_type: 'client_credentials',
          client_id: config.oauth2_config.client_id,
          client_secret: config.oauth2_config.client_secret,
          scope: config.oauth2_config.scope || '',
        }),
      });

      if (!tokenResponse.ok) {
        throw new Error(`OAuth2 token request failed: ${tokenResponse.status}`);
      }

      const tokenData = await tokenResponse.json();
      const expiresAt = Date.now() + (tokenData.expires_in * 1000) - 60000; // 1 minute buffer

      // Cache the token
      this.cache.set(cacheKey, {
        token: tokenData.access_token,
        expires_at: expiresAt,
      });

      return tokenData.access_token;

    } catch (error: any) {
      orderLogger.error('OAuth2 token acquisition failed:', error);
      throw new Error(`OAuth2 authentication failed: ${error.message}`);
    }
  }

  /**
   * Send data to API endpoint
   */
  private async sendToAPI(config: APIConfig, payload: APIOrderPayload, authHeaders: Record<string, string>): Promise<{ success: boolean; error?: string; response?: any }> {
    try {
      const headers: Record<string, string> = {
        ...authHeaders,
      };

      let body: string | FormData;
      
      switch (config.api_format || 'json') {
        case 'json':
          headers['Content-Type'] = 'application/json';
          body = JSON.stringify(payload);
          break;

        case 'xml':
          headers['Content-Type'] = 'application/xml';
          body = this.convertToXML(payload);
          break;

        case 'form-data': {
          const formData = new FormData();
          this.flattenObjectToFormData(payload, formData);
          body = formData;
          // Don't set Content-Type for FormData, browser will set it with boundary
          break;
        }

        default:
          throw new Error(`Unsupported API format: ${config.api_format}`);
      }

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), (config.timeout_seconds || 30) * 1000);

      const response = await fetch(config.api_endpoint, {
        method: 'POST',
        headers,
        body,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      const responseText = await response.text();
      let responseData: any;

      try {
        responseData = JSON.parse(responseText);
      } catch {
        responseData = responseText;
      }

      if (!response.ok) {
        throw new Error(`API returned ${response.status}: ${responseText}`);
      }

      orderLogger.info(`API order sent successfully, response: ${response.status}`);
      
      return {
        success: true,
        response: {
          status: response.status,
          headers: Object.fromEntries(response.headers.entries()),
          body: responseData,
        },
      };

    } catch (error: any) {
      if (error.name === 'AbortError') {
        orderLogger.error('API request timed out');
        return {
          success: false,
          error: 'Request timed out',
        };
      }

      orderLogger.error(`API sending failed: ${error.message}`);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Convert JSON payload to XML
   */
  private convertToXML(payload: APIOrderPayload): string {
    return `<?xml version="1.0" encoding="UTF-8"?>
<Order>
  <OrderReference>${payload.order_reference}</OrderReference>
  <OrderDate>${payload.order_date}</OrderDate>
  ${payload.requested_delivery_date ? `<RequestedDeliveryDate>${payload.requested_delivery_date}</RequestedDeliveryDate>` : ''}
  <Customer>
    <ID>${payload.customer.id}</ID>
    <Name><![CDATA[${payload.customer.name}]]></Name>
    <Address>
      <Street><![CDATA[${payload.customer.address.street}]]></Street>
      <City><![CDATA[${payload.customer.address.city}]]></City>
      <PostalCode>${payload.customer.address.postal_code}</PostalCode>
      <Country>${payload.customer.address.country}</Country>
    </Address>
    ${payload.customer.contact?.email ? `<Email>${payload.customer.contact.email}</Email>` : ''}
    ${payload.customer.contact?.phone ? `<Phone>${payload.customer.contact.phone}</Phone>` : ''}
  </Customer>
  <Items>
    ${payload.items.map(item => `
    <Item>
      <SKU>${item.sku}</SKU>
      <Name><![CDATA[${item.name || ''}]]></Name>
      <Quantity>${item.quantity}</Quantity>
      <UnitPrice>${item.unit_price}</UnitPrice>
      <LineTotal>${item.line_total}</LineTotal>
    </Item>`).join('')}
  </Items>
  <Totals>
    <Subtotal>${payload.totals.subtotal}</Subtotal>
    <Total>${payload.totals.total}</Total>
    <Currency>${payload.totals.currency}</Currency>
    ${payload.totals.shipping ? `<Shipping>${payload.totals.shipping}</Shipping>` : ''}
  </Totals>
  ${payload.notes ? `<Notes><![CDATA[${payload.notes}]]></Notes>` : ''}
</Order>`;
  }

  /**
   * Flatten object to FormData
   */
  private flattenObjectToFormData(obj: any, formData: FormData, prefix = ''): void {
    for (const key in obj) {
              if (Object.prototype.hasOwnProperty.call(obj, key)) {
        const formKey = prefix ? `${prefix}[${key}]` : key;
        const value = obj[key];

        if (value !== null && typeof value === 'object' && !(value instanceof Date)) {
          if (Array.isArray(value)) {
            value.forEach((item, index) => {
              this.flattenObjectToFormData(item, formData, `${formKey}[${index}]`);
            });
          } else {
            this.flattenObjectToFormData(value, formData, formKey);
          }
        } else {
          formData.append(formKey, value?.toString() || '');
        }
      }
    }
  }

  /**
   * Record order in supplier_orders table
   */
  private async recordSupplierOrder(order: SupplierOrder, orderReference: string, method: string, response: any): Promise<void> {
    const { error } = await supabase
      .from('supplier_orders')
      .insert({
        supplier_id: order.supplier_id,
        order_list_id: null,
        practice_id: order.practice_id,
        status: response.success ? 'sent' : 'failed',
        method_used: method,
        sent_at: new Date().toISOString(),
        delivery_expected: order.estimated_delivery_date,
        total_items: order.total_items,
        total_value: order.total_value,
        response_data: response,
        order_reference: orderReference,
      });

    if (error) {
      orderLogger.error('Failed to record supplier order:', error);
      throw error;
    }
  }

  /**
   * Test API connection
   */
  async testAPIConnection(config: APIConfig): Promise<{ success: boolean; error?: string; response?: any }> {
    try {
      const headers = await this.getAuthHeaders(config);
      
      // Try a simple GET request to test the connection
      const testEndpoint = config.api_endpoint.replace(/\/orders?$/, '/health') || `${config.api_endpoint}/test`;
      
      const response = await fetch(testEndpoint, {
        method: 'GET',
        headers,
      });

      const responseText = await response.text();

      return {
        success: response.ok,
        response: {
          status: response.status,
          body: responseText,
        },
      };

    } catch (error: any) {
      return {
        success: false,
        error: error.message,
      };
    }
  }
}

export const apiService = new APIService();