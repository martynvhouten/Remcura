import { supabase } from '@/services/supabase';
import type {
  Order,
  OrderInsert,
  OrderItem,
  OrderItemInsert,
  ShoppingCart,
  Product,
  OrderWithItems,
  ExportFormat,
  MagentoOrder,
} from '@/types/supabase';
import { useAuthStore } from '@/stores/auth';

export class OrderProcessingService {
  /**
   * Create a new order from shopping cart
   */
  async createOrderFromCart(cartId: string, notes?: string): Promise<Order> {
    const authStore = useAuthStore();
    const user = authStore.user;
    const practiceId = authStore.clinicId;

    if (!user || !practiceId) {
      throw new Error($t('orderproce.usernotauthenticatedor'));
    }

    // Get cart details
    const { data: cart, error: cartError } = await supabase
      .from('shopping_carts')
      .select(
        `
        *,
        shopping_cart_items (
          *,
          products (*)
        )
      `
      )
      .eq('id', cartId)
      .single();

    if (cartError || !cart) {
      throw new Error($t('orderproce.shoppingcartnotfound'));
    }

    // Generate order number
    const { data: orderNumber, error: numberError } = await supabase.rpc(
      'generate_order_number',
      { practice_uuid: practiceId }
    );

    if (numberError || !orderNumber) {
      throw new Error($t('orderproce.failedtogenerateorder'));
    }

    // Create order
    const orderData: OrderInsert = {
      practice_id: practiceId,
      cart_id: cartId,
      order_number: orderNumber,
      status: 'draft',
      notes: notes,
      created_by: user.id,
    };

    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert(orderData)
      .select()
      .single();

    if (orderError || !order) {
      throw new Error($t('orderproce.failedtocreateorder'));
    }

    // Create order items from cart items
    if (cart.shopping_cart_items && cart.shopping_cart_items.length > 0) {
      const orderItems: OrderItemInsert[] = cart.shopping_cart_items.map(
        item => ({
          order_id: order.id,
          product_id: item.product_id,
          quantity: item.quantity,
          unit_price: item.products?.price || 0,
          total_price: (item.products?.price || 0) * item.quantity,
          notes: item.notes,
        })
      );

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);

      if (itemsError) {
        throw new Error($t('orderproce.failedtocreateorder'));
      }
    }

    // Update cart status
    await supabase
      .from('shopping_carts')
      .update({ status: 'ordered' })
      .eq('id', cartId);

    return order;
  }

  /**
   * Get orders for current practice
   */
  async getOrders(filters?: {
    status?: string;
    supplier_id?: string;
    date_from?: string;
    date_to?: string;
  }): Promise<OrderWithItems[]> {
    const authStore = useAuthStore();
    const practiceId = authStore.clinicId;

    if (!practiceId) {
      throw new Error($t('orderproce.nopracticeselected'));
    }

    let query = supabase
      .from('orders')
      .select(
        `
        *,
        order_items (
          *,
          products (*)
        ),
        suppliers (*)
      `
      )
      .eq('practice_id', practiceId)
      .order('order_date', { ascending: false });

    if (filters?.status) {
      query = query.eq('status', filters.status);
    }
    if (filters?.supplier_id) {
      query = query.eq('supplier_id', filters.supplier_id);
    }
    if (filters?.date_from) {
      query = query.gte('order_date', filters.date_from);
    }
    if (filters?.date_to) {
      query = query.lte('order_date', filters.date_to);
    }

    const { data, error } = await query;

    if (error) {
      throw new Error($t('orderproce.failedtogetorders'));
    }

    return data || [];
  }

  /**
   * Update order status
   */
  async updateOrderStatus(
    orderId: string,
    status: string,
    notes?: string
  ): Promise<void> {
    const updateData: Partial<Order> = {
      status,
      updated_at: new Date().toISOString(),
    };
    if (notes) {
      updateData.notes = notes;
    }

    const { error } = await supabase
      .from('orders')
      .update(updateData)
      .eq('id', orderId);

    if (error) {
      throw new Error($t('orderproce.failedtoupdateorder'));
    }
  }

  /**
   * Export order to CSV
   */
  async exportOrderToCSV(orderId: string): Promise<Blob> {
    const orders = await this.getOrders();
    const order = orders.find(o => o.id === orderId);

    if (!order) {
      throw new Error($t('orderproce.ordernotfound'));
    }

    const csvHeaders = [
      'Order Number',
      'Product SKU',
      'Product Name',
      'Quantity',
      'Unit Price',
      'Total Price',
      'Notes',
    ];

    const csvRows =
      order.order_items?.map(item => [
        order.order_number,
        item.products?.sku || '',
        item.products?.name || '',
        item.quantity.toString(),
        (item.unit_price || 0).toFixed(2),
        (item.total_price || 0).toFixed(2),
        item.notes || '',
      ]) || [];

    const csvContent = [
      csvHeaders.join(','),
      ...csvRows.map(row => row.map(field => `"${field}"`).join(',')),
    ].join('\n');

    return new Blob([csvContent], { type: 'text/csv' });
  }

  /**
   * Export multiple orders to CSV
   */
  async exportOrdersToCSV(orderIds: string[]): Promise<Blob> {
    const orders = await this.getOrders();
    const filteredOrders = orders.filter(o => orderIds.includes(o.id));

    const csvHeaders = [
      'Order Number',
      'Order Date',
      'Status',
      'Supplier',
      'Product SKU',
      'Product Name',
      'Quantity',
      'Unit Price',
      'Total Price',
      'Order Notes',
      'Item Notes',
    ];

    const csvRows: string[][] = [];

    filteredOrders.forEach(order => {
      if (order.order_items && order.order_items.length > 0) {
        order.order_items.forEach(item => {
          csvRows.push([
            order.order_number,
            new Date(order.order_date).toLocaleDateString(),
            order.status,
            order.suppliers?.name || '',
            item.products?.sku || '',
            item.products?.name || '',
            item.quantity.toString(),
            (item.unit_price || 0).toFixed(2),
            (item.total_price || 0).toFixed(2),
            order.notes || '',
            item.notes || '',
          ]);
        });
      } else {
        csvRows.push([
          order.order_number,
          new Date(order.order_date).toLocaleDateString(),
          order.status,
          order.suppliers?.name || '',
          '',
          '',
          '0',
          '0.00',
          '0.00',
          order.notes || '',
          '',
        ]);
      }
    });

    const csvContent = [
      csvHeaders.join(','),
      ...csvRows.map(row => row.map(field => `"${field}"`).join(',')),
    ].join('\n');

    return new Blob([csvContent], { type: 'text/csv' });
  }

  /**
   * Generate PDF for order
   */
  async generateOrderPDF(orderId: string): Promise<Blob> {
    // For now, return HTML content that can be converted to PDF
    // In a full implementation, you'd use a library like jsPDF or html2canvas
    const orders = await this.getOrders();
    const order = orders.find(o => o.id === orderId);

    if (!order) {
      throw new Error($t('orderproce.ordernotfound'));
    }

    const htmlContent = this.generateOrderHTML(order);
    return new Blob([htmlContent], { type: 'text/html' });
  }

  /**
   * Generate HTML template for order
   */
  private generateOrderHTML(order: OrderWithItems): string {
    const itemsHTML =
      order.order_items
        ?.map(
          item => `
      <tr>
        <td>${item.products?.sku || ''}</td>
        <td>${item.products?.name || ''}</td>
        <td>${item.quantity}</td>
        <td>€${(item.unit_price || 0).toFixed(2)}</td>
        <td>€${(item.total_price || 0).toFixed(2)}</td>
      </tr>
    `
        )
        .join('') || '';

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Order ${order.order_number}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          .header { border-bottom: 2px solid #333; padding-bottom: 20px; margin-bottom: 20px; }
          .order-info { margin-bottom: 20px; }
          table { width: 100%; border-collapse: collapse; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          th { background-color: #f2f2f2; }
          .total { font-weight: bold; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Remcura - Bestelling</h1>
          <p><strong>Order Number:</strong> ${order.order_number}</p>
          <p><strong>Order Date:</strong> ${new Date(
            order.order_date
          ).toLocaleDateString()}</p>
          <p><strong>Status:</strong> ${order.status}</p>
          ${
            order.suppliers
              ? `<p><strong>Supplier:</strong> ${order.suppliers.name}</p>`
              : ''
          }
        </div>
        
        <div class="order-info">
          ${order.notes ? `<p><strong>Notes:</strong> ${order.notes}</p>` : ''}
        </div>

        <table>
          <thead>
            <tr>
              <th>SKU</th>
              <th>Product</th>
              <th>Quantity</th>
              <th>Unit Price</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHTML}
          </tbody>
          <tfoot>
            <tr class="total">
              <td colspan="4"><strong>Total Items:</strong></td>
              <td><strong>${order.total_items}</strong></td>
            </tr>
            <tr class="total">
              <td colspan="4"><strong>Total Amount:</strong></td>
              <td><strong>€${(order.total_amount || 0).toFixed(2)}</strong></td>
            </tr>
          </tfoot>
        </table>
      </body>
      </html>
    `;
  }

  /**
   * Send order via email
   */
  async sendOrderByEmail(
    orderId: string,
    recipientEmail: string,
    subject?: string
  ): Promise<void> {
    // This would integrate with an email service like SendGrid, Mailgun, etc.
    // For now, we'll simulate the functionality

    const orders = await this.getOrders();
    const order = orders.find(o => o.id === orderId);

    if (!order) {
      throw new Error($t('orderproce.ordernotfound'));
    }

    const emailSubject = subject || `Order ${order.order_number} - Remcura`;
    const emailBody = this.generateOrderHTML(order);

    // In a real implementation, you would call your email service here
    // Debug email logging removed for production

    // Log the activity
    await this.logActivity('order_emailed', {
      order_id: orderId,
      recipient: recipientEmail,
      subject: emailSubject,
    });
  }

  /**
   * Submit order to Magento API
   */
  async submitOrderToMagento(orderId: string): Promise<MagentoOrder> {
    const orders = await this.getOrders();
    const order = orders.find(o => o.id === orderId);

    if (!order) {
      throw new Error($t('orderproce.ordernotfound'));
    }

    // Convert to Magento format
    const magentoOrder: MagentoOrder = {
      status: 'pending',
      items:
        order.order_items?.map(item => ({
          sku: item.products?.sku || '',
          qty_ordered: item.quantity,
          price: item.unit_price || 0,
          product_type: 'simple',
        })) || [],
    };

    // In a real implementation, you would call the Magento API here
    // For now, we'll simulate it
    const simulatedResponse: MagentoOrder = {
      ...magentoOrder,
      id: Math.floor(Math.random() * 10000),
      increment_id: `MAG-${Date.now()}`,
    };

    // Update order with Magento ID
    await supabase
      .from('orders')
      .update({
        magento_order_id: simulatedResponse.id,
        status: 'submitted',
      })
      .eq('id', orderId);

    // Log the activity
    await this.logActivity('order_submitted_magento', {
      order_id: orderId,
      magento_order_id: simulatedResponse.id,
    });

    return simulatedResponse;
  }

  /**
   * Download file helper
   */
  downloadFile(blob: Blob, filename: string): void {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  /**
   * Log activity
   */
  private async logActivity(
    activityType: string,
    data: Record<string, any>
  ): Promise<void> {
    const authStore = useAuthStore();
    const practiceId = authStore.clinicId;
    const userId = authStore.user?.id;

    if (practiceId) {
      await supabase.from('usage_analytics').insert({
        practice_id: practiceId,
        user_id: userId || null,
        event_type: activityType,
        event_data: data,
      });
    }
  }
}

export const orderProcessingService = new OrderProcessingService();
